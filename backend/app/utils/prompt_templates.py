class PromptTemplates:

    @staticmethod
    def optimize(text: str, context: str = "experience") -> str:
        guides = {
            "experience": "a professional job description bullet point with strong action verbs and quantifiable achievements",
            "summary": "a compelling professional summary for a CV",
            "project": "a concise project description highlighting technical impact",
            "ats": "resume text optimized for ATS with relevant industry keywords",
        }
        guide = guides.get(context, guides["experience"])
        return f"""You are an expert CV writer. Rewrite the following as {guide}.
Rules: Use strong action verbs (Engineered, Architected, Spearheaded, etc.), add metrics where possible, keep it concise (1-3 sentences), make it ATS-friendly.
Return ONLY the rewritten text, no explanation.

Original: "{text}"
Rewritten:"""

    @staticmethod
    def bio(profile_data: dict, platform: str, tone: str) -> str:
        name = profile_data.get("name", "")
        personal = profile_data.get("personal", {})
        title = personal.get("title", "")
        experiences = profile_data.get("experiences", [])
        skills = profile_data.get("skills", [])
        exp_text = ", ".join([f"{e['role']} at {e['company']}" for e in experiences[:2]])
        skills_text = ", ".join(skills[:8])
        rules = {
            "linkedin": "LinkedIn profile summary (150-300 words, professional, first-person)",
            "twitter": "Twitter/X bio (max 160 characters, punchy)",
            "portfolio": "portfolio website bio (2-3 sentences, memorable)",
            "github": "GitHub profile bio (technical, concise)",
        }
        rule = rules.get(platform, rules["linkedin"])
        return f"""Create a {rule} for this person.
Name: {name}, Title: {title}, Experience: {exp_text}, Skills: {skills_text}, Tone: {tone}
Respond ONLY with valid JSON: {{"headline":"...","summary":"...","short_bio":"...","twitter_bio":"..."}}"""

    @staticmethod
    def summary(data: dict) -> str:
        return f"""Write a professional executive CV summary (3-4 sentences, first-person).
Years: {data.get('years_experience',5)}, Industry: {data.get('industry','Software')}, Achievement: {data.get('achievement','')}, Tech: {data.get('technologies','')}
Return ONLY the summary text:"""

    @staticmethod
    def ats_improve(text: str, missing_keywords: list) -> str:
        return f"""Rewrite this resume text to naturally include these keywords: {', '.join(missing_keywords)}.
Keep professional tone and original meaning. Return ONLY the improved text.

Original: "{text}"
Improved:"""
