from datetime import datetime
from typing import Optional

from sqlalchemy import ForeignKey, String, UniqueConstraint
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.database import Base


class Pack(Base):
    __tablename__ = "packs"

    id: Mapped[int] = mapped_column(primary_key=True)
    oem: Mapped[str] = mapped_column(String(100), nullable=False)
    model: Mapped[str] = mapped_column(String(200), nullable=False)
    variant: Mapped[Optional[str]] = mapped_column(String(200))
    year: Mapped[int] = mapped_column(nullable=False)
    market: Mapped[Optional[str]] = mapped_column(String(50))
    fuel_type: Mapped[Optional[str]] = mapped_column(String(50))
    vehicle_class: Mapped[Optional[str]] = mapped_column(String(50))
    drivetrain: Mapped[Optional[str]] = mapped_column(String(50))
    platform: Mapped[Optional[str]] = mapped_column(String(100))
    is_active: Mapped[bool] = mapped_column(default=True)
    created_by: Mapped[Optional[int]] = mapped_column(ForeignKey("users.id"))
    created_at: Mapped[datetime] = mapped_column(default=datetime.utcnow)
    updated_at: Mapped[datetime] = mapped_column(default=datetime.utcnow, onupdate=datetime.utcnow)

    __table_args__ = (
        UniqueConstraint("oem", "model", "variant", "year", "market", name="uq_pack_identity"),
    )

    # Relationships
    creator: Mapped[Optional["User"]] = relationship(back_populates="packs", foreign_keys=[created_by])
    values: Mapped[list["FieldValue"]] = relationship(back_populates="pack")
