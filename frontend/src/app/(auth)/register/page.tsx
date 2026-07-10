"use client";
import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { Eye, EyeOff, Loader2, CheckCircle, AlertCircle } from "lucide-react";
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
}).refine((d) => d.password === d.confirm, { message: "Las contraseñas no coinciden", path: ["confirm"] });
type Form = z.infer<typeof schema>;

const perks = [
  "Plantillas ATS-optimizadas incluidas",
  "IA local con Ollama — 100% gratis",
  "Generador de portafolio incluido",
  "Sin tarjeta de crédito requerida",
];

export default function RegisterPage() {
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
      const res = await api.register(data.email, data.password, data.full_name);
      setTokens(res.access_token, res.refresh_token);
      const user = await api.getMe();
      setUser(user);
      toast.success("¡Cuenta creada! Bienvenido a CVForge AI 🎉");
      router.push("/dashboard");
    } catch (err: any) {
      const msg = err?.response?.data?.detail || "Error al crear la cuenta. Intenta de nuevo.";
      setApiError(msg);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-background px-4 py-12">
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[600px] h-[300px] bg-primary/8 rounded-full blur-[100px] pointer-events-none" />

      <div className="w-full max-w-4xl grid lg:grid-cols-2 gap-12 items-center">
        {/* Left — Benefits */}
        <motion.div initial={{ opacity:0, x:-24 }} animate={{ opacity:1, x:0 }} className="hidden lg:block">
          <Link href="/" className="inline-flex items-center gap-2 mb-8">
            <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center text-white font-bold text-sm">⚡</div>
            <span className="font-bold text-lg">CVForge <span className="text-primary">AI</span></span>
          </Link>
          <h2 className="text-3xl font-bold mb-3 leading-tight">
            Empieza a construir CVs que <span className="text-gradient">consiguen resultados</span>
          </h2>
          <p className="text-muted-foreground mb-8">IA local, sin suscripciones, sin límites.</p>
          <div className="space-y-3">
            {perks.map((p) => (
              <div key={p} className="flex items-center gap-3">
                <CheckCircle size={15} className="text-primary flex-shrink-0" />
                <span className="text-sm text-muted-foreground">{p}</span>
              </div>
            ))}
          </div>
        </motion.div>

        {/* Right — Form */}
        <motion.div initial={{ opacity:0, y:24 }} animate={{ opacity:1, y:0 }} transition={{ delay:0.1 }}>
          <div className="p-8 rounded-2xl border border-border bg-card">
            <h1 className="text-xl font-bold mb-1">Crear cuenta</h1>
            <p className="text-muted-foreground text-sm mb-6">Gratis para siempre. Sin tarjeta.</p>

            {apiError && (
              <div className="flex items-center gap-2 p-3 mb-4 rounded-xl bg-destructive/10 border border-destructive/20 text-destructive text-sm">
                <AlertCircle size={15} />{apiError}
              </div>
            )}

            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
              {[
                { name: "full_name", label: "Nombre completo", type: "text", placeholder: "Alex Ramirez" },
                { name: "email",     label: "Email",           type: "email", placeholder: "tu@email.com" },
              ].map(({ name, label, type, placeholder }) => (
                <div key={name}>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-1.5">{label}</label>
                  <input {...register(name as any)} type={type} placeholder={placeholder} className="input-base" />
                  {(errors as any)[name] && <p className="text-xs text-destructive mt-1">{(errors as any)[name]?.message}</p>}
                </div>
              ))}

              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-1.5">Contraseña</label>
                <div className="relative">
                  <input {...register("password")} type={showPass ? "text" : "password"} placeholder="Mín. 8 caracteres" className="input-base pr-10" />
                  <button type="button" onClick={() => setShowPass(!showPass)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground">
                    {showPass ? <EyeOff size={15} /> : <Eye size={15} />}
                  </button>
                </div>
                {errors.password && <p className="text-xs text-destructive mt-1">{errors.password.message}</p>}
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-1.5">Confirmar contraseña</label>
                <input {...register("confirm")} type="password" placeholder="••••••••" className="input-base" />
                {errors.confirm && <p className="text-xs text-destructive mt-1">{errors.confirm.message}</p>}
              </div>

              <button type="submit" disabled={isSubmitting}
                className="w-full py-2.5 rounded-xl bg-primary text-white font-semibold text-sm hover:opacity-90 transition-all disabled:opacity-60 flex items-center justify-center gap-2">
                {isSubmitting ? <><Loader2 size={15} className="animate-spin" />Creando cuenta...</> : "Crear cuenta gratis"}
              </button>
            </form>

            <p className="text-center text-sm text-muted-foreground mt-5">
              ¿Ya tienes cuenta?{" "}
              <Link href="/login" className="text-primary font-medium hover:underline">Inicia sesión</Link>
            </p>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
