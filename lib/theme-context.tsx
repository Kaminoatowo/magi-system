"use client";

import { createContext, useContext, useState, useEffect, ReactNode } from "react";

export type Theme = "modern" | "nerv";

type ThemeContextValue = {
  theme: Theme;
  toggle: () => void;
};

const ThemeContext = createContext<ThemeContextValue>({
  theme: "modern",
  toggle: () => {},
});

export function ThemeProvider({ children }: { children: ReactNode }) {
  const [theme, setTheme] = useState<Theme>("modern");

  useEffect(() => {
    const stored = localStorage.getItem("magi-theme") as Theme | null;
    if (stored === "nerv") setTheme("nerv");
  }, []);

  function toggle() {
    setTheme((p) => {
      const next: Theme = p === "modern" ? "nerv" : "modern";
      localStorage.setItem("magi-theme", next);
      return next;
    });
  }

  return (
    <ThemeContext.Provider value={{ theme, toggle }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  return useContext(ThemeContext);
}
