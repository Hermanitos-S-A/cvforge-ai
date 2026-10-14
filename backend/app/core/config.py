"""Validated runtime configuration. Never include real secrets in source control."""

from typing import Literal
from urllib.parse import urlsplit
from pydantic import SecretStr, field_validator, model_validator
from pydantic_settings import BaseSettings, SettingsConfigDict


_BAD_VALUES = {
    "", "changeme", "change-me", "secret", "your-secret", "whsec_test",
    "sk_test_placeholder", "pk_test_placeholder", "dev-secret-change-this-in-production-32chars",
}


def _unsafe(value: str) -> bool:
    v = value.strip().lower()
    return (v in _BAD_VALUES or "placeholder" in v or "change-this" in v
            or "your-super-secret" in v or "example" in v)


class Settings(BaseSettings):
    model_config = SettingsConfigDict(env_file=".env", env_file_encoding="utf-8", extra="ignore")

    APP_NAME: str = "ePersona"
    APP_VERSION: str = "1.5.0"
    ENVIRONMENT: Literal["development", "test", "production"] = "development"
    DEBUG: bool = False
    DATABASE_URL: str = "sqlite:///./data/cvforge.db"
    SECRET_KEY: SecretStr
    ALGORITHM: Literal["HS256"] = "HS256"
    JWT_ISSUER: str = "epersona-api"
    JWT_AUDIENCE: str = "epersona-web"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 30
    REFRESH_TOKEN_EXPIRE_DAYS: int = 7
    ALLOWED_ORIGINS: list[str] = ["http://localhost:3000", "http://127.0.0.1:3000"]
    FRONTEND_URL: str = "http://localhost:3000"

    OLLAMA_BASE_URL: str = "http://ollama:11434"
    OLLAMA_MODEL: str = "mistral"
    OLLAMA_TIMEOUT: int = 60
    GROQ_MODEL: str = "llama-3.3-70b-versatile"
    GEMINI_MODEL: str = "gemini-2.0-flash"
    OLLAMA_MAX_CONCURRENT: int = 2
    AI_PROVIDER: Literal["ollama", "groq", "gemini"] = "ollama"
    GROQ_API_KEY: SecretStr | None = None
    GEMINI_API_KEY: SecretStr | None = None

    STRIPE_ENABLED: bool = False
    STRIPE_SECRET_KEY: SecretStr | None = None
    STRIPE_PUBLISHABLE_KEY: str | None = None
    STRIPE_WEBHOOK_SECRET: SecretStr | None = None
    STRIPE_PRICE_MONTHLY: str | None = None
    STRIPE_PRICE_YEARLY: str | None = None

    SMTP_HOST: str | None = None
    SMTP_PORT: int = 587
    SMTP_USERNAME: str | None = None
    SMTP_PASSWORD: SecretStr | None = None
    SMTP_FROM: str | None = None
    SMTP_STARTTLS: bool = True

    @property
    def is_production(self) -> bool:
        return self.ENVIRONMENT == "production"

    @property
    def has_smtp(self) -> bool:
        return bool(self.SMTP_HOST and self.SMTP_FROM)

    @field_validator(
        "STRIPE_SECRET_KEY", "STRIPE_WEBHOOK_SECRET", "GROQ_API_KEY",
        "GEMINI_API_KEY", "SMTP_PASSWORD", "STRIPE_PUBLISHABLE_KEY",
        "STRIPE_PRICE_MONTHLY", "STRIPE_PRICE_YEARLY", "SMTP_HOST",
        "SMTP_USERNAME", "SMTP_FROM", mode="before",
    )
    @classmethod
    def normalize_optional_setting(cls, value):
        return None if value is None or (isinstance(value, str) and not value.strip()) else value

    @field_validator("SECRET_KEY")
    @classmethod
    def validate_secret(cls, secret: SecretStr) -> SecretStr:
        raw = secret.get_secret_value()
        if len(raw.encode("utf-8")) < 32 or _unsafe(raw):
            raise ValueError("SECRET_KEY must be a unique, secure value of at least 32 bytes")
        return secret

    @field_validator("ALLOWED_ORIGINS")
    @classmethod
    def origins_cannot_be_wildcard(cls, origins: list[str]) -> list[str]:
        if not origins or any(o == "*" or not urlsplit(o).scheme in {"http", "https"} for o in origins):
            raise ValueError("ALLOWED_ORIGINS must contain explicit HTTP(S) origins")
        return origins

    @model_validator(mode="after")
    def validate_environment(self):
        if self.ACCESS_TOKEN_EXPIRE_MINUTES < 1 or self.REFRESH_TOKEN_EXPIRE_DAYS < 1:
            raise ValueError("Token lifetimes must be positive")
        if self.OLLAMA_TIMEOUT < 1 or not 1 <= self.OLLAMA_MAX_CONCURRENT <= 16:
            raise ValueError("Ollama limits are invalid")
        for key in (self.STRIPE_SECRET_KEY, self.STRIPE_WEBHOOK_SECRET,
                    self.GROQ_API_KEY, self.GEMINI_API_KEY):
            if key is not None and _unsafe(key.get_secret_value()):
                raise ValueError("Placeholder API credentials are prohibited")
        if self.STRIPE_PUBLISHABLE_KEY and _unsafe(self.STRIPE_PUBLISHABLE_KEY):
            raise ValueError("Placeholder Stripe publishable key is prohibited")
        if self.STRIPE_ENABLED:
            required = (self.STRIPE_SECRET_KEY, self.STRIPE_WEBHOOK_SECRET,
                        self.STRIPE_PRICE_MONTHLY, self.STRIPE_PRICE_YEARLY)
            if any(not x for x in required):
                raise ValueError("Stripe enabled but required payment settings are missing")
            if any(_unsafe(v) for v in (self.STRIPE_PRICE_MONTHLY, self.STRIPE_PRICE_YEARLY)):
                raise ValueError("Placeholder Stripe prices are prohibited")
        if self.AI_PROVIDER == "groq" and self.GROQ_API_KEY is None:
            raise ValueError("GROQ_API_KEY required for Groq")
        if self.AI_PROVIDER == "gemini" and self.GEMINI_API_KEY is None:
            raise ValueError("GEMINI_API_KEY required for Gemini")
        if self.is_production:
            if self.DEBUG:
                raise ValueError("DEBUG must be disabled in production")
            if not self.FRONTEND_URL.startswith("https://"):
                raise ValueError("Production FRONTEND_URL must use HTTPS")
            if any(not o.startswith("https://") for o in self.ALLOWED_ORIGINS):
                raise ValueError("Production CORS origins must use HTTPS")
            if not self.has_smtp:
                raise ValueError("Production email registration requires SMTP_HOST and SMTP_FROM")
        return self


settings = Settings()
