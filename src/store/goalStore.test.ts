import { beforeEach, describe, expect, it } from 'vitest';
import { useGoalStore } from './goalStore';
import type { Category, Goal } from '../types/goal';

const categories: Category[] = [
    { id: 'cat-work', name: 'Work', color: '#3b82f6' },
    { id: 'cat-health', name: 'Health', color: '#10b981' },
];

function makeGoal(overrides: Partial<Goal>): Goal {
    return {
        id: 'goal-default',
        title: 'Default goal',
        date: '2026-06-01',
        category: 'cat-work',
        priority: 'medium',
        description: '',
        isRecurring: false,
        subTasks: [],
        progressPercent: 0,
        tags: [],
        links: [],
        notes: '',
        createdAt: '2026-06-01T12:00:00.000Z',
        updatedAt: '2026-06-01T12:00:00.000Z',
        ...overrides,
    };
}

describe('goal store filtering', () => {
    beforeEach(() => {
        localStorage.clear();
        useGoalStore.setState({
            categories,
            goals: [
                makeGoal({
                    id: 'goal-1',
                    title: 'Write proposal',
                    category: 'cat-work',
                    priority: 'high',
                    tags: ['client'],
                    description: 'Draft the project proposal.',
                }),
                makeGoal({
                    id: 'goal-2',
                    title: 'Morning run',
                    category: 'cat-health',
                    priority: 'low',
                    tags: ['fitness'],
                    description: 'Five kilometers.',
                }),
            ],
            filters: {
                categories: [],
                priorities: [],
                searchQuery: '',
            },
        });
    });

    it('filters goals by category, priority, and search query', () => {
        useGoalStore.getState().setFilters({
            categories: ['cat-work'],
            priorities: ['high'],
            searchQuery: 'proposal',
        });

        expect(useGoalStore.getState().getFilteredGoals().map((goal) => goal.id)).toEqual(['goal-1']);
    });

    it('clears filters back to showing all goals', () => {
        useGoalStore.getState().setFilters({ categories: ['cat-health'] });
        expect(useGoalStore.getState().getFilteredGoals().map((goal) => goal.id)).toEqual(['goal-2']);

        useGoalStore.getState().clearFilters();
        expect(useGoalStore.getState().getFilteredGoals().map((goal) => goal.id)).toEqual(['goal-1', 'goal-2']);
    });

    it('reassigns goals to uncategorized when deleting a category', () => {
        useGoalStore.getState().deleteCategory('cat-health');

        expect(useGoalStore.getState().categories.map((category) => category.id)).toEqual(['cat-work']);
        expect(useGoalStore.getState().goals.find((goal) => goal.id === 'goal-2')?.category).toBe('');
    });
});
