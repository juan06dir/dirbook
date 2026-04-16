"""
Script de migración: agrega las columnas nuevas de eventos/descuentos a posts,
y crea las tablas follows y ratings si no existen.

Ejecutar UNA sola vez:
    cd backend
    python migrate.py
"""

from app.database import engine
from sqlalchemy import text

migrations = [
    # ── Posts: nuevos campos de evento/descuento ──────────────────────────────
    "ALTER TABLE posts ADD COLUMN IF NOT EXISTS post_type  VARCHAR NOT NULL DEFAULT 'post'",
    "ALTER TABLE posts ADD COLUMN IF NOT EXISTS title      VARCHAR",
    "ALTER TABLE posts ADD COLUMN IF NOT EXISTS event_start TIMESTAMP",
    "ALTER TABLE posts ADD COLUMN IF NOT EXISTS event_end   TIMESTAMP",
    "ALTER TABLE posts ADD COLUMN IF NOT EXISTS discount_pct FLOAT",
    # ── Locals: redes sociales ────────────────────────────────────────────────
    "ALTER TABLE locals ADD COLUMN IF NOT EXISTS whatsapp  VARCHAR",
    "ALTER TABLE locals ADD COLUMN IF NOT EXISTS facebook  VARCHAR",
    "ALTER TABLE locals ADD COLUMN IF NOT EXISTS instagram VARCHAR",
    # ── Password reset tokens ─────────────────────────────────────────────────
    """CREATE TABLE IF NOT EXISTS password_reset_tokens (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
        token VARCHAR NOT NULL UNIQUE,
        expires_at TIMESTAMP NOT NULL,
        used BOOLEAN DEFAULT FALSE,
        created_at TIMESTAMP DEFAULT NOW()
    )""",
]

def run():
    with engine.begin() as conn:
        for sql in migrations:
            print(f"  → {sql[:60]}...")
            conn.execute(text(sql))
    print("\n✅  Migración completada.")

    # Crear tablas nuevas (follows, ratings) usando SQLAlchemy models
    from app.database import Base
    import app.models          # noqa: registra todos los modelos
    import app.models.follow   # noqa
    import app.models.rating   # noqa
    Base.metadata.create_all(bind=engine)
    print("✅  Tablas follows y ratings listas.")

if __name__ == "__main__":
    run()
