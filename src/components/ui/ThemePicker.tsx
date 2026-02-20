import {useSettingsStore} from "../../store/settingsStore";
import {useTheme} from "../../hooks/useTheme";
import type {ThemeMode} from "../../types/goal";

const THEMES: {value: ThemeMode; label: string; icon: string}[] = [
  {value: "minimalist", label: "Minimal", icon: "◯"},
  {value: "vaporwave", label: "Vapor", icon: "◆"},
  {value: "natural", label: "Nature", icon: "🌿"},
  {value: "dark", label: "Space", icon: "✦"},
];

/**
 * ThemePicker — editorial pill-row to switch between 4 visual themes.
 */
export default function ThemePicker({compact}: {compact?: boolean}) {
  const theme = useTheme();
  const currentTheme = useSettingsStore((s) => s.theme);
  const setTheme = useSettingsStore((s) => s.setTheme);

  return (
    <div>
      {/* Section label (hidden in compact/dock mode) */}
      {!compact && (
        <div
          className="ctrl-section-label"
          style={{
            color: theme.uiText,
            transform: "rotate(-1.5deg)",
            transformOrigin: "left",
            display: "inline-block",
            marginBottom: "8px",
          }}>
          THEME
        </div>
      )}
      <div style={{display: "flex", gap: "5px"}}>
        {THEMES.map((t) => {
          const isActive = currentTheme === t.value;
          return (
            <button
              key={t.value}
              onClick={() => setTheme(t.value)}
              className="ctrl-theme-btn"
              title={t.label}
              style={{
                background: isActive ? theme.uiAccent : "transparent",
                color: isActive ? "#fff" : theme.uiText,
                border: `2px solid ${isActive ? theme.uiAccent : theme.uiBorder}`,
                fontWeight: isActive ? 800 : 500,
                opacity: isActive ? 1 : 0.5,
              }}>
              <span style={{fontSize: "13px", lineHeight: 1}}>{t.icon}</span>
              <span style={{fontSize: "9px", letterSpacing: "0.14em", textTransform: "uppercase"}}>{t.label}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
