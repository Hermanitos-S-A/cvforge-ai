"use client";
import Link from "next/link";
import Image from "next/image";
import { motion, useInView } from "framer-motion";
import { useRef } from "react";
import {
  ArrowRight, FileText, Zap, BarChart3, Globe,
  CheckCircle, Shield, Cpu, Download,
} from "lucide-react";

const features = [
  {
    icon: FileText,
    title: "CV Builder profesional",
    desc: "Formulario completo con experiencia, educación, habilidades y proyectos. Guardado automático en base de datos.",
    color: "text-violet-400",
    bg: "bg-violet-500/10",
  },
  {
    icon: Zap,
    title: "Optimizador con IA local",
    desc: "Ollama + Mistral 7B transforma descripciones simples en frases impactantes con verbos de acción y métricas reales.",
    color: "text-cyan-400",
    bg: "bg-cyan-500/10",
  },
  {
    icon: BarChart3,
    title: "Motor ATS propio",
    desc: "Análisis de keywords, verbos débiles y compatibilidad con ofertas de trabajo. Sin APIs externas, completamente local.",
    color: "text-emerald-400",
    bg: "bg-emerald-500/10",
  },
  {
    icon: Globe,
    title: "Portafolio web automático",
    desc: "Genera una página personal completa y responsive desde los datos de tu CV con un solo clic.",
    color: "text-amber-400",
    bg: "bg-amber-500/10",
  },
  {
    icon: Download,
    title: "Exportación PDF profesional",
    desc: "PDFs limpios y ATS-friendly generados con ReportLab. Tres plantillas: Atlas, Nova y Zenith.",
    color: "text-pink-400",
    bg: "bg-pink-500/10",
  },
  {
    icon: Cpu,
    title: "100% local y privado",
    desc: "Tu información nunca sale de tu máquina. La IA corre con Ollama localmente. Cero costos de API.",
    color: "text-indigo-400",
    bg: "bg-indigo-500/10",
  },
];

const stack = [
  { name: "FastAPI", version: "0.111", color: "text-emerald-400" },
  { name: "Next.js", version: "14.2", color: "text-foreground" },
  { name: "TypeScript", version: "5.4", color: "text-blue-400" },
  { name: "TailwindCSS", version: "3.4", color: "text-cyan-400" },
  { name: "Ollama", version: "Mistral 7B", color: "text-orange-400" },
  { name: "ReportLab", version: "4.2", color: "text-red-400" },
  { name: "SQLite / PostgreSQL", version: "", color: "text-violet-400" },
  { name: "Docker Compose", version: "", color: "text-blue-300" },
];

const steps = [
  { n: "01", title: "Crea tu cuenta", desc: "Registro gratis en segundos, sin tarjeta de crédito." },
  { n: "02", title: "Completa tu perfil", desc: "Agrega experiencia, habilidades y proyectos desde el formulario." },
  { n: "03", title: "Optimiza con IA", desc: "Deja que Mistral 7B reescriba tus textos con impacto profesional." },
  { n: "04", title: "Analiza el ATS", desc: "Pega una oferta de trabajo y obtén tu score de compatibilidad." },
  { n: "05", title: "Exporta y publica", desc: "Descarga el PDF y despliega tu portafolio web en Vercel." },
];

function FadeIn({ children, delay = 0 }: { children: React.ReactNode; delay?: number }) {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: "-60px" });
  return (
    <motion.div ref={ref} initial={{ opacity: 0, y: 24 }} animate={inView ? { opacity: 1, y: 0 } : {}}
      transition={{ duration: 0.5, delay }}>
      {children}
    </motion.div>
  );
}

export default function HomePage() {
  return (
    <div className="min-h-screen bg-background text-foreground overflow-x-hidden">

      {/* ── NAV ─────────────────────────────────────────────── */}
      <nav className="fixed top-0 left-0 right-0 z-50 border-b border-border/60 bg-background/80 backdrop-blur-xl">
        <div className="max-w-6xl mx-auto px-6 h-14 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2.5">
            <svg width="28" height="28" viewBox="0 0 36 36" fill="none">
              <rect width="36" height="36" rx="9" fill="url(#navGrad)"/>
              <path d="M11 10H18L14 17H20L11 26H17L22 17H17L21 10" fill="white"/>
              <defs>
                <linearGradient id="navGrad" x1="0" y1="0" x2="36" y2="36" gradientUnits="userSpaceOnUse">
                  <stop offset="0%" stopColor="#6c63ff"/>
                  <stop offset="100%" stopColor="#3ecfcf"/>
                </linearGradient>
              </defs>
            </svg>
            <span className="font-bold text-[15px] tracking-tight">
              CVForge <span className="text-primary">AI</span>
            </span>
          </Link>

          <div className="hidden md:flex items-center gap-6 text-sm text-muted-foreground">
            <Link href="#features" className="hover:text-foreground transition-colors">Funciones</Link>
            <Link href="#how" className="hover:text-foreground transition-colors">Cómo funciona</Link>
            <Link href="#stack" className="hover:text-foreground transition-colors">Stack</Link>
          </div>

          <div className="flex items-center gap-3">
            <Link href="/login" className="text-sm text-muted-foreground hover:text-foreground transition-colors hidden sm:block">
              Iniciar sesión
            </Link>
            <Link href="/register"
              className="flex items-center gap-1.5 text-sm px-4 py-2 rounded-xl bg-primary text-white font-semibold hover:opacity-90 transition-all">
              Empezar gratis <ArrowRight size={14} />
            </Link>
          </div>
        </div>
      </nav>

      {/* ── HERO ────────────────────────────────────────────── */}
      <section className="relative pt-36 pb-28 px-6 overflow-hidden">
        {/* Background decoration */}
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-20 left-1/2 -translate-x-1/2 w-[800px] h-[500px] rounded-full"
            style={{ background: "radial-gradient(ellipse, hsl(248 90% 68% / 0.08) 0%, transparent 70%)" }} />
          <div className="absolute top-40 left-10 w-64 h-64 rounded-full"
            style={{ background: "radial-gradient(ellipse, hsl(185 80% 60% / 0.05) 0%, transparent 70%)" }} />
          <div className="absolute top-60 right-10 w-48 h-48 rounded-full"
            style={{ background: "radial-gradient(ellipse, hsl(248 90% 68% / 0.05) 0%, transparent 70%)" }} />
          {/* Grid lines */}
          <svg className="absolute inset-0 w-full h-full opacity-[0.03]" xmlns="http://www.w3.org/2000/svg">
            <defs>
              <pattern id="grid" width="60" height="60" patternUnits="userSpaceOnUse">
                <path d="M 60 0 L 0 0 0 60" fill="none" stroke="currentColor" strokeWidth="0.5"/>
              </pattern>
            </defs>
            <rect width="100%" height="100%" fill="url(#grid)" />
          </svg>
        </div>

        <div className="relative max-w-5xl mx-auto text-center">
          <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full border border-primary/25 bg-primary/8 text-primary text-xs font-semibold mb-7 tracking-wide">
              <span className="w-1.5 h-1.5 rounded-full bg-primary animate-pulse" />
              100% Gratis · IA Local con Ollama · Open Source · MIT
            </div>
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6, delay: 0.05 }}
            className="text-5xl md:text-[68px] font-extrabold tracking-tight leading-[1.05] mb-6">
            Construye CVs que<br />
            <span style={{
              background: "linear-gradient(135deg, #a78bfa 0%, #6c63ff 40%, #22d3ee 100%)",
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent",
              backgroundClip: "text",
            }}>
              realmente consiguen trabajo
            </span>
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, delay: 0.1 }}
            className="text-lg text-muted-foreground max-w-2xl mx-auto mb-10 leading-relaxed">
            Plataforma SaaS con IA local para crear CVs ATS-optimizados, analizar compatibilidad con ofertas
            de trabajo y generar tu portafolio web. Sin suscripciones, sin APIs de pago, sin límites.
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, delay: 0.15 }}
            className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link href="/register"
              className="flex items-center gap-2 px-7 py-3.5 rounded-xl bg-primary text-white font-bold text-sm hover:opacity-90 transition-all hover:scale-[1.02] active:scale-[0.98]"
              style={{ boxShadow: "0 0 32px hsl(248 90% 68% / 0.3)" }}>
              Crear cuenta gratis <ArrowRight size={15} />
            </Link>
            <Link href="/login"
              className="flex items-center gap-2 px-7 py-3.5 rounded-xl border border-border text-sm font-medium hover:bg-secondary transition-colors">
              Ya tengo cuenta
            </Link>
          </motion.div>

          {/* Social proof */}
          <motion.div
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.4 }}
            className="flex items-center justify-center gap-6 mt-10 text-xs text-muted-foreground">
            {[
              { icon: Shield, text: "Datos 100% locales" },
              { icon: Cpu,    text: "IA con Ollama" },
              { icon: CheckCircle, text: "Sin tarjeta" },
            ].map(({ icon: Icon, text }) => (
              <div key={text} className="flex items-center gap-1.5">
                <Icon size={13} className="text-primary" />
                {text}
              </div>
            ))}
          </motion.div>
        </div>

        {/* Dashboard mockup */}
        <motion.div
          initial={{ opacity: 0, y: 40, scale: 0.97 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          transition={{ duration: 0.8, delay: 0.3 }}
          className="relative max-w-5xl mx-auto mt-16">
          <div className="rounded-2xl border border-border/60 overflow-hidden"
            style={{ boxShadow: "0 32px 80px hsl(248 90% 68% / 0.08), 0 0 0 1px hsl(240 8% 16%)" }}>
            {/* Browser chrome */}
            <div className="flex items-center gap-2 px-4 py-3 bg-card border-b border-border">
              <div className="w-3 h-3 rounded-full bg-red-500/70" />
              <div className="w-3 h-3 rounded-full bg-amber-500/70" />
              <div className="w-3 h-3 rounded-full bg-emerald-500/70" />
              <div className="flex-1 mx-4 bg-secondary rounded-full px-3 py-1 text-[11px] text-muted-foreground font-mono">
                localhost:3000/dashboard
              </div>
            </div>
            {/* Dashboard preview */}
            <div className="bg-[#0a0a0f] p-5 grid grid-cols-4 gap-3 min-h-[280px]">
              {/* Sidebar */}
              <div className="col-span-1 bg-[#111118] rounded-xl border border-[#1e1e2e] p-3 flex flex-col gap-1.5">
                <div className="flex items-center gap-2 pb-2 border-b border-[#1e1e2e] mb-1">
                  <div className="w-5 h-5 rounded-md flex items-center justify-center" style={{ background: "linear-gradient(135deg, #6c63ff, #3ecfcf)" }}>
                    <svg width="10" height="10" viewBox="0 0 36 36" fill="none"><path d="M11 10H18L14 17H20L11 26H17L22 17H17L21 10" fill="white"/></svg>
                  </div>
                  <span className="text-[10px] font-bold text-white">CVForge AI</span>
                </div>
                {["Overview","Mi Perfil","Asistente IA","ATS Analyzer","Portafolio"].map((item, i) => (
                  <div key={item} className={`text-[10px] px-2 py-1.5 rounded-lg ${i === 0 ? "bg-[#6c63ff]/15 text-[#a78bfa]" : "text-[#666]"}`}>
                    {item}
                  </div>
                ))}
              </div>
              {/* Main content */}
              <div className="col-span-3 flex flex-col gap-3">
                {/* Stats */}
                <div className="grid grid-cols-4 gap-2">
                  {[
                    { label: "ATS Score", val: "87%", color: "#a78bfa" },
                    { label: "Skills",    val: "12",   color: "#22d3ee" },
                    { label: "Proyectos", val: "4",    color: "#10b981" },
                    { label: "PDF",       val: "Listo",color: "#f59e0b" },
                  ].map(s => (
                    <div key={s.label} className="bg-[#111118] border border-[#1e1e2e] rounded-xl p-3">
                      <div className="text-[9px] text-[#555] uppercase tracking-wider mb-1">{s.label}</div>
                      <div className="text-base font-bold font-mono" style={{ color: s.color }}>{s.val}</div>
                    </div>
                  ))}
                </div>
                {/* ATS ring + progress */}
                <div className="grid grid-cols-2 gap-2 flex-1">
                  <div className="bg-[#111118] border border-[#1e1e2e] rounded-xl p-3">
                    <div className="text-[9px] text-[#555] uppercase tracking-wider mb-2">Compatibilidad ATS</div>
                    <div className="flex items-center gap-3">
                      <svg width="48" height="48" viewBox="0 0 48 48">
                        <circle cx="24" cy="24" r="18" fill="none" stroke="#1e1e2e" strokeWidth="5"/>
                        <circle cx="24" cy="24" r="18" fill="none" stroke="url(#rg)" strokeWidth="5"
                          strokeLinecap="round" strokeDasharray="113" strokeDashoffset="15"
                          transform="rotate(-90 24 24)"/>
                        <defs><linearGradient id="rg"><stop offset="0%" stopColor="#6c63ff"/><stop offset="100%" stopColor="#22d3ee"/></linearGradient></defs>
                        <text x="24" y="28" textAnchor="middle" fill="#e8e8f0" fontSize="11" fontWeight="bold">87</text>
                      </svg>
                      <div className="flex flex-col gap-1 flex-1">
                        {[["Keywords","92%","#10b981"],["Verbos","74%","#f59e0b"],["Formato","88%","#a78bfa"]].map(([k,v,c]) => (
                          <div key={k} className="flex items-center gap-1.5">
                            <span className="text-[8px] text-[#555] w-12">{k}</span>
                            <div className="flex-1 h-1 bg-[#1e1e2e] rounded-full overflow-hidden">
                              <div className="h-full rounded-full" style={{ width: v, background: c as string }} />
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                    <div className="flex gap-1 mt-2">
                      {["React","TypeScript","CI/CD"].map(k => (
                        <span key={k} className="text-[8px] px-1.5 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">{k} ✓</span>
                      ))}
                    </div>
                  </div>
                  <div className="bg-[#111118] border border-[#1e1e2e] rounded-xl p-3">
                    <div className="text-[9px] text-[#555] uppercase tracking-wider mb-2">Perfil completado</div>
                    <div className="space-y-1.5">
                      {[["Información","100%"],["Experiencia","100%"],["Skills","100%"],["Proyectos","60%"]].map(([n,p]) => (
                        <div key={n} className="flex items-center gap-2">
                          <span className="text-[8px] text-[#666] w-16">{n}</span>
                          <div className="flex-1 h-1 bg-[#1e1e2e] rounded-full overflow-hidden">
                            <div className="h-full rounded-full" style={{ width: p, background: "linear-gradient(90deg, #6c63ff, #22d3ee)" }} />
                          </div>
                          <span className="text-[8px] text-[#555]">{p}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </motion.div>
      </section>

      {/* ── FEATURES ────────────────────────────────────────── */}
      <section id="features" className="py-24 px-6">
        <div className="max-w-5xl mx-auto">
          <FadeIn>
            <div className="text-center mb-14">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-border text-xs text-muted-foreground mb-4">
                Funcionalidades
              </div>
              <h2 className="text-3xl md:text-4xl font-bold tracking-tight mb-3">
                Todo lo que necesitas para destacar
              </h2>
              <p className="text-muted-foreground max-w-xl mx-auto text-sm leading-relaxed">
                Desde la creación hasta la publicación — una plataforma completa, gratuita y con IA local.
              </p>
            </div>
          </FadeIn>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-5">
            {features.map((feat, i) => (
              <FadeIn key={feat.title} delay={i * 0.07}>
                <div className="p-6 rounded-2xl border border-border bg-card hover:border-primary/30 transition-all duration-200 group h-full">
                  <div className={`w-10 h-10 rounded-xl ${feat.bg} flex items-center justify-center mb-4 group-hover:scale-110 transition-transform`}>
                    <feat.icon size={19} className={feat.color} />
                  </div>
                  <h3 className="font-semibold text-[15px] mb-2">{feat.title}</h3>
                  <p className="text-sm text-muted-foreground leading-relaxed">{feat.desc}</p>
                </div>
              </FadeIn>
            ))}
          </div>
        </div>
      </section>

      {/* ── HOW IT WORKS ────────────────────────────────────── */}
      <section id="how" className="py-24 px-6 bg-secondary/30">
        <div className="max-w-4xl mx-auto">
          <FadeIn>
            <div className="text-center mb-14">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-border text-xs text-muted-foreground mb-4">
                Cómo funciona
              </div>
              <h2 className="text-3xl md:text-4xl font-bold tracking-tight mb-3">
                Del perfil al trabajo en 5 pasos
              </h2>
            </div>
          </FadeIn>

          <div className="relative">
            {/* Vertical line */}
            <div className="absolute left-6 top-8 bottom-8 w-px bg-border hidden md:block" />
            <div className="space-y-6">
              {steps.map((step, i) => (
                <FadeIn key={step.n} delay={i * 0.1}>
                  <div className="flex items-start gap-6">
                    <div className="relative flex-shrink-0">
                      <div className="w-12 h-12 rounded-xl bg-primary/10 border border-primary/20 flex items-center justify-center z-10 relative">
                        <span className="text-xs font-bold font-mono text-primary">{step.n}</span>
                      </div>
                    </div>
                    <div className="pt-2">
                      <h3 className="font-semibold text-[15px] mb-1">{step.title}</h3>
                      <p className="text-sm text-muted-foreground">{step.desc}</p>
                    </div>
                  </div>
                </FadeIn>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ── STACK ───────────────────────────────────────────── */}
      <section id="stack" className="py-24 px-6">
        <div className="max-w-5xl mx-auto">
          <FadeIn>
            <div className="text-center mb-12">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-border text-xs text-muted-foreground mb-4">
                Stack tecnológico
              </div>
              <h2 className="text-3xl font-bold tracking-tight mb-3">Construido con tecnología de producción</h2>
              <p className="text-muted-foreground text-sm">100% open source, 100% gratuito, listo para escalar.</p>
            </div>
          </FadeIn>
          <FadeIn delay={0.1}>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              {stack.map((t) => (
                <div key={t.name} className="p-4 rounded-xl border border-border bg-card text-center hover:border-primary/30 transition-colors">
                  <p className={`font-semibold text-sm ${t.color}`}>{t.name}</p>
                  {t.version && <p className="text-xs text-muted-foreground mt-0.5">{t.version}</p>}
                </div>
              ))}
            </div>
          </FadeIn>
        </div>
      </section>

      {/* ── CTA ─────────────────────────────────────────────── */}
      <section className="py-24 px-6">
        <div className="max-w-3xl mx-auto">
          <FadeIn>
            <div className="relative rounded-3xl border border-primary/20 overflow-hidden p-12 text-center">
              <div className="absolute inset-0 pointer-events-none"
                style={{ background: "radial-gradient(ellipse at center top, hsl(248 90% 68% / 0.07) 0%, transparent 70%)" }} />
              <div className="relative">
                <svg className="w-12 h-12 mx-auto mb-6" viewBox="0 0 36 36" fill="none">
                  <rect width="36" height="36" rx="9" fill="url(#ctaGrad)"/>
                  <path d="M11 10H18L14 17H20L11 26H17L22 17H17L21 10" fill="white"/>
                  <defs>
                    <linearGradient id="ctaGrad" x1="0" y1="0" x2="36" y2="36" gradientUnits="userSpaceOnUse">
                      <stop offset="0%" stopColor="#6c63ff"/>
                      <stop offset="100%" stopColor="#3ecfcf"/>
                    </linearGradient>
                  </defs>
                </svg>
                <h2 className="text-3xl md:text-4xl font-bold tracking-tight mb-4">
                  ¿Listo para forjar tu CV?
                </h2>
                <p className="text-muted-foreground mb-8 leading-relaxed">
                  Únete a desarrolladores que construyen CVs destacados con IA local.<br/>
                  Gratis para siempre. Sin tarjeta de crédito.
                </p>
                <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                  <Link href="/register"
                    className="flex items-center gap-2 px-8 py-3.5 rounded-xl bg-primary text-white font-bold text-sm hover:opacity-90 transition-all hover:scale-[1.02]"
                    style={{ boxShadow: "0 0 32px hsl(248 90% 68% / 0.25)" }}>
                    Crear cuenta gratis <ArrowRight size={15} />
                  </Link>
                  <Link href="https://github.com/Hermanitos-S-A/cvforge-ai" target="_blank"
                    className="flex items-center gap-2 px-8 py-3.5 rounded-xl border border-border text-sm font-medium hover:bg-secondary transition-colors">
                    ⭐ Star en GitHub
                  </Link>
                </div>
              </div>
            </div>
          </FadeIn>
        </div>
      </section>

      {/* ── FOOTER ──────────────────────────────────────────── */}
      <footer className="border-t border-border py-10 px-6">
        <div className="max-w-5xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2.5">
            <svg width="22" height="22" viewBox="0 0 36 36" fill="none">
              <rect width="36" height="36" rx="9" fill="url(#footerGrad)"/>
              <path d="M11 10H18L14 17H20L11 26H17L22 17H17L21 10" fill="white"/>
              <defs>
                <linearGradient id="footerGrad" x1="0" y1="0" x2="36" y2="36" gradientUnits="userSpaceOnUse">
                  <stop offset="0%" stopColor="#6c63ff"/>
                  <stop offset="100%" stopColor="#3ecfcf"/>
                </linearGradient>
              </defs>
            </svg>
            <span className="font-bold text-sm">CVForge AI</span>
          </div>
          <div className="flex items-center gap-6 text-xs text-muted-foreground">
            <span>MIT License</span>
            <span>·</span>
            <span>Open Source</span>
            <span>·</span>
            <a href="https://github.com/Hermanitos-S-A/cvforge-ai" target="_blank"
              className="text-primary hover:underline">GitHub</a>
          </div>
          <p className="text-xs text-muted-foreground">
            © {new Date().getFullYear()} CVForge AI
          </p>
        </div>
      </footer>
    </div>
  );
}
