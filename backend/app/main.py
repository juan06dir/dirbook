from fastapi import FastAPI, Depends
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from sqlalchemy.orm import Session
from sqlalchemy import text
from app.database import engine, Base, get_db
from app.routers import auth, locals, professionals, posts, upload, follows, ratings
from app.core.dependencies import get_current_user
from app.models.user import User
import app.models
import os
import datetime
from typing import List, Optional
from uuid import UUID
from pydantic import BaseModel

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
        notif_type VARCHAR NOT NULL,
        message    VARCHAR NOT NULL,
        local_id   UUID,
        local_name VARCHAR,
        read       BOOLEAN DEFAULT FALSE,
        created_at TIMESTAMP DEFAULT NOW()
    )""",
    "DO $$ BEGIN IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='notifications' AND column_name='type') THEN ALTER TABLE notifications RENAME COLUMN \"type\" TO notif_type; END IF; END $$;",
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

# ── Notificaciones (inline para evitar conflicto con Pydantic v2 + FastAPI) ──

class NotifOut(BaseModel):
    id: UUID
    notif_type: str
    message: str
    local_id: Optional[UUID]
    local_name: Optional[str]
    read: bool
    created_at: datetime.datetime

    model_config = {"from_attributes": True}


@app.get("/notifications", response_model=List[NotifOut], tags=["Notifications"])
def get_notifications(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    from app.models.notification import Notification
    rows = (
        db.query(Notification)
        .filter(Notification.user_id == current_user.id)
        .order_by(Notification.created_at.desc())
        .limit(50)
        .all()
    )
    return [
        NotifOut(
            id=r.id,
            notif_type=r.notif_type,
            message=r.message,
            local_id=r.local_id,
            local_name=r.local_name,
            read=r.read,
            created_at=r.created_at,
        )
        for r in rows
    ]


@app.put("/notifications/read", tags=["Notifications"])
def mark_notifications_read(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    from app.models.notification import Notification
    db.query(Notification).filter(
        Notification.user_id == current_user.id,
        Notification.read == False,  # noqa: E712
    ).update({"read": True})
    db.commit()
    return {"ok": True}


class SuggestionIn(BaseModel):
    name: str
    email: str
    message: str


@app.post("/suggestions", status_code=201, tags=["Suggestions"])
def submit_suggestion(data: SuggestionIn):
    from app.core.email import send_suggestion_email
    if not data.name.strip() or not data.email.strip() or not data.message.strip():
        from fastapi import HTTPException
        raise HTTPException(status_code=400, detail="Todos los campos son obligatorios")
    send_suggestion_email(data.name.strip(), data.email.strip(), data.message.strip())
    return {"ok": True}


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
