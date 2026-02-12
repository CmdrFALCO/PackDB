from datetime import datetime
from typing import Any, Optional

from pydantic import BaseModel, Field


VALID_SOURCE_TYPES = [
    "teardown", "a2mac1", "oem", "regulatory",
    "cad", "calculated", "press", "user",
]


class ValueCreate(BaseModel):
    field_id: int
    value_text: str = Field(min_length=1)
    source_type: str
    source_detail: str = Field(min_length=1)


class ValueUpdate(BaseModel):
    value_text: Optional[str] = Field(None, min_length=1)
    source_detail: Optional[str] = Field(None, min_length=1)


class ValueResponse(BaseModel):
    id: int
    pack_id: int
    field_id: int
    value_text: Optional[str] = None
    value_numeric: Optional[float] = None
    source_type: str
    source_detail: str
    contributed_by: int
    contributor_name: Optional[str] = None
    is_active: bool
    created_at: datetime
    updated_at: datetime
    comment_count: int = 0

    model_config = {"from_attributes": True}


class ResolvedFieldValue(BaseModel):
    field_id: int
    field_name: str
    display_name: str
    unit: Optional[str] = None
    data_type: str
    resolved_value: Optional[ValueResponse] = None
    alternative_count: int = 0
    all_values: list[ValueResponse] = []


class DomainWithResolvedFields(BaseModel):
    domain_id: int
    domain_name: str
    sort_order: int
    fields: list[ResolvedFieldValue] = []


class PackDetailResponse(BaseModel):
    id: int
    oem: str
    model: str
    year: int
    variant: Optional[str] = None
    market: Optional[str] = None
    fuel_type: Optional[str] = None
    vehicle_class: Optional[str] = None
    drivetrain: Optional[str] = None
    platform: Optional[str] = None
    is_active: bool
    created_by: Optional[int] = None
    created_by_name: Optional[str] = None
    created_at: datetime
    updated_at: datetime
    domains: list[DomainWithResolvedFields] = []

    model_config = {"from_attributes": True}


class CompareFieldEntry(BaseModel):
    field_id: int
    field_name: str
    display_name: str
    unit: Optional[str] = None
    data_type: str
    values_by_pack: dict[int, Optional[ValueResponse]] = {}


class CompareDomainEntry(BaseModel):
    domain_id: int
    domain_name: str
    sort_order: int
    fields: list[CompareFieldEntry] = []


class CompareResponse(BaseModel):
    packs: list["PackResponse"] = []
    domains: list[CompareDomainEntry] = []


# Avoid circular import — use forward ref
from app.schemas.pack import PackResponse  # noqa: E402
CompareResponse.model_rebuild()
