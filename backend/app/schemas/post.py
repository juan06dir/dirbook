from pydantic import BaseModel, field_validator
from uuid import UUID
from datetime import datetime
from typing import Optional, Literal

PostType = Literal["post", "event", "discount"]

class PostCreate(BaseModel):
    post_type:    PostType = "post"
    title:        Optional[str] = None
    content:      str
    image_url:    Optional[str] = None
    local_id:     Optional[UUID] = None
    professional_id: Optional[UUID] = None
    event_start:  Optional[datetime] = None
    event_end:    Optional[datetime] = None
    discount_pct: Optional[float] = None

    @field_validator("discount_pct")
    @classmethod
    def validate_discount(cls, v):
        if v is not None and not (0 < v <= 100):
            raise ValueError("discount_pct debe estar entre 1 y 100")
        return v

class PostOut(BaseModel):
    id:           UUID
    post_type:    str
    title:        Optional[str]
    content:      str
    image_url:    Optional[str]
    local_id:     Optional[UUID]
    professional_id: Optional[UUID]
    event_start:  Optional[datetime]
    event_end:    Optional[datetime]
    discount_pct: Optional[float]
    created_at:   datetime

    class Config:
        from_attributes = True
