"use client";
import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { Eye, EyeOff, Loader2, AlertCircle, ArrowRight } from "lucide-react";
import { toast } from "sonner";
import { api } from "@/lib/api";
import { useAuthStore } from "@/stores/authStore";

const perks = [
  "Plantillas ATS-optimizadas",
  "IA local con Ollama — gratis",
  "Exportación PDF profesional",
  "Portafolio web automático",
  "Sin límites · Sin suscripción",
];

export default function LoginPage() {
  const router = useRouter();
  const { setTokens, setUser } = useAuthStore();

  const [email,    setEmail]    = useState("");
  const [password, setPassword] = useState("");
  const [showPass, setShowPass] = useState(false);
  const [loading,  setLoading]  = useState(false);
  const [apiError, setApiError] = useState("");
  const [errors,   setErrors]   = useState<Record<string,string>>({});

  const validate = () => {
    const e: Record<string,string> = {};
    if (!email.trim() || !/\S+@\S+\.\S+/.test(email)) e.email    = "Email inválido";
    if (password.length < 8)                           e.password = "Mínimo 8 caracteres";
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSubmit = async (ev: React.FormEvent) => {
    ev.preventDefault();
    setApiError("");
    if (!validate()) return;
    setLoading(true);
    try {
      const res = await api.login(email.trim(), password);
      setTokens(res.access_token, res.refresh_token);
      const user = await api.getMe();
      setUser(user);
      toast.success(`¡Bienvenido de vuelta, ${user.full_name?.split(" ")[0]}!`);
      router.push("/dashboard");
    } catch {
      setApiError("Email o contraseña incorrectos. Verifica tus datos.");
    } finally { setLoading(false); }
  };

  return (
    <div className="min-h-screen flex bg-[#08080f]">
      {/* LEFT */}
      <div className="hidden lg:flex w-72 xl:w-80 flex-shrink-0 flex-col justify-between p-10 relative overflow-hidden"
        style={{background:"linear-gradient(160deg,#0f0c24 0%,#080b1a 100%)"}}>
        <div className="absolute -top-16 -left-16 w-64 h-64 rounded-full pointer-events-none"
          style={{background:"radial-gradient(circle,rgba(108,99,255,0.18) 0%,transparent 70%)"}}/>
        <div className="absolute bottom-10 -right-10 w-48 h-48 rounded-full pointer-events-none"
          style={{background:"radial-gradient(circle,rgba(34,211,238,0.10) 0%,transparent 70%)"}}/>
        <div className="absolute inset-0 opacity-[0.04] pointer-events-none"
          style={{backgroundImage:"linear-gradient(rgba(108,99,255,1) 1px,transparent 1px),linear-gradient(90deg,rgba(108,99,255,1) 1px,transparent 1px)",backgroundSize:"40px 40px"}}/>
        <div className="relative z-10">
          <Link href="/" className="flex items-center gap-2.5">
            <svg width="32" height="32" viewBox="0 0 36 36" fill="none">
              <rect width="36" height="36" rx="9" fill="url(#llg)"/>
              <path d="M11 10H18L14 17H20L11 26H17L22 17H17L21 10" fill="white"/>
              <defs><linearGradient id="llg" x1="0" y1="0" x2="36" y2="36" gradientUnits="userSpaceOnUse"><stop offset="0%" stopColor="#6c63ff"/><stop offset="100%" stopColor="#22d3ee"/></linearGradient></defs>
            </svg>
            <span className="font-bold text-[15px] text-white tracking-tight">CVForge <span style={{color:"#a78bfa"}}>AI</span></span>
          </Link>
        </div>
        <div className="relative z-10">
          <h2 className="text-[26px] font-bold leading-[1.2] tracking-tight mb-6" style={{color:"#e8e8f0"}}>
            CVs que <span style={{color:"#a78bfa"}}>realmente</span><br/>consiguen trabajo
          </h2>
          <ul className="space-y-3">
            {perks.map(p => (
              <li key={p} className="flex items-center gap-3 text-sm" style={{color:"rgba(255,255,255,0.40)"}}>
                <div className="w-1.5 h-1.5 rounded-full flex-shrink-0" style={{background:"linear-gradient(135deg,#6c63ff,#22d3ee)"}}/>
                {p}
              </li>
            ))}
          </ul>
        </div>
        <div className="relative z-10 flex flex-wrap gap-2">
          {["Open Source","MIT","Sin tarjeta"].map(b=>(
            <span key={b} className="text-[10px] px-2.5 py-1 rounded-full"
              style={{border:"0.5px solid rgba(255,255,255,0.08)",color:"rgba(255,255,255,0.25)",background:"rgba(255,255,255,0.03)"}}>
              {b}
            </span>
          ))}
        </div>
        <div className="absolute top-0 right-0 w-px h-full"
          style={{background:"linear-gradient(to bottom,transparent,rgba(108,99,255,0.2),transparent)"}}/>
      </div>

      {/* RIGHT */}
      <div className="flex-1 flex items-center justify-center px-6 py-12 relative overflow-hidden bg-[#0d0d18]">
        <div className="absolute inset-0 pointer-events-none"
          style={{backgroundImage:"linear-gradient(rgba(108,99,255,0.03) 1px,transparent 1px),linear-gradient(90deg,rgba(108,99,255,0.03) 1px,transparent 1px)",backgroundSize:"40px 40px"}}/>
        <div className="absolute top-5 left-5 lg:hidden">
          <Link href="/" className="flex items-center gap-2">
            <svg width="24" height="24" viewBox="0 0 36 36" fill="none"><rect width="36" height="36" rx="9" fill="url(#mlg)"/><path d="M11 10H18L14 17H20L11 26H17L22 17H17L21 10" fill="white"/><defs><linearGradient id="mlg" x1="0" y1="0" x2="36" y2="36" gradientUnits="userSpaceOnUse"><stop offset="0%" stopColor="#6c63ff"/><stop offset="100%" stopColor="#22d3ee"/></linearGradient></defs></svg>
            <span className="font-bold text-sm text-white">CVForge <span style={{color:"#a78bfa"}}>AI</span></span>
          </Link>
        </div>

        <motion.div initial={{opacity:0,y:20}} animate={{opacity:1,y:0}}
          transition={{duration:0.4,ease:[0.16,1,0.3,1]}} className="relative z-10 w-full max-w-sm">
          <h1 className="text-[22px] font-bold tracking-tight mb-1" style={{color:"#e8e8f0"}}>Bienvenido de vuelta</h1>
          <p className="text-sm mb-7" style={{color:"rgba(255,255,255,0.35)"}}>Inicia sesión para continuar</p>

          <AnimatePresence>
            {apiError && (
              <motion.div initial={{opacity:0,height:0}} animate={{opacity:1,height:"auto"}} exit={{opacity:0,height:0}}
                className="flex items-center gap-2.5 p-3 mb-5 rounded-xl text-sm overflow-hidden"
                style={{background:"rgba(239,68,68,0.08)",border:"0.5px solid rgba(239,68,68,0.2)",color:"#f87171"}}>
                <AlertCircle size={14} className="flex-shrink-0"/>{apiError}
              </motion.div>
            )}
          </AnimatePresence>

          <form onSubmit={handleSubmit} className="space-y-4" noValidate>
            <div>
              <label className="block text-[10px] font-semibold uppercase tracking-widest mb-2" style={{color:"rgba(255,255,255,0.28)"}}>Email</label>
              <input
                type="email"
                value={email}
                onChange={e => setEmail(e.target.value)}
                placeholder="tu@email.com"
                autoComplete="email"
                className="w-full px-4 py-3 rounded-xl text-sm outline-none transition-all"
                style={{background:"rgba(255,255,255,0.04)",border:`0.5px solid ${errors.email?"rgba(239,68,68,0.5)":"rgba(255,255,255,0.08)"}`,color:"rgba(255,255,255,0.85)"}}
                onFocus={e=>{e.target.style.borderColor="rgba(108,99,255,0.5)";e.target.style.background="rgba(108,99,255,0.05)"}}
                onBlur={e=>{e.target.style.borderColor=errors.email?"rgba(239,68,68,0.5)":"rgba(255,255,255,0.08)";e.target.style.background="rgba(255,255,255,0.04)"}}
              />
              {errors.email && <p className="text-xs text-red-400 mt-1.5">{errors.email}</p>}
            </div>

            <div>
              <label className="block text-[10px] font-semibold uppercase tracking-widest mb-2" style={{color:"rgba(255,255,255,0.28)"}}>Contraseña</label>
              <div className="relative">
                <input
                  type={showPass?"text":"password"}
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  placeholder="••••••••"
                  autoComplete="current-password"
                  className="w-full px-4 py-3 pr-11 rounded-xl text-sm outline-none transition-all"
                  style={{background:"rgba(255,255,255,0.04)",border:`0.5px solid ${errors.password?"rgba(239,68,68,0.5)":"rgba(255,255,255,0.08)"}`,color:"rgba(255,255,255,0.85)"}}
                  onFocus={e=>{e.target.style.borderColor="rgba(108,99,255,0.5)";e.target.style.background="rgba(108,99,255,0.05)"}}
                  onBlur={e=>{e.target.style.borderColor=errors.password?"rgba(239,68,68,0.5)":"rgba(255,255,255,0.08)";e.target.style.background="rgba(255,255,255,0.04)"}}
                />
                <button type="button" onClick={()=>setShowPass(!showPass)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 transition-colors" style={{color:"rgba(255,255,255,0.2)"}}>
                  {showPass?<EyeOff size={16}/>:<Eye size={16}/>}
                </button>
              </div>
              {errors.password && <p className="text-xs text-red-400 mt-1.5">{errors.password}</p>}
            </div>

            <motion.button type="submit" disabled={loading}
              whileHover={{scale:1.01}} whileTap={{scale:0.99}}
              className="w-full py-3 rounded-xl text-sm font-bold text-white flex items-center justify-center gap-2 disabled:opacity-60 mt-2"
              style={{background:"linear-gradient(135deg,#6c63ff,#22d3ee)",boxShadow:"0 4px 24px rgba(108,99,255,0.3)"}}>
              {loading?<><Loader2 size={15} className="animate-spin"/>Iniciando sesión...</>:<>Iniciar sesión<ArrowRight size={14}/></>}
            </motion.button>
          </form>

          <div className="flex items-center gap-3 my-5">
            <div className="flex-1 h-px" style={{background:"rgba(255,255,255,0.06)"}}/>
            <span className="text-xs" style={{color:"rgba(255,255,255,0.2)"}}>o</span>
            <div className="flex-1 h-px" style={{background:"rgba(255,255,255,0.06)"}}/>
          </div>
          <p className="text-center text-sm" style={{color:"rgba(255,255,255,0.35)"}}>
            ¿No tienes cuenta?{" "}
            <Link href="/register" className="font-semibold hover:underline" style={{color:"#a78bfa"}}>Créala gratis</Link>
          </p>
          <div className="flex items-center justify-center gap-5 mt-6">
            {[{c:"#10b981",l:"100% gratis"},{c:"#6c63ff",l:"IA local"},{c:"#22d3ee",l:"Sin tarjeta"}].map(({c,l})=>(
              <div key={l} className="flex items-center gap-1.5 text-[11px]" style={{color:"rgba(255,255,255,0.22)"}}>
                <span className="w-1.5 h-1.5 rounded-full flex-shrink-0" style={{background:c}}/>{l}
              </div>
            ))}
          </div>
        </motion.div>
      </div>
    </div>
  );
}
