from pydantic import BaseModel, field_validator

from app.schemas.value import VALID_SOURCE_TYPES


class SourcePriorityResponse(BaseModel):
    user_id: int
    priority_order: list[str]

    model_config = {"from_attributes": True}


class SourcePriorityUpdate(BaseModel):
    priority_order: list[str]

    @field_validator("priority_order")
    @classmethod
    def validate_priority_order(cls, v: list[str]) -> list[str]:
        if len(v) != len(VALID_SOURCE_TYPES):
            raise ValueError(f"Must contain exactly {len(VALID_SOURCE_TYPES)} source types")
        if set(v) != set(VALID_SOURCE_TYPES):
            raise ValueError(f"Must contain exactly these source types: {VALID_SOURCE_TYPES}")
        if len(v) != len(set(v)):
            raise ValueError("Duplicate source types are not allowed")
        return v
