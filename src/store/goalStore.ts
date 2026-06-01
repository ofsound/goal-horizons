import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { v4 as uuidv4 } from 'uuid';
import type { Goal } from '../types/goal';
import { todayISO } from '../utils/dates';

interface GoalStore {
    goals: Goal[];

    addGoal: (goal: Omit<Goal, 'id' | 'createdAt' | 'updatedAt'>) => string;
    updateGoal: (id: string, updates: Partial<Omit<Goal, 'id' | 'createdAt'>>) => void;
    deleteGoal: (id: string) => void;
    importGoals: (data: { goals: Goal[] }) => void;
    exportData: () => { goals: Goal[] };
}

function futureDate(daysAhead: number): string {
    const date = new Date();
    date.setDate(date.getDate() + daysAhead);
    return date.toISOString().split('T')[0];
}

function generateSampleGoals(): Goal[] {
    const now = new Date().toISOString();
    return [
        {
            id: uuidv4(),
            title: 'Finish project proposal',
            date: todayISO(),
            description: 'Complete the Q1 project proposal and send for review.',
            notes: '',
            createdAt: now,
            updatedAt: now,
        },
        {
            id: uuidv4(),
            title: 'Morning run',
            date: futureDate(1),
            description: '5K morning run in the park.',
            notes: 'Remember to stretch before.',
            createdAt: now,
            updatedAt: now,
        },
        {
            id: uuidv4(),
            title: 'Read "Thinking, Fast and Slow"',
            date: futureDate(3),
            description: 'Continue reading chapter 5-8.',
            notes: '',
            createdAt: now,
            updatedAt: now,
        },
        {
            id: uuidv4(),
            title: 'Review investment portfolio',
            date: futureDate(7),
            description: 'Quarterly portfolio rebalancing review.',
            notes: '',
            createdAt: now,
            updatedAt: now,
        },
    ];
}

function isRecord(value: unknown): value is Record<string, unknown> {
    return typeof value === 'object' && value !== null && !Array.isArray(value);
}

function sanitizeGoal(value: unknown): Goal | null {
    if (!isRecord(value)) return null;
    if (
        typeof value.id !== 'string' ||
        typeof value.title !== 'string' ||
        typeof value.date !== 'string' ||
        typeof value.description !== 'string' ||
        typeof value.createdAt !== 'string' ||
        typeof value.updatedAt !== 'string'
    ) {
        return null;
    }

    return {
        id: value.id,
        title: value.title,
        date: value.date,
        description: value.description,
        notes: typeof value.notes === 'string' ? value.notes : '',
        createdAt: value.createdAt,
        updatedAt: value.updatedAt,
    };
}

export function sanitizeGoalBackup(value: unknown): { goals: Goal[] } {
    if (!isRecord(value) || !Array.isArray(value.goals)) {
        return { goals: generateSampleGoals() };
    }

    const goals = value.goals.map(sanitizeGoal).filter((goal): goal is Goal => goal !== null);
    return { goals };
}

export const useGoalStore = create<GoalStore>()(
    persist(
        (set, get) => ({
            goals: generateSampleGoals(),

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
                    goals: state.goals.map((goal) =>
                        goal.id === id
                            ? { ...goal, ...updates, updatedAt: new Date().toISOString() }
                            : goal
                    ),
                }));
            },

            deleteGoal: (id) => {
                set((state) => ({ goals: state.goals.filter((goal) => goal.id !== id) }));
            },

            importGoals: (data) => {
                set({ goals: data.goals.map(sanitizeGoal).filter((goal): goal is Goal => goal !== null) });
            },

            exportData: () => {
                const { goals } = get();
                return { goals };
            },
        }),
        {
            name: 'goal-horizons-goals',
            version: 2,
            migrate: sanitizeGoalBackup,
            partialize: (state) => ({ goals: state.goals }),
        }
    )
);
