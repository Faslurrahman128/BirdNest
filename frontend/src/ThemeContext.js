import React, { createContext, useContext, useState, useEffect } from "react";

// Supported themes
export const THEMES = {
  DEFAULT: "default",
  DARK: "dark",
  RAMADAN: "ramadan",
  CHRISTMAS: "christmas",
  NEWYEAR: "newyear",
  PONGAL: "pongal",
  VESAK: "vesak"
};

const ThemeContext = createContext();

export function ThemeProvider({ children }) {
  // Try to load manual override from localStorage
  const [manualTheme, setManualTheme] = useState(() => localStorage.getItem("themeOverride") || "");
  const [theme, setTheme] = useState(THEMES.DEFAULT);

  // Auto-detect theme based on date
  useEffect(() => {
    if (manualTheme) {
      setTheme(manualTheme);
      return;
    }
    const now = new Date();
    const month = now.getMonth() + 1; // Jan=1
    const day = now.getDate();
    // Ramadan (example: March 10 - April 10, adjust as needed)
    if ((month === 3 && day >= 10) || (month === 4 && day <= 10)) {
      setTheme(THEMES.RAMADAN);
    } else if (month === 12 && day >= 20) {
      setTheme(THEMES.CHRISTMAS);
    } else if (month === 1 && day <= 7) {
      setTheme(THEMES.NEWYEAR);
    } else {
      setTheme(THEMES.DEFAULT);
    }
  }, [manualTheme]);

  // Auto-detection logic extracted for reuse
  const detectTheme = () => {
    const now = new Date();
    const month = now.getMonth() + 1;
    const day = now.getDate();
    if ((month === 3 && day >= 10) || (month === 4 && day <= 10)) return THEMES.RAMADAN;
    if (month === 12 && day >= 20) return THEMES.CHRISTMAS;
    if (month === 1 && day <= 7) return THEMES.NEWYEAR;
    if (month === 1 && day >= 10 && day <= 20) return THEMES.PONGAL;
    if (month === 5 && day >= 10 && day <= 25) return THEMES.VESAK;
    return THEMES.DEFAULT;
  };

  // Manual override with immediate update
  const selectTheme = (t) => {
    setManualTheme(t);
    setTheme(t || detectTheme()); // Immediate update instead of waiting for useEffect
    if (t) localStorage.setItem("themeOverride", t);
    else localStorage.removeItem("themeOverride");
  };

  return (
    <ThemeContext.Provider value={{ theme, selectTheme, manualTheme }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  return useContext(ThemeContext);
}
