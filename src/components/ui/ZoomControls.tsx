import {useSettingsStore} from "../../store/settingsStore";
import {useTheme} from "../../hooks/useTheme";
import {zoomRangeLabel} from "../../utils/dates";

/**
 * ZoomControls — +/− buttons to adjust the camera rail position.
 * Shows the current zoom range label.
 */
export default function ZoomControls() {
  const theme = useTheme();
  const railPosition = useSettingsStore((s) => s.cameraRailPosition);
  const setCameraRailPosition = useSettingsStore((s) => s.setCameraRailPosition);

  const zoomIn = () => setCameraRailPosition(railPosition - 0.08);
  const zoomOut = () => setCameraRailPosition(railPosition + 0.08);

  return (
    <div className="flex items-center gap-1.5">
      <button
        onClick={zoomIn}
        className="w-8 h-8 rounded-lg flex items-center justify-center text-lg font-bold transition-all hover:scale-110 active:scale-95"
        style={{
          background: "rgba(255,255,255,0.12)",
          color: theme.uiText,
          border: `1px solid ${theme.uiBorder}`,
        }}
        title="Zoom in (closer goals)">
        +
      </button>
      <div
        className="px-2 py-1 rounded text-[10px] font-semibold uppercase tracking-wider min-w-16 text-center"
        style={{
          background: "rgba(255,255,255,0.06)",
          color: theme.uiText,
          border: `1px solid ${theme.uiBorder}`,
        }}>
        {zoomRangeLabel(railPosition)}
      </div>
      <button
        onClick={zoomOut}
        className="w-8 h-8 rounded-lg flex items-center justify-center text-lg font-bold transition-all hover:scale-110 active:scale-95"
        style={{
          background: "rgba(255,255,255,0.12)",
          color: theme.uiText,
          border: `1px solid ${theme.uiBorder}`,
        }}
        title="Zoom out (farther goals)">
        −
      </button>
    </div>
  );
}
