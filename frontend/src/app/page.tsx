"use client";
import Link from "next/link";
import { motion } from "framer-motion";
import { ArrowRight, FileText, Zap, BarChart3, Globe, CheckCircle } from "lucide-react";

const features = [
  { icon: FileText,  title: "CVs ATS-Optimizados",   desc: "Plantillas profesionales diseñadas para pasar filtros ATS con 90%+ compatibilidad." },
  { icon: Zap,       title: "Optimizador con IA",     desc: "Ollama reescribe tu experiencia con verbos de impacto y métricas cuantificables." },
  { icon: BarChart3, title: "Analizador ATS",         desc: "Puntaje en tiempo real contra ofertas de trabajo con análisis de keywords." },
  { icon: Globe,     title: "Portafolio Web",         desc: "Genera automáticamente tu página personal desde los datos de tu CV." },
];

export default function HomePage() {
  return (
    <div className="min-h-screen bg-background">
      {/* Nav */}
      <nav className="fixed top-0 left-0 right-0 z-50 border-b border-border bg-card/80 backdrop-blur">
        <div className="max-w-6xl mx-auto px-6 h-14 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg bg-primary flex items-center justify-center text-white text-xs font-bold">⚡</div>
            <span className="font-bold text-sm">CVForge <span className="text-primary">AI</span></span>
          </div>
          <div className="flex items-center gap-3">
            <Link href="/login" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
              Iniciar sesión
            </Link>
            <Link href="/register" className="text-sm px-4 py-2 rounded-lg bg-primary text-white font-medium hover:opacity-90 transition-all">
              Empezar gratis
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero */}
      <section className="pt-40 pb-24 px-6 text-center relative">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[600px] h-[400px] bg-primary/10 rounded-full blur-[120px] pointer-events-none" />
        <motion.div initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }}>
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full border border-primary/30 bg-primary/10 text-primary text-xs font-medium mb-6">
            <span className="w-1.5 h-1.5 rounded-full bg-primary animate-pulse" />
            100% Gratis · IA Local con Ollama · Open Source
          </div>
          <h1 className="text-5xl md:text-6xl font-extrabold tracking-tight mb-6 max-w-3xl mx-auto leading-tight">
            Construye CVs que{" "}
            <span className="text-gradient">realmente consiguen trabajo</span>
          </h1>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto mb-10 leading-relaxed">
            Plataforma con IA para crear CVs ATS-optimizados, analizar compatibilidad con ofertas y generar tu portafolio web. Sin suscripciones, sin APIs de pago.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link href="/register"
              className="flex items-center gap-2 px-6 py-3 rounded-xl bg-primary text-white font-semibold hover:opacity-90 transition-all hover:scale-105">
              Crear cuenta gratis <ArrowRight size={16} />
            </Link>
            <Link href="/login"
              className="flex items-center gap-2 px-6 py-3 rounded-xl border border-border text-sm font-medium hover:bg-secondary transition-colors">
              Ya tengo cuenta
            </Link>
          </div>
        </motion.div>
      </section>

      {/* Features */}
      <section className="max-w-5xl mx-auto px-6 pb-24">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {features.map((feat, i) => (
            <motion.div key={feat.title}
              initial={{ opacity: 0, y: 24 }} whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }} transition={{ delay: i * 0.1 }}
              className="p-6 rounded-2xl border border-border bg-card hover:border-primary/40 transition-colors group">
              <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center mb-4 group-hover:bg-primary/20 transition-colors">
                <feat.icon size={20} className="text-primary" />
              </div>
              <h3 className="font-semibold mb-2">{feat.title}</h3>
              <p className="text-sm text-muted-foreground leading-relaxed">{feat.desc}</p>
            </motion.div>
          ))}
        </div>
      </section>

      {/* CTA */}
      <section className="max-w-5xl mx-auto px-6 pb-24">
        <div className="rounded-2xl border border-primary/20 bg-primary/5 p-10 text-center">
          <h2 className="text-2xl font-bold mb-3">¿Listo para forjar tu CV?</h2>
          <p className="text-muted-foreground mb-6 text-sm">Únete a desarrolladores que construyen CVs destacados con IA local.</p>
          <Link href="/register"
            className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-primary text-white font-semibold hover:opacity-90 transition-all hover:scale-105">
            Empezar ahora — es gratis <ArrowRight size={16} />
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-border py-6 px-6 text-center text-xs text-muted-foreground">
        CVForge AI · Open Source · MIT License ·{" "}
        <a href="https://github.com/Hermanitos-S-A/cvforge-ai" className="text-primary hover:underline" target="_blank">GitHub</a>
      </footer>
    </div>
  );
}
