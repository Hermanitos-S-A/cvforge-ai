"""One-time offline admin bootstrap. Usage: python -m scripts.bootstrap_admin.

Supply EPERSONA_ADMIN_EMAIL and EPERSONA_ADMIN_PASSWORD securely in the process
environment. Never prints credentials or changes an existing user's role.
"""

import os
import sys
from pydantic import EmailStr, TypeAdapter
from app.core.database import SessionLocal
from app.core.security import hash_password, utcnow
from app.models import User


def main() -> int:
    email = os.environ.get("EPERSONA_ADMIN_EMAIL", "").strip().lower()
    password = os.environ.get("EPERSONA_ADMIN_PASSWORD", "")
    try:
        email = str(TypeAdapter(EmailStr).validate_python(email))
        if len(password) < 12:
            raise ValueError("Initial administrator requires a stronger password")
        password_hash = hash_password(password)
    except ValueError:
        print("Admin configuration invalid. Check the operator-provided email/password.", file=sys.stderr)
        return 2
    with SessionLocal() as db:
        if db.query(User).filter(User.role == "admin").first():
            print("An administrator already exists. No changes made.")
            return 1
        if db.query(User).filter(User.email == email).first():
            print("This account already exists. Use a distinct bootstrap identity.")
            return 1
        db.add(User(email=email, hashed_password=password_hash, role="admin", plan="free",
                    email_verified_at=utcnow(), is_active=True))
        db.commit()
    print("Initial administrator created. Remove bootstrap variables from the shell.")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
