from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from app.core.config import settings
from app.core.database import engine, Base
from app.models import User, Resume, Experience, Education, Skill, Project, AIGeneration
from app.api.v1.routers import auth, resumes, ai, ats, exports

Base.metadata.create_all(bind=engine)

app = FastAPI(
    title=settings.APP_NAME,
    version=settings.APP_VERSION,
    docs_url="/api/docs",
    redoc_url="/api/redoc",
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.ALLOWED_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

PREFIX = "/api/v1"
app.include_router(auth.router,    prefix=f"{PREFIX}/auth",    tags=["Authentication"])
app.include_router(resumes.router, prefix=f"{PREFIX}/resumes", tags=["Resumes"])
app.include_router(ai.router,      prefix=f"{PREFIX}/ai",      tags=["AI"])
app.include_router(ats.router,     prefix=f"{PREFIX}/ats",     tags=["ATS"])
app.include_router(exports.router, prefix=f"{PREFIX}/exports", tags=["Exports"])

@app.exception_handler(Exception)
async def global_exception_handler(request: Request, exc: Exception):
    return JSONResponse(status_code=500, content={"detail": str(exc), "type": type(exc).__name__})

@app.get("/health", tags=["Health"])
def health():
    return {"status": "healthy", "app": settings.APP_NAME, "version": settings.APP_VERSION}

@app.get("/", tags=["Root"])
def root():
    return {"message": "CVForge AI API", "docs": "/api/docs"}


# Fix: disable automatic slash redirect
from fastapi.routing import APIRoute
app.router.redirect_slashes = False
