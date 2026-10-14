"""Email-verified registration, rotated sessions and explicitly typed JWTs."""

from datetime import timedelta
import secrets
from fastapi import APIRouter, Depends, HTTPException, Request, Response
from sqlalchemy.orm import Session
from app.core.database import get_db
from app.core.security import (
    hash_password, verify_password, create_access_token, create_refresh_token,
    decode_token, hash_identifier, utcnow, set_auth_cookies, clear_auth_cookies,
    verify_csrf,
)
from app.core.config import settings
from app.models import (User, RefreshSession, EmailVerificationToken, RevokedAccessToken)
from app.schemas import RegisterRequest, LoginRequest, TokenResponse, UserResponse
from app.api.v1.deps import get_current_user
from app.services.email_service import send_verification_email
from app.core.limits import limiter
from pydantic import BaseModel, Field, EmailStr

router = APIRouter()


class RefreshRequest(BaseModel):
    refresh_token: str | None = Field(default=None, min_length=50, max_length=4096)


class VerifyEmailRequest(BaseModel):
    token: str = Field(min_length=32, max_length=256)


class ResendVerificationRequest(BaseModel):
    email: EmailStr


def _issue_tokens(db: Session, user: User) -> TokenResponse:
    access = create_access_token(user.id, user.token_version)
    refresh = create_refresh_token(user.id, user.token_version)
    claims = decode_token(refresh, "refresh")
    db.add(RefreshSession(
        user_id=user.id, jti_hash=hash_identifier(claims["jti"]),
        expires_at=utcnow() + timedelta(days=settings.REFRESH_TOKEN_EXPIRE_DAYS),
    ))
    return TokenResponse(access_token=access, refresh_token=refresh)


def _add_verification(db: Session, user: User) -> str:
    token = secrets.token_urlsafe(32)
    db.add(EmailVerificationToken(
        user_id=user.id, token_hash=hash_identifier(token),
        expires_at=utcnow() + timedelta(minutes=30),
    ))
    return token


@router.post("/register", status_code=202)
@limiter.limit("5/minute")
def register(request: Request, payload: RegisterRequest, db: Session = Depends(get_db)):
    if not settings.has_smtp:
        raise HTTPException(503, "Email verification is temporarily unavailable")
    email = str(payload.email).strip().lower()
    if db.query(User).filter(User.email == email).first():
        raise HTTPException(409, "Email already registered")
    user = User(email=email, hashed_password=hash_password(payload.password),
                full_name=payload.full_name.strip(), role="user", plan="free")
    db.add(user)
    db.flush()
    raw_token = _add_verification(db, user)
    db.commit()
    try:
        send_verification_email(user.email, raw_token)
    except RuntimeError:
        raise HTTPException(503, "Email delivery unavailable; try resending verification") from None
    return {"message": "Revisa tu correo para verificar tu cuenta antes de iniciar sesión"}


@router.post("/verify-email")
def verify_email(payload: VerifyEmailRequest, db: Session = Depends(get_db)):
    record = db.query(EmailVerificationToken).filter(
        EmailVerificationToken.token_hash == hash_identifier(payload.token),
        EmailVerificationToken.used_at.is_(None),
        EmailVerificationToken.expires_at > utcnow(),
    ).first()
    if not record:
        raise HTTPException(400, "Verification link expired or already used")
    user = db.get(User, record.user_id)
    if not user or user.email_verified_at is not None:
        raise HTTPException(400, "Verification link expired or already used")
    record.used_at = utcnow()
    user.email_verified_at = utcnow()
    db.commit()
    return {"message": "Correo verificado. Ya puedes iniciar sesión"}


@router.post("/resend-verification", status_code=202)
@limiter.limit("3/minute")
def resend_verification(request: Request, payload: ResendVerificationRequest, db: Session = Depends(get_db)):
    user = db.query(User).filter(User.email == str(payload.email).strip().lower()).first()
    if user and not user.email_verified_at and settings.has_smtp:
        # Invalidate older links when a user asks for a new verification email.
        db.query(EmailVerificationToken).filter(
            EmailVerificationToken.user_id == user.id,
            EmailVerificationToken.used_at.is_(None),
        ).update({"used_at": utcnow()}, synchronize_session=False)
        token = _add_verification(db, user)
        db.commit()
        try:
            send_verification_email(user.email, token)
        except RuntimeError:
            pass
    return {"message": "Si la cuenta existe y no está verificada, enviaremos un enlace"}


@router.post("/login", response_model=TokenResponse)
@limiter.limit("8/minute")
def login(request: Request, payload: LoginRequest, response: Response, db: Session = Depends(get_db)):
    user = db.query(User).filter(User.email == str(payload.email).lower()).first()
    if not user or not verify_password(payload.password, user.hashed_password):
        raise HTTPException(401, "Invalid credentials")
    if not user.is_active or user.email_verified_at is None:
        raise HTTPException(403, "Verify your email before signing in")
    tokens = _issue_tokens(db, user)
    db.commit()
    set_auth_cookies(response, tokens.access_token, tokens.refresh_token)
    return tokens


@router.post("/refresh", response_model=TokenResponse)
@limiter.limit("10/minute")
def refresh_tokens(request: Request, response: Response,
                   payload: RefreshRequest | None = None,
                   db: Session = Depends(get_db)):
    raw_token = payload.refresh_token if payload and payload.refresh_token else request.cookies.get("epersona_refresh")
    if not raw_token:
        raise HTTPException(401, "Refresh token required")
    claims = decode_token(raw_token, "refresh")
    using_cookie = not (payload and payload.refresh_token)
    if using_cookie:
        verify_csrf(request, claims["jti"])
    user = db.get(User, int(claims["sub"]))
    if not user or not user.is_active or user.email_verified_at is None or user.token_version != claims["ver"]:
        raise HTTPException(401, "Invalid refresh token")
    hashed = hash_identifier(claims["jti"])
    now = utcnow()
    # Compare-and-swap makes concurrent reuse of a refresh token fail.
    updated = db.query(RefreshSession).filter(
        RefreshSession.user_id == user.id, RefreshSession.jti_hash == hashed,
        RefreshSession.revoked_at.is_(None), RefreshSession.expires_at > now,
    ).update({"revoked_at": now}, synchronize_session=False)
    if updated != 1:
        db.rollback()
        raise HTTPException(401, "Refresh token already used or revoked")
    tokens = _issue_tokens(db, user)
    db.query(RefreshSession).filter(RefreshSession.jti_hash == hashed).update(
        {"rotated_to_hash": hash_identifier(decode_token(tokens.refresh_token, "refresh")["jti"])},
        synchronize_session=False,
    )
    db.commit()
    set_auth_cookies(response, tokens.access_token, tokens.refresh_token)
    return tokens


@router.post("/logout")
def logout(request: Request, response: Response,
           user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    user.token_version += 1  # Invalidates all access and refresh tokens across devices.
    db.query(RefreshSession).filter(RefreshSession.user_id == user.id,
        RefreshSession.revoked_at.is_(None)).update({"revoked_at": utcnow()}, synchronize_session=False)
    db.add(RevokedAccessToken(jti_hash=hash_identifier(request.state.access_jti),
                              expires_at=utcnow() + timedelta(minutes=settings.ACCESS_TOKEN_EXPIRE_MINUTES)))
    db.commit()
    clear_auth_cookies(response)
    return {"message": "Sesiones cerradas"}


@router.get("/me", response_model=UserResponse)
def get_me(current_user: User = Depends(get_current_user)):
    return current_user
