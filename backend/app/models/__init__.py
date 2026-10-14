"""Single source of truth for the ePersona SQLAlchemy schema."""

from datetime import datetime, timezone
from sqlalchemy import (
    Column, Integer, String, Text, Boolean, ForeignKey, DateTime, JSON,
    Float, Index, UniqueConstraint,
)
from sqlalchemy.orm import relationship
from app.core.database import Base


def utcnow():
    return datetime.now(timezone.utc).replace(tzinfo=None)


class User(Base):
    __tablename__ = "users"
    id = Column(Integer, primary_key=True, index=True)
    email = Column(String(255), unique=True, index=True, nullable=False)
    hashed_password = Column(String(255), nullable=False)
    full_name = Column(String(200))
    is_active = Column(Boolean, nullable=False, default=True)
    role = Column(String(20), nullable=False, default="user", server_default="user")
    email_verified_at = Column(DateTime, nullable=True)
    token_version = Column(Integer, nullable=False, default=0, server_default="0")
    plan = Column(String(20), nullable=False, default="free", server_default="free")
    avatar_url = Column(String(500))
    stripe_customer_id = Column(String(255), unique=True, index=True)
    stripe_subscription_id = Column(String(255), unique=True, index=True)
    subscription_status = Column(String(40))
    subscription_end = Column(DateTime)
    last_stripe_event_created = Column(Integer, nullable=False, default=0, server_default="0")
    created_at = Column(DateTime, default=utcnow)
    updated_at = Column(DateTime, default=utcnow, onupdate=utcnow)
    resumes = relationship("Resume", back_populates="user", cascade="all, delete-orphan")
    ai_generations = relationship("AIGeneration", back_populates="user", cascade="all, delete-orphan")
    verification_tokens = relationship("EmailVerificationToken", cascade="all, delete-orphan")
    refresh_sessions = relationship("RefreshSession", cascade="all, delete-orphan")
    usage_events = relationship("UsageEvent", cascade="all, delete-orphan")


class Resume(Base):
    __tablename__ = "resumes"
    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), nullable=False, index=True)
    title = Column(String(200), nullable=False, default="My Resume")
    template = Column(String(50), default="atlas")
    is_default = Column(Boolean, default=False)
    personal = Column(JSON, default=dict)
    summary = Column(Text)
    ats_score = Column(Float, default=0.0)
    ats_data = Column(JSON, default=dict)
    created_at = Column(DateTime, default=utcnow)
    updated_at = Column(DateTime, default=utcnow, onupdate=utcnow)
    user = relationship("User", back_populates="resumes")
    experiences = relationship("Experience", back_populates="resume", cascade="all, delete-orphan")
    educations = relationship("Education", back_populates="resume", cascade="all, delete-orphan")
    skills = relationship("Skill", back_populates="resume", cascade="all, delete-orphan")
    projects = relationship("Project", back_populates="resume", cascade="all, delete-orphan")


class Experience(Base):
    __tablename__ = "experiences"
    id = Column(Integer, primary_key=True, index=True)
    resume_id = Column(Integer, ForeignKey("resumes.id", ondelete="CASCADE"), nullable=False, index=True)
    company = Column(String(200), nullable=False)
    role = Column(String(200), nullable=False)
    description = Column(Text)
    technologies = Column(JSON, default=list)
    start_date = Column(String(20))
    end_date = Column(String(20))
    is_current = Column(Boolean, default=False)
    sort_order = Column(Integer, default=0)
    resume = relationship("Resume", back_populates="experiences")


class Education(Base):
    __tablename__ = "educations"
    id = Column(Integer, primary_key=True, index=True)
    resume_id = Column(Integer, ForeignKey("resumes.id", ondelete="CASCADE"), nullable=False, index=True)
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
    resume_id = Column(Integer, ForeignKey("resumes.id", ondelete="CASCADE"), nullable=False, index=True)
    name = Column(String(100), nullable=False)
    category = Column(String(50), default="technical")
    level = Column(String(20), default="intermediate")
    resume = relationship("Resume", back_populates="skills")


class Project(Base):
    __tablename__ = "projects"
    id = Column(Integer, primary_key=True, index=True)
    resume_id = Column(Integer, ForeignKey("resumes.id", ondelete="CASCADE"), nullable=False, index=True)
    name = Column(String(200), nullable=False)
    description = Column(Text)
    technologies = Column(JSON, default=list)
    github_url = Column(String(500))
    demo_url = Column(String(500))
    featured = Column(Boolean, default=False)
    sort_order = Column(Integer, default=0)
    resume = relationship("Resume", back_populates="projects")


class AIGeneration(Base):
    __tablename__ = "ai_generations"
    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), nullable=False, index=True)
    input_text = Column(Text)
    output_text = Column(Text)
    context = Column(String(50), default="experience")
    model = Column(String(100), default="mistral")
    prompt_type = Column(String(50))
    model_used = Column(String(100))
    created_at = Column(DateTime, default=utcnow)
    user = relationship("User", back_populates="ai_generations")


class EmailVerificationToken(Base):
    __tablename__ = "email_verification_tokens"
    id = Column(Integer, primary_key=True)
    user_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), nullable=False, index=True)
    token_hash = Column(String(64), unique=True, nullable=False)
    expires_at = Column(DateTime, nullable=False)
    used_at = Column(DateTime)
    created_at = Column(DateTime, default=utcnow)


class RefreshSession(Base):
    __tablename__ = "refresh_sessions"
    id = Column(Integer, primary_key=True)
    user_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), nullable=False, index=True)
    jti_hash = Column(String(64), unique=True, nullable=False)
    rotated_to_hash = Column(String(64))
    expires_at = Column(DateTime, nullable=False)
    revoked_at = Column(DateTime)
    created_at = Column(DateTime, default=utcnow)


class RevokedAccessToken(Base):
    __tablename__ = "revoked_access_tokens"
    jti_hash = Column(String(64), primary_key=True)
    expires_at = Column(DateTime, nullable=False, index=True)


class StripeEvent(Base):
    __tablename__ = "stripe_events"
    event_id = Column(String(255), primary_key=True)
    event_type = Column(String(100), nullable=False)
    created_at = Column(DateTime, default=utcnow)


class UsageEvent(Base):
    __tablename__ = "usage_events"
    id = Column(Integer, primary_key=True)
    user_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), nullable=False)
    category = Column(String(30), nullable=False)
    created_at = Column(DateTime, default=utcnow)
    __table_args__ = (Index("ix_usage_user_category_time", "user_id", "category", "created_at"),)
