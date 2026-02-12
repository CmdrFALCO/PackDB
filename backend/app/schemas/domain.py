from datetime import datetime
from typing import Optional

from pydantic import BaseModel, Field


class DomainCreate(BaseModel):
    name: str = Field(min_length=1, max_length=100)
    description: Optional[str] = None
    sort_order: Optional[int] = 0


class DomainResponse(BaseModel):
    id: int
    name: str
    description: Optional[str] = None
    sort_order: int
    is_default: bool
    created_at: datetime

    model_config = {"from_attributes": True}
