from datetime import datetime
from typing import Optional

from pydantic import BaseModel, Field


class CommentCreate(BaseModel):
    text: str = Field(min_length=1)


class CommentResponse(BaseModel):
    id: int
    value_id: int
    author_id: int
    author_name: Optional[str] = None
    text: str
    created_at: datetime

    model_config = {"from_attributes": True}
