import {useState} from "react";
import {useGoalStore} from "../../store/goalStore";
import {useTheme} from "../../hooks/useTheme";

const PRESET_COLORS = ["#3b82f6", "#8b5cf6", "#10b981", "#f59e0b", "#ec4899", "#ef4444", "#06b6d4", "#84cc16", "#f97316", "#6366f1", "#14b8a6", "#e879f9", "#a3e635", "#fb923c", "#38bdf8"];

/**
 * CategoryManager — CRUD for goal categories with name and color.
 */
export default function CategoryManager() {
  const theme = useTheme();
  const categories = useGoalStore((s) => s.categories);
  const addCategory = useGoalStore((s) => s.addCategory);
  const updateCategory = useGoalStore((s) => s.updateCategory);
  const deleteCategory = useGoalStore((s) => s.deleteCategory);

  const [newName, setNewName] = useState("");
  const [newColor, setNewColor] = useState(PRESET_COLORS[0]);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editName, setEditName] = useState("");
  const [editColor, setEditColor] = useState("");

  const handleAdd = () => {
    if (newName.trim()) {
      addCategory(newName.trim(), newColor);
      setNewName("");
      setNewColor(PRESET_COLORS[Math.floor(Math.random() * PRESET_COLORS.length)]);
    }
  };

  const startEdit = (id: string) => {
    const cat = categories.find((c) => c.id === id);
    if (cat) {
      setEditingId(id);
      setEditName(cat.name);
      setEditColor(cat.color);
    }
  };

  const saveEdit = () => {
    if (editingId && editName.trim()) {
      updateCategory(editingId, {name: editName.trim(), color: editColor});
      setEditingId(null);
    }
  };

  return (
    <div>
      {/* ── Section Title ───────────────────── */}
      <div className="relative mb-6">
        <div
          className="pointer-events-none select-none absolute right-0 top-0"
          style={{
            fontSize: "56px",
            fontWeight: 900,
            lineHeight: 0.9,
            letterSpacing: "-0.05em",
            opacity: 0.04,
            color: theme.uiText,
          }}>
          CATS
        </div>
        <h2
          style={{
            fontSize: "28px",
            fontWeight: 900,
            lineHeight: 1,
            letterSpacing: "-0.03em",
            color: theme.uiText,
          }}>
          CATEGORIES
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
          {categories.length} categories
        </p>
      </div>

      {/* ── Existing Categories ─────────────── */}
      <div style={{display: "flex", flexDirection: "column", gap: "4px", marginBottom: "24px"}}>
        {categories.map((cat) => (
          <div key={cat.id}>
            {editingId === cat.id ? (
              /* Edit mode */
              <div
                className="ef-cat-edit-row"
                style={{
                  borderLeft: `4px solid ${editColor}`,
                  background: `${editColor}0d`,
                }}>
                <input type="text" value={editName} onChange={(e) => setEditName(e.target.value)} className="flex-1 bg-transparent outline-none text-sm font-semibold" style={{color: theme.uiText}} autoFocus onKeyDown={(e) => e.key === "Enter" && saveEdit()} />
                <div style={{display: "flex", gap: "3px", flexWrap: "wrap", maxWidth: "120px"}}>
                  {PRESET_COLORS.slice(0, 10).map((c) => (
                    <button
                      key={c}
                      className="ef-color-dot"
                      onClick={() => setEditColor(c)}
                      style={{
                        backgroundColor: c,
                        transform: editColor === c ? "scale(1.35)" : "scale(1)",
                        boxShadow: editColor === c ? `0 0 0 2px ${theme.uiText}55` : "none",
                      }}
                    />
                  ))}
                </div>
                <button onClick={saveEdit} className="ef-add-btn text-xs" style={{background: theme.uiAccent, color: "#fff"}}>
                  Save
                </button>
                <button onClick={() => setEditingId(null)} className="text-xs opacity-50 hover:opacity-100 transition-opacity" style={{color: theme.uiText}}>
                  ✕
                </button>
              </div>
            ) : (
              /* View mode */
              <div
                className="ef-cat-row group"
                style={{
                  borderLeft: `4px solid ${cat.color}`,
                  background: `${cat.color}0d`,
                }}>
                <div className="ef-cat-color-swatch" style={{backgroundColor: cat.color}} />
                <span
                  style={{
                    flex: 1,
                    fontSize: "13px",
                    fontWeight: 700,
                    letterSpacing: "-0.01em",
                    color: theme.uiText,
                  }}>
                  {cat.name}
                </span>
                <button onClick={() => startEdit(cat.id)} className="ef-cat-action-btn" style={{color: theme.uiText}}>
                  Edit
                </button>
                <button onClick={() => deleteCategory(cat.id)} className="ef-cat-action-btn" style={{color: "#ef4444"}}>
                  Delete
                </button>
              </div>
            )}
          </div>
        ))}
      </div>

      {/* ── Add New Category ────────────────── */}
      <div
        style={{
          paddingTop: "20px",
          borderTop: `2px solid ${theme.uiBorder}`,
        }}>
        <div
          style={{
            fontSize: "10px",
            fontWeight: 800,
            letterSpacing: "0.25em",
            textTransform: "uppercase",
            opacity: 0.45,
            color: theme.uiText,
            marginBottom: "12px",
            transform: "rotate(-1deg)",
            transformOrigin: "left",
            display: "inline-block",
          }}>
          + New Category
        </div>
        <div style={{display: "flex", gap: "8px", marginBottom: "10px"}}>
          <input
            type="text"
            value={newName}
            onChange={(e) => setNewName(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleAdd()}
            className="flex-1 bg-transparent outline-none text-sm pb-2"
            style={{
              color: theme.uiText,
              borderBottom: `2px solid ${newName ? newColor : theme.uiBorder}`,
              transition: "border-color 0.2s",
            }}
            placeholder="Category name..."
          />
          <button
            onClick={handleAdd}
            disabled={!newName.trim()}
            className="ef-add-btn"
            style={{
              background: newName.trim() ? newColor : theme.uiBorder,
              color: "#fff",
              opacity: newName.trim() ? 1 : 0.5,
            }}>
            Add
          </button>
        </div>
        {/* Color palette */}
        <div style={{display: "flex", flexWrap: "wrap", gap: "5px"}}>
          {PRESET_COLORS.map((c) => (
            <button
              key={c}
              className="ef-color-dot"
              onClick={() => setNewColor(c)}
              style={{
                backgroundColor: c,
                width: "18px",
                height: "18px",
                transform: newColor === c ? "scale(1.35)" : "scale(1)",
                boxShadow: newColor === c ? `0 0 0 2px ${theme.uiText}55` : "none",
              }}
            />
          ))}
        </div>
      </div>
    </div>
  );
}
