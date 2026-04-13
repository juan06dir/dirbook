from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from app.database import engine, Base
from app.routers import auth, locals, professionals, posts, upload, follows, ratings
import app.models
import os

Base.metadata.create_all(bind=engine)

app = FastAPI(title="Dirbook API", version="1.0.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:3000",
        "https://dirbook-fk6i-git-main-juan06dirs-projects.vercel.app",
        "https://dirbook-fk6i.vercel.app",
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

os.makedirs("uploads", exist_ok=True)
app.mount("/uploads", StaticFiles(directory="uploads"), name="uploads")

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