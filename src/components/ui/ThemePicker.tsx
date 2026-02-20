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
 * ThemePicker — segmented control to switch between 4 visual themes.
 */
export default function ThemePicker() {
  const theme = useTheme();
  const currentTheme = useSettingsStore((s) => s.theme);
  const setTheme = useSettingsStore((s) => s.setTheme);

  return (
    <div className="flex rounded-lg overflow-hidden" style={{border: `1px solid ${theme.uiBorder}`}}>
      {THEMES.map((t) => (
        <button
          key={t.value}
          onClick={() => setTheme(t.value)}
          className="px-2.5 py-1.5 text-[10px] font-semibold uppercase tracking-wider transition-all"
          style={{
            background: currentTheme === t.value ? theme.uiAccent : "rgba(255,255,255,0.06)",
            color: currentTheme === t.value ? "#fff" : theme.uiText,
            opacity: currentTheme === t.value ? 1 : 0.6,
          }}
          title={t.label}>
          <span className="mr-1">{t.icon}</span>
          {t.label}
        </button>
      ))}
    </div>
  );
}
