from pydantic import BaseModel
from uuid import UUID
from datetime import datetime
from typing import Optional

class ProfessionalCreate(BaseModel):
    name: str
    profession: str
    bio: Optional[str] = None
    phone: Optional[str] = None
    website: Optional[str] = None

class ProfessionalUpdate(BaseModel):
    name: Optional[str] = None
    profession: Optional[str] = None
    bio: Optional[str] = None
    phone: Optional[str] = None
    website: Optional[str] = None

class ProfessionalOut(BaseModel):
    id: UUID
    name: str
    profession: str
    bio: Optional[str]
    phone: Optional[str]
    website: Optional[str]
    avatar: Optional[str]
    cover_image: Optional[str]
    owner_id: UUID
    created_at: datetime

    class Config:
        from_attributes = True