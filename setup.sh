#!/usr/bin/env bash
set -euo pipefail
# ePersona never creates .env files or prints secret values.
if [ -z "${SECRET_KEY:-}" ]; then
  echo "Set SECRET_KEY in your terminal or secret manager before running setup."
  echo 'Example: export SECRET_KEY="$(python3 -c '\''import secrets; print(secrets.token_urlsafe(48))'\'')"'
  exit 1
fi
if [ "${ENVIRONMENT:-development}" = "production" ]; then
  echo "Production setup must provide HTTPS, SMTP and Stripe credentials explicitly."
fi
echo "Checking Docker Compose configuration..."
docker compose config --quiet
echo "Ready. To start: docker compose up -d --build"
echo "To download the local AI model: docker exec epersona-ollama ollama pull mistral"
