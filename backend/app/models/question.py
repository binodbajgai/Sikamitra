from datetime import datetime

from sqlalchemy import DateTime, ForeignKey, String, Text
from sqlalchemy.orm import Mapped, mapped_column

from app.core.database import Base


class Question(Base):
    __tablename__ = "questions"

    id: Mapped[int] = mapped_column(
        primary_key=True,
        index=True
    )

    material_id: Mapped[int] = mapped_column(
        ForeignKey("study_materials.id", ondelete="CASCADE"),
        nullable=False,
        index=True
    )

    question: Mapped[str] = mapped_column(
        Text,
        nullable=False
    )

    option_a: Mapped[str] = mapped_column(
        String(500),
        nullable=False
    )

    option_b: Mapped[str] = mapped_column(
        String(500),
        nullable=False
    )

    option_c: Mapped[str] = mapped_column(
        String(500),
        nullable=False
    )

    option_d: Mapped[str] = mapped_column(
        String(500),
        nullable=False
    )

    correct_option: Mapped[str] = mapped_column(
        String(1),
        nullable=False
    )

    explanation: Mapped[str | None] = mapped_column(
        Text,
        nullable=True
    )

    created_at: Mapped[datetime] = mapped_column(
        DateTime,
        default=datetime.utcnow,
        nullable=False
    )