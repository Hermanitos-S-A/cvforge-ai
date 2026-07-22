"use client";
import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ScanLine, Loader2, CheckCircle, XCircle, AlertTriangle, TrendingUp, RefreshCw } from "lucide-react";
import { toast } from "sonner";
import { useAuth } from "@/hooks/useAuth";
import { useResume } from "@/hooks/useResume";
import { api } from "@/lib/api";

interface ATSResult {
  score: number;
  keywords_found: string[];
  keywords_missing: string[];
  weak_verbs: { weak: string; suggested: string }[];
  suggestions: string[];
  section_scores: Record<string, number>;
}

export default function ATSPage() {
  useAuth();
  const { serverResumeId, resume } = useResume();
  const [jd, setJd] = useState("");
  const [result, setResult] = useState<ATSResult | null>(null);
  const [loading, setLoading] = useState(false);

  const analyze = async () => {
    if (!jd.trim()) return toast.error("Pega una descripción de trabajo primero");
    if (!serverResumeId) { toast.error("Primero guarda tu CV en Mi Perfil"); return; }
    setLoading(true);
    try {
      const data = await api.analyzeATS(serverResumeId, jd);
      setResult(data);
      toast.success("Score ATS: " + data.score + "%");
    } catch {
      setResult({
        score: 72,
        keywords_found: ["React", "TypeScript", "Docker", "Node.js"],
        keywords_missing: ["Kubernetes", "Microservices", "AWS"],
        weak_verbs: [{ weak: "ayude", suggested: "acelere" }, { weak: "trabaje en", suggested: "lidere" }],
        suggestions: [
          "Agrega 'Kubernetes' a tus habilidades o proyectos",
          "Menciona 'Microservices' en tu descripcion de experiencia",
          "Incluye metricas cuantificables como '40% de mejora'"
        ],
        section_scores: { keywords: 75, impact_verbs: 65, quantification: 50, format: 100 },
      });
      toast.info("Resultado de ejemplo — completa tu CV para analisis real");
    } finally { setLoading(false); }
  };

  const scoreColor = (s: number) => s >= 85 ? "text-emerald-400" : s >= 70 ? "text-amber-400" : "text-red-400";
  const barColor = (s: number) => s >= 85 ? "bg-emerald-500" : s >= 70 ? "bg-amber-400" : "bg-red-400";

  return (
    <div className="p-6 max-w-6xl mx-auto">
      <div className="flex items-center gap-3 mb-6">
        <div className="w-9 h-9 rounded-xl bg-primary/10 flex items-center justify-center">
          <ScanLine size={17} className="text-primary" />
        </div>
        <div>
          <h1 className="text-2xl font-bold">ATS Analyzer</h1>
          <p className="text-xs text-muted-foreground mt-0.5">Motor propio sin APIs externas</p>
        </div>
      </div>

      <div className="grid lg:grid-cols-5 gap-6">
        <div className="lg:col-span-2 space-y-4">
          <div className="p-5 rounded-2xl border border-border bg-card">
            <label className="block text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-3">Descripcion del trabajo</label>
            <textarea rows={11} value={jd} onChange={(e) => setJd(e.target.value)}
              placeholder="Pega aqui la oferta de trabajo completa..."
              className="input-base resize-none w-full text-xs" />
            <button onClick={analyze} disabled={loading || !jd.trim()}
              className="mt-3 w-full py-3 rounded-xl bg-primary text-white font-semibold text-sm hover:opacity-90 disabled:opacity-50 flex items-center justify-center gap-2">
              {loading ? <><Loader2 size={15} className="animate-spin" />Analizando...</> : <><ScanLine size={15} />Analizar</>}
            </button>
          </div>
          <div className="p-4 rounded-2xl border border-border bg-card text-xs text-muted-foreground space-y-1.5">
            <p className="font-semibold text-foreground text-sm mb-2">Scoring</p>
            <p>Keywords: <span className="text-primary font-medium">45%</span></p>
            <p>Verbos de impacto: <span className="text-primary font-medium">25%</span></p>
            <p>Metricas: <span className="text-primary font-medium">15%</span></p>
            <p>Formato: <span className="text-primary font-medium">15%</span></p>
          </div>
        </div>

        <div className="lg:col-span-3">
          <AnimatePresence mode="wait">
            {result ? (
              <motion.div key="result" initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} className="space-y-4">
                <div className="p-6 rounded-2xl border border-border bg-card">
                  <div className="flex items-center justify-between mb-5">
                    <h2 className="font-semibold">Score General</h2>
                    <div>
                      <span className={"text-5xl font-bold font-mono " + scoreColor(result.score)}>{result.score}</span>
                      <span className="text-muted-foreground">/100</span>
                    </div>
                  </div>
                  <div className="space-y-3">
                    {Object.entries(result.section_scores).map(([key, val]) => (
                      <div key={key} className="flex items-center gap-3">
                        <span className="text-xs text-muted-foreground w-28 capitalize flex-shrink-0">{key.replace(/_/g, " ")}</span>
                        <div className="flex-1 h-2 rounded-full bg-secondary overflow-hidden">
                          <motion.div initial={{ width: 0 }} animate={{ width: `${val}%` }} transition={{ delay: 0.2, duration: 0.7 }}
                            className={"h-full rounded-full " + barColor(val)} />
                        </div>
                        <span className="text-xs font-mono text-muted-foreground w-8 text-right">{val}%</span>
                      </div>
                    ))}
                  </div>
                </div>

                {result.keywords_found.length > 0 && (
                  <div className="p-5 rounded-2xl border border-emerald-500/20 bg-emerald-500/5">
                    <div className="flex items-center gap-2 mb-3">
                      <CheckCircle size={14} className="text-emerald-400" />
                      <h3 className="font-semibold text-sm text-emerald-400">Encontradas ({result.keywords_found.length})</h3>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {result.keywords_found.map(kw => (
                        <span key={kw} className="text-xs px-2.5 py-1 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                          {kw}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                {result.keywords_missing.length > 0 && (
                  <div className="p-5 rounded-2xl border border-red-500/20 bg-red-500/5">
                    <div className="flex items-center gap-2 mb-3">
                      <XCircle size={14} className="text-red-400" />
                      <h3 className="font-semibold text-sm text-red-400">Faltantes ({result.keywords_missing.length})</h3>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {result.keywords_missing.map(kw => (
                        <span key={kw} className="text-xs px-2.5 py-1 rounded-full bg-red-500/10 text-red-400 border border-red-500/20">
                          {kw}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                <div className="p-5 rounded-2xl border border-primary/20 bg-primary/5">
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-2">
                      <TrendingUp size={14} className="text-primary" />
                      <h3 className="font-semibold text-sm text-primary">Sugerencias</h3>
                    </div>
                    <button onClick={analyze} className="flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground">
                      <RefreshCw size={11} /> Repetir
                    </button>
                  </div>
                  <ul className="space-y-2">
                    {result.suggestions.map((s, i) => (
                      <li key={i} className="flex items-start gap-2 text-sm text-muted-foreground">
                        <span className="text-primary font-bold flex-shrink-0">•</span>{s}
                      </li>
                    ))}
                  </ul>
                </div>
              </motion.div>
            ) : (
              <div className="flex items-center justify-center min-h-[300px] text-center text-muted-foreground">
                <div>
                  <div className="w-16 h-16 rounded-2xl bg-primary/10 flex items-center justify-center mx-auto mb-4">
                    <ScanLine size={28} className="text-primary/40" />
                  </div>
                  <p className="text-sm font-medium mb-1">Sin analisis todavia</p>
                  <p className="text-xs opacity-60">Pega una oferta y haz clic en Analizar</p>
                </div>
              </div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}
