from sqlalchemy import Column, String, DateTime, Boolean
from sqlalchemy.orm import relationship
from sqlalchemy.dialects.postgresql import UUID
from app.database import Base
import uuid, datetime

class User(Base):
    __tablename__ = "users"

    id       = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    name     = Column(String, nullable=False)
    email    = Column(String, unique=True, nullable=False, index=True)
    password = Column(String, nullable=False)
    avatar   = Column(String, nullable=True)
    is_active  = Column(Boolean, default=True)
    is_admin   = Column(Boolean, default=False)
    is_blocked = Column(Boolean, default=False)
    created_at = Column(DateTime, default=datetime.datetime.utcnow)

    locals                = relationship("Local", back_populates="owner")
    professional_profiles = relationship("ProfessionalProfile", back_populates="owner")
    follows               = relationship("Follow", back_populates="user")
    ratings               = relationship("Rating", back_populates="user")