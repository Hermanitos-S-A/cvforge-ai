"use client";
import { useState } from "react";
import { motion } from "framer-motion";
import { Layers, Download, Eye, Loader2, CheckCircle } from "lucide-react";
import { toast } from "sonner";
import { api } from "@/lib/api";

const TEMPLATES = [
  {
    id: "atlas",
    name: "Atlas",
    desc: "Modern dark header, gradient accent — most popular",
    ats: true,
    colors: ["#6c63ff", "#22d3ee"],
    preview: "gradient",
  },
  {
    id: "nova",
    name: "Nova",
    desc: "Clean blue theme with photo-friendly header",
    ats: false,
    colors: ["#0ea5e9", "#7dd3fc"],
    preview: "photo",
  },
  {
    id: "zenith",
    name: "Zenith",
    desc: "Two-column layout, green accent — great for dense CVs",
    ats: true,
    colors: ["#10b981", "#6ee7b7"],
    preview: "two-col",
  },
];

export default function TemplatesPage() {
  const [selected, setSelected] = useState("atlas");
  const [exporting, setExporting] = useState(false);

  const exportPDF = async () => {
    setExporting(true);
    try {
      const blob = await api.exportPDF(1, selected);
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `cv-${selected}.pdf`;
      a.click();
      URL.revokeObjectURL(url);
      toast.success("PDF exported successfully!");
    } catch {
      toast.error("Export failed — make sure the backend is running");
    } finally {
      setExporting(false);
    }
  };

  return (
    <div className="p-6 max-w-5xl mx-auto">
      <div className="flex items-center gap-3 mb-6">
        <div className="w-9 h-9 rounded-xl bg-primary/10 flex items-center justify-center">
          <Layers size={18} className="text-primary" />
        </div>
        <div>
          <h1 className="text-2xl font-bold">CV Templates</h1>
          <p className="text-xs text-muted-foreground mt-0.5">Choose a template and export your professional PDF</p>
        </div>
      </div>

      {/* Template grid */}
      <div className="grid md:grid-cols-3 gap-5 mb-8">
        {TEMPLATES.map((t) => (
          <motion.button
            key={t.id}
            whileHover={{ y: -3 }}
            onClick={() => setSelected(t.id)}
            className={`text-left rounded-2xl border-2 overflow-hidden transition-all ${
              selected === t.id ? "border-primary shadow-lg shadow-primary/10" : "border-border"
            }`}
          >
            {/* Template preview */}
            <div className="aspect-[3/4] bg-card p-4 space-y-2 relative">
              {selected === t.id && (
                <div className="absolute top-3 right-3 w-6 h-6 rounded-full bg-primary flex items-center justify-center">
                  <CheckCircle size={14} className="text-white" />
                </div>
              )}
              {/* Header bar */}
              <div className="h-1/5 rounded-lg" style={{ background: `linear-gradient(135deg, ${t.colors[0]}, ${t.colors[1]})` }} />
              {/* Content lines */}
              <div className="space-y-1.5 pt-1">
                <div className="h-2 bg-border rounded w-3/4" />
                <div className="h-2 bg-border rounded w-1/2" />
              </div>
              <div className="pt-2 space-y-1">
                <div className="h-1.5 rounded" style={{ background: t.colors[0] + "60", width: "40%" }} />
                <div className="h-1.5 bg-border rounded w-full" />
                <div className="h-1.5 bg-border rounded w-5/6" />
                <div className="h-1.5 bg-border rounded w-4/6" />
              </div>
              <div className="pt-2 space-y-1">
                <div className="h-1.5 rounded" style={{ background: t.colors[0] + "60", width: "35%" }} />
                <div className="h-1.5 bg-border rounded w-full" />
                <div className="h-1.5 bg-border rounded w-3/4" />
              </div>
            </div>

            {/* Info */}
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

      {/* Export actions */}
      <div className="p-6 rounded-2xl border border-border bg-card">
        <h2 className="font-semibold mb-4">Export Options</h2>
        <div className="flex flex-wrap gap-3">
          <button
            onClick={exportPDF}
            disabled={exporting}
            className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-primary text-white text-sm font-semibold hover:bg-primary/90 transition-all disabled:opacity-60"
          >
            {exporting ? <Loader2 size={16} className="animate-spin" /> : <Download size={16} />}
            {exporting ? "Generating PDF..." : "Export PDF"}
          </button>
          <button className="flex items-center gap-2 px-5 py-2.5 rounded-xl border border-border text-sm font-medium hover:bg-secondary transition-colors">
            <Eye size={16} /> Preview CV
          </button>
          <button
            onClick={() => toast.info("DOCX export coming in v1.1!")}
            className="flex items-center gap-2 px-5 py-2.5 rounded-xl border border-border text-sm font-medium hover:bg-secondary transition-colors"
          >
            <Download size={16} /> Export DOCX
          </button>
        </div>

        <div className="mt-4 p-3 rounded-xl bg-secondary/50 text-xs text-muted-foreground">
          <strong className="text-foreground">PDF Features:</strong> ATS-friendly fonts · No images that confuse parsers · Clean sections ·
          Generated with ReportLab (100% free, no external services)
        </div>
      </div>
    </div>
  );
}
