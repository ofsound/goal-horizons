import { beforeEach, describe, expect, it } from 'vitest';
import { sanitizeGoalBackup, useGoalStore } from './goalStore';
import type { Goal } from '../types/goal';

function makeGoal(overrides: Partial<Goal> = {}): Goal {
    return {
        id: 'goal-default',
        title: 'Default goal',
        date: '2026-06-01',
        description: '',
        notes: '',
        createdAt: '2026-06-01T12:00:00.000Z',
        updatedAt: '2026-06-01T12:00:00.000Z',
        ...overrides,
    };
}

describe('goal store', () => {
    beforeEach(() => {
        localStorage.clear();
        useGoalStore.setState({
            goals: [
                makeGoal({ id: 'goal-1', title: 'Write proposal' }),
                makeGoal({ id: 'goal-2', title: 'Morning run' }),
            ],
        });
    });

    it('adds, updates, and deletes goals', () => {
        const id = useGoalStore.getState().addGoal({
            title: 'Read a book',
            date: '2026-06-03',
            description: 'One chapter.',
            notes: '',
        });

        expect(useGoalStore.getState().goals.find((goal) => goal.id === id)?.title).toBe('Read a book');

        useGoalStore.getState().updateGoal(id, { title: 'Read two chapters' });
        expect(useGoalStore.getState().goals.find((goal) => goal.id === id)?.title).toBe('Read two chapters');

        useGoalStore.getState().deleteGoal(id);
        expect(useGoalStore.getState().goals.some((goal) => goal.id === id)).toBe(false);
    });

    it('imports and exports goals without stripped feature data', () => {
        const goal = makeGoal({ id: 'goal-imported', title: 'Imported goal' });

        useGoalStore.getState().importGoals({ goals: [goal] });

        expect(useGoalStore.getState().exportData()).toEqual({ goals: [goal] });
    });

    it('sanitizes legacy persisted goals down to the current shape', () => {
        const sanitized = sanitizeGoalBackup({
            goals: [
                {
                    ...makeGoal({ id: 'legacy-goal' }),
                    legacyField: 'old value',
                    oldNestedData: [{ id: 'old-child' }],
                },
            ],
            oldCollection: [{ id: 'old-record' }],
        });

        expect(sanitized.goals).toEqual([makeGoal({ id: 'legacy-goal' })]);
    });
});
