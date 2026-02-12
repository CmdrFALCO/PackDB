from typing import Optional

from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy import func, or_, select
from sqlalchemy.ext.asyncio import AsyncSession

from app.database import get_db
from app.models.pack import Pack
from app.models.user import User
from app.schemas.pack import PackCreate, PackListResponse, PackResponse, PackUpdate
from app.schemas.value import PackDetailResponse
from app.services.value_resolver import resolve_pack_values
from app.utils.deps import get_current_user

router = APIRouter(prefix="/api/packs", tags=["Packs"])


def _pack_to_response(pack: Pack, creator_name: Optional[str] = None) -> PackResponse:
    return PackResponse(
        id=pack.id,
        oem=pack.oem,
        model=pack.model,
        year=pack.year,
        variant=pack.variant,
        market=pack.market,
        fuel_type=pack.fuel_type,
        vehicle_class=pack.vehicle_class,
        drivetrain=pack.drivetrain,
        platform=pack.platform,
        is_active=pack.is_active,
        created_by=pack.created_by,
        created_by_name=creator_name,
        created_at=pack.created_at,
        updated_at=pack.updated_at,
    )


@router.get("/", response_model=PackListResponse)
async def list_packs(
    oem: Optional[str] = None,
    model: Optional[str] = None,
    market: Optional[str] = None,
    fuel_type: Optional[str] = None,
    vehicle_class: Optional[str] = None,
    drivetrain: Optional[str] = None,
    platform: Optional[str] = None,
    search: Optional[str] = None,
    page: int = Query(1, ge=1),
    page_size: int = Query(20, ge=1, le=100),
    sort_by: str = Query("created_at"),
    sort_dir: str = Query("desc"),
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    query = select(Pack, User.display_name).outerjoin(User, Pack.created_by == User.id).where(Pack.is_active == True)  # noqa: E712

    # Filters
    if oem:
        query = query.where(Pack.oem == oem)
    if model:
        query = query.where(Pack.model == model)
    if market:
        query = query.where(Pack.market == market)
    if fuel_type:
        query = query.where(Pack.fuel_type == fuel_type)
    if vehicle_class:
        query = query.where(Pack.vehicle_class == vehicle_class)
    if drivetrain:
        query = query.where(Pack.drivetrain == drivetrain)
    if platform:
        query = query.where(Pack.platform == platform)

    # Text search
    if search:
        pattern = f"%{search}%"
        query = query.where(
            or_(
                Pack.oem.ilike(pattern),
                Pack.model.ilike(pattern),
                Pack.variant.ilike(pattern),
                Pack.platform.ilike(pattern),
            )
        )

    # Count total before pagination
    count_query = select(func.count()).select_from(
        query.with_only_columns(Pack.id).subquery()
    )
    total_result = await db.execute(count_query)
    total = total_result.scalar_one()

    # Sorting
    sort_column = getattr(Pack, sort_by, Pack.created_at)
    if sort_dir == "asc":
        query = query.order_by(sort_column.asc())
    else:
        query = query.order_by(sort_column.desc())

    # Pagination
    offset = (page - 1) * page_size
    query = query.offset(offset).limit(page_size)

    result = await db.execute(query)
    rows = result.all()

    items = [_pack_to_response(pack, creator_name) for pack, creator_name in rows]

    return PackListResponse(items=items, total=total, page=page, page_size=page_size)


@router.post("/", response_model=PackResponse, status_code=status.HTTP_201_CREATED)
async def create_pack(
    data: PackCreate,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    # Check for duplicate
    dup_query = select(Pack).where(
        Pack.oem == data.oem,
        Pack.model == data.model,
        Pack.variant == data.variant,
        Pack.year == data.year,
        Pack.market == data.market,
    )
    dup_result = await db.execute(dup_query)
    if dup_result.scalar_one_or_none() is not None:
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail="A pack with this OEM, model, variant, year, and market already exists",
        )

    pack = Pack(
        oem=data.oem,
        model=data.model,
        year=data.year,
        variant=data.variant,
        market=data.market,
        fuel_type=data.fuel_type,
        vehicle_class=data.vehicle_class,
        drivetrain=data.drivetrain,
        platform=data.platform,
        created_by=current_user.id,
        is_active=True,
    )
    db.add(pack)
    await db.flush()

    return _pack_to_response(pack, current_user.display_name)


@router.get("/{pack_id}", response_model=PackDetailResponse)
async def get_pack_detail(
    pack_id: int,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    result = await db.execute(
        select(Pack, User.display_name)
        .outerjoin(User, Pack.created_by == User.id)
        .where(Pack.id == pack_id, Pack.is_active == True)  # noqa: E712
    )
    row = result.one_or_none()
    if row is None:
        raise HTTPException(status_code=404, detail="Pack not found")

    pack, creator_name = row

    domains = await resolve_pack_values(db, pack_id, current_user.id)

    return PackDetailResponse(
        id=pack.id,
        oem=pack.oem,
        model=pack.model,
        year=pack.year,
        variant=pack.variant,
        market=pack.market,
        fuel_type=pack.fuel_type,
        vehicle_class=pack.vehicle_class,
        drivetrain=pack.drivetrain,
        platform=pack.platform,
        is_active=pack.is_active,
        created_by=pack.created_by,
        created_by_name=creator_name,
        created_at=pack.created_at,
        updated_at=pack.updated_at,
        domains=domains,
    )


@router.put("/{pack_id}", response_model=PackResponse)
async def update_pack(
    pack_id: int,
    data: PackUpdate,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    result = await db.execute(
        select(Pack, User.display_name)
        .outerjoin(User, Pack.created_by == User.id)
        .where(Pack.id == pack_id, Pack.is_active == True)  # noqa: E712
    )
    row = result.one_or_none()
    if row is None:
        raise HTTPException(status_code=404, detail="Pack not found")

    pack, creator_name = row

    update_data = data.model_dump(exclude_unset=True)
    for key, value in update_data.items():
        setattr(pack, key, value)

    await db.flush()
    return _pack_to_response(pack, creator_name)


@router.delete("/{pack_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_pack(
    pack_id: int,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    result = await db.execute(
        select(Pack).where(Pack.id == pack_id, Pack.is_active == True)  # noqa: E712
    )
    pack = result.scalar_one_or_none()
    if pack is None:
        raise HTTPException(status_code=404, detail="Pack not found")

    pack.is_active = False
    await db.flush()
