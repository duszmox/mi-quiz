"use client";

import { useEffect } from "react";
import { useLocalStorage } from "./useLocalStorage";

export function useDarkMode() {
  const [isDark, setIsDark, isLoading] = useLocalStorage<boolean>(
    "darkMode",
    false
  );

  useEffect(() => {
    if (isLoading) return;

    if (isDark) {
      document.documentElement.classList.add("dark");
    } else {
      document.documentElement.classList.remove("dark");
    }
  }, [isDark, isLoading]);

  // Check system preference on first load
  useEffect(() => {
    if (isLoading) return;

    const stored = localStorage.getItem("darkMode");
    if (stored === null) {
      const prefersDark = window.matchMedia(
        "(prefers-color-scheme: dark)"
      ).matches;
      setIsDark(prefersDark);
    }
  }, [isLoading, setIsDark]);

  const toggle = () => setIsDark(!isDark);

  return { isDark, toggle, isLoading };
}
