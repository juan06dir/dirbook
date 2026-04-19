from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from sqlalchemy import text
from app.database import engine, Base
from app.routers import auth, locals, professionals, posts, upload, follows, ratings, notifications
import app.models
import os

app = FastAPI(title="Dirbook API", version="1.0.0")

# CORS — dominios permitidos explícitamente
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:3000",
        "https://dirbook.com.co",
        "https://www.dirbook.com.co",
        "https://dirbook-fk6i-git-main-juan06dirs-projects.vercel.app",
    ],
    allow_origin_regex=r"https://.*\.vercel\.app",
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ── Crear tablas nuevas ────────────────────────────────────────────────────────
try:
    Base.metadata.create_all(bind=engine)
except Exception as e:
    print(f"⚠️  Error al crear tablas: {e}")

# ── Migraciones automáticas (columnas nuevas en tablas existentes) ─────────────
_migrations = [
    "ALTER TABLE locals ADD COLUMN IF NOT EXISTS whatsapp  VARCHAR",
    "ALTER TABLE locals ADD COLUMN IF NOT EXISTS facebook  VARCHAR",
    "ALTER TABLE locals ADD COLUMN IF NOT EXISTS instagram VARCHAR",
    "ALTER TABLE professional_profiles ADD COLUMN IF NOT EXISTS whatsapp  VARCHAR",
    "ALTER TABLE professional_profiles ADD COLUMN IF NOT EXISTS facebook  VARCHAR",
    "ALTER TABLE professional_profiles ADD COLUMN IF NOT EXISTS instagram VARCHAR",
    """CREATE TABLE IF NOT EXISTS notifications (
        id         UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        user_id    UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
        type       VARCHAR NOT NULL,
        message    VARCHAR NOT NULL,
        local_id   UUID,
        local_name VARCHAR,
        read       BOOLEAN DEFAULT FALSE,
        created_at TIMESTAMP DEFAULT NOW()
    )""",
    """CREATE TABLE IF NOT EXISTS password_reset_tokens (
        id         UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        user_id    UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
        token      VARCHAR NOT NULL UNIQUE,
        expires_at TIMESTAMP NOT NULL,
        used       BOOLEAN DEFAULT FALSE,
        created_at TIMESTAMP DEFAULT NOW()
    )""",
]

try:
    with engine.begin() as conn:
        for sql in _migrations:
            conn.execute(text(sql))
    print("✅  Migraciones aplicadas correctamente.")
except Exception as e:
    print(f"⚠️  Error en migraciones: {e}")

# ── Archivos estáticos ────────────────────────────────────────────────────────
os.makedirs("uploads", exist_ok=True)
try:
    app.mount("/uploads", StaticFiles(directory="uploads"), name="uploads")
except Exception:
    pass

# ── Routers ───────────────────────────────────────────────────────────────────
app.include_router(auth.router)
app.include_router(locals.router)
app.include_router(professionals.router)
app.include_router(posts.router)
app.include_router(upload.router)
app.include_router(follows.router)
app.include_router(ratings.router)
app.include_router(notifications.router)

@app.get("/")
def root():
    return {"message": "Dirbook API funcionando 🚀"}

@app.get("/health")
def health():
    from app.core.config import settings
    return {
        "status": "ok",
        "cloudinary": bool(settings.CLOUDINARY_CLOUD_NAME),
        "cloud_name": settings.CLOUDINARY_CLOUD_NAME or "no configurado",
    }
