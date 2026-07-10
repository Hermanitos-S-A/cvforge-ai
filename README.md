<div align="center">

# ⚡ CVForge AI

### Construye CVs que realmente consiguen trabajo

**100% Gratis · IA Local · Open Source · Sin API Keys**

[![FastAPI](https://img.shields.io/badge/FastAPI-0.111-009688?style=flat-square&logo=fastapi&logoColor=white)](https://fastapi.tiangolo.com)
[![Next.js](https://img.shields.io/badge/Next.js-14.2-black?style=flat-square&logo=next.js)](https://nextjs.org)
[![Python](https://img.shields.io/badge/Python-3.11-3776AB?style=flat-square&logo=python&logoColor=white)](https://python.org)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.4-3178C6?style=flat-square&logo=typescript&logoColor=white)](https://typescriptlang.org)
[![TailwindCSS](https://img.shields.io/badge/TailwindCSS-3.4-06B6D4?style=flat-square&logo=tailwindcss&logoColor=white)](https://tailwindcss.com)
[![Docker](https://img.shields.io/badge/Docker-Compose-2496ED?style=flat-square&logo=docker&logoColor=white)](https://docker.com)
[![Ollama](https://img.shields.io/badge/AI-Ollama%20%2B%20Mistral-FF6B35?style=flat-square)](https://ollama.ai)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow?style=flat-square)](LICENSE)

</div>

---

## ¿Qué es CVForge AI?

CVForge AI es una plataforma SaaS completa que permite a desarrolladores y profesionales crear CVs optimizados para sistemas ATS, generar portafolios web automáticamente y mejorar su perfil profesional con inteligencia artificial — todo corriendo **localmente en tu máquina**, sin pagar ni un sol.

La IA funciona con **Ollama**, lo que significa que tus datos nunca salen de tu computadora. No hay costos de API, no hay suscripciones, no hay límites.

---

## ¿Qué puedes hacer?

**Crear tu CV profesional**
Rellena tu información personal, experiencia laboral, educación, habilidades y proyectos desde un formulario intuitivo. El sistema guarda todo automáticamente.

**Optimizar con IA local**
La IA transforma descripciones simples en frases impactantes con verbos de acción y métricas cuantificables. Por ejemplo: *"hice una app web"* → *"Desarrollé una aplicación web full-stack con arquitectura multi-usuario, mejorando la productividad del equipo en un 40%"*.

**Analizar compatibilidad ATS**
Pega cualquier oferta de trabajo y el motor ATS propio de la plataforma analiza tu CV, detecta palabras clave faltantes, verbos débiles y te da un puntaje de compatibilidad con sugerencias concretas.

**Exportar PDF profesional**
Genera un PDF limpio, moderno y 100% legible por sistemas ATS con un solo clic. Disponible en 3 templates: Atlas, Nova y Zenith.

**Generar tu portafolio web**
Con los datos de tu CV se genera automáticamente una página web personal completa y responsive lista para publicar.

**Crear bios para redes**
Genera bios profesionales adaptadas para LinkedIn, Twitter/X, GitHub y portafolio con diferentes tonos (profesional, casual, creativo).

---

## Stack tecnológico

| Capa | Tecnología | Versión |
|------|-----------|---------|
| Backend | Python + FastAPI | 3.11 / 0.111 |
| ORM | SQLAlchemy + Alembic | 2.0 / 1.13 |
| Validación | Pydantic v2 | 2.7 |
| Autenticación | JWT + bcrypt | — |
| IA local | Ollama + Mistral 7B | latest |
| PDF | ReportLab | 4.2 |
| Frontend | Next.js + React | 14.2 / 18.3 |
| Lenguaje | TypeScript | 5.4 |
| Estilos | TailwindCSS | 3.4 |
| Animaciones | Framer Motion | 11.2 |
| Estado global | Zustand | 4.5 |
| Formularios | React Hook Form + Zod | 7.5 / 3.23 |
| Base de datos | SQLite (dev) → PostgreSQL (prod) | — |
| Contenedores | Docker + Docker Compose | — |

---

## Lanzar con Docker

### Requisitos
- [Docker Desktop](https://www.docker.com/products/docker-desktop/) instalado y corriendo

### Comandos

```bash
# 1. Clonar el repositorio
git clone https://github.com/Hermanitos-S-A/cvforge-ai.git
cd cvforge-ai

# 2. Levantar todos los servicios
docker compose up -d --build

# 3. Descargar el modelo de IA (primera vez, ~4GB)
docker exec cvforge-ollama ollama pull mistral

# 4. Abrir la aplicación
# Frontend  →  http://localhost:3000
# API Docs  →  http://localhost:8000/api/docs
```

### Detener los servicios

```bash
docker compose down
```

### Ver logs en tiempo real

```bash
# Todos los servicios
docker compose logs -f

# Solo el backend
docker compose logs -f backend

# Solo el frontend
docker compose logs -f frontend
```

---

## Modelos de IA disponibles

El sistema funciona con cualquier modelo de Ollama. Por defecto usa Mistral 7B.

```bash
# Mistral 7B — recomendado, rápido y capaz
docker exec cvforge-ollama ollama pull mistral

# Llama 3 — alternativa de Meta
docker exec cvforge-ollama ollama pull llama3

# Gemma 2 — modelo de Google
docker exec cvforge-ollama ollama pull gemma2

# DeepSeek R1 — especializado en razonamiento
docker exec cvforge-ollama ollama pull deepseek-r1
```

Para cambiar el modelo, edita la variable en `docker-compose.yml`:
```yaml
OLLAMA_MODEL=llama3
```

---

## Variables de entorno

Copia `.env.example` a `.env` y ajusta los valores:

```bash
cp .env.example .env
```

| Variable | Descripción | Default |
|----------|-------------|---------|
| `SECRET_KEY` | Clave secreta para JWT | *(requerida)* |
| `DATABASE_URL` | URL de la base de datos | `sqlite:///./data/cvforge.db` |
| `OLLAMA_BASE_URL` | URL del servidor Ollama | `http://localhost:11434` |
| `OLLAMA_MODEL` | Modelo a usar | `mistral` |
| `ALLOWED_ORIGINS` | Orígenes CORS permitidos | `["http://localhost:3000"]` |

---

## Servicios disponibles

| Servicio | URL | Descripción |
|---------|-----|-------------|
| Frontend | http://localhost:3000 | Aplicación web Next.js |
| Backend API | http://localhost:8000 | FastAPI REST API |
| API Docs (Swagger) | http://localhost:8000/api/docs | Documentación interactiva |
| Health Check | http://localhost:8000/health | Estado del servidor |
| Ollama | http://localhost:11434 | Servidor de IA local |

---

## Deploy gratuito en producción

| Servicio | Plataforma | Costo |
|---------|-----------|-------|
| Frontend | [Vercel](https://vercel.com) | Gratis |
| Backend | [Render](https://render.com) | Gratis |
| IA en la nube | [Groq](https://groq.com) (Mistral/Llama) | Gratis |
| Base de datos | [Turso](https://turso.tech) (SQLite edge) | Gratis |

---

## Licencia

MIT License — libre para usar, modificar y distribuir.

---

<div align="center">

**CVForge AI** · Hecho con ❤️ · [⭐ Star en GitHub](https://github.com/Hermanitos-S-A/cvforge-ai)

</div>
