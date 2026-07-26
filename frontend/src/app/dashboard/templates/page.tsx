"use client";
import { useState } from "react";
import { motion } from "framer-motion";
import { Layers, Download, Eye, Loader2, CheckCircle, Lock, Sparkles } from "lucide-react";
import { toast } from "sonner";
import Link from "next/link";
import { useAuth } from "@/hooks/useAuth";
import { useResume } from "@/hooks/useResume";
import { usePlan, ProBadge } from "@/components/upgrade/PlanGate";
import { api } from "@/lib/api";

const TEMPLATES = [
  { id:"atlas",  name:"Atlas",  desc:"Header degradado moderno",           ats:true,  pro:false, colors:["#6c63ff","#22d3ee"] },
  { id:"nova",   name:"Nova",   desc:"Tema azul, header profesional",       ats:false, pro:false, colors:["#0ea5e9","#7dd3fc"] },
  { id:"zenith", name:"Zenith", desc:"Dos columnas, acento verde",          ats:true,  pro:true,  colors:["#10b981","#6ee7b7"] },
  { id:"nexus",  name:"Nexus",  desc:"Bold con acento rojo, muy impactante",ats:true,  pro:true,  colors:["#f43f5e","#fda4af"] },
  { id:"pulse",  name:"Pulse",  desc:"Tipografía moderna, tono violeta",    ats:true,  pro:true,  colors:["#8b5cf6","#c4b5fd"] },
  { id:"slate",  name:"Slate",  desc:"Minimalista puro, mucho espacio",     ats:true,  pro:true,  colors:["#475569","#94a3b8"] },
];

export default function TemplatesPage() {
  useAuth();
  const { resume, serverResumeId, updateTemplate, save } = useResume();
  const { isPro } = usePlan();
  const [selected, setSelected] = useState(resume.template || "atlas");
  const [exporting, setExporting] = useState(false);

  const selectTemplate = (id: string, isProt: boolean) => {
    if (isProt && !isPro) return;
    setSelected(id);
    updateTemplate(id);
  };

  const exportPDF = async () => {
    if (!serverResumeId) { toast.error("Primero guarda tu CV en Mi Perfil"); return; }
    setExporting(true);
    try {
      await save();
      const blob = await api.exportPDF(serverResumeId, selected);
      const url  = URL.createObjectURL(blob);
      const a    = document.createElement("a");
      a.href     = url;
      a.download = `cv-${selected}-${Date.now()}.pdf`;
      a.click();
      URL.revokeObjectURL(url);
      toast.success("PDF exportado!");
    } catch (err: any) {
      toast.error(err?.response?.data?.detail || "Error al exportar");
    } finally { setExporting(false); }
  };

  return (
    <div className="p-6 max-w-5xl mx-auto">
      <div className="flex items-center gap-3 mb-6">
        <div className="w-9 h-9 rounded-xl bg-primary/10 flex items-center justify-center">
          <Layers size={17} className="text-primary" />
        </div>
        <div className="flex-1">
          <h1 className="text-2xl font-bold">Plantillas de CV</h1>
          <p className="text-xs text-muted-foreground mt-0.5">
            {isPro ? "Tienes acceso a las 6 plantillas premium ✓" : "2 gratis · 4 exclusivas Pro"}
          </p>
        </div>
        {!isPro && (
          <Link href="/dashboard/upgrade"
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold text-white"
            style={{ background:"linear-gradient(135deg,#6c63ff,#22d3ee)" }}>
            <Sparkles size={11} /> Desbloquear todas
          </Link>
        )}
      </div>

      {/* Template grid */}
      <div className="grid md:grid-cols-3 gap-4 mb-8">
        {TEMPLATES.map((t) => {
          const locked = t.pro && !isPro;
          const isSelected = selected === t.id;
          return (
            <motion.div key={t.id} whileHover={!locked ? { y:-3 } : {}}
              onClick={() => selectTemplate(t.id, t.pro)}
              className={"rounded-2xl border-2 overflow-hidden transition-all " + (
                locked ? "opacity-60 cursor-not-allowed" :
                isSelected ? "border-primary shadow-lg shadow-primary/10 cursor-pointer" :
                "border-border hover:border-border/60 cursor-pointer"
              )}>
              {/* Preview */}
              <div className="aspect-[3/4] bg-card p-4 space-y-2 relative">
                {isSelected && !locked && (
                  <div className="absolute top-3 right-3 w-6 h-6 rounded-full bg-primary flex items-center justify-center">
                    <CheckCircle size={14} className="text-white" />
                  </div>
                )}
                {locked && (
                  <div className="absolute inset-0 flex items-center justify-center bg-card/80 backdrop-blur-[1px] z-10">
                    <div className="text-center">
                      <div className="w-10 h-10 rounded-xl flex items-center justify-center mx-auto mb-2"
                        style={{ background:"linear-gradient(135deg,#6c63ff,#22d3ee)" }}>
                        <Lock size={16} className="text-white" />
                      </div>
                      <Link href="/dashboard/upgrade"
                        className="text-[10px] font-bold text-primary hover:underline"
                        onClick={e => e.stopPropagation()}>
                        Requiere Pro
                      </Link>
                    </div>
                  </div>
                )}
                {/* Template visual preview */}
                <div className="h-[22%] rounded-lg" style={{ background:`linear-gradient(135deg,${t.colors[0]},${t.colors[1]})` }} />
                <div className="space-y-1.5 pt-1">
                  <div className="h-2 bg-border rounded w-3/4" />
                  <div className="h-2 bg-border rounded w-1/2" />
                </div>
                <div className="pt-1.5 space-y-1">
                  <div className="h-1.5 rounded w-2/5" style={{ background:`${t.colors[0]}50` }} />
                  <div className="h-1.5 bg-border rounded w-full" />
                  <div className="h-1.5 bg-border rounded w-5/6" />
                  <div className="h-1.5 bg-border rounded w-4/6" />
                </div>
                <div className="pt-1.5 space-y-1">
                  <div className="h-1.5 rounded w-1/3" style={{ background:`${t.colors[0]}50` }} />
                  <div className="h-1.5 bg-border rounded w-full" />
                  <div className="h-1.5 bg-border rounded w-3/4" />
                </div>
              </div>

              {/* Info */}
              <div className="p-3.5 border-t border-border">
                <div className="flex items-center gap-2 mb-0.5">
                  <span className="font-semibold text-sm">{t.name}</span>
                  {t.ats && (
                    <span className="text-[9px] font-bold px-1.5 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">ATS</span>
                  )}
                  {t.pro && <ProBadge />}
                </div>
                <p className="text-xs text-muted-foreground">{t.desc}</p>
              </div>
            </motion.div>
          );
        })}
      </div>

      {/* Export section */}
      <div className="p-6 rounded-2xl border border-border bg-card">
        <h2 className="font-semibold mb-2">Exportar</h2>
        <p className="text-xs text-muted-foreground mb-4">
          Plantilla seleccionada: <span className="font-semibold text-foreground capitalize">{selected}</span>
          {TEMPLATES.find(t=>t.id===selected)?.pro && !isPro && (
            <span className="ml-2 text-amber-400">— Requiere Pro para exportar</span>
          )}
        </p>
        <div className="flex flex-wrap gap-3">
          <button onClick={exportPDF} disabled={exporting || (TEMPLATES.find(t=>t.id===selected)?.pro && !isPro)}
            className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-primary text-white text-sm font-semibold hover:opacity-90 disabled:opacity-50">
            {exporting ? <Loader2 size={14} className="animate-spin" /> : <Download size={14} />}
            {exporting ? "Generando..." : "Exportar PDF"}
          </button>
          <Link href="/dashboard/cv/preview"
            className="flex items-center gap-2 px-5 py-2.5 rounded-xl border border-border text-sm font-medium hover:bg-secondary transition-colors">
            <Eye size={14} /> Vista previa
          </Link>
        </div>
        <p className="text-xs text-muted-foreground mt-4 opacity-70">
          Fuentes ATS-friendly · PDF limpio · Generado con ReportLab
        </p>
      </div>
    </div>
  );
}
