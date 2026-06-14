#!/bin/bash
# CVForge AI — Quick Setup Script
set -e
echo "⚡ CVForge AI Setup"
echo "==================="

# Generate secret key
SECRET=$(python3 -c "import secrets; print(secrets.token_hex(32))" 2>/dev/null || openssl rand -hex 32)

# Create .env files
cp backend/.env.example backend/.env
sed -i "s/your-super-secret-key-change-in-production-min-32-chars/$SECRET/" backend/.env
cp .env.example .env
sed -i "s/generate-a-strong-secret-key-min-32-chars/$SECRET/" .env

echo "✅ .env files created with secure SECRET_KEY"
echo ""
echo "Next steps:"
echo "  1. docker compose up -d"
echo "  2. docker exec cvforge-ollama ollama pull mistral"
echo "  3. open http://localhost:3000"
