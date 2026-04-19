from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from sqlalchemy.exc import IntegrityError
from app.database import get_db
from app.models.follow import Follow
from app.models.local import Local
from app.models.notification import Notification
from app.core.dependencies import get_current_user, get_optional_user
from app.models.user import User
from pydantic import BaseModel
from typing import Optional
from uuid import UUID

router = APIRouter(prefix="/follows", tags=["Follows"])


class FollowStatus(BaseModel):
    following: bool
    followers_count: int


@router.post("/{local_id}", response_model=FollowStatus)
def follow_local(
    local_id: UUID,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    local = db.query(Local).filter(Local.id == local_id).first()
    if not local:
        raise HTTPException(status_code=404, detail="Local no encontrado")

    already = db.query(Follow).filter(
        Follow.user_id == current_user.id,
        Follow.local_id == local_id
    ).first()

    if not already:
        follow = Follow(user_id=current_user.id, local_id=local_id)
        db.add(follow)
        try:
            db.commit()
            # Notificar al dueño del local (si no es el mismo usuario)
            if local.owner_id != current_user.id:
                notif = Notification(
                    user_id    = local.owner_id,
                    type       = "follow",
                    message    = f"{current_user.name} ahora sigue tu local "{local.name}"",
                    local_id   = local.id,
                    local_name = local.name,
                )
                db.add(notif)
                db.commit()
        except IntegrityError:
            db.rollback()

    count = db.query(Follow).filter(Follow.local_id == local_id).count()
    return FollowStatus(following=True, followers_count=count)


@router.delete("/{local_id}", response_model=FollowStatus)
def unfollow_local(
    local_id: UUID,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    follow = db.query(Follow).filter(
        Follow.user_id == current_user.id,
        Follow.local_id == local_id
    ).first()
    if follow:
        db.delete(follow)
        db.commit()

    count = db.query(Follow).filter(Follow.local_id == local_id).count()
    return FollowStatus(following=False, followers_count=count)


@router.get("/{local_id}/status", response_model=FollowStatus)
def follow_status(
    local_id: UUID,
    db: Session = Depends(get_db),
    current_user: Optional[User] = Depends(get_optional_user)
):
    following = False
    if current_user:
        following = db.query(Follow).filter(
            Follow.user_id == current_user.id,
            Follow.local_id == local_id
        ).first() is not None

    count = db.query(Follow).filter(Follow.local_id == local_id).count()
    return FollowStatus(following=following, followers_count=count)
