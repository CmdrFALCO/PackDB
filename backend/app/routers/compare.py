from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.database import get_db
from app.models.pack import Pack
from app.models.user import User
from app.schemas.pack import PackResponse
from app.schemas.value import CompareDomainEntry, CompareFieldEntry, CompareResponse
from app.services.value_resolver import resolve_pack_values
from app.utils.deps import get_current_user

router = APIRouter(prefix="/api", tags=["Compare"])


@router.get("/compare", response_model=CompareResponse)
async def compare_packs(
    ids: str = Query(..., description="Comma-separated pack IDs (2-3)"),
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    # Parse and validate IDs
    try:
        pack_ids = [int(x.strip()) for x in ids.split(",")]
    except ValueError:
        raise HTTPException(status_code=422, detail="ids must be comma-separated integers")

    if len(pack_ids) < 2 or len(pack_ids) > 3:
        raise HTTPException(status_code=422, detail="Must provide 2 or 3 pack IDs")

    # Fetch all packs
    packs_data = []
    for pid in pack_ids:
        result = await db.execute(
            select(Pack, User.display_name)
            .outerjoin(User, Pack.created_by == User.id)
            .where(Pack.id == pid, Pack.is_active == True)  # noqa: E712
        )
        row = result.one_or_none()
        if row is None:
            raise HTTPException(status_code=404, detail=f"Pack {pid} not found")
        pack, creator_name = row
        packs_data.append((pack, creator_name))

    # Resolve values for each pack
    resolved_by_pack = {}
    for pack, _ in packs_data:
        resolved_by_pack[pack.id] = await resolve_pack_values(db, pack.id, current_user.id)

    # Build comparison structure — use first pack's domain/field structure as reference
    reference = resolved_by_pack[pack_ids[0]]
    compare_domains = []

    for ref_domain in reference:
        compare_fields = []
        for ref_field in ref_domain.fields:
            values_by_pack = {}
            for pid in pack_ids:
                pack_domains = resolved_by_pack[pid]
                # Find matching domain and field
                value = None
                for pd in pack_domains:
                    if pd.domain_id == ref_domain.domain_id:
                        for pf in pd.fields:
                            if pf.field_id == ref_field.field_id:
                                value = pf.resolved_value
                                break
                        break
                values_by_pack[pid] = value

            compare_fields.append(
                CompareFieldEntry(
                    field_id=ref_field.field_id,
                    field_name=ref_field.field_name,
                    display_name=ref_field.display_name,
                    unit=ref_field.unit,
                    data_type=ref_field.data_type,
                    values_by_pack=values_by_pack,
                )
            )

        compare_domains.append(
            CompareDomainEntry(
                domain_id=ref_domain.domain_id,
                domain_name=ref_domain.domain_name,
                sort_order=ref_domain.sort_order,
                fields=compare_fields,
            )
        )

    pack_responses = [
        PackResponse(
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
        for pack, creator_name in packs_data
    ]

    return CompareResponse(packs=pack_responses, domains=compare_domains)
