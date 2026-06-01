import { describe, expect, it } from 'vitest';
import type { GoalBackup } from './goalImport';
import { parseGoalBackupJson, validateGoalBackup } from './goalImport';

const validBackup: GoalBackup = {
    categories: [{ id: 'cat-work', name: 'Work', color: '#3b82f6' }],
    goals: [
        {
            id: 'goal-1',
            title: 'Ship baseline',
            date: '2026-06-10',
            category: 'cat-work',
            priority: 'high',
            description: 'Prepare the project for future development.',
            isRecurring: false,
            subTasks: [{ id: 'task-1', title: 'Add tests', done: true }],
            progressPercent: 50,
            tags: ['maintenance'],
            links: ['https://example.com'],
            notes: 'Keep import files strict.',
            createdAt: '2026-06-01T12:00:00.000Z',
            updatedAt: '2026-06-01T12:00:00.000Z',
        },
    ],
};

describe('goal import validation', () => {
    it('accepts a valid goal backup', () => {
        expect(validateGoalBackup(validBackup)).toBe(true);
        expect(parseGoalBackupJson(JSON.stringify(validBackup))).toEqual(validBackup);
    });

    it('rejects malformed backup data', () => {
        expect(validateGoalBackup({ goals: [{ title: 'Missing fields' }], categories: [] })).toBe(false);
        expect(() => parseGoalBackupJson('{"goals":[],"categories":[{"id":"x","name":"Bad","color":"blue"}]}')).toThrow(
            'Backup must include valid goals and categories.',
        );
    });
});
