from pydantic import BaseModel, computed_field
from uuid import UUID
from datetime import datetime
from typing import Optional

class LocalCreate(BaseModel):
    name:        str
    description: Optional[str] = None
    category:    str
    address:     Optional[str] = None
    city:        Optional[str] = None
    phone:       Optional[str] = None
    website:     Optional[str] = None
    logo:        Optional[str] = None
    cover_image: Optional[str] = None

class LocalUpdate(BaseModel):
    name:        Optional[str] = None
    description: Optional[str] = None
    category:    Optional[str] = None
    address:     Optional[str] = None
    city:        Optional[str] = None
    phone:       Optional[str] = None
    website:     Optional[str] = None
    logo:        Optional[str] = None
    cover_image: Optional[str] = None

class LocalOut(BaseModel):
    id:          UUID
    name:        str
    description: Optional[str]
    category:    str
    address:     Optional[str]
    city:        Optional[str]
    phone:       Optional[str]
    website:     Optional[str]
    logo:        Optional[str]
    cover_image: Optional[str]
    owner_id:    UUID
    created_at:  datetime

    followers_count: Optional[int] = 0
    avg_rating:      Optional[float] = None
    ratings_count:   Optional[int] = 0

    class Config:
        from_attributes = True
