import {useSettingsStore} from "../../store/settingsStore";
import {useTheme} from "../../hooks/useTheme";
import type {HorizonMode} from "../../types/goal";
import {curvatureToNearestHorizonMode, horizonModeToCurvature} from "../../utils/globe";

const MODES: {value: HorizonMode; label: string; description: string; short: string}[] = [
  {value: "hard", label: "Hard Edge", short: "HARD", description: "Goals vanish over the horizon"},
  {value: "subtle", label: "Gentle Curve", short: "CURVE", description: "Soft curve, goals stay visible"},
  {value: "fog", label: "Atmospheric", short: "FOG", description: "Flat with distance fog"},
];
const DENSITY_OPTIONS = [1, 2, 3] as const;

/**
 * HorizonModePicker — editorial picker for horizon curvature modes + grid settings.
 * compact=true = slim 3-button row for dock mode.
 */
export default function HorizonModePicker({compact}: {compact?: boolean}) {
  const theme = useTheme();
  const horizonMode = useSettingsStore((s) => s.horizonMode);
  const curvature = useSettingsStore((s) => s.curvature);
  const gridOverlayEnabled = useSettingsStore((s) => s.gridOverlayEnabled);
  const gridLabelDensity = useSettingsStore((s) => s.gridLabelDensity);
  const setHorizonMode = useSettingsStore((s) => s.setHorizonMode);
  const setCurvature = useSettingsStore((s) => s.setCurvature);
  const setGridOverlayEnabled = useSettingsStore((s) => s.setGridOverlayEnabled);
  const setGridLabelDensity = useSettingsStore((s) => s.setGridLabelDensity);

  const curvaturePercent = Math.round(curvature * 100);

  const handlePresetClick = (mode: HorizonMode) => {
    setHorizonMode(mode);
    setCurvature(horizonModeToCurvature(mode));
  };

  const handleCurvatureChange = (value: number) => {
    const nextCurvature = value / 100;
    const nextMode = curvatureToNearestHorizonMode(nextCurvature);
    setCurvature(nextCurvature);
    if (nextMode !== horizonMode) setHorizonMode(nextMode);
  };

  /* ── Compact / dock mode: horizontal 3-button row only ── */
  if (compact) {
    return (
      <div style={{display: "flex", gap: "4px"}}>
        {MODES.map((m) => {
          const isActive = horizonMode === m.value;
          return (
            <button
              key={m.value}
              onClick={() => handlePresetClick(m.value)}
              className="ctrl-theme-btn"
              title={m.description}
              style={{
                background: isActive ? theme.uiAccent : "transparent",
                color: isActive ? "#fff" : theme.uiText,
                border: `2px solid ${isActive ? theme.uiAccent : theme.uiBorder}`,
                fontWeight: isActive ? 800 : 500,
                opacity: isActive ? 1 : 0.5,
              }}>
              <span style={{fontSize: "9px", letterSpacing: "0.14em", textTransform: "uppercase"}}>{m.short}</span>
            </button>
          );
        })}
      </div>
    );
  }

  return (
    <div style={{display: "flex", flexDirection: "column", gap: "10px", minWidth: "220px"}}>
      {/* Section label */}
      <div
        className="ctrl-section-label"
        style={{
          color: theme.uiText,
          transform: "rotate(-1.5deg)",
          transformOrigin: "left",
          display: "inline-block",
        }}>
        HORIZON
      </div>

      {/* Mode buttons as left-border cards */}
      <div style={{display: "flex", flexDirection: "column", gap: "4px"}}>
        {MODES.map((m) => {
          const isActive = horizonMode === m.value;
          return (
            <button
              key={m.value}
              onClick={() => handlePresetClick(m.value)}
              className="ctrl-mode-btn"
              title={m.description}
              style={{
                borderLeft: `4px solid ${isActive ? theme.uiAccent : theme.uiBorder}`,
                background: isActive ? `linear-gradient(to right, ${theme.uiAccent}22, ${theme.uiAccent}08)` : "transparent",
                color: isActive ? theme.uiAccent : theme.uiText,
                fontWeight: isActive ? 800 : 500,
                opacity: isActive ? 1 : 0.5,
              }}>
              <span style={{fontSize: "10px", letterSpacing: "0.16em", textTransform: "uppercase"}}>{m.short}</span>
              <span
                style={{
                  fontSize: "9px",
                  opacity: 0.55,
                  fontStyle: "italic",
                  fontWeight: 400,
                  letterSpacing: "0.02em",
                  marginLeft: "auto",
                }}>
                {m.description}
              </span>
            </button>
          );
        })}
      </div>

      {/* Curvature control */}
      <div style={{paddingTop: "4px"}}>
        <div style={{display: "flex", alignItems: "baseline", justifyContent: "space-between", marginBottom: "6px"}}>
          <span className="ctrl-section-label" style={{color: theme.uiText, transform: "none", display: "inline-block"}}>
            CURVATURE
          </span>
          <span
            style={{
              fontSize: "20px",
              fontWeight: 900,
              letterSpacing: "-0.03em",
              color: theme.uiAccent,
              lineHeight: 1,
            }}>
            {curvaturePercent}
            <span style={{fontSize: "10px", fontWeight: 500, opacity: 0.6}}>%</span>
          </span>
        </div>
        <div style={{position: "relative", height: "4px", borderRadius: "2px", background: `${theme.uiText}18`}}>
          <div
            style={{
              position: "absolute",
              top: 0,
              left: 0,
              height: "100%",
              borderRadius: "2px",
              width: `${curvaturePercent}%`,
              background: theme.uiAccent,
              transition: "width 0.1s ease",
            }}
          />
          <input type="range" min={0} max={100} value={curvaturePercent} onChange={(e) => handleCurvatureChange(Number(e.target.value))} className="ef-range-input" style={{accentColor: theme.uiAccent}} aria-label="Curvature morph from globe to flat" />
        </div>
      </div>

      {/* Grid Overlay toggle */}
      <div style={{display: "flex", alignItems: "center", justifyContent: "space-between"}}>
        <span className="ctrl-section-label" style={{color: theme.uiText, transform: "none", display: "inline-block"}}>
          GRID OVERLAY
        </span>
        <label className="ef-toggle" style={{background: gridOverlayEnabled ? theme.uiAccent : theme.uiBorder, cursor: "pointer"}}>
          <input type="checkbox" checked={gridOverlayEnabled} onChange={() => setGridOverlayEnabled(!gridOverlayEnabled)} className="sr-only" />
          <span className="ef-toggle-knob" style={{transform: gridOverlayEnabled ? "translateX(16px)" : "translateX(2px)"}} />
        </label>
      </div>

      {/* Date label density (only when grid is on) */}
      {gridOverlayEnabled && (
        <div>
          <div className="ctrl-section-label" style={{color: theme.uiText, transform: "none", display: "inline-block", marginBottom: "6px"}}>
            DATE LABELS
          </div>
          <div style={{display: "flex", gap: "5px"}}>
            {DENSITY_OPTIONS.map((density) => (
              <button
                key={density}
                onClick={() => setGridLabelDensity(density)}
                className="ctrl-theme-btn"
                style={{
                  background: gridLabelDensity === density ? theme.uiAccent : "transparent",
                  color: gridLabelDensity === density ? "#fff" : theme.uiText,
                  border: `2px solid ${gridLabelDensity === density ? theme.uiAccent : theme.uiBorder}`,
                  fontWeight: gridLabelDensity === density ? 800 : 500,
                  opacity: gridLabelDensity === density ? 1 : 0.5,
                  minWidth: "36px",
                  justifyContent: "center",
                }}>
                <span style={{fontSize: "10px", letterSpacing: "0.1em"}}>{density}x</span>
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
