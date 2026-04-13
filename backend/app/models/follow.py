from sqlalchemy import Column, DateTime, ForeignKey, UniqueConstraint
from sqlalchemy.orm import relationship
from sqlalchemy.dialects.postgresql import UUID
from app.database import Base
import uuid, datetime

class Follow(Base):
    __tablename__ = "follows"

    id         = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    user_id    = Column(UUID(as_uuid=True), ForeignKey("users.id"), nullable=False)
    local_id   = Column(UUID(as_uuid=True), ForeignKey("locals.id"), nullable=False)
    created_at = Column(DateTime, default=datetime.datetime.utcnow)

    user  = relationship("User", back_populates="follows")
    local = relationship("Local", back_populates="followers")

    __table_args__ = (
        UniqueConstraint("user_id", "local_id", name="uq_follow_user_local"),
    )
