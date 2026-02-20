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
 * FilterPanel — multi-select filters for categories and priorities.
 * When active, non-matching billboards fade out in the 3D view.
 */
export default function FilterPanel() {
  const theme = useTheme();
  const categories = useGoalStore((s) => s.categories);
  const filters = useGoalStore((s) => s.filters);
  const setFilters = useGoalStore((s) => s.setFilters);
  const clearFilters = useGoalStore((s) => s.clearFilters);
  const [expanded, setExpanded] = useState(false);

  const hasActiveFilters = filters.categories.length > 0 || filters.priorities.length > 0;

  const toggleCategory = (catId: string) => {
    const current = filters.categories;
    if (current.includes(catId)) {
      setFilters({categories: current.filter((c) => c !== catId)});
    } else {
      setFilters({categories: [...current, catId]});
    }
  };

  const togglePriority = (p: Priority) => {
    const current = filters.priorities;
    if (current.includes(p)) {
      setFilters({priorities: current.filter((x) => x !== p)});
    } else {
      setFilters({priorities: [...current, p]});
    }
  };

  return (
    <div className="relative">
      <button
        onClick={() => setExpanded(!expanded)}
        className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[10px] font-semibold uppercase tracking-wider transition-all"
        style={{
          background: hasActiveFilters ? theme.uiAccent : "rgba(255,255,255,0.08)",
          color: hasActiveFilters ? "#fff" : theme.uiText,
          border: `1px solid ${theme.uiBorder}`,
        }}>
        <span>⊳</span>
        Filter
        {hasActiveFilters && <span className="w-1.5 h-1.5 rounded-full bg-white" />}
      </button>

      {expanded && (
        <div
          className="absolute bottom-full mb-2 left-0 p-3 rounded-xl shadow-2xl min-w-56"
          style={{
            background: theme.uiBackground,
            border: `1px solid ${theme.uiBorder}`,
            backdropFilter: "blur(20px)",
            color: theme.uiText,
          }}>
          {/* Categories */}
          <div className="mb-3">
            <div className="text-[10px] font-bold uppercase tracking-wider opacity-50 mb-1.5">Categories</div>
            <div className="flex flex-wrap gap-1.5">
              {categories.map((cat) => {
                const active = filters.categories.includes(cat.id);
                return (
                  <button
                    key={cat.id}
                    onClick={() => toggleCategory(cat.id)}
                    className="flex items-center gap-1 px-2 py-1 rounded-full text-[10px] font-medium transition-all"
                    style={{
                      background: active ? cat.color : "rgba(255,255,255,0.06)",
                      color: active ? "#fff" : theme.uiText,
                      border: `1px solid ${active ? cat.color : theme.uiBorder}`,
                    }}>
                    <span className="w-1.5 h-1.5 rounded-full" style={{backgroundColor: active ? "#fff" : cat.color}} />
                    {cat.name}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Priorities */}
          <div className="mb-3">
            <div className="text-[10px] font-bold uppercase tracking-wider opacity-50 mb-1.5">Priority</div>
            <div className="flex gap-1.5">
              {PRIORITY_OPTIONS.map((opt) => {
                const active = filters.priorities.includes(opt.value);
                return (
                  <button
                    key={opt.value}
                    onClick={() => togglePriority(opt.value)}
                    className="px-2.5 py-1 rounded-lg text-[10px] font-bold uppercase transition-all"
                    style={{
                      background: active ? opt.color : "rgba(255,255,255,0.06)",
                      color: active ? "#fff" : theme.uiText,
                      border: `1px solid ${active ? opt.color : theme.uiBorder}`,
                    }}>
                    {opt.label}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Clear */}
          {hasActiveFilters && (
            <button onClick={clearFilters} className="text-[10px] opacity-60 hover:opacity-100 transition-opacity underline">
              Clear all filters
            </button>
          )}
        </div>
      )}
    </div>
  );
}
