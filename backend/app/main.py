from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.api.auth.routes import router as auth_router
from app.api.ai.routes import router as ai_router
from app.api.mock_tests.routes import router as mock_test_router
from app.api.mock_tests.attempt_routes import (
    router as mock_test_attempt_router,
)
from app.api.study_materials.routes import (
    router as study_material_router,
)
from app.api.subjects.routes import router as subject_router
from app.api.router import router as api_router
from app.core.config import settings
from app.core.database import engine, Base
from sqlalchemy import text
import app.models.password_reset  # noqa: F401


app = FastAPI(
    title=settings.app_name,
    version=settings.app_version,
    servers=[
        {
            "url": "https://sikamitra-mgkx.vercel.app",
        }
    ],
)


@app.on_event("startup")
def init_db_tables():
    try:
        with engine.begin() as conn:
            conn.execute(
                text(
                    """
                    CREATE TABLE IF NOT EXISTS password_resets (
                        id SERIAL PRIMARY KEY,
                        email VARCHAR(255) NOT NULL,
                        token VARCHAR(255) NOT NULL UNIQUE,
                        expires_at TIMESTAMP WITHOUT TIME ZONE NOT NULL
                    );
                    CREATE INDEX IF NOT EXISTS ix_password_resets_email ON password_resets (email);
                    CREATE INDEX IF NOT EXISTS ix_password_resets_token ON password_resets (token);
                    """
                )
            )
            print("Auto-created / verified password_resets table successfully!")
    except Exception as e:
        print(f"Error ensuring password_resets table: {e}")


# --------------------------------------------------
# CORS
# --------------------------------------------------

origins = [
    "http://localhost:5173",
    "http://127.0.0.1:5173",
    "https://sikamitra.vercel.app",
    "https://sikamitra-mgkx.vercel.app",
]
if settings.frontend_url and settings.frontend_url not in origins:
    origins.append(settings.frontend_url)

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_origin_regex=r"https://.*\.vercel\.app",
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


# --------------------------------------------------
# API ROUTERS
# --------------------------------------------------

app.include_router(api_router)
app.include_router(auth_router)
app.include_router(ai_router)
app.include_router(study_material_router)
app.include_router(mock_test_router)
app.include_router(mock_test_attempt_router)
app.include_router(subject_router)


# --------------------------------------------------
# ROOT
# --------------------------------------------------

@app.get("/")
def root():
    return {
        "message": "Welcome to Sikamitra API"
    }

