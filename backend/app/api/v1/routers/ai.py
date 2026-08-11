from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from pydantic import BaseModel
from typing import Optional
from app.core.database import get_db
from app.api.v1.deps import get_current_user
from app.models import User, Resume, AIGeneration
from app.services.ai_service import AIService
ai_service = AIService()
import logging

logger = logging.getLogger(__name__)
router = APIRouter()


class OptimizeRequest(BaseModel):
    text: str
    context: str = "experience"


class BioRequest(BaseModel):
    platform: str
    tone: str
    user_context: Optional[str] = None  # Contexto del usuario (datos del CV)


class SummaryRequest(BaseModel):
    job_title: Optional[str] = None
    years_exp: Optional[str] = None
    skills: Optional[list] = None


def _build_resume_context(user: User, db: Session) -> str:
    """Construye el contexto del CV del usuario para la IA."""
    resume = db.query(Resume).filter(Resume.user_id == user.id).first()
    if not resume:
        return f"Usuario: {user.full_name or 'Profesional'}"

    parts = []
    p = resume.personal or {}

    if p.get("name"):    parts.append(f"Nombre: {p['name']}")
    if p.get("title"):   parts.append(f"Título profesional: {p['title']}")
    if p.get("location"):parts.append(f"Ubicación: {p['location']}")
    if resume.summary:   parts.append(f"Resumen profesional: {resume.summary}")

    # Experiences
    if resume.experiences:
        exp_texts = []
        for exp in resume.experiences[:3]:
            txt = f"{exp.role} en {exp.company}"
            if exp.description:
                txt += f" — {exp.description[:150]}"
            if exp.technologies:
                txt += f" (Tecnologías: {', '.join(exp.technologies[:5])})"
            exp_texts.append(txt)
        parts.append(f"Experiencia laboral: {'; '.join(exp_texts)}")

    # Skills
    if resume.skills:
        by_cat: dict = {}
        for s in resume.skills:
            by_cat.setdefault(s.category, []).append(s.name)
        for cat, names in by_cat.items():
            parts.append(f"Habilidades {cat}: {', '.join(names[:8])}")

    # Education
    if resume.educations:
        edu = resume.educations[0]
        parts.append(f"Educación: {edu.degree or ''} {edu.field or ''} en {edu.institution or ''}")

    # Projects
    if resume.projects:
        proj_names = [p.name for p in resume.projects[:3]]
        parts.append(f"Proyectos destacados: {', '.join(proj_names)}")

    return "\n".join(parts) if parts else f"Usuario: {user.full_name or 'Profesional'}"


@router.post("/optimize")
def optimize_text(
    payload: OptimizeRequest,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """Optimiza un texto usando el contexto del CV del usuario."""
    if not payload.text.strip():
        raise HTTPException(400, "El texto no puede estar vacío")

    resume_context = _build_resume_context(current_user, db)

    prompt = f"""Eres un experto en CVs y desarrollo profesional. 
Datos del usuario:
{resume_context}

Optimiza el siguiente texto para un CV profesional ATS-friendly.
El texto es sobre: {payload.context}
Texto a optimizar: {payload.text}

Mejora el texto usando:
- Verbos de acción fuertes (logré, implementé, lideré, desarrollé, optimicé)
- Métricas cuantificables cuando sea posible
- Keywords relevantes para el perfil del usuario
- Tono profesional y conciso

Devuelve SOLO el texto optimizado, sin explicaciones adicionales."""

    try:
        result = ai_service.generate(prompt)
        optimized = result.strip() if result else payload.text

        # Save to history
        gen = AIGeneration(
            user_id=current_user.id,
            input_text=payload.text,
            output_text=optimized,
            context=payload.context,
            model=ai_service.model,
        )
        db.add(gen)
        db.commit()

        return {
            "optimized": optimized,
            "original": payload.text,
            "improvements": [
                "Verbos de acción aplicados",
                "Tono profesional mejorado",
                "Keywords ATS optimizadas",
            ],
        }
    except Exception as e:
        logger.error(f"AI optimize error: {e}")
        raise HTTPException(503, f"[AI Error: {str(e)}]")


@router.post("/bio")
def generate_bio(
    payload: BioRequest,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """Genera bios personalizadas usando el CV real del usuario."""
    # Use provided context or build from DB
    user_context = payload.user_context or _build_resume_context(current_user, db)

    tone_desc = {
        "professional": "formal, orientado a logros y resultados, lenguaje ejecutivo",
        "casual": "amigable, cercano, primera persona, como si hablaras con alguien",
        "creative": "creativo, único, con personalidad propia, memorable",
    }.get(payload.tone, "profesional")

    platform_desc = {
        "linkedin": "LinkedIn (máx 2600 chars, profesional, orientado a networking)",
        "twitter": "Twitter/X (máx 160 chars, conciso e impactante)",
        "portfolio": "portafolio web (breve, memorable, primera impresión)",
        "github": "GitHub (técnico, orientado a proyectos y contribuciones)",
    }.get(payload.platform, "LinkedIn")

    prompt = f"""Eres un experto en personal branding y desarrollo profesional.
Genera bios personalizadas para {platform_desc} con tono {tone_desc}.

DATOS REALES DEL USUARIO:
{user_context}

Genera exactamente este JSON con las bios personalizadas (usa los datos reales del usuario):
{{
  "headline": "Headline profesional (máx 120 chars, para LinkedIn/portafolio)",
  "summary": "Resumen profesional completo (3-4 oraciones, para LinkedIn)",
  "short_bio": "Bio corta para portafolio (1-2 oraciones, memorable)",
  "twitter_bio": "Bio para Twitter/X (máx 160 chars, impactante)"
}}

IMPORTANTE:
- Usa el nombre, título y habilidades REALES del usuario
- No inventes información que no esté en los datos
- Adapta el tono según se indicó
- Devuelve SOLO el JSON, sin texto adicional"""

    try:
        result = ai_service.generate(prompt)
        import json, re
        # Extract JSON from response
        json_match = re.search(r'\{[^{}]*\}', result, re.DOTALL)
        if json_match:
            bio_data = json.loads(json_match.group())
            return bio_data
        raise ValueError("No JSON in response")
    except Exception as e:
        logger.error(f"AI bio error: {e}")
        # Fallback with real user data
        p = {}
        resume = db.query(Resume).filter(Resume.user_id == current_user.id).first()
        if resume:
            p = resume.personal or {}

        name   = p.get("name")  or current_user.full_name or "Profesional"
        title  = p.get("title") or "Especialista"
        loc    = p.get("location") or ""
        skills = ""
        if resume and resume.skills:
            skills = ", ".join([s.name for s in resume.skills[:3]])

        return {
            "headline":    f"{title}{' | ' + skills if skills else ''}{' | ' + loc if loc else ''}",
            "summary":     resume.summary if resume and resume.summary else
                          f"{name} es {title} con experiencia en {skills or 'su área'}. "
                          f"Enfocado en resultados de alto impacto y mejora continua.",
            "short_bio":   f"{title} apasionado por {skills or 'la tecnología'}. "
                          f"Construyendo soluciones que importan.",
            "twitter_bio": f"{title}{' | ' + skills if skills else ''}{' | ' + loc if loc else ''}",
        }


@router.post("/summary")
def generate_summary(
    payload: SummaryRequest,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """Genera un resumen profesional basado en el CV del usuario."""
    resume_context = _build_resume_context(current_user, db)

    prompt = f"""Genera un resumen profesional conciso (3-4 oraciones) para un CV.

Datos del usuario:
{resume_context}

El resumen debe:
- Empezar con el título profesional y años de experiencia
- Mencionar las habilidades principales
- Incluir un logro o valor diferencial
- Terminar con la propuesta de valor al empleador

Devuelve SOLO el resumen, sin explicaciones."""

    try:
        result = ai_service.generate(prompt)
        return {"summary": result.strip()}
    except Exception as e:
        raise HTTPException(503, f"[AI Error: {str(e)}]")


@router.get("/history")
def get_history(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """Retorna el historial de generaciones de IA del usuario."""
    gens = db.query(AIGeneration)\
        .filter(AIGeneration.user_id == current_user.id)\
        .order_by(AIGeneration.created_at.desc())\
        .limit(20)\
        .all()
    return [
        {
            "id": g.id,
            "context": g.context,
            "input": g.input_text[:100] if g.input_text else "",
            "output": g.output_text[:200] if g.output_text else "",
            "created_at": str(g.created_at),
        }
        for g in gens
    ]
