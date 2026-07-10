import { create } from "zustand";
import { persist } from "zustand/middleware";

export interface PersonalInfo {
  name: string; title: string; email: string; phone: string;
  location: string; linkedin: string; github: string; portfolio: string;
}
export interface Experience {
  id?: number; company: string; role: string; description: string;
  technologies: string[]; start_date: string; end_date: string; is_current: boolean;
}
export interface Education {
  id?: number; institution: string; degree: string; field: string;
  start_date: string; end_date: string; is_current: boolean;
}
export interface Skill { id?: number; name: string; category: string; level: string; }
export interface Project {
  id?: number; name: string; description: string;
  technologies: string[]; github_url: string; demo_url: string;
}
export interface Resume {
  id?: number; title: string; template: string;
  personal: PersonalInfo; summary: string;
  experiences: Experience[]; educations: Education[];
  skills: Skill[]; projects: Project[]; ats_score: number;
}

const empty: PersonalInfo = { name:"",title:"",email:"",phone:"",location:"",linkedin:"",github:"",portfolio:"" };
const defaultResume: Resume = { title:"My Resume",template:"atlas",personal:empty,summary:"",experiences:[],educations:[],skills:[],projects:[],ats_score:0 };

interface ResumeStore {
  resume: Resume;
  serverResumeId: number | null;
  isDirty: boolean;
  setResume: (r: Resume) => void;
  setServerResumeId: (id: number) => void;
  updatePersonal: (p: Partial<PersonalInfo>) => void;
  updateSummary: (s: string) => void;
  updateTemplate: (t: string) => void;
  addExperience: (e: Experience) => void;
  removeExperience: (i: number) => void;
  addEducation: (e: Education) => void;
  removeEducation: (i: number) => void;
  addSkill: (s: Skill) => void;
  removeSkill: (i: number) => void;
  addProject: (p: Project) => void;
  removeProject: (i: number) => void;
  markClean: () => void;
  reset: () => void;
}

export const useResumeStore = create<ResumeStore>()(
  persist(
    (set) => ({
      resume: defaultResume,
      serverResumeId: null,
      isDirty: false,
      setResume: (r) => set({ resume: r, isDirty: false }),
      setServerResumeId: (id) => set({ serverResumeId: id }),
      updatePersonal: (p) => set((s) => ({ resume: { ...s.resume, personal: { ...s.resume.personal, ...p } }, isDirty: true })),
      updateSummary: (summary) => set((s) => ({ resume: { ...s.resume, summary }, isDirty: true })),
      updateTemplate: (template) => set((s) => ({ resume: { ...s.resume, template }, isDirty: true })),
      addExperience: (e) => set((s) => ({ resume: { ...s.resume, experiences: [...s.resume.experiences, e] }, isDirty: true })),
      removeExperience: (i) => set((s) => ({ resume: { ...s.resume, experiences: s.resume.experiences.filter((_,idx)=>idx!==i) }, isDirty: true })),
      addEducation: (e) => set((s) => ({ resume: { ...s.resume, educations: [...s.resume.educations, e] }, isDirty: true })),
      removeEducation: (i) => set((s) => ({ resume: { ...s.resume, educations: s.resume.educations.filter((_,idx)=>idx!==i) }, isDirty: true })),
      addSkill: (sk) => set((s) => ({ resume: { ...s.resume, skills: [...s.resume.skills, sk] }, isDirty: true })),
      removeSkill: (i) => set((s) => ({ resume: { ...s.resume, skills: s.resume.skills.filter((_,idx)=>idx!==i) }, isDirty: true })),
      addProject: (p) => set((s) => ({ resume: { ...s.resume, projects: [...s.resume.projects, p] }, isDirty: true })),
      removeProject: (i) => set((s) => ({ resume: { ...s.resume, projects: s.resume.projects.filter((_,idx)=>idx!==i) }, isDirty: true })),
      markClean: () => set({ isDirty: false }),
      reset: () => set({ resume: defaultResume, serverResumeId: null, isDirty: false }),
    }),
    { name: "cvforge-resume" }
  )
);
