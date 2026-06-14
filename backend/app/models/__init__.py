from datetime import datetime
from sqlalchemy import Column, Integer, String, Text, Boolean, ForeignKey, DateTime, JSON, Float
from sqlalchemy.orm import relationship
from app.core.database import Base

class User(Base):
    __tablename__ = "users"
    id = Column(Integer, primary_key=True, index=True)
    email = Column(String(255), unique=True, index=True, nullable=False)
    hashed_password = Column(String(255), nullable=False)
    full_name = Column(String(200))
    is_active = Column(Boolean, default=True)
    plan = Column(String(20), default="free")
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    resumes = relationship("Resume", back_populates="user", cascade="all, delete-orphan")
    ai_generations = relationship("AIGeneration", back_populates="user", cascade="all, delete-orphan")

class Resume(Base):
    __tablename__ = "resumes"
    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    title = Column(String(200), nullable=False, default="My Resume")
    template = Column(String(50), default="atlas")
    is_default = Column(Boolean, default=False)
    personal = Column(JSON, default={})
    summary = Column(Text)
    ats_score = Column(Float, default=0.0)
    ats_data = Column(JSON, default={})
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    user = relationship("User", back_populates="resumes")
    experiences = relationship("Experience", back_populates="resume", cascade="all, delete-orphan")
    educations = relationship("Education", back_populates="resume", cascade="all, delete-orphan")
    skills = relationship("Skill", back_populates="resume", cascade="all, delete-orphan")
    projects = relationship("Project", back_populates="resume", cascade="all, delete-orphan")

class Experience(Base):
    __tablename__ = "experiences"
    id = Column(Integer, primary_key=True, index=True)
    resume_id = Column(Integer, ForeignKey("resumes.id"), nullable=False)
    company = Column(String(200), nullable=False)
    role = Column(String(200), nullable=False)
    description = Column(Text)
    technologies = Column(JSON, default=[])
    start_date = Column(String(20))
    end_date = Column(String(20))
    is_current = Column(Boolean, default=False)
    sort_order = Column(Integer, default=0)
    resume = relationship("Resume", back_populates="experiences")

class Education(Base):
    __tablename__ = "educations"
    id = Column(Integer, primary_key=True, index=True)
    resume_id = Column(Integer, ForeignKey("resumes.id"), nullable=False)
    institution = Column(String(200), nullable=False)
    degree = Column(String(200))
    field = Column(String(200))
    start_date = Column(String(20))
    end_date = Column(String(20))
    is_current = Column(Boolean, default=False)
    description = Column(Text)
    sort_order = Column(Integer, default=0)
    resume = relationship("Resume", back_populates="educations")

class Skill(Base):
    __tablename__ = "skills"
    id = Column(Integer, primary_key=True, index=True)
    resume_id = Column(Integer, ForeignKey("resumes.id"), nullable=False)
    name = Column(String(100), nullable=False)
    category = Column(String(50), default="technical")
    level = Column(String(20), default="intermediate")
    resume = relationship("Resume", back_populates="skills")

class Project(Base):
    __tablename__ = "projects"
    id = Column(Integer, primary_key=True, index=True)
    resume_id = Column(Integer, ForeignKey("resumes.id"), nullable=False)
    name = Column(String(200), nullable=False)
    description = Column(Text)
    technologies = Column(JSON, default=[])
    github_url = Column(String(500))
    demo_url = Column(String(500))
    featured = Column(Boolean, default=False)
    sort_order = Column(Integer, default=0)
    resume = relationship("Resume", back_populates="projects")

class AIGeneration(Base):
    __tablename__ = "ai_generations"
    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    input_text = Column(Text)
    output_text = Column(Text)
    prompt_type = Column(String(50))
    model_used = Column(String(100))
    created_at = Column(DateTime, default=datetime.utcnow)
    user = relationship("User", back_populates="ai_generations")
