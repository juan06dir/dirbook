from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from app.database import get_db
from app.models.post import Post
from app.models.like import PostLike
from app.models.comment import PostComment
from app.models.local import Local
from app.models.professional import ProfessionalProfile
from app.models.notification import Notification
from app.core.dependencies import get_current_user
from app.models.user import User
from typing import List, Optional
from uuid import UUID
from pydantic import BaseModel
import datetime

router = APIRouter(tags=["Social"])


# ── Likes ─────────────────────────────────────────────────────────────────────
class LikeStatus(BaseModel):
    liked: bool
    likes_count: int


def _likes_count(post_id, db) -> int:
    return db.query(PostLike).filter(PostLike.post_id == post_id).count()


@router.post("/posts/{post_id}/like", response_model=LikeStatus)
def like_post(
    post_id: UUID,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    post = db.query(Post).filter(Post.id == post_id).first()
    if not post:
        raise HTTPException(status_code=404, detail="Publicación no encontrada")
    existing = db.query(PostLike).filter(
        PostLike.user_id == current_user.id, PostLike.post_id == post_id
    ).first()
    if not existing:
        db.add(PostLike(user_id=current_user.id, post_id=post_id))
        db.commit()
        # Notificar al dueño del local/perfil (si no es uno mismo)
        owner_id = None
        if post.local_id:
            local = db.query(Local).filter(Local.id == post.local_id).first()
            owner_id = local.owner_id if local else None
        elif post.professional_id:
            prof = db.query(ProfessionalProfile).filter(
                ProfessionalProfile.id == post.professional_id
            ).first()
            owner_id = prof.owner_id if prof else None
        if owner_id and owner_id != current_user.id:
            db.add(Notification(
                user_id=owner_id, notif_type="like",
                message=f"A {current_user.name} le gustó tu publicación ❤️",
                local_id=post.local_id,
            ))
            db.commit()
    return LikeStatus(liked=True, likes_count=_likes_count(post_id, db))


@router.delete("/posts/{post_id}/like", response_model=LikeStatus)
def unlike_post(
    post_id: UUID,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    existing = db.query(PostLike).filter(
        PostLike.user_id == current_user.id, PostLike.post_id == post_id
    ).first()
    if existing:
        db.delete(existing)
        db.commit()
    return LikeStatus(liked=False, likes_count=_likes_count(post_id, db))


# ── Comentarios ───────────────────────────────────────────────────────────────
class CommentCreate(BaseModel):
    content: str


class CommentOut(BaseModel):
    id: UUID
    post_id: UUID
    user_id: UUID
    user_name: str
    user_avatar: Optional[str]
    content: str
    created_at: datetime.datetime

    model_config = {"from_attributes": True}


@router.get("/posts/{post_id}/comments", response_model=List[CommentOut])
def list_comments(
    post_id: UUID,
    skip: int = Query(0, ge=0),
    limit: int = Query(50, ge=1, le=200),
    db: Session = Depends(get_db),
):
    rows = (
        db.query(PostComment)
        .filter(PostComment.post_id == post_id)
        .order_by(PostComment.created_at.asc())
        .offset(skip)
        .limit(limit)
        .all()
    )
    return [
        CommentOut(
            id=c.id, post_id=c.post_id, user_id=c.user_id,
            user_name=c.user.name if c.user else "Usuario",
            user_avatar=c.user.avatar if c.user else None,
            content=c.content, created_at=c.created_at,
        )
        for c in rows
    ]


@router.post("/posts/{post_id}/comments", response_model=CommentOut, status_code=201)
def add_comment(
    post_id: UUID,
    data: CommentCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    text = (data.content or "").strip()
    if not text:
        raise HTTPException(status_code=400, detail="El comentario no puede estar vacío")
    if len(text) > 1000:
        raise HTTPException(status_code=400, detail="El comentario es demasiado largo")
    post = db.query(Post).filter(Post.id == post_id).first()
    if not post:
        raise HTTPException(status_code=404, detail="Publicación no encontrada")
    comment = PostComment(user_id=current_user.id, post_id=post_id, content=text)
    db.add(comment)
    db.commit()
    db.refresh(comment)

    # Notificar al dueño
    owner_id = None
    if post.local_id:
        local = db.query(Local).filter(Local.id == post.local_id).first()
        owner_id = local.owner_id if local else None
    elif post.professional_id:
        prof = db.query(ProfessionalProfile).filter(
            ProfessionalProfile.id == post.professional_id
        ).first()
        owner_id = prof.owner_id if prof else None
    if owner_id and owner_id != current_user.id:
        db.add(Notification(
            user_id=owner_id, notif_type="comment",
            message=f"{current_user.name} comentó tu publicación 💬",
            local_id=post.local_id,
        ))
        db.commit()

    return CommentOut(
        id=comment.id, post_id=comment.post_id, user_id=comment.user_id,
        user_name=current_user.name, user_avatar=current_user.avatar,
        content=comment.content, created_at=comment.created_at,
    )


@router.delete("/posts/comments/{comment_id}", status_code=204)
def delete_comment(
    comment_id: UUID,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    comment = db.query(PostComment).filter(PostComment.id == comment_id).first()
    if not comment:
        raise HTTPException(status_code=404, detail="Comentario no encontrado")
    if comment.user_id != current_user.id and not current_user.is_admin:
        raise HTTPException(status_code=403, detail="No autorizado")
    db.delete(comment)
    db.commit()
