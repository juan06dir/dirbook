from pydantic_settings import BaseSettings

class Settings(BaseSettings):
    DATABASE_URL: str
    SECRET_KEY: str
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 10080

    class Config:
        env_file = ".env"

    def model_post_init(self, __context):
        # Limpiar espacios que puedan venir de variables de entorno
        object.__setattr__(self, "ALGORITHM", self.ALGORITHM.strip())
        object.__setattr__(self, "SECRET_KEY", self.SECRET_KEY.strip())

settings = Settings()