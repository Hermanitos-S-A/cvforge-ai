import json
import hashlib
import hmac
import secrets
from types import SimpleNamespace
from pydantic import SecretStr
from app.models import User


def test_signed_webhooks_are_idempotent(verified_user, monkeypatch):
    from app.core.config import settings
    from app.services import stripe_service as service_module
    from app.api.v1.routers.payments import stripe_service
    browser, factory = verified_user["client"], verified_user["factory"]
    key = secrets.token_urlsafe(32)
    monkeypatch.setattr(settings, "STRIPE_ENABLED", True)
    monkeypatch.setattr(settings, "STRIPE_WEBHOOK_SECRET", SecretStr(key))

    class SignatureError(Exception):
        pass

    class FakeWebhook:
        @staticmethod
        def construct_event(payload, sig_header, signing_secret):
            timestamp = "1234"
            expected = hmac.new(signing_secret.encode(),
                timestamp.encode() + b"." + payload, hashlib.sha256).hexdigest()
            if sig_header != f"t={timestamp},v1={expected}":
                raise SignatureError("invalid")
            return json.loads(payload)

    import importlib
    module = importlib.import_module("app.services.stripe_service")
    monkeypatch.setattr(module, "stripe", SimpleNamespace(
        Webhook=FakeWebhook, error=SimpleNamespace(SignatureVerificationError=SignatureError)))
    with factory() as db:
        user = db.query(User).filter(User.email == verified_user["email"]).one()
        user_id = user.id

    event = {"id": "evt_valid_one", "type": "checkout.session.completed", "created": 123456,
             "data": {"object": {"mode": "subscription", "payment_status": "paid",
                      "metadata": {"user_id": str(user_id)},
                      "customer": "cus_legit", "subscription": "sub_legit"}}}
    payload = json.dumps(event, separators=(",", ":")).encode()
    signature = hmac.new(key.encode(), b"1234." + payload, hashlib.sha256).hexdigest()
    assert browser.post("/api/v1/payments/webhook", content=payload,
        headers={"stripe-signature": "t=1234,v1=invalid"}).status_code == 400
    assert browser.post("/api/v1/payments/webhook", content=payload).status_code == 400
    ok = browser.post("/api/v1/payments/webhook", content=payload,
        headers={"stripe-signature": f"t=1234,v1={signature}"})
    assert ok.status_code == 200, ok.text
    replay = browser.post("/api/v1/payments/webhook", content=payload,
        headers={"stripe-signature": f"t=1234,v1={signature}"})
    assert replay.status_code == 200 and replay.json().get("duplicate") is True
    with factory() as db:
        user = db.get(User, user_id)
        assert user.plan == "pro"
        assert user.stripe_subscription_id == "sub_legit"


def test_unconfigured_payment_endpoint_never_upgrades(verified_user):
    browser = verified_user["client"]
    response = browser.post("/api/v1/payments/create-checkout-session",
        json={"plan": "pro_monthly"}, headers={"X-CSRF-Token": verified_user["csrf"]})
    assert response.status_code == 503
    assert browser.get("/api/v1/auth/me").json()["plan"] == "free"
