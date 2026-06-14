"use client";
import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { MessageSquare, Loader2, Copy, CheckCheck, Sparkles } from "lucide-react";
import { toast } from "sonner";
import { api } from "@/lib/api";

type Platform = "linkedin" | "twitter" | "portfolio" | "github";
type Tone = "professional" | "casual" | "creative";

interface BioResult {
  headline: string;
  summary: string;
  short_bio: string;
  twitter_bio: string;
}

export default function BioGeneratorPage() {
  const [platform, setPlatform] = useState<Platform>("linkedin");
  const [tone, setTone] = useState<Tone>("professional");
  const [result, setResult] = useState<BioResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [copiedKey, setCopiedKey] = useState<string | null>(null);

  const generate = async () => {
    setLoading(true);
    try {
      const data = await api.generateBio(platform, tone);
      setResult(data);
      toast.success("Bio generated!");
    } catch {
      // Demo fallback
      setResult({
        headline: "Senior Frontend Engineer | React & TypeScript Specialist | Building scalable digital products",
        summary: "Results-driven Frontend Engineer with 6+ years crafting high-performance web applications. I specialize in React ecosystems, TypeScript architecture and modern DevOps workflows. Currently leading frontend initiatives at TechCorp Inc., where I've reduced load times by 60% and scaled applications to 100K+ users. Open to connecting with fellow engineers and product leaders.",
        short_bio: "Frontend engineer passionate about clean code and exceptional user experiences. Building the web, one component at a time.",
        twitter_bio: "Senior FE Engineer @TechCorp | React · TypeScript · Open Source | Building the web, one component at a time 🚀",
      });
      toast.success("Bio generated (demo mode)!");
    } finally {
      setLoading(false);
    }
  };

  const copy = async (key: string, text: string) => {
    await navigator.clipboard.writeText(text);
    setCopiedKey(key);
    setTimeout(() => setCopiedKey(null), 2000);
    toast.success("Copied!");
  };

  const platforms: { id: Platform; label: string; icon: string; charLimit?: number }[] = [
    { id: "linkedin", label: "LinkedIn",   icon: "in", charLimit: 2600 },
    { id: "twitter",  label: "Twitter/X",  icon: "𝕏",  charLimit: 160 },
    { id: "portfolio",label: "Portfolio",  icon: "🌐" },
    { id: "github",   label: "GitHub",     icon: "🐙" },
  ];

  const tones: { id: Tone; label: string; desc: string }[] = [
    { id: "professional", label: "Professional", desc: "Formal, achievement-focused" },
    { id: "casual",       label: "Casual",       desc: "Friendly and approachable" },
    { id: "creative",     label: "Creative",     desc: "Unique personal brand" },
  ];

  return (
    <div className="p-6 max-w-5xl mx-auto">
      <div className="flex items-center gap-3 mb-6">
        <div className="w-9 h-9 rounded-xl bg-primary/10 flex items-center justify-center">
          <MessageSquare size={18} className="text-primary" />
        </div>
        <div>
          <h1 className="text-2xl font-bold">Bio Generator</h1>
          <p className="text-xs text-muted-foreground mt-0.5">AI-crafted bios for every platform</p>
        </div>
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        {/* Config panel */}
        <div className="space-y-5">
          <div className="p-5 rounded-2xl border border-border bg-card">
            <h3 className="text-sm font-semibold mb-4">Platform</h3>
            <div className="grid grid-cols-2 gap-2">
              {platforms.map((pl) => (
                <button
                  key={pl.id}
                  onClick={() => setPlatform(pl.id)}
                  className={`flex items-center gap-2 p-3 rounded-xl border text-sm transition-all ${
                    platform === pl.id
                      ? "border-primary/40 bg-primary/10 text-primary"
                      : "border-border text-muted-foreground hover:border-border/70 hover:text-foreground"
                  }`}
                >
                  <span>{pl.icon}</span>
                  <span className="font-medium">{pl.label}</span>
                </button>
              ))}
            </div>
          </div>

          <div className="p-5 rounded-2xl border border-border bg-card">
            <h3 className="text-sm font-semibold mb-4">Tone</h3>
            <div className="space-y-2">
              {tones.map((t) => (
                <button
                  key={t.id}
                  onClick={() => setTone(t.id)}
                  className={`w-full flex items-start gap-3 p-3 rounded-xl border text-left transition-all ${
                    tone === t.id
                      ? "border-primary/40 bg-primary/10"
                      : "border-border hover:border-border/70"
                  }`}
                >
                  <div className={`w-1.5 h-1.5 rounded-full mt-1.5 flex-shrink-0 ${tone === t.id ? "bg-primary" : "bg-border"}`} />
                  <div>
                    <p className={`text-sm font-medium ${tone === t.id ? "text-primary" : ""}`}>{t.label}</p>
                    <p className="text-xs text-muted-foreground">{t.desc}</p>
                  </div>
                </button>
              ))}
            </div>
          </div>

          <button
            onClick={generate}
            disabled={loading}
            className="w-full py-3 rounded-xl bg-primary text-white font-semibold text-sm hover:bg-primary/90 transition-all disabled:opacity-60 flex items-center justify-center gap-2"
          >
            {loading
              ? <><Loader2 size={16} className="animate-spin" /> Generating...</>
              : <><Sparkles size={16} /> Generate Bio</>
            }
          </button>
        </div>

        {/* Output */}
        <div className="lg:col-span-2">
          <AnimatePresence mode="wait">
            {result ? (
              <motion.div
                key="result"
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                className="space-y-4"
              >
                {[
                  { key: "headline", label: "Headline", text: result.headline },
                  { key: "summary",  label: "LinkedIn Summary", text: result.summary },
                  { key: "short_bio", label: "Portfolio Bio", text: result.short_bio },
                  { key: "twitter_bio", label: "Twitter/X Bio (160 chars)", text: result.twitter_bio },
                ].map(({ key, label, text }) => (
                  <div key={key} className="p-5 rounded-2xl border border-border bg-card">
                    <div className="flex items-center justify-between mb-3">
                      <h3 className="text-xs font-semibold uppercase tracking-wider text-primary">{label}</h3>
                      <div className="flex items-center gap-2">
                        {key === "twitter_bio" && (
                          <span className={`text-xs font-mono ${text.length > 160 ? "text-red-400" : "text-muted-foreground"}`}>
                            {text.length}/160
                          </span>
                        )}
                        <button
                          onClick={() => copy(key, text)}
                          className="flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground transition-colors"
                        >
                          {copiedKey === key
                            ? <CheckCheck size={13} className="text-emerald-400" />
                            : <Copy size={13} />
                          }
                          {copiedKey === key ? "Copied!" : "Copy"}
                        </button>
                      </div>
                    </div>
                    <p className="text-sm leading-relaxed text-muted-foreground">{text}</p>
                  </div>
                ))}

                <button
                  onClick={generate}
                  className="w-full py-2.5 rounded-xl border border-border text-sm font-medium hover:bg-secondary transition-colors flex items-center justify-center gap-2"
                >
                  <Sparkles size={14} /> Regenerate
                </button>
              </motion.div>
            ) : (
              <motion.div
                key="empty"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="h-full flex items-center justify-center p-12 text-center text-muted-foreground"
              >
                <div>
                  <MessageSquare size={40} className="mx-auto mb-4 opacity-20" />
                  <p className="text-sm">Select platform, choose tone</p>
                  <p className="text-xs mt-1 opacity-60">and click Generate Bio</p>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}
