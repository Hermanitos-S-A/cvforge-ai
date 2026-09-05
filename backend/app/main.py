from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from fastapi.staticfiles import StaticFiles
from pathlib import Path
from app.core.config import settings
from app.core.database import engine, Base
from app.models import User, Resume, Experience, Education, Skill, Project, AIGeneration
from app.api.v1.routers import auth, resumes, ai, ats, exports, uploads, plans, payments, admin

Base.metadata.create_all(bind=engine)
Path("data/uploads/avatars").mkdir(parents=True, exist_ok=True)

app = FastAPI(title=settings.APP_NAME, version=settings.APP_VERSION, docs_url="/api/docs", redoc_url="/api/redoc")
app.router.redirect_slashes = False

app.add_middleware(CORSMiddleware, allow_origins=settings.ALLOWED_ORIGINS, allow_credentials=True, allow_methods=["*"], allow_headers=["*"])
app.mount("/uploads", StaticFiles(directory="data/uploads"), name="uploads")

PREFIX = "/api/v1"
app.include_router(auth.router,     prefix=f"{PREFIX}/auth",     tags=["Auth"])
app.include_router(resumes.router,  prefix=f"{PREFIX}/resumes",  tags=["Resumes"])
app.include_router(ai.router,       prefix=f"{PREFIX}/ai",       tags=["AI"])
app.include_router(ats.router,      prefix=f"{PREFIX}/ats",      tags=["ATS"])
app.include_router(exports.router,  prefix=f"{PREFIX}/exports",  tags=["Exports"])
app.include_router(uploads.router,  prefix=f"{PREFIX}/uploads",  tags=["Uploads"])
app.include_router(plans.router,    prefix=f"{PREFIX}/plans",    tags=["Plans"])
app.include_router(payments.router, prefix=f"{PREFIX}/payments", tags=["Payments"])
app.include_router(admin.router,    prefix=f"{PREFIX}/admin",    tags=["Admin"])

@app.exception_handler(Exception)
async def global_exception_handler(request: Request, exc: Exception):
    return JSONResponse(status_code=500, content={"detail": str(exc)})

@app.get("/health")
def health():
    return {"status":"healthy","app":settings.APP_NAME,"version":settings.APP_VERSION}
