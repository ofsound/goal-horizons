import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { v4 as uuidv4 } from 'uuid';
import type { Goal, Category, SubTask, FilterState } from '../types/goal';
import { todayISO } from '../utils/dates';

interface GoalStore {
    goals: Goal[];
    categories: Category[];
    filters: FilterState;

    // Goal CRUD
    addGoal: (goal: Omit<Goal, 'id' | 'createdAt' | 'updatedAt'>) => string;
    updateGoal: (id: string, updates: Partial<Omit<Goal, 'id' | 'createdAt'>>) => void;
    deleteGoal: (id: string) => void;
    duplicateGoal: (id: string) => string | null;

    // SubTask helpers
    addSubTask: (goalId: string, title: string) => void;
    toggleSubTask: (goalId: string, subTaskId: string) => void;
    removeSubTask: (goalId: string, subTaskId: string) => void;

    // Category CRUD
    addCategory: (name: string, color: string) => string;
    updateCategory: (id: string, updates: Partial<Omit<Category, 'id'>>) => void;
    deleteCategory: (id: string) => void;

    // Filters
    setFilters: (filters: Partial<FilterState>) => void;
    clearFilters: () => void;

    // Derived
    getFilteredGoals: () => Goal[];
    getGoalsByDate: (date: string) => Goal[];
    getCategoryById: (id: string) => Category | undefined;

    // Bulk
    importGoals: (data: { goals: Goal[]; categories: Category[] }) => void;
    exportData: () => { goals: Goal[]; categories: Category[] };
}

const DEFAULT_CATEGORIES: Category[] = [
    { id: 'cat-work', name: 'Work', color: '#3b82f6' },
    { id: 'cat-personal', name: 'Personal', color: '#8b5cf6' },
    { id: 'cat-health', name: 'Health', color: '#10b981' },
    { id: 'cat-finance', name: 'Finance', color: '#f59e0b' },
    { id: 'cat-learning', name: 'Learning', color: '#ec4899' },
];

// Generate sample goals for demo
function generateSampleGoals(): Goal[] {
    const now = new Date().toISOString();
    return [
        {
            id: uuidv4(),
            title: 'Finish project proposal',
            date: todayISO(),
            category: 'cat-work',
            priority: 'high',
            description: 'Complete the Q1 project proposal and send for review.',
            isRecurring: false,
            subTasks: [
                { id: uuidv4(), title: 'Draft outline', done: true },
                { id: uuidv4(), title: 'Write executive summary', done: false },
                { id: uuidv4(), title: 'Add budget section', done: false },
            ],
            progressPercent: 33,
            tags: ['project', 'urgent'],
            links: [],
            notes: '',
            timeOfDay: '14:00',
            createdAt: now,
            updatedAt: now,
        },
        {
            id: uuidv4(),
            title: 'Morning run',
            date: (() => { const d = new Date(); d.setDate(d.getDate() + 1); return d.toISOString().split('T')[0]; })(),
            category: 'cat-health',
            priority: 'medium',
            description: '5K morning run in the park.',
            isRecurring: true,
            recurrenceRule: 'daily',
            subTasks: [],
            progressPercent: 0,
            tags: ['fitness', 'routine'],
            links: [],
            notes: 'Remember to stretch before!',
            timeOfDay: '07:00',
            createdAt: now,
            updatedAt: now,
        },
        {
            id: uuidv4(),
            title: 'Read "Thinking, Fast and Slow"',
            date: (() => { const d = new Date(); d.setDate(d.getDate() + 3); return d.toISOString().split('T')[0]; })(),
            category: 'cat-learning',
            priority: 'low',
            description: 'Continue reading chapter 5-8.',
            isRecurring: false,
            subTasks: [],
            progressPercent: 45,
            tags: ['books', 'psychology'],
            links: [],
            notes: '',
            createdAt: now,
            updatedAt: now,
        },
        {
            id: uuidv4(),
            title: 'Review investment portfolio',
            date: (() => { const d = new Date(); d.setDate(d.getDate() + 7); return d.toISOString().split('T')[0]; })(),
            category: 'cat-finance',
            priority: 'high',
            description: 'Quarterly portfolio rebalancing review.',
            isRecurring: false,
            subTasks: [
                { id: uuidv4(), title: 'Review stock allocation', done: false },
                { id: uuidv4(), title: 'Check bond yields', done: false },
            ],
            progressPercent: 0,
            tags: ['finance', 'quarterly'],
            links: [],
            notes: '',
            createdAt: now,
            updatedAt: now,
        },
        {
            id: uuidv4(),
            title: 'Plan birthday party',
            date: (() => { const d = new Date(); d.setDate(d.getDate() + 14); return d.toISOString().split('T')[0]; })(),
            category: 'cat-personal',
            priority: 'medium',
            description: 'Plan surprise birthday party for Sarah.',
            isRecurring: false,
            subTasks: [
                { id: uuidv4(), title: 'Book venue', done: false },
                { id: uuidv4(), title: 'Send invitations', done: false },
                { id: uuidv4(), title: 'Order cake', done: false },
            ],
            progressPercent: 0,
            tags: ['party', 'friends'],
            links: [],
            notes: 'Theme: tropical luau',
            createdAt: now,
            updatedAt: now,
        },
        {
            id: uuidv4(),
            title: 'Complete online course',
            date: (() => { const d = new Date(); d.setDate(d.getDate() + 30); return d.toISOString().split('T')[0]; })(),
            category: 'cat-learning',
            priority: 'medium',
            description: 'Finish the advanced TypeScript course.',
            isRecurring: false,
            subTasks: [],
            progressPercent: 60,
            tags: ['course', 'typescript'],
            links: ['https://example.com/course'],
            notes: '',
            createdAt: now,
            updatedAt: now,
        },
        {
            id: uuidv4(),
            title: 'Annual health checkup',
            date: (() => { const d = new Date(); d.setDate(d.getDate() + 45); return d.toISOString().split('T')[0]; })(),
            category: 'cat-health',
            priority: 'high',
            description: 'Schedule and complete annual physical exam.',
            isRecurring: true,
            recurrenceRule: 'yearly',
            subTasks: [],
            progressPercent: 0,
            tags: ['health', 'annual'],
            links: [],
            notes: 'Dr. Johnson\'s office',
            timeOfDay: '09:30',
            createdAt: now,
            updatedAt: now,
        },
        {
            id: uuidv4(),
            title: 'Team offsite planning',
            date: (() => { const d = new Date(); d.setDate(d.getDate() + 5); return d.toISOString().split('T')[0]; })(),
            category: 'cat-work',
            priority: 'medium',
            description: 'Prepare agenda for the Q2 team offsite.',
            isRecurring: false,
            subTasks: [],
            progressPercent: 20,
            tags: ['team', 'offsite'],
            links: [],
            notes: '',
            createdAt: now,
            updatedAt: now,
        },
    ];
}

const emptyFilters: FilterState = {
    categories: [],
    priorities: [],
    searchQuery: '',
};

export const useGoalStore = create<GoalStore>()(
    persist(
        (set, get) => ({
            goals: generateSampleGoals(),
            categories: DEFAULT_CATEGORIES,
            filters: emptyFilters,

            addGoal: (goalData) => {
                const id = uuidv4();
                const now = new Date().toISOString();
                const goal: Goal = {
                    ...goalData,
                    id,
                    createdAt: now,
                    updatedAt: now,
                };
                set((state) => ({ goals: [...state.goals, goal] }));
                return id;
            },

            updateGoal: (id, updates) => {
                set((state) => ({
                    goals: state.goals.map((g) =>
                        g.id === id
                            ? { ...g, ...updates, updatedAt: new Date().toISOString() }
                            : g
                    ),
                }));
            },

            deleteGoal: (id) => {
                set((state) => ({ goals: state.goals.filter((g) => g.id !== id) }));
            },

            duplicateGoal: (id) => {
                const goal = get().goals.find((g) => g.id === id);
                if (!goal) return null;
                const newId = uuidv4();
                const now = new Date().toISOString();
                const newGoal: Goal = {
                    ...goal,
                    id: newId,
                    title: `${goal.title} (copy)`,
                    createdAt: now,
                    updatedAt: now,
                    subTasks: goal.subTasks.map((st) => ({ ...st, id: uuidv4(), done: false })),
                    progressPercent: 0,
                };
                set((state) => ({ goals: [...state.goals, newGoal] }));
                return newId;
            },

            addSubTask: (goalId, title) => {
                const subTask: SubTask = { id: uuidv4(), title, done: false };
                set((state) => ({
                    goals: state.goals.map((g) =>
                        g.id === goalId
                            ? { ...g, subTasks: [...g.subTasks, subTask], updatedAt: new Date().toISOString() }
                            : g
                    ),
                }));
            },

            toggleSubTask: (goalId, subTaskId) => {
                set((state) => ({
                    goals: state.goals.map((g) =>
                        g.id === goalId
                            ? {
                                ...g,
                                subTasks: g.subTasks.map((st) =>
                                    st.id === subTaskId ? { ...st, done: !st.done } : st
                                ),
                                updatedAt: new Date().toISOString(),
                            }
                            : g
                    ),
                }));
            },

            removeSubTask: (goalId, subTaskId) => {
                set((state) => ({
                    goals: state.goals.map((g) =>
                        g.id === goalId
                            ? {
                                ...g,
                                subTasks: g.subTasks.filter((st) => st.id !== subTaskId),
                                updatedAt: new Date().toISOString(),
                            }
                            : g
                    ),
                }));
            },

            addCategory: (name, color) => {
                const id = uuidv4();
                set((state) => ({ categories: [...state.categories, { id, name, color }] }));
                return id;
            },

            updateCategory: (id, updates) => {
                set((state) => ({
                    categories: state.categories.map((c) =>
                        c.id === id ? { ...c, ...updates } : c
                    ),
                }));
            },

            deleteCategory: (id) => {
                set((state) => ({
                    categories: state.categories.filter((c) => c.id !== id),
                    goals: state.goals.map((g) =>
                        g.category === id ? { ...g, category: '' } : g
                    ),
                }));
            },

            setFilters: (filters) => {
                set((state) => ({ filters: { ...state.filters, ...filters } }));
            },

            clearFilters: () => {
                set({ filters: emptyFilters });
            },

            getFilteredGoals: () => {
                const { goals, filters } = get();
                let filtered = goals;

                if (filters.categories.length > 0) {
                    filtered = filtered.filter((g) => filters.categories.includes(g.category));
                }

                if (filters.priorities.length > 0) {
                    filtered = filtered.filter((g) => filters.priorities.includes(g.priority));
                }

                if (filters.searchQuery.trim()) {
                    const q = filters.searchQuery.toLowerCase();
                    filtered = filtered.filter(
                        (g) =>
                            g.title.toLowerCase().includes(q) ||
                            g.description.toLowerCase().includes(q) ||
                            g.tags.some((t) => t.toLowerCase().includes(q))
                    );
                }

                return filtered;
            },

            getGoalsByDate: (date) => {
                return get().goals.filter((g) => g.date === date);
            },

            getCategoryById: (id) => {
                return get().categories.find((c) => c.id === id);
            },

            importGoals: (data) => {
                set({ goals: data.goals, categories: data.categories });
            },

            exportData: () => {
                const { goals, categories } = get();
                return { goals, categories };
            },
        }),
        {
            name: 'goal-horizons-goals',
        }
    )
);
