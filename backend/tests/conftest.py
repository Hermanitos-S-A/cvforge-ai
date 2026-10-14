"""Isolated in-memory tests; never access or delete developer databases."""

import os
import secrets
import sys
from pathlib import Path
sys.path.insert(0, str(Path(__file__).resolve().parents[1]))

os.environ["ENVIRONMENT"] = "test"
os.environ["DATABASE_URL"] = "sqlite:///:memory:"
os.environ["SECRET_KEY"] = secrets.token_urlsafe(48)

import pytest
from fastapi.testclient import TestClient
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from sqlalchemy.pool import StaticPool
from app.core.database import Base, get_db
import app.models  # noqa: F401
from app.main import app


@pytest.fixture
def client():
    from app.core import limits
    if hasattr(limits, "_seen"):
        limits._seen.clear()  # Reset the offline rate-limiter only for isolated tests.
    engine = create_engine("sqlite://", connect_args={"check_same_thread": False}, poolclass=StaticPool)
    Base.metadata.create_all(bind=engine)
    factory = sessionmaker(bind=engine, autoflush=False)

    def override_db():
        session = factory()
        try:
            yield session
        finally:
            session.close()

    app.dependency_overrides[get_db] = override_db
    with TestClient(app) as test_client:
        yield test_client, factory
    app.dependency_overrides.clear()
    engine.dispose()


@pytest.fixture
def verified_user(client, monkeypatch):
    from app.api.v1.routers import auth
    from app.core.config import settings
    browser, factory = client
    tokens = []
    monkeypatch.setattr(settings, "SMTP_HOST", "fake.smtp")
    monkeypatch.setattr(settings, "SMTP_FROM", "noreply@example.org")
    monkeypatch.setattr(auth, "send_verification_email", lambda _recipient, token: tokens.append(token))
    email = "example@example.org"
    password = "CaseSensitive-Strong-456"
    result = browser.post("/api/v1/auth/register", json={
        "email": email, "password": password, "full_name": "Test Example",
    })
    assert result.status_code == 202, result.text
    verify = browser.post("/api/v1/auth/verify-email", json={"token": tokens[0]})
    assert verify.status_code == 200
    result = browser.post("/api/v1/auth/login", json={"email": email, "password": password})
    assert result.status_code == 200, result.text
    return {"client": browser, "factory": factory, "email": email,
            "password": password, "access": result.json()["access_token"],
            "refresh": result.json()["refresh_token"],
            "csrf": browser.cookies.get("epersona_csrf")}
