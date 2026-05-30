"use client";

import { useCallback, useEffect, useState } from "react";

export type Theme = "light" | "dark" | "spider-noir";

function getThemeFromDOM(): Theme {
  if (typeof document === "undefined") return "light";
  const html = document.documentElement;
  if (html.classList.contains("spider-noir")) return "spider-noir";
  if (html.classList.contains("dark")) return "dark";
  return "light";
}

export function useTheme() {
  const [theme, setThemeState] = useState<Theme>("light");

  useEffect(() => {
    setThemeState(getThemeFromDOM());

    const observer = new MutationObserver(() => {
      setThemeState(getThemeFromDOM());
    });

    observer.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ["class"],
    });

    return () => observer.disconnect();
  }, []);

  const setTheme = useCallback((newTheme: Theme) => {
    const html = document.documentElement;
    html.classList.remove("dark", "spider-noir");
    if (newTheme === "dark") {
      html.classList.add("dark");
    } else if (newTheme === "spider-noir") {
      html.classList.add("dark", "spider-noir");
    }
    setThemeState(newTheme);
    localStorage.setItem("codearena-theme", newTheme);
  }, []);

  return { theme, setTheme };
}
