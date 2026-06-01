import {useCallback, useState} from "react";
import type {Goal} from "../../types/goal";
import {useGoalStore} from "../../store/goalStore";
import {useUIStore} from "../../store/uiStore";
import {useTheme} from "../../hooks/useTheme";
import {todayISO} from "../../utils/dates";

interface GoalFormProps {
  goalId?: string | null;
  onSaved?: () => void;
}

const createEmptyGoal = () => ({
  title: "",
  date: todayISO(),
  description: "",
  notes: "",
});

type FormState = ReturnType<typeof createEmptyGoal>;

function goalToFormState(goal: Goal): FormState {
  return {
    title: goal.title,
    date: goal.date,
    description: goal.description,
    notes: goal.notes,
  };
}

export default function GoalForm({goalId, onSaved}: GoalFormProps) {
  const theme = useTheme();
  const goals = useGoalStore((s) => s.goals);
  const addGoal = useGoalStore((s) => s.addGoal);
  const updateGoal = useGoalStore((s) => s.updateGoal);
  const deleteGoal = useGoalStore((s) => s.deleteGoal);
  const closeEditor = useUIStore((s) => s.closeEditor);

  const existingGoal = goalId ? goals.find((goal) => goal.id === goalId) : null;
  const isEditing = !!existingGoal;

  const [form, setForm] = useState<FormState>(() => (existingGoal ? goalToFormState(existingGoal) : createEmptyGoal()));
  const [showDelete, setShowDelete] = useState(false);

  const handleChange = useCallback(<K extends keyof FormState>(field: K, value: FormState[K]) => {
    setForm((prev) => ({...prev, [field]: value}));
  }, []);

  const handleSave = useCallback(() => {
    if (!form.title.trim()) return;

    if (isEditing && goalId) {
      updateGoal(goalId, form);
    } else {
      addGoal(form);
    }

    onSaved?.();
    closeEditor();
  }, [form, isEditing, goalId, addGoal, updateGoal, onSaved, closeEditor]);

  const handleDelete = useCallback(() => {
    if (goalId) {
      deleteGoal(goalId);
      closeEditor();
    }
  }, [goalId, deleteGoal, closeEditor]);

  const inputClass = "w-full outline-none bg-transparent pb-2 text-sm transition-colors";
  const labelClass = "ef-label";

  return (
    <div>
      <div className="relative mb-7">
        <div
          className="pointer-events-none select-none absolute right-0 top-0"
          style={{
            fontSize: "60px",
            fontWeight: 900,
            lineHeight: 0.9,
            letterSpacing: "-0.05em",
            opacity: 0.04,
            color: theme.uiText,
          }}>
          {isEditing ? "EDIT" : "NEW"}
        </div>
        <h2
          style={{
            fontSize: "28px",
            fontWeight: 900,
            lineHeight: 1,
            letterSpacing: "-0.03em",
            color: theme.uiText,
          }}>
          {isEditing ? "EDIT GOAL" : "NEW GOAL"}
        </h2>
        <p
          style={{
            fontSize: "11px",
            fontWeight: 500,
            letterSpacing: "0.15em",
            textTransform: "uppercase",
            opacity: 0.35,
            marginTop: "4px",
          }}>
          {isEditing ? "Modify your goal below" : "Set your intention"}
        </p>
      </div>

      <div style={{display: "flex", flexDirection: "column", gap: "22px"}}>
        <div className="ef-field">
          <label className={labelClass} style={{color: theme.uiAccent}}>
            Title
          </label>
          <input
            type="text"
            value={form.title}
            onChange={(e) => handleChange("title", e.target.value)}
            className={inputClass}
            style={{
              color: theme.uiText,
              borderBottom: `2px solid ${form.title ? theme.uiAccent : theme.uiBorder}`,
              fontSize: "15px",
              fontWeight: 600,
            }}
            placeholder="What's the goal?"
            autoFocus
          />
        </div>

        <div className="ef-field">
          <label className={labelClass} style={{color: theme.uiText}}>
            Date
          </label>
          <input
            type="date"
            value={form.date}
            onChange={(e) => handleChange("date", e.target.value)}
            className={inputClass}
            style={{
              color: theme.uiText,
              borderBottom: `2px solid ${theme.uiBorder}`,
              colorScheme: "dark",
            }}
          />
        </div>

        <div className="ef-field">
          <label className={labelClass} style={{color: theme.uiText}}>
            Description
          </label>
          <textarea
            value={form.description}
            onChange={(e) => handleChange("description", e.target.value)}
            className={`${inputClass} resize-none`}
            rows={4}
            style={{
              color: theme.uiText,
              borderLeft: `3px solid ${theme.uiBorder}`,
              paddingLeft: "10px",
              paddingTop: "4px",
              borderBottom: "none",
              marginTop: "8px",
            }}
            placeholder="More details..."
          />
        </div>

        <div className="ef-field">
          <label className={labelClass} style={{color: theme.uiText}}>
            Notes
          </label>
          <textarea
            value={form.notes}
            onChange={(e) => handleChange("notes", e.target.value)}
            className={`${inputClass} resize-none`}
            rows={4}
            style={{
              color: theme.uiText,
              borderLeft: `3px solid ${theme.uiBorder}`,
              paddingLeft: "10px",
              paddingTop: "4px",
              marginTop: "8px",
            }}
            placeholder="Additional notes..."
          />
        </div>

        <div style={{paddingTop: "6px"}}>
          <button
            onClick={handleSave}
            disabled={!form.title.trim()}
            className="ef-save-btn"
            style={{
              background: theme.uiAccent,
              color: "#fff",
              opacity: form.title.trim() ? 1 : 0.3,
            }}>
            <span>{isEditing ? "Save Changes" : "Create Goal"}</span>
            <span className="ef-save-arrow">→</span>
          </button>
          <button
            onClick={closeEditor}
            className="ef-cancel-btn"
            style={{
              color: theme.uiText,
              opacity: 0.5,
            }}>
            Cancel
          </button>
        </div>

        {isEditing && (
          <div style={{paddingTop: "8px", borderTop: `1px solid ${theme.uiBorder}`}}>
            {!showDelete ? (
              <button onClick={() => setShowDelete(true)} className="text-xs transition-colors" style={{color: "#ef4444", opacity: 0.6}}>
                Delete this goal...
              </button>
            ) : (
              <div className="flex items-center gap-3">
                <span className="text-xs font-bold" style={{color: "#ef4444"}}>
                  Are you sure?
                </span>
                <button onClick={handleDelete} className="px-3 py-1 rounded text-xs font-bold" style={{background: "#ef4444", color: "#fff"}}>
                  Delete
                </button>
                <button onClick={() => setShowDelete(false)} className="text-xs opacity-50 hover:opacity-100 transition-opacity" style={{color: theme.uiText}}>
                  Cancel
                </button>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
