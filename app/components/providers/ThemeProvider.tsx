"use client";

import { createContext, useContext, useEffect, useState } from "react";

type Theme = "light" | "dark";
type Preference = "light" | "dark" | "system";

interface ThemeContextValue {
  theme: Theme;
  preference: Preference;
  setPreference: (p: Preference) => void;
}

const ThemeContext = createContext<ThemeContextValue | null>(null);

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [preference, setPreferenceState] = useState<Preference | undefined>(undefined);
  const [theme, setTheme] = useState<Theme | undefined>(undefined);

  useEffect(() => {
    try {
      const stored = localStorage.getItem("theme") as Preference | null;
      if (stored === "light" || stored === "dark" || stored === "system") {
        setPreferenceState(stored);
      } else {
        setPreferenceState("system");
      }
    } catch {
      setPreferenceState("system");
    }
  }, []);

  useEffect(() => {
    if (preference === undefined) return;

    const resolve = (): Theme =>
      preference === "system"
        ? window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light"
        : preference;

    setTheme(resolve());

    if (preference === "system") {
      const mq = window.matchMedia("(prefers-color-scheme: dark)");
      const handler = () => setTheme(mq.matches ? "dark" : "light");
      mq.addEventListener("change", handler);
      return () => mq.removeEventListener("change", handler);
    }
  }, [preference]);

  useEffect(() => {
    if (theme === undefined) return;
    document.documentElement.classList.toggle("dark", theme === "dark");
  }, [theme]);

  const setPreference = (p: Preference) => {
    try { localStorage.setItem("theme", p); } catch {}
    setPreferenceState(p);
  };

  if (preference === undefined || theme === undefined) {
    return <ThemeContext.Provider value={null}>{children}</ThemeContext.Provider>;
  }

  return (
    <ThemeContext.Provider value={{ theme, preference, setPreference }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme(): ThemeContextValue {
  const ctx = useContext(ThemeContext);
  return ctx ?? { theme: "light", preference: "system", setPreference: () => {} };
}
