"""Export a user's own data and delete records when explicitly requested."""

from app.models import User, Resume


def _resume_data(r: Resume) -> dict:
    return {
        "id": r.id, "title": r.title, "template": r.template,
        "personal": r.personal or {}, "summary": r.summary or "",
        "ats_score": r.ats_score, "ats_data": r.ats_data,
        "experiences": [{"company": x.company, "role": x.role, "description": x.description,
                         "technologies": x.technologies, "start_date": x.start_date,
                         "end_date": x.end_date} for x in r.experiences],
        "educations": [{"institution": x.institution, "degree": x.degree,
                        "field": x.field, "description": x.description} for x in r.educations],
        "skills": [{"name": x.name, "category": x.category, "level": x.level} for x in r.skills],
        "projects": [{"name": x.name, "description": x.description,
                      "technologies": x.technologies,
                      "github_url": x.github_url, "demo_url": x.demo_url} for x in r.projects],
    }


def account_export(user: User) -> dict:
    return {
        "account": {
            "email": user.email, "name": user.full_name, "role": user.role,
            "plan": user.plan, "avatar_url": user.avatar_url,
            "stripe_customer_id": user.stripe_customer_id,
            "created_at": str(user.created_at),
            "email_verified_at": str(user.email_verified_at),
        },
        "resumes": [_resume_data(r) for r in user.resumes],
        "ai_history": [{"created_at": str(x.created_at), "context": x.context,
                        "input_text": x.input_text, "output_text": x.output_text,
                        "model": x.model} for x in user.ai_generations],
        "usage": [{"type": x.category, "created_at": str(x.created_at)} for x in user.usage_events],
    }
