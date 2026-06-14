from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from app.core.database import get_db
from app.api.v1.deps import get_current_user
from app.models import User, Resume, AIGeneration
from app.schemas import OptimizeRequest, OptimizeResponse, BioRequest, BioResponse, SummaryRequest
from app.services.ai_service import AIService
from app.core.config import settings

router = APIRouter()
ai_service = AIService()

@router.post("/optimize", response_model=OptimizeResponse)
async def optimize_text(payload: OptimizeRequest, current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    result = await ai_service.optimize_text(payload.text, payload.context)
    db.add(AIGeneration(user_id=current_user.id, input_text=payload.text, output_text=result["optimized"], prompt_type="optimize", model_used=settings.OLLAMA_MODEL))
    db.commit()
    return OptimizeResponse(**result)

@router.post("/bio", response_model=BioResponse)
async def generate_bio(payload: BioRequest, current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    resume = db.query(Resume).filter(Resume.user_id == current_user.id).first()
    profile_data = {
        "name": current_user.full_name,
        "personal": resume.personal if resume else {},
        "experiences": [{"role": e.role, "company": e.company} for e in (resume.experiences[:3] if resume else [])],
        "skills": [s.name for s in (resume.skills[:10] if resume else [])],
    }
    result = await ai_service.generate_bio(profile_data, payload.platform, payload.tone)
    db.add(AIGeneration(user_id=current_user.id, input_text=f"{payload.platform}/{payload.tone}", output_text=str(result), prompt_type="bio", model_used=settings.OLLAMA_MODEL))
    db.commit()
    return BioResponse(**result)

@router.post("/summary")
async def generate_summary(payload: SummaryRequest, current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    result = await ai_service.generate_summary(payload.model_dump())
    db.add(AIGeneration(user_id=current_user.id, input_text=str(payload.model_dump()), output_text=result, prompt_type="summary", model_used=settings.OLLAMA_MODEL))
    db.commit()
    return {"summary": result}

@router.get("/history")
def ai_history(limit: int = 20, current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    logs = db.query(AIGeneration).filter(AIGeneration.user_id == current_user.id).order_by(AIGeneration.created_at.desc()).limit(limit).all()
    return [{"id": l.id, "prompt_type": l.prompt_type, "input_preview": (l.input_text or "")[:80], "output_preview": (l.output_text or "")[:120], "created_at": l.created_at} for l in logs]
