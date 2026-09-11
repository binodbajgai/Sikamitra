from datetime import datetime
from sqlalchemy.orm import Session
from app.models.password_reset import PasswordReset


def create_reset(db: Session, email: str, ttl_minutes: int = 30) -> PasswordReset:
    pr = PasswordReset.generate(email, ttl_minutes)
    db.add(pr)
    db.commit()
    db.refresh(pr)
    return pr


def get_valid_reset(db: Session, token: str) -> PasswordReset | None:
    return (
        db.query(PasswordReset)
        .filter(PasswordReset.token == token, PasswordReset.expires_at > datetime.utcnow())
        .first()
    )


def delete_reset(db: Session, reset: PasswordReset) -> None:
    db.delete(reset)
    db.commit()
