from sqlalchemy import ForeignKey
from sqlalchemy.orm import Mapped, mapped_column

from app.core.database import Base


class MockTestQuestion(Base):
    __tablename__ = "mock_test_questions"

    id: Mapped[int] = mapped_column(
        primary_key=True,
        index=True,
    )

    mock_test_id: Mapped[int] = mapped_column(
        ForeignKey("mock_tests.id", ondelete="CASCADE"),
        nullable=False,
        index=True,
    )

    question_id: Mapped[int] = mapped_column(
        ForeignKey("questions.id", ondelete="CASCADE"),
        nullable=False,
        index=True,
    )

    question_order: Mapped[int] = mapped_column(
        nullable=False,
    )