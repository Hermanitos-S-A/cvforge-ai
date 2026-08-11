"use client";
import { useEffect, useState, Suspense } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { CheckCircle, Sparkles, ArrowRight, Loader2 } from "lucide-react";
import Link from "next/link";
import { useAuthStore } from "@/stores/authStore";
import { api } from "@/lib/api";

function SuccessContent() {
  const { user, setUser } = useAuthStore();
  const [loading, setLoading] = useState(true);
  const name = user?.full_name?.split(" ")[0] || "usuario";

  useEffect(() => {
    const verify = async () => {
      try {
        const updated = await api.getMe();
        setUser(updated);
      } catch { }
      finally { setLoading(false); }
    };
    setTimeout(verify, 1500);
  }, []);

  if (loading) return (
    <div className="text-center">
      <Loader2 size={40} className="animate-spin text-primary mx-auto mb-4" />
      <p className="text-muted-foreground text-sm">Verificando tu pago...</p>
    </div>
  );

  return (
    <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }}
      transition={{ type: "spring", stiffness: 200 }} className="text-center max-w-md w-full">
      <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }}
        transition={{ type: "spring", delay: 0.1, stiffness: 200 }}
        className="w-24 h-24 rounded-3xl flex items-center justify-center mx-auto mb-6"
        style={{ background: "linear-gradient(135deg,#6c63ff,#22d3ee)" }}>
        <CheckCircle size={44} className="text-white" />
      </motion.div>
      <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-semibold mb-4"
        style={{ background: "rgba(108,99,255,0.08)", border: "1px solid rgba(108,99,255,0.15)", color: "#6c63ff" }}>
        <Sparkles size={11} /> Plan Pro activado
      </div>
      <h1 className="text-3xl font-extrabold tracking-tight mb-3">¡Bienvenido al Pro, {name}! 🎉</h1>
      <p className="text-muted-foreground text-sm leading-relaxed mb-8 max-w-sm mx-auto">
        Tu pago fue procesado correctamente. Ahora tienes acceso a todas las funciones premium.
      </p>
      <div className="p-5 rounded-2xl border border-primary/20 bg-primary/5 mb-6 text-left">
        <p className="font-semibold text-sm mb-3">✨ Ahora tienes acceso a:</p>
        <ul className="space-y-2">
          {[
            "6 plantillas premium (Nexus, Pulse, Slate + más)",
            "Exportaciones PDF ilimitadas",
            "Optimizaciones con IA sin límite",
            "Foto de perfil en tu CV",
            "Portafolio web personal",
            "Generador de bios para LinkedIn y más",
          ].map(item => (
            <li key={item} className="flex items-center gap-2 text-sm text-muted-foreground">
              <span className="text-primary font-bold">✓</span>{item}
            </li>
          ))}
        </ul>
      </div>
      <div className="flex flex-col sm:flex-row gap-3 justify-center">
        <Link href="/dashboard"
          className="flex items-center justify-center gap-2 px-6 py-3 rounded-xl font-bold text-sm text-white"
          style={{ background: "linear-gradient(135deg,#6c63ff,#22d3ee)" }}>
          Ir al dashboard <ArrowRight size={14} />
        </Link>
        <Link href="/dashboard/templates"
          className="flex items-center justify-center gap-2 px-6 py-3 rounded-xl border border-border text-sm font-medium hover:bg-secondary transition-colors">
          Ver plantillas Pro
        </Link>
      </div>
    </motion.div>
  );
}

export default function PaymentSuccessPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-background px-4">
      <Suspense fallback={
        <div className="text-center">
          <Loader2 size={40} className="animate-spin text-primary mx-auto mb-4" />
          <p className="text-muted-foreground text-sm">Cargando...</p>
        </div>
      }>
        <SuccessContent />
      </Suspense>
    </div>
  );
}