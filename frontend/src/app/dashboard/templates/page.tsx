"use client";
import { useState } from "react";
import { motion } from "framer-motion";
import { Layers, Download, Eye, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { useAuth } from "@/hooks/useAuth";
import { useResume } from "@/hooks/useResume";
import { api } from "@/lib/api";

const TEMPLATES = [
  { id:"atlas",  name:"Atlas",  desc:"Header degradado moderno — el más popular", ats:true,  colors:["#6c63ff","#22d3ee"] },
  { id:"nova",   name:"Nova",   desc:"Tema azul limpio con header para foto",      ats:false, colors:["#0ea5e9","#7dd3fc"] },
  { id:"zenith", name:"Zenith", desc:"Diseño dos columnas, acento verde",          ats:true,  colors:["#10b981","#6ee7b7"] },
];

export default function TemplatesPage() {
  useAuth();
  const { resume, serverResumeId, updateTemplate, save } = useResume();
  const [selected, setSelected]   = useState(resume.template || "atlas");
  const [exporting, setExporting] = useState(false);

  const selectTemplate = async (id: string) => {
    setSelected(id);
    updateTemplate(id);
  };

  const exportPDF = async () => {
    if (!serverResumeId) {
      toast.error("Primero completa y guarda tu CV en 'Mi Perfil'");
      return;
    }
    setExporting(true);
    try {
      // Save current template selection first
      await save();
      const blob = await api.exportPDF(serverResumeId, selected);
      const url  = URL.createObjectURL(blob);
      const a    = document.createElement("a");
      a.href     = url;
      a.download = `cv-${selected}-${Date.now()}.pdf`;
      a.click();
      URL.revokeObjectURL(url);
      toast.success("PDF exportado exitosamente!");
    } catch (err: any) {
      const msg = err?.response?.data?.detail || "Error al generar PDF — verifica que el backend esté corriendo";
      toast.error(msg);
    } finally { setExporting(false); }
  };

  return (
    <div className="p-6 max-w-5xl mx-auto">
      <div className="flex items-center gap-3 mb-6">
        <div className="w-9 h-9 rounded-xl bg-primary/10 flex items-center justify-center">
          <Layers size={17} className="text-primary" />
        </div>
        <div>
          <h1 className="text-2xl font-bold">Plantillas de CV</h1>
          <p className="text-xs text-muted-foreground mt-0.5">Elige una plantilla y exporta tu PDF profesional</p>
        </div>
      </div>

      {/* Grid de plantillas */}
      <div className="grid md:grid-cols-3 gap-5 mb-8">
        {TEMPLATES.map((t) => (
          <motion.button key={t.id} whileHover={{ y:-3 }} onClick={() => selectTemplate(t.id)}
            className={`text-left rounded-2xl border-2 overflow-hidden transition-all ${
              selected === t.id ? "border-primary shadow-lg shadow-primary/10" : "border-border hover:border-border/60"
            }`}>
            {/* Preview visual */}
            <div className="aspect-[3/4] bg-card p-4 space-y-2 relative">
              {selected === t.id && (
                <div className="absolute top-3 right-3 w-5 h-5 rounded-full bg-primary flex items-center justify-center">
                  <span className="text-white text-[10px] font-bold">✓</span>
                </div>
              )}
              <div className="h-1/5 rounded-lg" style={{ background:`linear-gradient(135deg,${t.colors[0]},${t.colors[1]})` }} />
              <div className="space-y-1.5 pt-1">
                <div className="h-2 bg-border rounded w-3/4" />
                <div className="h-2 bg-border rounded w-1/2" />
              </div>
              <div className="pt-2 space-y-1">
                <div className="h-1.5 rounded w-2/5" style={{ background:t.colors[0]+"50" }} />
                <div className="h-1.5 bg-border rounded w-full" />
                <div className="h-1.5 bg-border rounded w-5/6" />
                <div className="h-1.5 bg-border rounded w-4/6" />
              </div>
              <div className="pt-2 space-y-1">
                <div className="h-1.5 rounded w-1/3" style={{ background:t.colors[0]+"50" }} />
                <div className="h-1.5 bg-border rounded w-full" />
                <div className="h-1.5 bg-border rounded w-3/4" />
              </div>
            </div>
            <div className="p-4 border-t border-border">
              <div className="flex items-center gap-2 mb-1">
                <span className="font-semibold text-sm">{t.name}</span>
                {t.ats && (
                  <span className="text-[10px] font-bold px-1.5 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                    ATS ✓
                  </span>
                )}
              </div>
              <p className="text-xs text-muted-foreground">{t.desc}</p>
            </div>
          </motion.button>
        ))}
      </div>

      {/* Exportar */}
      <div className="p-6 rounded-2xl border border-border bg-card">
        <h2 className="font-semibold mb-2">Exportar</h2>
        <p className="text-xs text-muted-foreground mb-4">
          El PDF se genera desde los datos guardados en tu perfil con la plantilla seleccionada.
        </p>
        <div className="flex flex-wrap gap-3">
          <button onClick={exportPDF} disabled={exporting}
            className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-primary text-white text-sm font-semibold hover:opacity-90 transition-all disabled:opacity-60">
            {exporting ? <Loader2 size={15} className="animate-spin" /> : <Download size={15} />}
            {exporting ? "Generando PDF..." : "Exportar PDF"}
          </button>
          <button onClick={() => toast.info("Vista previa próximamente en v1.2")}
            className="flex items-center gap-2 px-5 py-2.5 rounded-xl border border-border text-sm font-medium hover:bg-secondary transition-colors">
            <Eye size={15} /> Vista previa
          </button>
          <button onClick={() => toast.info("Exportación DOCX disponible en v1.1")}
            className="flex items-center gap-2 px-5 py-2.5 rounded-xl border border-border text-sm font-medium hover:bg-secondary transition-colors">
            <Download size={15} /> Exportar DOCX
          </button>
        </div>
        <div className="mt-4 p-3 rounded-xl bg-secondary/50 text-xs text-muted-foreground">
          <strong className="text-foreground">Características del PDF:</strong>{" "}
          Fuentes ATS-friendly · Sin imágenes que confundan parsers · Secciones limpias · Generado con ReportLab (100% gratis)
        </div>
      </div>
    </div>
  );
}
