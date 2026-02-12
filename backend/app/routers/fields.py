from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.database import get_db
from app.models.field import Field
from app.models.user import User
from app.schemas.field import FieldResponse, FieldUpdate
from app.utils.deps import get_current_user

router = APIRouter(prefix="/api/fields", tags=["Fields"])


@router.put("/{field_id}", response_model=FieldResponse)
async def update_field(
    field_id: int,
    data: FieldUpdate,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    result = await db.execute(
        select(Field).where(Field.id == field_id, Field.is_active == True)  # noqa: E712
    )
    field = result.scalar_one_or_none()
    if field is None:
        raise HTTPException(status_code=404, detail="Field not found")

    update_data = data.model_dump(exclude_unset=True)
    for key, value in update_data.items():
        setattr(field, key, value)

    await db.flush()
    return FieldResponse.model_validate(field)


@router.delete("/{field_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_field(
    field_id: int,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    result = await db.execute(
        select(Field).where(Field.id == field_id, Field.is_active == True)  # noqa: E712
    )
    field = result.scalar_one_or_none()
    if field is None:
        raise HTTPException(status_code=404, detail="Field not found")

    field.is_active = False
    await db.flush()
