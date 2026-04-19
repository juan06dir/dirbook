from sqlalchemy import Column, String, Boolean, DateTime, ForeignKey
from sqlalchemy.dialects.postgresql import UUID
from app.database import Base
import uuid, datetime


class Notification(Base):
    __tablename__ = "notifications"

    id         = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    user_id    = Column(UUID(as_uuid=True), ForeignKey("users.id", ondelete="CASCADE"), nullable=False)
    type       = Column(String, nullable=False)   # "follow" | "rating"
    message    = Column(String, nullable=False)
    local_id   = Column(UUID(as_uuid=True), nullable=True)
    local_name = Column(String, nullable=True)
    read       = Column(Boolean, default=False)
    created_at = Column(DateTime, default=datetime.datetime.utcnow)
