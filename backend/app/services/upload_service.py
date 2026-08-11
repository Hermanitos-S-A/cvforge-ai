import uuid
import base64
from pathlib import Path

UPLOAD_DIR = Path("data/uploads/avatars")
ALLOWED_TYPES = {"image/jpeg", "image/png", "image/webp"}
MAX_SIZE = 2 * 1024 * 1024  # 2MB


class UploadService:
    def __init__(self):
        UPLOAD_DIR.mkdir(parents=True, exist_ok=True)

    def save_avatar(self, base64_data: str, content_type: str, user_id: int) -> str:
        if content_type not in ALLOWED_TYPES:
            raise ValueError(f"Tipo no permitido: {content_type}")
        if "," in base64_data:
            base64_data = base64_data.split(",")[1]
        image_bytes = base64.b64decode(base64_data)
        if len(image_bytes) > MAX_SIZE:
            raise ValueError("La imagen no puede superar 2MB")
        ext = "jpg" if content_type == "image/jpeg" else content_type.split("/")[1]
        filename = f"user_{user_id}_{uuid.uuid4().hex[:8]}.{ext}"
        # Remove old avatars
        for old in UPLOAD_DIR.glob(f"user_{user_id}_*"):
            old.unlink(missing_ok=True)
        (UPLOAD_DIR / filename).write_bytes(image_bytes)
        return f"/uploads/avatars/{filename}"

    def delete_avatar(self, user_id: int):
        for f in UPLOAD_DIR.glob(f"user_{user_id}_*"):
            f.unlink(missing_ok=True)
