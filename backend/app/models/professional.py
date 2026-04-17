from sqlalchemy import Column, String, DateTime, ForeignKey
from sqlalchemy.orm import relationship
from sqlalchemy.dialects.postgresql import UUID
from app.database import Base
import uuid, datetime

class ProfessionalProfile(Base):
    __tablename__ = "professional_profiles"

    id         = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    name       = Column(String, nullable=False)
    profession = Column(String, nullable=False)
    bio        = Column(String, nullable=True)
    phone      = Column(String, nullable=True)
    website    = Column(String, nullable=True)
    avatar     = Column(String, nullable=True)
    cover_image = Column(String, nullable=True)
    whatsapp   = Column(String, nullable=True)
    facebook   = Column(String, nullable=True)
    instagram  = Column(String, nullable=True)
    created_at  = Column(DateTime, default=datetime.datetime.utcnow)

    owner_id = Column(UUID(as_uuid=True), ForeignKey("users.id"), nullable=False)
    owner    = relationship("User", back_populates="professional_profiles")
    posts    = relationship("Post", back_populates="professional")