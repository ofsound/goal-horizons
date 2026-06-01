import { describe, expect, it } from 'vitest';
import type { GoalBackup } from './goalImport';
import { parseGoalBackupJson, validateGoalBackup } from './goalImport';

const validBackup: GoalBackup = {
    goals: [
        {
            id: 'goal-1',
            title: 'Ship baseline',
            date: '2026-06-10',
            description: 'Prepare the project for future development.',
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
        expect(validateGoalBackup({ goals: [{ title: 'Missing fields' }] })).toBe(false);
        expect(() => parseGoalBackupJson('{"goals":[{"id":"x","title":"Bad","date":"soon"}]}')).toThrow(
            'Backup must include valid goals.',
        );
    });
});
