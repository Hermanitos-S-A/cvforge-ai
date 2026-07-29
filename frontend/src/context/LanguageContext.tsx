"use client";
import { createContext, useContext, useState, useEffect, useCallback } from "react";
import es from "../../public/locales/es.json";
import en from "../../public/locales/en.json";
import pt from "../../public/locales/pt.json";

type Locale = "es" | "en" | "pt";
const TRANSLATIONS = { es, en, pt };

interface LangCtx {
  locale: Locale;
  t: (key: string) => string;
  tArr: (key: string) => any[];
  setLocale: (l: Locale) => void;
}

const Ctx = createContext<LangCtx>({ locale: "es", t: (k) => k, tArr: () => [], setLocale: () => { } });

export function LanguageProvider({ children }: { children: React.ReactNode }) {
  const [locale, setLoc] = useState<Locale>("es");

  useEffect(() => {
    const saved = (localStorage.getItem("cvforge-lang") as Locale) || "es";
    setLoc(saved);
  }, []);

  const setLocale = useCallback((l: Locale) => {
    setLoc(l);
    localStorage.setItem("cvforge-lang", l);
  }, []);

  const trans = TRANSLATIONS[locale];

  const t = useCallback((key: string): string => {
    const val = key.split(".").reduce((o: any, k) => o?.[k], trans);
    return typeof val === "string" ? val : key;
  }, [trans]);

  const tArr = useCallback((key: string): any[] => {
    const val = key.split(".").reduce((o: any, k) => o?.[k], trans);
    return Array.isArray(val) ? val : [];
  }, [trans]);

  return <Ctx.Provider value={{ locale, t, tArr, setLocale }}>{children}</Ctx.Provider>;
}

export const useLang = () => useContext(Ctx);