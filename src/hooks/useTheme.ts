import { useSettingsStore } from '../store/settingsStore';
import { getTheme, type ThemeConfig } from '../themes/themeConfig';

export function useTheme(): ThemeConfig {
    const themeMode = useSettingsStore((s) => s.theme);
    return getTheme(themeMode);
}
