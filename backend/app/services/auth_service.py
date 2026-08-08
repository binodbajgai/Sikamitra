from sqlalchemy.orm import Session

from app.core.security import (
    create_access_token,
    hash_password,
    verify_password,
)
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


def login_user(db: Session, email: str, password: str) -> str:
    user = get_user_by_email(db, email)

    if not user:
        raise ValueError("Invalid email or password")

    if not verify_password(password, user.password_hash):
        raise ValueError("Invalid email or password")

    if not user.is_active:
        raise ValueError("User account is inactive")

    return create_access_token(user.id)