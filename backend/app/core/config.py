from pydantic_settings import BaseSettings
from typing import Optional

class Settings(BaseSettings):
    DATABASE_URL: str
    SECRET_KEY: str
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 10080

    # Cloudinary (opcional en desarrollo, requerido en producción)
    CLOUDINARY_CLOUD_NAME: Optional[str] = None
    CLOUDINARY_API_KEY:    Optional[str] = None
    CLOUDINARY_API_SECRET: Optional[str] = None

    # Email / SMTP (opcional — si no está configurado, el reset URL se imprime en consola)
    SMTP_HOST:     Optional[str] = None
    SMTP_PORT:     int           = 587
    SMTP_USER:     Optional[str] = None
    SMTP_PASSWORD: Optional[str] = None
    SMTP_FROM:     str           = "noreply@dirbook.com"
    FRONTEND_URL:  str           = "http://localhost:3000"

    class Config:
        env_file = ".env"

    def model_post_init(self, __context):
        object.__setattr__(self, "ALGORITHM", self.ALGORITHM.strip())
        object.__setattr__(self, "SECRET_KEY", self.SECRET_KEY.strip())

settings = Settings()