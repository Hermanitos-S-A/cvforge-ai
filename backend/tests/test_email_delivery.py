"""Account activation and safe local SMTP configuration regressions."""

import pytest
from pydantic import ValidationError
from app.core.config import Settings


def test_resend_verification_revokes_previous_link(client, monkeypatch):
    from app.core.config import settings
    from app.api.v1.routers import auth

    browser, _ = client
    emitted = []
    monkeypatch.setattr(settings, "SMTP_HOST", "mailpit")
    monkeypatch.setattr(settings, "SMTP_FROM", "noreply@epersona.local")
    monkeypatch.setattr(auth, "send_verification_email", lambda recipient, t: emitted.append(t))
    account = {"email": "resend@example.org", "password": "SamplePassword-1234", "full_name": "Resend Example"}

    assert browser.post("/api/v1/auth/register", json=account).status_code == 202
    assert browser.post("/api/v1/auth/login", json={k: account[k] for k in ("email", "password")}).status_code == 403
    assert browser.post("/api/v1/auth/resend-verification", json={"email": account["email"]}).status_code == 202
    assert len(emitted) == 2
    assert emitted[0] != emitted[1]
    assert browser.post("/api/v1/auth/verify-email", json={"token": emitted[0]}).status_code == 400
    assert browser.post("/api/v1/auth/verify-email", json={"token": emitted[1]}).status_code == 200
    assert browser.post("/api/v1/auth/login", json={k: account[k] for k in ("email", "password")}).status_code == 200
    assert browser.post("/api/v1/auth/resend-verification", json={"email": "nonexistent@example.org"}).status_code == 202


def test_production_rejects_development_mail_sink(monkeypatch):
    monkeypatch.delenv("SECRET_KEY", raising=False)
    with pytest.raises(ValidationError, match="Production must not deliver verification email"):
        Settings(
            _env_file=None, ENVIRONMENT="production", SECRET_KEY="x" * 48,
            FRONTEND_URL="https://epersona.example.org",
            ALLOWED_ORIGINS=["https://epersona.example.org"],
            SMTP_HOST="mailpit", SMTP_FROM="noreply@epersona.local",
        )


def test_disabled_account_does_not_appear_as_unverified(verified_user):
    from app.models import User

    browser = verified_user["client"]
    factory = verified_user["factory"]
    with factory() as db:
        user = db.query(User).filter(User.email == verified_user["email"]).one()
        user.is_active = False
        db.commit()
    response = browser.post("/api/v1/auth/login", json={
        "email": verified_user["email"], "password": verified_user["password"],
    })
    assert response.status_code == 403
    assert response.json()["detail"] == "Account inactive"
