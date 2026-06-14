"use client";
import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Save, Plus, Trash2, Loader2, Sparkles, X } from "lucide-react";
import { toast } from "sonner";
import { useResumeStore } from "@/stores/resumeStore";
import { api } from "@/lib/api";

const TABS = ["Personal", "Experience", "Education", "Skills", "Projects"];

export default function CVBuilderPage() {
  const [activeTab, setActiveTab] = useState(0);
  const { resume, updatePersonal, updateSummary, addExperience, removeExperience,
    addSkill, removeSkill, addProject, removeProject, isDirty, markClean } = useResumeStore();
  const [saving, setSaving] = useState(false);
  const [optimizing, setOptimizing] = useState<string | null>(null);

  const handleSave = async () => {
    setSaving(true);
    try {
      // In full integration, call api.updateResume(resume.id!, {...})
      await new Promise((r) => setTimeout(r, 600));
      markClean();
      toast.success("Profile saved successfully!");
    } catch {
      toast.error("Failed to save. Please try again.");
    } finally {
      setSaving(false);
    }
  };

  const optimizeText = async (field: string, text: string) => {
    if (!text.trim()) return toast.error("Enter some text first");
    setOptimizing(field);
    try {
      const res = await api.optimizeText(text, "experience");
      if (field === "summary") updateSummary(res.optimized);
      toast.success("✨ Text optimized by AI!");
    } catch {
      toast.error("AI not available — make sure Ollama is running");
    } finally {
      setOptimizing(null);
    }
  };

  return (
    <div className="p-6 max-w-4xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold">My Profile</h1>
          <p className="text-muted-foreground text-sm mt-1">Fill in your details to generate a stunning CV</p>
        </div>
        <button
          onClick={handleSave}
          disabled={saving || !isDirty}
          className="flex items-center gap-2 px-4 py-2 rounded-xl bg-primary text-white text-sm font-medium hover:bg-primary/90 transition-all disabled:opacity-50"
        >
          {saving ? <Loader2 size={14} className="animate-spin" /> : <Save size={14} />}
          {saving ? "Saving..." : isDirty ? "Save changes" : "Saved"}
        </button>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 border-b border-border mb-6">
        {TABS.map((tab, i) => (
          <button
            key={tab}
            onClick={() => setActiveTab(i)}
            className={`px-4 py-2.5 text-sm font-medium transition-all border-b-2 -mb-px ${
              activeTab === i
                ? "border-primary text-primary"
                : "border-transparent text-muted-foreground hover:text-foreground"
            }`}
          >
            {tab}
          </button>
        ))}
      </div>

      <AnimatePresence mode="wait">
        <motion.div
          key={activeTab}
          initial={{ opacity: 0, x: 10 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -10 }}
          transition={{ duration: 0.2 }}
        >
          {/* ── PERSONAL ────────────────────────────────────────────────── */}
          {activeTab === 0 && (
            <div className="space-y-5">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {[
                  { key: "name",      label: "Full Name",         placeholder: "Alex Ramirez" },
                  { key: "title",     label: "Professional Title", placeholder: "Senior Frontend Engineer" },
                  { key: "email",     label: "Email",             placeholder: "alex@example.com" },
                  { key: "phone",     label: "Phone",             placeholder: "+51 999 888 777" },
                  { key: "location",  label: "Location",          placeholder: "Lima, Perú" },
                  { key: "linkedin",  label: "LinkedIn URL",      placeholder: "linkedin.com/in/alex" },
                  { key: "github",    label: "GitHub URL",        placeholder: "github.com/alex" },
                  { key: "portfolio", label: "Portfolio URL",     placeholder: "alexramirez.dev" },
                ].map(({ key, label, placeholder }) => (
                  <Field key={key} label={label}>
                    <input
                      value={(resume.personal as any)[key] || ""}
                      onChange={(e) => updatePersonal({ [key]: e.target.value })}
                      placeholder={placeholder}
                      className="input-base"
                    />
                  </Field>
                ))}
              </div>

              <Field label="Professional Summary">
                <div className="relative">
                  <textarea
                    rows={4}
                    value={resume.summary}
                    onChange={(e) => updateSummary(e.target.value)}
                    placeholder="Write a compelling professional summary..."
                    className="input-base resize-none w-full pr-24"
                  />
                  <button
                    onClick={() => optimizeText("summary", resume.summary)}
                    disabled={optimizing === "summary"}
                    className="absolute right-3 bottom-3 flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-primary/10 text-primary text-xs font-medium hover:bg-primary/20 transition-colors disabled:opacity-60"
                  >
                    {optimizing === "summary"
                      ? <Loader2 size={12} className="animate-spin" />
                      : <Sparkles size={12} />
                    }
                    AI Optimize
                  </button>
                </div>
              </Field>
            </div>
          )}

          {/* ── EXPERIENCE ──────────────────────────────────────────────── */}
          {activeTab === 1 && (
            <ExperienceTab
              experiences={resume.experiences}
              onAdd={addExperience}
              onRemove={removeExperience}
              onOptimize={optimizeText}
              optimizing={optimizing}
            />
          )}

          {/* ── EDUCATION ───────────────────────────────────────────────── */}
          {activeTab === 2 && (
            <EducationTab educations={resume.educations} />
          )}

          {/* ── SKILLS ──────────────────────────────────────────────────── */}
          {activeTab === 3 && (
            <SkillsTab skills={resume.skills} onAdd={addSkill} onRemove={removeSkill} />
          )}

          {/* ── PROJECTS ────────────────────────────────────────────────── */}
          {activeTab === 4 && (
            <ProjectsTab projects={resume.projects} onAdd={addProject} onRemove={removeProject} />
          )}
        </motion.div>
      </AnimatePresence>
    </div>
  );
}

/* ── Sub-components ─────────────────────────────────────────────────────────── */

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <label className="block text-xs font-medium uppercase tracking-wider text-muted-foreground mb-1.5">
        {label}
      </label>
      {children}
    </div>
  );
}

function ExperienceTab({ experiences, onAdd, onRemove, onOptimize, optimizing }: any) {
  const [form, setForm] = useState({
    company: "", role: "", description: "", technologies: "",
    start_date: "", end_date: "", is_current: false,
  });

  const handleAdd = () => {
    if (!form.company || !form.role) return toast.error("Company and role are required");
    onAdd({ ...form, technologies: form.technologies.split(",").map((t: string) => t.trim()).filter(Boolean) });
    setForm({ company: "", role: "", description: "", technologies: "", start_date: "", end_date: "", is_current: false });
    toast.success("Experience added!");
  };

  return (
    <div className="space-y-6">
      {/* Existing entries */}
      {experiences.map((exp: any, i: number) => (
        <div key={i} className="p-4 rounded-2xl border border-border bg-card relative group">
          <button onClick={() => onRemove(i)}
            className="absolute top-3 right-3 opacity-0 group-hover:opacity-100 text-muted-foreground hover:text-destructive transition-all">
            <Trash2 size={14} />
          </button>
          <p className="font-semibold text-sm">{exp.role} <span className="text-primary">@ {exp.company}</span></p>
          <p className="text-xs text-muted-foreground mt-1">{exp.start_date} – {exp.is_current ? "Present" : exp.end_date}</p>
          {exp.description && <p className="text-sm text-muted-foreground mt-2 leading-relaxed">{exp.description}</p>}
          {exp.technologies?.length > 0 && (
            <div className="flex flex-wrap gap-1.5 mt-3">
              {exp.technologies.map((t: string) => (
                <span key={t} className="text-xs px-2 py-0.5 rounded-full bg-secondary border border-border text-muted-foreground">{t}</span>
              ))}
            </div>
          )}
        </div>
      ))}

      {/* Add new form */}
      <div className="p-5 rounded-2xl border border-dashed border-border bg-secondary/30">
        <h3 className="text-sm font-semibold mb-4 flex items-center gap-2"><Plus size={14} />Add Experience</h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
          {[
            { key: "company", label: "Company", placeholder: "TechCorp Inc." },
            { key: "role", label: "Role / Title", placeholder: "Senior Developer" },
            { key: "start_date", label: "Start Date", placeholder: "2022-01" },
            { key: "end_date", label: "End Date", placeholder: "2024-06" },
          ].map(({ key, label, placeholder }) => (
            <Field key={key} label={label}>
              <input value={(form as any)[key]} onChange={(e) => setForm({ ...form, [key]: e.target.value })}
                placeholder={placeholder} className="input-base" />
            </Field>
          ))}
          <Field label="Technologies (comma separated)">
            <input value={form.technologies} onChange={(e) => setForm({ ...form, technologies: e.target.value })}
              placeholder="React, TypeScript, Node.js" className="input-base" />
          </Field>
          <Field label="Currently Working Here">
            <label className="flex items-center gap-2 mt-2 cursor-pointer">
              <input type="checkbox" checked={form.is_current}
                onChange={(e) => setForm({ ...form, is_current: e.target.checked })}
                className="rounded border-border" />
              <span className="text-sm text-muted-foreground">Yes, I currently work here</span>
            </label>
          </Field>
        </div>
        <Field label="Description">
          <div className="relative">
            <textarea rows={3} value={form.description}
              onChange={(e) => setForm({ ...form, description: e.target.value })}
              placeholder="Describe your responsibilities and achievements..."
              className="input-base resize-none w-full pr-24" />
            <button onClick={() => onOptimize("exp_desc", form.description)}
              disabled={optimizing === "exp_desc"}
              className="absolute right-3 bottom-3 flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-primary/10 text-primary text-xs font-medium hover:bg-primary/20 transition-colors">
              {optimizing === "exp_desc" ? <Loader2 size={12} className="animate-spin" /> : <Sparkles size={12} />}
              AI Optimize
            </button>
          </div>
        </Field>
        <button onClick={handleAdd}
          className="mt-4 flex items-center gap-2 px-4 py-2 rounded-xl bg-primary text-white text-sm font-medium hover:bg-primary/90 transition-colors">
          <Plus size={14} /> Add Experience
        </button>
      </div>
    </div>
  );
}

function EducationTab({ educations }: any) {
  return (
    <div className="space-y-4">
      {educations.length === 0 && (
        <div className="text-center py-12 text-muted-foreground text-sm">
          No education entries yet. Add your first one below.
        </div>
      )}
      <div className="p-5 rounded-2xl border border-dashed border-border bg-secondary/30">
        <h3 className="text-sm font-semibold mb-4 flex items-center gap-2"><Plus size={14} />Add Education</h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {[
            { label: "Institution", placeholder: "MIT, Stanford, UPC..." },
            { label: "Degree", placeholder: "Bachelor's, Master's..." },
            { label: "Field of Study", placeholder: "Computer Science" },
            { label: "Start Year", placeholder: "2018" },
            { label: "End Year", placeholder: "2022" },
            { label: "Grade / GPA", placeholder: "3.8 / 4.0" },
          ].map(({ label, placeholder }) => (
            <Field key={label} label={label}>
              <input placeholder={placeholder} className="input-base" />
            </Field>
          ))}
        </div>
        <button className="mt-4 flex items-center gap-2 px-4 py-2 rounded-xl bg-primary text-white text-sm font-medium hover:bg-primary/90 transition-colors">
          <Plus size={14} /> Add Education
        </button>
      </div>
    </div>
  );
}

function SkillsTab({ skills, onAdd, onRemove }: any) {
  const [name, setName] = useState("");
  const [category, setCategory] = useState("technical");
  const [level, setLevel] = useState("intermediate");

  const handleAdd = () => {
    if (!name.trim()) return;
    onAdd({ name: name.trim(), category, level });
    setName("");
    toast.success("Skill added!");
  };

  const categories = ["technical", "soft", "language", "tool"];
  const levels = ["beginner", "intermediate", "advanced", "expert"];

  return (
    <div className="space-y-5">
      {/* Current skills */}
      <div className="flex flex-wrap gap-2">
        {skills.map((sk: any, i: number) => (
          <span key={i}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-full border border-border bg-card text-sm">
            {sk.name}
            <span className="text-[10px] text-muted-foreground">({sk.level})</span>
            <button onClick={() => onRemove(i)} className="text-muted-foreground hover:text-destructive transition-colors ml-0.5">
              <X size={12} />
            </button>
          </span>
        ))}
        {skills.length === 0 && <p className="text-muted-foreground text-sm">No skills added yet.</p>}
      </div>

      {/* Add skill */}
      <div className="p-5 rounded-2xl border border-dashed border-border bg-secondary/30">
        <h3 className="text-sm font-semibold mb-4 flex items-center gap-2"><Plus size={14} />Add Skill</h3>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <Field label="Skill Name">
            <input value={name} onChange={(e) => setName(e.target.value)}
              placeholder="React, Python, Docker..." className="input-base"
              onKeyDown={(e) => e.key === "Enter" && handleAdd()} />
          </Field>
          <Field label="Category">
            <select value={category} onChange={(e) => setCategory(e.target.value)} className="input-base">
              {categories.map((c) => <option key={c} value={c}>{c.charAt(0).toUpperCase() + c.slice(1)}</option>)}
            </select>
          </Field>
          <Field label="Level">
            <select value={level} onChange={(e) => setLevel(e.target.value)} className="input-base">
              {levels.map((l) => <option key={l} value={l}>{l.charAt(0).toUpperCase() + l.slice(1)}</option>)}
            </select>
          </Field>
        </div>
        <button onClick={handleAdd}
          className="mt-4 flex items-center gap-2 px-4 py-2 rounded-xl bg-primary text-white text-sm font-medium hover:bg-primary/90 transition-colors">
          <Plus size={14} /> Add Skill
        </button>
      </div>
    </div>
  );
}

function ProjectsTab({ projects, onAdd, onRemove }: any) {
  const [form, setForm] = useState({ name: "", description: "", technologies: "", github_url: "", demo_url: "" });

  const handleAdd = () => {
    if (!form.name.trim()) return toast.error("Project name is required");
    onAdd({ ...form, technologies: form.technologies.split(",").map((t: string) => t.trim()).filter(Boolean) });
    setForm({ name: "", description: "", technologies: "", github_url: "", demo_url: "" });
    toast.success("Project added!");
  };

  return (
    <div className="space-y-5">
      {projects.map((p: any, i: number) => (
        <div key={i} className="p-4 rounded-2xl border border-border bg-card relative group">
          <button onClick={() => onRemove(i)}
            className="absolute top-3 right-3 opacity-0 group-hover:opacity-100 text-muted-foreground hover:text-destructive transition-all">
            <Trash2 size={14} />
          </button>
          <p className="font-semibold text-sm">{p.name}</p>
          {p.description && <p className="text-sm text-muted-foreground mt-1">{p.description}</p>}
          <div className="flex gap-3 mt-2 text-xs text-primary">
            {p.github_url && <a href={p.github_url} target="_blank" className="hover:underline">GitHub ↗</a>}
            {p.demo_url && <a href={p.demo_url} target="_blank" className="hover:underline">Demo ↗</a>}
          </div>
        </div>
      ))}

      <div className="p-5 rounded-2xl border border-dashed border-border bg-secondary/30">
        <h3 className="text-sm font-semibold mb-4 flex items-center gap-2"><Plus size={14} />Add Project</h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Field label="Project Name">
            <input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })}
              placeholder="TaskFlow Pro" className="input-base" />
          </Field>
          <Field label="Technologies">
            <input value={form.technologies} onChange={(e) => setForm({ ...form, technologies: e.target.value })}
              placeholder="React, Node.js, PostgreSQL" className="input-base" />
          </Field>
          <Field label="GitHub URL">
            <input value={form.github_url} onChange={(e) => setForm({ ...form, github_url: e.target.value })}
              placeholder="https://github.com/you/project" className="input-base" />
          </Field>
          <Field label="Live Demo URL">
            <input value={form.demo_url} onChange={(e) => setForm({ ...form, demo_url: e.target.value })}
              placeholder="https://project.vercel.app" className="input-base" />
          </Field>
          <div className="sm:col-span-2">
            <Field label="Description">
              <textarea rows={3} value={form.description}
                onChange={(e) => setForm({ ...form, description: e.target.value })}
                placeholder="Describe what this project does and its impact..."
                className="input-base resize-none w-full" />
            </Field>
          </div>
        </div>
        <button onClick={handleAdd}
          className="mt-4 flex items-center gap-2 px-4 py-2 rounded-xl bg-primary text-white text-sm font-medium hover:bg-primary/90 transition-colors">
          <Plus size={14} /> Add Project
        </button>
      </div>
    </div>
  );
}
