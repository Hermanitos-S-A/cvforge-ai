import stripe
from app.core.config import settings

stripe.api_key = settings.STRIPE_SECRET_KEY

PLANS = {
    "pro_monthly": {
        "price_id": settings.STRIPE_PRICE_MONTHLY,
        "name": "CVForge AI Pro — Mensual",
        "amount": 900,   # s/9.00 en centimos
        "currency": "pen",
        "interval": "month",
    },
    "pro_yearly": {
        "price_id": settings.STRIPE_PRICE_YEARLY,
        "name": "CVForge AI Pro — Anual",
        "amount": 7900,  # s/79.00 en centimos
        "currency": "pen",
        "interval": "year",
    },
}


class StripeService:
    def create_checkout_session(
        self,
        user_id: int,
        user_email: str,
        plan: str,
        success_url: str,
        cancel_url: str,
        stripe_customer_id: str | None = None,
    ) -> str:
        """Crea sesión de Stripe Checkout y retorna la URL."""
        plan_data = PLANS.get(plan)
        if not plan_data:
            raise ValueError(f"Plan desconocido: {plan}")

        params: dict = {
            "mode": "subscription",
            "line_items": [{"price": plan_data["price_id"], "quantity": 1}],
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

        session = stripe.checkout.Session.create(**params)
        return session.url

    def create_portal_session(self, stripe_customer_id: str, return_url: str) -> str:
        """Portal de cliente para gestionar/cancelar suscripción."""
        session = stripe.billing_portal.Session.create(
            customer=stripe_customer_id,
            return_url=return_url,
        )
        return session.url

    def handle_webhook(self, payload: bytes, sig_header: str) -> dict:
        """Verifica y parsea evento de Stripe webhook."""
        try:
            event = stripe.Webhook.construct_event(
                payload, sig_header, settings.STRIPE_WEBHOOK_SECRET
            )
            return event
        except stripe.error.SignatureVerificationError:
            raise ValueError("Invalid webhook signature")

    def get_subscription(self, subscription_id: str):
        """Obtiene detalles de una suscripción."""
        return stripe.Subscription.retrieve(subscription_id)

    def cancel_subscription(self, subscription_id: str):
        """Cancela una suscripción al final del período."""
        return stripe.Subscription.modify(
            subscription_id,
            cancel_at_period_end=True,
        )


stripe_service = StripeService()
