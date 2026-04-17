from pydantic import BaseModel
from uuid import UUID
from datetime import datetime
from typing import Optional

class ProfessionalCreate(BaseModel):
    name:        str
    profession:  str
    bio:         Optional[str] = None
    phone:       Optional[str] = None
    website:     Optional[str] = None
    avatar:      Optional[str] = None
    cover_image: Optional[str] = None
    whatsapp:    Optional[str] = None
    facebook:    Optional[str] = None
    instagram:   Optional[str] = None

class ProfessionalUpdate(BaseModel):
    name:        Optional[str] = None
    profession:  Optional[str] = None
    bio:         Optional[str] = None
    phone:       Optional[str] = None
    website:     Optional[str] = None
    avatar:      Optional[str] = None
    cover_image: Optional[str] = None
    whatsapp:    Optional[str] = None
    facebook:    Optional[str] = None
    instagram:   Optional[str] = None

class ProfessionalOut(BaseModel):
    id: UUID
    name: str
    profession: str
    bio: Optional[str]
    phone: Optional[str]
    website: Optional[str]
    avatar: Optional[str]
    cover_image: Optional[str]
    whatsapp:   Optional[str]
    facebook:   Optional[str]
    instagram:  Optional[str]
    owner_id: UUID
    created_at: datetime

    class Config:
        from_attributes = True