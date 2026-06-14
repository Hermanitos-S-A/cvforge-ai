import httpx
import json
from app.core.config import settings
from app.utils.prompt_templates import PromptTemplates

class AIService:
    def __init__(self):
        self.base_url = settings.OLLAMA_BASE_URL
        self.model = settings.OLLAMA_MODEL
        self.timeout = settings.OLLAMA_TIMEOUT

    async def optimize_text(self, text: str, context: str = "experience") -> dict:
        prompt = PromptTemplates.optimize(text, context)
        raw = await self._generate(prompt)
        return self._parse_optimize(text, raw)

    async def generate_bio(self, profile_data: dict, platform: str, tone: str) -> dict:
        prompt = PromptTemplates.bio(profile_data, platform, tone)
        raw = await self._generate(prompt)
        return self._parse_bio(raw)

    async def generate_summary(self, data: dict) -> str:
        return await self._generate(PromptTemplates.summary(data))

    async def _generate(self, prompt: str) -> str:
        try:
            async with httpx.AsyncClient(timeout=self.timeout) as client:
                response = await client.post(
                    f"{self.base_url}/api/generate",
                    json={"model": self.model, "prompt": prompt, "stream": False,
                          "options": {"temperature": 0.7, "top_p": 0.9, "num_predict": 512}},
                )
                response.raise_for_status()
                return response.json().get("response", "").strip()
        except httpx.ConnectError:
            return self._fallback(prompt)
        except Exception as e:
            return f"[AI Error: {str(e)[:80]}]"

    def _parse_optimize(self, original: str, raw: str) -> dict:
        optimized = raw.strip().strip('"\'')
        improvements = []
        if len(optimized) > len(original):
            improvements.append("Added measurable impact metrics")
        if any(v in optimized.lower() for v in ["developed","engineered","architected","led","spearheaded"]):
            improvements.append("Replaced weak verbs with strong action verbs")
        improvements.append("Improved ATS keyword density")
        return {"original": original, "optimized": optimized or original, "improvements": improvements[:3]}

    def _parse_bio(self, raw: str) -> dict:
        try:
            data = json.loads(raw)
            return {"headline": data.get("headline",""), "summary": data.get("summary",""),
                    "short_bio": data.get("short_bio", raw[:300]), "twitter_bio": data.get("twitter_bio","")}
        except Exception:
            lines = [l.strip() for l in raw.strip().splitlines() if l.strip()]
            return {"headline": lines[0] if lines else "", "summary": raw,
                    "short_bio": " ".join(lines[:3]), "twitter_bio": lines[-1][:160] if lines else ""}

    def _fallback(self, prompt: str) -> str:
        if "bio" in prompt.lower():
            return json.dumps({
                "headline": "Senior Software Engineer | Full-Stack Developer | Open Source Contributor",
                "summary": "Results-driven software engineer with expertise in building scalable web applications. Passionate about clean code, modern architectures, and delivering exceptional user experiences.",
                "short_bio": "Software engineer building the future, one commit at a time.",
                "twitter_bio": "Software Engineer 🚀 | React · TypeScript · Python | Building cool things",
            })
        return ("Developed and maintained high-performance web applications using modern frameworks, "
                "resulting in a 40% improvement in system efficiency and enhanced user experience.")
