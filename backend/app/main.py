from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.middleware.trustedhost import TrustedHostMiddleware
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
from app.core.redis import get_async_redis
from app.services.email_service import verify_smtp_connection
import logging

logger = logging.getLogger(__name__)


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
def verify_external_services():
    verify_smtp_connection()


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
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.add_middleware(
    TrustedHostMiddleware,
    allowed_hosts=[
        "sikamitra-mgkx.vercel.app",
        "*.vercel.app",
        "localhost",
        "127.0.0.1",
    ],
)

_rate_limit_rules = {
    "/auth/login": (10, 60),
    "/auth/register": (5, 60),
    "/auth/forgot-password": (5, 60),
    "/auth/reset-password": (10, 60),
    "/ai/": (10, 60),
}


@app.middleware("http")
async def limit_sensitive_requests(request, call_next):
    matched_rule = next(
        (
            (prefix, limit, window)
            for prefix, (limit, window) in _rate_limit_rules.items()
            if request.url.path == prefix or request.url.path.startswith(prefix)
        ),
        None,
    )
    if matched_rule is not None:
        prefix, limit, window = matched_rule
        if not settings.redis_url and settings.environment.lower() != "production":
            return await call_next(request)

        client_host = request.client.host if request.client else "unknown"
        key = f"rate-limit:{prefix}:{client_host}"
        try:
            redis = get_async_redis()
            count = await redis.incr(key)
            if count == 1:
                await redis.expire(key, window)
        except Exception:
            logger.exception("Distributed rate limiter unavailable")
            from fastapi.responses import JSONResponse

            return JSONResponse(
                {"detail": "Rate limiting service unavailable"},
                status_code=503,
            )
        finally:
            if "redis" in locals():
                await redis.aclose()

        if count > limit:
            from fastapi.responses import JSONResponse

            return JSONResponse(
                {"detail": "Too many requests. Please try again later."},
                status_code=429,
                headers={"Retry-After": str(window)},
            )
    return await call_next(request)


@app.middleware("http")
async def add_security_headers(request, call_next):
    response = await call_next(request)
    response.headers.setdefault("X-Content-Type-Options", "nosniff")
    response.headers.setdefault("X-Frame-Options", "DENY")
    response.headers.setdefault("Referrer-Policy", "strict-origin-when-cross-origin")
    response.headers.setdefault(
        "Content-Security-Policy",
        "default-src 'self'; frame-ancestors 'none'; base-uri 'self'",
    )
    if request.url.scheme == "https":
        response.headers.setdefault(
            "Strict-Transport-Security",
            "max-age=31536000; includeSubDomains",
        )
    return response


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
