"use client";
import Link from "next/link";
import { motion } from "framer-motion";
import { ArrowRight, FileText, Zap, BarChart3, Globe, CheckCircle } from "lucide-react";

const features = [
  { icon: FileText,  title: "ATS-Optimized CVs",   desc: "Professional templates engineered to pass ATS scanners with 90%+ compatibility." },
  { icon: Zap,       title: "AI Text Optimizer",    desc: "Local Ollama AI rewrites your experience with strong verbs and measurable impact." },
  { icon: BarChart3, title: "ATS Score Analyzer",   desc: "Real-time scoring against job descriptions with keyword gap analysis." },
  { icon: Globe,     title: "Portfolio Generator",  desc: "Auto-generate a stunning personal portfolio site from your CV data." },
];

const stack = ["FastAPI","Next.js","TypeScript","TailwindCSS","Ollama","ReportLab","SQLite → PostgreSQL","Docker"];
const perks = ["100% Free — No subscriptions","Local AI via Ollama","No data sent externally","Open source MIT license"];

export default function HomePage() {
  return (
    <div className="min-h-screen bg-background overflow-hidden">
      <nav className="fixed top-0 left-0 right-0 z-50 glass border-b border-border/50">
        <div className="max-w-6xl mx-auto px-6 h-14 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg bg-primary flex items-center justify-center text-white text-xs font-bold">⚡</div>
            <span className="font-bold text-sm">CVForge <span className="text-primary">AI</span></span>
          </div>
          <div className="flex items-center gap-3">
            <Link href="/login" className="text-sm text-muted-foreground hover:text-foreground transition-colors">Sign in</Link>
            <Link href="/register" className="text-sm px-4 py-2 rounded-lg bg-primary text-white font-medium hover:bg-primary/90 transition-colors">Get started free</Link>
          </div>
        </div>
      </nav>

      <section className="pt-40 pb-24 px-6 text-center relative">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[600px] h-[400px] bg-primary/10 rounded-full blur-[120px] pointer-events-none" />
        <motion.div initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }}>
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full border border-primary/30 bg-primary/10 text-primary text-xs font-medium mb-6">
            <span className="w-1.5 h-1.5 rounded-full bg-primary animate-pulse" />
            100% Free · Powered by Ollama · Open Source
          </div>
          <h1 className="text-5xl md:text-7xl font-extrabold tracking-tight mb-6 max-w-4xl mx-auto leading-tight">
            Build CVs that <span className="text-gradient">actually get hired</span>
          </h1>
          <p className="text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto mb-10 leading-relaxed">
            AI-powered CV builder with ATS analysis, portfolio generator, and local AI optimization. No subscriptions, no API keys — runs entirely on your machine.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link href="/register" className="flex items-center gap-2 px-6 py-3 rounded-xl bg-primary text-white font-semibold hover:bg-primary/90 transition-all hover:scale-105 glow">
              Start building free <ArrowRight size={16} />
            </Link>
            <Link href="https://github.com/Hermanitos-S-A/cvforge-ai" target="_blank"
              className="flex items-center gap-2 px-6 py-3 rounded-xl border border-border text-sm font-medium hover:bg-secondary transition-colors">
              ⭐ Star on GitHub
            </Link>
          </div>
        </motion.div>
      </section>

      <section className="max-w-6xl mx-auto px-6 pb-24">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {features.map((feat, i) => (
            <motion.div key={feat.title} initial={{ opacity: 0, y: 24 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.1 }}
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

      <section className="max-w-6xl mx-auto px-6 pb-24">
        <div className="grid md:grid-cols-2 gap-10 items-center">
          <div>
            <h2 className="text-3xl font-bold mb-4">Why CVForge AI?</h2>
            <div className="space-y-3">
              {perks.map((p) => (
                <div key={p} className="flex items-center gap-3">
                  <CheckCircle size={16} className="text-primary flex-shrink-0" />
                  <span className="text-sm text-muted-foreground">{p}</span>
                </div>
              ))}
            </div>
          </div>
          <div>
            <p className="text-xs font-medium uppercase tracking-widest text-muted-foreground mb-4">Built with</p>
            <div className="flex flex-wrap gap-2">
              {stack.map((t) => (
                <span key={t} className="px-3 py-1.5 rounded-lg border border-border text-xs font-mono text-muted-foreground">{t}</span>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section className="max-w-6xl mx-auto px-6 pb-24">
        <div className="rounded-2xl border border-primary/20 bg-primary/5 p-12 text-center">
          <h2 className="text-3xl font-bold mb-4">Ready to forge your CV?</h2>
          <p className="text-muted-foreground mb-8">Join developers worldwide building standout CVs with AI.</p>
          <Link href="/register" className="inline-flex items-center gap-2 px-8 py-3 rounded-xl bg-primary text-white font-semibold hover:bg-primary/90 transition-all hover:scale-105">
            Get started — it's free <ArrowRight size={16} />
          </Link>
        </div>
      </section>

      <footer className="border-t border-border py-8 px-6 text-center text-xs text-muted-foreground">
        CVForge AI · Open Source · MIT License ·{" "}
        <a href="https://github.com/Hermanitos-S-A/cvforge-ai" className="text-primary hover:underline" target="_blank">GitHub</a>
      </footer>
    </div>
  );
}
