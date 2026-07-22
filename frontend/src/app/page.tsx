"use client";
import Link from "next/link";
import { motion, useInView } from "framer-motion";
import { useRef } from "react";
import { ArrowRight, CheckCircle, FileText, Zap, BarChart3, Globe, Star } from "lucide-react";

function FadeIn({ children, delay = 0, className = "" }: { children: React.ReactNode; delay?: number; className?: string }) {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: "-50px" });
  return (
    <motion.div ref={ref} className={className}
      initial={{ opacity: 0, y: 20 }}
      animate={inView ? { opacity: 1, y: 0 } : {}}
      transition={{ duration: 0.55, delay, ease: [0.16, 1, 0.3, 1] }}>
      {children}
    </motion.div>
  );
}

function Logo({ dark = false }) {
  return (
    <Link href="/" className="flex items-center gap-2.5">
      <svg width="30" height="30" viewBox="0 0 36 36" fill="none">
        <rect width="36" height="36" rx="9" fill="url(#nG)"/>
        <path d="M11 10H18L14 17H20L11 26H17L22 17H17L21 10" fill="white"/>
        <defs>
          <linearGradient id="nG" x1="0" y1="0" x2="36" y2="36" gradientUnits="userSpaceOnUse">
            <stop offset="0%" stopColor="#6c63ff"/>
            <stop offset="100%" stopColor="#22d3ee"/>
          </linearGradient>
        </defs>
      </svg>
      <span className="font-bold text-[15px] tracking-tight" style={{ color: dark ? "#fff" : "#111" }}>
        CVForge <span style={{ color: "#7c6fff" }}>AI</span>
      </span>
    </Link>
  );
}

export default function HomePage() {
  return (
    <div className="min-h-screen bg-white text-gray-900 overflow-x-hidden">

      {/* NAV */}
      <nav className="fixed top-0 left-0 right-0 z-50 bg-white/85 backdrop-blur border-b border-gray-100">
        <div className="max-w-6xl mx-auto px-6 h-14 flex items-center justify-between">
          <Logo />
          <div className="hidden md:flex items-center gap-7 text-sm text-gray-500">
            <Link href="#features" className="hover:text-gray-900 transition-colors">Qué puedo hacer</Link>
            <Link href="#how" className="hover:text-gray-900 transition-colors">Cómo funciona</Link>
            <Link href="#testimonials" className="hover:text-gray-900 transition-colors">Opiniones</Link>
          </div>
          <div className="flex items-center gap-3">
            <Link href="/login" className="text-sm text-gray-500 hover:text-gray-900 transition-colors hidden sm:block">
              Iniciar sesión
            </Link>
            <Link href="/register"
              className="flex items-center gap-1.5 text-sm px-4 py-2 rounded-xl font-semibold text-white"
              style={{ background: "linear-gradient(135deg,#6c63ff,#22d3ee)" }}>
              Empezar gratis <ArrowRight size={13} />
            </Link>
          </div>
        </div>
      </nav>

      {/* HERO */}
      <section className="pt-36 pb-20 px-6 relative" style={{ background: "linear-gradient(180deg,#f5f4ff 0%,#ffffff 100%)" }}>
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[700px] h-[400px] rounded-full pointer-events-none"
          style={{ background: "radial-gradient(ellipse,rgba(108,99,255,0.06) 0%,transparent 70%)" }} />
        <div className="relative max-w-4xl mx-auto text-center">
          <motion.div initial={{ opacity:0, y:12 }} animate={{ opacity:1, y:0 }} transition={{ duration:0.5 }}>
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full text-xs font-semibold mb-8"
              style={{ background:"rgba(108,99,255,0.08)", border:"1px solid rgba(108,99,255,0.15)", color:"#6c63ff" }}>
              <span className="w-1.5 h-1.5 rounded-full bg-violet-500 animate-pulse" />
              Gratis · IA que corre en tu computadora · Sin suscripciones
            </div>
          </motion.div>

          <motion.h1 initial={{ opacity:0, y:20 }} animate={{ opacity:1, y:0 }} transition={{ duration:0.6, delay:0.05 }}
            className="text-5xl md:text-[60px] font-extrabold tracking-tight leading-[1.08] mb-5 text-gray-900">
            Tu próximo trabajo<br />
            <span style={{ background:"linear-gradient(135deg,#6c63ff 0%,#22d3ee 100%)", WebkitBackgroundClip:"text", WebkitTextFillColor:"transparent", backgroundClip:"text" }}>
              empieza con un buen CV
            </span>
          </motion.h1>

          <motion.p initial={{ opacity:0, y:16 }} animate={{ opacity:1, y:0 }} transition={{ duration:0.5, delay:0.1 }}
            className="text-lg text-gray-500 max-w-xl mx-auto mb-9 leading-relaxed">
            Crea un CV profesional, verifica si encaja con la oferta que quieres y descárgalo en PDF. Rápido, sin complicaciones y sin pagar nada.
          </motion.p>

          <motion.div initial={{ opacity:0, y:12 }} animate={{ opacity:1, y:0 }} transition={{ duration:0.5, delay:0.15 }}
            className="flex flex-col sm:flex-row items-center justify-center gap-3 mb-8">
            <Link href="/register"
              className="flex items-center gap-2 px-7 py-3.5 rounded-xl font-bold text-sm text-white"
              style={{ background:"linear-gradient(135deg,#6c63ff,#22d3ee)", boxShadow:"0 8px 28px rgba(108,99,255,0.28)" }}>
              Crear mi CV gratis <ArrowRight size={15} />
            </Link>
            <Link href="/login"
              className="flex items-center gap-2 px-7 py-3.5 rounded-xl border border-gray-200 text-sm font-medium text-gray-600 hover:bg-gray-50 transition-colors bg-white">
              Ya tengo cuenta
            </Link>
          </motion.div>

          <motion.div initial={{ opacity:0 }} animate={{ opacity:1 }} transition={{ delay:0.3 }}
            className="flex items-center justify-center gap-6 text-xs text-gray-400 flex-wrap">
            {["Sin tarjeta de crédito","Tus datos son solo tuyos","Listo en menos de 10 minutos"].map(t => (
              <span key={t} className="flex items-center gap-1.5">
                <CheckCircle size={12} className="text-violet-500" />{t}
              </span>
            ))}
          </motion.div>
        </div>

        {/* Mockup */}
        <motion.div initial={{ opacity:0, y:40, scale:0.97 }} animate={{ opacity:1, y:0, scale:1 }}
          transition={{ duration:0.8, delay:0.35 }}
          className="max-w-4xl mx-auto mt-16">
          <div className="rounded-2xl overflow-hidden border border-gray-200"
            style={{ boxShadow:"0 24px 64px rgba(0,0,0,0.08),0 0 0 1px rgba(0,0,0,0.04)" }}>
            <div className="flex items-center gap-2 px-4 py-3 bg-gray-50 border-b border-gray-200">
              <div className="w-3 h-3 rounded-full bg-red-400/60" />
              <div className="w-3 h-3 rounded-full bg-amber-400/60" />
              <div className="w-3 h-3 rounded-full bg-green-400/60" />
              <div className="flex-1 mx-4 bg-white rounded-full px-3 py-1 text-[11px] text-gray-400 font-mono border border-gray-200">
                cvforge.ai/dashboard
              </div>
            </div>
            <div className="bg-[#0a0a0f] p-5 grid grid-cols-4 gap-3 min-h-[240px]">
              <div className="col-span-1 bg-[#111118] rounded-xl border border-[#1e1e2e] p-3 flex flex-col gap-1.5">
                <div className="flex items-center gap-2 pb-2 border-b border-[#1e1e2e] mb-1">
                  <div className="w-5 h-5 rounded-md" style={{ background:"linear-gradient(135deg,#6c63ff,#22d3ee)" }}>
                    <svg viewBox="0 0 36 36" fill="none" className="w-full h-full p-1"><path d="M11 10H18L14 17H20L11 26H17L22 17H17L21 10" fill="white"/></svg>
                  </div>
                  <span className="text-[10px] font-bold text-white">CVForge AI</span>
                </div>
                {["Mi panel","Mi CV","Mejorar con IA","Analizar oferta","Mi web"].map((item,i) => (
                  <div key={item} className={"text-[10px] px-2 py-1.5 rounded-lg " + (i===0?"bg-violet-600/15 text-violet-300":"text-[#555]")}>{item}</div>
                ))}
              </div>
              <div className="col-span-3 flex flex-col gap-3">
                <div className="grid grid-cols-4 gap-2">
                  {[
                    { label:"Mi CV",     val:"Listo",   color:"#10b981" },
                    { label:"Puntaje",   val:"87%",     color:"#a78bfa" },
                    { label:"Secciones", val:"5 de 5",  color:"#22d3ee" },
                    { label:"PDF",       val:"Descarg.", color:"#f59e0b" },
                  ].map(s => (
                    <div key={s.label} className="bg-[#111118] border border-[#1e1e2e] rounded-xl p-3">
                      <div className="text-[9px] text-[#444] uppercase tracking-wider mb-1">{s.label}</div>
                      <div className="text-xs font-bold font-mono" style={{ color:s.color }}>{s.val}</div>
                    </div>
                  ))}
                </div>
                <div className="grid grid-cols-2 gap-2 flex-1">
                  <div className="bg-[#111118] border border-[#1e1e2e] rounded-xl p-3">
                    <div className="text-[9px] text-[#444] mb-2">Compatibilidad con la oferta</div>
                    <div className="flex items-center gap-3">
                      <svg width="44" height="44" viewBox="0 0 48 48">
                        <circle cx="24" cy="24" r="18" fill="none" stroke="#1e1e2e" strokeWidth="5"/>
                        <circle cx="24" cy="24" r="18" fill="none" stroke="url(#pg)" strokeWidth="5"
                          strokeLinecap="round" strokeDasharray="113" strokeDashoffset="15"
                          transform="rotate(-90 24 24)"/>
                        <defs><linearGradient id="pg"><stop offset="0%" stopColor="#6c63ff"/><stop offset="100%" stopColor="#22d3ee"/></linearGradient></defs>
                        <text x="24" y="28" textAnchor="middle" fill="#e8e8f0" fontSize="11" fontWeight="bold">87</text>
                      </svg>
                      <div className="flex flex-col gap-1 flex-1">
                        {[["Palabras clave","88%","#10b981"],["Impacto","74%","#f59e0b"],["Formato","100%","#a78bfa"]].map(([k,v,c]) => (
                          <div key={k as string} className="flex items-center gap-1.5">
                            <span className="text-[8px] text-[#444] w-20">{k}</span>
                            <div className="flex-1 h-1 bg-[#1e1e2e] rounded-full">
                              <div className="h-full rounded-full" style={{ width:v as string, background:c as string }} />
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                  <div className="bg-[#111118] border border-[#1e1e2e] rounded-xl p-3">
                    <div className="text-[9px] text-[#444] mb-2">Tu CV completado</div>
                    <div className="space-y-1.5">
                      {[["Nombre","100%"],["Experiencia","100%"],["Skills","100%"],["Proyectos","80%"]].map(([n,p]) => (
                        <div key={n} className="flex items-center gap-2">
                          <span className="text-[8px] text-[#555] w-16">{n}</span>
                          <div className="flex-1 h-1 bg-[#1e1e2e] rounded-full">
                            <div className="h-full rounded-full" style={{ width:p, background:"linear-gradient(90deg,#6c63ff,#22d3ee)" }} />
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </motion.div>
      </section>

      {/* FEATURES */}
      <section id="features" className="py-24 px-6 bg-white">
        <div className="max-w-5xl mx-auto">
          <FadeIn className="text-center mb-14">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-semibold mb-4"
              style={{ background:"rgba(108,99,255,0.07)", border:"1px solid rgba(108,99,255,0.12)", color:"#6c63ff" }}>
              Qué puedo hacer con CVForge AI
            </div>
            <h2 className="text-3xl md:text-4xl font-extrabold tracking-tight mb-3 text-gray-900">
              Todo lo que necesitas para conseguir esa entrevista
            </h2>
            <p className="text-gray-500 max-w-lg mx-auto text-sm leading-relaxed">
              No hace falta ser experto. Ingresa tu información, la plataforma hace el resto.
            </p>
          </FadeIn>
          <div className="grid md:grid-cols-2 gap-5">
            {[
              { icon:FileText, color:"#6c63ff", bg:"rgba(108,99,255,0.07)", title:"Crea tu CV en minutos", desc:"Rellena tu experiencia, estudios y habilidades desde un formulario simple. Sin hojas en blanco, sin perder horas dándole formato." },
              { icon:Zap,      color:"#22d3ee", bg:"rgba(34,211,238,0.07)", title:"Mejora tus textos con IA", desc:"Escribe algo simple y la IA lo convierte en una frase profesional e impactante. Como tener un coach de carrera disponible siempre." },
              { icon:BarChart3,color:"#10b981", bg:"rgba(16,185,129,0.07)", title:"Verifica si tu CV encaja con la oferta", desc:"Pega la descripción del trabajo y ve qué palabras clave tienes y cuáles te faltan. Aumenta tus probabilidades de pasar el filtro." },
              { icon:Globe,    color:"#f59e0b", bg:"rgba(245,158,11,0.07)", title:"Genera tu página personal", desc:"Con un clic, tu CV se convierte en una web que puedes compartir con reclutadores o poner en LinkedIn como tu portafolio." },
            ].map((feat, i) => (
              <FadeIn key={feat.title} delay={i*0.08}>
                <div className="p-6 rounded-2xl border border-gray-100 hover:border-gray-200 hover:shadow-sm transition-all bg-white h-full">
                  <div className="w-10 h-10 rounded-xl flex items-center justify-center mb-4" style={{ background:feat.bg }}>
                    <feat.icon size={19} style={{ color:feat.color }} />
                  </div>
                  <h3 className="font-bold text-[15px] mb-2 text-gray-900">{feat.title}</h3>
                  <p className="text-sm text-gray-500 leading-relaxed">{feat.desc}</p>
                </div>
              </FadeIn>
            ))}
          </div>
        </div>
      </section>

      {/* HOW */}
      <section id="how" className="py-24 px-6" style={{ background:"#f9f9fc" }}>
        <div className="max-w-4xl mx-auto">
          <FadeIn className="text-center mb-14">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-semibold mb-4"
              style={{ background:"rgba(108,99,255,0.07)", border:"1px solid rgba(108,99,255,0.12)", color:"#6c63ff" }}>
              Cómo funciona
            </div>
            <h2 className="text-3xl md:text-4xl font-extrabold tracking-tight mb-3 text-gray-900">
              De cero a tu CV listo en 10 minutos
            </h2>
            <p className="text-gray-500 text-sm max-w-md mx-auto">Sin curva de aprendizaje. Entra, llena tu información y listo.</p>
          </FadeIn>
          <div className="grid md:grid-cols-4 gap-6">
            {[
              { n:"1", title:"Crea tu cuenta",      desc:"Registro en segundos, sin tarjeta." },
              { n:"2", title:"Completa tu perfil",  desc:"Tu experiencia, estudios y habilidades." },
              { n:"3", title:"Revisa y mejora",      desc:"La IA te ayuda a mejorar cada frase." },
              { n:"4", title:"Descarga y comparte", desc:"PDF listo y web personal publicada." },
            ].map((step, i) => (
              <FadeIn key={step.n} delay={i*0.1}>
                <div className="text-center">
                  <div className="w-12 h-12 rounded-2xl flex items-center justify-center mx-auto mb-4 text-white font-bold text-lg"
                    style={{ background:"linear-gradient(135deg,#6c63ff,#22d3ee)" }}>
                    {step.n}
                  </div>
                  <h3 className="font-bold text-sm mb-1 text-gray-900">{step.title}</h3>
                  <p className="text-xs text-gray-500 leading-relaxed">{step.desc}</p>
                </div>
              </FadeIn>
            ))}
          </div>
        </div>
      </section>

      {/* TESTIMONIALS */}
      <section id="testimonials" className="py-24 px-6 bg-white">
        <div className="max-w-5xl mx-auto">
          <FadeIn className="text-center mb-12">
            <h2 className="text-3xl font-extrabold tracking-tight mb-2 text-gray-900">Lo que dicen quienes ya lo usan</h2>
            <p className="text-gray-500 text-sm">Personas reales, resultados reales.</p>
          </FadeIn>
          <div className="grid md:grid-cols-3 gap-5">
            {[
              { name:"Mariana R.", role:"Diseñadora UX", text:"Lo usé un domingo por la tarde. El lunes envié el CV y el miércoles ya tenía entrevista. No puedo creer lo fácil que fue.", stars:5 },
              { name:"Carlos M.", role:"Desarrollador Frontend", text:"La parte de compatibilidad con la oferta fue clave. Me di cuenta que me faltaban palabras importantes y las agregué.", stars:5 },
              { name:"Lucía T.", role:"Recién graduada", text:"No sabía cómo escribir mi experiencia de forma profesional. La IA lo hizo sonar increíble sin exagerar nada.", stars:5 },
            ].map((t, i) => (
              <FadeIn key={t.name} delay={i*0.08}>
                <div className="p-6 rounded-2xl border border-gray-100 bg-white">
                  <div className="flex gap-0.5 mb-4">
                    {Array.from({ length:t.stars }).map((_,i) => <Star key={i} size={13} fill="#f59e0b" className="text-amber-400" />)}
                  </div>
                  <p className="text-sm text-gray-600 leading-relaxed mb-5">"{t.text}"</p>
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full flex items-center justify-center text-white text-xs font-bold"
                      style={{ background:"linear-gradient(135deg,#6c63ff,#22d3ee)" }}>
                      {t.name[0]}
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-gray-900">{t.name}</p>
                      <p className="text-xs text-gray-400">{t.role}</p>
                    </div>
                  </div>
                </div>
              </FadeIn>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-24 px-6" style={{ background:"linear-gradient(135deg,#f5f4ff 0%,#f0fdfe 100%)" }}>
        <div className="max-w-3xl mx-auto text-center">
          <FadeIn>
            <svg width="48" height="48" viewBox="0 0 36 36" fill="none" className="mx-auto mb-6">
              <rect width="36" height="36" rx="10" fill="url(#cG)"/>
              <path d="M11 10H18L14 17H20L11 26H17L22 17H17L21 10" fill="white"/>
              <defs><linearGradient id="cG" x1="0" y1="0" x2="36" y2="36" gradientUnits="userSpaceOnUse"><stop offset="0%" stopColor="#6c63ff"/><stop offset="100%" stopColor="#22d3ee"/></linearGradient></defs>
            </svg>
            <h2 className="text-3xl md:text-4xl font-extrabold tracking-tight mb-4 text-gray-900">
              ¿Listo para conseguir esa entrevista?
            </h2>
            <p className="text-gray-500 mb-8 text-sm leading-relaxed max-w-md mx-auto">
              Tu CV puede estar listo hoy, en menos de 10 minutos y sin pagar nada.
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-3 mb-6">
              <Link href="/register"
                className="flex items-center gap-2 px-8 py-3.5 rounded-xl font-bold text-sm text-white"
                style={{ background:"linear-gradient(135deg,#6c63ff,#22d3ee)", boxShadow:"0 8px 28px rgba(108,99,255,0.25)" }}>
                Crear mi CV gratis <ArrowRight size={15} />
              </Link>
              <Link href="/login"
                className="flex items-center gap-2 px-8 py-3.5 rounded-xl border border-gray-200 text-sm font-medium text-gray-600 bg-white hover:bg-gray-50">
                Ya tengo cuenta
              </Link>
            </div>
            <div className="flex items-center justify-center gap-6 text-xs text-gray-400 flex-wrap">
              {["Sin tarjeta","Tus datos son privados","Cancela cuando quieras"].map(t => (
                <span key={t} className="flex items-center gap-1.5">
                  <CheckCircle size={11} className="text-violet-400" />{t}
                </span>
              ))}
            </div>
          </FadeIn>
        </div>
      </section>

      {/* FOOTER */}
      <footer className="border-t border-gray-100 py-8 px-6 bg-white">
        <div className="max-w-5xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
          <Logo />
          <div className="flex items-center gap-6 text-xs text-gray-400">
            <span>Gratuito para siempre</span>
            <span>·</span>
            <span>Código abierto</span>
            <span>·</span>
            <a href="https://github.com/Hermanitos-S-A/cvforge-ai" target="_blank" className="text-violet-500 hover:underline">GitHub</a>
          </div>
          <p className="text-xs text-gray-400">© {new Date().getFullYear()} CVForge AI</p>
        </div>
      </footer>
    </div>
  );
}
