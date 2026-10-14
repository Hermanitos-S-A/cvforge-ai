"""Server-side plan quotas based on persisted usage records, not UI state."""

from datetime import datetime, timedelta
from fastapi import HTTPException
from sqlalchemy.orm import Session
from app.models import User, UsageEvent
from app.core.security import utcnow

MONTHLY_FREE = {"pdf": 3, "ai": 5}
DAILY_CAPS = {"ats": {"free": 10, "pro": 200},
              "ai": {"free": None, "pro": None},
              "pdf": {"free": None, "pro": None},
              "portfolio": {"free": 0, "pro": None}}


def require_usage(db: Session, user: User, category: str):
    plan = "pro" if user.plan == "pro" else "free"
    now = utcnow()
    if plan == "free" and category in MONTHLY_FREE:
        month_start = datetime(now.year, now.month, 1)
        count = db.query(UsageEvent).filter(
            UsageEvent.user_id == user.id, UsageEvent.category == category,
            UsageEvent.created_at >= month_start,
        ).count()
        if count >= MONTHLY_FREE[category]:
            raise HTTPException(403, "Monthly Free plan quota reached")
    limit = DAILY_CAPS.get(category, {}).get(plan)
    if limit is not None:
        day = now.replace(hour=0, minute=0, second=0, microsecond=0)
        count = db.query(UsageEvent).filter(
            UsageEvent.user_id == user.id, UsageEvent.category == category,
            UsageEvent.created_at >= day,
        ).count()
        if count >= limit:
            raise HTTPException(403 if limit == 0 else 429, "Daily plan quota reached")


def record_usage(db: Session, user: User, category: str):
    db.add(UsageEvent(user_id=user.id, category=category, created_at=utcnow()))
    db.commit()
