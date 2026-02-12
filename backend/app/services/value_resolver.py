from sqlalchemy import func, select
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.orm import joinedload

from app.models.comment import Comment
from app.models.domain import Domain
from app.models.field import Field
from app.models.source_priority import DEFAULT_PRIORITY, SourcePriority
from app.models.value import FieldValue
from app.models.user import User
from app.schemas.value import (
    DomainWithResolvedFields,
    ResolvedFieldValue,
    ValueResponse,
)


async def _get_user_priority(db: AsyncSession, user_id: int) -> list[str]:
    result = await db.execute(
        select(SourcePriority).where(SourcePriority.user_id == user_id)
    )
    sp = result.scalar_one_or_none()
    if sp is None:
        return list(DEFAULT_PRIORITY)
    return sp.priority_order


def _sort_key(source_type: str, priority_order: list[str]) -> int:
    try:
        return priority_order.index(source_type)
    except ValueError:
        return len(priority_order)


async def resolve_pack_values(
    db: AsyncSession,
    pack_id: int,
    user_id: int,
    domain_id: int | None = None,
) -> list[DomainWithResolvedFields]:
    priority_order = await _get_user_priority(db, user_id)

    # Get all domains (optionally filtered)
    domain_q = select(Domain).order_by(Domain.sort_order)
    if domain_id is not None:
        domain_q = domain_q.where(Domain.id == domain_id)
    domains_result = await db.execute(domain_q)
    domains = domains_result.scalars().all()

    # Get all active fields for those domains
    domain_ids = [d.id for d in domains]
    fields_q = (
        select(Field)
        .where(Field.domain_id.in_(domain_ids), Field.is_active == True)  # noqa: E712
        .order_by(Field.sort_order)
    )
    fields_result = await db.execute(fields_q)
    all_fields = fields_result.scalars().all()

    # Build lookup: domain_id -> list of fields
    fields_by_domain: dict[int, list[Field]] = {}
    for f in all_fields:
        fields_by_domain.setdefault(f.domain_id, []).append(f)

    # Get all active values for this pack, joined with contributor name
    field_ids = [f.id for f in all_fields]
    if not field_ids:
        # No fields — return empty domains
        return [
            DomainWithResolvedFields(
                domain_id=d.id, domain_name=d.name, sort_order=d.sort_order, fields=[]
            )
            for d in domains
        ]

    # Subquery for comment counts
    comment_count_sq = (
        select(
            Comment.value_id,
            func.count(Comment.id).label("comment_count"),
        )
        .group_by(Comment.value_id)
        .subquery()
    )

    values_q = (
        select(FieldValue, User.display_name, comment_count_sq.c.comment_count)
        .join(User, FieldValue.contributed_by == User.id)
        .outerjoin(comment_count_sq, FieldValue.id == comment_count_sq.c.value_id)
        .where(
            FieldValue.pack_id == pack_id,
            FieldValue.field_id.in_(field_ids),
            FieldValue.is_active == True,  # noqa: E712
        )
    )
    values_result = await db.execute(values_q)
    values_rows = values_result.all()

    # Build lookup: field_id -> list of (FieldValue, contributor_name, comment_count)
    values_by_field: dict[int, list[tuple]] = {}
    for row in values_rows:
        fv = row[0]
        contributor_name = row[1]
        cc = row[2] or 0
        values_by_field.setdefault(fv.field_id, []).append((fv, contributor_name, cc))

    # Build response
    result_domains = []
    for domain in domains:
        domain_fields = fields_by_domain.get(domain.id, [])
        resolved_fields = []

        for field in domain_fields:
            field_values_raw = values_by_field.get(field.id, [])

            # Sort by priority order
            field_values_raw.sort(key=lambda x: _sort_key(x[0].source_type, priority_order))

            all_values = [
                ValueResponse(
                    id=fv.id,
                    pack_id=fv.pack_id,
                    field_id=fv.field_id,
                    value_text=fv.value_text,
                    value_numeric=fv.value_numeric,
                    source_type=fv.source_type,
                    source_detail=fv.source_detail,
                    contributed_by=fv.contributed_by,
                    contributor_name=cname,
                    is_active=fv.is_active,
                    created_at=fv.created_at,
                    updated_at=fv.updated_at,
                    comment_count=cc,
                )
                for fv, cname, cc in field_values_raw
            ]

            resolved = ResolvedFieldValue(
                field_id=field.id,
                field_name=field.name,
                display_name=field.display_name,
                unit=field.unit,
                data_type=field.data_type,
                resolved_value=all_values[0] if all_values else None,
                alternative_count=max(0, len(all_values) - 1),
                all_values=all_values,
            )
            resolved_fields.append(resolved)

        result_domains.append(
            DomainWithResolvedFields(
                domain_id=domain.id,
                domain_name=domain.name,
                sort_order=domain.sort_order,
                fields=resolved_fields,
            )
        )

    return result_domains
