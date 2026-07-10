"use client";
import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Save, Plus, Trash2, Loader2, Sparkles, X } from "lucide-react";
import { toast } from "sonner";
import { useAuth } from "@/hooks/useAuth";
import { useResume } from "@/hooks/useResume";
import { api } from "@/lib/api";
import type { Experience, Education, Skill, Project } from "@/stores/resumeStore";

const TABS = ["Personal","Experiencia","Educación","Habilidades","Proyectos"];

export default function CVBuilderPage() {
  useAuth();
  const { resume, serverResumeId, saving, isDirty, save,
    updatePersonal, updateSummary,
    addExperience, removeExperience,
    addEducation, removeEducation,
    addSkill, removeSkill,
    addProject, removeProject } = useResume();
  const [tab, setTab] = useState(0);
  const [aiLoading, setAiLoading] = useState(false);

  const optimizeText = async (text: string, field: string) => {
    if (!text.trim()) return toast.error("Escribe algo primero");
    setAiLoading(true);
    try {
      const res = await api.optimizeText(text, field);
      if (field === "summary") updateSummary(res.optimized);
      toast.success("✨ Texto optimizado por IA!");
      return res.optimized;
    } catch {
      toast.error("IA no disponible — asegúrate que Ollama está corriendo");
      return null;
    } finally {
      setAiLoading(false);
    }
  };

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold">Mi Perfil</h1>
          <p className="text-muted-foreground text-sm mt-1">Completa tu información para generar un CV profesional</p>
        </div>
        <button onClick={save} disabled={saving || !isDirty}
          className="flex items-center gap-2 px-4 py-2 rounded-xl bg-primary text-white text-sm font-medium hover:opacity-90 transition-all disabled:opacity-50">
          {saving ? <Loader2 size={13} className="animate-spin" /> : <Save size={13} />}
          {saving ? "Guardando..." : isDirty ? "Guardar cambios" : "Guardado ✓"}
        </button>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 border-b border-border mb-6 overflow-x-auto">
        {TABS.map((t, i) => (
          <button key={t} onClick={() => setTab(i)}
            className={`px-4 py-2.5 text-sm font-medium transition-all border-b-2 -mb-px whitespace-nowrap ${
              tab === i ? "border-primary text-primary" : "border-transparent text-muted-foreground hover:text-foreground"
            }`}>
            {t}
          </button>
        ))}
      </div>

      <AnimatePresence mode="wait">
        <motion.div key={tab} initial={{ opacity:0, x:8 }} animate={{ opacity:1, x:0 }} exit={{ opacity:0, x:-8 }} transition={{ duration:0.15 }}>
          {tab === 0 && <PersonalTab resume={resume} updatePersonal={updatePersonal} updateSummary={updateSummary} optimizeText={optimizeText} aiLoading={aiLoading} />}
          {tab === 1 && <ExperienceTab resumeId={serverResumeId} experiences={resume.experiences} onAdd={addExperience} onRemove={removeExperience} optimizeText={optimizeText} aiLoading={aiLoading} />}
          {tab === 2 && <EducationTab resumeId={serverResumeId} educations={resume.educations} onAdd={addEducation} onRemove={removeEducation} />}
          {tab === 3 && <SkillsTab resumeId={serverResumeId} skills={resume.skills} onAdd={addSkill} onRemove={removeSkill} />}
          {tab === 4 && <ProjectsTab resumeId={serverResumeId} projects={resume.projects} onAdd={addProject} onRemove={removeProject} />}
        </motion.div>
      </AnimatePresence>
    </div>
  );
}

// ── Sub-components ─────────────────────────────────────────────────────────────

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <label className="block text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-1.5">{label}</label>
      {children}
    </div>
  );
}

function PersonalTab({ resume, updatePersonal, updateSummary, optimizeText, aiLoading }: any) {
  const fields = [
    { key:"name",      label:"Nombre completo",    placeholder:"Alex Ramirez" },
    { key:"title",     label:"Título profesional",  placeholder:"Senior Frontend Engineer" },
    { key:"email",     label:"Email",               placeholder:"alex@ejemplo.com" },
    { key:"phone",     label:"Teléfono",             placeholder:"+51 999 888 777" },
    { key:"location",  label:"Ubicación",            placeholder:"Lima, Perú" },
    { key:"linkedin",  label:"LinkedIn",             placeholder:"linkedin.com/in/alex" },
    { key:"github",    label:"GitHub",               placeholder:"github.com/alex" },
    { key:"portfolio", label:"Portfolio URL",        placeholder:"alexramirez.dev" },
  ];
  return (
    <div className="space-y-5">
      <div className="grid sm:grid-cols-2 gap-4">
        {fields.map(({ key, label, placeholder }) => (
          <Field key={key} label={label}>
            <input value={(resume.personal as any)[key] || ""}
              onChange={(e) => updatePersonal({ [key]: e.target.value })}
              placeholder={placeholder} className="input-base" />
          </Field>
        ))}
      </div>
      <Field label="Resumen profesional">
        <div className="relative">
          <textarea rows={4} value={resume.summary}
            onChange={(e) => updateSummary(e.target.value)}
            placeholder="Escribe un resumen profesional impactante..."
            className="input-base resize-none w-full pb-10" />
          <button onClick={() => optimizeText(resume.summary, "summary")}
            disabled={aiLoading}
            className="absolute right-3 bottom-3 flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-primary/10 text-primary text-xs font-medium hover:bg-primary/20 transition-colors disabled:opacity-60">
            {aiLoading ? <Loader2 size={11} className="animate-spin" /> : <Sparkles size={11} />}
            Optimizar con IA
          </button>
        </div>
      </Field>
    </div>
  );
}

function ExperienceTab({ resumeId, experiences, onAdd, onRemove, optimizeText, aiLoading }: any) {
  const [form, setForm] = useState({ company:"", role:"", description:"", technologies:"", start_date:"", end_date:"", is_current:false });
  const [adding, setAdding] = useState(false);

  const handleAdd = async () => {
    if (!form.company || !form.role) return toast.error("Empresa y cargo son requeridos");
    setAdding(true);
    try {
      const techs = form.technologies.split(",").map((t: string) => t.trim()).filter(Boolean);
      const payload = { ...form, technologies: techs };
      if (resumeId) {
        const saved = await api.addExperience(resumeId, payload);
        onAdd({ ...saved });
      } else {
        onAdd({ ...payload });
      }
      setForm({ company:"", role:"", description:"", technologies:"", start_date:"", end_date:"", is_current:false });
      toast.success("Experiencia agregada!");
    } catch { toast.error("Error al guardar"); }
    finally { setAdding(false); }
  };

  const handleRemove = async (exp: any, i: number) => {
    if (resumeId && exp.id) {
      try { await api.deleteExperience(resumeId, exp.id); } catch { toast.error("Error al eliminar"); return; }
    }
    onRemove(i);
    toast.success("Experiencia eliminada");
  };

  return (
    <div className="space-y-4">
      {experiences.map((exp: any, i: number) => (
        <div key={i} className="p-4 rounded-2xl border border-border bg-card relative group">
          <button onClick={() => handleRemove(exp, i)}
            className="absolute top-3 right-3 opacity-0 group-hover:opacity-100 text-muted-foreground hover:text-destructive transition-all">
            <Trash2 size={13} />
          </button>
          <p className="font-semibold text-sm">{exp.role} <span className="text-primary">@ {exp.company}</span></p>
          <p className="text-xs text-muted-foreground mt-0.5">{exp.start_date} – {exp.is_current ? "Presente" : exp.end_date}</p>
          {exp.description && <p className="text-sm text-muted-foreground mt-2 leading-relaxed">{exp.description}</p>}
          {exp.technologies?.length > 0 && (
            <div className="flex flex-wrap gap-1.5 mt-2">
              {exp.technologies.map((t: string) => <span key={t} className="text-xs px-2 py-0.5 rounded-full bg-secondary border border-border text-muted-foreground">{t}</span>)}
            </div>
          )}
        </div>
      ))}

      <div className="p-5 rounded-2xl border border-dashed border-border bg-secondary/20">
        <h3 className="text-sm font-semibold mb-4 flex items-center gap-2"><Plus size={13} />Agregar experiencia</h3>
        <div className="grid sm:grid-cols-2 gap-4 mb-4">
          {[
            { key:"company",      label:"Empresa",               placeholder:"TechCorp Inc." },
            { key:"role",         label:"Cargo",                  placeholder:"Senior Developer" },
            { key:"start_date",   label:"Fecha inicio",           placeholder:"2022-01" },
            { key:"end_date",     label:"Fecha fin",              placeholder:"2024-06" },
            { key:"technologies", label:"Tecnologías (separadas por coma)", placeholder:"React, TypeScript, Node.js" },
          ].map(({ key, label, placeholder }) => (
            <Field key={key} label={label}>
              <input value={(form as any)[key]} onChange={(e) => setForm({ ...form, [key]: e.target.value })}
                placeholder={placeholder} className="input-base" />
            </Field>
          ))}
          <Field label="Trabajo actual">
            <label className="flex items-center gap-2 mt-2 cursor-pointer">
              <input type="checkbox" checked={form.is_current} onChange={(e) => setForm({ ...form, is_current: e.target.checked })} className="rounded" />
              <span className="text-sm text-muted-foreground">Actualmente trabajo aquí</span>
            </label>
          </Field>
        </div>
        <Field label="Descripción">
          <div className="relative">
            <textarea rows={3} value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })}
              placeholder="Describe tus responsabilidades y logros..." className="input-base resize-none w-full pb-10" />
            <button onClick={async () => { const r = await optimizeText(form.description, "experience"); if (r) setForm({ ...form, description: r }); }}
              disabled={aiLoading}
              className="absolute right-3 bottom-3 flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-primary/10 text-primary text-xs font-medium hover:bg-primary/20 disabled:opacity-60">
              {aiLoading ? <Loader2 size={11} className="animate-spin" /> : <Sparkles size={11} />} IA
            </button>
          </div>
        </Field>
        <button onClick={handleAdd} disabled={adding}
          className="mt-4 flex items-center gap-2 px-4 py-2 rounded-xl bg-primary text-white text-sm font-medium hover:opacity-90 disabled:opacity-60">
          {adding ? <Loader2 size={13} className="animate-spin" /> : <Plus size={13} />} Agregar
        </button>
      </div>
    </div>
  );
}

function EducationTab({ resumeId, educations, onAdd, onRemove }: any) {
  const [form, setForm] = useState({ institution:"", degree:"", field:"", start_date:"", end_date:"", is_current:false });
  const [adding, setAdding] = useState(false);

  const handleAdd = async () => {
    if (!form.institution) return toast.error("La institución es requerida");
    setAdding(true);
    try {
      if (resumeId) {
        const saved = await api.addEducation(resumeId, form);
        onAdd(saved);
      } else onAdd(form);
      setForm({ institution:"", degree:"", field:"", start_date:"", end_date:"", is_current:false });
      toast.success("Educación agregada!");
    } catch { toast.error("Error al guardar"); }
    finally { setAdding(false); }
  };

  return (
    <div className="space-y-4">
      {educations.map((edu: any, i: number) => (
        <div key={i} className="p-4 rounded-2xl border border-border bg-card relative group">
          <button onClick={() => onRemove(i)} className="absolute top-3 right-3 opacity-0 group-hover:opacity-100 text-muted-foreground hover:text-destructive"><Trash2 size={13} /></button>
          <p className="font-semibold text-sm">{edu.degree} {edu.field && `en ${edu.field}`}</p>
          <p className="text-xs text-primary mt-0.5">{edu.institution}</p>
          <p className="text-xs text-muted-foreground">{edu.start_date} – {edu.is_current ? "Presente" : edu.end_date}</p>
        </div>
      ))}
      <div className="p-5 rounded-2xl border border-dashed border-border bg-secondary/20">
        <h3 className="text-sm font-semibold mb-4 flex items-center gap-2"><Plus size={13} />Agregar educación</h3>
        <div className="grid sm:grid-cols-2 gap-4">
          {[
            { key:"institution", label:"Institución",     placeholder:"UPC, PUCP, MIT..." },
            { key:"degree",      label:"Grado",            placeholder:"Bachiller, Maestría..." },
            { key:"field",       label:"Campo de estudio", placeholder:"Ingeniería de Software" },
            { key:"start_date",  label:"Año inicio",       placeholder:"2018" },
            { key:"end_date",    label:"Año fin",          placeholder:"2022" },
          ].map(({ key, label, placeholder }) => (
            <Field key={key} label={label}>
              <input value={(form as any)[key]} onChange={(e) => setForm({ ...form, [key]: e.target.value })}
                placeholder={placeholder} className="input-base" />
            </Field>
          ))}
        </div>
        <button onClick={handleAdd} disabled={adding} className="mt-4 flex items-center gap-2 px-4 py-2 rounded-xl bg-primary text-white text-sm font-medium hover:opacity-90 disabled:opacity-60">
          {adding ? <Loader2 size={13} className="animate-spin" /> : <Plus size={13} />} Agregar
        </button>
      </div>
    </div>
  );
}

function SkillsTab({ resumeId, skills, onAdd, onRemove }: any) {
  const [name, setName] = useState(""); const [category, setCategory] = useState("technical"); const [level, setLevel] = useState("intermediate");
  const [adding, setAdding] = useState(false);

  const handleAdd = async () => {
    if (!name.trim()) return;
    setAdding(true);
    try {
      const payload = { name: name.trim(), category, level };
      if (resumeId) { const s = await api.addSkill(resumeId, payload); onAdd(s); }
      else onAdd(payload);
      setName(""); toast.success("Habilidad agregada!");
    } catch { toast.error("Error al guardar"); }
    finally { setAdding(false); }
  };

  const handleRemove = async (sk: any, i: number) => {
    if (resumeId && sk.id) { try { await api.deleteSkill(resumeId, sk.id); } catch { toast.error("Error"); return; } }
    onRemove(i);
  };

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap gap-2">
        {skills.map((sk: any, i: number) => (
          <span key={i} className="flex items-center gap-1.5 px-3 py-1.5 rounded-full border border-border bg-card text-sm">
            {sk.name}
            <span className="text-[10px] text-muted-foreground">({sk.level})</span>
            <button onClick={() => handleRemove(sk, i)} className="text-muted-foreground hover:text-destructive ml-0.5"><X size={11} /></button>
          </span>
        ))}
        {skills.length === 0 && <p className="text-muted-foreground text-sm">Sin habilidades aún.</p>}
      </div>
      <div className="p-5 rounded-2xl border border-dashed border-border bg-secondary/20">
        <h3 className="text-sm font-semibold mb-4 flex items-center gap-2"><Plus size={13} />Agregar habilidad</h3>
        <div className="grid sm:grid-cols-3 gap-4">
          <Field label="Nombre"><input value={name} onChange={(e) => setName(e.target.value)} placeholder="React, Python..." className="input-base" onKeyDown={(e) => e.key === "Enter" && handleAdd()} /></Field>
          <Field label="Categoría">
            <select value={category} onChange={(e) => setCategory(e.target.value)} className="input-base">
              {["technical","soft","language","tool"].map(c => <option key={c} value={c}>{c.charAt(0).toUpperCase()+c.slice(1)}</option>)}
            </select>
          </Field>
          <Field label="Nivel">
            <select value={level} onChange={(e) => setLevel(e.target.value)} className="input-base">
              {["beginner","intermediate","advanced","expert"].map(l => <option key={l} value={l}>{l.charAt(0).toUpperCase()+l.slice(1)}</option>)}
            </select>
          </Field>
        </div>
        <button onClick={handleAdd} disabled={adding} className="mt-4 flex items-center gap-2 px-4 py-2 rounded-xl bg-primary text-white text-sm font-medium hover:opacity-90 disabled:opacity-60">
          {adding ? <Loader2 size={13} className="animate-spin" /> : <Plus size={13} />} Agregar
        </button>
      </div>
    </div>
  );
}

function ProjectsTab({ resumeId, projects, onAdd, onRemove }: any) {
  const [form, setForm] = useState({ name:"", description:"", technologies:"", github_url:"", demo_url:"" });
  const [adding, setAdding] = useState(false);

  const handleAdd = async () => {
    if (!form.name.trim()) return toast.error("El nombre del proyecto es requerido");
    setAdding(true);
    try {
      const payload = { ...form, technologies: form.technologies.split(",").map((t: string) => t.trim()).filter(Boolean) };
      if (resumeId) { const p = await api.addProject(resumeId, payload); onAdd(p); }
      else onAdd(payload);
      setForm({ name:"", description:"", technologies:"", github_url:"", demo_url:"" });
      toast.success("Proyecto agregado!");
    } catch { toast.error("Error al guardar"); }
    finally { setAdding(false); }
  };

  const handleRemove = async (p: any, i: number) => {
    if (resumeId && p.id) { try { await api.deleteProject(resumeId, p.id); } catch { toast.error("Error"); return; } }
    onRemove(i);
  };

  return (
    <div className="space-y-4">
      {projects.map((p: any, i: number) => (
        <div key={i} className="p-4 rounded-2xl border border-border bg-card relative group">
          <button onClick={() => handleRemove(p, i)} className="absolute top-3 right-3 opacity-0 group-hover:opacity-100 text-muted-foreground hover:text-destructive"><Trash2 size={13} /></button>
          <p className="font-semibold text-sm">{p.name}</p>
          {p.description && <p className="text-sm text-muted-foreground mt-1">{p.description}</p>}
          <div className="flex gap-3 mt-2 text-xs text-primary">
            {p.github_url && <a href={p.github_url} target="_blank" className="hover:underline">GitHub ↗</a>}
            {p.demo_url && <a href={p.demo_url} target="_blank" className="hover:underline">Demo ↗</a>}
          </div>
        </div>
      ))}
      <div className="p-5 rounded-2xl border border-dashed border-border bg-secondary/20">
        <h3 className="text-sm font-semibold mb-4 flex items-center gap-2"><Plus size={13} />Agregar proyecto</h3>
        <div className="grid sm:grid-cols-2 gap-4">
          {[
            { key:"name",         label:"Nombre del proyecto", placeholder:"TaskFlow Pro" },
            { key:"technologies", label:"Tecnologías",          placeholder:"React, Node.js, PostgreSQL" },
            { key:"github_url",   label:"URL GitHub",           placeholder:"https://github.com/tu/proyecto" },
            { key:"demo_url",     label:"URL Demo",             placeholder:"https://proyecto.vercel.app" },
          ].map(({ key, label, placeholder }) => (
            <Field key={key} label={label}>
              <input value={(form as any)[key]} onChange={(e) => setForm({ ...form, [key]: e.target.value })}
                placeholder={placeholder} className="input-base" />
            </Field>
          ))}
          <div className="sm:col-span-2">
            <Field label="Descripción">
              <textarea rows={3} value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })}
                placeholder="¿Qué hace este proyecto y cuál es su impacto?" className="input-base resize-none w-full" />
            </Field>
          </div>
        </div>
        <button onClick={handleAdd} disabled={adding} className="mt-4 flex items-center gap-2 px-4 py-2 rounded-xl bg-primary text-white text-sm font-medium hover:opacity-90 disabled:opacity-60">
          {adding ? <Loader2 size={13} className="animate-spin" /> : <Plus size={13} />} Agregar
        </button>
      </div>
    </div>
  );
}
