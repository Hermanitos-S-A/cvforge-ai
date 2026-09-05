from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from sqlalchemy import func
from pydantic import BaseModel
from typing import Optional
from datetime import datetime, timedelta
from app.core.database import get_db
from app.api.v1.deps import get_current_user
from app.models import User, Resume, AIGeneration
from app.core.security import hash_password

router = APIRouter()

ADMIN_EMAILS = {
    "admin@cvforge.com",
    "stefannysalas2002@gmail.com",
    "jpsalas9@gmail.com",
}

def require_admin(current_user: User = Depends(get_current_user)):
    if current_user.email not in ADMIN_EMAILS:
        raise HTTPException(403, "Acceso denegado")
    return current_user

@router.get("/stats")
def get_stats(db: Session = Depends(get_db), admin: User = Depends(require_admin)):
    total_users   = db.query(func.count(User.id)).scalar()
    pro_users     = db.query(func.count(User.id)).filter(User.plan == "pro").scalar()
    free_users    = db.query(func.count(User.id)).filter(User.plan == "free").scalar()
    total_resumes = db.query(func.count(Resume.id)).scalar()
    total_ai_gens = db.query(func.count(AIGeneration.id)).scalar()
    week_ago      = datetime.utcnow() - timedelta(days=7)
    month_ago     = datetime.utcnow() - timedelta(days=30)
    new_week      = db.query(func.count(User.id)).filter(User.created_at >= week_ago).scalar()
    new_month     = db.query(func.count(User.id)).filter(User.created_at >= month_ago).scalar()
    return {
        "total_users": total_users, "pro_users": pro_users, "free_users": free_users,
        "total_resumes": total_resumes, "total_ai_gens": total_ai_gens,
        "new_users_week": new_week, "new_users_month": new_month,
        "conversion_rate": round((pro_users / total_users * 100), 1) if total_users > 0 else 0,
    }

@router.get("/users")
def list_users(
    skip: int = 0, limit: int = 50,
    search: Optional[str] = None, plan: Optional[str] = None,
    db: Session = Depends(get_db), admin: User = Depends(require_admin),
):
    q = db.query(User)
    if search:
        q = q.filter((User.email.ilike(f"%{search}%")) | (User.full_name.ilike(f"%{search}%")))
    if plan:
        q = q.filter(User.plan == plan)
    total = q.count()
    users = q.order_by(User.created_at.desc()).offset(skip).limit(limit).all()
    return {
        "total": total,
        "users": [{
            "id": u.id, "email": u.email, "full_name": u.full_name,
            "plan": u.plan or "free", "is_active": u.is_active,
            "created_at": str(u.created_at)[:10] if u.created_at else None,
            "resume_count": len(u.resumes) if u.resumes else 0,
            "is_admin": u.email in ADMIN_EMAILS,
        } for u in users],
    }

class UpdatePlanRequest(BaseModel):
    plan: str

@router.patch("/users/{user_id}/plan")
def update_plan(user_id: int, payload: UpdatePlanRequest, db: Session = Depends(get_db), admin: User = Depends(require_admin)):
    if payload.plan not in ("free", "pro"):
        raise HTTPException(400, "Plan inválido")
    u = db.query(User).filter(User.id == user_id).first()
    if not u: raise HTTPException(404, "Usuario no encontrado")
    u.plan = payload.plan
    db.commit()
    return {"message": f"Plan cambiado a {payload.plan}", "plan": payload.plan}

class UpdateActiveRequest(BaseModel):
    is_active: bool

@router.patch("/users/{user_id}/active")
def toggle_active(user_id: int, payload: UpdateActiveRequest, db: Session = Depends(get_db), admin: User = Depends(require_admin)):
    u = db.query(User).filter(User.id == user_id).first()
    if not u: raise HTTPException(404, "Usuario no encontrado")
    if u.email in ADMIN_EMAILS: raise HTTPException(403, "No puedes modificar un admin")
    u.is_active = payload.is_active
    db.commit()
    return {"message": "Cuenta actualizada", "is_active": payload.is_active}

class ResetPasswordRequest(BaseModel):
    new_password: str

@router.patch("/users/{user_id}/reset-password")
def reset_password(user_id: int, payload: ResetPasswordRequest, db: Session = Depends(get_db), admin: User = Depends(require_admin)):
    if len(payload.new_password) < 8: raise HTTPException(400, "Mínimo 8 caracteres")
    u = db.query(User).filter(User.id == user_id).first()
    if not u: raise HTTPException(404, "Usuario no encontrado")
    u.hashed_password = hash_password(payload.new_password)
    db.commit()
    return {"message": f"Contraseña de {u.email} reseteada"}

@router.delete("/users/{user_id}")
def delete_user(user_id: int, db: Session = Depends(get_db), admin: User = Depends(require_admin)):
    u = db.query(User).filter(User.id == user_id).first()
    if not u: raise HTTPException(404, "Usuario no encontrado")
    if u.email in ADMIN_EMAILS: raise HTTPException(403, "No puedes eliminar un admin")
    db.delete(u)
    db.commit()
    return {"message": f"Usuario {u.email} eliminado"}
