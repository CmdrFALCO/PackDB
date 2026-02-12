from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.database import get_db
from app.models.comment import Comment
from app.models.user import User
from app.models.value import FieldValue
from app.schemas.comment import CommentCreate, CommentResponse
from app.utils.deps import get_current_user

router = APIRouter(prefix="/api", tags=["Comments"])


@router.get("/values/{value_id}/comments", response_model=list[CommentResponse])
async def list_comments(
    value_id: int,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    # Verify value exists
    value_result = await db.execute(
        select(FieldValue).where(FieldValue.id == value_id, FieldValue.is_active == True)  # noqa: E712
    )
    if value_result.scalar_one_or_none() is None:
        raise HTTPException(status_code=404, detail="Value not found")

    result = await db.execute(
        select(Comment, User.display_name)
        .join(User, Comment.author_id == User.id)
        .where(Comment.value_id == value_id)
        .order_by(Comment.created_at.asc())
    )
    rows = result.all()

    return [
        CommentResponse(
            id=comment.id,
            value_id=comment.value_id,
            author_id=comment.author_id,
            author_name=display_name,
            text=comment.text,
            created_at=comment.created_at,
        )
        for comment, display_name in rows
    ]


@router.post("/values/{value_id}/comments", response_model=CommentResponse, status_code=status.HTTP_201_CREATED)
async def create_comment(
    value_id: int,
    data: CommentCreate,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    # Verify value exists
    value_result = await db.execute(
        select(FieldValue).where(FieldValue.id == value_id, FieldValue.is_active == True)  # noqa: E712
    )
    if value_result.scalar_one_or_none() is None:
        raise HTTPException(status_code=404, detail="Value not found")

    comment = Comment(
        value_id=value_id,
        author_id=current_user.id,
        text=data.text,
    )
    db.add(comment)
    await db.flush()

    return CommentResponse(
        id=comment.id,
        value_id=comment.value_id,
        author_id=comment.author_id,
        author_name=current_user.display_name,
        text=comment.text,
        created_at=comment.created_at,
    )
