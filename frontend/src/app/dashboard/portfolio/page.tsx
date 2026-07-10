"use client";
import { useState } from "react";
import { motion } from "framer-motion";
import { Globe, Download, ExternalLink, Loader2, Rocket, CheckCircle } from "lucide-react";
import { toast } from "sonner";
import { useAuth } from "@/hooks/useAuth";
import { useResume } from "@/hooks/useResume";
import { api } from "@/lib/api";

export default function PortfolioPage() {
  useAuth();
  const { resume, serverResumeId } = useResume();
  const [downloading, setDownloading] = useState(false);
  const p = resume.personal;
  const displayName = p.name || "Tu Nombre";
  const displayTitle = p.title || "Software Engineer";

  const downloadHTML = async () => {
    if (!serverResumeId) {
      toast.error("Primero guarda tu CV en 'Mi Perfil'");
      return;
    }
    setDownloading(true);
    try {
      const blob = await api.exportPortfolioHTML(serverResumeId);
      const url  = URL.createObjectURL(blob);
      const a    = document.createElement("a");
      a.href     = url;
      a.download = "portfolio.html";
      a.click();
      URL.revokeObjectURL(url);
      toast.success("Portafolio HTML descargado!");
    } catch {
      toast.error("Error al generar portafolio — verifica que el backend esté corriendo");
    } finally { setDownloading(false); }
  };

  const sections = [
    "Hero & Bio",
    "Grid de habilidades",
    "Timeline de experiencia",
    "Cards de proyectos",
    "Links de contacto",
    "Diseño responsive",
    "Dark mode incluido",
  ];

  return (
    <div className="p-6 max-w-5xl mx-auto">
      <div className="flex items-center gap-3 mb-6">
        <div className="w-9 h-9 rounded-xl bg-primary/10 flex items-center justify-center">
          <Globe size={17} className="text-primary" />
        </div>
        <div>
          <h1 className="text-2xl font-bold">Generador de Portafolio</h1>
          <p className="text-xs text-muted-foreground mt-0.5">Web personal generada automáticamente desde tu CV</p>
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
              <div className="flex-1 mx-3 bg-white/5 rounded-full px-3 py-1 text-[11px] text-white/30 font-mono truncate">
                {p.portfolio || `${displayName.toLowerCase().replace(/\s/g,"-")}.cvforge.dev`}
              </div>
            </div>

            {/* Portfolio content preview */}
            <div className="text-white/90 text-xs">
              {/* Hero */}
              <div className="text-center py-8 px-6 border-b border-white/10 bg-gradient-to-b from-[#16161f] to-[#0a0a0f]">
                <div className="text-2xl font-bold mb-1">{displayName}</div>
                <div className="text-violet-400 text-sm mb-3">{displayTitle}</div>
                <p className="text-white/40 text-xs max-w-sm mx-auto leading-relaxed">
                  {resume.summary || "Desarrollador apasionado construyendo aplicaciones web escalables y grandes experiencias de usuario."}
                </p>
                <div className="flex justify-center gap-3 mt-4">
                  {p.github   && <span className="px-3 py-1 rounded-full border border-white/10 text-white/50 text-[11px]">GitHub</span>}
                  {p.linkedin && <span className="px-3 py-1 rounded-full border border-white/10 text-white/50 text-[11px]">LinkedIn</span>}
                  {p.email    && <span className="px-3 py-1 rounded-full border border-white/10 text-white/50 text-[11px]">Email</span>}
                </div>
              </div>

              {/* 3 columns */}
              <div className="grid grid-cols-3 divide-x divide-white/10">
                <div className="p-4">
                  <div className="text-[9px] font-bold text-violet-400 uppercase tracking-widest mb-3">Habilidades</div>
                  <div className="flex flex-wrap gap-1">
                    {resume.skills.slice(0,6).length > 0
                      ? resume.skills.slice(0,6).map(s => (
                          <span key={s.name} className="px-2 py-0.5 rounded-full bg-white/5 border border-white/10 text-[10px] text-white/50">{s.name}</span>
                        ))
                      : ["React","TypeScript","Node.js","Python"].map(s => (
                          <span key={s} className="px-2 py-0.5 rounded-full bg-white/5 border border-white/10 text-[10px] text-white/50">{s}</span>
                        ))
                    }
                  </div>
                </div>
                <div className="p-4">
                  <div className="text-[9px] font-bold text-violet-400 uppercase tracking-widest mb-3">Proyectos</div>
                  {(resume.projects.slice(0,2).length > 0 ? resume.projects.slice(0,2) : [
                    { name:"TaskFlow Pro", description:"Gestor de proyectos full-stack" },
                    { name:"EcoTrack",     description:"Dashboard de análisis" },
                  ]).map((proj: any) => (
                    <div key={proj.name} className="mb-2 bg-white/5 rounded-lg p-2">
                      <div className="font-medium text-[11px] text-white/80">{proj.name}</div>
                      <div className="text-[10px] text-white/40 mt-0.5">{proj.description}</div>
                    </div>
                  ))}
                </div>
                <div className="p-4">
                  <div className="text-[9px] font-bold text-violet-400 uppercase tracking-widest mb-3">Experiencia</div>
                  {(resume.experiences.slice(0,2).length > 0 ? resume.experiences.slice(0,2) : [
                    { role:"Senior FE Engineer", company:"TechCorp", start_date:"2022", is_current:true },
                  ]).map((exp: any, i: number) => (
                    <div key={i} className="mb-2">
                      <div className="font-medium text-[11px] text-white/80">{exp.role}</div>
                      <div className="text-[10px] text-violet-400">{exp.company}</div>
                      <div className="text-[10px] text-white/30">{exp.start_date} – {exp.is_current ? "Presente" : exp.end_date}</div>
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
            <h3 className="font-semibold mb-4">Opciones de deploy</h3>
            <div className="space-y-3">
              <button onClick={() => toast.success("🚀 Para hacer deploy en Vercel:\n1. Descarga el HTML\n2. Sube a github.com/tu-usuario/portfolio\n3. Conecta en vercel.com")}
                className="w-full flex items-center gap-3 px-4 py-3 rounded-xl border border-border hover:border-primary/40 hover:bg-primary/5 transition-all text-sm font-medium group">
                <Rocket size={15} className="text-primary" />
                <div className="text-left">
                  <div>Deploy en Vercel</div>
                  <div className="text-xs text-muted-foreground font-normal">Hosting gratis, deploy instantáneo</div>
                </div>
                <ExternalLink size={11} className="ml-auto text-muted-foreground group-hover:text-primary transition-colors" />
              </button>

              <button onClick={downloadHTML} disabled={downloading}
                className="w-full flex items-center gap-3 px-4 py-3 rounded-xl border border-border hover:border-primary/40 hover:bg-primary/5 transition-all text-sm font-medium">
                {downloading ? <Loader2 size={15} className="animate-spin" /> : <Download size={15} />}
                <div className="text-left">
                  <div>Descargar HTML</div>
                  <div className="text-xs text-muted-foreground font-normal">Archivo único listo para usar</div>
                </div>
              </button>
            </div>
          </div>

          <div className="p-5 rounded-2xl border border-border bg-card">
            <h3 className="font-semibold mb-3 text-sm">Secciones incluidas</h3>
            <div className="space-y-2">
              {sections.map((s) => (
                <div key={s} className="flex items-center gap-2 text-sm text-muted-foreground">
                  <CheckCircle size={12} className="text-emerald-400 flex-shrink-0" />
                  {s}
                </div>
              ))}
            </div>
          </div>

          {p.portfolio && (
            <div className="p-4 rounded-2xl border border-primary/20 bg-primary/5 text-xs">
              <p className="font-medium text-foreground mb-1">🔗 URL configurada</p>
              <p className="font-mono text-primary break-all">{p.portfolio}</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
