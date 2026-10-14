"""Personal data rights: export and explicitly confirmed permanent deletion."""

from fastapi import APIRouter, Depends, HTTPException, Request, Response
from sqlalchemy.orm import Session
from typing import Literal
from pydantic import BaseModel, Field
from app.api.v1.deps import get_current_user
from app.core.database import get_db
from app.core.security import clear_auth_cookies, verify_password
from app.core.limits import limiter
from app.models import User
from app.services.account_service import account_export
from app.services.upload_service import UploadService

router = APIRouter()


class DeleteRequest(BaseModel):
    password: str = Field(min_length=1, max_length=72)
    confirmation: Literal["BORRAR"]


@router.get("/account/export")
@limiter.limit("3/minute")
def export_account(request: Request, user: User = Depends(get_current_user)):
    return account_export(user)


@router.delete("/account")
@limiter.limit("2/hour")
def delete_account(request: Request, response: Response, payload: DeleteRequest,
                   user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    if not verify_password(payload.password, user.hashed_password):
        raise HTTPException(403, "Password verification failed")
    if user.stripe_subscription_id and user.subscription_status in ("active", "trialing", "past_due"):
        raise HTTPException(409, "Cancel your active subscription in the billing portal first")
    user_id = user.id
    db.delete(user)
    db.commit()  # ORM cascades remove resumes, AI history, sessions and usage events.
    UploadService().delete_avatar(user_id)
    clear_auth_cookies(response)
    return {"message": "Cuenta y datos asociados eliminados"}


@router.get("/privacy")
def privacy_info():
    return {
        "cv_storage": "Stored until the user deletes the CV or account",
        "ai_history": "Stored until the user deletes the account",
        "avatar_storage": "Stored until avatar replacement or account deletion",
        "billing": "Stripe retains legally required billing records under its own policy",
        "ai_providers": "Ollama local by default; external providers require explicit consent",
        "notes": "Operational logs do not intentionally contain CV text or prompts",
    }
