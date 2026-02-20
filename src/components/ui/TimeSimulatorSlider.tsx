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
      <div
        className="fixed top-5 right-5 z-50 pointer-events-none"
        style={{opacity: 1}}>
        <div
          key={dateBlinkKey}
          className="time-sim-date-overlay px-3 py-2 rounded-xl"
          style={{
            background: "rgba(0,0,0,0.12)",
            border: `1px solid ${theme.uiBorder}`,
            backdropFilter: "blur(4px)",
          }}>
          <div
            style={{
              fontSize: "44px",
              lineHeight: 1,
              fontWeight: 900,
              letterSpacing: "-0.03em",
              color: theme.uiText,
              opacity: 0.72,
            }}>
            {simulatedDate}
          </div>
          <div
            style={{
              fontSize: "11px",
              fontWeight: 700,
              letterSpacing: "0.15em",
              textTransform: "uppercase",
              color: theme.uiAccent,
              opacity: 0.85,
              marginTop: "4px",
            }}>
            +{simulatedDaysAhead} days
          </div>
        </div>
      </div>

      <div
        className="fixed right-4 top-1/2 -translate-y-1/2 z-40 p-2 rounded-xl shadow-xl"
        style={{
          background: theme.uiBackground,
          border: `1px solid ${theme.uiBorder}`,
          backdropFilter: "blur(18px)",
        }}>
        <div className="text-[9px] font-semibold uppercase tracking-[0.16em] text-center mb-2" style={{color: theme.uiText, opacity: 0.75}}>
          Time Sim
        </div>

        <div className="flex flex-col items-center">
          <input
            type="range"
            min={0}
            max={maxSimulatedDays}
            step={1}
            value={Math.min(simulatedDaysAhead, maxSimulatedDays)}
            onChange={(e) => {
              setSimulatedDaysAhead(Number(e.target.value));
            }}
            className="time-sim-slider"
            style={{accentColor: theme.uiAccent}}
            aria-label="Simulate future days"
          />

          <button
            className="mt-2 px-2 py-1 rounded text-[9px] font-semibold uppercase tracking-[0.12em] transition-opacity hover:opacity-85"
            onClick={() => setSimulatedDaysAhead(0)}
            style={{
              color: theme.uiText,
              border: `1px solid ${theme.uiBorder}`,
              background: "rgba(255,255,255,0.05)",
            }}>
            Now
          </button>

          <button
            className="mt-1.5 px-2 py-1 rounded text-[9px] font-semibold uppercase tracking-[0.12em] transition-opacity hover:opacity-85"
            onClick={toggleAutoPlay}
            style={{
              color: isPlaying ? "#ffffff" : theme.uiText,
              border: `1px solid ${theme.uiBorder}`,
              background: isPlaying ? theme.uiAccent : "rgba(255,255,255,0.05)",
            }}>
            {isPlaying ? "Pause" : "Auto Play"}
          </button>
        </div>

        <div className="mt-2 text-center">
          <div className="text-[10px] font-semibold" style={{color: theme.uiText}}>
            +{simulatedDaysAhead}d
          </div>
          <div className="text-[9px] mt-0.5" style={{color: theme.uiText, opacity: 0.7}}>
            {simulatedDate}
          </div>
          <div className="text-[9px] mt-1" style={{color: theme.uiAccent, opacity: 0.85}}>
            {nextGoalDelta === null ? "No upcoming goals" : nextGoalDelta === 0 ? "Goal today" : `Next goal in ${nextGoalDelta}d`}
          </div>
          <div className="text-[8px] mt-1" style={{color: theme.uiText, opacity: 0.5}}>
            {isPlaying ? "Simulating..." : "1 day / 0.85s"}
          </div>
        </div>
      </div>
    </>
  );
}
