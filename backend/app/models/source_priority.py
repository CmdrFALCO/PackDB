from typing import Any

from sqlalchemy import ForeignKey
from sqlalchemy.dialects.postgresql import JSONB
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.database import Base

DEFAULT_PRIORITY = [
    "teardown", "a2mac1", "oem", "regulatory",
    "cad", "calculated", "press", "user",
]


class SourcePriority(Base):
    __tablename__ = "source_priorities"

    user_id: Mapped[int] = mapped_column(ForeignKey("users.id"), primary_key=True)
    priority_order: Mapped[Any] = mapped_column(JSONB, default=DEFAULT_PRIORITY)

    # Relationships
    user: Mapped["User"] = relationship(back_populates="source_priority")
