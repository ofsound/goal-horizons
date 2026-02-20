import {useSettingsStore} from "../../store/settingsStore";
import {useTheme} from "../../hooks/useTheme";
import type {HorizonMode} from "../../types/goal";
import {curvatureToNearestHorizonMode, horizonModeToCurvature} from "../../utils/globe";

const MODES: {value: HorizonMode; label: string; description: string}[] = [
  {value: "hard", label: "Hard Edge", description: "Goals vanish over the horizon"},
  {value: "subtle", label: "Gentle Curve", description: "Soft curve, goals stay visible"},
  {value: "fog", label: "Atmospheric", description: "Flat with distance fog"},
];

/**
 * HorizonModePicker — dropdown-style picker for 3 horizon curvature modes.
 */
export default function HorizonModePicker() {
  const theme = useTheme();
  const horizonMode = useSettingsStore((s) => s.horizonMode);
  const curvature = useSettingsStore((s) => s.curvature);
  const gridOverlayEnabled = useSettingsStore((s) => s.gridOverlayEnabled);
  const setHorizonMode = useSettingsStore((s) => s.setHorizonMode);
  const setCurvature = useSettingsStore((s) => s.setCurvature);
  const setGridOverlayEnabled = useSettingsStore((s) => s.setGridOverlayEnabled);

  const curvaturePercent = Math.round(curvature * 100);

  const handlePresetClick = (mode: HorizonMode) => {
    setHorizonMode(mode);
    setCurvature(horizonModeToCurvature(mode));
  };

  const handleCurvatureChange = (value: number) => {
    const nextCurvature = value / 100;
    const nextMode = curvatureToNearestHorizonMode(nextCurvature);
    setCurvature(nextCurvature);
    if (nextMode !== horizonMode) {
      setHorizonMode(nextMode);
    }
  };

  return (
    <div className="flex flex-col gap-2 min-w-[280px]">
      <div className="flex rounded-lg overflow-hidden" style={{border: `1px solid ${theme.uiBorder}`}}>
        {MODES.map((m) => (
          <button
            key={m.value}
            onClick={() => handlePresetClick(m.value)}
            className="flex-1 px-2.5 py-1.5 text-[10px] font-semibold uppercase tracking-wider transition-all"
            style={{
              background: horizonMode === m.value ? theme.uiAccent : "rgba(255,255,255,0.06)",
              color: horizonMode === m.value ? "#fff" : theme.uiText,
              opacity: horizonMode === m.value ? 1 : 0.6,
            }}
            title={m.description}>
            {m.label}
          </button>
        ))}
      </div>

      <div className="rounded-lg px-2.5 py-2" style={{border: `1px solid ${theme.uiBorder}`, background: "rgba(255,255,255,0.04)"}}>
        <div className="flex items-center justify-between text-[9px] font-semibold uppercase tracking-wider mb-1.5" style={{color: theme.uiText, opacity: 0.8}}>
          <span>Curvature</span>
          <span>{curvaturePercent}%</span>
        </div>
        <input
          type="range"
          min={0}
          max={100}
          value={curvaturePercent}
          onChange={(e) => handleCurvatureChange(Number(e.target.value))}
          className="w-full cursor-pointer"
          style={{accentColor: theme.uiAccent}}
          aria-label="Curvature morph from globe to flat"
        />
      </div>

      <button
        onClick={() => setGridOverlayEnabled(!gridOverlayEnabled)}
        className="w-full px-2.5 py-1.5 rounded-lg text-[10px] font-semibold uppercase tracking-wider transition-all flex items-center justify-between"
        style={{
          background: "rgba(255,255,255,0.06)",
          color: theme.uiText,
          border: `1px solid ${theme.uiBorder}`,
        }}>
        <span>Grid Overlay</span>
        <span
          className="relative w-8 h-4 rounded-full transition-colors"
          style={{
            background: gridOverlayEnabled ? theme.uiAccent : `${theme.uiText}33`,
          }}>
          <span
            className="absolute top-[1px] w-[14px] h-[14px] rounded-full bg-white transition-transform"
            style={{
              transform: gridOverlayEnabled ? "translateX(17px)" : "translateX(1px)",
            }}
          />
        </span>
      </button>
    </div>
  );
}
