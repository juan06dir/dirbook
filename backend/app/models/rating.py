from sqlalchemy import Column, DateTime, ForeignKey, Integer, String, UniqueConstraint
from sqlalchemy.orm import relationship
from sqlalchemy.dialects.postgresql import UUID
from app.database import Base
import uuid, datetime

class Rating(Base):
    __tablename__ = "ratings"

    id         = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    user_id         = Column(UUID(as_uuid=True), ForeignKey("users.id"), nullable=False)
    local_id        = Column(UUID(as_uuid=True), ForeignKey("locals.id"), nullable=True)
    professional_id = Column(UUID(as_uuid=True), ForeignKey("professional_profiles.id"), nullable=True)
    score           = Column(Integer, nullable=False)   # 1 – 5
    comment         = Column(String, nullable=True)
    created_at      = Column(DateTime, default=datetime.datetime.utcnow)

    user  = relationship("User", back_populates="ratings")
    local = relationship("Local", back_populates="ratings")

    __table_args__ = (
        UniqueConstraint("user_id", "local_id", name="uq_rating_user_local"),
        UniqueConstraint("user_id", "professional_id", name="uq_rating_user_professional"),
    )
