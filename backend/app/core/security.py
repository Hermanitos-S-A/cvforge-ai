"""JWT authentication, password hashing and CSRF helpers."""

from datetime import datetime, timedelta, timezone
from hashlib import pbkdf2_hmac, sha256
from hmac import compare_digest, new as hmac_new
import base64
import secrets
import jwt
from jwt import InvalidTokenError
from fastapi import HTTPException, status, Request
from app.core.config import settings

try:
    import bcrypt
except ImportError:  # Portable test tooling; production image installs bcrypt.
    bcrypt = None

PBKDF2_ROUNDS = 600_000
UNAUTHORIZED = HTTPException(
    status_code=status.HTTP_401_UNAUTHORIZED,
    detail="Invalid or expired credentials",
    headers={"WWW-Authenticate": "Bearer"},
)


def hash_password(password: str) -> str:
    raw = password.encode("utf-8")
    if not 8 <= len(raw) <= 72:
        raise ValueError("Password length must be between 8 and 72 UTF-8 bytes")
    if bcrypt is not None:
        return bcrypt.hashpw(raw, bcrypt.gensalt()).decode("utf-8")
    salt = secrets.token_bytes(16)
    key = pbkdf2_hmac("sha256", raw, salt, PBKDF2_ROUNDS)
    return "pbkdf2_sha256$%d$%s$%s" % (
        PBKDF2_ROUNDS, base64.urlsafe_b64encode(salt).decode(),
        base64.urlsafe_b64encode(key).decode(),
    )


def verify_password(plain: str, hashed: str) -> bool:
    raw = plain.encode("utf-8")
    if hashed.startswith("$2"):
        return bool(bcrypt is not None and bcrypt.checkpw(raw[:72], hashed.encode("utf-8")))
    if hashed.startswith("pbkdf2_sha256$"):
        try:
            _, rounds, encoded_salt, encoded_key = hashed.split("$")
            if not 100_000 <= int(rounds) <= 2_000_000:
                return False
            actual = pbkdf2_hmac("sha256", raw, base64.urlsafe_b64decode(encoded_salt), int(rounds))
            return compare_digest(actual, base64.urlsafe_b64decode(encoded_key))
        except (ValueError, TypeError):
            return False
    return False


def hash_identifier(value: str) -> str:
    return sha256(value.encode("utf-8")).hexdigest()


def utcnow():
    return datetime.now(timezone.utc).replace(tzinfo=None)


def _encode_token(subject: str | int, token_type: str, version: int, expiry: timedelta) -> str:
    now = datetime.now(timezone.utc)
    claims = {
        "sub": str(subject), "iss": settings.JWT_ISSUER, "aud": settings.JWT_AUDIENCE,
        "iat": now, "nbf": now, "exp": now + expiry,
        "jti": secrets.token_hex(32), "type": token_type, "ver": version,
    }
    return jwt.encode(claims, settings.SECRET_KEY.get_secret_value(), algorithm=settings.ALGORITHM)


def create_access_token(subject: str | int, version: int = 0) -> str:
    return _encode_token(subject, "access", version, timedelta(minutes=settings.ACCESS_TOKEN_EXPIRE_MINUTES))


def create_refresh_token(subject: str | int, version: int = 0) -> str:
    return _encode_token(subject, "refresh", version, timedelta(days=settings.REFRESH_TOKEN_EXPIRE_DAYS))


def decode_token(token: str, expected_type: str | None = None) -> dict:
    try:
        claims = jwt.decode(
            token, settings.SECRET_KEY.get_secret_value(), algorithms=[settings.ALGORITHM],
            audience=settings.JWT_AUDIENCE, issuer=settings.JWT_ISSUER,
            options={"require": ["sub", "exp", "iat", "nbf", "iss", "aud", "jti", "type", "ver"]},
        )
        if claims.get("type") not in ("access", "refresh") or not isinstance(claims.get("jti"), str):
            raise UNAUTHORIZED
        if expected_type and claims["type"] != expected_type:
            raise UNAUTHORIZED
        if int(claims.get("sub", 0)) < 1 or type(claims.get("ver")) is not int:
            raise UNAUTHORIZED
        return claims
    except (InvalidTokenError, ValueError, TypeError, OverflowError):
        raise UNAUTHORIZED from None


def csrf_token_for_refresh_jti(jti: str) -> str:
    return hmac_new(settings.SECRET_KEY.get_secret_value().encode(),
                    ("csrf:" + jti).encode(), "sha256").hexdigest()


def verify_csrf(request: Request, refresh_jti: str):
    expected = csrf_token_for_refresh_jti(refresh_jti)
    supplied = request.headers.get("x-csrf-token", "")
    cookie = request.cookies.get("epersona_csrf", "")
    origin = request.headers.get("origin")
    if (not supplied or not cookie or not compare_digest(expected, supplied)
            or not compare_digest(expected, cookie)
            or (origin and origin not in settings.ALLOWED_ORIGINS)):
        raise HTTPException(403, "CSRF verification failed")


def set_auth_cookies(response, access: str, refresh: str):
    secure = settings.is_production
    response.set_cookie("epersona_access", access, httponly=True, secure=secure,
                        samesite="lax", max_age=settings.ACCESS_TOKEN_EXPIRE_MINUTES * 60, path="/")
    response.set_cookie("epersona_refresh", refresh, httponly=True, secure=secure,
                        samesite="lax", max_age=settings.REFRESH_TOKEN_EXPIRE_DAYS * 86400, path="/")
    claims = decode_token(refresh, "refresh")
    response.set_cookie("epersona_csrf", csrf_token_for_refresh_jti(claims["jti"]),
                        httponly=False, secure=secure, samesite="lax",
                        max_age=settings.REFRESH_TOKEN_EXPIRE_DAYS * 86400, path="/")


def clear_auth_cookies(response):
    for cookie in ("epersona_access", "epersona_refresh", "epersona_csrf"):
        response.delete_cookie(cookie, path="/", secure=settings.is_production, samesite="lax")
