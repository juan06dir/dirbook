from sqlalchemy import Column, String, DateTime, ForeignKey, Text, Float, Integer
from sqlalchemy.orm import relationship
from sqlalchemy.dialects.postgresql import UUID
from app.database import Base
import uuid, datetime

class Post(Base):
    __tablename__ = "posts"

    id           = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    post_type    = Column(String, nullable=False, server_default="post")   # post | event | discount
    title        = Column(String, nullable=True)
    content      = Column(Text, nullable=False)
    image_url    = Column(String, nullable=True)
    event_start  = Column(DateTime, nullable=True)
    event_end    = Column(DateTime, nullable=True)
    discount_pct = Column(Float, nullable=True)
    created_at   = Column(DateTime, default=datetime.datetime.utcnow)

    local_id         = Column(UUID(as_uuid=True), ForeignKey("locals.id"), nullable=True)
    professional_id  = Column(UUID(as_uuid=True), ForeignKey("professional_profiles.id"), nullable=True)

    local        = relationship("Local", back_populates="posts")
    professional = relationship("ProfessionalProfile", back_populates="posts")
