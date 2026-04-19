from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from app.database import get_db
from app.models.notification import Notification
from app.core.dependencies import get_current_user
from app.models.user import User
from pydantic import BaseModel
from typing import List, Optional
from uuid import UUID
import datetime

router = APIRouter(prefix="/notifications", tags=["Notifications"])


class NotificationOut(BaseModel):
    id: UUID
    type: str
    message: str
    local_id: Optional[UUID]
    local_name: Optional[str]
    read: bool
    created_at: datetime.datetime

    class Config:
        from_attributes = True


@router.get("", response_model=List[NotificationOut])
def get_notifications(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    return (
        db.query(Notification)
        .filter(Notification.user_id == current_user.id)
        .order_by(Notification.created_at.desc())
        .limit(50)
        .all()
    )


@router.put("/read")
def mark_all_read(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    db.query(Notification).filter(
        Notification.user_id == current_user.id,
        Notification.read == False,  # noqa: E712
    ).update({"read": True})
    db.commit()
    return {"ok": True}
