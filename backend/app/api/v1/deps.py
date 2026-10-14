from fastapi import Depends, HTTPException, Request, status
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from sqlalchemy.orm import Session
from app.core.database import get_db
from app.core.security import decode_token, hash_identifier, verify_csrf
from app.models import User, RevokedAccessToken

bearer_scheme = HTTPBearer(auto_error=False)
UNSAFE_METHODS = {"POST", "PUT", "PATCH", "DELETE"}


def get_current_user(
    request: Request,
    credentials: HTTPAuthorizationCredentials | None = Depends(bearer_scheme),
    db: Session = Depends(get_db),
) -> User:
    bearer_token = credentials.credentials if credentials else None
    token = bearer_token or request.cookies.get("epersona_access")
    if not token:
        raise HTTPException(status.HTTP_401_UNAUTHORIZED, "Authentication required")
    claims = decode_token(token, "access")
    user = db.get(User, int(claims["sub"]))
    if not user or not user.is_active or user.email_verified_at is None:
        raise HTTPException(status.HTTP_401_UNAUTHORIZED, "Account is not verified or inactive")
    if claims["ver"] != user.token_version:
        raise HTTPException(status.HTTP_401_UNAUTHORIZED, "Token revoked")
    if db.get(RevokedAccessToken, hash_identifier(claims["jti"])):
        raise HTTPException(status.HTTP_401_UNAUTHORIZED, "Token revoked")
    if not bearer_token and request.method in UNSAFE_METHODS:
        refresh_cookie = request.cookies.get("epersona_refresh", "")
        refresh_claims = decode_token(refresh_cookie, "refresh")
        if refresh_claims["sub"] != claims["sub"]:
            raise HTTPException(403, "CSRF verification failed")
        verify_csrf(request, refresh_claims["jti"])
    request.state.user = user
    request.state.access_jti = claims["jti"]
    return user
