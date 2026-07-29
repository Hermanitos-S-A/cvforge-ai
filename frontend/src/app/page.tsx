"use client";
import Link from "next/link";
import { motion, useInView } from "framer-motion";
import { useRef } from "react";
import { ArrowRight, CheckCircle, Star } from "lucide-react";
import { useLang } from "@/context/LanguageContext";
import { LanguageSwitcher } from "@/components/layout/LanguageSwitcher";

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

function Logo() {
  return (
    <Link href="/" className="flex items-center gap-2.5">
      <svg width="30" height="30" viewBox="0 0 36 36" fill="none">
        <rect width="36" height="36" rx="9" fill="url(#pG)"/>
        <path d="M11 10H18L14 17H20L11 26H17L22 17H17L21 10" fill="white"/>
        <defs>
          <linearGradient id="pG" x1="0" y1="0" x2="36" y2="36" gradientUnits="userSpaceOnUse">
            <stop offset="0%" stopColor="#6c63ff"/>
            <stop offset="100%" stopColor="#22d3ee"/>
          </linearGradient>
        </defs>
      </svg>
      <span className="font-bold text-[15px] tracking-tight" style={{ color:"#111" }}>
        CVForge <span style={{ color:"#7c6fff" }}>AI</span>
      </span>
    </Link>
  );
}

export default function HomePage() {
  const { t, tArr } = useLang();
  const features = tArr("features.items");
  const steps    = tArr("how.steps");
  const reviews  = tArr("reviews.items");

  return (
    <div className="min-h-screen bg-white text-gray-900 overflow-x-hidden">
      {/* NAV */}
      <nav className="fixed top-0 left-0 right-0 z-50 bg-white/90 backdrop-blur border-b border-gray-200">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 h-14 flex items-center justify-between">
          <Logo />
          <div className="hidden md:flex items-center gap-6 text-sm text-gray-500">
            <Link href="#features" className="hover:text-gray-900 transition-colors">{t("nav.features")}</Link>
            <Link href="#how" className="hover:text-gray-900 transition-colors">{t("nav.how")}</Link>
            <Link href="#testimonials" className="hover:text-gray-900 transition-colors">{t("nav.testimonials")}</Link>
          </div>
          <div className="flex items-center gap-2 sm:gap-3">
            <LanguageSwitcher variant="light" />
            <Link href="/login" className="text-sm text-gray-500 hover:text-gray-900 hidden sm:block">{t("nav.login")}</Link>
            <Link href="/register"
              className="flex items-center gap-1.5 text-xs sm:text-sm px-3 sm:px-4 py-2 rounded-xl font-semibold text-white whitespace-nowrap"
              style={{ background:"linear-gradient(135deg,#6c63ff,#22d3ee)" }}>
              {t("nav.start")} <ArrowRight size={13} />
            </Link>
          </div>
        </div>
      </nav>

      {/* HERO — fondo #808080 gris */}
      <section className="pt-36 pb-20 px-4 sm:px-6 relative" style={{ background:"linear-gradient(180deg, #808080 0%, #6b6b6b 40%, #ffffff 100%)" }}>
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[700px] h-[400px] rounded-full pointer-events-none"
          style={{ background:"radial-gradient(ellipse,rgba(108,99,255,0.15) 0%,transparent 70%)" }} />
        <div className="relative max-w-4xl mx-auto text-center">
          <motion.div initial={{ opacity:0, y:12 }} animate={{ opacity:1, y:0 }} transition={{ duration:0.5 }}>
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full text-xs font-semibold mb-8"
              style={{ background:"rgba(255,255,255,0.20)", border:"1px solid rgba(255,255,255,0.35)", color:"#fff" }}>
              <span className="w-1.5 h-1.5 rounded-full bg-white animate-pulse" />
              {t("hero.badge")}
            </div>
          </motion.div>

          <motion.h1 initial={{ opacity:0, y:20 }} animate={{ opacity:1, y:0 }} transition={{ duration:0.6, delay:0.05 }}
            className="text-4xl sm:text-5xl md:text-[60px] font-extrabold tracking-tight leading-[1.08] mb-5 text-white">
            {t("hero.title1")}<br />
            <span style={{ background:"linear-gradient(135deg,#c4b5fd 0%,#a78bfa 50%,#67e8f9 100%)", WebkitBackgroundClip:"text", WebkitTextFillColor:"transparent", backgroundClip:"text" }}>
              {t("hero.title2")}
            </span>
          </motion.h1>

          <motion.p initial={{ opacity:0, y:16 }} animate={{ opacity:1, y:0 }} transition={{ duration:0.5, delay:0.1 }}
            className="text-base sm:text-lg max-w-xl mx-auto mb-9 leading-relaxed" style={{ color:"rgba(255,255,255,0.85)" }}>
            {t("hero.subtitle")}
          </motion.p>

          <motion.div initial={{ opacity:0, y:12 }} animate={{ opacity:1, y:0 }} transition={{ duration:0.5, delay:0.15 }}
            className="flex flex-col sm:flex-row items-center justify-center gap-3 mb-8">
            <Link href="/register"
              className="flex items-center gap-2 px-6 sm:px-7 py-3.5 rounded-xl font-bold text-sm bg-white"
              style={{ color:"#6c63ff", boxShadow:"0 8px 28px rgba(0,0,0,0.2)" }}>
              {t("hero.cta_primary")} <ArrowRight size={15} />
            </Link>
            <Link href="/login"
              className="flex items-center gap-2 px-6 sm:px-7 py-3.5 rounded-xl border text-sm font-medium"
              style={{ borderColor:"rgba(255,255,255,0.4)", color:"#fff", background:"rgba(255,255,255,0.12)" }}>
              {t("hero.cta_secondary")}
            </Link>
          </motion.div>

          <motion.div initial={{ opacity:0 }} animate={{ opacity:1 }} transition={{ delay:0.3 }}
            className="flex items-center justify-center gap-4 sm:gap-6 text-xs flex-wrap" style={{ color:"rgba(255,255,255,0.75)" }}>
            {[t("hero.trust1"), t("hero.trust2"), t("hero.trust3")].map((txt, i) => (
              <span key={i} className="flex items-center gap-1.5">
                <CheckCircle size={12} className="text-white" />{txt}
              </span>
            ))}
          </motion.div>
        </div>

        {/* Mockup */}
        <motion.div initial={{ opacity:0, y:40, scale:0.97 }} animate={{ opacity:1, y:0, scale:1 }}
          transition={{ duration:0.8, delay:0.35 }} className="max-w-4xl mx-auto mt-16">
          <div className="rounded-2xl overflow-hidden border border-white/20"
            style={{ boxShadow:"0 32px 80px rgba(0,0,0,0.25), 0 0 0 1px rgba(255,255,255,0.15)" }}>
            <div className="flex items-center gap-2 px-4 py-3 border-b" style={{ background:"#1a1a24", borderColor:"rgba(255,255,255,0.08)" }}>
              <div className="w-3 h-3 rounded-full bg-red-400/70" />
              <div className="w-3 h-3 rounded-full bg-amber-400/70" />
              <div className="w-3 h-3 rounded-full bg-green-400/70" />
              <div className="flex-1 mx-4 rounded-full px-3 py-1 text-[11px] font-mono" style={{ background:"rgba(255,255,255,0.06)", color:"rgba(255,255,255,0.3)" }}>
                cvforge.ai/dashboard
              </div>
            </div>
            <div className="bg-[#0a0a0f] p-4 sm:p-5 grid grid-cols-4 gap-2 sm:gap-3 min-h-[200px]">
              <div className="col-span-1 bg-[#111118] rounded-xl border border-[#1e1e2e] p-2 sm:p-3 flex flex-col gap-1">
                <div className="flex items-center gap-1.5 pb-2 border-b border-[#1e1e2e] mb-1">
                  <div className="w-4 h-4 rounded-md flex-shrink-0" style={{ background:"linear-gradient(135deg,#6c63ff,#22d3ee)" }}>
                    <svg viewBox="0 0 36 36" fill="none" className="w-full h-full p-0.5"><path d="M11 10H18L14 17H20L11 26H17L22 17H17L21 10" fill="white"/></svg>
                  </div>
                  <span className="text-[9px] font-bold text-white truncate">CVForge AI</span>
                </div>
                {["Mi panel","Mi CV","IA","ATS","Mi web"].map((item,i) => (
                  <div key={item} className={"text-[9px] px-1.5 py-1 rounded " + (i===0?"bg-violet-600/15 text-violet-300":"text-[#555]")}>{item}</div>
                ))}
              </div>
              <div className="col-span-3 flex flex-col gap-2">
                <div className="grid grid-cols-4 gap-1.5 sm:gap-2">
                  {[{l:"CV",v:"Listo",c:"#10b981"},{l:"Score",v:"87%",c:"#a78bfa"},{l:"Secc.",v:"5/5",c:"#22d3ee"},{l:"PDF",v:"✓",c:"#f59e0b"}].map(s=>(
                    <div key={s.l} className="bg-[#111118] border border-[#1e1e2e] rounded-xl p-2">
                      <div className="text-[8px] text-[#444] mb-1">{s.l}</div>
                      <div className="text-xs font-bold font-mono" style={{color:s.c}}>{s.v}</div>
                    </div>
                  ))}
                </div>
                <div className="grid grid-cols-2 gap-1.5 sm:gap-2 flex-1">
                  <div className="bg-[#111118] border border-[#1e1e2e] rounded-xl p-2 sm:p-3">
                    <div className="text-[8px] text-[#444] mb-2">Compatibilidad</div>
                    <div className="flex items-center gap-2">
                      <svg width="36" height="36" viewBox="0 0 48 48">
                        <circle cx="24" cy="24" r="18" fill="none" stroke="#1e1e2e" strokeWidth="5"/>
                        <circle cx="24" cy="24" r="18" fill="none" stroke="url(#mg)" strokeWidth="5" strokeLinecap="round" strokeDasharray="113" strokeDashoffset="15" transform="rotate(-90 24 24)"/>
                        <defs><linearGradient id="mg"><stop offset="0%" stopColor="#6c63ff"/><stop offset="100%" stopColor="#22d3ee"/></linearGradient></defs>
                        <text x="24" y="28" textAnchor="middle" fill="#e8e8f0" fontSize="11" fontWeight="bold">87</text>
                      </svg>
                      <div className="flex flex-col gap-1 flex-1">
                        {[["KW","88%","#10b981"],["Imp","74%","#f59e0b"],["Fmt","100%","#a78bfa"]].map(([k,v,c])=>(
                          <div key={k as string} className="flex items-center gap-1">
                            <span className="text-[7px] text-[#444] w-6">{k}</span>
                            <div className="flex-1 h-1 bg-[#1e1e2e] rounded-full">
                              <div className="h-full rounded-full" style={{width:v as string,background:c as string}}/>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                  <div className="bg-[#111118] border border-[#1e1e2e] rounded-xl p-2 sm:p-3">
                    <div className="text-[8px] text-[#444] mb-2">Tu CV</div>
                    <div className="space-y-1">
                      {[["Nombre","100%"],["Exp.","100%"],["Skills","100%"],["Proy.","80%"]].map(([n,p])=>(
                        <div key={n} className="flex items-center gap-1.5">
                          <span className="text-[7px] text-[#555] w-10">{n}</span>
                          <div className="flex-1 h-1 bg-[#1e1e2e] rounded-full">
                            <div className="h-full rounded-full" style={{width:p,background:"linear-gradient(90deg,#6c63ff,#22d3ee)"}}/>
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
      <section id="features" className="py-16 sm:py-24 px-4 sm:px-6 bg-white">
        <div className="max-w-5xl mx-auto">
          <FadeIn className="text-center mb-10 sm:mb-14">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-semibold mb-4"
              style={{ background:"rgba(108,99,255,0.07)", border:"1px solid rgba(108,99,255,0.12)", color:"#6c63ff" }}>
              {t("features.label")}
            </div>
            <h2 className="text-2xl sm:text-3xl md:text-4xl font-extrabold tracking-tight mb-3 text-gray-900">{t("features.title")}</h2>
            <p className="text-gray-500 max-w-lg mx-auto text-sm">{t("features.subtitle")}</p>
          </FadeIn>
          <div className="grid sm:grid-cols-2 gap-4 sm:gap-5">
            {features.map((feat, i) => (
              <FadeIn key={i} delay={i*0.08}>
                <div className="p-5 sm:p-6 rounded-2xl border border-gray-100 hover:border-gray-200 hover:shadow-sm transition-all bg-white h-full">
                  <div className="text-2xl mb-4">{["📄","✨","📊","🌐"][i]}</div>
                  <h3 className="font-bold text-[15px] mb-2 text-gray-900">{feat.title}</h3>
                  <p className="text-sm text-gray-500 leading-relaxed">{feat.desc}</p>
                </div>
              </FadeIn>
            ))}
          </div>
        </div>
      </section>

      {/* HOW */}
      <section id="how" className="py-16 sm:py-24 px-4 sm:px-6" style={{ background:"#f9f9fc" }}>
        <div className="max-w-4xl mx-auto">
          <FadeIn className="text-center mb-10 sm:mb-14">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-semibold mb-4"
              style={{ background:"rgba(108,99,255,0.07)", border:"1px solid rgba(108,99,255,0.12)", color:"#6c63ff" }}>
              {t("how.label")}
            </div>
            <h2 className="text-2xl sm:text-3xl md:text-4xl font-extrabold tracking-tight mb-3 text-gray-900">{t("how.title")}</h2>
            <p className="text-gray-500 text-sm">{t("how.subtitle")}</p>
          </FadeIn>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 sm:gap-6">
            {steps.map((step, i) => (
              <FadeIn key={i} delay={i*0.1}>
                <div className="text-center">
                  <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-2xl flex items-center justify-center mx-auto mb-3 sm:mb-4 text-white font-bold text-base sm:text-lg"
                    style={{ background:"linear-gradient(135deg,#6c63ff,#22d3ee)" }}>
                    {i+1}
                  </div>
                  <h3 className="font-bold text-xs sm:text-sm mb-1 text-gray-900">{step.title}</h3>
                  <p className="text-xs text-gray-500 leading-relaxed">{step.desc}</p>
                </div>
              </FadeIn>
            ))}
          </div>
        </div>
      </section>

      {/* TESTIMONIALS */}
      <section id="testimonials" className="py-16 sm:py-24 px-4 sm:px-6 bg-white">
        <div className="max-w-5xl mx-auto">
          <FadeIn className="text-center mb-10 sm:mb-12">
            <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight mb-2 text-gray-900">{t("reviews.title")}</h2>
            <p className="text-gray-500 text-sm">{t("reviews.subtitle")}</p>
          </FadeIn>
          <div className="grid sm:grid-cols-3 gap-4 sm:gap-5">
            {reviews.map((r, i) => (
              <FadeIn key={i} delay={i*0.08}>
                <div className="p-5 sm:p-6 rounded-2xl border border-gray-100 bg-white">
                  <div className="flex gap-0.5 mb-4">
                    {Array.from({length:5}).map((_,j) => <Star key={j} size={13} fill="#f59e0b" className="text-amber-400"/>)}
                  </div>
                  <p className="text-sm text-gray-600 leading-relaxed mb-5">"{r.text}"</p>
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full flex items-center justify-center text-white text-xs font-bold flex-shrink-0"
                      style={{ background:"linear-gradient(135deg,#6c63ff,#22d3ee)" }}>
                      {r.name[0]}
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-gray-900">{r.name}</p>
                      <p className="text-xs text-gray-400">{r.role}</p>
                    </div>
                  </div>
                </div>
              </FadeIn>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-16 sm:py-24 px-4 sm:px-6" style={{ background:"linear-gradient(135deg,#f5f4ff 0%,#f0fdfe 100%)" }}>
        <div className="max-w-3xl mx-auto text-center">
          <FadeIn>
            <h2 className="text-2xl sm:text-3xl md:text-4xl font-extrabold tracking-tight mb-4 text-gray-900">{t("cta.title")}</h2>
            <p className="text-gray-500 mb-8 text-sm max-w-md mx-auto">{t("cta.subtitle")}</p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-3 mb-6">
              <Link href="/register"
                className="flex items-center gap-2 px-7 sm:px-8 py-3.5 rounded-xl font-bold text-sm text-white w-full sm:w-auto justify-center"
                style={{ background:"linear-gradient(135deg,#6c63ff,#22d3ee)", boxShadow:"0 8px 28px rgba(108,99,255,0.25)" }}>
                {t("cta.primary")} <ArrowRight size={15}/>
              </Link>
              <Link href="/login"
                className="flex items-center gap-2 px-7 sm:px-8 py-3.5 rounded-xl border border-gray-200 text-sm font-medium text-gray-600 bg-white hover:bg-gray-50 w-full sm:w-auto justify-center">
                {t("cta.secondary")}
              </Link>
            </div>
            <div className="flex items-center justify-center gap-4 sm:gap-6 text-xs text-gray-400 flex-wrap">
              {[t("cta.trust1"), t("cta.trust2"), t("cta.trust3")].map((txt,i)=>(
                <span key={i} className="flex items-center gap-1.5">
                  <CheckCircle size={11} className="text-violet-400"/>{txt}
                </span>
              ))}
            </div>
          </FadeIn>
        </div>
      </section>

      {/* FOOTER */}
      <footer className="border-t border-gray-100 py-8 px-4 sm:px-6 bg-white">
        <div className="max-w-5xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
          <Logo/>
          <div className="flex items-center gap-4 sm:gap-6 text-xs text-gray-400 flex-wrap justify-center">
            <span>{t("footer.free")}</span>
            <span>·</span>
            <span>{t("footer.open")}</span>
            <span>·</span>
            <a href="https://github.com/Hermanitos-S-A/cvforge-ai" target="_blank" className="text-violet-500 hover:underline">GitHub</a>
          </div>
          <LanguageSwitcher variant="light"/>
        </div>
      </footer>
    </div>
  );
}
