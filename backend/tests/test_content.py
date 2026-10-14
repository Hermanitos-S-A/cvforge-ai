import base64
from io import BytesIO
from PIL import Image
from app.services.portfolio_service import PortfolioService
from app.models import User


def test_portfolio_html_escapes_user_content_and_rejects_javascript_urls():
    html = PortfolioService().generate_html({
        "personal": {"name": '<script>alert(1)</script>',
                     "linkedin": "javascript:alert(1)", "github": "https://github.com/valid"},
        "summary": 'Hello <img src=x onerror=alert(1)>',
        "skills": [{"name": '<script>evil</script>'}],
        "projects": [{"name": "<b>Bad</b>", "description": "safe",
                      "github_url": "javascript:alert(1)", "demo_url": "https://demo.example"}],
    })
    assert "<script>alert(1)</script>" not in html
    assert "&lt;script&gt;" in html
    assert 'href="javascript:' not in html
    assert 'script-src \'none\'' in html
    assert 'rel="noopener noreferrer"' in html


def test_avatar_reencoded_as_webp_and_nosniff(verified_user, monkeypatch, tmp_path):
    import app.services.upload_service as upload_module
    import app.api.v1.routers.uploads as uploads_module
    browser, factory = verified_user["client"], verified_user["factory"]
    monkeypatch.setattr(upload_module, "UPLOAD_DIR", tmp_path)
    monkeypatch.setattr(uploads_module, "UPLOAD_DIR", tmp_path)
    with factory() as db:
        user = db.query(User).filter(User.email == verified_user["email"]).one()
        user.plan = "pro"
        db.commit()
    blob = BytesIO()
    Image.new("RGB", (100, 60), (48, 70, 120)).save(blob, format="PNG")
    data = base64.b64encode(blob.getvalue()).decode()
    csrf = verified_user["csrf"]
    response = browser.post("/api/v1/uploads/avatar", json={
        "base64_data": data, "content_type": "image/png"},
        headers={"X-CSRF-Token": csrf})
    assert response.status_code == 200, response.text
    image_name = response.json()["avatar_url"].split("/")[-1]
    assert len(image_name.split("_")[-1].split(".")[0]) == 32
    with Image.open(tmp_path / image_name) as image:
        assert image.format == "WEBP"
        assert not image.info.get("exif")
    assert response.headers["X-Content-Type-Options"] == "nosniff"
    too_large = browser.post("/api/v1/uploads/avatar", content=b"x" * (3 * 1024 * 1024 + 1),
        headers={"X-CSRF-Token": csrf})
    assert too_large.status_code == 413


def test_free_plan_cannot_export_pro_template(verified_user):
    browser = verified_user["client"]
    csrf = verified_user["csrf"]
    new_cv = browser.post("/api/v1/resumes", json={"title": "Example", "template": "atlas"},
        headers={"X-CSRF-Token": csrf})
    assert new_cv.status_code == 201, new_cv.text
    cv_id = new_cv.json()["id"]
    restricted = browser.post("/api/v1/exports/pdf", json={
        "resume_id": cv_id, "template": "zenith"}, headers={"X-CSRF-Token": csrf})
    assert restricted.status_code == 403
    assert browser.post("/api/v1/resumes", json={"template": "nexus"},
        headers={"X-CSRF-Token": csrf}).status_code == 403
