from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List
from app.core.database import get_db
from app.api.v1.deps import get_current_user
from app.models import User, Resume, Experience, Education, Skill, Project
from app.schemas import (
    ResumeCreate, ResumeUpdate, ResumeResponse,
    ExperienceCreate, ExperienceResponse,
    EducationCreate, EducationResponse,
    SkillCreate, SkillResponse,
    ProjectCreate, ProjectResponse,
)

router = APIRouter()

def _owned(resume_id: int, user_id: int, db: Session) -> Resume:
    r = db.query(Resume).filter(Resume.id == resume_id, Resume.user_id == user_id).first()
    if not r:
        raise HTTPException(404, "Resume not found")
    return r

@router.get("/", response_model=List[ResumeResponse])
def list_resumes(current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    return db.query(Resume).filter(Resume.user_id == current_user.id).all()

@router.post("/", response_model=ResumeResponse, status_code=201)
def create_resume(payload: ResumeCreate, current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    resume = Resume(
        user_id=current_user.id,
        title=payload.title,
        template=payload.template,
        personal=payload.personal.model_dump(),
        summary=payload.summary,
    )
    db.add(resume)
    db.commit()
    db.refresh(resume)
    return resume

@router.get("/{resume_id}", response_model=ResumeResponse)
def get_resume(resume_id: int, current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    return _owned(resume_id, current_user.id, db)

@router.patch("/{resume_id}", response_model=ResumeResponse)
def update_resume(resume_id: int, payload: ResumeUpdate, current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    resume = _owned(resume_id, current_user.id, db)
    data = payload.model_dump(exclude_unset=True)
    if "personal" in data and data["personal"]:
        data["personal"] = data["personal"]
    for k, v in data.items():
        setattr(resume, k, v)
    db.commit()
    db.refresh(resume)
    return resume

@router.delete("/{resume_id}", status_code=204)
def delete_resume(resume_id: int, current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    resume = _owned(resume_id, current_user.id, db)
    db.delete(resume)
    db.commit()

# Experiences
@router.post("/{resume_id}/experiences", response_model=ExperienceResponse, status_code=201)
def add_experience(resume_id: int, payload: ExperienceCreate, current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    _owned(resume_id, current_user.id, db)
    exp = Experience(resume_id=resume_id, **payload.model_dump())
    db.add(exp); db.commit(); db.refresh(exp)
    return exp

@router.delete("/{resume_id}/experiences/{exp_id}", status_code=204)
def delete_experience(resume_id: int, exp_id: int, current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    _owned(resume_id, current_user.id, db)
    exp = db.query(Experience).filter(Experience.id == exp_id, Experience.resume_id == resume_id).first()
    if not exp: raise HTTPException(404, "Not found")
    db.delete(exp); db.commit()

# Education
@router.post("/{resume_id}/education", response_model=EducationResponse, status_code=201)
def add_education(resume_id: int, payload: EducationCreate, current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    _owned(resume_id, current_user.id, db)
    edu = Education(resume_id=resume_id, **payload.model_dump())
    db.add(edu); db.commit(); db.refresh(edu)
    return edu

# Skills
@router.post("/{resume_id}/skills", response_model=SkillResponse, status_code=201)
def add_skill(resume_id: int, payload: SkillCreate, current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    _owned(resume_id, current_user.id, db)
    skill = Skill(resume_id=resume_id, **payload.model_dump())
    db.add(skill); db.commit(); db.refresh(skill)
    return skill

@router.delete("/{resume_id}/skills/{skill_id}", status_code=204)
def delete_skill(resume_id: int, skill_id: int, current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    _owned(resume_id, current_user.id, db)
    s = db.query(Skill).filter(Skill.id == skill_id, Skill.resume_id == resume_id).first()
    if not s: raise HTTPException(404, "Not found")
    db.delete(s); db.commit()

# Projects
@router.post("/{resume_id}/projects", response_model=ProjectResponse, status_code=201)
def add_project(resume_id: int, payload: ProjectCreate, current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    _owned(resume_id, current_user.id, db)
    project = Project(resume_id=resume_id, **payload.model_dump())
    db.add(project); db.commit(); db.refresh(project)
    return project

@router.delete("/{resume_id}/projects/{proj_id}", status_code=204)
def delete_project(resume_id: int, proj_id: int, current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    _owned(resume_id, current_user.id, db)
    p = db.query(Project).filter(Project.id == proj_id, Project.resume_id == resume_id).first()
    if not p: raise HTTPException(404, "Not found")
    db.delete(p); db.commit()
