"use client";
import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { Eye, EyeOff, Loader2, AlertCircle, ArrowRight, CheckCircle, Sparkles } from "lucide-react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { toast } from "sonner";
import { api } from "@/lib/api";
import { useAuthStore } from "@/stores/authStore";

const schema = z.object({
  full_name: z.string().min(2, "Mínimo 2 caracteres"),
  email: z.string().email("Email inválido"),
  password: z.string().min(8, "Mínimo 8 caracteres"),
  confirm: z.string(),
}).refine(d => d.password === d.confirm, {
  message: "Las contraseñas no coinciden",
  path: ["confirm"],
});
type Form = z.infer<typeof schema>;

const steps = [
  { n: "01", title: "Crea tu cuenta", desc: "Registro en segundos" },
  { n: "02", title: "Completa tu CV", desc: "Agrega tu experiencia" },
  { n: "03", title: "Optimiza con IA", desc: "Mistral 7B local" },
  { n: "04", title: "Exporta y publica", desc: "PDF + portafolio web" },
];

function Logo() {
  return (
    <Link href="/" className="flex items-center gap-2.5">
      <svg width="32" height="32" viewBox="0 0 36 36" fill="none">
        <rect width="36" height="36" rx="9" fill="url(#rgl)"/>
        <path d="M11 10H18L14 17H20L11 26H17L22 17H17L21 10" fill="white"/>
        <defs>
          <linearGradient id="rgl" x1="0" y1="0" x2="36" y2="36" gradientUnits="userSpaceOnUse">
            <stop offset="0%" stopColor="#6c63ff"/>
            <stop offset="100%" stopColor="#22d3ee"/>
          </linearGradient>
        </defs>
      </svg>
      <span className="font-bold text-[15px] tracking-tight" style={{ color: "#e8e8f0" }}>
        CVForge <span style={{ color: "#a78bfa" }}>AI</span>
      </span>
    </Link>
  );
}

function InputField({
  label, error, children,
}: { label: string; error?: string; children: React.ReactNode }) {
  return (
    <div>
      <label className="block text-[10px] font-semibold uppercase tracking-widest mb-2"
        style={{ color: "rgba(255,255,255,0.28)" }}>
        {label}
      </label>
      {children}
      {error && <p className="text-xs text-red-400 mt-1.5">{error}</p>}
    </div>
  );
}

const inputStyle = {
  background: "rgba(255,255,255,0.04)",
  border: "0.5px solid rgba(255,255,255,0.08)",
  color: "rgba(255,255,255,0.8)",
};

function StyledInput({ onFocus: _onFocus, onBlur: _onBlur, ...props }: React.InputHTMLAttributes<HTMLInputElement>) {
  return (
    <input
      {...props}
      className="w-full px-4 py-3 rounded-xl text-sm outline-none transition-all"
      style={inputStyle}
      onFocus={e => {
        e.target.style.borderColor = "rgba(108,99,255,0.5)";
        e.target.style.background = "rgba(108,99,255,0.05)";
      }}
      onBlur={e => {
        e.target.style.borderColor = "rgba(255,255,255,0.08)";
        e.target.style.background = "rgba(255,255,255,0.04)";
      }}
    />
  );
}

export default function RegisterPage() {
  const router = useRouter();
  const { setTokens, setUser } = useAuthStore();
  const [showPass, setShowPass] = useState(false);
  const [apiError, setApiError] = useState("");
  const [success, setSuccess] = useState(false);
  const [createdName, setCreatedName] = useState("");

  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm<Form>({
    resolver: zodResolver(schema),
  });

  const onSubmit = async (data: Form) => {
    setApiError("");
    try {
      const res = await api.register(data.email, data.password, data.full_name);
      setTokens(res.access_token, res.refresh_token);
      const user = await api.getMe();
      setUser(user);
      setCreatedName(data.full_name.split(" ")[0]);
      setSuccess(true);
      setTimeout(() => {
        toast.success("Cuenta creada. ¡Bienvenido a CVForge AI!");
        router.push("/dashboard");
      }, 1600);
    } catch (err: any) {
      const detail = err?.response?.data?.detail;
      setApiError(typeof detail === "string" ? detail : "Error al crear la cuenta. Intenta de nuevo.");
    }
  };

  return (
    <div className="min-h-screen flex bg-[#08080f]">
      {/* ── LEFT — steps panel ─────────────────────────── */}
      <div
        className="hidden lg:flex w-72 xl:w-80 flex-shrink-0 flex-col justify-between p-10 relative overflow-hidden"
        style={{ background: "linear-gradient(160deg, #0f0c24 0%, #080b1a 100%)" }}
      >
        <div className="absolute -top-20 -left-20 w-72 h-72 rounded-full pointer-events-none"
          style={{ background: "radial-gradient(circle, rgba(108,99,255,0.15) 0%, transparent 70%)" }} />
        <div className="absolute -bottom-10 -right-10 w-56 h-56 rounded-full pointer-events-none"
          style={{ background: "radial-gradient(circle, rgba(34,211,238,0.08) 0%, transparent 70%)" }} />
        <div className="absolute inset-0 pointer-events-none opacity-[0.04]"
          style={{
            backgroundImage: "linear-gradient(rgba(108,99,255,1) 1px, transparent 1px), linear-gradient(90deg, rgba(108,99,255,1) 1px, transparent 1px)",
            backgroundSize: "40px 40px",
          }} />

        <div className="relative z-10"><Logo /></div>

        <div className="relative z-10">
          <div className="flex items-center gap-2 mb-2">
            <Sparkles size={14} style={{ color: "#a78bfa" }} />
            <span className="text-xs font-semibold uppercase tracking-widest" style={{ color: "#a78bfa" }}>
              Cómo funciona
            </span>
          </div>
          <h2 className="text-[24px] font-bold leading-[1.25] tracking-tight mb-8" style={{ color: "#e8e8f0" }}>
            Del perfil al<br />
            <span style={{ color: "#a78bfa" }}>trabajo en 4 pasos</span>
          </h2>

          <div className="space-y-5">
            {steps.map((step, i) => (
              <div key={step.n} className="flex items-start gap-3">
                <div className="relative flex-shrink-0">
                  <div className="w-8 h-8 rounded-lg flex items-center justify-center text-xs font-bold"
                    style={{
                      background: i === 0 ? "linear-gradient(135deg,#6c63ff,#22d3ee)" : "rgba(255,255,255,0.05)",
                      color: i === 0 ? "#fff" : "rgba(255,255,255,0.3)",
                      border: i === 0 ? "none" : "0.5px solid rgba(255,255,255,0.08)",
                    }}>
                    {step.n}
                  </div>
                  {i < steps.length - 1 && (
                    <div className="absolute left-1/2 -translate-x-1/2 top-8 w-px h-5"
                      style={{ background: "rgba(255,255,255,0.06)" }} />
                  )}
                </div>
                <div className="pt-0.5">
                  <p className="text-sm font-semibold" style={{ color: i === 0 ? "#e8e8f0" : "rgba(255,255,255,0.35)" }}>
                    {step.title}
                  </p>
                  <p className="text-xs mt-0.5" style={{ color: "rgba(255,255,255,0.22)" }}>
                    {step.desc}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="relative z-10">
          <div className="p-4 rounded-xl" style={{ background: "rgba(108,99,255,0.08)", border: "0.5px solid rgba(108,99,255,0.15)" }}>
            <div className="flex items-start gap-2.5">
              <CheckCircle size={14} className="flex-shrink-0 mt-0.5" style={{ color: "#a78bfa" }} />
              <p className="text-xs leading-relaxed" style={{ color: "rgba(255,255,255,0.40)" }}>
                100% gratis para siempre. Sin tarjeta de crédito. IA corre localmente en tu máquina.
              </p>
            </div>
          </div>
        </div>

        <div className="absolute top-0 right-0 w-px h-full"
          style={{ background: "linear-gradient(to bottom, transparent, rgba(108,99,255,0.2), transparent)" }} />
      </div>

      {/* ── RIGHT — form ───────────────────────────────── */}
      <div className="flex-1 flex items-center justify-center px-6 py-10 relative overflow-hidden bg-[#0d0d18]">
        <div className="absolute inset-0 pointer-events-none"
          style={{
            backgroundImage: "linear-gradient(rgba(108,99,255,0.03) 1px, transparent 1px), linear-gradient(90deg, rgba(108,99,255,0.03) 1px, transparent 1px)",
            backgroundSize: "40px 40px",
          }} />

        <div className="absolute top-6 left-6 lg:hidden"><Logo /></div>

        <AnimatePresence mode="wait">
          {success ? (
            <motion.div
              key="success"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="relative z-10 text-center"
            >
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ type: "spring", delay: 0.1, stiffness: 200 }}
                className="w-20 h-20 rounded-2xl flex items-center justify-center mx-auto mb-6"
                style={{ background: "linear-gradient(135deg, #6c63ff, #22d3ee)" }}
              >
                <CheckCircle size={36} className="text-white" />
              </motion.div>
              <h2 className="text-2xl font-bold mb-2" style={{ color: "#e8e8f0" }}>
                ¡Bienvenido, {createdName}!
              </h2>
              <p className="text-sm" style={{ color: "rgba(255,255,255,0.4)" }}>
                Redirigiendo al dashboard...
              </p>
              <div className="flex justify-center mt-4">
                <Loader2 size={18} className="animate-spin" style={{ color: "#6c63ff" }} />
              </div>
            </motion.div>
          ) : (
            <motion.div
              key="form"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
              className="relative z-10 w-full max-w-sm"
            >
              <h1 className="text-[22px] font-bold tracking-tight mb-1" style={{ color: "#e8e8f0" }}>
                Crea tu cuenta gratis
              </h1>
              <p className="text-sm mb-7" style={{ color: "rgba(255,255,255,0.35)" }}>
                Sin tarjeta · Sin límites · IA local
              </p>

              {/* Error */}
              <AnimatePresence>
                {apiError && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: "auto" }}
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
                <InputField label="Nombre completo" error={errors.full_name?.message}>
                  <StyledInput
                    {...register("full_name")}
                    placeholder="Ingresa su nombre y apellido"
                  />
                </InputField>

                <InputField label="Email" error={errors.email?.message}>
                  <StyledInput
                    {...register("email")}
                    type="email"
                    placeholder="tucorreo@ingresa.com"
                  />
                </InputField>

                <div className="grid grid-cols-2 gap-3">
                  <InputField label="Contraseña" error={errors.password?.message}>
                    <div className="relative">
                      <StyledInput
                        {...register("password")}
                        type={showPass ? "text" : "password"}
                        placeholder="Contraseña de 8 caracteres"
                        style={{ ...inputStyle, paddingRight: "36px" } as React.CSSProperties}
                      />
                      <button type="button" onClick={() => setShowPass(!showPass)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 transition-colors"
                        style={{ color: "rgba(255,255,255,0.2)" }}>
                        {showPass ? <EyeOff size={14} /> : <Eye size={14} />}
                      </button>
                    </div>
                  </InputField>

                  <InputField label="Confirmar" error={errors.confirm?.message}>
                    <StyledInput
                      {...register("confirm")}
                      type="password"
                      placeholder="••••••••"
                    />
                  </InputField>
                </div>

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
                    ? <><Loader2 size={15} className="animate-spin" /> Creando cuenta...</>
                    : <>Crear cuenta gratis <ArrowRight size={14} /></>
                  }
                </motion.button>
              </form>

              <div className="flex items-center gap-3 my-5">
                <div className="flex-1 h-px" style={{ background: "rgba(255,255,255,0.06)" }} />
                <span className="text-xs" style={{ color: "rgba(255,255,255,0.2)" }}>o</span>
                <div className="flex-1 h-px" style={{ background: "rgba(255,255,255,0.06)" }} />
              </div>

              <p className="text-center text-sm" style={{ color: "rgba(255,255,255,0.35)" }}>
                ¿Ya tienes cuenta?{" "}
                <Link href="/login" className="font-semibold hover:underline" style={{ color: "#a78bfa" }}>
                  Inicia sesión
                </Link>
              </p>

              <div className="flex items-center justify-center gap-5 mt-6">
                {[
                  { color: "#10b981", label: "Gratis para siempre" },
                  { color: "#6c63ff", label: "IA 100% local" },
                ].map(({ color, label }) => (
                  <div key={label} className="flex items-center gap-1.5 text-[11px]"
                    style={{ color: "rgba(255,255,255,0.22)" }}>
                    <span className="w-1.5 h-1.5 rounded-full flex-shrink-0" style={{ background: color }} />
                    {label}
                  </div>
                ))}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
