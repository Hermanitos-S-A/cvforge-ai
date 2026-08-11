"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import {
  ArrowRight, ArrowLeft, CheckCircle, Loader2,
  User, Briefcase, GraduationCap, Zap, Building2, DollarSign
} from "lucide-react";
import { toast } from "sonner";
import { useAuthStore } from "@/stores/authStore";
import { useResumeStore } from "@/stores/resumeStore";
import { api } from "@/lib/api";

// Types 
interface OnboardingData {
  // Step 1 — Personal
  full_name: string;
  title: string;
  location: string;
  phone: string;
  linkedin: string;
  github: string;
  // Step 2 — Objetivo
  career_goal: string;
  desired_role: string;
  work_type: string; // remote / hybrid / onsite
  // Step 3 — Experiencia
  years_exp: string;
  current_company: string;
  current_role: string;
  exp_description: string;
  // Step 4 — Educación
  education_level: string;
  institution: string;
  degree: string;
  grad_year: string;
  // Step 5 — Habilidades
  tech_skills: string;
  soft_skills: string;
  languages: string;
  // Step 6 — Empresa & Salario
  company_size: string;
  company_type: string;
  salary_min: string;
  salary_max: string;
  salary_currency: string;
}

const INITIAL: OnboardingData = {
  full_name:"", title:"", location:"", phone:"", linkedin:"", github:"",
  career_goal:"", desired_role:"", work_type:"",
  years_exp:"", current_company:"", current_role:"", exp_description:"",
  education_level:"", institution:"", degree:"", grad_year:"",
  tech_skills:"", soft_skills:"", languages:"",
  company_size:"", company_type:"", salary_min:"", salary_max:"", salary_currency:"PEN",
};

const STEPS = [
  { id:1, label:"Perfil",      icon:User,        color:"#6c63ff" },
  { id:2, label:"Objetivo",    icon:Briefcase,   color:"#22d3ee" },
  { id:3, label:"Experiencia", icon:Zap,         color:"#10b981" },
  { id:4, label:"Educación",   icon:GraduationCap,color:"#f59e0b" },
  { id:5, label:"Habilidades", icon:CheckCircle, color:"#a78bfa" },
  { id:6, label:"Empresa",     icon:Building2,   color:"#f43f5e" },
];

// Field helpers
function Field({ label, required, children }: { label: string; required?: boolean; children: React.ReactNode }) {
  return (
    <div>
      <label className="block text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-1.5">
        {label}{required && <span className="text-red-400 ml-0.5">*</span>}
      </label>
      {children}
    </div>
  );
}

function Input(props: React.InputHTMLAttributes<HTMLInputElement>) {
  return <input {...props} className={"input-base w-full " + (props.className || "")} />;
}

function Select({ children, ...props }: React.SelectHTMLAttributes<HTMLSelectElement> & { children: React.ReactNode }) {
  return (
    <select {...props} className="input-base w-full">
      {children}
    </select>
  );
}

function Textarea(props: React.TextareaHTMLAttributes<HTMLTextAreaElement>) {
  return <textarea {...props} rows={3} className={"input-base resize-none w-full " + (props.className || "")} />;
}

function OptionCard({ value, label, desc, selected, onClick }: { value: string; label: string; desc?: string; selected: boolean; onClick: () => void }) {
  return (
    <button type="button" onClick={onClick}
      className={"w-full text-left p-3.5 rounded-xl border-2 transition-all " + (
        selected ? "border-primary bg-primary/8" : "border-border hover:border-primary/40"
      )}>
      <p className={"text-sm font-semibold " + (selected ? "text-primary" : "")}>{label}</p>
      {desc && <p className="text-xs text-muted-foreground mt-0.5">{desc}</p>}
    </button>
  );
}

// Main component 
export default function OnboardingPage() {
  const router = useRouter();
  const { user, setUser } = useAuthStore();
  const resumeStore = useResumeStore();
  const [step, setStep] = useState(1);
  const [data, setData] = useState<OnboardingData>(INITIAL);
  const [saving, setSaving] = useState(false);

  const set = (key: keyof OnboardingData, val: string) =>
    setData(prev => ({ ...prev, [key]: val }));

  const next = () => setStep(s => Math.min(s + 1, 6));
  const back = () => setStep(s => Math.max(s - 1, 1));

  const finish = async () => {
    if (!data.full_name.trim()) { toast.error("Tu nombre es requerido"); setStep(1); return; }
    setSaving(true);
    try {
      // 1. Update user name
      if (user) setUser({ ...user, full_name: data.full_name });

      // 2. Create resume with all collected data
      const resumes = await api.getResumes();
      let resumeId: number;

      const personalData = {
        name: data.full_name,
        title: data.title,
        location: data.location,
        phone: data.phone,
        linkedin: data.linkedin,
        github: data.github,
      };

      const summaryText = data.career_goal
        ? `${data.career_goal}${data.desired_role ? ` Busco posiciones como ${data.desired_role}.` : ""}${data.work_type ? ` Modalidad preferida: ${data.work_type}.` : ""}`
        : "";

      if (resumes && resumes.length > 0) {
        resumeId = resumes[0].id;
        await api.updateResume(resumeId, {
          personal: personalData,
          summary: summaryText,
        });
      } else {
        const created = await api.createResume({
          title: `CV de ${data.full_name}`,
          template: "atlas",
          personal: personalData,
          summary: summaryText,
        });
        resumeId = created.id;
      }

      // 3. Add experience if provided
      if (data.current_company && data.current_role) {
        await api.addExperience(resumeId, {
          company: data.current_company,
          role: data.current_role,
          description: data.exp_description,
          start_date: data.years_exp ? String(new Date().getFullYear() - parseInt(data.years_exp) + 1) : "",
          is_current: true,
          technologies: [],
        });
      }

      // 4. Add education if provided
      if (data.institution && data.degree) {
        await api.addEducation(resumeId, {
          institution: data.institution,
          degree: data.education_level || "Bachiller",
          field: data.degree,
          start_date: data.grad_year ? String(parseInt(data.grad_year) - 4) : "",
          end_date: data.grad_year,
          is_current: false,
        });
      }

      // 5. Add tech skills
      const techSkills = data.tech_skills.split(",").map(s => s.trim()).filter(Boolean);
      for (const skill of techSkills.slice(0, 10)) {
        await api.addSkill(resumeId, { name: skill, category: "technical", level: "intermediate" });
      }

      // 6. Add soft skills
      const softSkills = data.soft_skills.split(",").map(s => s.trim()).filter(Boolean);
      for (const skill of softSkills.slice(0, 5)) {
        await api.addSkill(resumeId, { name: skill, category: "soft", level: "advanced" });
      }

      // 7. Add languages
      const langs = data.languages.split(",").map(s => s.trim()).filter(Boolean);
      for (const lang of langs) {
        await api.addSkill(resumeId, { name: lang, category: "language", level: "intermediate" });
      }

      // 8. Mark onboarding as done in localStorage
      localStorage.setItem("cvforge-onboarding-done", "true");

      toast.success("¡Perfil creado! Redirigiendo al dashboard...");
      setTimeout(() => router.push("/dashboard"), 1200);
    } catch (err: any) {
      console.error(err);
      toast.error("Error al guardar. Intenta de nuevo.");
    } finally {
      setSaving(false);
    }
  };

  const skip = () => {
    localStorage.setItem("cvforge-onboarding-done", "true");
    router.push("/dashboard");
  };

  const progress = ((step - 1) / (STEPS.length - 1)) * 100;

  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Top bar */}
      <div className="border-b border-border bg-card/50 px-6 py-4">
        <div className="max-w-2xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <svg width="28" height="28" viewBox="0 0 36 36" fill="none">
              <rect width="36" height="36" rx="9" fill="url(#og)"/>
              <path d="M11 10H18L14 17H20L11 26H17L22 17H17L21 10" fill="white"/>
              <defs>
                <linearGradient id="og" x1="0" y1="0" x2="36" y2="36" gradientUnits="userSpaceOnUse">
                  <stop offset="0%" stopColor="#6c63ff"/>
                  <stop offset="100%" stopColor="#22d3ee"/>
                </linearGradient>
              </defs>
            </svg>
            <span className="font-bold text-sm">CVForge <span className="text-primary">AI</span></span>
          </div>
          <button onClick={skip} className="text-xs text-muted-foreground hover:text-foreground transition-colors">
            Completar después →
          </button>
        </div>
      </div>

      <div className="flex-1 flex flex-col items-center justify-center px-4 py-8">
        <div className="w-full max-w-2xl">
          {/* Progress */}
          <div className="mb-8">
            <div className="flex items-center justify-between mb-3">
              <p className="text-sm font-semibold">
                Paso {step} de {STEPS.length} —{" "}
                <span className="text-primary">{STEPS[step-1].label}</span>
              </p>
              <p className="text-xs text-muted-foreground">{Math.round(progress)}% completado</p>
            </div>
            {/* Progress bar */}
            <div className="h-2 rounded-full bg-secondary overflow-hidden">
              <motion.div className="h-full rounded-full"
                style={{ background:"linear-gradient(90deg,#6c63ff,#22d3ee)" }}
                initial={{ width: 0 }}
                animate={{ width: `${((step) / STEPS.length) * 100}%` }}
                transition={{ duration: 0.4 }} />
            </div>
            {/* Step dots */}
            <div className="flex items-center justify-between mt-3">
              {STEPS.map(s => (
                <div key={s.id} className="flex flex-col items-center gap-1 cursor-pointer"
                  onClick={() => s.id < step && setStep(s.id)}>
                  <div className={"w-7 h-7 rounded-full flex items-center justify-center transition-all " + (
                    s.id < step  ? "bg-primary text-white" :
                    s.id === step ? "border-2 border-primary bg-primary/10" :
                    "border-2 border-border bg-background"
                  )}>
                    {s.id < step
                      ? <CheckCircle size={14} className="text-white" />
                      : <s.icon size={12} style={{ color: s.id === step ? s.color : undefined }} />
                    }
                  </div>
                  <span className={"text-[10px] hidden sm:block " + (s.id === step ? "text-primary font-semibold" : "text-muted-foreground")}>
                    {s.label}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Step content */}
          <AnimatePresence mode="wait">
            <motion.div key={step}
              initial={{ opacity:0, x:24 }} animate={{ opacity:1, x:0 }} exit={{ opacity:0, x:-24 }}
              transition={{ duration:0.25 }}
              className="p-6 sm:p-8 rounded-2xl border border-border bg-card space-y-5">

              {/* STEP 1 — Perfil personal */}
              {step === 1 && (
                <>
                  <div>
                    <h2 className="text-xl font-bold mb-1">Cuéntanos sobre ti</h2>
                    <p className="text-muted-foreground text-sm">Esta información aparecerá en tu CV y portafolio.</p>
                  </div>
                  <div className="grid sm:grid-cols-2 gap-4">
                    <div className="sm:col-span-2">
                      <Field label="Nombre completo" required>
                        <Input value={data.full_name} onChange={e => set("full_name", e.target.value)}
                          placeholder="Stefanny Salas" />
                      </Field>
                    </div>
                    <Field label="Título profesional">
                      <Input value={data.title} onChange={e => set("title", e.target.value)}
                        placeholder="Senior Frontend Engineer" />
                    </Field>
                    <Field label="Ubicación">
                      <Input value={data.location} onChange={e => set("location", e.target.value)}
                        placeholder="Lima, Perú" />
                    </Field>
                    <Field label="Teléfono">
                      <Input value={data.phone} onChange={e => set("phone", e.target.value)}
                        placeholder="+51 999 888 777" />
                    </Field>
                    <Field label="LinkedIn">
                      <Input value={data.linkedin} onChange={e => set("linkedin", e.target.value)}
                        placeholder="linkedin.com/in/tu-perfil" />
                    </Field>
                    <Field label="GitHub">
                      <Input value={data.github} onChange={e => set("github", e.target.value)}
                        placeholder="github.com/tu-usuario" />
                    </Field>
                  </div>
                </>
              )}

              {/* STEP 2 — Objetivo ── */}
              {step === 2 && (
                <>
                  <div>
                    <h2 className="text-xl font-bold mb-1">¿Cuál es tu objetivo?</h2>
                    <p className="text-muted-foreground text-sm">La IA usará esto para optimizar tu CV y resumen profesional.</p>
                  </div>
                  <Field label="Objetivo profesional" required>
                    <Textarea value={data.career_goal}
                      onChange={e => set("career_goal", e.target.value)}
                      placeholder="Ej: Busco una posición como desarrolladora frontend donde pueda aplicar mis conocimientos en React y TypeScript para construir productos de alto impacto..." />
                  </Field>
                  <Field label="Cargo deseado">
                    <Input value={data.desired_role} onChange={e => set("desired_role", e.target.value)}
                      placeholder="Ej: Frontend Developer, UX Designer, Data Analyst..." />
                  </Field>
                  <Field label="Modalidad de trabajo">
                    <div className="grid grid-cols-3 gap-3">
                      {[
                        { value:"Remoto",  desc:"Trabajo desde casa" },
                        { value:"Híbrido", desc:"Mixto" },
                        { value:"Presencial", desc:"En oficina" },
                      ].map(opt => (
                        <OptionCard key={opt.value} value={opt.value} label={opt.value} desc={opt.desc}
                          selected={data.work_type === opt.value}
                          onClick={() => set("work_type", opt.value)} />
                      ))}
                    </div>
                  </Field>
                </>
              )}

              {/* STEP 3 — Experiencia ── */}
              {step === 3 && (
                <>
                  <div>
                    <h2 className="text-xl font-bold mb-1">Tu experiencia laboral</h2>
                    <p className="text-muted-foreground text-sm">Agrega tu experiencia más reciente. Podrás agregar más en el editor.</p>
                  </div>
                  <Field label="Años de experiencia total">
                    <div className="grid grid-cols-4 gap-2">
                      {["0-1","1-3","3-5","5+"].map(v => (
                        <OptionCard key={v} value={v} label={v + " años"} selected={data.years_exp === v}
                          onClick={() => set("years_exp", v)} />
                      ))}
                    </div>
                  </Field>
                  <div className="grid sm:grid-cols-2 gap-4">
                    <Field label="Empresa actual / más reciente">
                      <Input value={data.current_company} onChange={e => set("current_company", e.target.value)}
                        placeholder="TechCorp, Freelance..." />
                    </Field>
                    <Field label="Cargo">
                      <Input value={data.current_role} onChange={e => set("current_role", e.target.value)}
                        placeholder="Frontend Developer" />
                    </Field>
                  </div>
                  <Field label="Descripción de responsabilidades">
                    <Textarea value={data.exp_description}
                      onChange={e => set("exp_description", e.target.value)}
                      placeholder="Ej: Desarrollé e implementé nuevas funcionalidades en React, mejoré el rendimiento de la aplicación en un 40%, lideré un equipo de 3 desarrolladores..." />
                  </Field>
                </>
              )}

              {/* STEP 4 — Educación ── */}
              {step === 4 && (
                <>
                  <div>
                    <h2 className="text-xl font-bold mb-1">Tu formación académica</h2>
                    <p className="text-muted-foreground text-sm">Tu educación más reciente o relevante.</p>
                  </div>
                  <Field label="Nivel de educación">
                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                      {["Técnico","Bachiller","Licenciatura","Maestría","Doctorado","Autodidacta"].map(v => (
                        <OptionCard key={v} value={v} label={v} selected={data.education_level === v}
                          onClick={() => set("education_level", v)} />
                      ))}
                    </div>
                  </Field>
                  <div className="grid sm:grid-cols-2 gap-4">
                    <Field label="Institución">
                      <Input value={data.institution} onChange={e => set("institution", e.target.value)}
                        placeholder="PUCP, UPC, SENATI..." />
                    </Field>
                    <Field label="Carrera / Especialidad">
                      <Input value={data.degree} onChange={e => set("degree", e.target.value)}
                        placeholder="Ingeniería de Sistemas, Diseño..." />
                    </Field>
                    <Field label="Año de egreso">
                      <Input value={data.grad_year} onChange={e => set("grad_year", e.target.value)}
                        placeholder="2022" maxLength={4} />
                    </Field>
                  </div>
                </>
              )}

              {/* STEP 5 — Habilidades ── */}
              {step === 5 && (
                <>
                  <div>
                    <h2 className="text-xl font-bold mb-1">Tus habilidades</h2>
                    <p className="text-muted-foreground text-sm">Separa cada habilidad con una coma. La IA las usará para optimizar tu CV.</p>
                  </div>
                  <Field label="Habilidades técnicas">
                    <Textarea value={data.tech_skills}
                      onChange={e => set("tech_skills", e.target.value)}
                      placeholder="React, TypeScript, Node.js, Python, Docker, PostgreSQL, Git..." />
                    <p className="text-[11px] text-muted-foreground mt-1">Separa con comas. Ej: React, Python, AWS</p>
                  </Field>
                  <Field label="Habilidades blandas">
                    <Textarea value={data.soft_skills}
                      onChange={e => set("soft_skills", e.target.value)}
                      placeholder="Liderazgo, Trabajo en equipo, Comunicación, Gestión de proyectos..." />
                  </Field>
                  <Field label="Idiomas">
                    <Input value={data.languages} onChange={e => set("languages", e.target.value)}
                      placeholder="Español, Inglés B2, Portugués A1..." />
                  </Field>
                </>
              )}

              {/* STEP 6 — Empresa & Salario ── */}
              {step === 6 && (
                <>
                  <div>
                    <h2 className="text-xl font-bold mb-1">Preferencias laborales</h2>
                    <p className="text-muted-foreground text-sm">La IA personalizará las sugerencias de tu CV según estas preferencias.</p>
                  </div>
                  <Field label="Tipo de empresa">
                    <div className="grid grid-cols-2 gap-3">
                      {[
                        { v:"Startup",    d:"Ambiente ágil y dinámico" },
                        { v:"Corporativa",d:"Estructura establecida" },
                        { v:"Remota",     d:"Equipo distribuido" },
                        { v:"Freelance",  d:"Proyectos independientes" },
                        { v:"ONG / Público", d:"Impacto social" },
                        { v:"Cualquiera",    d:"Abierto a opciones" },
                      ].map(opt => (
                        <OptionCard key={opt.v} value={opt.v} label={opt.v} desc={opt.d}
                          selected={data.company_type === opt.v}
                          onClick={() => set("company_type", opt.v)} />
                      ))}
                    </div>
                  </Field>
                  <Field label="Tamaño de empresa">
                    <div className="grid grid-cols-3 gap-2">
                      {[
                        { v:"1-10",   l:"Micro" },
                        { v:"11-50",  l:"Pequeña" },
                        { v:"51-200", l:"Mediana" },
                        { v:"201-500",l:"Grande" },
                        { v:"500+",   l:"Corporación" },
                        { v:"Cualquiera", l:"No importa" },
                      ].map(opt => (
                        <OptionCard key={opt.v} value={opt.v} label={opt.l} desc={opt.v === "Cualquiera" ? undefined : opt.v + " personas"}
                          selected={data.company_size === opt.v}
                          onClick={() => set("company_size", opt.v)} />
                      ))}
                    </div>
                  </Field>
                  <div className="grid sm:grid-cols-3 gap-4">
                    <Field label="Moneda">
                      <Select value={data.salary_currency} onChange={e => set("salary_currency", e.target.value)}>
                        <option value="PEN">Soles (PEN)</option>
                        <option value="USD">Dólares (USD)</option>
                        <option value="EUR">Euros (EUR)</option>
                      </Select>
                    </Field>
                    <Field label="Salario mínimo">
                      <Input value={data.salary_min} onChange={e => set("salary_min", e.target.value)}
                        placeholder="Ej: 3000" type="number" />
                    </Field>
                    <Field label="Salario máximo">
                      <Input value={data.salary_max} onChange={e => set("salary_max", e.target.value)}
                        placeholder="Ej: 6000" type="number" />
                    </Field>
                  </div>

                  {/* Summary card */}
                  <div className="p-4 rounded-xl border border-primary/20 bg-primary/5 mt-2">
                    <p className="text-xs font-semibold text-primary mb-2">✨ Resumen de tu perfil</p>
                    <div className="grid grid-cols-2 gap-x-4 gap-y-1 text-xs text-muted-foreground">
                      {data.full_name    && <span><b className="text-foreground">Nombre:</b> {data.full_name}</span>}
                      {data.title        && <span><b className="text-foreground">Cargo:</b> {data.title}</span>}
                      {data.desired_role && <span><b className="text-foreground">Rol deseado:</b> {data.desired_role}</span>}
                      {data.work_type    && <span><b className="text-foreground">Modalidad:</b> {data.work_type}</span>}
                      {data.years_exp    && <span><b className="text-foreground">Experiencia:</b> {data.years_exp} años</span>}
                      {data.education_level && <span><b className="text-foreground">Educación:</b> {data.education_level}</span>}
                    </div>
                  </div>
                </>
              )}
            </motion.div>
          </AnimatePresence>

          {/* Navigation */}
          <div className="flex items-center justify-between mt-6">
            <button onClick={back} disabled={step === 1}
              className="flex items-center gap-2 px-5 py-2.5 rounded-xl border border-border text-sm font-medium hover:bg-secondary transition-colors disabled:opacity-40 disabled:cursor-not-allowed">
              <ArrowLeft size={14} /> Anterior
            </button>

            <div className="flex items-center gap-1">
              {STEPS.map(s => (
                <div key={s.id} className={"h-1.5 rounded-full transition-all " + (
                  s.id === step ? "w-6 bg-primary" :
                  s.id < step ? "w-3 bg-primary/40" :
                  "w-3 bg-border"
                )} />
              ))}
            </div>

            {step < 6 ? (
              <button onClick={next}
                className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-bold text-white"
                style={{ background:"linear-gradient(135deg,#6c63ff,#22d3ee)" }}>
                Siguiente <ArrowRight size={14} />
              </button>
            ) : (
              <button onClick={finish} disabled={saving}
                className="flex items-center gap-2 px-6 py-2.5 rounded-xl text-sm font-bold text-white disabled:opacity-60"
                style={{ background:"linear-gradient(135deg,#6c63ff,#22d3ee)", boxShadow:"0 4px 20px rgba(108,99,255,0.3)" }}>
                {saving
                  ? <><Loader2 size={14} className="animate-spin" />Guardando...</>
                  : <><CheckCircle size={14} />Crear mi CV</>
                }
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
