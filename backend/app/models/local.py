from sqlalchemy import Column, String, DateTime, ForeignKey, ARRAY
from sqlalchemy.orm import relationship
from sqlalchemy.dialects.postgresql import UUID
from app.database import Base
import uuid, datetime

class Local(Base):
    __tablename__ = "locals"

    id          = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    name        = Column(String, nullable=False)
    description = Column(String, nullable=True)
    category    = Column(String, nullable=False)
    address     = Column(String, nullable=True)
    city        = Column(String, nullable=True)
    phone       = Column(String, nullable=True)
    website     = Column(String, nullable=True)
    logo        = Column(String, nullable=True)
    cover_image = Column(String, nullable=True)
    created_at  = Column(DateTime, default=datetime.datetime.utcnow)

    owner_id  = Column(UUID(as_uuid=True), ForeignKey("users.id"), nullable=False)
    owner     = relationship("User", back_populates="locals")
    posts     = relationship("Post", back_populates="local")
    followers = relationship("Follow", back_populates="local")
    ratings   = relationship("Rating", back_populates="local")