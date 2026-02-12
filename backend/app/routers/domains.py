from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.database import get_db
from app.models.domain import Domain
from app.models.field import Field
from app.models.user import User
from app.schemas.domain import DomainCreate, DomainResponse
from app.schemas.field import FieldCreate, FieldResponse
from app.utils.deps import get_current_user

router = APIRouter(prefix="/api/domains", tags=["Domains"])


@router.get("/", response_model=list[DomainResponse])
async def list_domains(db: AsyncSession = Depends(get_db)):
    result = await db.execute(select(Domain).order_by(Domain.sort_order))
    domains = result.scalars().all()
    return [DomainResponse.model_validate(d) for d in domains]


@router.post("/", response_model=DomainResponse, status_code=status.HTTP_201_CREATED)
async def create_domain(
    data: DomainCreate,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    # Check for duplicate name
    result = await db.execute(select(Domain).where(Domain.name == data.name))
    if result.scalar_one_or_none() is not None:
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail="A domain with this name already exists",
        )

    domain = Domain(
        name=data.name,
        description=data.description,
        sort_order=data.sort_order or 0,
        is_default=False,
        created_by=current_user.id,
    )
    db.add(domain)
    await db.flush()

    return DomainResponse.model_validate(domain)


@router.get("/{domain_id}/fields", response_model=list[FieldResponse])
async def list_domain_fields(domain_id: int, db: AsyncSession = Depends(get_db)):
    # Verify domain exists
    domain_result = await db.execute(select(Domain).where(Domain.id == domain_id))
    if domain_result.scalar_one_or_none() is None:
        raise HTTPException(status_code=404, detail="Domain not found")

    result = await db.execute(
        select(Field)
        .where(Field.domain_id == domain_id, Field.is_active == True)  # noqa: E712
        .order_by(Field.sort_order)
    )
    fields = result.scalars().all()
    return [FieldResponse.model_validate(f) for f in fields]


@router.post("/{domain_id}/fields", response_model=FieldResponse, status_code=status.HTTP_201_CREATED)
async def create_field(
    domain_id: int,
    data: FieldCreate,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    # Verify domain exists
    domain_result = await db.execute(select(Domain).where(Domain.id == domain_id))
    if domain_result.scalar_one_or_none() is None:
        raise HTTPException(status_code=404, detail="Domain not found")

    # Check for duplicate field name in this domain
    dup_result = await db.execute(
        select(Field).where(Field.domain_id == domain_id, Field.name == data.name)
    )
    if dup_result.scalar_one_or_none() is not None:
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail="A field with this name already exists in this domain",
        )

    field = Field(
        domain_id=domain_id,
        name=data.name,
        display_name=data.display_name,
        unit=data.unit,
        data_type=data.data_type,
        select_options=data.select_options,
        sort_order=data.sort_order or 0,
        description=data.description,
        created_by=current_user.id,
    )
    db.add(field)
    await db.flush()

    return FieldResponse.model_validate(field)
