from fastapi import APIRouter, Depends, status
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.database import get_db
from app.models.source_priority import DEFAULT_PRIORITY, SourcePriority
from app.models.user import User
from app.schemas.source_priority import SourcePriorityResponse, SourcePriorityUpdate
from app.utils.deps import get_current_user

router = APIRouter(prefix="/api/preferences", tags=["Preferences"])


@router.get("/sources", response_model=SourcePriorityResponse)
async def get_source_priority(
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    result = await db.execute(
        select(SourcePriority).where(SourcePriority.user_id == current_user.id)
    )
    sp = result.scalar_one_or_none()

    if sp is None:
        return SourcePriorityResponse(
            user_id=current_user.id,
            priority_order=list(DEFAULT_PRIORITY),
        )

    return SourcePriorityResponse.model_validate(sp)


@router.put("/sources", response_model=SourcePriorityResponse)
async def update_source_priority(
    data: SourcePriorityUpdate,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    result = await db.execute(
        select(SourcePriority).where(SourcePriority.user_id == current_user.id)
    )
    sp = result.scalar_one_or_none()

    if sp is None:
        sp = SourcePriority(
            user_id=current_user.id,
            priority_order=data.priority_order,
        )
        db.add(sp)
    else:
        sp.priority_order = data.priority_order

    await db.flush()
    return SourcePriorityResponse.model_validate(sp)
