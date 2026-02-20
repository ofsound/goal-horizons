import {useState, useEffect, useCallback} from "react";
import type {Priority, RecurrenceRule, SubTask} from "../../types/goal";
import {useGoalStore} from "../../store/goalStore";
import {useUIStore} from "../../store/uiStore";
import {useTheme} from "../../hooks/useTheme";
import {todayISO} from "../../utils/dates";
import {v4 as uuidv4} from "uuid";

interface GoalFormProps {
  goalId?: string | null;
  onSaved?: () => void;
}

const PRIORITY_OPTIONS: {value: Priority; label: string; color: string}[] = [
  {value: "low", label: "Low", color: "#22c55e"},
  {value: "medium", label: "Medium", color: "#f59e0b"},
  {value: "high", label: "High", color: "#ef4444"},
];

const RECURRENCE_OPTIONS: {value: RecurrenceRule; label: string}[] = [
  {value: "daily", label: "Daily"},
  {value: "weekly", label: "Weekly"},
  {value: "monthly", label: "Monthly"},
  {value: "yearly", label: "Yearly"},
];

const emptyGoal = {
  title: "",
  date: todayISO(),
  category: "",
  priority: "medium" as Priority,
  description: "",
  isRecurring: false,
  recurrenceRule: "weekly" as RecurrenceRule,
  recurrenceEndDate: "",
  subTasks: [] as SubTask[],
  progressPercent: 0,
  tags: [] as string[],
  links: [] as string[],
  notes: "",
  timeOfDay: "",
};

type FormState = typeof emptyGoal;

export default function GoalForm({goalId, onSaved}: GoalFormProps) {
  const theme = useTheme();
  const goals = useGoalStore((s) => s.goals);
  const categories = useGoalStore((s) => s.categories);
  const addGoal = useGoalStore((s) => s.addGoal);
  const updateGoal = useGoalStore((s) => s.updateGoal);
  const deleteGoal = useGoalStore((s) => s.deleteGoal);
  const closeEditor = useUIStore((s) => s.closeEditor);

  const existingGoal = goalId ? goals.find((g) => g.id === goalId) : null;
  const isEditing = !!existingGoal;

  const [form, setForm] = useState(emptyGoal);
  const [tagInput, setTagInput] = useState("");
  const [linkInput, setLinkInput] = useState("");
  const [subTaskInput, setSubTaskInput] = useState("");
  const [showDelete, setShowDelete] = useState(false);

  // Load existing goal data
  useEffect(() => {
    if (existingGoal) {
      setForm({
        title: existingGoal.title,
        date: existingGoal.date,
        category: existingGoal.category,
        priority: existingGoal.priority,
        description: existingGoal.description,
        isRecurring: existingGoal.isRecurring,
        recurrenceRule: existingGoal.recurrenceRule || "weekly",
        recurrenceEndDate: existingGoal.recurrenceEndDate || "",
        subTasks: existingGoal.subTasks,
        progressPercent: existingGoal.progressPercent,
        tags: existingGoal.tags,
        links: existingGoal.links,
        notes: existingGoal.notes,
        timeOfDay: existingGoal.timeOfDay || "",
      });
    } else {
      setForm({
        ...emptyGoal,
        category: categories[0]?.id || "",
      });
    }
    setShowDelete(false);
  }, [existingGoal, goalId, categories]);

  const handleChange = useCallback(<K extends keyof FormState>(field: K, value: FormState[K]) => {
    setForm((prev) => ({...prev, [field]: value}));
  }, []);

  const handleAddTag = useCallback(() => {
    if (tagInput.trim()) {
      setForm((prev) => ({
        ...prev,
        tags: [...prev.tags, tagInput.trim()],
      }));
      setTagInput("");
    }
  }, [tagInput]);

  const handleRemoveTag = useCallback((index: number) => {
    setForm((prev) => ({
      ...prev,
      tags: prev.tags.filter((_, i) => i !== index),
    }));
  }, []);

  const handleAddLink = useCallback(() => {
    if (linkInput.trim()) {
      setForm((prev) => ({
        ...prev,
        links: [...prev.links, linkInput.trim()],
      }));
      setLinkInput("");
    }
  }, [linkInput]);

  const handleRemoveLink = useCallback((index: number) => {
    setForm((prev) => ({
      ...prev,
      links: prev.links.filter((_, i) => i !== index),
    }));
  }, []);

  const handleAddSubTask = useCallback(() => {
    if (subTaskInput.trim()) {
      const newSubTask: SubTask = {
        id: uuidv4(),
        title: subTaskInput.trim(),
        done: false,
      };
      setForm((prev) => ({
        ...prev,
        subTasks: [...prev.subTasks, newSubTask],
      }));
      setSubTaskInput("");
    }
  }, [subTaskInput]);

  const handleToggleSubTask = useCallback((id: string) => {
    setForm((prev) => ({
      ...prev,
      subTasks: prev.subTasks.map((st) => (st.id === id ? {...st, done: !st.done} : st)),
    }));
  }, []);

  const handleRemoveSubTask = useCallback((id: string) => {
    setForm((prev) => ({
      ...prev,
      subTasks: prev.subTasks.filter((st) => st.id !== id),
    }));
  }, []);

  const handleSave = useCallback(() => {
    if (!form.title.trim()) return;

    if (isEditing && goalId) {
      updateGoal(goalId, {
        ...form,
        timeOfDay: form.timeOfDay || undefined,
        recurrenceRule: form.isRecurring ? form.recurrenceRule : undefined,
        recurrenceEndDate: form.isRecurring && form.recurrenceEndDate ? form.recurrenceEndDate : undefined,
      });
    } else {
      addGoal({
        ...form,
        timeOfDay: form.timeOfDay || undefined,
        recurrenceRule: form.isRecurring ? form.recurrenceRule : undefined,
        recurrenceEndDate: form.isRecurring && form.recurrenceEndDate ? form.recurrenceEndDate : undefined,
      });
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
      {/* ── Form Title ──────────────────────── */}
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
        {/* Title */}
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

        {/* Date & Time Row */}
        <div style={{display: "flex", gap: "16px"}}>
          <div className="ef-field" style={{flex: 1}}>
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
          <div className="ef-field" style={{width: "110px"}}>
            <label className={labelClass} style={{color: theme.uiText}}>
              Time
            </label>
            <input
              type="time"
              value={form.timeOfDay}
              onChange={(e) => handleChange("timeOfDay", e.target.value)}
              className={inputClass}
              style={{
                color: theme.uiText,
                borderBottom: `2px solid ${theme.uiBorder}`,
                colorScheme: "dark",
              }}
            />
          </div>
        </div>

        {/* Category */}
        <div className="ef-field">
          <label className={labelClass} style={{color: theme.uiText}}>
            Category
          </label>
          <div style={{display: "flex", flexWrap: "wrap", gap: "6px", marginTop: "8px"}}>
            {categories.map((cat) => (
              <button
                key={cat.id}
                onClick={() => handleChange("category", cat.id)}
                className="ef-category-pill"
                style={{
                  background: form.category === cat.id ? cat.color : "transparent",
                  color: form.category === cat.id ? "#fff" : theme.uiText,
                  border: `2px solid ${form.category === cat.id ? cat.color : theme.uiBorder}`,
                  fontWeight: form.category === cat.id ? 700 : 500,
                }}>
                <span className="w-2 h-2 rounded-full shrink-0" style={{backgroundColor: form.category === cat.id ? "rgba(255,255,255,0.6)" : cat.color}} />
                {cat.name}
              </button>
            ))}
          </div>
        </div>

        {/* Priority */}
        <div className="ef-field">
          <label className={labelClass} style={{color: theme.uiText, transform: "rotate(-1.5deg)", display: "inline-block", transformOrigin: "left"}}>
            Priority
          </label>
          <div style={{display: "flex", gap: "8px", marginTop: "8px"}}>
            {PRIORITY_OPTIONS.map((opt) => {
              const isActive = form.priority === opt.value;
              return (
                <button
                  key={opt.value}
                  onClick={() => handleChange("priority", opt.value)}
                  className="ef-priority-btn"
                  style={{
                    background: isActive ? opt.color : "transparent",
                    color: isActive ? "#fff" : theme.uiText,
                    border: `2px solid ${isActive ? opt.color : theme.uiBorder}`,
                    fontWeight: isActive ? 800 : 500,
                    opacity: isActive ? 1 : 0.55,
                  }}>
                  {opt.label}
                </button>
              );
            })}
          </div>
        </div>

        {/* Description */}
        <div className="ef-field">
          <label className={labelClass} style={{color: theme.uiText}}>
            Description
          </label>
          <textarea
            value={form.description}
            onChange={(e) => handleChange("description", e.target.value)}
            className={`${inputClass} resize-none`}
            rows={3}
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

        {/* Progress */}
        <div className="ef-field">
          <div className="flex items-center justify-between">
            <label className={labelClass} style={{color: theme.uiText}}>
              Progress
            </label>
            <span style={{fontSize: "20px", fontWeight: 900, letterSpacing: "-0.03em", color: theme.uiAccent}}>
              {form.progressPercent}
              <span style={{fontSize: "11px", fontWeight: 500, opacity: 0.6}}>%</span>
            </span>
          </div>
          <div style={{position: "relative", height: "4px", borderRadius: "2px", background: `${theme.uiText}15`, marginTop: "10px"}}>
            <div
              style={{
                position: "absolute",
                top: 0,
                left: 0,
                height: "100%",
                borderRadius: "2px",
                width: `${form.progressPercent}%`,
                background: theme.uiAccent,
                transition: "width 0.2s ease",
              }}
            />
            <input type="range" min={0} max={100} value={form.progressPercent} onChange={(e) => handleChange("progressPercent", parseInt(e.target.value))} className="ef-range-input" style={{accentColor: theme.uiAccent}} />
          </div>
        </div>

        {/* Recurring */}
        <div className="ef-field">
          <label className="flex items-center gap-3 cursor-pointer" style={{fontSize: "13px", fontWeight: 600}}>
            <span className="ef-toggle" style={{background: form.isRecurring ? theme.uiAccent : theme.uiBorder}}>
              <input type="checkbox" checked={form.isRecurring} onChange={(e) => handleChange("isRecurring", e.target.checked)} className="sr-only" />
              <span className="ef-toggle-knob" style={{transform: form.isRecurring ? "translateX(16px)" : "translateX(2px)"}} />
            </span>
            <span style={{color: theme.uiText, opacity: form.isRecurring ? 1 : 0.55}}>Recurring</span>
          </label>
          {form.isRecurring && (
            <div style={{display: "flex", gap: "6px", marginTop: "10px"}}>
              {RECURRENCE_OPTIONS.map((opt) => (
                <button
                  key={opt.value}
                  onClick={() => handleChange("recurrenceRule", opt.value)}
                  className="ef-category-pill"
                  style={{
                    background: form.recurrenceRule === opt.value ? theme.uiAccent : "transparent",
                    color: form.recurrenceRule === opt.value ? "#fff" : theme.uiText,
                    border: `2px solid ${form.recurrenceRule === opt.value ? theme.uiAccent : theme.uiBorder}`,
                    fontWeight: form.recurrenceRule === opt.value ? 700 : 500,
                    opacity: form.recurrenceRule === opt.value ? 1 : 0.55,
                  }}>
                  {opt.label}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Sub-tasks */}
        <div className="ef-field">
          <label className={labelClass} style={{color: theme.uiText, transform: "rotate(-1deg)", display: "inline-block", transformOrigin: "left"}}>
            Sub-tasks
          </label>
          <div style={{display: "flex", flexDirection: "column", gap: "6px", marginTop: "8px"}}>
            {form.subTasks.map((st) => (
              <div key={st.id} className="ef-subtask" style={{borderLeft: `3px solid ${st.done ? theme.uiAccent + "66" : theme.uiAccent}`}}>
                <input type="checkbox" checked={st.done} onChange={() => handleToggleSubTask(st.id)} className="ef-checkbox" style={{accentColor: theme.uiAccent}} />
                <span style={{flex: 1, fontSize: "13px", textDecoration: st.done ? "line-through" : "none", opacity: st.done ? 0.45 : 1, color: theme.uiText}}>{st.title}</span>
                <button onClick={() => handleRemoveSubTask(st.id)} className="goal-delete-btn" style={{color: theme.uiText}}>
                  ×
                </button>
              </div>
            ))}
          </div>
          <div style={{display: "flex", gap: "8px", marginTop: "8px"}}>
            <input
              type="text"
              value={subTaskInput}
              onChange={(e) => setSubTaskInput(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleAddSubTask()}
              className={`flex-1 ${inputClass}`}
              style={{color: theme.uiText, borderBottom: `1px solid ${theme.uiBorder}`}}
              placeholder="Add sub-task..."
            />
            <button onClick={handleAddSubTask} className="ef-add-btn" style={{background: theme.uiAccent, color: "#fff"}}>
              +
            </button>
          </div>
        </div>

        {/* Tags */}
        <div className="ef-field">
          <label className={labelClass} style={{color: theme.uiText}}>
            Tags
          </label>
          <div style={{display: "flex", flexWrap: "wrap", gap: "5px", marginTop: "8px"}}>
            {form.tags.map((tag, i) => (
              <span key={i} className="ef-tag" style={{background: `${theme.uiAccent}18`, color: theme.uiAccent, border: `1px solid ${theme.uiAccent}35`}}>
                #{tag}
                <button onClick={() => handleRemoveTag(i)} className="ml-1 opacity-60 hover:opacity-100 transition-opacity">
                  ×
                </button>
              </span>
            ))}
          </div>
          <div style={{display: "flex", gap: "8px", marginTop: "6px"}}>
            <input type="text" value={tagInput} onChange={(e) => setTagInput(e.target.value)} onKeyDown={(e) => e.key === "Enter" && handleAddTag()} className={`flex-1 ${inputClass}`} style={{color: theme.uiText, borderBottom: `1px solid ${theme.uiBorder}`}} placeholder="Add tag..." />
            <button onClick={handleAddTag} className="ef-add-btn" style={{background: theme.uiAccent, color: "#fff"}}>
              +
            </button>
          </div>
        </div>

        {/* Links */}
        <div className="ef-field">
          <label className={labelClass} style={{color: theme.uiText}}>
            Links
          </label>
          <div style={{display: "flex", flexDirection: "column", gap: "4px", marginTop: "8px"}}>
            {form.links.map((link, i) => (
              <div key={i} className="flex items-center gap-2">
                <a href={link} target="_blank" rel="noopener noreferrer" className="flex-1 text-xs truncate underline" style={{color: theme.uiAccent}}>
                  {link}
                </a>
                <button onClick={() => handleRemoveLink(i)} className="goal-delete-btn" style={{color: theme.uiText}}>
                  ×
                </button>
              </div>
            ))}
          </div>
          <div style={{display: "flex", gap: "8px", marginTop: "6px"}}>
            <input type="url" value={linkInput} onChange={(e) => setLinkInput(e.target.value)} onKeyDown={(e) => e.key === "Enter" && handleAddLink()} className={`flex-1 ${inputClass}`} style={{color: theme.uiText, borderBottom: `1px solid ${theme.uiBorder}`}} placeholder="https://..." />
            <button onClick={handleAddLink} className="ef-add-btn" style={{background: theme.uiAccent, color: "#fff"}}>
              +
            </button>
          </div>
        </div>

        {/* Notes */}
        <div className="ef-field">
          <label className={labelClass} style={{color: theme.uiText}}>
            Notes
          </label>
          <textarea
            value={form.notes}
            onChange={(e) => handleChange("notes", e.target.value)}
            className={`${inputClass} resize-none`}
            rows={3}
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

        {/* Action Buttons */}
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

        {/* Delete */}
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
