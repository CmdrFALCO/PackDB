from datetime import datetime
from typing import Optional

from sqlalchemy import ForeignKey, String
from sqlalchemy.orm import Mapped, mapped_column

from app.database import Base


class Component(Base):
    __tablename__ = "components"

    id: Mapped[int] = mapped_column(primary_key=True)
    name: Mapped[str] = mapped_column(String(200), nullable=False)
    component_type: Mapped[Optional[str]] = mapped_column(String(100))
    description: Mapped[Optional[str]] = mapped_column()
    created_by: Mapped[Optional[int]] = mapped_column(ForeignKey("users.id"))
    created_at: Mapped[datetime] = mapped_column(default=datetime.utcnow)


class PackComponent(Base):
    __tablename__ = "pack_components"

    pack_id: Mapped[int] = mapped_column(ForeignKey("packs.id"), primary_key=True)
    component_id: Mapped[int] = mapped_column(ForeignKey("components.id"), primary_key=True)
    domain_id: Mapped[Optional[int]] = mapped_column(ForeignKey("domains.id"))
    notes: Mapped[Optional[str]] = mapped_column()
