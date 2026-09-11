from datetime import datetime, timedelta
from uuid import uuid4

from sqlalchemy import Column, String, DateTime, Integer, Index
from sqlalchemy.orm import Mapped, mapped_column

from app.models.base import Base

class PasswordReset(Base):
    __tablename__ = "password_resets"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, index=True)
    email: Mapped[str] = mapped_column(String(255), nullable=False, index=True)
    token: Mapped[str] = mapped_column(String(255), nullable=False, unique=True, index=True)
    expires_at: Mapped[datetime] = mapped_column(DateTime, nullable=False)

    __table_args__ = (Index("ix_password_resets_token", "token"),)

    @staticmethod
    def generate(email: str, ttl_minutes: int = 30) -> "PasswordReset":
        return PasswordReset(
            email=email,
            token=str(uuid4()),
            expires_at=datetime.utcnow() + timedelta(minutes=ttl_minutes),
        )
