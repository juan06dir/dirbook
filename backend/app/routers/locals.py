from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from sqlalchemy import func
from app.database import get_db
from app.models.local import Local
from app.models.follow import Follow
from app.models.rating import Rating
from app.schemas.local import LocalCreate, LocalUpdate, LocalOut
from app.core.dependencies import get_current_user
from app.models.user import User
from typing import List, Optional
from uuid import UUID

router = APIRouter(prefix="/locals", tags=["Locales"])


def _enrich(local: Local, db: Session) -> dict:
    """Agrega followers_count, avg_rating y ratings_count a un Local."""
    followers_count = db.query(func.count(Follow.id)).filter(Follow.local_id == local.id).scalar() or 0
    result = db.query(
        func.avg(Rating.score),
        func.count(Rating.id)
    ).filter(Rating.local_id == local.id).one()
    avg_rating = round(float(result[0]), 1) if result[0] else None
    ratings_count = result[1] or 0

    data = {c.name: getattr(local, c.name) for c in local.__table__.columns}
    data["followers_count"] = followers_count
    data["avg_rating"] = avg_rating
    data["ratings_count"] = ratings_count
    return data


@router.get("", response_model=List[LocalOut])
def get_locals(
    search:   Optional[str] = Query(None),
    category: Optional[str] = Query(None),
    city:     Optional[str] = Query(None),
    skip:     int = Query(0, ge=0),
    limit:    int = Query(20, ge=1, le=100),
    db: Session = Depends(get_db)
):
    query = db.query(Local)
    if search:
        query = query.filter(
            Local.name.ilike(f"%{search}%") | Local.description.ilike(f"%{search}%")
        )
    if category:
        query = query.filter(Local.category.ilike(f"%{category}%"))
    if city:
        query = query.filter(Local.city.ilike(f"%{city}%"))
    locals_ = query.order_by(Local.created_at.desc()).offset(skip).limit(limit).all()
    return [_enrich(l, db) for l in locals_]


@router.post("", response_model=LocalOut, status_code=201)
def create_local(
    data: LocalCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    local = Local(**data.model_dump(), owner_id=current_user.id)
    db.add(local)
    db.commit()
    db.refresh(local)
    return _enrich(local, db)


@router.get("/mine", response_model=List[LocalOut])
def get_my_locals(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    locals_ = db.query(Local).filter(Local.owner_id == current_user.id).all()
    return [_enrich(l, db) for l in locals_]


@router.get("/{local_id}", response_model=LocalOut)
def get_local(local_id: UUID, db: Session = Depends(get_db)):
    local = db.query(Local).filter(Local.id == local_id).first()
    if not local:
        raise HTTPException(status_code=404, detail="Local no encontrado")
    return _enrich(local, db)


@router.put("/{local_id}", response_model=LocalOut)
def update_local(
    local_id: UUID,
    data: LocalUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    local = db.query(Local).filter(Local.id == local_id, Local.owner_id == current_user.id).first()
    if not local:
        raise HTTPException(status_code=404, detail="Local no encontrado o no autorizado")
    for key, value in data.model_dump(exclude_unset=True).items():
        setattr(local, key, value)
    db.commit()
    db.refresh(local)
    return _enrich(local, db)


@router.delete("/{local_id}", status_code=204)
def delete_local(
    local_id: UUID,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    local = db.query(Local).filter(Local.id == local_id, Local.owner_id == current_user.id).first()
    if not local:
        raise HTTPException(status_code=404, detail="Local no encontrado o no autorizado")
    db.delete(local)
    db.commit()
