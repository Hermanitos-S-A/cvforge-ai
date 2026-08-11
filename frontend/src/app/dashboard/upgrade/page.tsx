"use client";
import { useState } from "react";
import { motion } from "framer-motion";
import { Check, Sparkles, Loader2, Crown, ArrowRight, Lock, Zap, ExternalLink } from "lucide-react";
import { toast } from "sonner";
import { useAuth } from "@/hooks/useAuth";
import { useAuthStore } from "@/stores/authStore";
import { api } from "@/lib/api";

const FREE_FEATURES = [
  { label: "2 plantillas de CV (Atlas, Nova)", ok: true },
  { label: "3 exportaciones PDF por mes", ok: true },
  { label: "5 optimizaciones con IA por mes", ok: true },
  { label: "Analizador ATS básico", ok: true },
  { label: "Foto de perfil en CV", ok: false },
  { label: "Portafolio web personal", ok: false },
  { label: "Generador de bios", ok: false },
  { label: "6 plantillas premium", ok: false },
  { label: "PDF ilimitados", ok: false },
  { label: "IA ilimitada", ok: false },
];

const PRO_FEATURES = [
  { label: "6 plantillas premium (Atlas, Nova, Zenith, Nexus, Pulse, Slate)" },
  { label: "Exportaciones PDF ilimitadas" },
  { label: "Optimizaciones con IA ilimitadas" },
  { label: "Analizador ATS completo" },
  { label: "Foto de perfil en el CV" },
  { label: "Portafolio web personal" },
  { label: "Generador de bios (LinkedIn, Twitter, GitHub)" },
  { label: "Soporte prioritario" },
  { label: "Acceso anticipado a nuevas funciones" },
];

export default function UpgradePage() {
  useAuth();
  const { user, setUser } = useAuthStore();
  const [billing, setBilling] = useState<"monthly" | "yearly">("monthly");
  const [loading, setLoading] = useState(false);
  const isPro = user?.plan === "pro";

  const price = billing === "monthly" ? "s/9" : "s/79";
  const period = billing === "monthly" ? "mes" : "año";
  const saving = billing === "yearly" ? " — ahorra 26.85%" : "";

  const handleUpgrade = async () => {
    setLoading(true);
    try {
      await (api as any).simulateUpgrade();
      if (user) setUser({ ...user, plan: "pro" });
      toast.success("Plan Pro activado ✨");
    } catch (err: any) {
      toast.error(err?.response?.data?.detail || "Error al activar");
    } finally {
      setLoading(false);
    }
  };

  const handleDowngrade = async () => {
    try {
      await (api as any).downgradePlan();
      if (user) setUser({ ...user, plan: "free" });
      toast.success("Plan cambiado a Free");
    } catch {
      toast.error("Error al cambiar plan");
    }
  };

  return (
    <div className="p-4 sm:p-6 max-w-5xl mx-auto">
      {/* Header */}
      <div className="text-center mb-10">
        <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-semibold mb-4"
          style={{ background: "rgba(108,99,255,0.08)", border: "1px solid rgba(108,99,255,0.15)", color: "#6c63ff" }}>
          <Crown size={12} /> Planes CVForge AI
        </div>
        <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight mb-3">
          {isPro ? "Tu plan actual: Pro ✨" : "Elige tu plan"}
        </h1>
        <p className="text-muted-foreground text-sm max-w-md mx-auto">
          {isPro
            ? "Tienes acceso a todas las funciones premium."
            : "Desbloquea todas las plantillas, exportaciones ilimitadas y funciones de IA."
          }
        </p>
      </div>

      {/* Billing toggle */}
      {!isPro && (
        <div className="flex items-center justify-center mb-8">
          <div className="flex items-center gap-1 p-1 rounded-xl border border-border bg-secondary/50">
            {(["monthly", "yearly"] as const).map(b => (
              <button key={b} onClick={() => setBilling(b)}
                className={"px-4 py-2 rounded-lg text-sm font-medium transition-all " + (
                  billing === b ? "bg-card text-foreground shadow-sm" : "text-muted-foreground"
                )}>
                {b === "monthly" ? "Mensual" : "Anual"}
                {b === "yearly" && (
                  <span className="ml-1.5 text-[10px] font-bold px-1.5 py-0.5 rounded-full bg-emerald-500/15 text-emerald-400">-27%</span>
                )}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Plan cards */}
      <div className="grid md:grid-cols-2 gap-5 mb-8">
        {/* FREE */}
        <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.05 }}
          className={"p-5 sm:p-6 rounded-2xl border-2 " + (!isPro ? "border-primary" : "border-border")}>
          <div className="flex items-start justify-between mb-5">
            <div>
              <h2 className="text-lg font-bold">Free</h2>
              <p className="text-muted-foreground text-sm">Para empezar</p>
            </div>
            <div className="text-right">
              <p className="text-3xl font-bold font-mono">s/0</p>
              <p className="text-xs text-muted-foreground">para siempre</p>
            </div>
          </div>
          <ul className="space-y-2.5 mb-6">
            {FREE_FEATURES.map(f => (
              <li key={f.label} className="flex items-start gap-2.5 text-sm">
                {f.ok
                  ? <Check size={14} className="text-emerald-400 flex-shrink-0 mt-0.5" />
                  : <Lock size={14} className="text-muted-foreground/40 flex-shrink-0 mt-0.5" />
                }
                <span className={f.ok ? "text-foreground" : "text-muted-foreground/50 line-through"}>
                  {f.label}
                </span>
              </li>
            ))}
          </ul>
          {!isPro ? (
            <div className="w-full py-2.5 rounded-xl border border-primary/30 bg-primary/5 text-sm font-medium text-center text-primary">
              Plan actual ✓
            </div>
          ) : (
            <button onClick={handleDowngrade}
              className="w-full py-2.5 rounded-xl border border-border text-sm font-medium hover:bg-secondary transition-colors text-muted-foreground">
              Bajar a Free
            </button>
          )}
        </motion.div>

        {/* PRO */}
        <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}
          className={"p-5 sm:p-6 rounded-2xl border-2 relative overflow-hidden " + (isPro ? "border-primary" : "border-primary/40")}
          style={{ background: isPro ? "rgba(108,99,255,0.04)" : undefined }}>
          <div className="absolute top-4 right-4">
            <span className="text-[10px] font-bold px-2 py-1 rounded-full text-white"
              style={{ background: "linear-gradient(135deg,#6c63ff,#22d3ee)" }}>
              {isPro ? "ACTIVO ✓" : "POPULAR"}
            </span>
          </div>
          <div className="flex items-start justify-between mb-5">
            <div>
              <h2 className="text-lg font-bold flex items-center gap-2">
                Pro <Sparkles size={16} className="text-primary" />
              </h2>
              <p className="text-muted-foreground text-sm">Todo desbloqueado</p>
            </div>
            <div className="text-right">
              <p className="text-3xl font-bold font-mono">{price}</p>
              <p className="text-xs text-muted-foreground">/{period}{saving}</p>
            </div>
          </div>
          <ul className="space-y-2.5 mb-6">
            {PRO_FEATURES.map(f => (
              <li key={f.label} className="flex items-start gap-2.5 text-sm">
                <Check size={14} className="text-primary flex-shrink-0 mt-0.5" />
                <span>{f.label}</span>
              </li>
            ))}
          </ul>

          {isPro ? (
            <div className="w-full py-2.5 rounded-xl text-sm font-bold text-center text-white"
              style={{ background: "linear-gradient(135deg,#6c63ff,#22d3ee)" }}>
              Plan activo ✓
            </div>
          ) : (
            <button onClick={handleUpgrade} disabled={loading}
              className="w-full py-3 rounded-xl text-sm font-bold text-white flex items-center justify-center gap-2 disabled:opacity-60"
              style={{ background: "linear-gradient(135deg,#6c63ff,#22d3ee)", boxShadow: "0 4px 20px rgba(108,99,255,0.3)" }}>
              {loading
                ? <><Loader2 size={14} className="animate-spin" />Activando...</>
                : <><Sparkles size={14} />Activar Pro (Demo) <ArrowRight size={13} /></>
              }
            </button>
          )}
        </motion.div>
      </div>

      {/* Coming soon notice */}
      <div className="p-4 rounded-2xl border border-amber-500/20 bg-amber-500/5 text-center mb-5">
        <div className="flex items-center justify-center gap-2 mb-2">
          <Zap size={14} className="text-amber-400" />
          <p className="text-sm font-semibold text-amber-400">Pasarela de pago — Próximamente</p>
        </div>
        <p className="text-xs text-muted-foreground">
          Por ahora puedes activar el plan Pro en modo demo. La integración de pagos estará disponible en una próxima versión.
        </p>
      </div>

      {/* Feature highlights */}
      <div className="grid grid-cols-3 gap-3">
        {[
          { icon: "🎨", label: "6 plantillas", desc: "Nexus, Pulse, Slate + 3 base" },
          { icon: "📸", label: "Foto de perfil", desc: "En tu CV y portafolio" },
          { icon: "∞", label: "Sin límites", desc: "PDF e IA ilimitados" },
        ].map(f => (
          <div key={f.label} className="p-3 sm:p-4 rounded-xl bg-secondary/50 text-center">
            <div className="text-xl sm:text-2xl mb-2">{f.icon}</div>
            <p className="font-semibold text-xs mb-0.5">{f.label}</p>
            <p className="text-[10px] sm:text-xs text-muted-foreground">{f.desc}</p>
          </div>
        ))}
      </div>
    </div>
  );
}