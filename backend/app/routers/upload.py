import io
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
MAX_SIZE = 10 * 1024 * 1024  # 10 MB antes de comprimir

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

UPLOAD_DIR = "uploads"
os.makedirs(UPLOAD_DIR, exist_ok=True)


def compress_image(contents: bytes, max_width: int = 1920, quality: int = 82) -> bytes:
    """Redimensiona y comprime la imagen sin perder demasiada calidad."""
    try:
        from PIL import Image

        img = Image.open(io.BytesIO(contents))

        # Convertir a RGB si tiene canal alpha (PNG transparente)
        if img.mode in ("RGBA", "P", "LA"):
            background = Image.new("RGB", img.size, (255, 255, 255))
            if img.mode == "P":
                img = img.convert("RGBA")
            background.paste(img, mask=img.split()[-1] if img.mode == "RGBA" else None)
            img = background
        elif img.mode != "RGB":
            img = img.convert("RGB")

        # Redimensionar solo si es más grande que el máximo
        if img.width > max_width:
            ratio = max_width / img.width
            new_height = int(img.height * ratio)
            img = img.resize((max_width, new_height), Image.LANCZOS)

        output = io.BytesIO()
        img.save(output, format="JPEG", quality=quality, optimize=True)
        return output.getvalue()
    except ImportError:
        # Pillow no instalado — devolver tal cual
        return contents
    except Exception:
        return contents


@router.post("")
async def upload_image(
    file: UploadFile = File(...),
    current_user: User = Depends(get_current_user)
):
    if file.content_type not in ALLOWED_TYPES:
        raise HTTPException(status_code=400, detail="Solo se permiten imágenes JPG, PNG, WebP o GIF")

    contents = await file.read()
    if len(contents) > MAX_SIZE:
        raise HTTPException(status_code=400, detail="El archivo supera el límite de 10 MB")

    # Comprimir antes de subir
    compressed = compress_image(contents, max_width=1920, quality=82)

    # ── Cloudinary (producción) ──────────────────────────────────────────────
    if USE_CLOUDINARY:
        try:
            result = cloudinary.uploader.upload(
                compressed,
                folder="dirbook",
                resource_type="image",
                public_id=str(uuid.uuid4()),
                quality="auto:good",
                fetch_format="auto",
            )
            return {"url": result["secure_url"]}
        except Exception as e:
            raise HTTPException(status_code=500, detail=f"Error al subir imagen: {str(e)}")

    # ── Local (desarrollo) ───────────────────────────────────────────────────
    filename = f"{uuid.uuid4()}.jpg"
    filepath = os.path.join(UPLOAD_DIR, filename)

    with open(filepath, "wb") as f:
        f.write(compressed)

    return {"url": f"/uploads/{filename}"}
