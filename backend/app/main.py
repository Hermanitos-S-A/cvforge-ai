"""ePersona API. All public HTTP paths retain their /api/v1 contracts."""

import logging
from pathlib import Path
from uuid import uuid4
from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from fastapi.staticfiles import StaticFiles
from sqlalchemy import text
from app.core.config import settings
from app.core.database import engine
from app.core.limits import limiter, RateLimitExceeded, _rate_limit_exceeded_handler
from app.api.v1.routers import (
    auth, resumes, ai, ats, exports, uploads, plans, payments, admin, account,
)

logger = logging.getLogger("epersona.api")
Path("data/uploads/avatars").mkdir(parents=True, exist_ok=True)

app = FastAPI(
    title=settings.APP_NAME,
    version=settings.APP_VERSION,
    docs_url=None if settings.is_production else "/api/docs",
    redoc_url=None if settings.is_production else "/api/redoc",
    openapi_url=None if settings.is_production else "/api/openapi.json",
)
app.router.redirect_slashes = False
app.state.limiter = limiter
if RateLimitExceeded is not None:
    app.add_exception_handler(RateLimitExceeded, _rate_limit_exceeded_handler)
app.add_middleware(
    CORSMiddleware, allow_origins=settings.ALLOWED_ORIGINS, allow_credentials=True,
    allow_methods=["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
    allow_headers=["Authorization", "Content-Type", "X-CSRF-Token", "X-AI-External-Consent"],
    expose_headers=["X-Request-ID"],
)


@app.middleware("http")
async def secure_responses(request: Request, call_next):
    request_id = uuid4().hex
    request.state.request_id = request_id
    try:
        response = await call_next(request)
    except Exception as exc:
        # Deliberately omit the exception string, body and query string from logs.
        logger.error("Unhandled error request_id=%s exception=%s", request_id, type(exc).__name__)
        response = JSONResponse(status_code=500, content={
            "detail": "An unexpected error occurred", "request_id": request_id,
        })
    response.headers["X-Request-ID"] = request_id
    response.headers["X-Content-Type-Options"] = "nosniff"
    response.headers["Referrer-Policy"] = "strict-origin-when-cross-origin"
    response.headers["X-Frame-Options"] = "DENY"
    if request.url.path.startswith("/api/v1"):
        response.headers["Cache-Control"] = "no-store"
    return response


app.mount("/uploads", StaticFiles(directory="data/uploads"), name="uploads")
PREFIX = "/api/v1"
app.include_router(auth.router, prefix=f"{PREFIX}/auth", tags=["Auth"])
app.include_router(account.router, prefix=f"{PREFIX}/auth", tags=["Account"])
app.include_router(resumes.router, prefix=f"{PREFIX}/resumes", tags=["Resumes"])
app.include_router(ai.router, prefix=f"{PREFIX}/ai", tags=["AI"])
app.include_router(ats.router, prefix=f"{PREFIX}/ats", tags=["ATS"])
app.include_router(exports.router, prefix=f"{PREFIX}/exports", tags=["Exports"])
app.include_router(uploads.router, prefix=f"{PREFIX}/uploads", tags=["Uploads"])
app.include_router(plans.router, prefix=f"{PREFIX}/plans", tags=["Plans"])
app.include_router(payments.router, prefix=f"{PREFIX}/payments", tags=["Payments"])
app.include_router(admin.router, prefix=f"{PREFIX}/admin", tags=["Admin"])


@app.get("/health")
def health():
    try:
        with engine.connect() as connection:
            connection.execute(text("SELECT 1"))
    except Exception:
        logger.error("Database health check failed")
        return JSONResponse(status_code=503, content={"status": "unhealthy"})
    return {"status": "healthy", "app": settings.APP_NAME, "version": settings.APP_VERSION}
