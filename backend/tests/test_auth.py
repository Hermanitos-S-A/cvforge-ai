import pytest
from pydantic import ValidationError
from app.core.config import Settings
from app.models import User


def test_register_requires_mail_delivery(client):
    browser, _ = client
    response = browser.post("/api/v1/auth/register", json={
        "email": "new@example.org", "password": "EnoughPassword-987",
        "full_name": "New User",
    })
    assert response.status_code == 503


def test_unverified_login_and_one_use_verification(client, monkeypatch):
    from app.api.v1.routers import auth
    from app.core.config import settings
    browser, _ = client
    tokens = []
    monkeypatch.setattr(settings, "SMTP_HOST", "fake.smtp")
    monkeypatch.setattr(settings, "SMTP_FROM", "noreply@example.org")
    monkeypatch.setattr(auth, "send_verification_email", lambda _recipient, t: tokens.append(t))
    registration = browser.post("/api/v1/auth/register", json={
        "email": "sample@example.org", "password": "ValidPassword-123",
        "full_name": "Sample User",
    })
    assert registration.status_code == 202
    assert browser.post("/api/v1/auth/login", json={
        "email": "sample@example.org", "password": "ValidPassword-123",
    }).status_code == 403
    assert browser.post("/api/v1/auth/verify-email", json={"token": tokens[0]}).status_code == 200
    assert browser.post("/api/v1/auth/verify-email", json={"token": tokens[0]}).status_code == 400


def test_token_type_rotation_csrf_revocation_and_no_admin(verified_user):
    browser = verified_user["client"]
    assert browser.get("/api/v1/auth/me").status_code == 200
    assert browser.get("/api/v1/auth/me", headers={
        "Authorization": "Bearer " + verified_user["refresh"]}).status_code == 401
    assert browser.get("/api/v1/admin/stats").status_code == 403
    assert browser.post("/api/v1/plans/upgrade/simulate").status_code == 410
    assert browser.post("/api/v1/auth/refresh", json={}).status_code == 403
    resp = browser.post("/api/v1/auth/refresh", json={}, headers={
        "X-CSRF-Token": verified_user["csrf"]})
    assert resp.status_code == 200, resp.text
    assert resp.json()["refresh_token"] != verified_user["refresh"]
    replay = browser.post("/api/v1/auth/refresh", json={"refresh_token": verified_user["refresh"]})
    assert replay.status_code == 401
    logout = browser.post("/api/v1/auth/logout", headers={
        "X-CSRF-Token": browser.cookies.get("epersona_csrf")})
    assert logout.status_code == 200, logout.text
    assert browser.get("/api/v1/auth/me", headers={
        "Authorization": "Bearer " + resp.json()["access_token"]}).status_code == 401
    assert browser.post("/api/v1/auth/refresh", json={
        "refresh_token": resp.json()["refresh_token"]}).status_code == 401


def test_account_export_and_confirmed_delete(verified_user):
    browser = verified_user["client"]
    exported = browser.get("/api/v1/auth/account/export")
    assert exported.status_code == 200
    assert exported.json()["account"]["email"] == verified_user["email"]
    wrong = browser.request("DELETE", "/api/v1/auth/account", json={
        "password": "invalid", "confirmation": "BORRAR"},
        headers={"X-CSRF-Token": verified_user["csrf"]})
    assert wrong.status_code == 403
    deleted = browser.request("DELETE", "/api/v1/auth/account", json={
        "password": verified_user["password"], "confirmation": "BORRAR"},
        headers={"X-CSRF-Token": verified_user["csrf"]})
    assert deleted.status_code == 200, deleted.text
    assert browser.get("/api/v1/auth/me").status_code == 401


def test_production_rejects_missing_or_placeholder_secrets(monkeypatch):
    monkeypatch.delenv("SECRET_KEY", raising=False)
    with pytest.raises(ValidationError):
        Settings(_env_file=None, ENVIRONMENT="production",
                 FRONTEND_URL="https://epersona.example", ALLOWED_ORIGINS=["https://epersona.example"],
                 SMTP_HOST="smtp.example", SMTP_FROM="noreply@epersona.example")
    with pytest.raises(ValidationError):
        Settings(_env_file=None, ENVIRONMENT="production", SECRET_KEY="dev-secret-change-this-in-production-32chars",
                 FRONTEND_URL="https://epersona.example", ALLOWED_ORIGINS=["https://epersona.example"],
                 SMTP_HOST="smtp.example", SMTP_FROM="noreply@epersona.example")
