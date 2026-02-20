import {useSettingsStore} from "../../store/settingsStore";
import {useTheme} from "../../hooks/useTheme";
import {zoomRangeLabel} from "../../utils/dates";

/**
 * ZoomControls — editorial +/− buttons with bold range display.
 */
export default function ZoomControls({compact}: {compact?: boolean}) {
  const theme = useTheme();
  const railPosition = useSettingsStore((s) => s.cameraRailPosition);
  const setCameraRailPosition = useSettingsStore((s) => s.setCameraRailPosition);

  const zoomIn = () => setCameraRailPosition(railPosition - 0.08);
  const zoomOut = () => setCameraRailPosition(railPosition + 0.08);
  const label = zoomRangeLabel(railPosition);

  return (
    <div>
      {/* Section label (hidden in compact/dock mode) */}
      {!compact && (
        <div
          className="ctrl-section-label"
          style={{
            color: theme.uiText,
            transform: "rotate(-1deg)",
            transformOrigin: "left",
            display: "inline-block",
            marginBottom: "8px",
          }}>
          ZOOM
        </div>
      )}
      <div style={{display: "flex", alignItems: "center", gap: "8px"}}>
        <button
          onClick={zoomIn}
          className="ctrl-icon-btn"
          style={{
            background: theme.uiAccent + "22",
            color: theme.uiAccent,
            border: `2px solid ${theme.uiAccent}55`,
          }}
          title="Zoom in (closer goals)">
          +
        </button>
        {/* Range display */}
        <div style={{position: "relative", textAlign: "center", minWidth: "72px"}}>
          <div
            className="pointer-events-none select-none"
            style={{
              position: "absolute",
              top: "50%",
              left: "50%",
              transform: "translate(-50%, -50%)",
              fontSize: "42px",
              fontWeight: 900,
              letterSpacing: "-0.05em",
              opacity: 0.05,
              color: theme.uiText,
              whiteSpace: "nowrap",
              lineHeight: 1,
            }}>
            {label}
          </div>
          <div
            style={{
              fontSize: "13px",
              fontWeight: 800,
              letterSpacing: "-0.01em",
              color: theme.uiAccent,
              lineHeight: 1.2,
              position: "relative",
            }}>
            {label}
          </div>
        </div>
        <button
          onClick={zoomOut}
          className="ctrl-icon-btn"
          style={{
            background: theme.uiAccent + "22",
            color: theme.uiAccent,
            border: `2px solid ${theme.uiAccent}55`,
          }}
          title="Zoom out (farther goals)">
          −
        </button>
      </div>
    </div>
  );
}
