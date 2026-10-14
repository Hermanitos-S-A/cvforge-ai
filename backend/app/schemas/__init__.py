from pydantic import BaseModel, EmailStr, Field, field_validator, ConfigDict
from typing import Annotated
from pydantic import StringConstraints
from typing import Optional, List
from datetime import datetime

class RegisterRequest(BaseModel):
    email: EmailStr
    password: str = Field(min_length=12, max_length=72)
    full_name: str = Field(min_length=1, max_length=200)

    @field_validator("password")
    @classmethod
    def password_strength(cls, v):
        if not 12 <= len(v.encode("utf-8")) <= 72:
            raise ValueError("Password must be 12-72 UTF-8 bytes")
        if not any(c.isalpha() for c in v) or not any(c.isdigit() for c in v):
            raise ValueError("Password must contain letters and numbers")
        return v

class LoginRequest(BaseModel):
    email: EmailStr
    password: str = Field(min_length=1, max_length=72)

class TokenResponse(BaseModel):
    access_token: str
    refresh_token: str
    token_type: str = "bearer"

class UserResponse(BaseModel):
    id: int
    email: str
    full_name: Optional[str]
    role: str
    plan: str
    is_active: bool
    created_at: datetime
    model_config = ConfigDict(from_attributes=True)

class PersonalInfo(BaseModel):
    name: Optional[str] = Field(default="", max_length=200)
    title: Optional[str] = Field(default="", max_length=200)
    email: Optional[str] = Field(default="", max_length=255)
    phone: Optional[str] = Field(default="", max_length=80)
    location: Optional[str] = Field(default="", max_length=200)
    linkedin: Optional[str] = Field(default="", max_length=500)
    github: Optional[str] = Field(default="", max_length=500)
    portfolio: Optional[str] = Field(default="", max_length=500)

class ExperienceCreate(BaseModel):
    company: str = Field(min_length=1, max_length=200)
    role: str = Field(min_length=1, max_length=200)
    description: Optional[str] = Field(default="", max_length=6000)
    technologies: list[Annotated[str, StringConstraints(max_length=80)]] = Field(default_factory=list, max_length=30)
    start_date: Optional[str] = Field(default="", max_length=30)
    end_date: Optional[str] = Field(default="", max_length=30)
    is_current: bool = False

class ExperienceResponse(ExperienceCreate):
    id: int
    sort_order: int = 0
    model_config = ConfigDict(from_attributes=True)

class EducationCreate(BaseModel):
    institution: str = Field(min_length=1, max_length=200)
    degree: Optional[str] = Field(default="", max_length=200)
    field: Optional[str] = Field(default="", max_length=200)
    start_date: Optional[str] = Field(default="", max_length=30)
    end_date: Optional[str] = Field(default="", max_length=30)
    is_current: bool = False
    description: Optional[str] = Field(default="", max_length=6000)

class EducationResponse(EducationCreate):
    id: int
    model_config = ConfigDict(from_attributes=True)

class SkillCreate(BaseModel):
    name: str = Field(min_length=1, max_length=200)
    category: str = Field(default="technical", max_length=50)
    level: str = Field(default="intermediate", max_length=40)

class SkillResponse(SkillCreate):
    id: int
    model_config = ConfigDict(from_attributes=True)

class ProjectCreate(BaseModel):
    name: str = Field(min_length=1, max_length=200)
    description: Optional[str] = Field(default="", max_length=6000)
    technologies: list[Annotated[str, StringConstraints(max_length=80)]] = Field(default_factory=list, max_length=30)
    github_url: Optional[str] = Field(default="", max_length=500)
    demo_url: Optional[str] = Field(default="", max_length=500)
    featured: bool = False

class ProjectResponse(ProjectCreate):
    id: int
    model_config = ConfigDict(from_attributes=True)

class ResumeCreate(BaseModel):
    title: str = Field(default="My Resume", max_length=200)
    template: str = Field(default="atlas", max_length=50)
    personal: PersonalInfo = Field(default_factory=PersonalInfo)
    summary: Optional[str] = Field(default="", max_length=6000)

class ResumeUpdate(BaseModel):
    title: Optional[str] = Field(default=None, max_length=200)
    template: Optional[str] = Field(default=None, max_length=50)
    personal: Optional[PersonalInfo] = None
    summary: Optional[str] = Field(default=None, max_length=6000)

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
    model_config = ConfigDict(from_attributes=True)

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
    job_description: str = Field(min_length=20, max_length=15000)

class ATSResult(BaseModel):
    score: int
    keywords_found: List[str]
    keywords_missing: List[str]
    weak_verbs: List[dict]
    suggestions: List[str]
    section_scores: dict

class ExportRequest(BaseModel):
    resume_id: int
    template: Optional[str] = Field(default=None, max_length=50)
    format: str = "pdf"
