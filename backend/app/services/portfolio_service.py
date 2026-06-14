class PortfolioService:
    def generate_html(self, data: dict) -> str:
        p = data.get("personal", {})
        name = p.get("name", "Developer")
        title = p.get("title", "Software Engineer")
        bio = data.get("summary", "")
        skills_html = "".join(f'<span class="pill">{s["name"]}</span>' for s in data.get("skills", []))
        exp_html = ""
        for e in data.get("experiences", []):
            end = "Present" if e.get("is_current") else (e.get("end_date") or "")
            exp_html += f'<div class="tl-item"><div class="tl-marker"></div><div class="tl-content"><h3>{e.get("role","")}</h3><span class="tl-company">{e.get("company","")}</span><span class="tl-date">{e.get("start_date","")} – {end}</span><p>{e.get("description","")}</p></div></div>'
        proj_html = ""
        for pr in data.get("projects", []):
            techs = "".join(f'<span class="tag">{t}</span>' for t in (pr.get("technologies") or []))
            links = ""
            if pr.get("github_url"): links += f'<a href="{pr["github_url"]}" target="_blank">GitHub ↗</a> '
            if pr.get("demo_url"): links += f'<a href="{pr["demo_url"]}" target="_blank">Live Demo ↗</a>'
            proj_html += f'<div class="proj-card"><h3>{pr.get("name","")}</h3><p>{pr.get("description","")}</p><div class="tags">{techs}</div><div class="proj-links">{links}</div></div>'
        email_link = f'<a href="mailto:{p["email"]}">Email</a>' if p.get("email") else ""
        linkedin_link = f'<a href="{p["linkedin"]}" target="_blank">LinkedIn</a>' if p.get("linkedin") else ""
        github_link = f'<a href="{p["github"]}" target="_blank">GitHub</a>' if p.get("github") else ""
        return f"""<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8"/><meta name="viewport" content="width=device-width,initial-scale=1.0"/>
<title>{name} — Portfolio</title>
<style>
*{{margin:0;padding:0;box-sizing:border-box;}}
:root{{--bg:#0a0a0f;--bg2:#111118;--bg3:#16161f;--border:#ffffff14;--text:#e8e8f0;--text2:#9090a8;--accent:#6c63ff;--accent2:#a78bfa;}}
html{{scroll-behavior:smooth;}}
body{{background:var(--bg);color:var(--text);font-family:'Segoe UI',system-ui,sans-serif;line-height:1.7;}}
a{{color:var(--accent2);text-decoration:none;}}a:hover{{text-decoration:underline;}}
.hero{{min-height:100vh;display:flex;align-items:center;justify-content:center;text-align:center;padding:40px 20px;background:radial-gradient(ellipse at 50% 0%,#6c63ff18 0%,transparent 70%);}}
.hero h1{{font-size:clamp(2.5rem,6vw,4.5rem);font-weight:800;letter-spacing:-1.5px;background:linear-gradient(135deg,#e8e8f0,#a78bfa);-webkit-background-clip:text;-webkit-text-fill-color:transparent;background-clip:text;}}
.hero .role{{font-size:1.2rem;color:var(--accent2);margin:10px 0 20px;}}
.hero .bio{{max-width:600px;margin:0 auto 30px;color:var(--text2);}}
.social-links{{display:flex;justify-content:center;gap:12px;flex-wrap:wrap;}}
.social-links a{{padding:8px 20px;border-radius:30px;border:1px solid var(--border);font-size:.9rem;color:var(--text2);transition:all .2s;}}
.social-links a:hover{{background:var(--accent);border-color:var(--accent);color:#fff;text-decoration:none;}}
section{{padding:80px 20px;max-width:1000px;margin:0 auto;}}
.section-title{{font-size:1.8rem;font-weight:700;margin-bottom:40px;display:flex;align-items:center;gap:12px;}}
.section-title::after{{content:'';flex:1;height:1px;background:var(--border);}}
.pills{{display:flex;flex-wrap:wrap;gap:10px;}}
.pill{{background:var(--bg3);border:1px solid var(--border);border-radius:30px;padding:6px 16px;font-size:.85rem;color:var(--text2);}}
.timeline{{position:relative;padding-left:30px;}}
.timeline::before{{content:'';position:absolute;left:7px;top:0;bottom:0;width:1px;background:var(--border);}}
.tl-item{{position:relative;margin-bottom:36px;}}
.tl-marker{{position:absolute;left:-26px;top:5px;width:10px;height:10px;border-radius:50%;background:var(--accent);border:2px solid var(--bg);}}
.tl-content h3{{font-size:1rem;font-weight:600;}}
.tl-company{{color:var(--accent2);font-size:.9rem;display:block;margin:2px 0;}}
.tl-date{{color:var(--text2);font-size:.8rem;display:block;margin-bottom:8px;}}
.tl-content p{{color:var(--text2);font-size:.9rem;}}
.projects-grid{{display:grid;grid-template-columns:repeat(auto-fill,minmax(280px,1fr));gap:20px;}}
.proj-card{{background:var(--bg2);border:1px solid var(--border);border-radius:16px;padding:24px;transition:border-color .2s;}}
.proj-card:hover{{border-color:var(--accent);}}
.proj-card h3{{font-size:1rem;font-weight:600;margin-bottom:10px;}}
.proj-card p{{color:var(--text2);font-size:.88rem;margin-bottom:14px;}}
.tags{{display:flex;flex-wrap:wrap;gap:6px;margin-bottom:14px;}}
.tag{{background:var(--bg3);border:1px solid var(--border);border-radius:4px;font-size:.75rem;padding:2px 8px;color:var(--text2);}}
.proj-links{{display:flex;gap:12px;font-size:.85rem;}}
footer{{text-align:center;padding:40px 20px;color:var(--text2);font-size:.85rem;border-top:1px solid var(--border);}}
footer strong{{color:var(--accent2);}}
@media(max-width:600px){{.projects-grid{{grid-template-columns:1fr;}}}}
</style>
</head>
<body>
<section class="hero"><div>
<h1>{name}</h1><p class="role">{title}</p><p class="bio">{bio}</p>
<div class="social-links">{email_link}{linkedin_link}{github_link}</div>
</div></section>
{"<section><h2 class='section-title'>Skills</h2><div class='pills'>" + skills_html + "</div></section>" if skills_html else ""}
{"<section><h2 class='section-title'>Experience</h2><div class='timeline'>" + exp_html + "</div></section>" if exp_html else ""}
{"<section><h2 class='section-title'>Projects</h2><div class='projects-grid'>" + proj_html + "</div></section>" if proj_html else ""}
<footer>Built with <strong>CVForge AI</strong> · {name}</footer>
</body></html>"""
