from pydantic_settings import BaseSettings, SettingsConfigDict
from pydantic import field_validator


class Settings(BaseSettings):
    app_name: str
    app_version: str

    database_url: str

    secret_key: str
    algorithm: str
    access_token_expire_minutes: int

    ai_provider: str = "nvidia"
    nvidia_api_key: str = ""

    google_client_id: str = ""
    google_client_secret: str = ""
    google_redirect_uri: str = "http://127.0.0.1:8000/auth/google/callback"
    frontend_url: str = "http://127.0.0.1:5173"

    smtp_host: str = "smtp.gmail.com"
    smtp_port: int = 587
    smtp_user: str = ""
    smtp_password: str = ""
    smtp_from_email: str = ""

    @field_validator("frontend_url", mode="before")
    @classmethod
    def clean_frontend_url(cls, v: str) -> str:
        if isinstance(v, str):
            return v.strip().rstrip("/")
        return v

    model_config = SettingsConfigDict(
        env_file=".env",
        case_sensitive=False
    )


settings = Settings()
