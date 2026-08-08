from sqlalchemy.orm import Session

from app.core.security import hash_password
from app.models.user import User
from app.repositories.user_repository import (
    create_user,
    get_user_by_email,
)
from app.schemas.user import UserCreate


def register_user(db: Session, user_data: UserCreate) -> User:
    existing_user = get_user_by_email(db, user_data.email)

    if existing_user:
        raise ValueError("Email is already registered")

    password_hash = hash_password(user_data.password)

    return create_user(
        db=db,
        full_name=user_data.full_name,
        email=user_data.email,
        password_hash=password_hash,
        university=user_data.university,
    )