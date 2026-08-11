"use client";
import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { MessageSquare, Loader2, Copy, CheckCheck, Sparkles, RefreshCw, User } from "lucide-react";
import { toast } from "sonner";
import { useAuth } from "@/hooks/useAuth";
import { useResume } from "@/hooks/useResume";
import { api } from "@/lib/api";

type Platform = "linkedin" | "twitter" | "portfolio" | "github";
type Tone     = "professional" | "casual" | "creative";

interface BioResult {
  headline:    string;
  summary:     string;
  short_bio:   string;
  twitter_bio: string;
}

const PLATFORMS = [
  { id:"linkedin"  as Platform, label:"LinkedIn",   icon:"in" },
  { id:"twitter"   as Platform, label:"Twitter/X",  icon:"X"  },
  { id:"portfolio" as Platform, label:"Portfolio",  icon:"W"  },
  { id:"github"    as Platform, label:"GitHub",     icon:"G"  },
];

const TONES = [
  { id:"professional" as Tone, label:"Profesional", desc:"Formal, orientado a logros" },
  { id:"casual"       as Tone, label:"Casual",      desc:"Amigable y cercano" },
  { id:"creative"     as Tone, label:"Creativo",    desc:"Marca personal única" },
];

export default function BioGeneratorPage() {
  useAuth();
  const { resume, loading: resumeLoading } = useResume();
  const [platform, setPlatform]   = useState<Platform>("linkedin");
  const [tone, setTone]           = useState<Tone>("professional");
  const [result, setResult]       = useState<BioResult | null>(null);
  const [loading, setLoading]     = useState(false);
  const [copiedKey, setCopiedKey] = useState<string | null>(null);

  const p       = resume.personal || {};
  const hasData = !!(p.name || p.title || resume.summary || resume.skills.length > 0);

  // Build context from real user data
  const buildUserContext = () => {
    const parts: string[] = [];
    if (p.name)                   parts.push(`Nombre: ${p.name}`);
    if (p.title)                  parts.push(`Título: ${p.title}`);
    if (p.location)               parts.push(`Ubicación: ${p.location}`);
    if (resume.summary)           parts.push(`Resumen: ${resume.summary}`);
    if (resume.experiences.length > 0) {
      const exps = resume.experiences.slice(0, 3).map((e: any) =>
        `${e.role} en ${e.company}${e.description ? ": " + e.description.slice(0, 100) : ""}`
      ).join("; ");
      parts.push(`Experiencia: ${exps}`);
    }
    if (resume.skills.length > 0) {
      const skills = resume.skills.slice(0, 10).map((s: any) => s.name).join(", ");
      parts.push(`Habilidades: ${skills}`);
    }
    if (resume.educations.length > 0) {
      const edu = resume.educations[0] as any;
      parts.push(`Educación: ${edu.degree || ""} ${edu.field || ""} en ${edu.institution || ""}`);
    }
    return parts.join("\n");
  };

  const generate = async () => {
    setLoading(true);
    try {
      const userContext = buildUserContext();
      const data = await api.generateBio(platform, tone, userContext);

      if (data.headline && !data.headline.startsWith("[AI Error")) {
        setResult(data);
        toast.success("Bio generada con tus datos reales!");
      } else {
        throw new Error("AI not available");
      }
    } catch {
      // Fallback usando datos reales del usuario
      const name  = p.name  || "Profesional";
      const title = p.title || "Especialista";
      const skills = resume.skills.slice(0, 3).map((s: any) => s.name).join(", ") || "tecnología";
      const exp = resume.experiences.length > 0
        ? `con experiencia en ${(resume.experiences[0] as any).company}`
        : "";

      setResult({
        headline:    `${title} | ${skills} | ${p.location || "Perú"}`,
        summary:     resume.summary ||
          `${name} es ${title} ${exp}. Especializado en ${skills}, con enfoque en resultados e impacto real. Apasionado por los retos y el aprendizaje continuo.`,
        short_bio:   `${title} ${exp}. ${skills ? "Experto en " + skills + "." : ""} Construyendo soluciones que importan.`,
        twitter_bio: `${title} | ${skills} | ${p.location || "Perú"}`,
      });
      toast.info("Mostrando bio con tus datos — activa Ollama para bio mejorada con IA");
    } finally {
      setLoading(false);
    }
  };

  const copy = async (key: string, text: string) => {
    await navigator.clipboard.writeText(text);
    setCopiedKey(key);
    setTimeout(() => setCopiedKey(null), 2000);
    toast.success("Copiado!");
  };

  const sections = result ? [
    { key:"headline",    label:"Headline",         text: result.headline    },
    { key:"summary",     label:"Resumen LinkedIn",  text: result.summary     },
    { key:"short_bio",   label:"Bio portafolio",    text: result.short_bio   },
    { key:"twitter_bio", label:"Bio Twitter/X",     text: result.twitter_bio },
  ] : [];

  return (
    <div className="p-6 max-w-5xl mx-auto">
      <div className="flex items-center gap-3 mb-6">
        <div className="w-9 h-9 rounded-xl bg-primary/10 flex items-center justify-center">
          <MessageSquare size={17} className="text-primary" />
        </div>
        <div>
          <h1 className="text-2xl font-bold">Generador de Bio</h1>
          <p className="text-xs text-muted-foreground mt-0.5">
            Bios personalizadas con tus datos reales
          </p>
        </div>
      </div>

      {/* User data preview */}
      {hasData && (
        <div className="p-4 rounded-xl border border-primary/20 bg-primary/5 mb-5 flex items-start gap-3">
          <User size={14} className="text-primary flex-shrink-0 mt-0.5" />
          <div className="flex-1 min-w-0">
            <p className="text-xs font-semibold text-primary mb-1">Usando tus datos del perfil</p>
            <p className="text-xs text-muted-foreground truncate">
              {[p.name, p.title, p.location].filter(Boolean).join(" · ")}
              {resume.skills.length > 0 && ` · ${resume.skills.slice(0,3).map((s:any)=>s.name).join(", ")}`}
            </p>
          </div>
          <a href="/dashboard/cv" className="text-xs text-primary hover:underline whitespace-nowrap">
            Editar →
          </a>
        </div>
      )}

      {!hasData && !resumeLoading && (
        <div className="p-4 rounded-xl border border-amber-500/20 bg-amber-500/5 mb-5 text-sm text-amber-400">
          Tu perfil está vacío. <a href="/dashboard/cv" className="underline font-medium">Completa tu perfil primero →</a>
        </div>
      )}

      <div className="grid lg:grid-cols-3 gap-6">
        <div className="space-y-5">
          {/* Platform */}
          <div className="p-5 rounded-2xl border border-border bg-card">
            <h3 className="text-sm font-semibold mb-4">Plataforma</h3>
            <div className="grid grid-cols-2 gap-2">
              {PLATFORMS.map(pl => (
                <button key={pl.id} onClick={() => setPlatform(pl.id)}
                  className={"flex items-center gap-2 p-3 rounded-xl border text-sm transition-all " + (
                    platform === pl.id
                      ? "border-primary/40 bg-primary/10 text-primary"
                      : "border-border text-muted-foreground hover:text-foreground"
                  )}>
                  <span className="font-bold text-xs w-4">{pl.icon}</span>
                  <span className="font-medium">{pl.label}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Tone */}
          <div className="p-5 rounded-2xl border border-border bg-card">
            <h3 className="text-sm font-semibold mb-4">Tono</h3>
            <div className="space-y-2">
              {TONES.map(t => (
                <button key={t.id} onClick={() => setTone(t.id)}
                  className={"w-full flex items-start gap-3 p-3 rounded-xl border text-left transition-all " + (
                    tone === t.id ? "border-primary/40 bg-primary/10" : "border-border hover:border-border/60"
                  )}>
                  <div className={"w-1.5 h-1.5 rounded-full mt-1.5 flex-shrink-0 " + (tone === t.id ? "bg-primary" : "bg-border")} />
                  <div>
                    <p className={"text-sm font-medium " + (tone === t.id ? "text-primary" : "")}>{t.label}</p>
                    <p className="text-xs text-muted-foreground">{t.desc}</p>
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* Generate button */}
          <button onClick={generate} disabled={loading || resumeLoading}
            className="w-full py-3 rounded-xl bg-primary text-white font-semibold text-sm hover:opacity-90 disabled:opacity-60 flex items-center justify-center gap-2">
            {loading
              ? <><Loader2 size={15} className="animate-spin"/>Generando...</>
              : <><Sparkles size={15}/>Generar Bio</>
            }
          </button>
        </div>

        {/* Results */}
        <div className="lg:col-span-2">
          <AnimatePresence mode="wait">
            {result ? (
              <motion.div key="result" initial={{ opacity:0, y:12 }} animate={{ opacity:1, y:0 }} className="space-y-4">
                {sections.map(({ key, label, text }) => (
                  <div key={key} className="p-5 rounded-2xl border border-border bg-card">
                    <div className="flex items-center justify-between mb-3">
                      <h3 className="text-xs font-semibold uppercase tracking-wider text-primary">{label}</h3>
                      <div className="flex items-center gap-3">
                        {key === "twitter_bio" && (
                          <span className={"text-xs font-mono " + (text.length > 160 ? "text-red-400" : "text-muted-foreground")}>
                            {text.length}/160
                          </span>
                        )}
                        <button onClick={() => copy(key, text)}
                          className="flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground transition-colors">
                          {copiedKey === key
                            ? <CheckCheck size={12} className="text-emerald-400" />
                            : <Copy size={12} />
                          }
                          {copiedKey === key ? "Copiado!" : "Copiar"}
                        </button>
                      </div>
                    </div>
                    <p className="text-sm leading-relaxed text-muted-foreground">{text}</p>
                  </div>
                ))}
                <button onClick={generate} disabled={loading}
                  className="w-full py-2.5 rounded-xl border border-border text-sm font-medium hover:bg-secondary transition-colors flex items-center justify-center gap-2">
                  <RefreshCw size={13} /> Regenerar con IA
                </button>
              </motion.div>
            ) : (
              <motion.div key="empty" initial={{ opacity:0 }} animate={{ opacity:1 }}
                className="h-full flex items-center justify-center p-12 text-center text-muted-foreground min-h-[300px]">
                <div>
                  <MessageSquare size={40} className="mx-auto mb-4 opacity-20" />
                  <p className="text-sm">Selecciona plataforma y tono</p>
                  <p className="text-xs mt-1 opacity-60">luego haz clic en Generar Bio</p>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}
