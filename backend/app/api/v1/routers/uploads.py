from fastapi import APIRouter, Depends, HTTPException
from fastapi.responses import FileResponse
from pydantic import BaseModel
from pathlib import Path
from app.api.v1.deps import get_current_user
from app.models import User
from app.services.upload_service import UploadService
from sqlalchemy.orm import Session
from app.core.database import get_db

router = APIRouter()
upload_svc = UploadService()


class AvatarUploadRequest(BaseModel):
    base64_data: str
    content_type: str


@router.post("/avatar")
def upload_avatar(
    payload: AvatarUploadRequest,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """Sube foto de perfil. Solo disponible para plan Pro."""
    # Plan check — Free users get a friendly error
    if current_user.plan == "free":
        raise HTTPException(
            status_code=403,
            detail="La foto de perfil es una función Pro. Actualiza tu plan para usarla.",
        )
    try:
        url = upload_svc.save_avatar(
            payload.base64_data, payload.content_type, current_user.id
        )
        # Save URL to user record
        current_user.avatar_url = url
        db.commit()
        return {"avatar_url": url, "message": "Foto de perfil actualizada"}
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))


@router.delete("/avatar")
def delete_avatar(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    upload_svc.delete_avatar(current_user.id)
    current_user.avatar_url = None
    db.commit()
    return {"message": "Foto de perfil eliminada"}


@router.get("/avatars/{filename}")
def serve_avatar(filename: str):
    """Sirve la imagen de avatar desde disco."""
    path = Path(f"data/uploads/avatars/{filename}")
    if not path.exists():
        raise HTTPException(404, "Imagen no encontrada")
    return FileResponse(path)
