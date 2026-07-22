"use client";
import { useEffect } from "react";
import { motion } from "framer-motion";
import { ScanLine, Sparkles, FileText, Globe, CheckCircle, AlertCircle, TrendingUp, ArrowRight } from "lucide-react";
import Link from "next/link";
import { useAuth } from "@/hooks/useAuth";
import { useResume } from "@/hooks/useResume";

const c = { hidden: {}, visible: { transition: { staggerChildren: 0.07 } } };
const i = { hidden: { opacity: 0, y: 16 }, visible: { opacity: 1, y: 0 } };

export default function DashboardPage() {
  const { user } = useAuth();
  const { resume, loading } = useResume();

  const sections = [
    { name: "Información Personal", done: !!(resume.personal?.name && resume.personal?.email) },
    { name: "Experiencia", done: resume.experiences.length > 0 },
    { name: "Educación", done: resume.educations.length > 0 },
    { name: "Habilidades", done: resume.skills.length > 2 },
    { name: "Proyectos", done: resume.projects.length > 0 },
  ];
  const pct = Math.round((sections.filter(s => s.done).length / sections.length) * 100);

  const stats = [
    { label: "ATS Score", value: resume.ats_score > 0 ? `${Math.round(resume.ats_score)}%` : "—", sub: "Último análisis", color: "text-violet-400", icon: ScanLine },
    { label: "Experiencias", value: String(resume.experiences.length), sub: "Entradas añadidas", color: "text-cyan-400", icon: FileText },
    { label: "Habilidades", value: String(resume.skills.length), sub: "Skills registradas", color: "text-emerald-400", icon: Sparkles },
    { label: "Proyectos", value: String(resume.projects.length), sub: "Proyectos añadidos", color: "text-amber-400", icon: Globe },
  ];

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full min-h-[400px]">
        <div className="text-center">
          <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-3" />
          <p className="text-sm text-muted-foreground">Cargando tu perfil...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6">
      <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}>
        <h1 className="text-2xl font-bold">
          Hola, {user?.full_name?.split(" ")[0] || "bienvenido"} 👋
        </h1>
        <p className="text-muted-foreground text-sm mt-1">
          Tu perfil está <span className="text-primary font-semibold">{pct}%</span> completo
        </p>
      </motion.div>

      {pct < 100 && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.1 }}
          className="flex items-center gap-3 p-3.5 rounded-xl border border-amber-500/20 bg-amber-500/5 text-sm text-amber-400">
          <AlertCircle size={15} className="flex-shrink-0" />
          <span>Completa tu perfil para mejorar tu score ATS y generar un mejor CV.</span>
          <Link href="/dashboard/cv" className="ml-auto flex items-center gap-1 underline font-medium whitespace-nowrap hover:text-amber-300">
            Completar <ArrowRight size={12} />
          </Link>
        </motion.div>
      )}

      {/* Stats */}
      <motion.div variants={c} initial="hidden" animate="visible" className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((s) => (
          <motion.div key={s.label} variants={i}
            className="p-4 rounded-2xl border border-border bg-card hover:border-border/60 transition-colors">
            <div className="flex items-center justify-between mb-3">
              <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">{s.label}</p>
              <s.icon size={14} className={s.color} />
            </div>
            <p className={`text-2xl font-bold font-mono ${s.color}`}>{s.value}</p>
            <p className="text-xs text-muted-foreground mt-1">{s.sub}</p>
          </motion.div>
        ))}
      </motion.div>

      <div className="grid lg:grid-cols-3 gap-6">
        {/* Completitud */}
        <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}
          className="p-6 rounded-2xl border border-border bg-card">
          <h2 className="font-semibold mb-4">Completitud del perfil</h2>
          <div className="mb-4">
            <div className="flex justify-between text-sm mb-1.5">
              <span className="text-muted-foreground">General</span>
              <span className="font-bold font-mono text-violet-400">{pct}%</span>
            </div>
            <div className="h-2 rounded-full bg-secondary overflow-hidden">
              <motion.div initial={{ width: 0 }} animate={{ width: `${pct}%` }} transition={{ delay: 0.5, duration: 0.8 }}
                className="h-full rounded-full bg-gradient-to-r from-violet-500 to-cyan-400" />
            </div>
          </div>
          <div className="space-y-2.5 mb-5">
            {sections.map((s) => (
              <div key={s.name} className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">{s.name}</span>
                {s.done
                  ? <span className="flex items-center gap-1 text-emerald-400 text-xs"><CheckCircle size={11} />Listo</span>
                  : <Link href="/dashboard/cv" className="text-amber-400 text-xs hover:underline">+ Agregar</Link>
                }
              </div>
            ))}
          </div>
          <Link href="/dashboard/cv"
            className="flex items-center justify-center gap-2 w-full py-2.5 rounded-xl border border-primary/30 bg-primary/10 text-primary text-sm font-medium hover:bg-primary/20 transition-colors">
            <FileText size={13} /> Editar perfil
          </Link>
        </motion.div>

        {/* Acciones rápidas */}
        <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.25 }}
          className="p-6 rounded-2xl border border-border bg-card">
          <h2 className="font-semibold mb-4">Acciones rápidas</h2>
          <div className="space-y-2">
            {[
              { href: "/dashboard/cv/preview", icon: "👁", label: "Vista previa del CV", desc: "Ve cómo quedará tu PDF" },
              { href: "/dashboard/ai", icon: "✦", label: "Optimizar con IA", desc: "Mejora tus textos" },
              { href: "/dashboard/ats", icon: "◉", label: "Analizar ATS", desc: "Verifica compatibilidad" },
              { href: "/dashboard/templates", icon: "↓", label: "Exportar PDF", desc: "Descarga tu CV" },
              { href: "/dashboard/portfolio", icon: "◇", label: "Ver portafolio", desc: "Tu página personal" },
              { href: "/dashboard/bio", icon: "◎", label: "Generar bio", desc: "Para LinkedIn y más" },
            ].map((a) => (
              <Link key={a.href} href={a.href}
                className="flex items-center gap-3 p-3 rounded-xl border border-border hover:border-primary/30 hover:bg-primary/5 transition-all group">
                <span className="text-base text-primary w-5 text-center">{a.icon}</span>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium group-hover:text-primary transition-colors">{a.label}</p>
                  <p className="text-xs text-muted-foreground">{a.desc}</p>
                </div>
                <ArrowRight size={12} className="text-muted-foreground group-hover:text-primary transition-colors flex-shrink-0" />
              </Link>
            ))}
          </div>
        </motion.div>

        {/* ATS Estado */}
        <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}
          className="p-6 rounded-2xl border border-border bg-card">
          <h2 className="font-semibold mb-4">Score ATS</h2>
          {resume.ats_score > 0 ? (
            <div className="text-center">
              <div className="relative w-32 h-32 mx-auto mb-4">
                <svg className="w-32 h-32 -rotate-90" viewBox="0 0 128 128">
                  <circle cx="64" cy="64" r="52" fill="none" stroke="hsl(var(--border))" strokeWidth="8" />
                  <circle cx="64" cy="64" r="52" fill="none" stroke="url(#dsg)" strokeWidth="8"
                    strokeLinecap="round"
                    strokeDasharray="327"
                    strokeDashoffset={327 - (327 * resume.ats_score) / 100} />
                  <defs>
                    <linearGradient id="dsg" x1="0" y1="0" x2="1" y2="0">
                      <stop offset="0%" stopColor="#6c63ff" />
                      <stop offset="100%" stopColor="#22d3ee" />
                    </linearGradient>
                  </defs>
                </svg>
                <div className="absolute inset-0 flex flex-col items-center justify-center">
                  <span className="text-3xl font-bold font-mono">{Math.round(resume.ats_score)}</span>
                  <span className="text-xs text-muted-foreground">/ 100</span>
                </div>
              </div>
              <p className="text-sm text-muted-foreground mb-4">Último análisis completado</p>
              <Link href="/dashboard/ats"
                className="inline-flex items-center gap-2 px-4 py-2 rounded-xl border border-border text-sm hover:bg-secondary transition-colors">
                <ScanLine size={13} /> Nuevo análisis
              </Link>
            </div>
          ) : (
            <div className="text-center py-6">
              <div className="w-16 h-16 rounded-2xl bg-primary/10 flex items-center justify-center mx-auto mb-4">
                <TrendingUp size={28} className="text-primary" />
              </div>
              <p className="text-sm font-medium mb-1">Sin análisis ATS</p>
              <p className="text-xs text-muted-foreground mb-5">Analiza tu CV contra una oferta de trabajo</p>
              <Link href="/dashboard/ats"
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-primary text-white text-sm font-medium hover:opacity-90 transition-all">
                <ScanLine size={13} /> Analizar ahora
              </Link>
            </div>
          )}
        </motion.div>
      </div>
    </div>
  );
}
