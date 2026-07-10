"use client";
import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ScanLine, Loader2, CheckCircle, XCircle, AlertTriangle, TrendingUp } from "lucide-react";
import { toast } from "sonner";
import { useAuth } from "@/hooks/useAuth";
import { useResumeStore } from "@/stores/resumeStore";
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
  const { serverResumeId } = useResumeStore();
  const [jd, setJd] = useState("");
  const [result, setResult] = useState<ATSResult | null>(null);
  const [loading, setLoading] = useState(false);

  const analyze = async () => {
    if (!jd.trim()) return toast.error("Pega una descripción de trabajo primero");
    if (!serverResumeId) return toast.error("Primero guarda tu CV en 'Mi Perfil'");
    setLoading(true);
    try {
      const data = await api.analyzeATS(serverResumeId, jd);
      setResult(data);
      toast.success(`Análisis completo — Score: ${data.score}%`);
    } catch {
      // Demo fallback
      setResult({
        score: 87,
        keywords_found: ["React","TypeScript","Docker","CI/CD","REST APIs"],
        keywords_missing: ["Microservices","Kubernetes"],
        weak_verbs: [{ weak:"ayudé", suggested:"aceleré" },{ weak:"hice", suggested:"desarrollé" }],
        suggestions: [
          "Agrega 'Microservices' a tu descripción en TechCorp",
          "Menciona 'Kubernetes' en proyectos o habilidades",
          "Incluye métricas cuantificables como '40% de mejora de rendimiento'",
        ],
        section_scores: { keywords:92, impact_verbs:74, quantification:60, format:100 },
      });
      toast.info("Mostrando demo — asegúrate que tu CV tiene datos guardados");
    } finally { setLoading(false); }
  };

  const scoreColor = (s: number) => s >= 85 ? "text-emerald-400" : s >= 70 ? "text-amber-400" : "text-red-400";
  const barColor  = (s: number) => s >= 85 ? "bg-emerald-500" : s >= 70 ? "bg-amber-400" : "bg-red-400";

  return (
    <div className="p-6 max-w-6xl mx-auto">
      <div className="flex items-center gap-3 mb-6">
        <div className="w-9 h-9 rounded-xl bg-primary/10 flex items-center justify-center"><ScanLine size={17} className="text-primary" /></div>
        <div>
          <h1 className="text-2xl font-bold">Analizador ATS</h1>
          <p className="text-xs text-muted-foreground mt-0.5">Motor propio — sin APIs externas</p>
        </div>
      </div>

      <div className="grid lg:grid-cols-5 gap-6">
        {/* Input */}
        <div className="lg:col-span-2 space-y-4">
          <div className="p-5 rounded-2xl border border-border bg-card">
            <label className="block text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-3">
              Descripción del trabajo
            </label>
            <textarea rows={12} value={jd} onChange={(e) => setJd(e.target.value)}
              placeholder="Buscamos un Senior React Developer con experiencia en TypeScript, microservices, Docker y Kubernetes..."
              className="input-base resize-none w-full" />
            <button onClick={analyze} disabled={loading}
              className="mt-3 w-full py-3 rounded-xl bg-primary text-white font-semibold text-sm hover:opacity-90 disabled:opacity-60 flex items-center justify-center gap-2">
              {loading ? <><Loader2 size={15} className="animate-spin" />Analizando...</> : <><ScanLine size={15} />Analizar compatibilidad</>}
            </button>
          </div>
          <div className="p-4 rounded-2xl border border-border bg-card text-xs text-muted-foreground space-y-1.5">
            <p className="font-semibold text-foreground text-sm mb-2">💡 Cómo funciona</p>
            <p>1. Extrae keywords de la oferta de trabajo</p>
            <p>2. Escanea tu CV guardado en busca de coincidencias</p>
            <p>3. Evalúa verbos de impacto y métricas cuantificables</p>
            <p>4. Calcula un score ponderado (keywords 45%, verbos 25%, métricas 15%, formato 15%)</p>
          </div>
        </div>

        {/* Results */}
        <div className="lg:col-span-3">
          <AnimatePresence>
            {result ? (
              <motion.div initial={{ opacity:0, y:16 }} animate={{ opacity:1, y:0 }} className="space-y-5">
                {/* Score */}
                <div className="p-6 rounded-2xl border border-border bg-card">
                  <div className="flex items-center justify-between mb-5">
                    <h2 className="font-semibold">Score ATS General</h2>
                    <span className={`text-4xl font-bold font-mono ${scoreColor(result.score)}`}>{result.score}%</span>
                  </div>
                  <div className="space-y-3">
                    {Object.entries(result.section_scores).map(([key, val]) => (
                      <div key={key} className="flex items-center gap-3">
                        <span className="text-xs text-muted-foreground w-28 capitalize flex-shrink-0">{key.replace(/_/g," ")}</span>
                        <div className="flex-1 h-2 rounded-full bg-secondary overflow-hidden">
                          <motion.div initial={{ width:0 }} animate={{ width:`${val}%` }} transition={{ delay:0.2, duration:0.7 }}
                            className={`h-full rounded-full ${barColor(val)}`} />
                        </div>
                        <span className="text-xs font-mono text-muted-foreground w-8 text-right">{val}%</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Keywords found */}
                <div className="p-5 rounded-2xl border border-border bg-card">
                  <div className="flex items-center gap-2 mb-3">
                    <CheckCircle size={15} className="text-emerald-400" />
                    <h3 className="font-semibold text-sm">Keywords encontradas ({result.keywords_found.length})</h3>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {result.keywords_found.map(kw => (
                      <span key={kw} className="text-xs px-2.5 py-1 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 font-medium">✓ {kw}</span>
                    ))}
                  </div>
                </div>

                {/* Keywords missing */}
                {result.keywords_missing.length > 0 && (
                  <div className="p-5 rounded-2xl border border-red-500/20 bg-red-500/5">
                    <div className="flex items-center gap-2 mb-3">
                      <XCircle size={15} className="text-red-400" />
                      <h3 className="font-semibold text-sm text-red-400">Keywords faltantes ({result.keywords_missing.length})</h3>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {result.keywords_missing.map(kw => (
                        <span key={kw} className="text-xs px-2.5 py-1 rounded-full bg-red-500/10 text-red-400 border border-red-500/20 font-medium">✗ {kw}</span>
                      ))}
                    </div>
                  </div>
                )}

                {/* Weak verbs */}
                {result.weak_verbs.length > 0 && (
                  <div className="p-5 rounded-2xl border border-amber-500/20 bg-amber-500/5">
                    <div className="flex items-center gap-2 mb-3">
                      <AlertTriangle size={15} className="text-amber-400" />
                      <h3 className="font-semibold text-sm text-amber-400">Verbos débiles detectados</h3>
                    </div>
                    <div className="space-y-2">
                      {result.weak_verbs.map(v => (
                        <div key={v.weak} className="flex items-center gap-3 text-sm">
                          <span className="line-through text-red-400/70">{v.weak}</span>
                          <span className="text-muted-foreground">→</span>
                          <span className="text-emerald-400 font-medium">{v.suggested}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Suggestions */}
                <div className="p-5 rounded-2xl border border-primary/20 bg-primary/5">
                  <div className="flex items-center gap-2 mb-3">
                    <TrendingUp size={15} className="text-primary" />
                    <h3 className="font-semibold text-sm text-primary">Sugerencias de mejora</h3>
                  </div>
                  <ul className="space-y-2">
                    {result.suggestions.map((s, i) => (
                      <li key={i} className="flex items-start gap-2 text-sm text-muted-foreground">
                        <span className="text-primary mt-0.5 flex-shrink-0">•</span>{s}
                      </li>
                    ))}
                  </ul>
                </div>
              </motion.div>
            ) : (
              <div className="h-full flex items-center justify-center text-center p-12 text-muted-foreground">
                <div>
                  <ScanLine size={40} className="mx-auto mb-4 opacity-20" />
                  <p className="text-sm">Pega una oferta de trabajo</p>
                  <p className="text-xs mt-1 opacity-60">y haz clic en Analizar</p>
                </div>
              </div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}
