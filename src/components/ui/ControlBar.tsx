import ZoomControls from "./ZoomControls";
import ThemePicker from "./ThemePicker";
import HorizonModePicker from "./HorizonModePicker";
import FilterPanel from "./FilterPanel";
import {useSettingsStore} from "../../store/settingsStore";
import {useUIStore} from "../../store/uiStore";
import {useTheme} from "../../hooks/useTheme";

/**
 * ControlBar — renders as either floating overlay or bottom dock.
 * Editorial design matching the Editor sidebar visual language.
 */
export default function ControlBar() {
  const theme = useTheme();
  const controlLayout = useSettingsStore((s) => s.controlLayout);
  const setControlLayout = useSettingsStore((s) => s.setControlLayout);
  const openEditor = useUIStore((s) => s.openEditor);
  const editorOpen = useUIStore((s) => s.editorOpen);
  const lookingBack = useUIStore((s) => s.lookingBack);
  const toggleLookBack = useUIStore((s) => s.toggleLookBack);

  const toggleLayout = () => setControlLayout(controlLayout === "float" ? "dock" : "float");

  /* ─── DOCK MODE ────────────────────────────────────── */
  if (controlLayout === "dock") {
    return (
      <div
        className="fixed bottom-0 left-0 right-0 z-40"
        style={{
          background: theme.uiBackground,
          borderTop: `3px solid ${theme.uiAccent}`,
          backdropFilter: "blur(24px)",
          color: theme.uiText,
          boxShadow: "0 -4px 40px rgba(0,0,0,0.18)",
        }}>
        {/* Ghost brand watermark */}
        <div
          className="pointer-events-none select-none absolute left-1/2"
          style={{
            top: "50%",
            transform: "translate(-50%, -50%) rotate(-1.5deg)",
            fontSize: "28px",
            fontWeight: 900,
            letterSpacing: "0.22em",
            opacity: 0.04,
            color: theme.uiText,
            whiteSpace: "nowrap",
          }}>
          GOAL HORIZONS
        </div>

        <div style={{display: "flex", alignItems: "stretch", padding: "0", position: "relative"}}>
          {/* Left: navigate group */}
          <div className="dock-group" style={{borderRight: `1px solid ${theme.uiBorder}`}}>
            <ZoomControls compact />
          </div>

          <div className="dock-group" style={{borderRight: `1px solid ${theme.uiBorder}`}}>
            <FilterPanel compact />
          </div>

          {/* Center: scene group */}
          <div className="dock-group dock-group--center" style={{borderRight: `1px solid ${theme.uiBorder}`, flex: 1, justifyContent: "center"}}>
            <ThemePicker compact />
          </div>

          <div className="dock-group dock-group--center" style={{borderRight: `1px solid ${theme.uiBorder}`, flex: 1, justifyContent: "center"}}>
            <HorizonModePicker compact />
          </div>

          {/* Right: actions group */}
          <div className="dock-group" style={{gap: "6px"}}>
            {/* Past toggle */}
            <button
              onClick={toggleLookBack}
              className="ctrl-action-btn"
              title={lookingBack ? "Look forward (future)" : "Look back (past)"}
              style={{
                background: lookingBack ? theme.uiAccent + "22" : "transparent",
                color: lookingBack ? theme.uiAccent : theme.uiText,
                border: `2px solid ${lookingBack ? theme.uiAccent : theme.uiBorder}`,
                fontWeight: lookingBack ? 800 : 600,
                opacity: lookingBack ? 1 : 0.55,
              }}>
              <span style={{fontSize: "12px"}}>{lookingBack ? "↺" : "↻"}</span>
              <span style={{fontSize: "9px", letterSpacing: "0.18em", textTransform: "uppercase"}}>Past</span>
            </button>

            {/* Editor CTA */}
            <button
              onClick={() => openEditor()}
              className="dock-editor-btn"
              style={{
                background: editorOpen ? theme.uiAccent : theme.uiAccent,
                color: "#fff",
              }}>
              <span style={{fontSize: "11px"}}>✎</span>
              <span style={{fontSize: "9px", letterSpacing: "0.18em", textTransform: "uppercase", fontWeight: 800}}>EDITOR</span>
              <span style={{fontSize: "11px", opacity: 0.7}}>→</span>
            </button>

            {/* Layout toggle */}
            <button
              onClick={toggleLayout}
              className="ctrl-layout-btn"
              title="Switch to floating controls"
              style={{
                color: theme.uiText,
                border: `2px solid ${theme.uiBorder}`,
              }}>
              ⊞
            </button>
          </div>
        </div>
      </div>
    );
  }

  /* ─── FLOAT MODE ───────────────────────────────────── */
  return (
    <>
      {/* Top-left: Scene controls (Theme + Horizon) */}
      <div className="fixed top-4 left-4 z-40" style={{display: "flex", flexDirection: "column", gap: "6px"}}>
        <div
          className="ctrl-panel"
          style={{
            background: `linear-gradient(135deg, ${theme.uiAccent}0a, ${theme.uiBackground})`,
            borderLeft: `3px solid ${theme.uiAccent}`,
            color: theme.uiText,
          }}>
          <ThemePicker />
        </div>
        <div
          className="ctrl-panel"
          style={{
            background: `linear-gradient(135deg, ${theme.uiAccent}0a, ${theme.uiBackground})`,
            borderLeft: `3px solid ${theme.uiAccent}55`,
            color: theme.uiText,
          }}>
          <HorizonModePicker />
        </div>
      </div>

      {/* Bottom-left: Navigation controls (Zoom + Filter) */}
      <div className="fixed bottom-4 left-4 z-40" style={{display: "flex", alignItems: "flex-end", gap: "6px"}}>
        <div
          className="ctrl-panel"
          style={{
            background: `linear-gradient(135deg, ${theme.uiAccent}08, ${theme.uiBackground})`,
            borderLeft: `3px solid ${theme.uiAccent}`,
            color: theme.uiText,
          }}>
          <ZoomControls />
        </div>
        <div
          className="ctrl-panel"
          style={{
            background: `linear-gradient(135deg, ${theme.uiAccent}08, ${theme.uiBackground})`,
            borderLeft: `3px solid ${theme.uiAccent}55`,
            color: theme.uiText,
          }}>
          <FilterPanel />
        </div>
      </div>

      {/* Top-right: Actions (below the date widget which sits at top-5 z-50) */}
      <div className="fixed top-24 right-4 z-40" style={{display: "flex", alignItems: "center", gap: "8px"}}>
        {/* Past toggle */}
        <button
          onClick={toggleLookBack}
          className="ctrl-action-btn float-ctrl-shadow"
          title={lookingBack ? "Look forward (future)" : "Look back (past)"}
          style={{
            background: lookingBack ? `linear-gradient(135deg, ${theme.uiAccent}22, ${theme.uiBackground})` : theme.uiBackground,
            color: lookingBack ? theme.uiAccent : theme.uiText,
            border: `2px solid ${lookingBack ? theme.uiAccent : theme.uiBorder}`,
            fontWeight: lookingBack ? 800 : 600,
            opacity: lookingBack ? 1 : 0.65,
            backdropFilter: "blur(20px)",
          }}>
          <span style={{fontSize: "13px"}}>{lookingBack ? "↺" : "↻"}</span>
          <span style={{fontSize: "9px", letterSpacing: "0.18em", textTransform: "uppercase"}}>PAST</span>
        </button>

        {/* Editor CTA */}
        <button
          onClick={() => openEditor()}
          className="float-editor-btn float-ctrl-shadow"
          style={{
            background: theme.uiAccent,
            color: "#fff",
            backdropFilter: "blur(20px)",
          }}>
          {/* Ghost text */}
          <span
            aria-hidden="true"
            className="pointer-events-none select-none absolute inset-0 flex items-center justify-center overflow-hidden"
            style={{
              fontSize: "32px",
              fontWeight: 900,
              letterSpacing: "-0.05em",
              opacity: 0.12,
              color: "#fff",
            }}>
            ✎
          </span>
          <span style={{fontSize: "11px", position: "relative"}}>✎</span>
          <span style={{fontSize: "10px", fontWeight: 800, letterSpacing: "0.2em", textTransform: "uppercase", position: "relative"}}>EDITOR</span>
          <span style={{fontSize: "13px", opacity: 0.7, position: "relative"}}>→</span>
        </button>

        {/* Layout toggle */}
        <button
          onClick={toggleLayout}
          className="ctrl-layout-btn float-ctrl-shadow"
          title="Switch to dock controls"
          style={{
            background: theme.uiBackground,
            color: theme.uiText,
            border: `2px solid ${theme.uiBorder}`,
            backdropFilter: "blur(20px)",
          }}>
          ⊟
        </button>
      </div>

      {/* Center-bottom: Brand watermark */}
      <div className="fixed bottom-3 left-1/2 -translate-x-1/2 z-30 pointer-events-none">
        <div
          style={{
            fontSize: "9px",
            fontWeight: 900,
            letterSpacing: "0.35em",
            textTransform: "uppercase",
            opacity: 0.18,
            color: theme.uiText,
            transform: "rotate(-0.5deg)",
          }}>
          GOAL HORIZONS
        </div>
      </div>
    </>
  );
}
