import secrets
import datetime

from fastapi import APIRouter, Depends, HTTPException
from fastapi.security import OAuth2PasswordRequestForm
from sqlalchemy.orm import Session

from app.database import get_db
from app.models.user import User
from app.models.password_reset import PasswordResetToken
from app.schemas.user import (
    UserCreate, Token, UserOut,
    ForgotPasswordRequest, ResetPasswordRequest,
)
from app.core.security import hash_password, verify_password, create_access_token
from app.core.config import settings
from app.core.email import send_reset_email

router = APIRouter(prefix="/auth", tags=["Auth"])


@router.post("/register", response_model=Token, status_code=201)
def register(data: UserCreate, db: Session = Depends(get_db)):
    existing = db.query(User).filter(User.email == data.email).first()
    if existing:
        raise HTTPException(status_code=400, detail="El email ya está registrado")
    user = User(
        name=data.name,
        email=data.email,
        password=hash_password(data.password),
    )
    db.add(user)
    db.commit()
    db.refresh(user)
    token = create_access_token({"sub": str(user.id)})
    return {"access_token": token, "token_type": "bearer", "user": user}


@router.post("/login", response_model=Token)
def login(form_data: OAuth2PasswordRequestForm = Depends(), db: Session = Depends(get_db)):
    user = db.query(User).filter(User.email == form_data.username).first()
    if not user or not verify_password(form_data.password, user.password):
        raise HTTPException(status_code=401, detail="Credenciales incorrectas")
    token = create_access_token({"sub": str(user.id)})
    return {"access_token": token, "token_type": "bearer", "user": user}


@router.post("/forgot-password")
def forgot_password(data: ForgotPasswordRequest, db: Session = Depends(get_db)):
    """Genera un token de recuperación y (si hay SMTP) envía el correo.
    Siempre devuelve el mismo mensaje para no revelar si el email existe.
    """
    user = db.query(User).filter(User.email == data.email).first()

    if user:
        # Invalidar tokens anteriores no usados
        db.query(PasswordResetToken).filter(
            PasswordResetToken.user_id == user.id,
            PasswordResetToken.used == False,  # noqa: E712
        ).update({"used": True})
        db.commit()

        token_value = secrets.token_urlsafe(32)
        expires_at  = datetime.datetime.utcnow() + datetime.timedelta(hours=1)

        reset_token = PasswordResetToken(
            user_id    = user.id,
            token      = token_value,
            expires_at = expires_at,
        )
        db.add(reset_token)
        db.commit()

        reset_url = f"{settings.FRONTEND_URL}/auth/reset-password?token={token_value}"
        send_reset_email(user.email, reset_url, user.name)

    return {"message": "Si el email está registrado, recibirás un enlace de recuperación en breve."}


@router.get("/verify-reset-token/{token}")
def verify_reset_token(token: str, db: Session = Depends(get_db)):
    """Verifica si un token de recuperación es válido (sin gastarlo)."""
    record = db.query(PasswordResetToken).filter(
        PasswordResetToken.token      == token,
        PasswordResetToken.used       == False,  # noqa: E712
        PasswordResetToken.expires_at >  datetime.datetime.utcnow(),
    ).first()

    if not record:
        raise HTTPException(status_code=400, detail="El enlace es inválido o ya expiró")

    return {"valid": True}


@router.post("/reset-password")
def reset_password(data: ResetPasswordRequest, db: Session = Depends(get_db)):
    """Consume el token y actualiza la contraseña del usuario."""
    if len(data.new_password) < 6:
        raise HTTPException(status_code=400, detail="La contraseña debe tener al menos 6 caracteres")

    record = db.query(PasswordResetToken).filter(
        PasswordResetToken.token      == data.token,
        PasswordResetToken.used       == False,  # noqa: E712
        PasswordResetToken.expires_at >  datetime.datetime.utcnow(),
    ).first()

    if not record:
        raise HTTPException(status_code=400, detail="El enlace es inválido o ya expiró")

    user = db.query(User).filter(User.id == record.user_id).first()
    if not user:
        raise HTTPException(status_code=404, detail="Usuario no encontrado")

    user.password = hash_password(data.new_password)
    record.used   = True
    db.commit()

    return {"message": "Contraseña actualizada correctamente. Ya puedes iniciar sesión."}
