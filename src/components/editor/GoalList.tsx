import {useMemo, useState} from "react";
import {useGoalStore} from "../../store/goalStore";
import {useUIStore} from "../../store/uiStore";
import {useSettingsStore} from "../../store/settingsStore";
import {useTheme} from "../../hooks/useTheme";
import {formatDateWithDay, daysFromToday, relativeLabel} from "../../utils/dates";
import type {Goal} from "../../types/goal";

/**
 * GoalList — traditional calendar-style list of all goals, grouped by date.
 * Searchable, with edit/delete actions.
 */
export default function GoalList() {
  const theme = useTheme();
  const goals = useGoalStore((s) => s.goals);
  const deleteGoal = useGoalStore((s) => s.deleteGoal);
  const openEditor = useUIStore((s) => s.openEditor);
  const simulatedDaysAhead = useSettingsStore((s) => s.simulatedDaysAhead);
  const [search, setSearch] = useState("");

  // Filter and sort
  const sortedGoals = useMemo(() => {
    let filtered = goals;
    if (search.trim()) {
      const q = search.toLowerCase();
      filtered = goals.filter((goal) => goal.title.toLowerCase().includes(q) || goal.description.toLowerCase().includes(q) || goal.notes.toLowerCase().includes(q));
    }
    return [...filtered].sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
  }, [goals, search]);

  // Group by date
  const grouped = useMemo(() => {
    const map = new Map<string, Goal[]>();
    sortedGoals.forEach((g) => {
      const existing = map.get(g.date) || [];
      existing.push(g);
      map.set(g.date, existing);
    });
    return Array.from(map.entries());
  }, [sortedGoals]);

  return (
    <div>
      {/* ── Section Title ───────────────────── */}
      <div className="relative mb-5">
        <p
          className="pointer-events-none select-none absolute -top-1 -left-1"
          style={{
            fontSize: "72px",
            fontWeight: 900,
            lineHeight: 0.85,
            letterSpacing: "-0.04em",
            opacity: 0.04,
            color: theme.uiText,
            whiteSpace: "nowrap",
          }}>
          ALL
        </p>
        <div style={{paddingTop: "4px"}}>
          <h2
            style={{
              fontSize: "28px",
              fontWeight: 900,
              lineHeight: 1,
              letterSpacing: "-0.03em",
              color: theme.uiText,
            }}>
            ALL GOALS
          </h2>
          <p
            style={{
              fontSize: "11px",
              fontWeight: 500,
              letterSpacing: "0.15em",
              textTransform: "uppercase",
              opacity: 0.4,
              marginTop: "4px",
            }}>
            {goals.length} total · sorted by date
          </p>
        </div>
      </div>

      {/* ── Search ──────────────────────────── */}
      <div className="relative mb-6">
        <span className="absolute left-0 top-1/2 -translate-y-1/2 text-sm pointer-events-none" style={{opacity: 0.35, color: theme.uiText}}>
          ⌕
        </span>
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full text-sm outline-none bg-transparent pl-6 pr-2 pb-2"
          placeholder="Search goals..."
          style={{
            color: theme.uiText,
            borderBottom: `2px solid ${theme.uiBorder}`,
            caretColor: theme.uiAccent,
          }}
        />
      </div>

      {/* ── Goal Groups ─────────────────────── */}
      <div style={{display: "flex", flexDirection: "column", gap: "28px"}}>
        {grouped.length === 0 && (
          <div
            style={{
              textAlign: "center",
              padding: "40px 0",
              opacity: 0.3,
              fontSize: "13px",
              fontStyle: "italic",
            }}>
            {search ? "Nothing matches." : "No goals yet — create one!"}
          </div>
        )}

        {grouped.map(([date, dateGoals]) => {
          const days = daysFromToday(date, simulatedDaysAhead);
          const isPast = days < 0;
          const isToday = days === 0;
          const relLabel = relativeLabel(date, simulatedDaysAhead);
          const dateParts = formatDateWithDay(date).split(", ");
          const dayMonth = dateParts[0] ?? "";
          const yearPart = dateParts[1] ?? "";

          return (
            <div key={date} style={{opacity: isPast ? 0.55 : 1}}>
              {/* Date Header */}
              <div className="relative flex items-end gap-3 mb-3" style={{minHeight: "36px"}}>
                {/* Ghost day number */}
                <div
                  className="pointer-events-none select-none absolute -left-2"
                  style={{
                    fontSize: "64px",
                    fontWeight: 900,
                    lineHeight: 1,
                    letterSpacing: "-0.05em",
                    opacity: 0.055,
                    color: isToday ? theme.uiAccent : theme.uiText,
                    top: "-10px",
                  }}>
                  {new Date(date + "T12:00:00").getDate().toString().padStart(2, "0")}
                </div>
                <div style={{paddingLeft: "2px", zIndex: 1}}>
                  <div
                    style={{
                      fontSize: "12px",
                      fontWeight: 800,
                      letterSpacing: "0.12em",
                      textTransform: "uppercase",
                      color: isToday ? theme.uiAccent : theme.uiText,
                    }}>
                    {dayMonth}
                  </div>
                  <div
                    style={{
                      fontSize: "10px",
                      fontWeight: 500,
                      letterSpacing: "0.08em",
                      opacity: 0.45,
                      color: theme.uiText,
                      marginTop: "1px",
                    }}>
                    {yearPart}
                  </div>
                </div>
                {/* Relative badge */}
                <span
                  className={isToday ? "goal-badge-today" : "goal-badge"}
                  style={{
                    background: isToday ? theme.uiAccent : "transparent",
                    color: isToday ? "#fff" : theme.uiAccent,
                    border: isToday ? "none" : `1px solid ${theme.uiAccent}55`,
                    transform: isToday ? "rotate(-2deg)" : "none",
                  }}>
                  {relLabel}
                </span>
                {/* Divider */}
                <div
                  className="flex-1"
                  style={{
                    height: "1px",
                    background: `linear-gradient(to right, ${theme.uiBorder}, transparent)`,
                    marginBottom: "4px",
                  }}
                />
              </div>

              {/* Goal Cards */}
              <div style={{display: "flex", flexDirection: "column", gap: "6px"}}>
                {dateGoals.map((goal) => {
                  return (
                    <div
                      key={goal.id}
                      className="goal-card group"
                      onClick={() => openEditor(goal.id)}
                      style={{
                        borderLeft: `4px solid ${theme.uiAccent}`,
                        background: `linear-gradient(to right, ${theme.uiAccent}0d, transparent 60%)`,
                        cursor: "pointer",
                        padding: "10px 10px 10px 12px",
                        borderRadius: "0 6px 6px 0",
                        position: "relative",
                      }}>
                      {/* Title row */}
                      <div className="flex items-start justify-between gap-2">
                        <span
                          style={{
                            fontSize: "14px",
                            fontWeight: 700,
                            lineHeight: 1.3,
                            color: theme.uiText,
                            letterSpacing: "-0.01em",
                            flex: 1,
                          }}>
                          {goal.title}
                        </span>
                        <div className="flex items-center gap-1 shrink-0">
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              deleteGoal(goal.id);
                            }}
                            className="goal-delete-btn"
                            title="Delete"
                            style={{color: theme.uiText}}>
                            ×
                          </button>
                        </div>
                      </div>

                      {/* Meta row */}
                      <div className="flex items-center flex-wrap mt-1" style={{gap: "6px"}}>
                        {goal.description && <span className="goal-meta-chip" style={{background: "transparent", color: theme.uiText, opacity: 0.45}}>Description</span>}
                        {goal.notes && <span className="goal-meta-chip" style={{background: "transparent", color: theme.uiText, opacity: 0.45}}>Notes</span>}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
