import { create } from "zustand";
import { persist } from "zustand/middleware";
export interface PersonalInfo { name:string;title:string;email:string;phone:string;location:string;linkedin:string;github:string;portfolio:string; }
export interface Experience { id?:number;company:string;role:string;description:string;technologies:string[];start_date:string;end_date:string;is_current:boolean; }
export interface Skill { id?:number;name:string;category:string;level:string; }
export interface Project { id?:number;name:string;description:string;technologies:string[];github_url:string;demo_url:string; }
export interface Resume { id?:number;title:string;template:string;personal:PersonalInfo;summary:string;experiences:Experience[];educations:any[];skills:Skill[];projects:Project[];ats_score:number; }
const defaultResume: Resume = { title:"My Resume",template:"atlas",personal:{name:"",title:"",email:"",phone:"",location:"",linkedin:"",github:"",portfolio:""},summary:"",experiences:[],educations:[],skills:[],projects:[],ats_score:0 };
interface ResumeStore {
  resume:Resume;isDirty:boolean;
  setResume:(r:Resume)=>void;updatePersonal:(p:Partial<PersonalInfo>)=>void;updateSummary:(s:string)=>void;
  addExperience:(e:Experience)=>void;removeExperience:(i:number)=>void;
  addSkill:(s:Skill)=>void;removeSkill:(i:number)=>void;
  addProject:(p:Project)=>void;removeProject:(i:number)=>void;markClean:()=>void;
}
export const useResumeStore = create<ResumeStore>()(persist(
  (set) => ({
    resume: defaultResume, isDirty: false,
    setResume: (r) => set({ resume:r, isDirty:false }),
    updatePersonal: (p) => set((s) => ({ resume:{...s.resume,personal:{...s.resume.personal,...p}}, isDirty:true })),
    updateSummary: (summary) => set((s) => ({ resume:{...s.resume,summary}, isDirty:true })),
    addExperience: (e) => set((s) => ({ resume:{...s.resume,experiences:[...s.resume.experiences,e]}, isDirty:true })),
    removeExperience: (i) => set((s) => ({ resume:{...s.resume,experiences:s.resume.experiences.filter((_,idx)=>idx!==i)}, isDirty:true })),
    addSkill: (sk) => set((s) => ({ resume:{...s.resume,skills:[...s.resume.skills,sk]}, isDirty:true })),
    removeSkill: (i) => set((s) => ({ resume:{...s.resume,skills:s.resume.skills.filter((_,idx)=>idx!==i)}, isDirty:true })),
    addProject: (p) => set((s) => ({ resume:{...s.resume,projects:[...s.resume.projects,p]}, isDirty:true })),
    removeProject: (i) => set((s) => ({ resume:{...s.resume,projects:s.resume.projects.filter((_,idx)=>idx!==i)}, isDirty:true })),
    markClean: () => set({ isDirty:false }),
  }),
  { name: "cvforge-resume" }
));
