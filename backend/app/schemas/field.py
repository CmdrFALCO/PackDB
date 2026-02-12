from datetime import datetime
from typing import Any, Optional

from pydantic import BaseModel, Field, model_validator


DATA_TYPE_OPTIONS = ["text", "number", "select"]


class FieldCreate(BaseModel):
    name: str = Field(min_length=1, max_length=200)
    display_name: str = Field(min_length=1, max_length=200)
    unit: Optional[str] = Field(None, max_length=50)
    data_type: str = "text"
    select_options: Optional[list[str]] = None
    description: Optional[str] = None
    sort_order: Optional[int] = 0

    @model_validator(mode="after")
    def validate_select_options(self):
        if self.data_type not in DATA_TYPE_OPTIONS:
            raise ValueError(f"data_type must be one of: {DATA_TYPE_OPTIONS}")
        if self.data_type == "select" and not self.select_options:
            raise ValueError("select_options is required when data_type is 'select'")
        return self


class FieldUpdate(BaseModel):
    name: Optional[str] = Field(None, min_length=1, max_length=200)
    display_name: Optional[str] = Field(None, min_length=1, max_length=200)
    unit: Optional[str] = Field(None, max_length=50)
    data_type: Optional[str] = None
    select_options: Optional[list[str]] = None
    description: Optional[str] = None
    sort_order: Optional[int] = None


class FieldResponse(BaseModel):
    id: int
    domain_id: int
    name: str
    display_name: str
    unit: Optional[str] = None
    data_type: str
    select_options: Optional[Any] = None
    sort_order: int
    description: Optional[str] = None
    is_active: bool
    created_by: Optional[int] = None
    created_at: datetime

    model_config = {"from_attributes": True}
