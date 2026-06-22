from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session, joinedload
from sqlalchemy import or_
from app.database import get_db
from app.models.post import Post
from app.models.local import Local
from app.models.professional import ProfessionalProfile
from app.schemas.post import PostCreate, PostOut, PostUpdate
from app.core.dependencies import get_current_user, get_optional_user
from app.models.user import User
from app.models.like import PostLike
from app.models.comment import PostComment
from typing import List, Optional
from uuid import UUID
from pydantic import BaseModel
import datetime

router = APIRouter(prefix="/posts", tags=["Posts"])


# ── Feed enriquecido (red social) ─────────────────────────────────────────────
class FeedPostOut(BaseModel):
    id: UUID
    post_type: str
    title: Optional[str]
    content: str
    image_url: Optional[str]
    event_start: Optional[datetime.datetime]
    event_end: Optional[datetime.datetime]
    discount_pct: Optional[float]
    created_at: datetime.datetime
    # Autor (la "cara" = el local o el profesional)
    local_id: Optional[UUID]
    local_name: Optional[str]
    local_category: Optional[str]
    local_city: Optional[str]
    local_logo: Optional[str]
    local_cover: Optional[str]
    professional_id: Optional[UUID]
    professional_name: Optional[str]
    professional_profession: Optional[str]
    professional_avatar: Optional[str]
    # Métricas sociales
    likes_count: int
    comments_count: int
    liked_by_me: bool

    model_config = {"from_attributes": True}


def _build_feed_items(posts, current_user, db) -> List[FeedPostOut]:
    from sqlalchemy import func
    post_ids = [p.id for p in posts]
    if not post_ids:
        return []

    like_rows = (
        db.query(PostLike.post_id, func.count(PostLike.id))
        .filter(PostLike.post_id.in_(post_ids))
        .group_by(PostLike.post_id)
        .all()
    )
    likes_map = {pid: cnt for pid, cnt in like_rows}

    comment_rows = (
        db.query(PostComment.post_id, func.count(PostComment.id))
        .filter(PostComment.post_id.in_(post_ids))
        .group_by(PostComment.post_id)
        .all()
    )
    comments_map = {pid: cnt for pid, cnt in comment_rows}

    mine = set()
    if current_user:
        my_rows = (
            db.query(PostLike.post_id)
            .filter(PostLike.post_id.in_(post_ids), PostLike.user_id == current_user.id)
            .all()
        )
        mine = {r[0] for r in my_rows}

    items = []
    for p in posts:
        items.append(FeedPostOut(
            id=p.id, post_type=p.post_type, title=p.title, content=p.content,
            image_url=p.image_url, event_start=p.event_start, event_end=p.event_end,
            discount_pct=p.discount_pct, created_at=p.created_at,
            local_id=p.local_id,
            local_name=p.local.name if p.local else None,
            local_category=p.local.category if p.local else None,
            local_city=p.local.city if p.local else None,
            local_logo=p.local.logo if p.local else None,
            local_cover=p.local.cover_image if p.local else None,
            professional_id=p.professional_id,
            professional_name=p.professional.name if p.professional else None,
            professional_profession=p.professional.profession if p.professional else None,
            professional_avatar=p.professional.avatar if p.professional else None,
            likes_count=likes_map.get(p.id, 0),
            comments_count=comments_map.get(p.id, 0),
            liked_by_me=p.id in mine,
        ))
    return items


# ── Schema enriquecido para eventos públicos ──────────────────────────────────
class EventOut(BaseModel):
    id: UUID
    post_type: str
    title: Optional[str]
    content: str
    image_url: Optional[str]
    event_start: Optional[datetime.datetime]
    event_end: Optional[datetime.datetime]
    discount_pct: Optional[float]
    created_at: datetime.datetime
    # Contexto del local
    local_id: Optional[UUID]
    local_name: Optional[str]
    local_city: Optional[str]
    local_category: Optional[str]
    local_logo: Optional[str]
    # Contexto del profesional
    professional_id: Optional[UUID]
    professional_name: Optional[str]
    professional_profession: Optional[str]

    class Config:
        from_attributes = True


@router.get("/events", response_model=List[EventOut], tags=["Events"])
def get_events(
    city: Optional[str] = Query(None, description="Filtrar por ciudad del local"),
    category: Optional[str] = Query(None, description="Filtrar por categoría del local"),
    profession: Optional[str] = Query(None, description="Filtrar por profesión"),
    upcoming_only: bool = Query(False, description="Solo eventos activos o futuros"),
    skip: int = Query(0, ge=0),
    limit: int = Query(30, ge=1, le=100),
    db: Session = Depends(get_db),
):
    """Eventos públicos con filtros por ciudad, categoría y profesión."""
    now = datetime.datetime.utcnow()
    query = (
        db.query(Post)
        .options(joinedload(Post.local), joinedload(Post.professional))
        .filter(Post.post_type == "event")
    )

    if upcoming_only:
        query = query.filter(
            or_(Post.event_end == None, Post.event_end >= now)
        )

    # Filtro por ciudad (solo aplica a eventos de locales)
    if city:
        query = query.join(Local, Post.local_id == Local.id, isouter=True).filter(
            Local.city.ilike(f"%{city}%")
        )

    # Filtro por categoría de local
    if category:
        if not city:  # evitar join doble
            query = query.join(Local, Post.local_id == Local.id, isouter=True)
        query = query.filter(Local.category.ilike(f"%{category}%"))

    # Filtro por profesión
    if profession:
        query = query.join(
            ProfessionalProfile,
            Post.professional_id == ProfessionalProfile.id,
            isouter=True,
        ).filter(ProfessionalProfile.profession.ilike(f"%{profession}%"))

    posts = query.order_by(Post.event_start.asc(), Post.created_at.desc()).offset(skip).limit(limit).all()

    results = []
    for p in posts:
        results.append(EventOut(
            id=p.id,
            post_type=p.post_type,
            title=p.title,
            content=p.content,
            image_url=p.image_url,
            event_start=p.event_start,
            event_end=p.event_end,
            discount_pct=p.discount_pct,
            created_at=p.created_at,
            local_id=p.local_id,
            local_name=p.local.name if p.local else None,
            local_city=p.local.city if p.local else None,
            local_category=p.local.category if p.local else None,
            local_logo=p.local.logo if p.local else None,
            professional_id=p.professional_id,
            professional_name=p.professional.name if p.professional else None,
            professional_profession=p.professional.profession if p.professional else None,
        ))
    return results


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


@router.get("/feed", response_model=List[FeedPostOut])
def get_feed(
    skip: int = Query(0, ge=0),
    limit: int = Query(20, ge=1, le=100),
    post_type: Optional[str] = Query(None),
    db: Session = Depends(get_db),
    current_user: Optional[User] = Depends(get_optional_user),
):
    """Feed estilo red social: posts con autor, likes y comentarios."""
    query = db.query(Post).options(joinedload(Post.local), joinedload(Post.professional))
    if post_type:
        query = query.filter(Post.post_type == post_type)
    posts = query.order_by(Post.created_at.desc()).offset(skip).limit(limit).all()
    return _build_feed_items(posts, current_user, db)


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


@router.get("/professional/{prof_id}", response_model=List[FeedPostOut])
def get_professional_posts(
    prof_id: UUID,
    post_type: Optional[str] = Query(None),
    skip: int = Query(0, ge=0),
    limit: int = Query(20, ge=1, le=100),
    db: Session = Depends(get_db),
    current_user: Optional[User] = Depends(get_optional_user),
):
    """Posts de un perfil profesional (feed enriquecido con autor y métricas)."""
    query = db.query(Post).options(joinedload(Post.local), joinedload(Post.professional)).filter(Post.professional_id == prof_id)
    if post_type:
        query = query.filter(Post.post_type == post_type)
    posts = query.order_by(Post.created_at.desc()).offset(skip).limit(limit).all()
    return _build_feed_items(posts, current_user, db)


@router.get("/local/{local_id}", response_model=List[FeedPostOut])
def get_local_posts(
    local_id: UUID,
    post_type: Optional[str] = Query(None),
    skip: int = Query(0, ge=0),
    limit: int = Query(20, ge=1, le=100),
    db: Session = Depends(get_db),
    current_user: Optional[User] = Depends(get_optional_user),
):
    """Posts de un local específico (feed enriquecido con autor y métricas)."""
    query = db.query(Post).options(joinedload(Post.local), joinedload(Post.professional)).filter(Post.local_id == local_id)
    if post_type:
        query = query.filter(Post.post_type == post_type)
    posts = query.order_by(Post.created_at.desc()).offset(skip).limit(limit).all()
    return _build_feed_items(posts, current_user, db)


@router.get("/{post_id}", response_model=PostOut)
def get_post(post_id: UUID, db: Session = Depends(get_db)):
    post = db.query(Post).filter(Post.id == post_id).first()
    if not post:
        raise HTTPException(status_code=404, detail="Post no encontrado")
    return post


def _post_owner_check(post, current_user, db) -> bool:
    """True si current_user es dueño del local o perfil del post."""
    if post.local_id:
        local = db.query(Local).filter(
            Local.id == post.local_id,
            Local.owner_id == current_user.id
        ).first()
        if local is not None:
            return True
    if post.professional_id:
        profile = db.query(ProfessionalProfile).filter(
            ProfessionalProfile.id == post.professional_id,
            ProfessionalProfile.owner_id == current_user.id
        ).first()
        if profile is not None:
            return True
    return False


@router.put("/{post_id}", response_model=FeedPostOut)
def update_post(
    post_id: UUID,
    data: PostUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    post = (
        db.query(Post)
        .options(joinedload(Post.local), joinedload(Post.professional))
        .filter(Post.id == post_id)
        .first()
    )
    if not post:
        raise HTTPException(status_code=404, detail="Post no encontrado")
    if not _post_owner_check(post, current_user, db):
        raise HTTPException(status_code=403, detail="No autorizado")

    changes = data.model_dump(exclude_unset=True)
    for k, v in changes.items():
        setattr(post, k, v)
    db.commit()
    db.refresh(post)
    return _build_feed_items([post], current_user, db)[0]


@router.delete("/{post_id}", status_code=204)
def delete_post(
    post_id: UUID,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    post = db.query(Post).filter(Post.id == post_id).first()
    if not post:
        raise HTTPException(status_code=404, detail="Post no encontrado")

    if not _post_owner_check(post, current_user, db):
        raise HTTPException(status_code=403, detail="No autorizado")

    db.delete(post)
    db.commit()
