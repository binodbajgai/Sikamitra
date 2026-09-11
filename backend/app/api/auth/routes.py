import hashlib
import hmac
import json
import base64
from io import BytesIO
import secrets
import urllib.parse
import urllib.request

from fastapi import APIRouter, Depends, File, UploadFile, HTTPException, status
from fastapi.responses import RedirectResponse
from PIL import Image
from sqlalchemy.orm import Session
from app.api.dependencies import get_current_user

from fastapi.security import OAuth2PasswordRequestForm
from app.core.database import get_db
from app.schemas.user import (
    PasswordUpdate,
    TokenResponse,
    UserCreate,
    UserLogin,
    UserResponse,
    UserUpdate,
)
from app.services.auth_service import (
    login_user,
    register_user,
)
from app.core.config import settings
from app.core.security import create_access_token, hash_password, verify_password
from app.repositories.user_repository import create_user, get_user_by_email


router = APIRouter(
    prefix="/auth",
    tags=["Authentication"],
)


def _google_state_signature(nonce: str) -> str:
    return hmac.new(
        settings.secret_key.encode(),
        nonce.encode(),
        hashlib.sha256,
    ).hexdigest()


def _google_request(
    url: str,
    data: dict[str, str] | None = None,
):
    encoded_data = (
        urllib.parse.urlencode(data).encode()
        if data is not None
        else None
    )
    request = urllib.request.Request(
        url,
        data=encoded_data,
        headers={"Accept": "application/json"},
    )
    with urllib.request.urlopen(request, timeout=15) as response:
        return json.loads(response.read().decode("utf-8"))


@router.get("/google/login")
def google_login():
    if not settings.google_client_id or not settings.google_client_secret:
        raise HTTPException(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            detail="Google authentication is not configured.",
        )

    nonce = secrets.token_urlsafe(32)
    state = f"{nonce}.{_google_state_signature(nonce)}"
    query = urllib.parse.urlencode(
        {
            "client_id": settings.google_client_id,
            "redirect_uri": settings.google_redirect_uri,
            "response_type": "code",
            "scope": "openid email profile",
            "state": state,
            "access_type": "online",
            "prompt": "select_account",
        }
    )
    return RedirectResponse(
        f"https://accounts.google.com/o/oauth2/v2/auth?{query}"
    )


@router.get("/google/callback")
def google_callback(
    code: str | None = None,
    state: str | None = None,
    error: str | None = None,
    db: Session = Depends(get_db),
):
    callback_url = f"{settings.frontend_url}/auth/google/callback"

    if error or not code or not state:
        return RedirectResponse(f"{callback_url}?error=google_auth_failed")

    try:
        nonce, signature = state.rsplit(".", 1)
        if not hmac.compare_digest(signature, _google_state_signature(nonce)):
            raise ValueError("Invalid OAuth state")

        token_data = _google_request(
            "https://oauth2.googleapis.com/token",
            {
                "code": code,
                "client_id": settings.google_client_id,
                "client_secret": settings.google_client_secret,
                "redirect_uri": settings.google_redirect_uri,
                "grant_type": "authorization_code",
            },
        )
        access_token = token_data.get("access_token")
        if not access_token:
            raise ValueError("Google did not return an access token")

        user_request = urllib.request.Request(
            "https://openidconnect.googleapis.com/v1/userinfo",
            headers={"Authorization": f"Bearer {access_token}"},
        )
        with urllib.request.urlopen(user_request, timeout=15) as response:
            google_user = json.loads(response.read().decode("utf-8"))

        email = google_user.get("email")
        if not email or not google_user.get("email_verified"):
            raise ValueError("Google account email is not verified")

        user = get_user_by_email(db, email)
        if user is None:
            user = create_user(
                db=db,
                full_name=google_user.get("name") or email.split("@", 1)[0],
                email=email,
                password_hash=hash_password(secrets.token_urlsafe(32)),
            )

        if not user.is_active:
            raise ValueError("User account is inactive")

        app_token = create_access_token(user.id)
        return RedirectResponse(
            f"{callback_url}#access_token={urllib.parse.quote(app_token)}"
        )
    except Exception:
        return RedirectResponse(f"{callback_url}?error=google_auth_failed")


@router.post(
    "/register",
    response_model=UserResponse,
    status_code=status.HTTP_201_CREATED,
)
def register(
    user_data: UserCreate,
    db: Session = Depends(get_db),
):
    try:
        return register_user(db, user_data)
    except ValueError as exc:
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail=str(exc),
        )


@router.post(
    "/login",
    response_model=TokenResponse,
)
def login(
    form_data: OAuth2PasswordRequestForm = Depends(),
    db: Session = Depends(get_db),
):
    try:
        access_token = login_user(
            db,
            form_data.username,
            form_data.password,
        )

        return {
            "access_token": access_token,
            "token_type": "bearer",
        }

    except ValueError as exc:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail=str(exc),
        )


@router.get(
    "/me",
    response_model=UserResponse,
)
def get_me(
    current_user=Depends(get_current_user),
):
    return current_user


@router.patch(
    "/me",
    response_model=UserResponse,
)
def update_me(
    user_data: UserUpdate,
    db: Session = Depends(get_db),
    current_user=Depends(get_current_user),
):
    full_name = user_data.full_name.strip()
    if not full_name:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Full name is required.",
        )

    current_user.full_name = full_name
    current_user.university = user_data.university.strip() or None if user_data.university else None
    db.commit()
    db.refresh(current_user)
    return current_user


@router.post(
    "/me/avatar",
    response_model=UserResponse,
)
async def update_avatar(
    file: UploadFile = File(...),
    db: Session = Depends(get_db),
    current_user=Depends(get_current_user),
):
    allowed_types = {"image/png", "image/jpeg", "image/webp"}
    if file.content_type not in allowed_types:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Please upload a PNG, JPG, or WEBP image.",
        )

    image_data = await file.read()
    if len(image_data) > 5 * 1024 * 1024:
        raise HTTPException(
            status_code=status.HTTP_413_REQUEST_ENTITY_TOO_LARGE,
            detail="Profile images must be 5 MB or smaller.",
        )

    try:
        image = Image.open(BytesIO(image_data))
        image.verify()
    except Exception as exc:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="The uploaded profile image is invalid.",
        ) from exc

    encoded_image = base64.b64encode(image_data).decode("ascii")
    current_user.profile_image = f"data:{file.content_type};base64,{encoded_image}"
    db.commit()
    db.refresh(current_user)
    return current_user


@router.post("/me/password")
def update_password(
    password_data: PasswordUpdate,
    db: Session = Depends(get_db),
    current_user=Depends(get_current_user),
):
    if not verify_password(password_data.current_password, current_user.password_hash):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Current password is incorrect.",
        )

    if len(password_data.new_password) < 8:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="The new password must contain at least 8 characters.",
        )

    current_user.password_hash = hash_password(password_data.new_password)
    db.commit()
    return {"message": "Password updated"}

from datetime import datetime
from app.schemas.password_reset import ForgotPasswordRequest, ForgotPasswordResponse, ResetPasswordRequest
from app.services.password_reset_service import request_password_reset, perform_password_reset

@router.post(

    response_model=ForgotPasswordResponse,
    status_code=status.HTTP_200_OK,
)
def forgot_password(
    payload: ForgotPasswordRequest,
    db: Session = Depends(get_db),
):
    pr = request_password_reset(db, payload.email)
    if pr is None:
        # Silent success to avoid user enumeration
        return ForgotPasswordResponse(token="", expires_at=datetime.utcnow())
    return ForgotPasswordResponse(token=pr.token, expires_at=pr.expires_at)

@router.post(
    "/reset-password",
    status_code=status.HTTP_200_OK,
)
def reset_password(
    payload: ResetPasswordRequest,
    db: Session = Depends(get_db),
):
    success = perform_password_reset(db, payload.token, payload.new_password)
    if not success:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Invalid or expired token",
        )
    return {"message": "Password updated successfully"}





    response_model=ForgotPasswordResponse,
    status_code=status.HTTP_200_OK,
)
def forgot_password(
    payload: ForgotPasswordRequest,
    db: Session = Depends(get_db),
):
    pr = request_password_reset(db, payload.email)
    if pr is None:
        # Silent success to avoid user enumeration
        return ForgotPasswordResponse(token="", expires_at=datetime.utcnow())
    return ForgotPasswordResponse(token=pr.token, expires_at=pr.expires_at)

@router.post(
    "/reset-password",
    status_code=status.HTTP_200_OK,
)
def reset_password(
    payload: ResetPasswordRequest,
    db: Session = Depends(get_db),
):
    success = perform_password_reset(db, payload.token, payload.new_password)
    if not success:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Invalid or expired token",
        )
    return {"message": "Password updated successfully"}