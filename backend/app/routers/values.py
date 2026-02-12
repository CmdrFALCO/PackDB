from typing import Optional

from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy import func, select
from sqlalchemy.ext.asyncio import AsyncSession

from app.database import get_db
from app.models.comment import Comment
from app.models.domain import Domain
from app.models.field import Field
from app.models.pack import Pack
from app.models.user import User
from app.models.value import FieldValue
from app.schemas.value import (
    DomainWithResolvedFields,
    ResolvedFieldValue,
    ValueCreate,
    ValueResponse,
    ValueUpdate,
    VALID_SOURCE_TYPES,
)
from app.services.value_resolver import resolve_pack_values
from app.utils.deps import get_current_user

router = APIRouter(prefix="/api", tags=["Values"])


def _value_to_response(fv: FieldValue, contributor_name: str, comment_count: int = 0) -> ValueResponse:
    return ValueResponse(
        id=fv.id,
        pack_id=fv.pack_id,
        field_id=fv.field_id,
        value_text=fv.value_text,
        value_numeric=fv.value_numeric,
        source_type=fv.source_type,
        source_detail=fv.source_detail,
        contributed_by=fv.contributed_by,
        contributor_name=contributor_name,
        is_active=fv.is_active,
        created_at=fv.created_at,
        updated_at=fv.updated_at,
        comment_count=comment_count,
    )


@router.get("/packs/{pack_id}/values", response_model=list[DomainWithResolvedFields])
async def get_pack_values(
    pack_id: int,
    field_id: Optional[int] = Query(None),
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    # Verify pack exists and is active
    pack_result = await db.execute(
        select(Pack).where(Pack.id == pack_id, Pack.is_active == True)  # noqa: E712
    )
    if pack_result.scalar_one_or_none() is None:
        raise HTTPException(status_code=404, detail="Pack not found")

    # If field_id is provided, find its domain to narrow the query
    domain_id = None
    if field_id is not None:
        field_result = await db.execute(select(Field).where(Field.id == field_id))
        field = field_result.scalar_one_or_none()
        if field is None:
            raise HTTPException(status_code=404, detail="Field not found")
        domain_id = field.domain_id

    return await resolve_pack_values(db, pack_id, current_user.id, domain_id=domain_id)


@router.post("/packs/{pack_id}/values", response_model=ValueResponse, status_code=status.HTTP_201_CREATED)
async def create_value(
    pack_id: int,
    data: ValueCreate,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    # Verify pack exists and is active
    pack_result = await db.execute(
        select(Pack).where(Pack.id == pack_id, Pack.is_active == True)  # noqa: E712
    )
    if pack_result.scalar_one_or_none() is None:
        raise HTTPException(status_code=404, detail="Pack not found")

    # Validate source_type
    if data.source_type not in VALID_SOURCE_TYPES:
        raise HTTPException(
            status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
            detail=f"source_type must be one of: {VALID_SOURCE_TYPES}",
        )

    # Validate field exists
    field_result = await db.execute(
        select(Field).where(Field.id == data.field_id, Field.is_active == True)  # noqa: E712
    )
    field = field_result.scalar_one_or_none()
    if field is None:
        raise HTTPException(status_code=404, detail="Field not found")

    # Validate select field options
    if field.data_type == "select" and field.select_options:
        if data.value_text not in field.select_options:
            raise HTTPException(
                status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
                detail=f"value_text must be one of: {field.select_options}",
            )

    # Parse numeric value if applicable
    value_numeric = None
    if field.data_type == "number":
        try:
            value_numeric = float(data.value_text)
        except (ValueError, TypeError):
            value_numeric = None  # Don't reject — may have annotations

    fv = FieldValue(
        pack_id=pack_id,
        field_id=data.field_id,
        value_text=data.value_text,
        value_numeric=value_numeric,
        source_type=data.source_type,
        source_detail=data.source_detail,
        contributed_by=current_user.id,
    )
    db.add(fv)
    await db.flush()

    return _value_to_response(fv, current_user.display_name, 0)


@router.put("/values/{value_id}", response_model=ValueResponse)
async def update_value(
    value_id: int,
    data: ValueUpdate,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    # Get value with contributor name and comment count
    comment_count_sq = (
        select(func.count(Comment.id))
        .where(Comment.value_id == value_id)
        .correlate_except(Comment)
        .scalar_subquery()
    )

    result = await db.execute(
        select(FieldValue, User.display_name, comment_count_sq)
        .join(User, FieldValue.contributed_by == User.id)
        .where(FieldValue.id == value_id, FieldValue.is_active == True)  # noqa: E712
    )
    row = result.one_or_none()
    if row is None:
        raise HTTPException(status_code=404, detail="Value not found")

    fv, contributor_name, cc = row

    update_data = data.model_dump(exclude_unset=True)
    if "value_text" in update_data:
        fv.value_text = update_data["value_text"]
        # Re-parse numeric if field is number type
        field_result = await db.execute(select(Field).where(Field.id == fv.field_id))
        field = field_result.scalar_one_or_none()
        if field and field.data_type == "number":
            try:
                fv.value_numeric = float(update_data["value_text"])
            except (ValueError, TypeError):
                fv.value_numeric = None
    if "source_detail" in update_data:
        fv.source_detail = update_data["source_detail"]

    await db.flush()
    return _value_to_response(fv, contributor_name, cc or 0)


@router.delete("/values/{value_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_value(
    value_id: int,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    result = await db.execute(
        select(FieldValue).where(FieldValue.id == value_id, FieldValue.is_active == True)  # noqa: E712
    )
    fv = result.scalar_one_or_none()
    if fv is None:
        raise HTTPException(status_code=404, detail="Value not found")

    fv.is_active = False
    await db.flush()
