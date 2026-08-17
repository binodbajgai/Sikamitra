from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.api.auth.routes import router as auth_router
from app.api.study_materials.routes import router as study_material_router
from app.api.router import router
from app.api.ai.routes import router as ai_router
from app.api.mock_tests.routes import router as mock_test_router
from app.api.mock_tests.attempt_routes import (
    router as mock_test_attempt_router,
)
from app.api.subjects.routes import router as subject_router

from app.core.config import settings


app = FastAPI(
    title=settings.app_name,
    version=settings.app_version,
)


app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:5173",
        "http://127.0.0.1:5173",
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


app.include_router(router)
app.include_router(auth_router)
app.include_router(ai_router)
app.include_router(study_material_router)
app.include_router(mock_test_router)
app.include_router(mock_test_attempt_router)
app.include_router(subject_router)


@app.get("/")
def root():
    return {
        "message": "Welcome to Sikamitra API"
    }