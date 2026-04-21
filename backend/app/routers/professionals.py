from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from sqlalchemy import func
from app.database import get_db
from app.models.professional import ProfessionalProfile
from app.models.rating import Rating
from app.schemas.professional import ProfessionalCreate, ProfessionalUpdate, ProfessionalOut
from app.core.dependencies import get_current_user
from app.models.user import User
from typing import List, Optional
from uuid import UUID


def _enrich(profile: ProfessionalProfile, db: Session) -> ProfessionalOut:
    """Agrega avg_rating y ratings_count al perfil profesional."""
    result = db.query(
        func.avg(Rating.score).label("avg"),
        func.count(Rating.id).label("cnt"),
    ).filter(Rating.professional_id == profile.id).one()
    data = ProfessionalOut.model_validate(profile)
    data.avg_rating    = round(float(result.avg), 1) if result.avg else None
    data.ratings_count = result.cnt or 0
    return data

router = APIRouter(prefix="/professionals", tags=["Perfiles Profesionales"])


@router.get("", response_model=List[ProfessionalOut])
def get_professionals(
    search:     Optional[str] = Query(None),
    profession: Optional[str] = Query(None),
    skip:  int = Query(0, ge=0),
    limit: int = Query(20, ge=1, le=100),
    db: Session = Depends(get_db)
):
    query = db.query(ProfessionalProfile)
    if search:
        query = query.filter(
            ProfessionalProfile.name.ilike(f"%{search}%") |
            ProfessionalProfile.bio.ilike(f"%{search}%")
        )
    if profession:
        query = query.filter(ProfessionalProfile.profession.ilike(f"%{profession}%"))
    profiles = query.order_by(ProfessionalProfile.created_at.desc()).offset(skip).limit(limit).all()
    return [_enrich(p, db) for p in profiles]


@router.post("", response_model=ProfessionalOut, status_code=201)
def create_professional(
    data: ProfessionalCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    profile = ProfessionalProfile(**data.model_dump(), owner_id=current_user.id)
    db.add(profile)
    db.commit()
    db.refresh(profile)
    return _enrich(profile, db)

@router.get("/mine", response_model=List[ProfessionalOut])
def get_my_professionals(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    profiles = db.query(ProfessionalProfile).filter(ProfessionalProfile.owner_id == current_user.id).all()
    return [_enrich(p, db) for p in profiles]

@router.get("/{profile_id}", response_model=ProfessionalOut)
def get_professional(profile_id: UUID, db: Session = Depends(get_db)):
    profile = db.query(ProfessionalProfile).filter(ProfessionalProfile.id == profile_id).first()
    if not profile:
        raise HTTPException(status_code=404, detail="Perfil no encontrado")
    return _enrich(profile, db)

@router.put("/{profile_id}", response_model=ProfessionalOut)
def update_professional(
    profile_id: UUID,
    data: ProfessionalUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    profile = db.query(ProfessionalProfile).filter(
        ProfessionalProfile.id == profile_id,
        ProfessionalProfile.owner_id == current_user.id
    ).first()
    if not profile:
        raise HTTPException(status_code=404, detail="Perfil no encontrado o no autorizado")
    for key, value in data.model_dump(exclude_unset=True).items():
        setattr(profile, key, value)
    db.commit()
    db.refresh(profile)
    return _enrich(profile, db)

@router.delete("/{profile_id}", status_code=204)
def delete_professional(
    profile_id: UUID,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    profile = db.query(ProfessionalProfile).filter(
        ProfessionalProfile.id == profile_id,
        ProfessionalProfile.owner_id == current_user.id
    ).first()
    if not profile:
        raise HTTPException(status_code=404, detail="Perfil no encontrado o no autorizado")
    from app.models.post import Post
    db.query(Post).filter(Post.professional_id == profile_id).delete(synchronize_session=False)
    db.delete(profile)
    db.commit()