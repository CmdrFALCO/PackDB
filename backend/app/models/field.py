from datetime import datetime
from typing import Any, Optional

from sqlalchemy import ForeignKey, String, UniqueConstraint
from sqlalchemy.dialects.postgresql import JSONB
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.database import Base


class Field(Base):
    __tablename__ = "fields"

    id: Mapped[int] = mapped_column(primary_key=True)
    domain_id: Mapped[int] = mapped_column(ForeignKey("domains.id"), nullable=False)
    name: Mapped[str] = mapped_column(String(200), nullable=False)
    display_name: Mapped[str] = mapped_column(String(200), nullable=False)
    unit: Mapped[Optional[str]] = mapped_column(String(50))
    data_type: Mapped[str] = mapped_column(String(50), default="text")
    select_options: Mapped[Optional[Any]] = mapped_column(JSONB)
    sort_order: Mapped[int] = mapped_column(default=0)
    description: Mapped[Optional[str]] = mapped_column()
    created_by: Mapped[Optional[int]] = mapped_column(ForeignKey("users.id"))
    is_active: Mapped[bool] = mapped_column(default=True)
    created_at: Mapped[datetime] = mapped_column(default=datetime.utcnow)

    __table_args__ = (
        UniqueConstraint("domain_id", "name", name="uq_domain_field_name"),
    )

    # Relationships
    domain: Mapped["Domain"] = relationship(back_populates="fields")
    values: Mapped[list["FieldValue"]] = relationship(back_populates="field")
