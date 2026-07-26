"use client";
import { useState } from "react";
import { motion } from "framer-motion";
import { Check, Sparkles, Loader2, Crown, Zap, ArrowRight, Lock } from "lucide-react";
import { toast } from "sonner";
import { useAuth } from "@/hooks/useAuth";
import { useAuthStore } from "@/stores/authStore";
import { api } from "@/lib/api";

const FREE_FEATURES = [
  { label: "2 plantillas de CV (Atlas, Nova)", available: true },
  { label: "3 exportaciones PDF por mes", available: true },
  { label: "5 optimizaciones con IA por mes", available: true },
  { label: "Analizador ATS básico", available: true },
  { label: "Foto de perfil en CV", available: false },
  { label: "Portafolio web personal", available: false },
  { label: "Generador de bios", available: false },
  { label: "6 plantillas premium", available: false },
  { label: "PDF ilimitados", available: false },
  { label: "IA ilimitada", available: false },
];

const PRO_FEATURES = [
  { label: "6 plantillas premium (Atlas, Nova, Zenith, Nexus, Pulse, Slate)", available: true },
  { label: "Exportaciones PDF ilimitadas", available: true },
  { label: "Optimizaciones con IA ilimitadas", available: true },
  { label: "Analizador ATS completo", available: true },
  { label: "Foto de perfil en el CV", available: true },
  { label: "Portafolio web personal", available: true },
  { label: "Generador de bios (LinkedIn, Twitter, GitHub)", available: true },
  { label: "Soporte prioritario", available: true },
  { label: "Acceso anticipado a nuevas funciones", available: true },
];

export default function UpgradePage() {
  useAuth();
  const { user, setUser } = useAuthStore();
  const [upgrading, setUpgrading] = useState(false);
  const [downgrading, setDowngrading] = useState(false);
  const isPro = user?.plan === "pro";

  const handleUpgrade = async () => {
    setUpgrading(true);
    try {
      const res = await (api as any).simulateUpgrade();
      if (user) setUser({ ...user, plan: "pro" });
      toast.success("Plan actualizado a Pro (modo demo)");
    } catch (err: any) {
      toast.error(err?.response?.data?.detail || "Error al actualizar");
    } finally { setUpgrading(false); }
  };

  const handleDowngrade = async () => {
    setDowngrading(true);
    try {
      await (api as any).downgradePlan();
      if (user) setUser({ ...user, plan: "free" });
      toast.success("Plan cambiado a Free");
    } catch { toast.error("Error al cambiar plan"); }
    finally { setDowngrading(false); }
  };

  return (
    <div className="p-6 max-w-5xl mx-auto">
      {/* Header */}
      <div className="text-center mb-12">
        <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-semibold mb-4"
          style={{ background:"rgba(108,99,255,0.08)", border:"1px solid rgba(108,99,255,0.15)", color:"#6c63ff" }}>
          <Crown size={12} /> Planes CVForge AI
        </div>
        <h1 className="text-3xl font-extrabold tracking-tight mb-3">
          {isPro ? "Tu plan actual: Pro ✨" : "Actualiza a Pro"}
        </h1>
        <p className="text-muted-foreground text-sm max-w-md mx-auto">
          {isPro
            ? "Tienes acceso a todas las funciones premium. Gracias por apoyar CVForge AI."
            : "Desbloquea todas las plantillas, exportaciones ilimitadas y funciones de IA."
          }
        </p>
      </div>

      {/* Plan cards */}
      <div className="grid md:grid-cols-2 gap-6 mb-10">
        {/* FREE */}
        <motion.div initial={{ opacity:0, y:16 }} animate={{ opacity:1, y:0 }} transition={{ delay:0.05 }}
          className={`p-6 rounded-2xl border-2 transition-all ${!isPro ? "border-primary" : "border-border"}`}>
          <div className="flex items-center justify-between mb-5">
            <div>
              <h2 className="text-lg font-bold">Free</h2>
              <p className="text-muted-foreground text-sm">Para empezar</p>
            </div>
            <div className="text-right">
              <p className="text-3xl font-bold font-mono">$0</p>
              <p className="text-xs text-muted-foreground">para siempre</p>
            </div>
          </div>
          <ul className="space-y-2.5 mb-6">
            {FREE_FEATURES.map((f) => (
              <li key={f.label} className="flex items-start gap-2.5 text-sm">
                {f.available
                  ? <Check size={14} className="text-emerald-400 flex-shrink-0 mt-0.5" />
                  : <Lock size={14} className="text-muted-foreground/40 flex-shrink-0 mt-0.5" />
                }
                <span className={f.available ? "text-foreground" : "text-muted-foreground/50 line-through"}>
                  {f.label}
                </span>
              </li>
            ))}
          </ul>
          {isPro ? (
            <button onClick={handleDowngrade} disabled={downgrading}
              className="w-full py-2.5 rounded-xl border border-border text-sm font-medium hover:bg-secondary transition-colors text-muted-foreground disabled:opacity-60">
              {downgrading ? <><Loader2 size={13} className="animate-spin inline mr-2" />Cambiando...</> : "Bajar a Free"}
            </button>
          ) : (
            <div className="w-full py-2.5 rounded-xl border border-border text-sm font-medium text-center text-primary bg-primary/5">
              Plan actual ✓
            </div>
          )}
        </motion.div>

        {/* PRO */}
        <motion.div initial={{ opacity:0, y:16 }} animate={{ opacity:1, y:0 }} transition={{ delay:0.1 }}
          className={`p-6 rounded-2xl border-2 relative overflow-hidden transition-all ${isPro ? "border-primary" : "border-primary/40"}`}
          style={{ background: isPro ? "rgba(108,99,255,0.05)" : undefined }}>
          {/* Popular badge */}
          <div className="absolute top-4 right-4">
            <span className="text-[10px] font-bold px-2 py-1 rounded-full text-white"
              style={{ background:"linear-gradient(135deg,#6c63ff,#22d3ee)" }}>
              {isPro ? "ACTIVO ✓" : "RECOMENDADO"}
            </span>
          </div>

          <div className="flex items-center justify-between mb-5">
            <div>
              <h2 className="text-lg font-bold flex items-center gap-2">
                Pro <Sparkles size={16} className="text-primary" />
              </h2>
              <p className="text-muted-foreground text-sm">Todo desbloqueado</p>
            </div>
            <div className="text-right">
              <p className="text-3xl font-bold font-mono">$9</p>
              <p className="text-xs text-muted-foreground">por mes</p>
            </div>
          </div>

          <ul className="space-y-2.5 mb-6">
            {PRO_FEATURES.map((f) => (
              <li key={f.label} className="flex items-start gap-2.5 text-sm">
                <Check size={14} className="text-primary flex-shrink-0 mt-0.5" />
                <span>{f.label}</span>
              </li>
            ))}
          </ul>

          {isPro ? (
            <div className="w-full py-2.5 rounded-xl text-sm font-bold text-center text-white"
              style={{ background:"linear-gradient(135deg,#6c63ff,#22d3ee)" }}>
              Plan activo ✓
            </div>
          ) : (
            <button onClick={handleUpgrade} disabled={upgrading}
              className="w-full py-3 rounded-xl text-sm font-bold text-white flex items-center justify-center gap-2 disabled:opacity-60"
              style={{ background:"linear-gradient(135deg,#6c63ff,#22d3ee)", boxShadow:"0 4px 20px rgba(108,99,255,0.3)" }}>
              {upgrading
                ? <><Loader2 size={14} className="animate-spin" />Procesando...</>
                : <><Sparkles size={14} />Actualizar a Pro <ArrowRight size={13} /></>
              }
            </button>
          )}
        </motion.div>
      </div>

      {/* Stripe coming soon */}
      {!isPro && (
        <motion.div initial={{ opacity:0 }} animate={{ opacity:1 }} transition={{ delay:0.2 }}
          className="p-5 rounded-2xl border border-amber-500/20 bg-amber-500/5 text-center">
          <div className="flex items-center justify-center gap-2 mb-2">
            <Zap size={15} className="text-amber-400" />
            <p className="font-semibold text-sm text-amber-400">Pago con Stripe — Próximamente en v1.4</p>
          </div>
          <p className="text-xs text-muted-foreground">
            Por ahora puedes probar el plan Pro en modo demo usando el botón de arriba.
            La integración con tarjeta de crédito estará disponible en la próxima versión.
          </p>
        </motion.div>
      )}

      {/* Feature comparison teaser */}
      <div className="mt-10 p-6 rounded-2xl border border-border bg-card">
        <h3 className="font-semibold mb-4 text-center">¿Qué desbloqueas con Pro?</h3>
        <div className="grid grid-cols-3 gap-4 text-center text-sm">
          {[
            { icon:"🎨", label:"6 plantillas", desc:"Nexus, Pulse, Slate + las 3 base" },
            { icon:"📸", label:"Foto de perfil", desc:"En tu CV y portafolio" },
            { icon:"∞",  label:"Sin límites", desc:"PDF e IA ilimitados" },
          ].map(f => (
            <div key={f.label} className="p-4 rounded-xl bg-secondary/50">
              <div className="text-2xl mb-2">{f.icon}</div>
              <p className="font-semibold text-xs mb-1">{f.label}</p>
              <p className="text-xs text-muted-foreground">{f.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
