<div align="center">

<img src="https://img.shields.io/badge/CVForge-AI-6c63ff?style=for-the-badge&logo=lightning&logoColor=white" alt="CVForge AI"/>

# ⚡ CVForge AI

### AI-Powered CV Builder · ATS Analyzer · Portfolio Generator

**100% Free · Runs Locally · Open Source · No API Keys Required**

[![FastAPI](https://img.shields.io/badge/FastAPI-0.111-009688?style=flat&logo=fastapi)](https://fastapi.tiangolo.com)
[![Next.js](https://img.shields.io/badge/Next.js-14-black?style=flat&logo=next.js)](https://nextjs.org)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.4-3178C6?style=flat&logo=typescript)](https://typescriptlang.org)
[![Ollama](https://img.shields.io/badge/AI-Ollama-FF6B35?style=flat)](https://ollama.ai)
[![Docker](https://img.shields.io/badge/Docker-Compose-2496ED?style=flat&logo=docker)](https://docker.com)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg?style=flat)](LICENSE)

[🚀 Live Demo](https://cvforge-ai.vercel.app) · [📖 Docs](#-installation) · [🐛 Issues](https://github.com/Hermanitos-S-A/cvforge-ai/issues) · [⭐ Star us!](https://github.com/Hermanitos-S-A/cvforge-ai)

</div>

---

## ✨ What is CVForge AI?

CVForge AI is a **full-stack SaaS platform** that helps developers and professionals build standout CVs, analyze ATS compatibility, and generate personal portfolio websites — all powered by **local AI via Ollama**. No subscriptions, no OpenAI bills, no privacy concerns.

### 🎯 Core Features

| Feature | Description |
|---|---|
| **🏗️ CV Builder** | Multi-section form with live preview and auto-save |
| **🤖 AI Optimizer** | Local Ollama AI rewrites weak text into impactful statements |
| **📊 ATS Analyzer** | Custom engine scores your CV against any job description |
| **🌐 Portfolio Generator** | Auto-generates a responsive portfolio site from your CV data |
| **💬 Bio Generator** | Platform-specific bios for LinkedIn, Twitter, GitHub, Portfolio |
| **📄 PDF Export** | Professional PDFs via ReportLab — 3 premium templates |
| **🎨 3 CV Templates** | Atlas, Nova, Zenith — all ATS-friendly |
| **🌙 Dark / Light Mode** | Persisted theme with smooth transitions |

---

## 🏛️ Architecture

```
cvforge-ai/
├── backend/                    # FastAPI Python API
│   ├── app/
│   │   ├── api/v1/routers/    # auth · resumes · ai · ats · exports
│   │   ├── core/              # config · database · security (JWT + bcrypt)
│   │   ├── models/            # SQLAlchemy ORM models
│   │   ├── schemas/           # Pydantic request/response schemas
│   │   ├── services/          # ai_service · pdf_service · portfolio_service
│   │   └── utils/             # ats_engine · prompt_templates
│   ├── alembic/               # Database migrations
│   └── Dockerfile
│
├── frontend/                   # Next.js 14 + TypeScript
│   └── src/
│       ├── app/               # App Router pages
│       │   ├── (auth)/        # login · register
│       │   └── dashboard/     # cv · ai · ats · portfolio · bio · templates
│       ├── components/        # Reusable UI components
│       ├── stores/            # Zustand state management
│       └── lib/               # API client (axios)
│
├── docker-compose.yml          # One-command full stack
└── .env.example
```

---

## 🛠️ Tech Stack

### Backend
- **Python 3.11** + **FastAPI** — high-performance async API
- **SQLAlchemy 2** + **Alembic** — ORM with migrations
- **Pydantic v2** — strict validation & serialization
- **python-jose** + **bcrypt** — JWT authentication
- **ReportLab** — professional PDF generation
- **SQLite** (dev) → **PostgreSQL** (production-ready)

### Frontend
- **Next.js 14** (App Router) + **TypeScript**
- **TailwindCSS** + **shadcn/ui** — design system
- **Framer Motion** — fluid animations
- **Zustand** + `persist` — global state with local storage
- **React Hook Form** + **Zod** — type-safe form validation
- **Sonner** — toast notifications

### AI
- **Ollama** — runs LLMs locally, 100% free
- **Mistral 7B** (default) — fast, capable, open source
- Alternatives: `llama3`, `deepseek-r1`, `gemma2`

### DevOps
- **Docker Compose** — full stack in one command
- **Vercel** — frontend deployment (free tier)
- **Render** — backend deployment (free tier)

---

## 🚀 Installation

### Prerequisites
- Docker & Docker Compose
- Node.js 20+ (for local frontend dev)
- Python 3.11+ (for local backend dev)

### ⚡ Quickstart with Docker (Recommended)

```bash
# 1. Clone the repository
git clone https://github.com/Hermanitos-S-A/cvforge-ai.git
cd cvforge-ai

# 2. Configure environment
cp .env.example .env
# Edit .env with your SECRET_KEY

# 3. Start all services
docker compose up -d

# 4. Pull the AI model (first time, ~4GB)
docker exec cvforge-ollama ollama pull mistral

# 5. Open the app
open http://localhost:3000
# API docs: http://localhost:8000/api/docs
```

### 🔧 Local Development

**Backend**
```bash
cd backend
python -m venv .venv
source .venv/bin/activate   # Windows: .venv\Scripts\activate
pip install -r requirements.txt
cp .env.example .env

# Run migrations
alembic upgrade head

# Start server
uvicorn app.main:app --reload --port 8000
```

**Frontend**
```bash
cd frontend
npm install

# Configure API URL
echo "NEXT_PUBLIC_API_URL=http://localhost:8000" > .env.local

npm run dev
# → http://localhost:3000
```

**Ollama (AI)**
```bash
# Install Ollama
curl -fsSL https://ollama.ai/install.sh | sh

# Pull a model
ollama pull mistral          # 4.1GB — recommended
# ollama pull llama3         # 4.7GB — alternative
# ollama pull gemma2         # 5.5GB — Google's model
# ollama pull deepseek-r1    # reasoning-focused

# Start the server
ollama serve                 # Runs on http://localhost:11434
```

---

## 📡 API Reference

The full interactive API docs are available at `http://localhost:8000/api/docs`

| Method | Endpoint | Description |
|---|---|---|
| `POST` | `/api/v1/auth/register` | Create new account |
| `POST` | `/api/v1/auth/login` | Login & get JWT tokens |
| `GET` | `/api/v1/resumes/` | List user's resumes |
| `POST` | `/api/v1/resumes/` | Create new resume |
| `PATCH` | `/api/v1/resumes/{id}` | Update resume |
| `POST` | `/api/v1/resumes/{id}/experiences` | Add experience entry |
| `POST` | `/api/v1/resumes/{id}/skills` | Add skill |
| `POST` | `/api/v1/ai/optimize` | Optimize text with AI |
| `POST` | `/api/v1/ai/bio` | Generate platform bio |
| `POST` | `/api/v1/ai/summary` | Generate CV summary |
| `POST` | `/api/v1/ats/analyze` | Run ATS analysis |
| `POST` | `/api/v1/exports/pdf` | Export resume as PDF |
| `POST` | `/api/v1/exports/portfolio-html` | Export portfolio HTML |

---

## 🗄️ Database Schema

```sql
users           — id, email, hashed_password, full_name, plan, is_active
resumes         — id, user_id, title, template, personal (JSON), summary, ats_score
experiences     — id, resume_id, company, role, description, technologies (JSON), dates
educations      — id, resume_id, institution, degree, field, dates
skills          — id, resume_id, name, category, level
projects        — id, resume_id, name, description, technologies (JSON), github_url, demo_url
ai_generations  — id, user_id, input_text, output_text, prompt_type, model_used
```

---

## 🚢 Free Deployment

### Frontend → Vercel
```bash
cd frontend
npx vercel --prod
# Add NEXT_PUBLIC_API_URL to Vercel environment variables
```

### Backend → Render
1. Connect your GitHub repo to [render.com](https://render.com)
2. Create a new **Web Service** pointing to `/backend`
3. Set build command: `pip install -r requirements.txt && alembic upgrade head`
4. Set start command: `uvicorn app.main:app --host 0.0.0.0 --port $PORT`
5. Add environment variables from `.env.example`

> **Note on free AI in production**: Use [Groq](https://groq.com) for a free cloud Ollama alternative. Set `OLLAMA_BASE_URL=https://api.groq.com/openai/v1` and update the AI service accordingly.

---

## 🗺️ Roadmap

- [x] **v1.0** — CV builder, ATS analyzer, AI optimizer, PDF export, Auth
- [x] **v1.0** — Portfolio generator, Bio generator, 3 CV templates
- [ ] **v1.1** — DOCX export, Cover letter generator, Multi-language UI
- [ ] **v1.2** — Recruiter mode, Public portfolio URLs, Analytics dashboard
- [ ] **v2.0** — SaaS billing (Stripe), Team accounts, Public API, Chrome extension

---

## 🤝 Contributing

Contributions are welcome! Please read our [Contributing Guide](CONTRIBUTING.md) first.

```bash
# Fork → Clone → Branch → PR
git checkout -b feat/your-feature
git commit -m "feat: add amazing feature"
git push origin feat/your-feature
# Open a Pull Request
```

---

## 📄 License

MIT License — see [LICENSE](LICENSE) for details.

---

<div align="center">

Built with ❤️ · **CVForge AI** · [⭐ Star on GitHub](https://github.com/Hermanitos-S-A/cvforge-ai)

</div>
