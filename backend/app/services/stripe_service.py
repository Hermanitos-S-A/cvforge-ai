"""Stripe operations. No webhook is ever accepted without a valid signature."""

try:
    import stripe
except ImportError:  # Unit-test environment may not contain the payment SDK.
    stripe = None
from app.core.config import settings


class StripeService:
    def _client(self):
        if not settings.STRIPE_ENABLED or not settings.STRIPE_SECRET_KEY or stripe is None:
            raise RuntimeError("Payments unavailable")
        stripe.api_key = settings.STRIPE_SECRET_KEY.get_secret_value()
        return stripe

    def create_checkout_session(self, user_id: int, user_email: str, plan: str,
                                success_url: str, cancel_url: str,
                                stripe_customer_id: str | None = None) -> str:
        price_id = {"pro_monthly": settings.STRIPE_PRICE_MONTHLY,
                    "pro_yearly": settings.STRIPE_PRICE_YEARLY}.get(plan)
        if not price_id:
            raise ValueError("Invalid plan")
        params = {
            "mode": "subscription",
            "line_items": [{"price": price_id, "quantity": 1}],
            "success_url": success_url + "?session_id={CHECKOUT_SESSION_ID}",
            "cancel_url": cancel_url,
            "metadata": {"user_id": str(user_id), "plan": plan},
            "subscription_data": {"metadata": {"user_id": str(user_id)}},
            "allow_promotion_codes": True,
        }
        if stripe_customer_id:
            params["customer"] = stripe_customer_id
        else:
            params["customer_email"] = user_email
        return self._client().checkout.Session.create(**params).url

    def create_portal_session(self, stripe_customer_id: str, return_url: str) -> str:
        return self._client().billing_portal.Session.create(
            customer=stripe_customer_id, return_url=return_url).url

    def handle_webhook(self, payload: bytes, sig_header: str) -> dict:
        if (not settings.STRIPE_ENABLED or not settings.STRIPE_WEBHOOK_SECRET
                or not sig_header or stripe is None):
            raise ValueError("Webhook verification unavailable")
        try:
            return stripe.Webhook.construct_event(
                payload, sig_header, settings.STRIPE_WEBHOOK_SECRET.get_secret_value())
        except (ValueError, stripe.error.SignatureVerificationError):
            raise ValueError("Invalid webhook signature") from None

    def get_subscription(self, subscription_id: str):
        return self._client().Subscription.retrieve(subscription_id)

    def cancel_subscription(self, subscription_id: str):
        return self._client().Subscription.modify(subscription_id, cancel_at_period_end=True)


stripe_service = StripeService()
