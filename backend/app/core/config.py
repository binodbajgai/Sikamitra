from pydantic_settings import BaseSettings, SettingsConfigDict


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

    model_config = SettingsConfigDict(
        env_file=".env",
        case_sensitive=False
    )


settings = Settings()