"""Email verification sender; never print verification tokens or message bodies."""

from email.message import EmailMessage
import smtplib
import logging
from app.core.config import settings

log = logging.getLogger(__name__)


def send_verification_email(recipient: str, raw_token: str) -> None:
    if not settings.has_smtp:
        raise RuntimeError("Email delivery is not configured")
    message = EmailMessage()
    message["Subject"] = "Verifica tu cuenta de ePersona"
    message["From"] = settings.SMTP_FROM
    message["To"] = recipient
    link = settings.FRONTEND_URL.rstrip("/") + "/verify-email?token=" + raw_token
    message.set_content("Para verificar tu cuenta de ePersona abre este enlace:\n" + link +
                        "\nEl enlace expira en 30 minutos y solo se puede utilizar una vez.")
    try:
        with smtplib.SMTP(settings.SMTP_HOST, settings.SMTP_PORT, timeout=12) as client:
            if settings.SMTP_STARTTLS:
                client.starttls()
            if settings.SMTP_USERNAME:
                client.login(settings.SMTP_USERNAME,
                    settings.SMTP_PASSWORD.get_secret_value() if settings.SMTP_PASSWORD else "")
            client.send_message(message)
    except (OSError, smtplib.SMTPException):
        log.warning("Email delivery failed: %s", recipient.rsplit("@", 1)[-1])
        raise RuntimeError("Email delivery unavailable") from None
