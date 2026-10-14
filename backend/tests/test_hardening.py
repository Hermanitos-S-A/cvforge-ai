from app.models import User, Resume, AIGeneration
from app.services.pdf_service import PDFService
from app.api.v1.routers.resumes import FREE_TEMPLATES
from app.core.security import hash_password, utcnow


def test_every_pdf_template_safely_handles_user_markup():
    data = {
        "personal": {"name": "Alice & Bob <test>", "title": "Engineer"},
        "summary": "<img src=x onerror=alert(1)> & professional",
        "experiences": [{"role": "Developer", "company": "<em>Untrusted</em>",
                         "description": "Established measurable results", "technologies": ["TypeScript", "Go"]}],
        "projects": [{"name": "Demo <script>", "description": "Safe demo", "technologies": []}],
        "skills": [{"name": "Rust & Go", "category": "technical"}],
    }
    for template in ("atlas", "nova", "zenith", "nexus", "pulse", "slate"):
        pdf = PDFService().generate_cv(data, template)
        assert pdf[:4] == b"%PDF"
        assert len(pdf) > 1000


def test_admin_role_cannot_be_set_by_user_payload(verified_user):
    browser = verified_user["client"]
    current = browser.get("/api/v1/auth/me").json()
    assert current["role"] == "user"
    assert current["plan"] == "free"
    csrf = verified_user["csrf"]
    # Unexpected fields are ignored by the registration contract; update
    # endpoints cannot set privileged role/plan attributes.
    assert browser.post("/api/v1/resumes", json={"title": "Personal", "template": "atlas",
        "role": "admin", "plan": "pro"}, headers={"X-CSRF-Token": csrf}).status_code == 201
    after = browser.get("/api/v1/auth/me").json()
    assert after["role"] == "user"
    assert after["plan"] == "free"

