import re
from dataclasses import dataclass, field

IMPACT_VERBS = {
    "architected","engineered","spearheaded","accelerated","optimized",
    "designed","implemented","led","delivered","scaled","reduced",
    "increased","launched","built","developed","established",
    "deployed","automated","streamlined","mentored","migrated",
    "integrated","refactored","pioneered","transformed",
}

WEAK_VERBS = {
    "helped":"accelerated","did":"executed","made":"developed",
    "worked on":"contributed to","was responsible for":"owned",
    "assisted":"supported","participated in":"collaborated on",
    "handled":"managed","dealt with":"resolved",
}

REQUIRED_SECTIONS = {"experience","education","skills","projects","summary"}
TECH_PATTERN = re.compile(r'\b(?:[A-Z][a-zA-Z0-9+#.]*|kubernetes|docker|postgres|mongodb|redis|graphql|typescript|javascript|python|golang|rust|terraform)\b')
QUANTITY_PATTERN = re.compile(r'\b\d+%|\$\d+|\d+[KkMmBb]\b|\d+ (users|customers|requests|services|teams?)')

@dataclass
class ATSResult:
    score: int
    keywords_found: list = field(default_factory=list)
    keywords_missing: list = field(default_factory=list)
    weak_verbs: list = field(default_factory=list)
    suggestions: list = field(default_factory=list)
    section_scores: dict = field(default_factory=dict)

class ATSEngine:
    def analyze(self, resume_text: str, job_description: str) -> ATSResult:
        jd_keywords = self._extract_keywords(job_description)
        resume_lower = resume_text.lower()
        found = [kw for kw in jd_keywords if kw.lower() in resume_lower]
        missing = [kw for kw in jd_keywords if kw.lower() not in resume_lower]
        keyword_score = self._pct(len(found), len(jd_keywords))
        verb_score = self._score_verbs(resume_text)
        quant_score = self._score_quant(resume_text)
        format_score = self._score_format(resume_text)
        total = int(keyword_score * .45 + verb_score * .25 + quant_score * .15 + format_score * .15)
        return ATSResult(
            score=min(total, 100),
            keywords_found=found,
            keywords_missing=missing,
            weak_verbs=self._weak_verbs(resume_text),
            suggestions=self._suggestions(missing, resume_text),
            section_scores={"keywords": int(keyword_score), "impact_verbs": verb_score, "quantification": quant_score, "format": format_score},
        )

    def _extract_keywords(self, text):
        matches = TECH_PATTERN.findall(text)
        seen, result = set(), []
        for m in matches:
            if m.lower() not in seen:
                seen.add(m.lower()); result.append(m)
        return result[:25]

    def _score_verbs(self, text):
        return min(sum(1 for v in IMPACT_VERBS if v in text.lower()) * 12, 100)

    def _score_quant(self, text):
        return min(len(QUANTITY_PATTERN.findall(text)) * 20, 100)

    def _score_format(self, text):
        found = sum(1 for s in REQUIRED_SECTIONS if s in text.lower())
        return int(self._pct(found, len(REQUIRED_SECTIONS)))

    def _weak_verbs(self, text):
        t = text.lower()
        return [{"weak": w, "suggested": s} for w, s in WEAK_VERBS.items() if w in t]

    def _suggestions(self, missing, resume_text):
        s = [f"Add '{kw}' to your experience or skills section" for kw in missing[:3]]
        if not QUANTITY_PATTERN.search(resume_text):
            s.append("Add quantifiable results (e.g., 'improved performance by 40%')")
        return s

    @staticmethod
    def _pct(n, d):
        return (n / d * 100) if d else 100.0
