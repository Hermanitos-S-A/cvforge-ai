"use client";
import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { Eye, EyeOff, Loader2, AlertCircle } from "lucide-react";
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
      // Fetch real user profile
      const user = await api.getMe();
      setUser(user);
      toast.success(`¡Bienvenido de vuelta, ${user.full_name}!`);
      router.push("/dashboard");
    } catch (err: any) {
      const msg = err?.response?.data?.detail || "Email o contraseña incorrectos";
      setApiError(msg);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-background px-4">
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[500px] h-[300px] bg-primary/8 rounded-full blur-[100px] pointer-events-none" />

      <motion.div initial={{ opacity:0, y:24 }} animate={{ opacity:1, y:0 }} transition={{ duration:0.5 }} className="w-full max-w-md">
        {/* Logo */}
        <div className="text-center mb-8">
          <Link href="/" className="inline-flex items-center gap-2 mb-6">
            <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center text-white font-bold text-sm">⚡</div>
            <span className="font-bold text-lg">CVForge <span className="text-primary">AI</span></span>
          </Link>
          <h1 className="text-2xl font-bold">Bienvenido de vuelta</h1>
          <p className="text-muted-foreground text-sm mt-1">Inicia sesión en tu cuenta</p>
        </div>

        <div className="p-8 rounded-2xl border border-border bg-card">
          {apiError && (
            <div className="flex items-center gap-2 p-3 mb-4 rounded-xl bg-destructive/10 border border-destructive/20 text-destructive text-sm">
              <AlertCircle size={15} />
              {apiError}
            </div>
          )}

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-1.5">Email</label>
              <input {...register("email")} type="email" placeholder="tu@email.com" className="input-base" />
              {errors.email && <p className="text-xs text-destructive mt-1">{errors.email.message}</p>}
            </div>

            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-1.5">Contraseña</label>
              <div className="relative">
                <input {...register("password")} type={showPass ? "text" : "password"} placeholder="••••••••" className="input-base pr-10" />
                <button type="button" onClick={() => setShowPass(!showPass)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors">
                  {showPass ? <EyeOff size={15} /> : <Eye size={15} />}
                </button>
              </div>
              {errors.password && <p className="text-xs text-destructive mt-1">{errors.password.message}</p>}
            </div>

            <button type="submit" disabled={isSubmitting}
              className="w-full py-2.5 rounded-xl bg-primary text-white font-semibold text-sm hover:opacity-90 transition-all disabled:opacity-60 flex items-center justify-center gap-2">
              {isSubmitting ? <><Loader2 size={15} className="animate-spin" /> Iniciando sesión...</> : "Iniciar sesión"}
            </button>
          </form>

          <p className="text-center text-sm text-muted-foreground mt-5">
            ¿No tienes cuenta?{" "}
            <Link href="/register" className="text-primary font-medium hover:underline">Créala gratis</Link>
          </p>
        </div>
      </motion.div>
    </div>
  );
}
