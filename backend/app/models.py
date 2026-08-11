from datetime import datetime
from sqlalchemy import Column, Integer, String, Boolean, DateTime, JSON, Text, ForeignKey, Float
from sqlalchemy.orm import relationship
from app.core.database import Base


class User(Base):
    __tablename__ = "users"
    id                    = Column(Integer, primary_key=True, index=True)
    email                 = Column(String, unique=True, index=True, nullable=False)
    hashed_password       = Column(String, nullable=False)
    full_name             = Column(String, nullable=True)
    is_active             = Column(Boolean, default=True)
    plan                  = Column(String, default="free")
    avatar_url            = Column(String, nullable=True)
    created_at            = Column(DateTime, default=datetime.utcnow)
    updated_at            = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    # Stripe v1.4
    stripe_customer_id    = Column(String, nullable=True, index=True)
    stripe_subscription_id= Column(String, nullable=True)
    subscription_status   = Column(String, nullable=True)
    subscription_end      = Column(DateTime, nullable=True)
    resumes               = relationship("Resume", back_populates="user", cascade="all, delete-orphan")
    ai_generations        = relationship("AIGeneration", back_populates="user", cascade="all, delete-orphan")


class Resume(Base):
    __tablename__ = "resumes"
    id           = Column(Integer, primary_key=True, index=True)
    user_id      = Column(Integer, ForeignKey("users.id"), nullable=False)
    title        = Column(String, default="My Resume")
    template     = Column(String, default="atlas")
    personal     = Column(JSON, default={})
    summary      = Column(Text, default="")
    ats_score    = Column(Float, default=0.0)
    created_at   = Column(DateTime, default=datetime.utcnow)
    updated_at   = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    user         = relationship("User", back_populates="resumes")
    experiences  = relationship("Experience", back_populates="resume", cascade="all, delete-orphan")
    educations   = relationship("Education", back_populates="resume", cascade="all, delete-orphan")
    skills       = relationship("Skill", back_populates="resume", cascade="all, delete-orphan")
    projects     = relationship("Project", back_populates="resume", cascade="all, delete-orphan")


class Experience(Base):
    __tablename__ = "experiences"
    id           = Column(Integer, primary_key=True, index=True)
    resume_id    = Column(Integer, ForeignKey("resumes.id"), nullable=False)
    company      = Column(String, nullable=False)
    role         = Column(String, nullable=False)
    start_date   = Column(String, nullable=True)
    end_date     = Column(String, nullable=True)
    is_current   = Column(Boolean, default=False)
    description  = Column(Text, default="")
    technologies = Column(JSON, default=[])
    resume       = relationship("Resume", back_populates="experiences")


class Education(Base):
    __tablename__ = "educations"
    id          = Column(Integer, primary_key=True, index=True)
    resume_id   = Column(Integer, ForeignKey("resumes.id"), nullable=False)
    institution = Column(String, nullable=False)
    degree      = Column(String, nullable=True)
    field       = Column(String, nullable=True)
    start_date  = Column(String, nullable=True)
    end_date    = Column(String, nullable=True)
    is_current  = Column(Boolean, default=False)
    resume      = relationship("Resume", back_populates="educations")


class Skill(Base):
    __tablename__ = "skills"
    id        = Column(Integer, primary_key=True, index=True)
    resume_id = Column(Integer, ForeignKey("resumes.id"), nullable=False)
    name      = Column(String, nullable=False)
    category  = Column(String, default="technical")
    level     = Column(String, default="intermediate")
    resume    = relationship("Resume", back_populates="skills")


class Project(Base):
    __tablename__ = "projects"
    id           = Column(Integer, primary_key=True, index=True)
    resume_id    = Column(Integer, ForeignKey("resumes.id"), nullable=False)
    name         = Column(String, nullable=False)
    description  = Column(Text, default="")
    technologies = Column(JSON, default=[])
    github_url   = Column(String, nullable=True)
    demo_url     = Column(String, nullable=True)
    resume       = relationship("Resume", back_populates="projects")


class AIGeneration(Base):
    __tablename__ = "ai_generations"
    id         = Column(Integer, primary_key=True, index=True)
    user_id    = Column(Integer, ForeignKey("users.id"), nullable=False)
    input_text = Column(Text)
    output_text= Column(Text)
    context    = Column(String, default="experience")
    model      = Column(String, default="mistral")
    created_at = Column(DateTime, default=datetime.utcnow)
    user       = relationship("User", back_populates="ai_generations")
