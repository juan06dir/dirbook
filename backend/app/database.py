from sqlalchemy import create_engine
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker
from app.core.config import settings

# pool_pre_ping: revalida la conexión antes de usarla (evita "SSL connection
# closed unexpectedly" con Postgres serverless como Neon que cierra conexiones
# ociosas). pool_recycle: recicla conexiones cada 5 min.
engine = create_engine(settings.DATABASE_URL, pool_pre_ping=True, pool_recycle=300)
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
Base = declarative_base()

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()