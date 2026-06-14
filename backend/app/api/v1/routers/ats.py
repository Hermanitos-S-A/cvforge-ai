from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from app.core.database import get_db
from app.api.v1.deps import get_current_user
from app.models import User, Resume
from app.schemas import ATSAnalyzeRequest, ATSResult
from app.utils.ats_engine import ATSEngine

router = APIRouter()
ats_engine = ATSEngine()

@router.post("/analyze", response_model=ATSResult)
def analyze_ats(payload: ATSAnalyzeRequest, current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    resume = db.query(Resume).filter(Resume.id == payload.resume_id, Resume.user_id == current_user.id).first()
    if not resume: raise HTTPException(404, "Resume not found")
    text = _to_text(resume)
    r = ats_engine.analyze(text, payload.job_description)
    resume.ats_score = r.score
    resume.ats_data = {"keywords_found": r.keywords_found, "keywords_missing": r.keywords_missing, "section_scores": r.section_scores}
    db.commit()
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
