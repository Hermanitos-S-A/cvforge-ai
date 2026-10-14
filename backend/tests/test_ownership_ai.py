from app.core.security import hash_password, utcnow
from app.models import User, Resume


def test_idor_rejected_for_resume_children_ats_and_export(verified_user):
    browser, factory = verified_user["client"], verified_user["factory"]
    with factory() as db:
        other = User(email="other@example.org", hashed_password=hash_password("SufficientPassword7"),
                     role="user", plan="free", email_verified_at=utcnow(), is_active=True)
        db.add(other)
        db.flush()
        cv = Resume(user_id=other.id, title="Private", personal={"name": "Confidential"}, template="atlas")
        db.add(cv)
        db.commit()
        rid = cv.id

    csrf = verified_user["csrf"]
    assert browser.get(f"/api/v1/resumes/{rid}").status_code == 404
    assert browser.patch(f"/api/v1/resumes/{rid}", json={"title": "Stolen"},
        headers={"X-CSRF-Token": csrf}).status_code == 404
    assert browser.post(f"/api/v1/resumes/{rid}/skills", json={"name": "Stolen"},
        headers={"X-CSRF-Token": csrf}).status_code == 404
    assert browser.post("/api/v1/exports/pdf", json={"resume_id": rid},
        headers={"X-CSRF-Token": csrf}).status_code == 404
    assert browser.post("/api/v1/ats/analyze", json={
        "resume_id": rid, "job_description": "Software development with Python Kubernetes"},
        headers={"X-CSRF-Token": csrf}).status_code == 404


def test_free_ai_and_pdf_quotas(verified_user, monkeypatch):
    from app.api.v1.routers import ai
    browser = verified_user["client"]
    csrf = verified_user["csrf"]

    async def fake_generate(_prompt):
        return "Improved sentence based on supplied real experience"

    monkeypatch.setattr(ai.ai_service, "generate", fake_generate)
    for _ in range(5):
        r = browser.post("/api/v1/ai/optimize", json={
            "text": "Desarrollé un servicio interno", "context": "experience"},
            headers={"X-CSRF-Token": csrf})
        assert r.status_code == 200, r.text
    assert browser.post("/api/v1/ai/optimize", json={
        "text": "Desarrollé un servicio interno", "context": "experience"},
        headers={"X-CSRF-Token": csrf}).status_code == 403

    created = browser.post("/api/v1/resumes", json={
        "title": "Example", "template": "atlas", "personal": {"name": "John Doe"}},
        headers={"X-CSRF-Token": csrf})
    assert created.status_code == 201
    resume_id = created.json()["id"]
    for _ in range(3):
        r = browser.post("/api/v1/exports/pdf", json={"resume_id": resume_id},
            headers={"X-CSRF-Token": csrf})
        assert r.status_code == 200, r.text[:100]
        assert r.content.startswith(b"%PDF")
    assert browser.post("/api/v1/exports/pdf", json={"resume_id": resume_id},
        headers={"X-CSRF-Token": csrf}).status_code == 403


def test_free_user_cannot_use_bio_generator(verified_user):
    browser = verified_user["client"]
    csrf = verified_user["csrf"]
    r = browser.post("/api/v1/ai/bio", json={"platform": "linkedin", "tone": "professional"},
        headers={"X-CSRF-Token": csrf})
    assert r.status_code == 403
