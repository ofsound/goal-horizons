import type { Goal } from '../types/goal';

export interface GoalBackup {
    goals: Goal[];
}

function isRecord(value: unknown): value is Record<string, unknown> {
    return typeof value === 'object' && value !== null && !Array.isArray(value);
}

function isIsoDate(value: unknown): value is string {
    return typeof value === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(value);
}

function isIsoDateTime(value: unknown): value is string {
    return typeof value === 'string' && !Number.isNaN(Date.parse(value));
}

function isGoal(value: unknown): value is Goal {
    return (
        isRecord(value) &&
        typeof value.id === 'string' &&
        typeof value.title === 'string' &&
        isIsoDate(value.date) &&
        typeof value.description === 'string' &&
        typeof value.notes === 'string' &&
        isIsoDateTime(value.createdAt) &&
        isIsoDateTime(value.updatedAt)
    );
}

export function validateGoalBackup(value: unknown): value is GoalBackup {
    return isRecord(value) && Array.isArray(value.goals) && value.goals.every(isGoal);
}

export function parseGoalBackupJson(json: string): GoalBackup {
    const parsed: unknown = JSON.parse(json);
    if (!validateGoalBackup(parsed)) {
        throw new Error('Backup must include valid goals.');
    }
    return parsed;
}
