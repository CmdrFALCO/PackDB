from datetime import datetime
from typing import Optional

from pydantic import BaseModel, Field


MARKET_OPTIONS = ["EU", "China", "USA", "Global"]


class PackCreate(BaseModel):
    oem: str = Field(min_length=1, max_length=100)
    model: str = Field(min_length=1, max_length=200)
    year: int
    variant: Optional[str] = Field(None, max_length=200)
    market: Optional[str] = None
    fuel_type: Optional[str] = Field(None, max_length=50)
    vehicle_class: Optional[str] = Field(None, max_length=50)
    drivetrain: Optional[str] = Field(None, max_length=50)
    platform: Optional[str] = Field(None, max_length=100)


class PackUpdate(BaseModel):
    oem: Optional[str] = Field(None, min_length=1, max_length=100)
    model: Optional[str] = Field(None, min_length=1, max_length=200)
    year: Optional[int] = None
    variant: Optional[str] = Field(None, max_length=200)
    market: Optional[str] = None
    fuel_type: Optional[str] = Field(None, max_length=50)
    vehicle_class: Optional[str] = Field(None, max_length=50)
    drivetrain: Optional[str] = Field(None, max_length=50)
    platform: Optional[str] = Field(None, max_length=100)


class PackResponse(BaseModel):
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

    model_config = {"from_attributes": True}


class PackListResponse(BaseModel):
    items: list[PackResponse]
    total: int
    page: int
    page_size: int
