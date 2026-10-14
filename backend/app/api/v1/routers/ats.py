from fastapi import APIRouter, Depends, HTTPException, Request
from sqlalchemy.orm import Session
from app.core.database import get_db
from app.api.v1.deps import get_current_user
from app.models import User, Resume
from app.schemas import ATSAnalyzeRequest, ATSResult
from app.utils.ats_engine import ATSEngine
from app.core.limits import limiter
from app.services.usage_service import require_usage, record_usage

router = APIRouter()
ats_engine = ATSEngine()

@router.post("/analyze", response_model=ATSResult)
@limiter.limit("10/minute")
def analyze_ats(request: Request, payload: ATSAnalyzeRequest, current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    resume = db.query(Resume).filter(Resume.id == payload.resume_id, Resume.user_id == current_user.id).first()
    if not resume: raise HTTPException(404, "Resume not found")
    require_usage(db, current_user, "ats")
    text = _to_text(resume)
    r = ats_engine.analyze(text, payload.job_description)
    resume.ats_score = r.score
    resume.ats_data = {"keywords_found": r.keywords_found, "keywords_missing": r.keywords_missing, "section_scores": r.section_scores}
    record_usage(db, current_user, "ats")
    return ATSResult(score=r.score, keywords_found=r.keywords_found, keywords_missing=r.keywords_missing, weak_verbs=r.weak_verbs, suggestions=r.suggestions, section_scores=r.section_scores)

def _to_text(resume):
    parts = []
    p = resume.personal or {}
    parts += [p.get("name",""), p.get("title",""), resume.summary or ""]
    for e in resume.experiences:
        parts += [f"experience {e.role} {e.company} {e.description or ''}"] + (e.technologies or [])
    for edu in resume.educations:
        parts.append(f"education {edu.degree} {edu.institution}")
    for s in resume.skills:
        parts.append(s.name)
    for pr in resume.projects:
        parts += [f"project {pr.name} {pr.description or ''}"] + (pr.technologies or [])
    return " ".join(filter(None, parts)).lower()
