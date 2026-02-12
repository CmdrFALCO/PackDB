from datetime import datetime
from typing import Optional

from sqlalchemy import Float, ForeignKey, Index, String
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.database import Base


class FieldValue(Base):
    __tablename__ = "field_values"

    id: Mapped[int] = mapped_column(primary_key=True)
    pack_id: Mapped[int] = mapped_column(ForeignKey("packs.id"), nullable=False)
    field_id: Mapped[int] = mapped_column(ForeignKey("fields.id"), nullable=False)
    value_text: Mapped[Optional[str]] = mapped_column()
    value_numeric: Mapped[Optional[float]] = mapped_column(Float)
    source_type: Mapped[str] = mapped_column(String(50), nullable=False)
    source_detail: Mapped[str] = mapped_column(nullable=False)
    contributed_by: Mapped[int] = mapped_column(ForeignKey("users.id"), nullable=False)
    created_at: Mapped[datetime] = mapped_column(default=datetime.utcnow)
    updated_at: Mapped[datetime] = mapped_column(default=datetime.utcnow, onupdate=datetime.utcnow)
    is_active: Mapped[bool] = mapped_column(default=True)

    __table_args__ = (
        Index("idx_values_pack_field", "pack_id", "field_id", "source_type"),
    )

    # Relationships
    pack: Mapped["Pack"] = relationship(back_populates="values")
    field: Mapped["Field"] = relationship(back_populates="values")
    contributor: Mapped["User"] = relationship(foreign_keys=[contributed_by])
    comments: Mapped[list["Comment"]] = relationship(back_populates="value")
