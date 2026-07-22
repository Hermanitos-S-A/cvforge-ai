"use client";
import { useState } from "react";
import { motion } from "framer-motion";
import { ArrowLeft, Download, Loader2 } from "lucide-react";
import Link from "next/link";
import { useAuth } from "@/hooks/useAuth";
import { useResume } from "@/hooks/useResume";
import { api } from "@/lib/api";
import { toast } from "sonner";

export default function CVPreviewPage() {
  useAuth();
  const { resume, serverResumeId } = useResume();
  const [exporting, setExporting] = useState(false);
  const p = resume.personal || {};

  const exportPDF = async () => {
    if (!serverResumeId) return toast.error("Guarda tu CV primero en Mi Perfil");
    setExporting(true);
    try {
      const blob = await api.exportPDF(serverResumeId, resume.template);
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = "cv-" + (p.name || "resume").toLowerCase().replace(/\s/g, "-") + ".pdf";
      a.click();
      URL.revokeObjectURL(url);
      toast.success("PDF exportado!");
    } catch { toast.error("Error al exportar. Verifica que el backend esta corriendo."); }
    finally { setExporting(false); }
  };

  const TC: Record<string, { accent: string; header: string }> = {
    atlas: { accent: "#6c63ff", header: "linear-gradient(135deg,#6c63ff,#22d3ee)" },
    nova: { accent: "#0ea5e9", header: "linear-gradient(135deg,#0ea5e9,#7dd3fc)" },
    zenith: { accent: "#10b981", header: "linear-gradient(135deg,#10b981,#6ee7b7)" },
  };
  const tc = TC[resume.template] || TC.atlas;
  const hasData = p.name || resume.experiences.length > 0 || resume.skills.length > 0;

  return (
    <div className="p-6 max-w-6xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <Link href="/dashboard/cv" className="flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors">
            <ArrowLeft size={14} /> Volver al editor
          </Link>
          <span className="text-border">|</span>
          <h1 className="text-lg font-bold">Vista previa en tiempo real</h1>
        </div>
        <button onClick={exportPDF} disabled={exporting}
          className="flex items-center gap-2 px-4 py-2 rounded-xl bg-primary text-white text-sm font-medium hover:opacity-90 disabled:opacity-60">
          {exporting ? <Loader2 size={13} className="animate-spin" /> : <Download size={13} />}
          {exporting ? "Exportando..." : "Exportar PDF"}
        </button>
      </div>

      <div className="grid lg:grid-cols-5 gap-6">
        <div className="lg:col-span-3">
          <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}
            className="bg-white rounded-2xl shadow-2xl overflow-hidden text-gray-800"
            style={{ fontFamily: "'Helvetica Neue', Arial, sans-serif", minHeight: "700px" }}>
            <div className="p-8 pb-6 text-white" style={{ background: tc.header }}>
              <h1 className="text-2xl font-bold mb-0.5">{p.name || "Tu Nombre"}</h1>
              <p className="text-white/80 text-sm">{p.title || "Tu titulo profesional"}</p>
              <div className="flex flex-wrap gap-3 mt-3 text-xs text-white/70">
                {p.email && <span>{p.email}</span>}
                {p.phone && <span>{p.phone}</span>}
                {p.location && <span>{p.location}</span>}
                {p.linkedin && <span>LinkedIn: {p.linkedin}</span>}
                {p.github && <span>GitHub: {p.github}</span>}
              </div>
            </div>

            {!hasData ? (
              <div className="p-8 text-center text-gray-400 py-16">
                <p className="text-sm mb-2">Tu CV aparecera aqui mientras lo completas</p>
                <Link href="/dashboard/cv" className="text-xs hover:underline" style={{ color: tc.accent }}>
                  Ir al editor
                </Link>
              </div>
            ) : (
              <div className="p-8 space-y-5 text-[13px]">
                {resume.summary && (
                  <section>
                    <h2 className="text-[10px] font-bold uppercase tracking-widest mb-2 pb-1 border-b-2"
                      style={{ color: tc.accent, borderColor: tc.accent }}>Resumen</h2>
                    <p className="text-gray-600 text-[12px] leading-relaxed">{resume.summary}</p>
                  </section>
                )}
                {resume.experiences.length > 0 && (
                  <section>
                    <h2 className="text-[10px] font-bold uppercase tracking-widest mb-3 pb-1 border-b-2"
                      style={{ color: tc.accent, borderColor: tc.accent }}>Experiencia</h2>
                    <div className="space-y-4">
                      {resume.experiences.map((exp, i) => (
                        <div key={i}>
                          <div className="flex justify-between items-start">
                            <div>
                              <p className="font-bold">{exp.role}</p>
                              <p className="text-[12px] font-medium" style={{ color: tc.accent }}>{exp.company}</p>
                            </div>
                            <p className="text-[11px] text-gray-400 ml-4 flex-shrink-0">
                              {exp.start_date} - {exp.is_current ? "Presente" : exp.end_date}
                            </p>
                          </div>
                          {exp.description && <p className="text-[12px] text-gray-600 mt-1">{exp.description}</p>}
                          {exp.technologies?.length > 0 && (
                            <div className="flex flex-wrap gap-1 mt-1.5">
                              {exp.technologies.map((t: string) => (
                                <span key={t} className="text-[10px] px-2 py-0.5 rounded-full bg-gray-100 text-gray-500">{t}</span>
                              ))}
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  </section>
                )}
                {resume.educations.length > 0 && (
                  <section>
                    <h2 className="text-[10px] font-bold uppercase tracking-widest mb-3 pb-1 border-b-2"
                      style={{ color: tc.accent, borderColor: tc.accent }}>Educacion</h2>
                    <div className="space-y-2">
                      {resume.educations.map((edu: any, i: number) => (
                        <div key={i} className="flex justify-between">
                          <div>
                            <p className="font-bold">{edu.degree} {edu.field && "en " + edu.field}</p>
                            <p className="text-[12px] text-gray-500">{edu.institution}</p>
                          </div>
                          <p className="text-[11px] text-gray-400">{edu.start_date} - {edu.is_current ? "Presente" : edu.end_date}</p>
                        </div>
                      ))}
                    </div>
                  </section>
                )}
                {resume.skills.length > 0 && (
                  <section>
                    <h2 className="text-[10px] font-bold uppercase tracking-widest mb-3 pb-1 border-b-2"
                      style={{ color: tc.accent, borderColor: tc.accent }}>Habilidades</h2>
                    <div className="flex flex-wrap gap-1.5">
                      {resume.skills.map((s: any) => (
                        <span key={s.name} className="text-[11px] px-2.5 py-1 rounded-full border"
                          style={{ borderColor: tc.accent + "40", color: tc.accent }}>{s.name}</span>
                      ))}
                    </div>
                  </section>
                )}
                {resume.projects.length > 0 && (
                  <section>
                    <h2 className="text-[10px] font-bold uppercase tracking-widest mb-3 pb-1 border-b-2"
                      style={{ color: tc.accent, borderColor: tc.accent }}>Proyectos</h2>
                    <div className="space-y-3">
                      {resume.projects.map((proj: any, i: number) => (
                        <div key={i}>
                          <div className="flex items-center gap-2">
                            <p className="font-bold">{proj.name}</p>
                            {proj.github_url && <a href={proj.github_url} target="_blank" className="text-[10px] hover:underline" style={{ color: tc.accent }}>GitHub</a>}
                            {proj.demo_url && <a href={proj.demo_url} target="_blank" className="text-[10px] hover:underline" style={{ color: tc.accent }}>Demo</a>}
                          </div>
                          {proj.description && <p className="text-[12px] text-gray-600 mt-0.5">{proj.description}</p>}
                          {proj.technologies?.length > 0 && (
                            <div className="flex flex-wrap gap-1 mt-1">
                              {proj.technologies.map((t: string) => (
                                <span key={t} className="text-[10px] px-1.5 py-0.5 rounded bg-gray-100 text-gray-500">{t}</span>
                              ))}
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  </section>
                )}
              </div>
            )}
          </motion.div>
        </div>

        <div className="lg:col-span-2 space-y-4">
          <div className="p-5 rounded-2xl border border-border bg-card">
            <h3 className="font-semibold text-sm mb-4">Plantilla activa</h3>
            <div className="space-y-2">
              {[
                { id: "atlas", label: "Atlas", desc: "Degradado violeta + cyan", color: "#6c63ff" },
                { id: "nova", label: "Nova", desc: "Tema azul profesional", color: "#0ea5e9" },
                { id: "zenith", label: "Zenith", desc: "Acento verde, ATS optimo", color: "#10b981" },
              ].map(t => (
                <Link key={t.id} href="/dashboard/templates"
                  className={"flex items-center gap-3 p-3 rounded-xl border transition-all " + (
                    resume.template === t.id ? "border-primary/40 bg-primary/8" : "border-border hover:border-border/60"
                  )}>
                  <div className="w-4 h-4 rounded-full flex-shrink-0" style={{ background: t.color }} />
                  <div className="flex-1">
                    <p className={"text-sm font-medium " + (resume.template === t.id ? "text-primary" : "")}>{t.label}</p>
                    <p className="text-xs text-muted-foreground">{t.desc}</p>
                  </div>
                  {resume.template === t.id && <span className="text-xs text-primary font-bold">activa</span>}
                </Link>
              ))}
            </div>
          </div>

          <div className="p-5 rounded-2xl border border-border bg-card">
            <h3 className="font-semibold text-sm mb-4">Completitud del CV</h3>
            <div className="space-y-2.5">
              {[
                { name: "Nombre y titulo", done: !!(p.name && p.title) },
                { name: "Contacto", done: !!(p.email || p.phone) },
                { name: "Resumen", done: resume.summary?.length > 20 },
                { name: "Experiencia", done: resume.experiences.length > 0 },
                { name: "Habilidades", done: resume.skills.length > 2 },
                { name: "Proyectos", done: resume.projects.length > 0 },
              ].map(s => (
                <div key={s.name} className="flex items-center gap-2 text-sm">
                  <div className={"w-4 h-4 rounded-full flex items-center justify-center text-[10px] flex-shrink-0 " + (
                    s.done ? "bg-emerald-500/20 text-emerald-400" : "bg-border text-muted-foreground"
                  )}>
                    {s.done ? "+" : "o"}
                  </div>
                  <span className={s.done ? "text-foreground" : "text-muted-foreground"}>{s.name}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="p-5 rounded-2xl border border-border bg-card">
            <h3 className="font-semibold text-sm mb-3">Acciones</h3>
            <div className="space-y-1.5">
              {[
                { href: "/dashboard/cv", label: "Editar perfil", icon: "E" },
                { href: "/dashboard/ai", label: "Optimizar con IA", icon: "A" },
                { href: "/dashboard/ats", label: "Analizar ATS", icon: "S" },
                { href: "/dashboard/portfolio", label: "Ver portafolio", icon: "P" },
              ].map(a => (
                <Link key={a.href} href={a.href}
                  className="flex items-center gap-2.5 p-2.5 rounded-xl hover:bg-secondary transition-colors text-sm text-muted-foreground hover:text-foreground">
                  <span className="text-primary font-bold text-xs w-4">{a.icon}</span>{a.label}
                </Link>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
