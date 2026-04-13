from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from sqlalchemy import or_
from app.database import get_db
from app.models.post import Post
from app.models.local import Local
from app.models.professional import ProfessionalProfile
from app.schemas.post import PostCreate, PostOut
from app.core.dependencies import get_current_user
from app.models.user import User
from typing import List, Optional
from uuid import UUID
import datetime

router = APIRouter(prefix="/posts", tags=["Posts"])


@router.post("", response_model=PostOut, status_code=201)
def create_post(
    data: PostCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    if data.local_id:
        local = db.query(Local).filter(
            Local.id == data.local_id,
            Local.owner_id == current_user.id
        ).first()
        if not local:
            raise HTTPException(status_code=403, detail="No tienes permiso sobre este local")

    if data.professional_id:
        profile = db.query(ProfessionalProfile).filter(
            ProfessionalProfile.id == data.professional_id,
            ProfessionalProfile.owner_id == current_user.id
        ).first()
        if not profile:
            raise HTTPException(status_code=403, detail="No tienes permiso sobre este perfil")

    if not data.local_id and not data.professional_id:
        raise HTTPException(status_code=400, detail="El post debe pertenecer a un local o perfil profesional")

    post = Post(**data.model_dump())
    db.add(post)
    db.commit()
    db.refresh(post)
    return post


@router.get("/feed", response_model=List[PostOut])
def get_feed(
    skip: int = Query(0, ge=0),
    limit: int = Query(20, ge=1, le=100),
    post_type: Optional[str] = Query(None),
    db: Session = Depends(get_db)
):
    """Feed público: todos los posts ordenados por fecha."""
    query = db.query(Post)
    if post_type:
        query = query.filter(Post.post_type == post_type)
    return query.order_by(Post.created_at.desc()).offset(skip).limit(limit).all()


@router.get("/active-discounts", response_model=List[PostOut])
def get_active_discounts(
    skip: int = Query(0, ge=0),
    limit: int = Query(20, ge=1, le=100),
    db: Session = Depends(get_db)
):
    """Descuentos y eventos vigentes a la fecha actual."""
    now = datetime.datetime.utcnow()
    query = db.query(Post).filter(
        Post.post_type.in_(["discount", "event"]),
        or_(Post.event_end == None, Post.event_end >= now)
    )
    return query.order_by(Post.event_start.asc(), Post.created_at.desc()).offset(skip).limit(limit).all()


@router.get("/professional/{prof_id}", response_model=List[PostOut])
def get_professional_posts(
    prof_id: UUID,
    post_type: Optional[str] = Query(None),
    skip: int = Query(0, ge=0),
    limit: int = Query(20, ge=1, le=100),
    db: Session = Depends(get_db)
):
    """Posts de un perfil profesional."""
    query = db.query(Post).filter(Post.professional_id == prof_id)
    if post_type:
        query = query.filter(Post.post_type == post_type)
    return query.order_by(Post.created_at.desc()).offset(skip).limit(limit).all()


@router.get("/local/{local_id}", response_model=List[PostOut])
def get_local_posts(
    local_id: UUID,
    post_type: Optional[str] = Query(None),
    skip: int = Query(0, ge=0),
    limit: int = Query(20, ge=1, le=100),
    db: Session = Depends(get_db)
):
    """Posts de un local específico."""
    query = db.query(Post).filter(Post.local_id == local_id)
    if post_type:
        query = query.filter(Post.post_type == post_type)
    return query.order_by(Post.created_at.desc()).offset(skip).limit(limit).all()


@router.get("/{post_id}", response_model=PostOut)
def get_post(post_id: UUID, db: Session = Depends(get_db)):
    post = db.query(Post).filter(Post.id == post_id).first()
    if not post:
        raise HTTPException(status_code=404, detail="Post no encontrado")
    return post


@router.delete("/{post_id}", status_code=204)
def delete_post(
    post_id: UUID,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    post = db.query(Post).filter(Post.id == post_id).first()
    if not post:
        raise HTTPException(status_code=404, detail="Post no encontrado")

    is_owner = False
    if post.local_id:
        local = db.query(Local).filter(
            Local.id == post.local_id,
            Local.owner_id == current_user.id
        ).first()
        is_owner = local is not None
    if not is_owner and post.professional_id:
        profile = db.query(ProfessionalProfile).filter(
            ProfessionalProfile.id == post.professional_id,
            ProfessionalProfile.owner_id == current_user.id
        ).first()
        is_owner = profile is not None

    if not is_owner:
        raise HTTPException(status_code=403, detail="No autorizado")

    db.delete(post)
    db.commit()
