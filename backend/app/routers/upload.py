import os
import uuid
import cloudinary
import cloudinary.uploader
from fastapi import APIRouter, UploadFile, File, HTTPException, Depends
from app.core.dependencies import get_current_user
from app.core.config import settings
from app.models.user import User

router = APIRouter(prefix="/upload", tags=["Upload"])

ALLOWED_TYPES = {"image/jpeg", "image/png", "image/webp", "image/gif"}
MAX_SIZE = 5 * 1024 * 1024  # 5 MB

# Configurar Cloudinary si las variables están disponibles
USE_CLOUDINARY = all([
    settings.CLOUDINARY_CLOUD_NAME,
    settings.CLOUDINARY_API_KEY,
    settings.CLOUDINARY_API_SECRET,
])

if USE_CLOUDINARY:
    cloudinary.config(
        cloud_name=settings.CLOUDINARY_CLOUD_NAME,
        api_key=settings.CLOUDINARY_API_KEY,
        api_secret=settings.CLOUDINARY_API_SECRET,
        secure=True,
    )

# Carpeta local como fallback (desarrollo)
UPLOAD_DIR = "uploads"
os.makedirs(UPLOAD_DIR, exist_ok=True)


@router.post("")
async def upload_image(
    file: UploadFile = File(...),
    current_user: User = Depends(get_current_user)
):
    if file.content_type not in ALLOWED_TYPES:
        raise HTTPException(status_code=400, detail="Solo se permiten imágenes JPG, PNG, WebP o GIF")

    contents = await file.read()
    if len(contents) > MAX_SIZE:
        raise HTTPException(status_code=400, detail="El archivo supera el límite de 5 MB")

    # ── Cloudinary (producción) ──────────────────────────────────────────────
    if USE_CLOUDINARY:
        try:
            result = cloudinary.uploader.upload(
                contents,
                folder="dirbook",
                resource_type="image",
                public_id=str(uuid.uuid4()),
            )
            return {"url": result["secure_url"]}
        except Exception as e:
            raise HTTPException(status_code=500, detail=f"Error al subir imagen: {str(e)}")

    # ── Local (desarrollo) ───────────────────────────────────────────────────
    ext = file.filename.rsplit(".", 1)[-1] if "." in (file.filename or "") else "jpg"
    filename = f"{uuid.uuid4()}.{ext}"
    filepath = os.path.join(UPLOAD_DIR, filename)

    with open(filepath, "wb") as f:
        f.write(contents)

    return {"url": f"/uploads/{filename}"}
