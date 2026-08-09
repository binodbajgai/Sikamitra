from datetime import datetime

from sqlalchemy import DateTime, ForeignKey, Text
from sqlalchemy.orm import Mapped, mapped_column

from app.core.database import Base


class GeneratedSummary(Base):
    __tablename__ = "generated_summaries"

    id: Mapped[int] = mapped_column(
        primary_key=True,
        index=True
    )

    material_id: Mapped[int] = mapped_column(
        ForeignKey("study_materials.id", ondelete="CASCADE"),
        nullable=False,
        index=True
    )

    summary: Mapped[str] = mapped_column(
        Text,
        nullable=False
    )

    created_at: Mapped[datetime] = mapped_column(
        DateTime,
        default=datetime.utcnow,
        nullable=False
    )