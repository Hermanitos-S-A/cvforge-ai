"""Safe image decoder: size checks before base64 decode and sanitized WEBP output."""

import base64
import binascii
import io
import uuid
from pathlib import Path
from PIL import Image, UnidentifiedImageError

UPLOAD_DIR = Path("data/uploads/avatars")
ALLOWED_TYPES = {"image/jpeg": "JPEG", "image/png": "PNG", "image/webp": "WEBP"}
MAX_SIZE = 2 * 1024 * 1024
MAX_B64_CHARS = ((MAX_SIZE + 2) // 3) * 4 + 256
MAX_PIXELS = 12_000_000


class UploadService:
    def __init__(self):
        UPLOAD_DIR.mkdir(parents=True, exist_ok=True)

    def save_avatar(self, base64_data: str, content_type: str, user_id: int) -> str:
        if content_type not in ALLOWED_TYPES:
            raise ValueError("Unsupported image media type")
        if len(base64_data) > MAX_B64_CHARS + 128:
            raise ValueError("Image body exceeds maximum allowed size")
        if "," in base64_data:
            base64_data = base64_data.split(",", 1)[1]
        if len(base64_data) > MAX_B64_CHARS:
            raise ValueError("Image body exceeds maximum allowed size")
        try:
            image_bytes = base64.b64decode(base64_data, validate=True)
        except (ValueError, binascii.Error):
            raise ValueError("Invalid image encoding") from None
        if not 1 <= len(image_bytes) <= MAX_SIZE:
            raise ValueError("Image size must be at most 2 MiB")
        try:
            with Image.open(io.BytesIO(image_bytes)) as img:
                if (img.format != ALLOWED_TYPES[content_type] or img.width < 1 or img.height < 1
                        or img.width * img.height > MAX_PIXELS):
                    raise ValueError("Image format or dimensions invalid")
                img.verify()
            with Image.open(io.BytesIO(image_bytes)) as verified:
                verified.load()
                mode = "RGBA" if "A" in verified.getbands() else "RGB"
                clean = Image.new(mode, verified.size)
                clean.paste(verified.convert(mode))
                out = io.BytesIO()
                clean.save(out, format="WEBP", quality=83, method=5, exif=b"", icc_profile=b"")
                webp = out.getvalue()
        except (UnidentifiedImageError, OSError, ValueError, Image.DecompressionBombError):
            raise ValueError("Invalid or unsafe image") from None
        if len(webp) > MAX_SIZE:
            raise ValueError("Processed image exceeds 2 MiB")
        filename = f"user_{user_id}_{uuid.uuid4().hex}.webp"
        path = UPLOAD_DIR / filename
        path.write_bytes(webp)
        # Old avatars are removed only after the new validated image exists.
        for old in UPLOAD_DIR.glob(f"user_{user_id}_*"):
            if old.name != filename:
                old.unlink(missing_ok=True)
        return f"/uploads/avatars/{filename}"

    def delete_avatar(self, user_id: int):
        for f in UPLOAD_DIR.glob(f"user_{user_id}_*"):
            f.unlink(missing_ok=True)
