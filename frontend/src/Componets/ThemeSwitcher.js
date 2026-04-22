import React from "react";
import { useTheme, THEMES } from "../ThemeContext";

const themeLabels = {
  [THEMES.DEFAULT]: "Default",
  [THEMES.RAMADAN]: "Ramadan",
  [THEMES.CHRISTMAS]: "Christmas",
  [THEMES.NEWYEAR]: "New Year"
};

export default function ThemeSwitcher() {
  const { theme, selectTheme, manualTheme } = useTheme();
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
      <span style={{ fontWeight: 500 }}>Theme:</span>
      <select
        value={manualTheme || theme}
        onChange={e => selectTheme(e.target.value === THEMES.DEFAULT ? "" : e.target.value)}
        style={{ borderRadius: 6, padding: "4px 10px", fontSize: 15 }}
      >
        <option value={THEMES.DEFAULT}>Auto/Default</option>
        <option value={THEMES.RAMADAN}>Ramadan</option>
        <option value={THEMES.CHRISTMAS}>Christmas</option>
        <option value={THEMES.NEWYEAR}>New Year</option>
      </select>
    </div>
  );
}
