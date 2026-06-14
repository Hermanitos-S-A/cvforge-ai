#!/bin/bash
# CVForge AI — Push to GitHub
# Usage: bash push-to-github.sh
set -e

REPO_URL="https://github.com/Hermanitos-S-A/cvforge-ai.git"

echo "⚡ CVForge AI — Pushing to GitHub"
echo "=================================="

# Initialize git if needed
if [ ! -d ".git" ]; then
  echo "→ Initializing git repository..."
  git init
  git branch -M main
fi

# Configure remote
if ! git remote | grep -q origin; then
  echo "→ Adding remote origin..."
  git remote add origin $REPO_URL
else
  git remote set-url origin $REPO_URL
fi

# Stage and commit
echo "→ Staging all files..."
git add -A

echo "→ Creating initial commit..."
git commit -m "feat: initial CVForge AI — full-stack SaaS CV builder

- FastAPI backend with JWT auth, SQLAlchemy ORM
- Next.js 14 frontend with TypeScript, TailwindCSS, Framer Motion
- Local AI via Ollama (Mistral 7B) — 100% free
- Custom ATS engine — no external APIs
- ReportLab PDF export (3 professional templates)
- Auto-generated HTML portfolio
- Bio generator (LinkedIn, Twitter, GitHub, Portfolio)
- Docker Compose full-stack setup
- Dark/Light mode with theme persistence
- Zustand state management + React Hook Form + Zod"

# Push
echo "→ Pushing to GitHub..."
git push -u origin main

echo ""
echo "✅ Successfully pushed to GitHub!"
echo "   → https://github.com/Hermanitos-S-A/cvforge-ai"
