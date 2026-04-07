import React, { createContext, useContext, useState, useEffect } from "react";

// Supported themes
export const THEMES = {
  DEFAULT: "default",
  RAMADAN: "ramadan",
  CHRISTMAS: "christmas",
  NEWYEAR: "newyear"
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

  // Manual override
  const selectTheme = (t) => {
    setManualTheme(t);
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
