"use client";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { useTheme } from "next-themes";
import {
  LayoutDashboard, FileText, Sparkles, ScanLine,
  Globe, MessageSquare, Layers, LogOut, Moon, Sun,
  User, Menu, X, Eye,
} from "lucide-react";
import { useState } from "react";
import { useAuthStore } from "@/stores/authStore";

const NAV = [
  { label: "Overview", href: "/dashboard", icon: LayoutDashboard, section: "main" },
  { label: "Mi Perfil", href: "/dashboard/cv", icon: FileText, section: "builder" },
  { label: "Vista Previa", href: "/dashboard/cv/preview", icon: Eye, section: "builder" },
  { label: "Asistente IA", href: "/dashboard/ai", icon: Sparkles, section: "builder", badge: "IA" },
  { label: "Plantillas", href: "/dashboard/templates", icon: Layers, section: "builder" },
  { label: "Portafolio", href: "/dashboard/portfolio", icon: Globe, section: "builder" },
  { label: "ATS Analyzer", href: "/dashboard/ats", icon: ScanLine, section: "tools" },
  { label: "Generador Bio", href: "/dashboard/bio", icon: MessageSquare, section: "tools" },
];
const SECTIONS: Record<string, string> = { main: "General", builder: "Construir", tools: "Analizar" };

function Logo() {
  return (
    <svg width="28" height="28" viewBox="0 0 36 36" fill="none">
      <rect width="36" height="36" rx="9" fill="url(#sidebarGrad)" />
      <path d="M11 10H18L14 17H20L11 26H17L22 17H17L21 10" fill="white" />
      <defs>
        <linearGradient id="sidebarGrad" x1="0" y1="0" x2="36" y2="36" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#6c63ff" />
          <stop offset="100%" stopColor="#3ecfcf" />
        </linearGradient>
      </defs>
    </svg>
  );
}

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const { theme, setTheme } = useTheme();
  const { user, logout } = useAuthStore();
  const [open, setOpen] = useState(false);

  const handleLogout = () => { logout(); router.push("/login"); };

  function SidebarContent() {
    return (
      <div className="flex flex-col h-full">
        {/* Logo */}
        <div className="flex items-center gap-2.5 px-4 py-5 border-b border-border flex-shrink-0">
          <Logo />
          <span className="font-bold text-sm tracking-tight">
            CVForge <span className="text-primary">AI</span>
          </span>
        </div>

        {/* Nav */}
        <nav className="flex-1 px-3 py-4 overflow-y-auto">
          {["main", "builder", "tools"].map((sec) => (
            <div key={sec} className="mb-3">
              <p className="px-3 mb-1 text-[10px] font-semibold uppercase tracking-widest text-muted-foreground/50">
                {SECTIONS[sec]}
              </p>
              {NAV.filter(n => n.section === sec).map((item) => {
                const active = pathname === item.href || (item.href !== "/dashboard" && pathname.startsWith(item.href));
                return (
                  <Link key={item.href} href={item.href} onClick={() => setOpen(false)}
                    className={`flex items-center gap-3 px-3 py-2 rounded-xl text-sm font-medium transition-all mb-0.5 group ${active
                        ? "bg-primary/10 text-primary border border-primary/15"
                        : "text-muted-foreground hover:text-foreground hover:bg-secondary"
                      }`}>
                    <item.icon size={15} className={active ? "text-primary" : "group-hover:text-foreground"} />
                    <span className="flex-1">{item.label}</span>
                    {item.badge && (
                      <span className="text-[9px] font-bold px-1.5 py-0.5 rounded-full bg-primary text-white">
                        {item.badge}
                      </span>
                    )}
                  </Link>
                );
              })}
            </div>
          ))}
        </nav>

        {/* Footer */}
        <div className="p-3 border-t border-border space-y-2 flex-shrink-0">
          <button onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
            className="flex items-center gap-3 w-full px-3 py-2 rounded-xl text-sm text-muted-foreground hover:text-foreground hover:bg-secondary transition-colors">
            {theme === "dark" ? <Sun size={14} /> : <Moon size={14} />}
            {theme === "dark" ? "Modo claro" : "Modo oscuro"}
          </button>
          <div className="flex items-center gap-3 px-3 py-2 rounded-xl bg-secondary">
            <div className="w-7 h-7 rounded-full bg-primary/15 flex items-center justify-center flex-shrink-0">
              <User size={13} className="text-primary" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-xs font-semibold truncate">{user?.full_name || "Usuario"}</p>
              <p className="text-[10px] text-primary capitalize">{user?.plan || "free"}</p>
            </div>
            <button onClick={handleLogout} title="Cerrar sesión"
              className="text-muted-foreground hover:text-destructive transition-colors">
              <LogOut size={13} />
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-screen bg-background overflow-hidden">
      {/* Desktop */}
      <aside className="hidden md:flex w-56 flex-shrink-0 border-r border-border bg-card flex-col">
        <SidebarContent />
      </aside>

      {/* Mobile overlay */}
      <AnimatePresence>
        {open && (
          <>
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/60 z-40 md:hidden" onClick={() => setOpen(false)} />
            <motion.aside initial={{ x: -256 }} animate={{ x: 0 }} exit={{ x: -256 }}
              transition={{ type: "spring", damping: 25, stiffness: 300 }}
              className="fixed left-0 top-0 bottom-0 w-56 bg-card border-r border-border z-50 md:hidden flex flex-col">
              <SidebarContent />
            </motion.aside>
          </>
        )}
      </AnimatePresence>

      {/* Main */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        <header className="h-14 border-b border-border bg-card/50 backdrop-blur flex items-center gap-4 px-4 md:px-6 flex-shrink-0">
          <button className="md:hidden text-muted-foreground" onClick={() => setOpen(!open)}>
            {open ? <X size={20} /> : <Menu size={20} />}
          </button>
          <div className="flex-1" />
          <Link href="/dashboard/cv/preview"
            className="flex items-center gap-2 px-3 py-1.5 rounded-lg border border-border text-xs font-medium text-muted-foreground hover:text-foreground hover:bg-secondary transition-colors">
            <Eye size={13} /> Vista previa
          </Link>
          <Link href="/dashboard/templates"
            className="flex items-center gap-2 px-4 py-2 rounded-lg bg-primary text-white text-sm font-medium hover:opacity-90 transition-all">
            <FileText size={13} /> Exportar PDF
          </Link>
        </header>
        <main className="flex-1 overflow-y-auto">
          {children}
        </main>
      </div>
    </div>
  );
}
