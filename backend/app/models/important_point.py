from datetime import datetime

from sqlalchemy import DateTime, ForeignKey, Text
from sqlalchemy.orm import Mapped, mapped_column

from app.core.database import Base


class ImportantPoint(Base):
    __tablename__ = "important_points"

    id: Mapped[int] = mapped_column(
        primary_key=True,
        index=True
    )

    material_id: Mapped[int] = mapped_column(
        ForeignKey("study_materials.id", ondelete="CASCADE"),
        nullable=False,
        index=True
    )

    point: Mapped[str] = mapped_column(
        Text,
        nullable=False
    )

    position: Mapped[int] = mapped_column(
        nullable=False
    )

    created_at: Mapped[datetime] = mapped_column(
        DateTime,
        default=datetime.utcnow,
        nullable=False
    )