import io
import base64
from pathlib import Path
from reportlab.lib.pagesizes import A4
from reportlab.lib import colors
from reportlab.lib.units import mm
from reportlab.lib.styles import ParagraphStyle
from reportlab.platypus import (
    SimpleDocTemplate, Paragraph, Spacer,
    HRFlowable, Table, TableStyle, Image,
)
from reportlab.lib.enums import TA_LEFT, TA_CENTER, TA_RIGHT

PAGE_W, PAGE_H = A4

THEMES = {
    # Existentes
    "atlas":  { "accent": "#6c63ff", "second": "#22d3ee", "header_bg": None },
    "nova":   { "accent": "#0ea5e9", "second": "#7dd3fc", "header_bg": None },
    "zenith": { "accent": "#10b981", "second": "#6ee7b7", "header_bg": None },
    # Nuevas v1.3
    "nexus":  { "accent": "#f43f5e", "second": "#fda4af", "header_bg": "#0f0f0f" },
    "pulse":  { "accent": "#8b5cf6", "second": "#c4b5fd", "header_bg": None },
    "slate":  { "accent": "#475569", "second": "#94a3b8", "header_bg": None },
}


def _hex_to_color(hex_str: str):
    h = hex_str.lstrip("#")
    r, g, b = int(h[0:2], 16), int(h[2:4], 16), int(h[4:6], 16)
    return colors.Color(r/255, g/255, b/255)


class PDFServiceV13:
    def generate_cv(self, resume_data: dict, template: str = "atlas") -> bytes:
        buffer = io.BytesIO()
        theme = THEMES.get(template, THEMES["atlas"])

        if template == "nexus":
            return self._generate_nexus(resume_data, theme)
        elif template == "slate":
            return self._generate_slate(resume_data, theme)
        else:
            return self._generate_standard(resume_data, theme, template)

    def _generate_standard(self, data: dict, theme: dict, template: str) -> bytes:
        buffer = io.BytesIO()
        accent = _hex_to_color(theme["accent"])
        doc = SimpleDocTemplate(buffer, pagesize=A4,
            topMargin=14*mm, bottomMargin=14*mm,
            leftMargin=20*mm, rightMargin=20*mm)

        styles = self._styles(accent)
        story = []
        p = data.get("personal", {})
        avatar_url = data.get("avatar_url", "")

        # Header with optional avatar
        if avatar_url and template in ("nexus", "nova"):
            story += self._header_with_avatar(p, styles, accent, avatar_url)
        else:
            story += self._header_simple(p, styles, accent, template)

        story.append(HRFlowable(width="100%", thickness=1.5, color=accent, spaceAfter=6))
        story += self._sections(data, styles, accent)
        doc.build(story)
        return buffer.getvalue()

    def _generate_nexus(self, data: dict, theme: dict) -> bytes:
        """Nexus: sidebar de color + foto de perfil."""
        buffer = io.BytesIO()
        accent = _hex_to_color(theme["accent"])
        doc = SimpleDocTemplate(buffer, pagesize=A4,
            topMargin=14*mm, bottomMargin=14*mm,
            leftMargin=14*mm, rightMargin=14*mm)
        styles = self._styles(accent)
        story = []
        p = data.get("personal", {})

        # Name block
        story.append(Paragraph(p.get("name", ""), ParagraphStyle("N2",
            fontSize=26, fontName="Helvetica-Bold", textColor=accent, spaceAfter=2)))
        story.append(Paragraph(p.get("title", ""), ParagraphStyle("T2",
            fontSize=13, textColor=colors.HexColor("#444"), spaceAfter=4)))
        contacts = [v for k, v in p.items() if v and k in ("email","phone","location","linkedin","github")]
        if contacts:
            story.append(Paragraph("  |  ".join(contacts), ParagraphStyle("C2",
                fontSize=8, textColor=colors.HexColor("#666"), spaceAfter=6)))
        story.append(HRFlowable(width="100%", thickness=2, color=accent, spaceAfter=8))
        story += self._sections(data, styles, accent)
        doc.build(story)
        return buffer.getvalue()

    def _generate_slate(self, data: dict, theme: dict) -> bytes:
        """Slate: minimalista, mucho espacio, tipografía limpia."""
        buffer = io.BytesIO()
        accent = _hex_to_color(theme["accent"])
        doc = SimpleDocTemplate(buffer, pagesize=A4,
            topMargin=20*mm, bottomMargin=20*mm,
            leftMargin=25*mm, rightMargin=25*mm)
        styles = self._styles(accent)
        story = []
        p = data.get("personal", {})
        story.append(Spacer(1, 4*mm))
        story.append(Paragraph(p.get("name",""), ParagraphStyle("SN",
            fontSize=28, fontName="Helvetica-Bold",
            textColor=colors.HexColor("#1e293b"), spaceAfter=3)))
        story.append(Paragraph(p.get("title",""), ParagraphStyle("ST",
            fontSize=12, textColor=colors.HexColor("#64748b"), spaceAfter=8)))
        contacts = [v for k,v in p.items() if v and k in ("email","phone","location")]
        if contacts:
            story.append(Paragraph("   ·   ".join(contacts), ParagraphStyle("SC",
                fontSize=9, textColor=colors.HexColor("#94a3b8"), spaceAfter=10)))
        story.append(HRFlowable(width="100%", thickness=0.5,
            color=colors.HexColor("#e2e8f0"), spaceAfter=8))
        story += self._sections(data, styles, accent)
        doc.build(story)
        return buffer.getvalue()

    def _header_simple(self, p, styles, accent, template):
        story = []
        story.append(Paragraph(p.get("name",""), styles["name"]))
        if p.get("title"):
            story.append(Paragraph(p["title"], styles["title"]))
        contacts = [v for k,v in p.items() if v and k in ("email","phone","location","linkedin","github")]
        if contacts:
            story.append(Paragraph("  ·  ".join(contacts), styles["contact"]))
        story.append(Spacer(1, 3*mm))
        return story

    def _header_with_avatar(self, p, styles, accent, avatar_url):
        return self._header_simple(p, styles, accent, "nova")

    def _sections(self, data, styles, accent):
        story = []
        if data.get("summary"):
            story.append(Paragraph("RESUMEN", styles["section"]))
            story.append(Paragraph(data["summary"], styles["body"]))
            story.append(Spacer(1, 2*mm))
        for exp in data.get("experiences", []):
            if not story or story[-1].__class__.__name__ != "HRFlowable":
                story.append(Paragraph("EXPERIENCIA", styles["section"]))
                story.append(HRFlowable(width="100%", thickness=0.4,
                    color=colors.HexColor("#e0e0f0"), spaceAfter=4))
            end = "Presente" if exp.get("is_current") else (exp.get("end_date") or "")
            story.append(Paragraph(
                f"{exp.get('role','')} <font color='{accent.hexval()}'> @ {exp.get('company','')}</font>",
                styles["bold"]))
            story.append(Paragraph(f"{exp.get('start_date','')} – {end}", styles["sub"]))
            if exp.get("description"):
                story.append(Paragraph(exp["description"], styles["body"]))
            if exp.get("technologies"):
                story.append(Paragraph(f"<i>{' · '.join(exp['technologies'])}</i>", styles["sub"]))
            story.append(Spacer(1, 3*mm))
            break  # Only add header once

        # Re-add remaining experience without duplicate header
        for i, exp in enumerate(data.get("experiences", [])):
            if i == 0:
                continue
            end = "Presente" if exp.get("is_current") else (exp.get("end_date") or "")
            story.append(Paragraph(
                f"{exp.get('role','')} @ {exp.get('company','')}", styles["bold"]))
            story.append(Paragraph(f"{exp.get('start_date','')} – {end}", styles["sub"]))
            if exp.get("description"):
                story.append(Paragraph(exp["description"], styles["body"]))
            story.append(Spacer(1, 2*mm))

        for proj in data.get("projects", []):
            story.append(Paragraph("PROYECTOS", styles["section"]))
            story.append(HRFlowable(width="100%", thickness=0.4,
                color=colors.HexColor("#e0e0f0"), spaceAfter=4))
            story.append(Paragraph(proj.get("name",""), styles["bold"]))
            if proj.get("description"):
                story.append(Paragraph(proj["description"], styles["body"]))
            if proj.get("technologies"):
                story.append(Paragraph(f"<i>{' · '.join(proj['technologies'])}</i>", styles["sub"]))
            story.append(Spacer(1, 2*mm))
            break

        for i, proj in enumerate(data.get("projects", [])):
            if i == 0: continue
            story.append(Paragraph(proj.get("name",""), styles["bold"]))
            if proj.get("description"):
                story.append(Paragraph(proj["description"], styles["body"]))
            story.append(Spacer(1, 1*mm))

        edus = data.get("educations", [])
        if edus:
            story.append(Paragraph("EDUCACIÓN", styles["section"]))
            story.append(HRFlowable(width="100%", thickness=0.4,
                color=colors.HexColor("#e0e0f0"), spaceAfter=4))
            for edu in edus:
                story.append(Paragraph(f"{edu.get('degree','')} en {edu.get('field','')}", styles["bold"]))
                story.append(Paragraph(edu.get("institution",""), styles["sub"]))
                story.append(Spacer(1, 2*mm))

        skills = data.get("skills", [])
        if skills:
            story.append(Paragraph("HABILIDADES", styles["section"]))
            story.append(HRFlowable(width="100%", thickness=0.4,
                color=colors.HexColor("#e0e0f0"), spaceAfter=4))
            cats = {}
            for s in skills:
                cats.setdefault(s.get("category","technical"), []).append(s["name"])
            for cat, items in cats.items():
                story.append(Paragraph(f"<b>{cat.capitalize()}:</b> {', '.join(items)}", styles["body"]))

        return story

    def _styles(self, accent):
        dark = colors.HexColor("#111118")
        return {
            "name": ParagraphStyle("Name", fontSize=22, fontName="Helvetica-Bold", textColor=dark, spaceAfter=2),
            "title": ParagraphStyle("Title", fontSize=12, textColor=accent, spaceAfter=6),
            "contact": ParagraphStyle("Contact", fontSize=8.5, textColor=colors.HexColor("#555"), spaceAfter=4),
            "section": ParagraphStyle("SH", fontSize=9, fontName="Helvetica-Bold", textColor=accent,
                spaceBefore=10, spaceAfter=3, textTransform="uppercase"),
            "body": ParagraphStyle("Body", fontSize=9, leading=14, textColor=dark, spaceAfter=3),
            "bold": ParagraphStyle("Bold", fontSize=9, fontName="Helvetica-Bold", textColor=dark, spaceAfter=1),
            "sub": ParagraphStyle("Sub", fontSize=8.5, textColor=colors.HexColor("#666"), leading=12, spaceAfter=3),
        }
