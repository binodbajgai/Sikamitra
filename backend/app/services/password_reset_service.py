import uuid
import datetime
from sqlalchemy.orm import Session
from app.models.password_reset import PasswordReset
from app.repositories.password_reset_repository import create_reset, get_valid_reset, delete_reset
from app.repositories.user_repository import get_user_by_email, update_user_password

def _generate_token() -> str:
    """Generate a short UUID token for password reset."""
    return uuid.uuid4().hex

def request_password_reset(db: Session, email: str) -> PasswordReset | None:
    """Create a password‑reset entry if the user exists.

    Returns the ``PasswordReset`` object on success, otherwise ``None``.
    """
    user = get_user_by_email(db, email)
    if not user:
        return None
    token = _generate_token()
    expires_at = datetime.datetime.utcnow() + datetime.timedelta(minutes=30)
    return create_reset(db, email=email, token=token, expires_at=expires_at)

def perform_password_reset(db: Session, token: str, new_password: str) -> bool:
    """Validate the token and update the user's password.

    Returns ``True`` if the password was changed, ``False`` otherwise.
    """
    pr = get_valid_reset(db, token)
    if not pr:
        return False
    # Update password via repository helper
    update_user_password(db, pr.email, new_password)
    # Invalidate the token
    delete_reset(db, pr.id)
    return True
