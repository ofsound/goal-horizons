import {useState} from "react";
import GoalForm from "./GoalForm";
import GoalList from "./GoalList";
import CategoryManager from "./CategoryManager";
import {useUIStore} from "../../store/uiStore";
import {useGoalStore} from "../../store/goalStore";
import {useTheme} from "../../hooks/useTheme";

type Tab = "form" | "list" | "categories";

/**
 * EditorSidebar — slides in from the right, contains tabs for
 * goal form, goal list, and category manager.
 */
export default function EditorSidebar() {
  const theme = useTheme();
  const editorOpen = useUIStore((s) => s.editorOpen);
  const selectedGoalId = useUIStore((s) => s.selectedGoalId);
  const closeEditor = useUIStore((s) => s.closeEditor);
  const showCategoryManager = useUIStore((s) => s.showCategoryManager);
  const exportData = useGoalStore((s) => s.exportData);
  const importGoals = useGoalStore((s) => s.importGoals);

  const [tab, setTab] = useState<Tab>(selectedGoalId ? "form" : "list");

  // Switch to form tab when a goal is selected
  const effectiveTab = selectedGoalId ? "form" : showCategoryManager ? "categories" : tab;

  const handleExport = () => {
    const data = exportData();
    const blob = new Blob([JSON.stringify(data, null, 2)], {type: "application/json"});
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "goal-horizons-backup.json";
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleImport = () => {
    const input = document.createElement("input");
    input.type = "file";
    input.accept = ".json";
    input.onchange = (e) => {
      const file = (e.target as HTMLInputElement).files?.[0];
      if (file) {
        const reader = new FileReader();
        reader.onload = (ev) => {
          try {
            const data = JSON.parse(ev.target?.result as string);
            if (data.goals && data.categories) {
              importGoals(data);
            }
          } catch {
            alert("Invalid file format");
          }
        };
        reader.readAsText(file);
      }
    };
    input.click();
  };

  const tabDefs: {key: Tab; label: string; shortLabel: string}[] = [
    {key: "list", label: "Goals", shortLabel: "GOALS"},
    {key: "form", label: selectedGoalId ? "Edit Goal" : "New Goal", shortLabel: selectedGoalId ? "EDIT" : "NEW"},
    {key: "categories", label: "Categories", shortLabel: "CATS"},
  ];

  return (
    <div
      className="editor-panel fixed top-0 right-0 h-full z-50 flex flex-col"
      style={{
        width: "440px",
        maxWidth: "100vw",
        transform: editorOpen ? "translateX(0)" : "translateX(100%)",
        transition: "transform 0.45s cubic-bezier(0.16, 1, 0.3, 1)",
        background: theme.uiBackground,
        color: theme.uiText,
        borderLeft: `2px solid ${theme.uiBorder}`,
        backdropFilter: "blur(24px)",
        boxShadow: "-8px 0 60px rgba(0,0,0,0.25)",
      }}>
      {/* ── HEADER ─────────────────────────────── */}
      <div
        className="editor-header shrink-0 relative overflow-hidden"
        style={{
          padding: "20px 20px 0 20px",
          borderBottom: `2px solid ${theme.uiBorder}`,
        }}>
        {/* Tilted watermark label */}
        <div
          className="editor-watermark pointer-events-none select-none absolute"
          style={{
            top: "6px",
            right: "52px",
            transform: "rotate(-12deg)",
            transformOrigin: "right center",
            fontSize: "10px",
            fontWeight: 900,
            letterSpacing: "0.25em",
            opacity: 0.18,
            color: theme.uiAccent,
          }}>
          ✦ EDITOR
        </div>

        {/* Top row: brand + controls */}
        <div className="flex items-start justify-between mb-4">
          <div>
            <div
              className="inline-block px-2 py-0.5 mb-2 text-[9px] font-black tracking-[0.3em] uppercase rounded-sm"
              style={{
                background: theme.uiAccent,
                color: "#fff",
                letterSpacing: "0.3em",
              }}>
              GOAL HORIZONS
            </div>
            <div className="flex items-baseline gap-2">
              <span
                style={{
                  fontSize: "26px",
                  fontWeight: 900,
                  lineHeight: 1,
                  letterSpacing: "-0.03em",
                  color: theme.uiText,
                }}>
                EDITOR
              </span>
              <span
                style={{
                  fontSize: "11px",
                  fontWeight: 500,
                  opacity: 0.4,
                  letterSpacing: "0.12em",
                  textTransform: "uppercase",
                  paddingBottom: "2px",
                }}>
                v1
              </span>
            </div>
          </div>

          {/* Controls */}
          <div className="flex items-center gap-1 pt-1">
            <button onClick={handleExport} className="editor-util-btn" title="Export Data" style={{color: theme.uiText}}>
              ↓
            </button>
            <button onClick={handleImport} className="editor-util-btn" title="Import Data" style={{color: theme.uiText}}>
              ↑
            </button>
            <button
              onClick={closeEditor}
              className="editor-close-btn"
              style={{
                background: theme.uiAccent + "22",
                color: theme.uiAccent,
                border: `1px solid ${theme.uiAccent}44`,
              }}>
              ✕
            </button>
          </div>
        </div>

        {/* Tab bar */}
        <div className="flex gap-0 relative">
          {tabDefs.map((t) => {
            const isActive = effectiveTab === t.key;
            return (
              <button
                key={t.key}
                onClick={() => {
                  setTab(t.key);
                  if (t.key !== "form") useUIStore.getState().selectGoal(null);
                  const isCatOpen = useUIStore.getState().showCategoryManager;
                  if (t.key === "categories" && !isCatOpen) {
                    useUIStore.getState().toggleCategoryManager();
                  } else if (t.key !== "categories" && isCatOpen) {
                    useUIStore.getState().toggleCategoryManager();
                  }
                }}
                className="editor-tab"
                style={{
                  color: isActive ? theme.uiAccent : theme.uiText,
                  opacity: isActive ? 1 : 0.4,
                  borderBottom: isActive ? `3px solid ${theme.uiAccent}` : "3px solid transparent",
                  fontWeight: isActive ? 800 : 600,
                }}>
                {t.shortLabel}
              </button>
            );
          })}
        </div>
      </div>

      {/* ── CONTENT ────────────────────────────── */}
      <div className="flex-1 overflow-y-auto sidebar-scroll" style={{padding: "24px 20px"}}>
        {effectiveTab === "form" && <GoalForm goalId={selectedGoalId} />}
        {effectiveTab === "list" && <GoalList />}
        {effectiveTab === "categories" && <CategoryManager />}
      </div>
    </div>
  );
}
