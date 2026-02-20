import {useEffect, useMemo, useRef, useState} from "react";
import {addDays, differenceInCalendarDays, format, parseISO, startOfDay} from "date-fns";
import {useGoalStore} from "../../store/goalStore";
import {useSettingsStore} from "../../store/settingsStore";
import {useTheme} from "../../hooks/useTheme";
import {daysFromToday} from "../../utils/dates";

/**
 * Floating vertical slider that simulates forward motion through time.
 * Slider step is 1 day.
 */
export default function TimeSimulatorSlider() {
  const theme = useTheme();
  const goals = useGoalStore((s) => s.goals);
  const simulatedDaysAhead = useSettingsStore((s) => s.simulatedDaysAhead);
  const setSimulatedDaysAhead = useSettingsStore((s) => s.setSimulatedDaysAhead);
  const [isPlaying, setIsPlaying] = useState(false);
  const [dateBlinkKey, setDateBlinkKey] = useState(0);
  const didMountRef = useRef(false);

  const maxSimulatedDays = useMemo(() => {
    const now = startOfDay(new Date());
    let furthestFuture = 30;
    goals.forEach((goal) => {
      const delta = differenceInCalendarDays(startOfDay(parseISO(goal.date)), now);
      if (delta > furthestFuture) furthestFuture = delta;
    });
    return Math.max(30, Math.min(3650, furthestFuture + 14));
  }, [goals]);

  useEffect(() => {
    if (simulatedDaysAhead > maxSimulatedDays) {
      setSimulatedDaysAhead(maxSimulatedDays);
    }
  }, [simulatedDaysAhead, maxSimulatedDays, setSimulatedDaysAhead]);

  useEffect(() => {
    if (!isPlaying) return;
    if (simulatedDaysAhead >= maxSimulatedDays) {
      setIsPlaying(false);
      return;
    }

    const timer = window.setInterval(() => {
      const current = useSettingsStore.getState().simulatedDaysAhead;
      const cap = maxSimulatedDays;
      if (current >= cap) {
        setIsPlaying(false);
        return;
      }
      useSettingsStore.getState().setSimulatedDaysAhead(current + 1);
    }, 850);

    return () => window.clearInterval(timer);
  }, [isPlaying, simulatedDaysAhead, maxSimulatedDays]);

  const simulatedDate = useMemo(() => {
    return format(addDays(startOfDay(new Date()), simulatedDaysAhead), "MMM d, yyyy");
  }, [simulatedDaysAhead]);

  const nextGoalDelta = useMemo(() => {
    let closest = Number.POSITIVE_INFINITY;
    goals.forEach((goal) => {
      const delta = daysFromToday(goal.date, simulatedDaysAhead);
      if (delta >= 0 && delta < closest) {
        closest = delta;
      }
    });
    return Number.isFinite(closest) ? closest : null;
  }, [goals, simulatedDaysAhead]);

  const toggleAutoPlay = () => {
    if (isPlaying) {
      setIsPlaying(false);
      return;
    }
    if (simulatedDaysAhead >= maxSimulatedDays) {
      setSimulatedDaysAhead(0);
    }
    setIsPlaying(true);
  };

  useEffect(() => {
    if (!didMountRef.current) {
      didMountRef.current = true;
      return;
    }
    setDateBlinkKey((k) => k + 1);
  }, [simulatedDaysAhead]);

  return (
    <>
      {/* ── Date overlay — top right ── */}
      <div
        className="fixed top-5 right-5 z-50 pointer-events-none"
        style={{opacity: 1}}>
        <div
          key={dateBlinkKey}
          className="time-sim-date-overlay"
          style={{
            background: `linear-gradient(135deg, ${theme.uiAccent}10, ${theme.uiBackground})`,
            borderLeft: `3px solid ${theme.uiAccent}`,
            backdropFilter: "blur(20px)",
            padding: "10px 16px 10px 12px",
            borderRadius: "0 6px 6px 0",
            position: "relative",
            overflow: "hidden",
          }}>
          {/* ghost watermark behind date */}
          <div
            aria-hidden="true"
            className="pointer-events-none select-none absolute"
            style={{
              top: "50%",
              right: "-8px",
              transform: "translateY(-50%)",
              fontSize: "80px",
              fontWeight: 900,
              letterSpacing: "-0.06em",
              opacity: 0.04,
              color: theme.uiText,
              lineHeight: 1,
            }}>
            {simulatedDate.split(",")[0]}
          </div>
          {/* Tilted section label */}
          <div
            style={{
              fontSize: "8px",
              fontWeight: 800,
              letterSpacing: "0.22em",
              textTransform: "uppercase",
              color: theme.uiText,
              opacity: 0.45,
              marginBottom: "5px",
              transform: "rotate(-1deg)",
              transformOrigin: "left center",
            }}>
            DATE
          </div>
          <div
            style={{
              fontSize: "44px",
              lineHeight: 1,
              fontWeight: 900,
              letterSpacing: "-0.03em",
              color: theme.uiText,
              opacity: 0.82,
              position: "relative",
            }}>
            {simulatedDate}
          </div>
          {simulatedDaysAhead > 0 && (
            <div
              style={{
                fontSize: "10px",
                fontWeight: 800,
                letterSpacing: "0.2em",
                textTransform: "uppercase",
                color: theme.uiAccent,
                marginTop: "5px",
                position: "relative",
              }}>
              +{simulatedDaysAhead} DAYS
            </div>
          )}
        </div>
      </div>

      {/* ── Vertical time slider panel — right side ── */}
      <div
        className="fixed right-4 top-1/2 -translate-y-1/2 z-40"
        style={{
          background: `linear-gradient(180deg, ${theme.uiAccent}0d, ${theme.uiBackground})`,
          borderLeft: `3px solid ${theme.uiAccent}`,
          backdropFilter: "blur(24px)",
          padding: "14px 10px 14px 12px",
          minWidth: "72px",
          overflow: "hidden",
          boxShadow: "-4px 0 20px rgba(0,0,0,0.12)",
        }}>

        {/* Ghost watermark */}
        <div
          aria-hidden="true"
          className="pointer-events-none select-none absolute"
          style={{
            top: "50%",
            left: "50%",
            transform: "translate(-50%, -50%) rotate(-90deg)",
            fontSize: "52px",
            fontWeight: 900,
            letterSpacing: "0.15em",
            opacity: 0.04,
            color: theme.uiText,
            whiteSpace: "nowrap",
          }}>
          TIME
        </div>

        {/* Section label */}
        <div
          style={{
            fontSize: "8px",
            fontWeight: 800,
            letterSpacing: "0.22em",
            textTransform: "uppercase",
            color: theme.uiText,
            opacity: 0.45,
            textAlign: "center",
            transform: "rotate(-1.5deg)",
            transformOrigin: "center",
            marginBottom: "10px",
            position: "relative",
          }}>
          TIME SIM
        </div>

        {/* Big offset display */}
        <div style={{textAlign: "center", marginBottom: "8px", position: "relative"}}>
          <div
            style={{
              fontSize: "26px",
              fontWeight: 900,
              lineHeight: 1,
              letterSpacing: "-0.04em",
              color: theme.uiAccent,
            }}>
            +{simulatedDaysAhead}
          </div>
          <div
            style={{
              fontSize: "8px",
              fontWeight: 700,
              letterSpacing: "0.18em",
              textTransform: "uppercase",
              color: theme.uiText,
              opacity: 0.45,
              marginTop: "2px",
            }}>
            days
          </div>
        </div>

        {/* Slider */}
        <div className="flex flex-col items-center" style={{position: "relative"}}>
          <input
            type="range"
            min={0}
            max={maxSimulatedDays}
            step={1}
            value={Math.min(simulatedDaysAhead, maxSimulatedDays)}
            onChange={(e) => setSimulatedDaysAhead(Number(e.target.value))}
            className="time-sim-slider"
            style={{accentColor: theme.uiAccent}}
            aria-label="Simulate future days"
          />
        </div>

        {/* NOW button */}
        <button
          onClick={() => setSimulatedDaysAhead(0)}
          style={{
            display: "block",
            width: "100%",
            padding: "4px 0",
            marginTop: "8px",
            fontSize: "8px",
            fontWeight: 800,
            letterSpacing: "0.2em",
            textTransform: "uppercase",
            textAlign: "center",
            color: simulatedDaysAhead === 0 ? theme.uiAccent : theme.uiText,
            background: simulatedDaysAhead === 0 ? `${theme.uiAccent}22` : "transparent",
            border: `1.5px solid ${simulatedDaysAhead === 0 ? theme.uiAccent : theme.uiBorder}`,
            borderRadius: "3px",
            cursor: "pointer",
            opacity: simulatedDaysAhead === 0 ? 1 : 0.6,
            transition: "all 0.15s ease",
          }}>
          NOW
        </button>

        {/* AUTO PLAY button */}
        <button
          onClick={toggleAutoPlay}
          style={{
            display: "block",
            width: "100%",
            padding: "4px 0",
            marginTop: "4px",
            fontSize: "8px",
            fontWeight: 800,
            letterSpacing: "0.14em",
            textTransform: "uppercase",
            textAlign: "center",
            color: isPlaying ? "#fff" : theme.uiText,
            background: isPlaying ? theme.uiAccent : "transparent",
            border: `1.5px solid ${isPlaying ? theme.uiAccent : theme.uiBorder}`,
            borderRadius: "3px",
            cursor: "pointer",
            transition: "all 0.15s ease",
          }}>
          {isPlaying ? "⏸ PAUSE" : "▶ PLAY"}
        </button>

        {/* Divider */}
        <div
          style={{
            height: "1px",
            background: theme.uiBorder,
            opacity: 0.4,
            margin: "10px 0 8px",
          }}
        />

        {/* Stats */}
        <div style={{textAlign: "center", position: "relative"}}>
          <div
            style={{
              fontSize: "8px",
              fontWeight: 600,
              color: theme.uiText,
              opacity: 0.6,
              lineHeight: 1.6,
              letterSpacing: "0.02em",
            }}>
            {simulatedDate}
          </div>
          <div
            style={{
              fontSize: "8px",
              fontWeight: 800,
              letterSpacing: "0.08em",
              color: theme.uiAccent,
              marginTop: "4px",
            }}>
            {nextGoalDelta === null
              ? "No upcoming"
              : nextGoalDelta === 0
              ? "Goal today"
              : `Next in ${nextGoalDelta}d`}
          </div>
          <div
            style={{
              fontSize: "7px",
              letterSpacing: "0.06em",
              color: theme.uiText,
              opacity: 0.3,
              marginTop: "3px",
              fontStyle: isPlaying ? "italic" : "normal",
            }}>
            {isPlaying ? "Simulating..." : "1 day / 0.85s"}
          </div>
        </div>
      </div>
    </>
  );
}
