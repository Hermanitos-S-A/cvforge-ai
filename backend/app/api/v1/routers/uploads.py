"""Avatar management; legacy JSON/base64 route retained for /api/v1 compatibility."""

from fastapi import APIRouter, Depends, HTTPException, Request
from fastapi.responses import FileResponse
from pydantic import BaseModel, Field, ValidationError
from pathlib import Path
import re
from app.api.v1.deps import get_current_user
from app.models import User
from app.services.upload_service import UploadService, MAX_B64_CHARS, UPLOAD_DIR
from sqlalchemy.orm import Session
from app.core.database import get_db
from app.core.limits import limiter

router = APIRouter()
upload_svc = UploadService()
MAX_BODY = 3 * 1024 * 1024
FILENAME = re.compile(r"user_[0-9]+_[a-f0-9]{32}\.webp\Z")


class AvatarUploadRequest(BaseModel):
    base64_data: str = Field(min_length=20, max_length=MAX_B64_CHARS + 128)
    content_type: str = Field(max_length=64)


@router.post("/avatar")
@limiter.limit("4/minute")
async def upload_avatar(request: Request, current_user: User = Depends(get_current_user),
                        db: Session = Depends(get_db)):
    if current_user.plan != "pro":
        raise HTTPException(403, "La foto de perfil requiere un plan Pro")
    length = request.headers.get("content-length")
    if length:
        try:
            if int(length) > MAX_BODY:
                raise HTTPException(413, "Upload too large")
        except ValueError:
            raise HTTPException(400, "Invalid content length") from None
    body = bytearray()
    async for chunk in request.stream():
        body.extend(chunk)
        if len(body) > MAX_BODY:
            raise HTTPException(413, "Upload too large")
    try:
        payload = AvatarUploadRequest.model_validate_json(bytes(body))
        url = upload_svc.save_avatar(payload.base64_data, payload.content_type, current_user.id)
    except (ValueError, ValidationError):
        raise HTTPException(400, "Invalid avatar image") from None
    current_user.avatar_url = url
    db.commit()
    return {"avatar_url": url, "message": "Avatar actualizado"}


@router.delete("/avatar")
def delete_avatar(current_user: User = Depends(get_current_user),
                  db: Session = Depends(get_db)):
    upload_svc.delete_avatar(current_user.id)
    current_user.avatar_url = None
    db.commit()
    return {"message": "Avatar eliminado"}


@router.get("/avatars/{filename}")
def serve_avatar(filename: str):
    if not FILENAME.fullmatch(filename):
        raise HTTPException(404, "Image not found")
    path = UPLOAD_DIR / filename
    if not path.is_file():
        raise HTTPException(404, "Image not found")
    return FileResponse(path, media_type="image/webp", headers={"X-Content-Type-Options": "nosniff"})
