"use client";

import { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { Lang, STRINGS } from "@/lib/strings";

type LanguageContextValue = {
  lang: Lang;
  toggle: () => void;
  t: typeof STRINGS["en"];
};

const LanguageContext = createContext<LanguageContextValue>({
  lang: "en",
  toggle: () => {},
  t: STRINGS.en,
});

export function LanguageProvider({ children }: { children: ReactNode }) {
  const [lang, setLang] = useState<Lang>("en");

  useEffect(() => {
    const stored = localStorage.getItem("magi-lang") as Lang | null;
    if (stored === "it") setLang("it");
  }, []);

  useEffect(() => {
    document.documentElement.lang = lang;
  }, [lang]);

  function toggle() {
    setLang((l) => {
      const next: Lang = l === "en" ? "it" : "en";
      localStorage.setItem("magi-lang", next);
      return next;
    });
  }

  return (
    <LanguageContext.Provider value={{ lang, toggle, t: STRINGS[lang] }}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  return useContext(LanguageContext);
}
