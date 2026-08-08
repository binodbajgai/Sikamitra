from fastapi import FastAPI
from app.api.auth.routes import router as auth_router
from app.api.router import router
from app.core.config import settings

app = FastAPI(
    title=settings.app_name,
    version=settings.app_version,
)

app.include_router(router)
app.include_router(auth_router)

@app.get("/")
def root():
    return {
        "message": "Welcome to Sikamitra API"
    }