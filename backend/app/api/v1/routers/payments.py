from fastapi import APIRouter, Depends, HTTPException, Request, Header
from fastapi.responses import JSONResponse
from sqlalchemy.orm import Session
from pydantic import BaseModel
from typing import Optional
from app.core.database import get_db
from app.api.v1.deps import get_current_user
from app.models import User
from app.services.stripe_service import stripe_service
from app.core.config import settings
import logging

logger = logging.getLogger(__name__)
router = APIRouter()


class CheckoutRequest(BaseModel):
    plan: str  # "pro_monthly" | "pro_yearly"


class PortalRequest(BaseModel):
    return_url: Optional[str] = None


@router.post("/create-checkout-session")
def create_checkout_session(
    payload: CheckoutRequest,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """Crea sesión de Stripe Checkout y retorna URL de redirección."""
    if current_user.plan == "pro":
        raise HTTPException(400, "Ya tienes el plan Pro activo")

    if payload.plan not in ("pro_monthly", "pro_yearly"):
        raise HTTPException(400, "Plan inválido. Usa 'pro_monthly' o 'pro_yearly'")

    base_url = settings.FRONTEND_URL or "http://localhost:3000"
    try:
        checkout_url = stripe_service.create_checkout_session(
            user_id=current_user.id,
            user_email=current_user.email,
            plan=payload.plan,
            success_url=f"{base_url}/payment/success",
            cancel_url=f"{base_url}/payment/cancel",
            stripe_customer_id=current_user.stripe_customer_id,
        )
        return {"checkout_url": checkout_url}
    except Exception as e:
        logger.error(f"Stripe checkout error: {e}")
        raise HTTPException(500, f"Error al crear sesión de pago: {str(e)}")


@router.post("/portal")
def create_portal_session(
    payload: PortalRequest,
    current_user: User = Depends(get_current_user),
):
    """Crea sesión del portal de cliente para gestionar suscripción."""
    if not current_user.stripe_customer_id:
        raise HTTPException(400, "No tienes una suscripción activa")

    base_url = settings.FRONTEND_URL or "http://localhost:3000"
    return_url = payload.return_url or f"{base_url}/dashboard/upgrade"

    try:
        portal_url = stripe_service.create_portal_session(
            current_user.stripe_customer_id, return_url
        )
        return {"portal_url": portal_url}
    except Exception as e:
        raise HTTPException(500, str(e))


@router.get("/subscription-status")
def get_subscription_status(current_user: User = Depends(get_current_user)):
    """Retorna el estado actual de la suscripción del usuario."""
    return {
        "plan": current_user.plan or "free",
        "stripe_customer_id": current_user.stripe_customer_id,
        "stripe_subscription_id": current_user.stripe_subscription_id,
        "subscription_status": current_user.subscription_status,
        "subscription_end": str(current_user.subscription_end) if current_user.subscription_end else None,
    }


@router.post("/webhook")
async def stripe_webhook(
    request: Request,
    stripe_signature: str = Header(None, alias="stripe-signature"),
    db: Session = Depends(get_db),
):
    """
    Recibe y procesa eventos de Stripe.
    Configurar en Stripe Dashboard → Webhooks → Add endpoint:
    URL: https://tu-dominio.com/api/v1/payments/webhook
    Eventos: checkout.session.completed, customer.subscription.updated,
             customer.subscription.deleted, invoice.payment_failed
    """
    payload = await request.body()

    # Si no hay webhook secret configurado (modo dev), procesar sin verificar
    if not settings.STRIPE_WEBHOOK_SECRET or settings.STRIPE_WEBHOOK_SECRET == "whsec_test":
        logger.warning("STRIPE_WEBHOOK_SECRET not set — skipping signature verification")
        import json
        try:
            event = json.loads(payload)
        except Exception:
            raise HTTPException(400, "Invalid payload")
    else:
        try:
            event = stripe_service.handle_webhook(payload, stripe_signature or "")
        except ValueError as e:
            raise HTTPException(400, str(e))

    event_type = event.get("type", "")
    data = event.get("data", {}).get("object", {})
    logger.info(f"Stripe event: {event_type}")

    # checkout.session.completed 
    if event_type == "checkout.session.completed":
        user_id = int(data.get("metadata", {}).get("user_id", 0))
        customer_id = data.get("customer")
        subscription_id = data.get("subscription")
        plan = data.get("metadata", {}).get("plan", "pro_monthly")

        if user_id:
            user = db.query(User).filter(User.id == user_id).first()
            if user:
                user.plan = "pro"
                user.stripe_customer_id = customer_id
                user.stripe_subscription_id = subscription_id
                user.subscription_status = "active"
                db.commit()
                logger.info(f"User {user_id} upgraded to Pro ({plan})")

    # customer.subscription.updated 
    elif event_type == "customer.subscription.updated":
        subscription_id = data.get("id")
        status = data.get("status")
        user = db.query(User).filter(
            User.stripe_subscription_id == subscription_id
        ).first()
        if user:
            user.subscription_status = status
            if status not in ("active", "trialing"):
                user.plan = "free"
            db.commit()
            logger.info(f"Subscription {subscription_id} updated: {status}")

    # customer.subscription.deleted
    elif event_type == "customer.subscription.deleted":
        subscription_id = data.get("id")
        user = db.query(User).filter(
            User.stripe_subscription_id == subscription_id
        ).first()
        if user:
            user.plan = "free"
            user.stripe_subscription_id = None
            user.subscription_status = "canceled"
            db.commit()
            logger.info(f"User {user.id} downgraded to Free (subscription deleted)")

    # invoice.payment_failed 
    elif event_type == "invoice.payment_failed":
        customer_id = data.get("customer")
        user = db.query(User).filter(
            User.stripe_customer_id == customer_id
        ).first()
        if user:
            user.subscription_status = "past_due"
            db.commit()
            logger.warning(f"Payment failed for user {user.id}")

    return JSONResponse({"received": True})
