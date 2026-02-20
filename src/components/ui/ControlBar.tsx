import ZoomControls from "./ZoomControls";
import ThemePicker from "./ThemePicker";
import HorizonModePicker from "./HorizonModePicker";
import FilterPanel from "./FilterPanel";
import {useSettingsStore} from "../../store/settingsStore";
import {useUIStore} from "../../store/uiStore";
import {useTheme} from "../../hooks/useTheme";

/**
 * ControlBar — renders as either floating overlay or bottom dock.
 * Contains: zoom, theme picker, horizon mode, filters, look-back, editor toggle, layout toggle.
 */
export default function ControlBar() {
  const theme = useTheme();
  const controlLayout = useSettingsStore((s) => s.controlLayout);
  const setControlLayout = useSettingsStore((s) => s.setControlLayout);
  const openEditor = useUIStore((s) => s.openEditor);
  const editorOpen = useUIStore((s) => s.editorOpen);
  const lookingBack = useUIStore((s) => s.lookingBack);
  const toggleLookBack = useUIStore((s) => s.toggleLookBack);

  const toggleLayout = () => {
    setControlLayout(controlLayout === "float" ? "dock" : "float");
  };

  if (controlLayout === "dock") {
    return (
      <div
        className="fixed bottom-0 left-0 right-0 z-40 flex items-center justify-between gap-3 px-4 py-2.5"
        style={{
          background: theme.uiBackground,
          borderTop: `1px solid ${theme.uiBorder}`,
          backdropFilter: "blur(20px)",
          color: theme.uiText,
        }}>
        {/* Left group */}
        <div className="flex items-center gap-2">
          <ZoomControls />
          <FilterPanel />
        </div>

        {/* Center group */}
        <div className="flex items-center gap-2">
          <ThemePicker />
          <HorizonModePicker />
        </div>

        {/* Right group */}
        <div className="flex items-center gap-2">
          <button
            onClick={toggleLookBack}
            className="px-3 py-1.5 rounded-lg text-[10px] font-semibold uppercase tracking-wider transition-all"
            style={{
              background: lookingBack ? theme.uiAccent : "rgba(255,255,255,0.08)",
              color: lookingBack ? "#fff" : theme.uiText,
              border: `1px solid ${theme.uiBorder}`,
            }}
            title={lookingBack ? "Look forward (future)" : "Look back (past)"}>
            {lookingBack ? "↺ Past" : "↻ Past"}
          </button>

          <button
            onClick={() => openEditor()}
            className="px-3 py-1.5 rounded-lg text-[10px] font-semibold uppercase tracking-wider transition-all"
            style={{
              background: editorOpen ? theme.uiAccent : "rgba(255,255,255,0.08)",
              color: editorOpen ? "#fff" : theme.uiText,
              border: `1px solid ${theme.uiBorder}`,
            }}>
            ✎ Editor
          </button>

          <button
            onClick={toggleLayout}
            className="w-8 h-8 rounded-lg flex items-center justify-center text-sm transition-all hover:scale-110"
            style={{
              background: "rgba(255,255,255,0.08)",
              color: theme.uiText,
              border: `1px solid ${theme.uiBorder}`,
            }}
            title="Switch to floating controls">
            ⊞
          </button>
        </div>
      </div>
    );
  }

  // Float mode — controls positioned as floating groups
  return (
    <>
      {/* Top-left: Theme & Horizon Mode */}
      <div className="fixed top-4 left-4 z-40 flex flex-col gap-2">
        <div
          className="p-2 rounded-xl shadow-xl"
          style={{
            background: theme.uiBackground,
            border: `1px solid ${theme.uiBorder}`,
            backdropFilter: "blur(20px)",
          }}>
          <ThemePicker />
        </div>
        <div
          className="p-2 rounded-xl shadow-xl"
          style={{
            background: theme.uiBackground,
            border: `1px solid ${theme.uiBorder}`,
            backdropFilter: "blur(20px)",
          }}>
          <HorizonModePicker />
        </div>
      </div>

      {/* Bottom-left: Zoom & Filter */}
      <div className="fixed bottom-4 left-4 z-40 flex items-end gap-2">
        <div
          className="p-2 rounded-xl shadow-xl"
          style={{
            background: theme.uiBackground,
            border: `1px solid ${theme.uiBorder}`,
            backdropFilter: "blur(20px)",
          }}>
          <ZoomControls />
        </div>
        <div
          className="p-2 rounded-xl shadow-xl"
          style={{
            background: theme.uiBackground,
            border: `1px solid ${theme.uiBorder}`,
            backdropFilter: "blur(20px)",
          }}>
          <FilterPanel />
        </div>
      </div>

      {/* Top-right: Editor toggle & Look Back & Layout switch */}
      <div className="fixed top-4 right-4 z-40 flex items-center gap-2">
        <button
          onClick={toggleLookBack}
          className="px-3 py-2 rounded-xl shadow-xl text-[10px] font-semibold uppercase tracking-wider transition-all hover:scale-105"
          style={{
            background: lookingBack ? theme.uiAccent : theme.uiBackground,
            color: lookingBack ? "#fff" : theme.uiText,
            border: `1px solid ${theme.uiBorder}`,
            backdropFilter: "blur(20px)",
          }}
          title={lookingBack ? "Look forward (future)" : "Look back (past)"}>
          {lookingBack ? "↺ Past" : "↻ Past"}
        </button>

        <button
          onClick={() => openEditor()}
          className="px-3 py-2 rounded-xl shadow-xl text-[10px] font-semibold uppercase tracking-wider transition-all hover:scale-105"
          style={{
            background: theme.uiAccent,
            color: "#fff",
            border: `1px solid ${theme.uiBorder}`,
            backdropFilter: "blur(20px)",
          }}>
          ✎ Editor
        </button>

        <button
          onClick={toggleLayout}
          className="w-9 h-9 rounded-xl shadow-xl flex items-center justify-center text-sm transition-all hover:scale-110"
          style={{
            background: theme.uiBackground,
            color: theme.uiText,
            border: `1px solid ${theme.uiBorder}`,
            backdropFilter: "blur(20px)",
          }}
          title="Switch to dock controls">
          ⊟
        </button>
      </div>

      {/* Center-bottom: App name */}
      <div className="fixed bottom-4 left-1/2 -translate-x-1/2 z-30 pointer-events-none">
        <div className="text-[10px] font-bold uppercase tracking-[0.3em] opacity-30" style={{color: theme.uiText}}>
          Goal Horizons
        </div>
      </div>
    </>
  );
}
