from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from app.database import engine, Base
from app.routers import auth, locals, professionals, posts, upload, follows, ratings
import app.models
import os

app = FastAPI(title="Dirbook API", version="1.0.0")

# CORS — permite cualquier origen (se puede restringir después)
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=False,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Crear tablas al iniciar (con manejo de error para no crashear)
try:
    Base.metadata.create_all(bind=engine)
except Exception as e:
    print(f"⚠️  Error al crear tablas: {e}")

os.makedirs("uploads", exist_ok=True)

try:
    app.mount("/uploads", StaticFiles(directory="uploads"), name="uploads")
except Exception:
    pass

app.include_router(auth.router)
app.include_router(locals.router)
app.include_router(professionals.router)
app.include_router(posts.router)
app.include_router(upload.router)
app.include_router(follows.router)
app.include_router(ratings.router)

@app.get("/")
def root():
    return {"message": "Dirbook API funcionando 🚀"}
