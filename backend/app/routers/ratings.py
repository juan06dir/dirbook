from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from sqlalchemy.exc import IntegrityError
from sqlalchemy import func
from app.database import get_db
from app.models.rating import Rating
from app.models.local import Local
from app.models.notification import Notification
from app.core.dependencies import get_current_user, get_optional_user
from app.models.user import User
from pydantic import BaseModel, field_validator
from typing import Optional
from uuid import UUID

router = APIRouter(prefix="/ratings", tags=["Ratings"])


class RatingCreate(BaseModel):
    score: int
    comment: Optional[str] = None

    @field_validator("score")
    @classmethod
    def validate_score(cls, v):
        if not (1 <= v <= 5):
            raise ValueError("El puntaje debe ser entre 1 y 5")
        return v


class RatingSummary(BaseModel):
    avg: Optional[float]
    count: int
    my_score: Optional[int]


@router.post("/{local_id}", response_model=RatingSummary)
def rate_local(
    local_id: UUID,
    data: RatingCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    local = db.query(Local).filter(Local.id == local_id).first()
    if not local:
        raise HTTPException(status_code=404, detail="Local no encontrado")

    existing = db.query(Rating).filter(
        Rating.user_id == current_user.id,
        Rating.local_id == local_id
    ).first()

    if existing:
        existing.score = data.score
        existing.comment = data.comment
    else:
        rating = Rating(
            user_id=current_user.id,
            local_id=local_id,
            score=data.score,
            comment=data.comment
        )
        db.add(rating)

    is_new = not existing
    try:
        db.commit()
        # Notificar al dueño del local solo en calificaciones nuevas (no en ediciones)
        if is_new and local.owner_id != current_user.id:
            stars = "⭐" * data.score
            notif = Notification(
                user_id    = local.owner_id,
                type       = "rating",
                message    = f"{current_user.name} calificó tu local "{local.name}" con {data.score}/5 {stars}",
                local_id   = local.id,
                local_name = local.name,
            )
            db.add(notif)
            db.commit()
    except IntegrityError:
        db.rollback()
        raise HTTPException(status_code=400, detail="Error al guardar calificación")

    return _summary(local_id, current_user.id, db)


@router.get("/{local_id}", response_model=RatingSummary)
def get_rating_summary(
    local_id: UUID,
    db: Session = Depends(get_db),
    current_user: Optional[User] = Depends(get_optional_user)
):
    user_id = current_user.id if current_user else None
    return _summary(local_id, user_id, db)


def _summary(local_id: UUID, user_id, db: Session) -> RatingSummary:
    result = db.query(
        func.avg(Rating.score).label("avg"),
        func.count(Rating.id).label("count")
    ).filter(Rating.local_id == local_id).one()

    avg = round(float(result.avg), 1) if result.avg else None
    count = result.count

    my_score = None
    if user_id:
        mine = db.query(Rating).filter(
            Rating.user_id == user_id,
            Rating.local_id == local_id
        ).first()
        my_score = mine.score if mine else None

    return RatingSummary(avg=avg, count=count, my_score=my_score)
