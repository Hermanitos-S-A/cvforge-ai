"use client";
import { useState, useRef, useEffect } from "react";
import { useLang } from "@/context/LanguageContext";
import { Globe, ChevronDown } from "lucide-react";

const LANGS = [
  { code: "es" as const, label: "Español",   flag: "🇪🇸" },
  { code: "en" as const, label: "English",   flag: "🇺🇸" },
  { code: "pt" as const, label: "Português", flag: "🇧🇷" },
];

interface Props {
  variant?: "light" | "dark";
}

export function LanguageSwitcher({ variant = "dark" }: Props) {
  const { locale, setLocale } = useLang();
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const current = LANGS.find(l => l.code === locale) || LANGS[0];
  const isDark = variant === "dark";

  return (
    <div ref={ref} className="relative">
      <button
        onClick={() => setOpen(!open)}
        className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl text-xs font-medium transition-all"
        style={{
          background: isDark ? "rgba(255,255,255,0.06)" : "rgba(0,0,0,0.05)",
          border: isDark ? "0.5px solid rgba(255,255,255,0.10)" : "1px solid rgba(0,0,0,0.10)",
          color: isDark ? "rgba(255,255,255,0.65)" : "#555",
        }}
      >
        <Globe size={13} />
        <span>{current.flag}</span>
        <span className="hidden sm:inline font-semibold">{current.label}</span>
        <ChevronDown size={11} style={{ transform: open ? "rotate(180deg)" : "none", transition: "transform 0.2s" }} />
      </button>

      {open && (
        <div
          className="absolute right-0 top-full mt-1.5 rounded-xl overflow-hidden z-50 min-w-[150px]"
          style={{
            background: isDark ? "#16161f" : "#fff",
            border: isDark ? "0.5px solid rgba(255,255,255,0.08)" : "1px solid #e5e7eb",
            boxShadow: "0 8px 24px rgba(0,0,0,0.18)",
          }}
        >
          {LANGS.map((lang) => {
            const isActive = locale === lang.code;
            return (
              <button
                key={lang.code}
                onClick={() => { setLocale(lang.code); setOpen(false); }}
                className="w-full flex items-center gap-2.5 px-3.5 py-2.5 text-xs font-medium text-left transition-colors"
                style={{
                  background: isActive
                    ? (isDark ? "rgba(108,99,255,0.18)" : "rgba(108,99,255,0.08)")
                    : "transparent",
                  color: isActive
                    ? "#a78bfa"
                    : (isDark ? "rgba(255,255,255,0.55)" : "#444"),
                }}
                onMouseEnter={e => { if (!isActive) (e.currentTarget as HTMLElement).style.background = isDark ? "rgba(255,255,255,0.05)" : "#f9fafb"; }}
                onMouseLeave={e => { if (!isActive) (e.currentTarget as HTMLElement).style.background = "transparent"; }}
              >
                <span className="text-base leading-none">{lang.flag}</span>
                <span>{lang.label}</span>
                {isActive && <span className="ml-auto text-primary text-[10px] font-bold">✓</span>}
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}
