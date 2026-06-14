"use client";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { useTheme } from "next-themes";
import { LayoutDashboard, FileText, Sparkles, ScanLine, Globe, MessageSquare, Layers, LogOut, Moon, Sun, User, Menu, X } from "lucide-react";
import { useState } from "react";
import { useAuthStore } from "@/stores/authStore";

const navItems = [
  { label: "Overview",    href: "/dashboard",            icon: LayoutDashboard, section: "main" },
  { label: "My Profile",  href: "/dashboard/cv",          icon: FileText,        section: "builder" },
  { label: "AI Assistant",href: "/dashboard/ai",          icon: Sparkles,        section: "builder", badge: "NEW" },
  { label: "Templates",   href: "/dashboard/templates",   icon: Layers,          section: "builder" },
  { label: "Portfolio",   href: "/dashboard/portfolio",   icon: Globe,           section: "builder" },
  { label: "ATS Analyzer",href: "/dashboard/ats",         icon: ScanLine,        section: "tools" },
  { label: "Bio Generator",href: "/dashboard/bio",        icon: MessageSquare,   section: "tools" },
];

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const { theme, setTheme } = useTheme();
  const { user, logout } = useAuthStore();
  const [mobileOpen, setMobileOpen] = useState(false);

  const handleLogout = () => { logout(); router.push("/login"); };

  const SidebarContent = () => (
    <div className="flex flex-col h-full">
      <div className="flex items-center gap-2.5 px-4 py-5 border-b border-border">
        <div className="w-7 h-7 rounded-lg bg-primary flex items-center justify-center text-white text-xs font-bold flex-shrink-0">⚡</div>
        <div><span className="font-bold text-sm">CVForge</span><span className="ml-1 text-xs px-1.5 py-0.5 rounded bg-primary/20 text-primary font-semibold">AI</span></div>
      </div>
      <nav className="flex-1 px-3 py-4 overflow-y-auto">
        {["main","builder","tools"].map((section) => (
          <div key={section} className="mb-2">
            <p className="px-3 py-1 text-[10px] font-semibold uppercase tracking-widest text-muted-foreground/60">
              {section === "main" ? "Overview" : section === "builder" ? "Builder" : "Analyze"}
            </p>
            {navItems.filter((item) => item.section === section).map((item) => {
              const active = pathname === item.href;
              return (
                <Link key={item.href} href={item.href}
                  className={`flex items-center gap-3 px-3 py-2 rounded-xl text-sm font-medium transition-all mb-0.5 group ${active ? "bg-primary/10 text-primary border border-primary/20" : "text-muted-foreground hover:text-foreground hover:bg-secondary"}`}
                  onClick={() => setMobileOpen(false)}>
                  <item.icon size={16} className={active ? "text-primary" : "group-hover:text-foreground"} />
                  <span className="flex-1">{item.label}</span>
                  {item.badge && <span className="text-[9px] font-bold px-1.5 py-0.5 rounded-full bg-primary text-white">{item.badge}</span>}
                </Link>
              );
            })}
          </div>
        ))}
      </nav>
      <div className="p-3 border-t border-border space-y-2">
        <button onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
          className="flex items-center gap-3 w-full px-3 py-2 rounded-xl text-sm text-muted-foreground hover:text-foreground hover:bg-secondary transition-colors">
          {theme === "dark" ? <Sun size={16} /> : <Moon size={16} />}
          {theme === "dark" ? "Light mode" : "Dark mode"}
        </button>
        <div className="flex items-center gap-3 px-3 py-2 rounded-xl bg-secondary">
          <div className="w-7 h-7 rounded-full bg-primary/20 flex items-center justify-center flex-shrink-0"><User size={14} className="text-primary" /></div>
          <div className="flex-1 min-w-0">
            <p className="text-xs font-medium truncate">{user?.full_name || "User"}</p>
            <p className="text-[10px] text-primary capitalize">{user?.plan || "free"} plan</p>
          </div>
          <button onClick={handleLogout} className="text-muted-foreground hover:text-destructive transition-colors"><LogOut size={14} /></button>
        </div>
      </div>
    </div>
  );

  return (
    <div className="flex h-screen bg-background overflow-hidden">
      <aside className="hidden md:flex w-56 flex-shrink-0 border-r border-border bg-card flex-col"><SidebarContent /></aside>
      <AnimatePresence>
        {mobileOpen && (
          <>
            <motion.div initial={{ opacity:0 }} animate={{ opacity:1 }} exit={{ opacity:0 }} className="fixed inset-0 bg-black/60 z-40 md:hidden" onClick={() => setMobileOpen(false)} />
            <motion.aside initial={{ x:-256 }} animate={{ x:0 }} exit={{ x:-256 }} transition={{ type:"spring", damping:25, stiffness:300 }} className="fixed left-0 top-0 bottom-0 w-56 bg-card border-r border-border z-50 md:hidden flex flex-col"><SidebarContent /></motion.aside>
          </>
        )}
      </AnimatePresence>
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        <header className="h-14 border-b border-border bg-card/50 flex items-center gap-4 px-4 md:px-6 flex-shrink-0">
          <button className="md:hidden text-muted-foreground" onClick={() => setMobileOpen(!mobileOpen)}>
            {mobileOpen ? <X size={20} /> : <Menu size={20} />}
          </button>
          <div className="flex-1" />
          <Link href="/dashboard/cv" className="flex items-center gap-2 px-4 py-2 rounded-lg bg-primary text-white text-sm font-medium hover:bg-primary/90 transition-colors">
            <FileText size={14} /> New CV
          </Link>
        </header>
        <main className="flex-1 overflow-y-auto">{children}</main>
      </div>
    </div>
  );
}
