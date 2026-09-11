from sqlalchemy import select
from sqlalchemy.orm import Session

from app.models.user import User


def get_user_by_email(db: Session, email: str) -> User | None:
    statement = select(User).where(User.email == email)
    return db.scalar(statement)


def create_user(
    db: Session,
    full_name: str,
    email: str,
    password_hash: str,
    university: str | None = None,
) -> User:
    user = User(
        full_name=full_name,
        email=email,
        password_hash=password_hash,
        university=university,
    )

    db.add(user)
    db.commit()
    db.refresh(user)

    return user

def update_user_password(db: Session, email: str, new_password: str) -> None:
    from app.core.security import hash_password
    user = get_user_by_email(db, email)
    if not user:
        raise ValueError("User not found")
    user.password_hash = hash_password(new_password)
    db.commit()
    db.refresh(user)