import secrets
import datetime
import logging
import hashlib
from sqlalchemy.orm import Session
from app.models.password_reset import PasswordReset
from app.repositories.user_repository import get_user_by_email, update_user_password
from app.services.email_service import send_password_reset_otp

logger = logging.getLogger(__name__)

def _generate_otp_code() -> str:
    """Generate a secure 6-digit numerical code."""
    return "".join(secrets.choice("0123456789") for _ in range(6))

def request_password_reset(db: Session, email: str) -> bool:
    """
    Creates a 6-digit verification code entry and sends it via email.
    Always returns True to prevent email enumeration.
    """
    normalized_email = email.strip().lower()
    try:
        user = get_user_by_email(db, normalized_email)
        if not user:
            return True

        # Invalidate previous unused codes for this email
        db.query(PasswordReset).filter(PasswordReset.email == normalized_email).delete()
        db.commit()

        otp_code = _generate_otp_code()
        expires_at = datetime.datetime.utcnow() + datetime.timedelta(minutes=10)

        pr = PasswordReset(
            email=normalized_email,
            token=hashlib.sha256(otp_code.encode()).hexdigest(),
            expires_at=expires_at,
        )
        db.add(pr)
        db.commit()

        if not send_password_reset_otp(normalized_email, otp_code):
            db.delete(pr)
            db.commit()
    except Exception as e:
        logger.error("Error in request_password_reset: %s", type(e).__name__)
        db.rollback()

    return True

def perform_password_reset(db: Session, email: str, code: str, new_password: str) -> bool:
    """
    Validates the 6-digit code for the specified email and updates the password.
    """
    normalized_email = email.strip().lower()
    normalized_code = code.strip()

    try:
        pr = (
            db.query(PasswordReset)
            .filter(
                PasswordReset.email == normalized_email,
                PasswordReset.token
                == hashlib.sha256(normalized_code.encode()).hexdigest(),
                PasswordReset.expires_at > datetime.datetime.utcnow(),
            )
            .first()
        )
        if not pr:
            return False

        # Update password
        update_user_password(db, normalized_email, new_password)

        # Invalidate the used token
        db.delete(pr)
        db.commit()
        return True
    except Exception as e:
        logger.error("Error in perform_password_reset: %s", type(e).__name__)
        db.rollback()
        return False
