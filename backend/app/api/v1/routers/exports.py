from fastapi import APIRouter, Depends, HTTPException, Request
from fastapi.responses import Response
from sqlalchemy.orm import Session
from app.core.database import get_db
from app.api.v1.deps import get_current_user
from app.models import User, Resume
from app.schemas import ExportRequest
from app.services.pdf_service import PDFService
from app.services.portfolio_service import PortfolioService
from app.core.limits import limiter
from app.services.usage_service import require_usage, record_usage

router = APIRouter()
pdf_service = PDFService()
portfolio_service = PortfolioService()

def _to_dict(resume):
    return {
        "personal": resume.personal or {},
        "summary": resume.summary or "",
        "template": resume.template,
        "experiences": [{"company": e.company, "role": e.role, "description": e.description, "technologies": e.technologies, "start_date": e.start_date, "end_date": e.end_date, "is_current": e.is_current} for e in resume.experiences],
        "educations": [{"institution": e.institution, "degree": e.degree, "field": e.field, "start_date": e.start_date, "end_date": e.end_date} for e in resume.educations],
        "skills": [{"name": s.name, "category": s.category, "level": s.level} for s in resume.skills],
        "projects": [{"name": p.name, "description": p.description, "technologies": p.technologies, "github_url": p.github_url, "demo_url": p.demo_url} for p in resume.projects],
    }

@router.post("/pdf")
@limiter.limit("10/minute")
def export_pdf(request: Request, payload: ExportRequest, current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    resume = db.query(Resume).filter(Resume.id == payload.resume_id, Resume.user_id == current_user.id).first()
    if not resume: raise HTTPException(404, "Resume not found")
    require_usage(db, current_user, "pdf")
    template = payload.template or resume.template
    if template not in ("atlas", "nova", "zenith", "nexus", "pulse", "slate"):
        raise HTTPException(400, "Unknown template")
    if current_user.plan != "pro" and template not in ("atlas", "nova"):
        raise HTTPException(403, "This template requires the Pro plan")
    pdf_bytes = pdf_service.generate_cv(_to_dict(resume), template)
    record_usage(db, current_user, "pdf")
    import re
    safe_name = re.sub(r"[^a-z0-9-]", "", (resume.personal or {}).get("name", "resume").lower().replace(" ", "-"))[:80] or "resume"
    return Response(content=pdf_bytes, media_type="application/pdf", headers={"Content-Disposition": f'attachment; filename="{safe_name}-cv.pdf"'})

@router.post("/portfolio-html")
@limiter.limit("5/minute")
def export_portfolio(request: Request, resume_id: int, current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    resume = db.query(Resume).filter(Resume.id == resume_id, Resume.user_id == current_user.id).first()
    if not resume: raise HTTPException(404, "Resume not found")
    require_usage(db, current_user, "portfolio")
    html = portfolio_service.generate_html(_to_dict(resume))
    record_usage(db, current_user, "portfolio")
    return Response(content=html, media_type="text/html", headers={"Content-Disposition": "attachment; filename=portfolio.html"})
