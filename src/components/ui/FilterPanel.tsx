import {useState} from "react";
import {useGoalStore} from "../../store/goalStore";
import {useTheme} from "../../hooks/useTheme";
import type {Priority} from "../../types/goal";

const PRIORITY_OPTIONS: {value: Priority; label: string; color: string}[] = [
  {value: "low", label: "Low", color: "#22c55e"},
  {value: "medium", label: "Med", color: "#f59e0b"},
  {value: "high", label: "High", color: "#ef4444"},
];

/**
 * FilterPanel — editorial multi-select filters for categories and priorities.
 */
export default function FilterPanel({compact}: {compact?: boolean}) {
  const theme = useTheme();
  const categories = useGoalStore((s) => s.categories);
  const filters = useGoalStore((s) => s.filters);
  const setFilters = useGoalStore((s) => s.setFilters);
  const clearFilters = useGoalStore((s) => s.clearFilters);
  const [expanded, setExpanded] = useState(false);

  const hasActiveFilters = filters.categories.length > 0 || filters.priorities.length > 0;
  const activeCount = filters.categories.length + filters.priorities.length;

  const toggleCategory = (catId: string) => {
    const current = filters.categories;
    setFilters({categories: current.includes(catId) ? current.filter((c) => c !== catId) : [...current, catId]});
  };

  const togglePriority = (p: Priority) => {
    const current = filters.priorities;
    setFilters({priorities: current.includes(p) ? current.filter((x) => x !== p) : [...current, p]});
  };

  return (
    <div style={{position: "relative"}}>
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
          FILTER
        </div>
      )}
      <button
        onClick={() => setExpanded(!expanded)}
        className="ctrl-filter-btn"
        style={{
          background: hasActiveFilters ? theme.uiAccent : "transparent",
          color: hasActiveFilters ? "#fff" : theme.uiText,
          border: `2px solid ${hasActiveFilters ? theme.uiAccent : theme.uiBorder}`,
          fontWeight: hasActiveFilters ? 800 : 600,
        }}>
        <span style={{fontSize: "11px"}}>⊳</span>
        <span style={{fontSize: "9px", letterSpacing: "0.18em", textTransform: "uppercase"}}>Filter</span>
        {hasActiveFilters && (
          <span
            style={{
              background: "rgba(255,255,255,0.3)",
              color: "#fff",
              fontSize: "8px",
              fontWeight: 900,
              padding: "1px 5px",
              borderRadius: "8px",
              letterSpacing: "0.05em",
            }}>
            {activeCount}
          </span>
        )}
      </button>

      {/* Expanded panel */}
      {expanded && (
        <div
          className="ctrl-filter-panel"
          style={{
            background: theme.uiBackground,
            borderLeft: `4px solid ${theme.uiAccent}`,
            color: theme.uiText,
          }}>
          {/* Ghost label */}
          <div
            className="pointer-events-none select-none"
            style={{
              position: "absolute",
              top: "4px",
              right: "8px",
              fontSize: "44px",
              fontWeight: 900,
              letterSpacing: "-0.05em",
              opacity: 0.04,
              color: theme.uiText,
              lineHeight: 1,
            }}>
            FILTER
          </div>

          {/* Categories */}
          <div style={{marginBottom: "14px"}}>
            <div className="ctrl-section-label" style={{color: theme.uiText, transform: "none", display: "block", marginBottom: "8px"}}>
              CATEGORIES
            </div>
            <div style={{display: "flex", flexWrap: "wrap", gap: "5px"}}>
              {categories.map((cat) => {
                const active = filters.categories.includes(cat.id);
                return (
                  <button
                    key={cat.id}
                    onClick={() => toggleCategory(cat.id)}
                    className="ef-category-pill"
                    style={{
                      background: active ? cat.color : "transparent",
                      color: active ? "#fff" : theme.uiText,
                      border: `2px solid ${active ? cat.color : theme.uiBorder}`,
                      fontWeight: active ? 700 : 500,
                      opacity: active ? 1 : 0.55,
                      padding: "3px 10px",
                    }}>
                    <span className="w-2 h-2 rounded-full shrink-0" style={{backgroundColor: active ? "rgba(255,255,255,0.6)" : cat.color}} />
                    <span style={{fontSize: "10px", letterSpacing: "0.05em"}}>{cat.name}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Priorities */}
          <div style={{marginBottom: "10px"}}>
            <div className="ctrl-section-label" style={{color: theme.uiText, transform: "none", display: "block", marginBottom: "8px"}}>
              PRIORITY
            </div>
            <div style={{display: "flex", gap: "5px"}}>
              {PRIORITY_OPTIONS.map((opt) => {
                const active = filters.priorities.includes(opt.value);
                return (
                  <button
                    key={opt.value}
                    onClick={() => togglePriority(opt.value)}
                    className="ef-priority-btn"
                    style={{
                      background: active ? opt.color : "transparent",
                      color: active ? "#fff" : theme.uiText,
                      border: `2px solid ${active ? opt.color : theme.uiBorder}`,
                      fontWeight: active ? 800 : 500,
                      opacity: active ? 1 : 0.5,
                    }}>
                    {opt.label}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Clear */}
          {hasActiveFilters && (
            <button
              onClick={clearFilters}
              style={{
                fontSize: "10px",
                color: theme.uiAccent,
                background: "transparent",
                border: "none",
                cursor: "pointer",
                letterSpacing: "0.08em",
                textTransform: "uppercase",
                fontWeight: 700,
                opacity: 0.7,
                padding: 0,
              }}
              onMouseEnter={(e) => (e.currentTarget.style.opacity = "1")}
              onMouseLeave={(e) => (e.currentTarget.style.opacity = "0.7")}>
              × Clear all
            </button>
          )}
        </div>
      )}
    </div>
  );
}
