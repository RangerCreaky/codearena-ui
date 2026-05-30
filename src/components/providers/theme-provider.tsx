"use client";

import {
  createContext,
  useContext,
  useEffect,
  useState,
  useCallback,
  type ReactNode,
} from "react";

type Theme = "light" | "dark" | "spider-noir";

interface ThemeItem {
  id: Theme;
  label: string;
  icon: "Sun" | "Moon" | "Bug";
}

interface ThemeContextValue {
  theme: Theme;
  setTheme: (theme: Theme) => void;
  availableThemes: ThemeItem[];
}

const availableThemes: ThemeItem[] = [
  { id: "dark", label: "Dark", icon: "Moon" },
  { id: "light", label: "Light", icon: "Sun" },
  { id: "spider-noir", label: "Spider Noir", icon: "Bug" },
];

const ThemeContext = createContext<ThemeContextValue | undefined>(undefined);

function applyTheme(theme: Theme) {
  const root = document.documentElement;
  root.classList.remove("dark", "spider-noir");

  if (theme === "dark") {
    root.classList.add("dark");
  } else if (theme === "spider-noir") {
    root.classList.add("spider-noir", "dark");
  }
  // light = no classes
}

export function ThemeProvider({ children }: { children: ReactNode }) {
  const [theme, setThemeState] = useState<Theme>("dark");
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    const stored = localStorage.getItem("codearena-theme") as Theme | null;
    const initial = stored && ["light", "dark", "spider-noir"].includes(stored)
      ? stored
      : "dark";
    setThemeState(initial);
    applyTheme(initial);
    setMounted(true);
  }, []);

  const setTheme = useCallback((newTheme: Theme) => {
    setThemeState(newTheme);
    applyTheme(newTheme);
    localStorage.setItem("codearena-theme", newTheme);
  }, []);

  // Prevent flash of unstyled content
  if (!mounted) {
    return (
      <div style={{ visibility: "hidden" }}>
        {children}
      </div>
    );
  }

  return (
    <ThemeContext.Provider value={{ theme, setTheme, availableThemes }}>
      {/* Spider web corner decorations — only rendered, CSS shows/hides */}
      <div className="spider-web spider-web-tl" aria-hidden="true" />
      <div className="spider-web spider-web-br" aria-hidden="true" />
      {children}
    </ThemeContext.Provider>
  );
}

const defaultThemeContext: ThemeContextValue = {
  theme: "dark",
  setTheme: () => {},
  availableThemes,
};

export function useTheme() {
  const context = useContext(ThemeContext);
  if (!context) {
    // During SSR/static generation, return defaults
    return defaultThemeContext;
  }
  return context;
}
