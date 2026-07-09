import { createContext, useContext, useEffect, useMemo, useState, type ReactNode } from "react";
import { ACCENT_OPTIONS } from "../lib/tokens";

export type SidebarTheme = "hell" | "dunkel";

interface ThemeState {
  accent: string;
  sidebarTheme: SidebarTheme;
  setAccent: (accent: string) => void;
  setSidebarTheme: (theme: SidebarTheme) => void;
}

const ThemeContext = createContext<ThemeState | null>(null);

const ACCENT_KEY = "alltagshilfe.accent";
const SIDEBAR_KEY = "alltagshilfe.sidebarTheme";

function hexToRgba(hex: string, alpha: number) {
  const clean = hex.replace("#", "");
  const r = parseInt(clean.slice(0, 2), 16);
  const g = parseInt(clean.slice(2, 4), 16);
  const b = parseInt(clean.slice(4, 6), 16);
  return `rgba(${r}, ${g}, ${b}, ${alpha})`;
}

export function ThemeProvider({ children }: { children: ReactNode }) {
  const [accent, setAccentState] = useState<string>(
    () => localStorage.getItem(ACCENT_KEY) ?? ACCENT_OPTIONS[0].value
  );
  const [sidebarTheme, setSidebarThemeState] = useState<SidebarTheme>(
    () => (localStorage.getItem(SIDEBAR_KEY) as SidebarTheme | null) ?? "hell"
  );

  const setAccent = (value: string) => {
    setAccentState(value);
    localStorage.setItem(ACCENT_KEY, value);
  };
  const setSidebarTheme = (value: SidebarTheme) => {
    setSidebarThemeState(value);
    localStorage.setItem(SIDEBAR_KEY, value);
  };

  const cssVars = useMemo(
    () => ({
      "--accent": accent,
      "--accent-soft": hexToRgba(accent, 0.08),
      "--accent-line": hexToRgba(accent, 0.19),
    }),
    [accent]
  ) as React.CSSProperties;

  useEffect(() => {
    for (const [key, value] of Object.entries(cssVars)) {
      document.documentElement.style.setProperty(key, value as string);
    }
  }, [cssVars]);

  const value = useMemo(
    () => ({ accent, sidebarTheme, setAccent, setSidebarTheme }),
    [accent, sidebarTheme]
  );

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
}

export function useTheme() {
  const ctx = useContext(ThemeContext);
  if (!ctx) throw new Error("useTheme must be used within ThemeProvider");
  return ctx;
}

export const SIDEBAR_PALETTES: Record<SidebarTheme, {
  bg: string; border: string; brand: string; muted: string; text: string;
  activeBg: string; activeText: string; hover: string;
}> = {
  hell: {
    bg: "#FBFCFB", border: "#E9ECEA", brand: "#17211C", muted: "#8A958F", text: "#4A574F",
    activeBg: "var(--accent-soft)", activeText: "var(--accent)", hover: "#F2F5F3",
  },
  dunkel: {
    bg: "#1E2E27", border: "rgba(255,255,255,.08)", brand: "#fff", muted: "#8DA096", text: "#B7C4BD",
    activeBg: "rgba(255,255,255,.09)", activeText: "#fff", hover: "rgba(255,255,255,.05)",
  },
};
