"use client";
import { motion } from "framer-motion";
import Link from "next/link";
import { Lock, Sparkles, ArrowRight } from "lucide-react";
import { useAuthStore } from "@/stores/authStore";

interface PlanGateProps {
  feature: string;
  description?: string;
  children: React.ReactNode;
}

/**
 * Envuelve funciones Pro — si el usuario es Free, muestra un overlay de upgrade.
 * Uso: <PlanGate feature="Foto de perfil"><AvatarUploader /></PlanGate>
 */
export function PlanGate({ feature, description, children }: PlanGateProps) {
  const { user } = useAuthStore();
  const isPro = user?.plan === "pro";

  if (isPro) return <>{children}</>;

  return (
    <div className="relative">
      {/* Blurred content */}
      <div className="pointer-events-none select-none opacity-30 blur-sm">
        {children}
      </div>

      {/* Overlay */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="absolute inset-0 flex items-center justify-center rounded-2xl"
        style={{ background: "rgba(13,13,24,0.85)", backdropFilter: "blur(2px)" }}
      >
        <div className="text-center px-6 py-5 max-w-xs">
          <div className="w-12 h-12 rounded-2xl flex items-center justify-center mx-auto mb-4"
            style={{ background: "linear-gradient(135deg,#6c63ff,#22d3ee)" }}>
            <Lock size={20} className="text-white" />
          </div>
          <p className="font-bold text-white text-sm mb-1">{feature}</p>
          {description && (
            <p className="text-xs mb-4" style={{ color: "rgba(255,255,255,0.5)" }}>
              {description}
            </p>
          )}
          <Link href="/dashboard/upgrade"
            className="inline-flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold text-white"
            style={{ background: "linear-gradient(135deg,#6c63ff,#22d3ee)" }}>
            <Sparkles size={12} /> Actualizar a Pro <ArrowRight size={11} />
          </Link>
        </div>
      </motion.div>
    </div>
  );
}

/**
 * Botón/link que muestra lock si no es Pro.
 */
export function ProBadge({ className = "" }: { className?: string }) {
  return (
    <span className={"inline-flex items-center gap-1 text-[9px] font-bold px-1.5 py-0.5 rounded-full " + className}
      style={{ background: "linear-gradient(135deg,#6c63ff,#22d3ee)", color: "#fff" }}>
      <Sparkles size={9} /> PRO
    </span>
  );
}

/**
 * Hook para verificar si una feature está disponible.
 */
export function usePlan() {
  const { user } = useAuthStore();
  const isPro = user?.plan === "pro";

  const can = (feature: "avatar" | "portfolio" | "bio" | "extra_templates" | "unlimited_ai") => {
    if (isPro) return true;
    // Free tier never gets these
    return false;
  };

  return { isPro, plan: user?.plan || "free", can };
}
