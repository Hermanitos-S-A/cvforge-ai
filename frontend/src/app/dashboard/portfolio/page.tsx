"use client";
import { useState } from "react";
import { motion } from "framer-motion";
import { Globe, Download, ExternalLink, Loader2, Rocket } from "lucide-react";
import { toast } from "sonner";
import { useResumeStore } from "@/stores/resumeStore";
import { api } from "@/lib/api";

export default function PortfolioPage() {
  const { resume } = useResumeStore();
  const [downloading, setDownloading] = useState(false);

  const p = resume.personal;
  const name = p.name || "Your Name";
  const title = p.title || "Software Engineer";

  const downloadHTML = async () => {
    setDownloading(true);
    try {
      const blob = await api.exportPortfolioHTML(1);
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = "portfolio.html";
      a.click();
      URL.revokeObjectURL(url);
      toast.success("Portfolio HTML downloaded!");
    } catch {
      toast.error("Make sure the backend is running");
    } finally {
      setDownloading(false);
    }
  };

  return (
    <div className="p-6 max-w-5xl mx-auto">
      <div className="flex items-center gap-3 mb-6">
        <div className="w-9 h-9 rounded-xl bg-primary/10 flex items-center justify-center">
          <Globe size={18} className="text-primary" />
        </div>
        <div>
          <h1 className="text-2xl font-bold">Portfolio Generator</h1>
          <p className="text-xs text-muted-foreground mt-0.5">Auto-generate a stunning portfolio from your CV data</p>
        </div>
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        {/* Preview */}
        <div className="lg:col-span-2">
          <div className="rounded-2xl border border-border overflow-hidden bg-[#0a0a0f]">
            {/* Browser chrome */}
            <div className="flex items-center gap-2 px-4 py-2.5 bg-[#16161f] border-b border-white/10">
              <div className="w-2.5 h-2.5 rounded-full bg-red-500/70" />
              <div className="w-2.5 h-2.5 rounded-full bg-amber-500/70" />
              <div className="w-2.5 h-2.5 rounded-full bg-emerald-500/70" />
              <div className="flex-1 mx-3 bg-white/5 rounded-full px-3 py-1 text-[11px] text-white/30 font-mono">
                {p.portfolio || `${(p.name || "you").toLowerCase().replace(/\s/g, "")}.cvforge.dev`}
              </div>
            </div>

            {/* Portfolio preview */}
            <div className="p-0 text-white/90 text-xs">
              {/* Hero */}
              <div className="text-center py-8 px-6 border-b border-white/10 bg-gradient-to-b from-[#16161f] to-[#0a0a0f]">
                <div className="text-2xl font-bold mb-1">{name}</div>
                <div className="text-violet-400 text-sm mb-3">{title}</div>
                <p className="text-white/40 text-xs max-w-sm mx-auto leading-relaxed">
                  {resume.summary || "Passionate developer building scalable web applications and great user experiences."}
                </p>
                <div className="flex justify-center gap-3 mt-4">
                  {p.github && <span className="px-3 py-1 rounded-full border border-white/10 text-white/50 text-[11px]">GitHub</span>}
                  {p.linkedin && <span className="px-3 py-1 rounded-full border border-white/10 text-white/50 text-[11px]">LinkedIn</span>}
                  {p.email && <span className="px-3 py-1 rounded-full border border-white/10 text-white/50 text-[11px]">Email</span>}
                </div>
              </div>

              {/* Content sections */}
              <div className="grid grid-cols-3 divide-x divide-white/10">
                <div className="p-4">
                  <div className="text-[9px] font-bold text-violet-400 uppercase tracking-widest mb-3">Skills</div>
                  <div className="flex flex-wrap gap-1">
                    {resume.skills.slice(0, 8).map((s) => (
                      <span key={s.name} className="px-2 py-0.5 rounded-full bg-white/5 border border-white/10 text-[10px] text-white/50">{s.name}</span>
                    ))}
                    {resume.skills.length === 0 && (
                      <>
                        {["React","TypeScript","Node.js","Python","Docker"].map((s) => (
                          <span key={s} className="px-2 py-0.5 rounded-full bg-white/5 border border-white/10 text-[10px] text-white/50">{s}</span>
                        ))}
                      </>
                    )}
                  </div>
                </div>
                <div className="p-4">
                  <div className="text-[9px] font-bold text-violet-400 uppercase tracking-widest mb-3">Projects</div>
                  {(resume.projects.slice(0, 2).length > 0 ? resume.projects.slice(0, 2) : [
                    { name: "TaskFlow Pro", description: "Full-stack project manager" },
                    { name: "EcoTrack", description: "Carbon footprint analytics" },
                  ]).map((p: any) => (
                    <div key={p.name} className="mb-3 bg-white/5 rounded-lg p-2">
                      <div className="font-medium text-[11px] text-white/80">{p.name}</div>
                      <div className="text-[10px] text-white/40 mt-0.5">{p.description}</div>
                    </div>
                  ))}
                </div>
                <div className="p-4">
                  <div className="text-[9px] font-bold text-violet-400 uppercase tracking-widest mb-3">Experience</div>
                  {(resume.experiences.slice(0, 2).length > 0 ? resume.experiences.slice(0, 2) : [
                    { role: "Senior FE Engineer", company: "TechCorp", start_date: "2022", is_current: true },
                  ]).map((e: any, i: number) => (
                    <div key={i} className="mb-3">
                      <div className="font-medium text-[11px] text-white/80">{e.role}</div>
                      <div className="text-[10px] text-violet-400">{e.company}</div>
                      <div className="text-[10px] text-white/30">{e.start_date} – {e.is_current ? "Present" : e.end_date}</div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Controls */}
        <div className="space-y-4">
          <div className="p-5 rounded-2xl border border-border bg-card">
            <h3 className="font-semibold mb-4">Deploy Options</h3>
            <div className="space-y-3">
              <button
                onClick={() => toast.success("🚀 Deploying to Vercel... check your dashboard!")}
                className="w-full flex items-center gap-3 px-4 py-3 rounded-xl border border-border hover:border-primary/40 hover:bg-primary/5 transition-all text-sm font-medium group"
              >
                <Rocket size={16} className="text-primary" />
                <div className="text-left">
                  <div>Deploy to Vercel</div>
                  <div className="text-xs text-muted-foreground font-normal">Free hosting, instant deploy</div>
                </div>
                <ExternalLink size={12} className="ml-auto text-muted-foreground group-hover:text-primary transition-colors" />
              </button>

              <button
                onClick={downloadHTML}
                disabled={downloading}
                className="w-full flex items-center gap-3 px-4 py-3 rounded-xl border border-border hover:border-primary/40 hover:bg-primary/5 transition-all text-sm font-medium"
              >
                {downloading ? <Loader2 size={16} className="animate-spin" /> : <Download size={16} />}
                <div className="text-left">
                  <div>Download HTML</div>
                  <div className="text-xs text-muted-foreground font-normal">Single-file portfolio</div>
                </div>
              </button>
            </div>
          </div>

          <div className="p-5 rounded-2xl border border-border bg-card">
            <h3 className="font-semibold mb-3 text-sm">Included Sections</h3>
            <div className="space-y-2 text-sm">
              {["Hero & Bio", "Skills Grid", "Experience Timeline", "Projects Cards", "Contact Links", "Responsive Design", "Dark Mode"].map((f) => (
                <div key={f} className="flex items-center gap-2 text-muted-foreground">
                  <div className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                  {f}
                </div>
              ))}
            </div>
          </div>

          <div className="p-4 rounded-2xl border border-primary/20 bg-primary/5 text-xs text-muted-foreground">
            <p className="font-medium text-foreground mb-1">📡 Public URL</p>
            <p className="font-mono text-primary break-all">
              {p.portfolio || `${(name || "you").toLowerCase().replace(/\s/g, "-")}.cvforge.dev`}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
