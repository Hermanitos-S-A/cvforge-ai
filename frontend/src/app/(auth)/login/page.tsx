"use client";
import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { Eye, EyeOff, Loader2, AlertCircle, ArrowRight } from "lucide-react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { toast } from "sonner";
import { api } from "@/lib/api";
import { useAuthStore } from "@/stores/authStore";

const schema = z.object({
  email: z.string().email("Email inválido"),
  password: z.string().min(8, "Mínimo 8 caracteres"),
});
type Form = z.infer<typeof schema>;

const perks = [
  "Plantillas ATS-optimizadas",
  "IA local con Ollama — gratis",
  "Exportación PDF profesional",
  "Portafolio web automático",
  "Sin límites · Sin suscripción",
];

function Logo() {
  return (
    <Link href="/" className="flex items-center gap-2.5">
      <svg width="32" height="32" viewBox="0 0 36 36" fill="none">
        <rect width="36" height="36" rx="9" fill="url(#lg)"/>
        <path d="M11 10H18L14 17H20L11 26H17L22 17H17L21 10" fill="white"/>
        <defs>
          <linearGradient id="lg" x1="0" y1="0" x2="36" y2="36" gradientUnits="userSpaceOnUse">
            <stop offset="0%" stopColor="#6c63ff"/>
            <stop offset="100%" stopColor="#22d3ee"/>
          </linearGradient>
        </defs>
      </svg>
      <span className="font-bold text-[15px] tracking-tight text-white">
        CVForge <span style={{ color: "#a78bfa" }}>AI</span>
      </span>
    </Link>
  );
}

export default function LoginPage() {
  const router = useRouter();
  const { setTokens, setUser } = useAuthStore();
  const [showPass, setShowPass] = useState(false);
  const [apiError, setApiError] = useState("");

  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm<Form>({
    resolver: zodResolver(schema),
  });

  const onSubmit = async (data: Form) => {
    setApiError("");
    try {
      const res = await api.login(data.email, data.password);
      setTokens(res.access_token, res.refresh_token);
      const user = await api.getMe();
      setUser(user);
      toast.success(`Bienvenido, ${user.full_name?.split(" ")[0]}!`);
      router.push("/dashboard");
    } catch (err: any) {
      setApiError(err?.response?.data?.detail || "Email o contraseña incorrectos");
    }
  };

  return (
    <div className="min-h-screen flex bg-[#08080f]">
      {/* ── LEFT PANEL ─────────────────────────────────── */}
      <div
        className="hidden lg:flex w-72 xl:w-80 flex-shrink-0 flex-col justify-between p-10 relative overflow-hidden"
        style={{ background: "linear-gradient(160deg, #0f0c24 0%, #080b1a 100%)" }}
      >
        {/* Orbs */}
        <div className="absolute -top-16 -left-16 w-64 h-64 rounded-full pointer-events-none"
          style={{ background: "radial-gradient(circle, rgba(108,99,255,0.18) 0%, transparent 70%)" }} />
        <div className="absolute bottom-10 -right-10 w-48 h-48 rounded-full pointer-events-none"
          style={{ background: "radial-gradient(circle, rgba(34,211,238,0.10) 0%, transparent 70%)" }} />

        {/* Grid */}
        <div className="absolute inset-0 pointer-events-none opacity-[0.04]"
          style={{
            backgroundImage: "linear-gradient(rgba(108,99,255,1) 1px, transparent 1px), linear-gradient(90deg, rgba(108,99,255,1) 1px, transparent 1px)",
            backgroundSize: "40px 40px",
          }} />

        {/* Logo */}
        <div className="relative z-10"><Logo /></div>

        {/* Middle */}
        <div className="relative z-10">
          <h2 className="text-[28px] font-bold leading-[1.2] tracking-tight mb-6" style={{ color: "#e8e8f0" }}>
            CVs que{" "}
            <span style={{ color: "#a78bfa" }}>realmente</span>
            <br />consiguen trabajo
          </h2>
          <ul className="space-y-3">
            {perks.map((p) => (
              <li key={p} className="flex items-center gap-3 text-sm" style={{ color: "rgba(255,255,255,0.40)" }}>
                <div className="w-1.5 h-1.5 rounded-full flex-shrink-0"
                  style={{ background: "linear-gradient(135deg,#6c63ff,#22d3ee)" }} />
                {p}
              </li>
            ))}
          </ul>
        </div>

        {/* Footer badges */}
        <div className="relative z-10 flex flex-wrap gap-2">
          {["Open Source", "MIT License", "Sin tarjeta"].map(b => (
            <span key={b} className="text-[10px] px-2.5 py-1 rounded-full"
              style={{ border: "0.5px solid rgba(255,255,255,0.08)", color: "rgba(255,255,255,0.25)", background: "rgba(255,255,255,0.03)" }}>
              {b}
            </span>
          ))}
        </div>

        {/* Accent line */}
        <div className="absolute top-0 right-0 w-px h-full"
          style={{ background: "linear-gradient(to bottom, transparent, rgba(108,99,255,0.2), transparent)" }} />
      </div>

      {/* ── RIGHT PANEL ────────────────────────────────── */}
      <div className="flex-1 flex items-center justify-center px-6 py-12 relative overflow-hidden bg-[#0d0d18]">
        {/* Grid bg */}
        <div className="absolute inset-0 pointer-events-none"
          style={{
            backgroundImage: "linear-gradient(rgba(108,99,255,0.03) 1px, transparent 1px), linear-gradient(90deg, rgba(108,99,255,0.03) 1px, transparent 1px)",
            backgroundSize: "40px 40px",
          }} />

        {/* Mobile logo */}
        <div className="absolute top-6 left-6 lg:hidden"><Logo /></div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
          className="relative z-10 w-full max-w-sm"
        >
          <h1 className="text-[22px] font-bold tracking-tight mb-1" style={{ color: "#e8e8f0" }}>
            Bienvenido de vuelta
          </h1>
          <p className="text-sm mb-7" style={{ color: "rgba(255,255,255,0.35)" }}>
            Inicia sesión para continuar
          </p>

          {/* Error */}
          <AnimatePresence>
            {apiError && (
              <motion.div
                initial={{ opacity: 0, y: -8, height: 0 }}
                animate={{ opacity: 1, y: 0, height: "auto" }}
                exit={{ opacity: 0, height: 0 }}
                className="flex items-center gap-2.5 p-3 mb-5 rounded-xl text-sm overflow-hidden"
                style={{ background: "rgba(239,68,68,0.08)", border: "0.5px solid rgba(239,68,68,0.2)", color: "#f87171" }}
              >
                <AlertCircle size={14} className="flex-shrink-0" />
                {apiError}
              </motion.div>
            )}
          </AnimatePresence>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            {/* Email */}
            <div>
              <label className="block text-[10px] font-semibold uppercase tracking-widest mb-2"
                style={{ color: "rgba(255,255,255,0.28)" }}>
                Email
              </label>
              <input
                {...register("email")}
                type="email"
                placeholder="tucorreo@ingresa.com"
                className="w-full px-4 py-3 rounded-xl text-sm outline-none transition-all"
                style={{
                  background: "rgba(255,255,255,0.04)",
                  border: "0.5px solid rgba(255,255,255,0.08)",
                  color: "rgba(255,255,255,0.8)",
                }}
                onFocus={e => { e.target.style.borderColor = "rgba(108,99,255,0.5)"; e.target.style.background = "rgba(108,99,255,0.05)"; }}
                onBlur={e => { e.target.style.borderColor = "rgba(255,255,255,0.08)"; e.target.style.background = "rgba(255,255,255,0.04)"; }}
              />
              {errors.email && <p className="text-xs text-red-400 mt-1.5">{errors.email.message}</p>}
            </div>

            {/* Password */}
            <div>
              <label className="block text-[10px] font-semibold uppercase tracking-widest mb-2"
                style={{ color: "rgba(255,255,255,0.28)" }}>
                Contraseña
              </label>
              <div className="relative">
                <input
                  {...register("password")}
                  type={showPass ? "text" : "password"}
                  placeholder="••••••••"
                  className="w-full px-4 py-3 pr-11 rounded-xl text-sm outline-none transition-all"
                  style={{
                    background: "rgba(255,255,255,0.04)",
                    border: "0.5px solid rgba(255,255,255,0.08)",
                    color: "rgba(255,255,255,0.8)",
                  }}
                  onFocus={e => { e.target.style.borderColor = "rgba(108,99,255,0.5)"; e.target.style.background = "rgba(108,99,255,0.05)"; }}
                  onBlur={e => { e.target.style.borderColor = "rgba(255,255,255,0.08)"; e.target.style.background = "rgba(255,255,255,0.04)"; }}
                />
                <button type="button" onClick={() => setShowPass(!showPass)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 transition-colors"
                  style={{ color: "rgba(255,255,255,0.2)" }}>
                  {showPass ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
              {errors.password && <p className="text-xs text-red-400 mt-1.5">{errors.password.message}</p>}
            </div>

            {/* Submit */}
            <motion.button
              type="submit"
              disabled={isSubmitting}
              whileHover={{ scale: 1.01 }}
              whileTap={{ scale: 0.99 }}
              className="w-full py-3 rounded-xl text-sm font-bold text-white flex items-center justify-center gap-2 disabled:opacity-60 mt-2"
              style={{
                background: "linear-gradient(135deg, #6c63ff, #22d3ee)",
                boxShadow: "0 4px 24px rgba(108,99,255,0.3)",
              }}
            >
              {isSubmitting
                ? <><Loader2 size={15} className="animate-spin" /> Iniciando sesión...</>
                : <>Iniciar sesión <ArrowRight size={14} /></>
              }
            </motion.button>
          </form>

          {/* Divider */}
          <div className="flex items-center gap-3 my-5">
            <div className="flex-1 h-px" style={{ background: "rgba(255,255,255,0.06)" }} />
            <span className="text-xs" style={{ color: "rgba(255,255,255,0.2)" }}>o</span>
            <div className="flex-1 h-px" style={{ background: "rgba(255,255,255,0.06)" }} />
          </div>

          <p className="text-center text-sm" style={{ color: "rgba(255,255,255,0.35)" }}>
            ¿No tienes cuenta?{" "}
            <Link href="/register" className="font-semibold hover:underline" style={{ color: "#a78bfa" }}>
              Créala gratis
            </Link>
          </p>

          {/* Trust */}
          <div className="flex items-center justify-center gap-5 mt-6">
            {[
              { color: "#10b981", label: "100% gratis" },
              { color: "#6c63ff", label: "IA local" },
              { color: "#22d3ee", label: "Sin tarjeta" },
            ].map(({ color, label }) => (
              <div key={label} className="flex items-center gap-1.5 text-[11px]"
                style={{ color: "rgba(255,255,255,0.22)" }}>
                <span className="w-1.5 h-1.5 rounded-full flex-shrink-0" style={{ background: color }} />
                {label}
              </div>
            ))}
          </div>
        </motion.div>
      </div>
    </div>
  );
}
