"use client";
import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Sparkles, Loader2, Copy, CheckCheck, RotateCcw } from "lucide-react";
import { toast } from "sonner";
import { useAuth } from "@/hooks/useAuth";
import { api } from "@/lib/api";

type Mode = "optimize"|"summary"|"ats";
const MODES = [
  { id:"optimize" as Mode, label:"⚡ Optimizar texto",    context:"experience", placeholder:"Hice una app web para gestión de tareas con usuarios y login..." },
  { id:"summary"  as Mode, label:"◎ Generar resumen",     context:"summary",    placeholder:"6 años de experiencia, especialista en React y Node.js..." },
  { id:"ats"      as Mode, label:"◉ Mejorar para ATS",    context:"ats",        placeholder:"Construí microservicios y los desplegué en producción..." },
];
const TEMPLATES = [
  { label:"💼 Experiencia laboral", text:"Manejé un equipo de desarrolladores y trabajé en el sitio web de la empresa mejorando el rendimiento" },
  { label:"⚡ Logro cuantificable", text:"Ayudé a reducir el tiempo de carga del dashboard principal" },
  { label:"◇ Proyecto personal",   text:"Hice una app de e-commerce con pagos y gestión de usuarios" },
  { label:"🎯 Habilidades",         text:"Sé React, trabajé un poco con Docker y usé REST APIs" },
];

export default function AIAssistantPage() {
  useAuth();
  const [mode, setMode] = useState<Mode>("optimize");
  const [input, setInput] = useState("");
  const [output, setOutput] = useState<{ text: string; improvements: string[] } | null>(null);
  const [loading, setLoading] = useState(false);
  const [copied, setCopied] = useState(false);

  const current = MODES.find(m => m.id === mode)!;

  const run = async () => {
    if (!input.trim()) return toast.error("Escribe algo primero");
    setLoading(true); setOutput(null);
    try {
      const res = await api.optimizeText(input, current.context);
      setOutput({ text: res.optimized, improvements: res.improvements || [] });
      toast.success("✨ Optimización completa!");
    } catch {
      // Fallback demo
      setOutput({
        text: "Desarrollé y mantuve aplicaciones web de alto rendimiento utilizando frameworks modernos, logrando una mejora del 40% en eficiencia del sistema y entregando experiencias de usuario excepcionales en múltiples líneas de producto.",
        improvements: ["Verbos de acción fuertes añadidos","Métricas cuantificables incluidas","Densidad de keywords ATS mejorada"],
      });
      toast.info("Mostrando demo — levanta Ollama para IA real");
    } finally { setLoading(false); }
  };

  const copy = async () => {
    if (!output) return;
    await navigator.clipboard.writeText(output.text);
    setCopied(true); setTimeout(() => setCopied(false), 2000);
    toast.success("Copiado al portapapeles!");
  };

  return (
    <div className="p-6 max-w-6xl mx-auto">
      <div className="flex items-center gap-3 mb-6">
        <div className="w-9 h-9 rounded-xl bg-primary/10 flex items-center justify-center">
          <Sparkles size={17} className="text-primary" />
        </div>
        <div>
          <h1 className="text-2xl font-bold">Asistente IA</h1>
          <div className="flex items-center gap-2 mt-0.5">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
            <p className="text-xs text-muted-foreground">Ollama · Mistral 7B · Local · 100% gratis</p>
          </div>
        </div>
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        {/* Panel principal */}
        <div className="lg:col-span-2 space-y-5">
          {/* Selector de modo */}
          <div className="grid grid-cols-3 gap-2">
            {MODES.map(m => (
              <button key={m.id} onClick={() => setMode(m.id)}
                className={`p-3 rounded-xl border text-left transition-all text-sm font-medium ${
                  mode === m.id ? "border-primary/40 bg-primary/10 text-primary" : "border-border bg-card text-muted-foreground hover:text-foreground"
                }`}>
                {m.label}
              </button>
            ))}
          </div>

          {/* Input */}
          <div className="p-5 rounded-2xl border border-border bg-card space-y-3">
            <div className="flex items-center justify-between">
              <label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Texto original</label>
              <span className="text-xs text-muted-foreground">{input.length} chars</span>
            </div>
            <textarea rows={5} value={input} onChange={(e) => setInput(e.target.value)}
              placeholder={current.placeholder}
              className="input-base resize-none w-full" />
            <button onClick={run} disabled={loading}
              className="w-full py-3 rounded-xl bg-primary text-white font-semibold text-sm hover:opacity-90 disabled:opacity-60 flex items-center justify-center gap-2">
              {loading ? <><Loader2 size={15} className="animate-spin" />Procesando con Ollama...</> : <><Sparkles size={15} />Optimizar con IA</>}
            </button>
          </div>

          {/* Output */}
          <AnimatePresence>
            {(output || loading) && (
              <motion.div initial={{ opacity:0, y:8 }} animate={{ opacity:1, y:0 }}
                className="p-5 rounded-2xl border border-primary/20 bg-primary/5 space-y-3">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-semibold uppercase tracking-wider text-primary">Resultado IA</label>
                  <div className="flex gap-3">
                    <button onClick={run} disabled={loading} className="flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground">
                      <RotateCcw size={11} /> Regenerar
                    </button>
                    <button onClick={copy} className="flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground">
                      {copied ? <CheckCheck size={11} className="text-emerald-400" /> : <Copy size={11} />}
                      {copied ? "Copiado!" : "Copiar"}
                    </button>
                  </div>
                </div>
                {loading
                  ? <div className="flex items-center gap-3 text-sm text-muted-foreground"><Loader2 size={15} className="animate-spin text-primary" />Generando con Mistral 7B...</div>
                  : <>
                      <p className="text-sm leading-relaxed">{output?.text}</p>
                      {output?.improvements && output.improvements.length > 0 && (
                        <div className="pt-3 border-t border-border/50">
                          <p className="text-xs font-semibold text-muted-foreground mb-2">MEJORAS APLICADAS</p>
                          <div className="space-y-1">
                            {output.improvements.map((imp, i) => (
                              <div key={i} className="flex items-center gap-2 text-xs text-emerald-400">
                                <span>✓</span>{imp}
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                    </>
                }
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Sidebar */}
        <div className="space-y-5">
          <div className="p-5 rounded-2xl border border-border bg-card">
            <h3 className="text-sm font-semibold mb-4">Plantillas rápidas</h3>
            <div className="space-y-2">
              {TEMPLATES.map(t => (
                <button key={t.label} onClick={() => setInput(t.text)}
                  className="w-full text-left p-3 rounded-xl border border-border bg-secondary/40 hover:border-primary/30 hover:bg-primary/5 transition-all">
                  <p className="text-xs font-medium">{t.label}</p>
                  <p className="text-[11px] text-muted-foreground mt-1 line-clamp-2">{t.text}</p>
                </button>
              ))}
            </div>
          </div>

          <div className="p-4 rounded-2xl border border-amber-500/20 bg-amber-500/5">
            <h3 className="text-sm font-semibold text-amber-400 mb-3">⚡ Configurar Ollama</h3>
            <div className="space-y-1.5 text-xs">
              {["curl -fsSL https://ollama.ai/install.sh | sh", "ollama pull mistral", "ollama serve"].map(cmd => (
                <div key={cmd} className="font-mono bg-background/60 rounded-lg p-2 text-[11px] break-all">{cmd}</div>
              ))}
            </div>
            <p className="text-[11px] text-muted-foreground mt-2">Alternativas: llama3, deepseek-r1, gemma2</p>
          </div>
        </div>
      </div>
    </div>
  );
}
