import io
from reportlab.lib.pagesizes import A4
from reportlab.lib import colors
from reportlab.lib.units import mm
from reportlab.lib.styles import ParagraphStyle
from reportlab.platypus import SimpleDocTemplate, Paragraph, Spacer, HRFlowable
from reportlab.lib.enums import TA_LEFT

THEMES = {
    "atlas":  {"accent": colors.HexColor("#6c63ff"), "light": colors.HexColor("#ede9fe")},
    "nova":   {"accent": colors.HexColor("#0ea5e9"), "light": colors.HexColor("#e0f2fe")},
    "zenith": {"accent": colors.HexColor("#10b981"), "light": colors.HexColor("#d1fae5")},
}

class PDFService:
    def generate_cv(self, resume_data: dict, template: str = "atlas") -> bytes:
        buffer = io.BytesIO()
        theme = THEMES.get(template, THEMES["atlas"])
        doc = SimpleDocTemplate(buffer, pagesize=A4,
            topMargin=14*mm, bottomMargin=14*mm, leftMargin=20*mm, rightMargin=20*mm)
        styles = self._styles(theme)
        doc.build(self._story(resume_data, styles, theme))
        return buffer.getvalue()

    def _styles(self, theme):
        a = theme["accent"]
        dark = colors.HexColor("#111118")
        return {
            "name": ParagraphStyle("Name", fontSize=22, fontName="Helvetica-Bold", textColor=dark, spaceAfter=2),
            "title": ParagraphStyle("Title", fontSize=12, textColor=a, spaceAfter=6),
            "contact": ParagraphStyle("Contact", fontSize=8.5, textColor=colors.HexColor("#555566"), spaceAfter=4),
            "section": ParagraphStyle("SH", fontSize=10, fontName="Helvetica-Bold", textColor=a, spaceBefore=10, spaceAfter=3),
            "body": ParagraphStyle("Body", fontSize=9, leading=14, textColor=dark, spaceAfter=3),
            "bold": ParagraphStyle("Bold", fontSize=9, fontName="Helvetica-Bold", textColor=dark, spaceAfter=1),
            "sub": ParagraphStyle("Sub", fontSize=8.5, textColor=colors.HexColor("#666677"), leading=12, spaceAfter=3),
        }

    def _story(self, data, styles, theme):
        story = []
        p = data.get("personal", {})
        a = theme["accent"]
        # Header
        if p.get("name"): story.append(Paragraph(p["name"], styles["name"]))
        if p.get("title"): story.append(Paragraph(p["title"], styles["title"]))
        contacts = [p.get(k) for k in ("email","phone","location","linkedin","github") if p.get(k)]
        if contacts: story.append(Paragraph("  ·  ".join(contacts), styles["contact"]))
        story.append(Spacer(1, 3*mm))
        story.append(HRFlowable(width="100%", thickness=1.5, color=a, spaceAfter=6))
        # Summary
        if data.get("summary"):
            story.append(Paragraph("SUMMARY", styles["section"]))
            story.append(Paragraph(data["summary"], styles["body"]))
        # Experience
        exps = data.get("experiences", [])
        if exps:
            story.append(Paragraph("EXPERIENCE", styles["section"]))
            story.append(HRFlowable(width="100%", thickness=0.5, color=colors.HexColor("#e0e0f0"), spaceAfter=4))
            for e in exps:
                end = "Present" if e.get("is_current") else (e.get("end_date") or "")
                story.append(Paragraph(f"{e.get('role','')} @ {e.get('company','')}", styles["bold"]))
                story.append(Paragraph(f"{e.get('start_date','')} – {end}", styles["sub"]))
                if e.get("description"):
                    story.append(Paragraph(e["description"], styles["body"]))
                if e.get("technologies"):
                    story.append(Paragraph(f"<i>{' · '.join(e['technologies'])}</i>", styles["sub"]))
                story.append(Spacer(1, 3*mm))
        # Projects
        projs = data.get("projects", [])
        if projs:
            story.append(Paragraph("PROJECTS", styles["section"]))
            story.append(HRFlowable(width="100%", thickness=0.5, color=colors.HexColor("#e0e0f0"), spaceAfter=4))
            for pr in projs:
                story.append(Paragraph(pr.get("name",""), styles["bold"]))
                if pr.get("description"): story.append(Paragraph(pr["description"], styles["body"]))
                if pr.get("technologies"): story.append(Paragraph(f"<i>{' · '.join(pr['technologies'])}</i>", styles["sub"]))
                story.append(Spacer(1, 2*mm))
        # Education
        edus = data.get("educations", [])
        if edus:
            story.append(Paragraph("EDUCATION", styles["section"]))
            story.append(HRFlowable(width="100%", thickness=0.5, color=colors.HexColor("#e0e0f0"), spaceAfter=4))
            for edu in edus:
                degree = f"{edu.get('degree','')} in {edu.get('field','')}".strip(" in")
                story.append(Paragraph(degree, styles["bold"]))
                story.append(Paragraph(edu.get("institution",""), styles["sub"]))
                story.append(Spacer(1, 2*mm))
        # Skills
        skills = data.get("skills", [])
        if skills:
            story.append(Paragraph("SKILLS", styles["section"]))
            story.append(HRFlowable(width="100%", thickness=0.5, color=colors.HexColor("#e0e0f0"), spaceAfter=4))
            cats = {}
            for s in skills:
                cats.setdefault(s.get("category","technical"), []).append(s["name"])
            for cat, items in cats.items():
                story.append(Paragraph(f"<b>{cat.capitalize()}:</b> {', '.join(items)}", styles["body"]))
        return story
