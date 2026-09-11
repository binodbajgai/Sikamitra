from datetime import datetime
from pydantic import BaseModel, EmailStr, constr

class ForgotPasswordRequest(BaseModel):
    email: EmailStr

class ForgotPasswordResponse(BaseModel):
    token: str
    expires_at: datetime

class ResetPasswordRequest(BaseModel):
    token: str
    new_password: constr(min_length=8)
