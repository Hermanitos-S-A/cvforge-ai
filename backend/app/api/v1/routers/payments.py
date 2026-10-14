"""Checkout, customer portal and authenticated Stripe event processing."""

import logging
from urllib.parse import urlsplit
from fastapi import APIRouter, Depends, HTTPException, Request, Header
from sqlalchemy.exc import IntegrityError
from sqlalchemy.orm import Session
from typing import Literal
from pydantic import BaseModel
from app.core.database import get_db
from app.api.v1.deps import get_current_user
from app.models import User, StripeEvent
from app.services.stripe_service import stripe_service
from app.core.config import settings

logger = logging.getLogger(__name__)
router = APIRouter()
ALLOWED_EVENTS = frozenset({
    "checkout.session.completed", "customer.subscription.updated",
    "customer.subscription.deleted", "invoice.payment_failed",
})


class CheckoutRequest(BaseModel):
    plan: Literal["pro_monthly", "pro_yearly"]


class PortalRequest(BaseModel):
    return_url: str | None = None


@router.post("/create-checkout-session")
def create_checkout_session(payload: CheckoutRequest,
                            current_user: User = Depends(get_current_user)):
    if not settings.STRIPE_ENABLED:
        raise HTTPException(503, "Payments are not configured")
    if current_user.plan == "pro":
        raise HTTPException(409, "Plan Pro already active")
    try:
        checkout_url = stripe_service.create_checkout_session(
            user_id=current_user.id, user_email=current_user.email, plan=payload.plan,
            success_url=settings.FRONTEND_URL.rstrip("/") + "/payment/success",
            cancel_url=settings.FRONTEND_URL.rstrip("/") + "/payment/cancel",
            stripe_customer_id=current_user.stripe_customer_id,
        )
        return {"checkout_url": checkout_url}
    except (ValueError, RuntimeError):
        raise HTTPException(503, "Payment service unavailable") from None
    except Exception:
        logger.exception("Stripe checkout failed (no billing content logged)")
        raise HTTPException(503, "Payment service unavailable") from None


@router.post("/portal")
def create_portal_session(payload: PortalRequest,
                          current_user: User = Depends(get_current_user)):
    if not current_user.stripe_customer_id:
        raise HTTPException(400, "No Stripe customer associated with account")
    origin = urlsplit(settings.FRONTEND_URL)
    return_url = payload.return_url or settings.FRONTEND_URL.rstrip("/") + "/dashboard/upgrade"
    parsed = urlsplit(return_url)
    if (parsed.scheme, parsed.netloc) != (origin.scheme, origin.netloc):
        raise HTTPException(400, "Invalid return URL")
    try:
        return {"portal_url": stripe_service.create_portal_session(
            current_user.stripe_customer_id, return_url)}
    except Exception:
        logger.error("Stripe portal unavailable")
        raise HTTPException(503, "Payment service unavailable") from None


@router.get("/subscription-status")
def subscription_status(current_user: User = Depends(get_current_user)):
    return {
        "plan": current_user.plan or "free",
        "stripe_customer_id": current_user.stripe_customer_id,
        "stripe_subscription_id": current_user.stripe_subscription_id,
        "subscription_status": current_user.subscription_status,
        "subscription_end": str(current_user.subscription_end) if current_user.subscription_end else None,
    }


def _apply_event(db: Session, event_type: str, data: dict, created: int):
    user = None
    if event_type == "checkout.session.completed":
        if data.get("mode") != "subscription" or data.get("payment_status") not in ("paid", "no_payment_required"):
            return
        try:
            user_id = int(data.get("metadata", {}).get("user_id", 0))
        except (TypeError, ValueError):
            return
        customer_id, subscription_id = data.get("customer"), data.get("subscription")
        if not (user_id and customer_id and subscription_id):
            return
        user = db.get(User, user_id)
        if user and user.stripe_customer_id and user.stripe_customer_id != customer_id:
            return
    elif event_type in ("customer.subscription.updated", "customer.subscription.deleted"):
        subscription_id = data.get("id")
        user = db.query(User).filter(User.stripe_subscription_id == subscription_id).first()
    elif event_type == "invoice.payment_failed":
        customer_id = data.get("customer")
        user = db.query(User).filter(User.stripe_customer_id == customer_id).first()

    if not user or created < user.last_stripe_event_created:
        return
    if event_type == "checkout.session.completed":
        user.plan = "pro"
        user.stripe_customer_id = customer_id
        user.stripe_subscription_id = subscription_id
        user.subscription_status = "active"
    elif event_type == "customer.subscription.updated":
        state = data.get("status")
        user.subscription_status = state
        user.plan = "pro" if state in ("active", "trialing") else "free"
    elif event_type == "customer.subscription.deleted":
        user.plan = "free"
        user.stripe_subscription_id = None
        user.subscription_status = "canceled"
    elif event_type == "invoice.payment_failed":
        user.plan = "free"
        user.subscription_status = "past_due"
    user.last_stripe_event_created = created


@router.post("/webhook")
async def stripe_webhook(request: Request,
                         stripe_signature: str | None = Header(None, alias="stripe-signature"),
                         db: Session = Depends(get_db)):
    if not settings.STRIPE_ENABLED:
        raise HTTPException(503, "Stripe webhook is not configured")
    # The SDK receives exact raw bytes for its cryptographic signature verification.
    body = bytearray()
    async for chunk in request.stream():
        body.extend(chunk)
        if len(body) > 1_000_000:
            raise HTTPException(413, "Stripe payload too large")
    payload = bytes(body)
    if not stripe_signature:
        raise HTTPException(400, "Missing Stripe signature")
    try:
        event = stripe_service.handle_webhook(payload, stripe_signature)
    except ValueError:
        raise HTTPException(400, "Invalid Stripe signature") from None
    event_id = event.get("id")
    event_type = event.get("type")
    if not isinstance(event_id, str) or not event_id.startswith("evt_"):
        raise HTTPException(400, "Invalid event ID")
    if event_type not in ALLOWED_EVENTS:
        return {"received": True, "ignored": True}
    data = event.get("data", {}).get("object", {})
    if not isinstance(data, dict):
        raise HTTPException(400, "Invalid event data")
    try:
        created = int(event.get("created", 0))
        if created < 0:
            raise ValueError()
    except (ValueError, TypeError):
        raise HTTPException(400, "Invalid event timestamp") from None
    if db.get(StripeEvent, event_id):
        return {"received": True, "duplicate": True}
    try:
        db.add(StripeEvent(event_id=event_id, event_type=event_type))
        db.flush()  # Unique event ID prevents double processing, including concurrent delivery.
        _apply_event(db, event_type, data, created)
        db.commit()
    except IntegrityError:
        db.rollback()
        return {"received": True, "duplicate": True}
    except Exception:
        db.rollback()
        logger.error("Stripe event processing failed for event ID %s", event_id)
        raise HTTPException(500, "Event could not be processed") from None
    return {"received": True}
