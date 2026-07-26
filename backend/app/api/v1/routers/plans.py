"""
CVForge AI v1.3 — Plans Router
Lógica de planes Free vs Pro.
Stripe se integrará en v1.4.
"""
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from app.core.database import get_db
from app.api.v1.deps import get_current_user
from app.models import User

router = APIRouter()

PLAN_FEATURES = {
    "free": {
        "name": "Free",
        "price": 0,
        "templates": ["atlas", "nova"],
        "pdf_exports_per_month": 3,
        "ai_optimizations_per_month": 5,
        "avatar": False,
        "portfolio": False,
        "bio_generator": False,
        "ats_analyzer": True,
    },
    "pro": {
        "name": "Pro",
        "price": 9,
        "templates": ["atlas", "nova", "zenith", "nexus", "pulse", "slate"],
        "pdf_exports_per_month": -1,   # unlimited
        "ai_optimizations_per_month": -1,
        "avatar": True,
        "portfolio": True,
        "bio_generator": True,
        "ats_analyzer": True,
    },
}


@router.get("/current")
def get_current_plan(
    current_user: User = Depends(get_current_user),
):
    """Retorna el plan actual del usuario con sus límites."""
    plan_key = current_user.plan or "free"
    features = PLAN_FEATURES.get(plan_key, PLAN_FEATURES["free"])
    return {
        "plan": plan_key,
        "features": features,
        "user_id": current_user.id,
    }


@router.get("/all")
def get_all_plans():
    """Retorna todos los planes disponibles (para mostrar pricing page)."""
    return {
        "plans": [
            {
                "id": "free",
                **PLAN_FEATURES["free"],
                "cta": "Empezar gratis",
                "popular": False,
            },
            {
                "id": "pro",
                **PLAN_FEATURES["pro"],
                "cta": "Actualizar a Pro",
                "popular": True,
            },
        ]
    }


@router.post("/upgrade/simulate")
def simulate_upgrade(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """
    Simula upgrade a Pro (sin Stripe).
    En v1.4 esto será reemplazado por Stripe Checkout.
    """
    if current_user.plan == "pro":
        raise HTTPException(400, "Ya tienes el plan Pro")
    current_user.plan = "pro"
    db.commit()
    return {
        "message": "Plan actualizado a Pro (modo demo)",
        "plan": "pro",
        "features": PLAN_FEATURES["pro"],
    }


@router.post("/downgrade")
def downgrade_to_free(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """Baja al plan Free."""
    current_user.plan = "free"
    db.commit()
    return {"message": "Plan cambiado a Free", "plan": "free"}


def check_feature(user: User, feature: str) -> bool:
    """Helper: verifica si el usuario tiene acceso a una feature."""
    plan = PLAN_FEATURES.get(user.plan or "free", PLAN_FEATURES["free"])
    return bool(plan.get(feature, False))


def require_pro(user: User):
    """Lanza 403 si el usuario no es Pro."""
    if user.plan != "pro":
        raise HTTPException(
            status_code=403,
            detail={
                "message": "Esta función requiere el plan Pro",
                "upgrade_url": "/dashboard/upgrade",
                "feature_blocked": True,
            },
        )
