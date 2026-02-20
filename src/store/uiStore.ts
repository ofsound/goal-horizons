import { create } from 'zustand';

interface UIStore {
    editorOpen: boolean;
    selectedGoalId: string | null;
    hoveredGoalId: string | null;
    lookingBack: boolean;
    showCategoryManager: boolean;

    openEditor: (goalId?: string) => void;
    closeEditor: () => void;
    selectGoal: (id: string | null) => void;
    setHoveredGoal: (id: string | null) => void;
    toggleLookBack: () => void;
    setLookingBack: (v: boolean) => void;
    toggleCategoryManager: () => void;
}

export const useUIStore = create<UIStore>()((set) => ({
    editorOpen: false,
    selectedGoalId: null,
    hoveredGoalId: null,
    lookingBack: false,
    showCategoryManager: false,

    openEditor: (goalId) =>
        set({ editorOpen: true, selectedGoalId: goalId ?? null }),

    closeEditor: () =>
        set({ editorOpen: false, selectedGoalId: null }),

    selectGoal: (id) => set({ selectedGoalId: id }),

    setHoveredGoal: (id) => set({ hoveredGoalId: id }),

    toggleLookBack: () => set((s) => ({ lookingBack: !s.lookingBack })),
    setLookingBack: (v) => set({ lookingBack: v }),

    toggleCategoryManager: () =>
        set((s) => ({ showCategoryManager: !s.showCategoryManager })),
}));
