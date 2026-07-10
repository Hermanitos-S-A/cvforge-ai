"use client";
import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { MessageSquare, Loader2, Copy, CheckCheck, Sparkles } from "lucide-react";
import { toast } from "sonner";
import { useAuth } from "@/hooks/useAuth";
import { api } from "@/lib/api";

type Platform = "linkedin"|"twitter"|"portfolio"|"github";
type Tone     = "professional"|"casual"|"creative";

interface BioResult { headline: string; summary: string; short_bio: string; twitter_bio: string; }

const PLATFORMS: { id: Platform; label: string; icon: string; limit?: number }[] = [
  { id:"linkedin",  label:"LinkedIn",  icon:"in",  limit:2600 },
  { id:"twitter",   label:"Twitter/X", icon:"𝕏",   limit:160  },
  { id:"portfolio", label:"Portfolio", icon:"🌐"              },
  { id:"github",    label:"GitHub",    icon:"🐙"              },
];

const TONES: { id: Tone; label: string; desc: string }[] = [
  { id:"professional", label:"Profesional", desc:"Formal, orientado a logros" },
  { id:"casual",       label:"Casual",      desc:"Amigable y cercano" },
  { id:"creative",     label:"Creativo",    desc:"Marca personal única" },
];

export default function BioGeneratorPage() {
  useAuth();
  const [platform, setPlatform] = useState<Platform>("linkedin");
  const [tone, setTone]         = useState<Tone>("professional");
  const [result, setResult]     = useState<BioResult | null>(null);
  const [loading, setLoading]   = useState(false);
  const [copiedKey, setCopiedKey] = useState<string|null>(null);

  const generate = async () => {
    setLoading(true);
    try {
      const data = await api.generateBio(platform, tone);
      setResult(data);
      toast.success("Bio generada!");
    } catch {
      setResult({
        headline: "Senior Frontend Engineer | React & TypeScript Specialist | Construyendo productos digitales escalables",
        summary:  "Ingeniero Frontend orientado a resultados con 6+ años desarrollando aplicaciones web de alto rendimiento. Me especializo en ecosistemas React, arquitectura TypeScript y flujos modernos de DevOps. Actualmente liderando iniciativas frontend en TechCorp Inc., donde reduje los tiempos de carga un 60% y escalé aplicaciones a más de 100K usuarios.",
        short_bio: "Ingeniero de software apasionado por el código limpio y las experiencias de usuario excepcionales. Construyendo la web, un componente a la vez.",
        twitter_bio: "Senior FE Engineer @TechCorp | React · TypeScript · Open Source | Construyendo la web 🚀",
      });
      toast.info("Mostrando demo — levanta Ollama para bio personalizada");
    } finally { setLoading(false); }
  };

  const copy = async (key: string, text: string) => {
    await navigator.clipboard.writeText(text);
    setCopiedKey(key);
    setTimeout(() => setCopiedKey(null), 2000);
    toast.success("Copiado!");
  };

  const bioSections = result ? [
    { key:"headline",    label:"Headline",                text: result.headline    },
    { key:"summary",     label:"Resumen LinkedIn",        text: result.summary     },
    { key:"short_bio",   label:"Bio de portafolio",       text: result.short_bio   },
    { key:"twitter_bio", label:"Bio Twitter/X (160 chars)",text: result.twitter_bio },
  ] : [];

  return (
    <div className="p-6 max-w-5xl mx-auto">
      <div className="flex items-center gap-3 mb-6">
        <div className="w-9 h-9 rounded-xl bg-primary/10 flex items-center justify-center">
          <MessageSquare size={17} className="text-primary" />
        </div>
        <div>
          <h1 className="text-2xl font-bold">Generador de Bio</h1>
          <p className="text-xs text-muted-foreground mt-0.5">Bios con IA para cada plataforma</p>
        </div>
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        {/* Config */}
        <div className="space-y-5">
          {/* Platform */}
          <div className="p-5 rounded-2xl border border-border bg-card">
            <h3 className="text-sm font-semibold mb-4">Plataforma</h3>
            <div className="grid grid-cols-2 gap-2">
              {PLATFORMS.map(pl => (
                <button key={pl.id} onClick={() => setPlatform(pl.id)}
                  className={`flex items-center gap-2 p-3 rounded-xl border text-sm transition-all ${
                    platform === pl.id
                      ? "border-primary/40 bg-primary/10 text-primary"
                      : "border-border text-muted-foreground hover:text-foreground"
                  }`}>
                  <span>{pl.icon}</span>
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
                  className={`w-full flex items-start gap-3 p-3 rounded-xl border text-left transition-all ${
                    tone === t.id ? "border-primary/40 bg-primary/10" : "border-border hover:border-border/60"
                  }`}>
                  <div className={`w-1.5 h-1.5 rounded-full mt-1.5 flex-shrink-0 ${tone === t.id ? "bg-primary" : "bg-border"}`} />
                  <div>
                    <p className={`text-sm font-medium ${tone === t.id ? "text-primary" : ""}`}>{t.label}</p>
                    <p className="text-xs text-muted-foreground">{t.desc}</p>
                  </div>
                </button>
              ))}
            </div>
          </div>

          <button onClick={generate} disabled={loading}
            className="w-full py-3 rounded-xl bg-primary text-white font-semibold text-sm hover:opacity-90 disabled:opacity-60 flex items-center justify-center gap-2">
            {loading
              ? <><Loader2 size={15} className="animate-spin" />Generando...</>
              : <><Sparkles size={15} />Generar Bio</>
            }
          </button>
        </div>

        {/* Output */}
        <div className="lg:col-span-2">
          <AnimatePresence mode="wait">
            {result ? (
              <motion.div key="result" initial={{ opacity:0, y:12 }} animate={{ opacity:1, y:0 }} className="space-y-4">
                {bioSections.map(({ key, label, text }) => (
                  <div key={key} className="p-5 rounded-2xl border border-border bg-card">
                    <div className="flex items-center justify-between mb-3">
                      <h3 className="text-xs font-semibold uppercase tracking-wider text-primary">{label}</h3>
                      <div className="flex items-center gap-3">
                        {key === "twitter_bio" && (
                          <span className={`text-xs font-mono ${text.length > 160 ? "text-red-400" : "text-muted-foreground"}`}>
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

                <button onClick={generate}
                  className="w-full py-2.5 rounded-xl border border-border text-sm font-medium hover:bg-secondary transition-colors flex items-center justify-center gap-2">
                  <Sparkles size={13} /> Regenerar
                </button>
              </motion.div>
            ) : (
              <motion.div key="empty" initial={{ opacity:0 }} animate={{ opacity:1 }}
                className="h-full flex items-center justify-center p-12 text-center text-muted-foreground">
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
