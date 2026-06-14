"use client";
import { useState } from "react";
import { motion } from "framer-motion";
import { Sparkles, Loader2, Copy, CheckCheck, RotateCcw, ArrowRight } from "lucide-react";
import { toast } from "sonner";
import { api } from "@/lib/api";

type Mode = "optimize" | "bio" | "summary" | "ats";

const MODES: { id: Mode; label: string; desc: string; placeholder: string; context: string }[] = [
  {
    id: "optimize",
    label: "⚡ Optimize Text",
    desc: "Transform weak descriptions into ATS-friendly impact statements",
    placeholder: "Hice una app web para gestión de tareas con usuarios y login...",
    context: "experience",
  },
  {
    id: "bio",
    label: "✦ Generate Bio",
    desc: "Create professional bios for LinkedIn, Twitter, Portfolio, GitHub",
    placeholder: "Senior developer with 6 years experience in React and Node.js...",
    context: "bio",
  },
  {
    id: "summary",
    label: "◎ Write Summary",
    desc: "Generate a compelling professional summary for your CV",
    placeholder: "5 years experience, React developer, worked at startups...",
    context: "summary",
  },
  {
    id: "ats",
    label: "◉ ATS Improve",
    desc: "Rewrite text to include missing ATS keywords naturally",
    placeholder: "Built microservices and deployed them to production...",
    context: "ats",
  },
];

const TEMPLATES = [
  { label: "💼 Experience Optimizer", text: "Managed a team of developers and worked on the company website improving performance" },
  { label: "⚡ Achievement Writer", text: "Helped reduce loading time for the main dashboard" },
  { label: "◇ Project Describer", text: "Made an e-commerce app with payments and user management" },
  { label: "🎯 Skills Highlighter", text: "I know React, worked with Docker a bit and used REST APIs" },
];

export default function AIAssistantPage() {
  const [mode, setMode] = useState<Mode>("optimize");
  const [input, setInput] = useState("");
  const [output, setOutput] = useState("");
  const [loading, setLoading] = useState(false);
  const [copied, setCopied] = useState(false);
  const [history, setHistory] = useState<{ input: string; output: string; mode: Mode }[]>([]);

  const currentMode = MODES.find((m) => m.id === mode)!;

  const run = async () => {
    if (!input.trim()) return toast.error("Enter some text first");
    setLoading(true);
    setOutput("");
    try {
      let result = "";
      if (mode === "optimize" || mode === "ats" || mode === "summary") {
        const res = await api.optimizeText(input, currentMode.context);
        result = res.optimized;
      } else if (mode === "bio") {
        const res = await api.generateBio("linkedin", "professional");
        result = `Headline: ${res.headline}\n\nSummary: ${res.summary}\n\nTwitter: ${res.twitter_bio}`;
      }
      setOutput(result);
      setHistory((h) => [{ input, output: result, mode }, ...h].slice(0, 10));
      toast.success("✨ AI optimization complete!");
    } catch {
      toast.error("AI not available — make sure Ollama is running (ollama serve)");
      setOutput(
        "Developed and maintained scalable web applications using modern frameworks, " +
        "resulting in a 40% improvement in system performance and delivering exceptional user experiences " +
        "across multiple product lines."
      );
    } finally {
      setLoading(false);
    }
  };

  const copy = async () => {
    await navigator.clipboard.writeText(output);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
    toast.success("Copied to clipboard!");
  };

  return (
    <div className="p-6 max-w-6xl mx-auto">
      {/* Header */}
      <div className="flex items-center gap-3 mb-6">
        <div className="w-9 h-9 rounded-xl bg-primary/10 flex items-center justify-center">
          <Sparkles size={18} className="text-primary" />
        </div>
        <div>
          <h1 className="text-2xl font-bold">AI Assistant</h1>
          <div className="flex items-center gap-2 mt-0.5">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
            <p className="text-xs text-muted-foreground">Powered by Ollama · Mistral 7B · Runs locally · 100% free</p>
          </div>
        </div>
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        {/* Main panel */}
        <div className="lg:col-span-2 space-y-5">
          {/* Mode selector */}
          <div className="grid grid-cols-2 gap-2">
            {MODES.map((m) => (
              <button
                key={m.id}
                onClick={() => setMode(m.id)}
                className={`p-3 rounded-xl border text-left transition-all ${
                  mode === m.id
                    ? "border-primary/40 bg-primary/10 text-primary"
                    : "border-border bg-card text-muted-foreground hover:border-border/80 hover:text-foreground"
                }`}
              >
                <p className="text-sm font-medium">{m.label}</p>
                <p className="text-xs mt-0.5 opacity-70">{m.desc}</p>
              </button>
            ))}
          </div>

          {/* Input */}
          <div className="p-5 rounded-2xl border border-border bg-card space-y-3">
            <div className="flex items-center justify-between">
              <label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                Input Text
              </label>
              <span className="text-xs text-muted-foreground">{input.length} chars</span>
            </div>
            <textarea
              rows={5}
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder={currentMode.placeholder}
              className="w-full bg-secondary/50 border border-border rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary/60 resize-none transition-all placeholder:text-muted-foreground/50"
            />
            <button
              onClick={run}
              disabled={loading}
              className="w-full py-3 rounded-xl bg-primary text-white font-semibold text-sm hover:bg-primary/90 transition-all disabled:opacity-60 flex items-center justify-center gap-2"
            >
              {loading
                ? <><Loader2 size={16} className="animate-spin" /> Processing with Ollama...</>
                : <><Sparkles size={16} /> Optimize with AI</>
              }
            </button>
          </div>

          {/* Output */}
          {(output || loading) && (
            <motion.div
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              className="p-5 rounded-2xl border border-primary/20 bg-primary/5 space-y-3"
            >
              <div className="flex items-center justify-between">
                <label className="text-xs font-semibold uppercase tracking-wider text-primary">
                  AI Output
                </label>
                <div className="flex gap-2">
                  <button onClick={run} disabled={loading}
                    className="flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground transition-colors">
                    <RotateCcw size={12} /> Regenerate
                  </button>
                  <button onClick={copy}
                    className="flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground transition-colors">
                    {copied ? <CheckCheck size={12} className="text-emerald-400" /> : <Copy size={12} />}
                    {copied ? "Copied!" : "Copy"}
                  </button>
                </div>
              </div>
              {loading
                ? <div className="flex items-center gap-3 text-sm text-muted-foreground">
                    <Loader2 size={16} className="animate-spin text-primary" />
                    Generating with Mistral 7B...
                  </div>
                : <p className="text-sm leading-relaxed whitespace-pre-wrap">{output}</p>
              }
            </motion.div>
          )}
        </div>

        {/* Sidebar */}
        <div className="space-y-5">
          {/* Quick templates */}
          <div className="p-5 rounded-2xl border border-border bg-card">
            <h3 className="text-sm font-semibold mb-4">Quick Templates</h3>
            <div className="space-y-2">
              {TEMPLATES.map((t) => (
                <button
                  key={t.label}
                  onClick={() => setInput(t.text)}
                  className="w-full text-left p-3 rounded-xl border border-border bg-secondary/40 hover:border-primary/30 hover:bg-primary/5 transition-all group"
                >
                  <p className="text-xs font-medium group-hover:text-primary transition-colors">{t.label}</p>
                  <p className="text-[11px] text-muted-foreground mt-1 line-clamp-2">{t.text}</p>
                </button>
              ))}
            </div>
          </div>

          {/* Ollama setup */}
          <div className="p-5 rounded-2xl border border-amber-500/20 bg-amber-500/5">
            <h3 className="text-sm font-semibold text-amber-400 mb-3">⚡ Setup Ollama</h3>
            <div className="space-y-2 text-xs text-muted-foreground">
              <div className="font-mono bg-background/60 rounded-lg p-2 text-[11px]">
                curl -fsSL https://ollama.ai/install.sh | sh
              </div>
              <div className="font-mono bg-background/60 rounded-lg p-2 text-[11px]">
                ollama pull mistral
              </div>
              <div className="font-mono bg-background/60 rounded-lg p-2 text-[11px]">
                ollama serve
              </div>
            </div>
            <p className="text-[11px] text-muted-foreground mt-3">Alternatives: llama3, deepseek-r1, gemma2</p>
          </div>

          {/* History */}
          {history.length > 0 && (
            <div className="p-5 rounded-2xl border border-border bg-card">
              <h3 className="text-sm font-semibold mb-3">Recent</h3>
              <div className="space-y-2">
                {history.slice(0, 3).map((h, i) => (
                  <button key={i} onClick={() => { setInput(h.input); setOutput(h.output); }}
                    className="w-full text-left p-3 rounded-xl bg-secondary/40 hover:bg-secondary transition-colors">
                    <p className="text-[11px] text-muted-foreground line-clamp-2">{h.input}</p>
                    <div className="flex items-center gap-1 mt-1">
                      <ArrowRight size={10} className="text-primary" />
                      <p className="text-[11px] text-primary line-clamp-1">{h.output}</p>
                    </div>
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
