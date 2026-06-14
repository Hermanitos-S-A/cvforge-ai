from pydantic import BaseModel, EmailStr, field_validator
from typing import Optional, List
from datetime import datetime

class RegisterRequest(BaseModel):
    email: EmailStr
    password: str
    full_name: str

    @field_validator("password")
    @classmethod
    def password_strength(cls, v):
        if len(v) < 8:
            raise ValueError("Password must be at least 8 characters")
        return v

class LoginRequest(BaseModel):
    email: EmailStr
    password: str

class TokenResponse(BaseModel):
    access_token: str
    refresh_token: str
    token_type: str = "bearer"

class UserResponse(BaseModel):
    id: int
    email: str
    full_name: Optional[str]
    plan: str
    is_active: bool
    created_at: datetime
    class Config:
        from_attributes = True

class PersonalInfo(BaseModel):
    name: Optional[str] = ""
    title: Optional[str] = ""
    email: Optional[str] = ""
    phone: Optional[str] = ""
    location: Optional[str] = ""
    linkedin: Optional[str] = ""
    github: Optional[str] = ""
    portfolio: Optional[str] = ""

class ExperienceCreate(BaseModel):
    company: str
    role: str
    description: Optional[str] = ""
    technologies: List[str] = []
    start_date: Optional[str] = ""
    end_date: Optional[str] = ""
    is_current: bool = False

class ExperienceResponse(ExperienceCreate):
    id: int
    sort_order: int = 0
    class Config:
        from_attributes = True

class EducationCreate(BaseModel):
    institution: str
    degree: Optional[str] = ""
    field: Optional[str] = ""
    start_date: Optional[str] = ""
    end_date: Optional[str] = ""
    is_current: bool = False
    description: Optional[str] = ""

class EducationResponse(EducationCreate):
    id: int
    class Config:
        from_attributes = True

class SkillCreate(BaseModel):
    name: str
    category: str = "technical"
    level: str = "intermediate"

class SkillResponse(SkillCreate):
    id: int
    class Config:
        from_attributes = True

class ProjectCreate(BaseModel):
    name: str
    description: Optional[str] = ""
    technologies: List[str] = []
    github_url: Optional[str] = ""
    demo_url: Optional[str] = ""
    featured: bool = False

class ProjectResponse(ProjectCreate):
    id: int
    class Config:
        from_attributes = True

class ResumeCreate(BaseModel):
    title: str = "My Resume"
    template: str = "atlas"
    personal: PersonalInfo = PersonalInfo()
    summary: Optional[str] = ""

class ResumeUpdate(BaseModel):
    title: Optional[str] = None
    template: Optional[str] = None
    personal: Optional[PersonalInfo] = None
    summary: Optional[str] = None

class ResumeResponse(BaseModel):
    id: int
    title: str
    template: str
    personal: dict
    summary: Optional[str]
    ats_score: float
    created_at: datetime
    updated_at: datetime
    experiences: List[ExperienceResponse] = []
    educations: List[EducationResponse] = []
    skills: List[SkillResponse] = []
    projects: List[ProjectResponse] = []
    class Config:
        from_attributes = True

class OptimizeRequest(BaseModel):
    text: str
    context: str = "experience"

class OptimizeResponse(BaseModel):
    original: str
    optimized: str
    improvements: List[str] = []

class BioRequest(BaseModel):
    platform: str = "linkedin"
    tone: str = "professional"

class BioResponse(BaseModel):
    headline: str
    summary: str
    short_bio: str
    twitter_bio: Optional[str] = ""

class SummaryRequest(BaseModel):
    years_experience: int = 0
    industry: str = ""
    achievement: str = ""
    technologies: str = ""

class ATSAnalyzeRequest(BaseModel):
    resume_id: int
    job_description: str

class ATSResult(BaseModel):
    score: int
    keywords_found: List[str]
    keywords_missing: List[str]
    weak_verbs: List[dict]
    suggestions: List[str]
    section_scores: dict

class ExportRequest(BaseModel):
    resume_id: int
    template: Optional[str] = None
    format: str = "pdf"
