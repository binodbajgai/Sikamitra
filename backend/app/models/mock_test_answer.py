from datetime import datetime

from sqlalchemy import DateTime, ForeignKey, String
from sqlalchemy.orm import Mapped, mapped_column

from app.core.database import Base


class MockTestAnswer(Base):
    __tablename__ = "mock_test_answers"

    id: Mapped[int] = mapped_column(
        primary_key=True,
        index=True,
    )

    attempt_id: Mapped[int] = mapped_column(
        ForeignKey("mock_test_attempts.id", ondelete="CASCADE"),
        nullable=False,
        index=True,
    )

    question_id: Mapped[int] = mapped_column(
        ForeignKey("questions.id", ondelete="CASCADE"),
        nullable=False,
        index=True,
    )

    selected_option: Mapped[str] = mapped_column(
        String(1),
        nullable=False,
    )

    is_correct: Mapped[bool] = mapped_column(
        nullable=False,
    )

    answered_at: Mapped[datetime] = mapped_column(
        DateTime,
        default=datetime.utcnow,
        nullable=False,
    )