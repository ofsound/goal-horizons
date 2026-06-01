import type { Category, Goal, Priority, RecurrenceRule, SubTask } from '../types/goal';

export interface GoalBackup {
    goals: Goal[];
    categories: Category[];
}

const PRIORITIES: Priority[] = ['low', 'medium', 'high'];
const RECURRENCE_RULES: RecurrenceRule[] = ['daily', 'weekly', 'monthly', 'yearly', 'custom'];

function isRecord(value: unknown): value is Record<string, unknown> {
    return typeof value === 'object' && value !== null && !Array.isArray(value);
}

function isStringArray(value: unknown): value is string[] {
    return Array.isArray(value) && value.every((item) => typeof item === 'string');
}

function isIsoDate(value: unknown): value is string {
    return typeof value === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(value);
}

function isIsoDateTime(value: unknown): value is string {
    return typeof value === 'string' && !Number.isNaN(Date.parse(value));
}

function isOptionalIsoDate(value: unknown): value is string | undefined {
    return value === undefined || isIsoDate(value);
}

function isOptionalTime(value: unknown): value is string | undefined {
    return value === undefined || value === '' || (typeof value === 'string' && /^\d{2}:\d{2}$/.test(value));
}

function isSubTask(value: unknown): value is SubTask {
    return (
        isRecord(value) &&
        typeof value.id === 'string' &&
        typeof value.title === 'string' &&
        typeof value.done === 'boolean'
    );
}

function isPriority(value: unknown): value is Priority {
    return typeof value === 'string' && PRIORITIES.includes(value as Priority);
}

function isOptionalRecurrenceRule(value: unknown): value is RecurrenceRule | undefined {
    return value === undefined || (typeof value === 'string' && RECURRENCE_RULES.includes(value as RecurrenceRule));
}

function isCategory(value: unknown): value is Category {
    return (
        isRecord(value) &&
        typeof value.id === 'string' &&
        typeof value.name === 'string' &&
        typeof value.color === 'string' &&
        /^#[0-9a-fA-F]{6}$/.test(value.color)
    );
}

function isGoal(value: unknown): value is Goal {
    return (
        isRecord(value) &&
        typeof value.id === 'string' &&
        typeof value.title === 'string' &&
        isIsoDate(value.date) &&
        typeof value.category === 'string' &&
        isPriority(value.priority) &&
        typeof value.description === 'string' &&
        typeof value.isRecurring === 'boolean' &&
        isOptionalRecurrenceRule(value.recurrenceRule) &&
        isOptionalIsoDate(value.recurrenceEndDate) &&
        Array.isArray(value.subTasks) &&
        value.subTasks.every(isSubTask) &&
        typeof value.progressPercent === 'number' &&
        value.progressPercent >= 0 &&
        value.progressPercent <= 100 &&
        isStringArray(value.tags) &&
        isStringArray(value.links) &&
        typeof value.notes === 'string' &&
        isOptionalTime(value.timeOfDay) &&
        isIsoDateTime(value.createdAt) &&
        isIsoDateTime(value.updatedAt)
    );
}

export function validateGoalBackup(value: unknown): value is GoalBackup {
    return (
        isRecord(value) &&
        Array.isArray(value.goals) &&
        Array.isArray(value.categories) &&
        value.goals.every(isGoal) &&
        value.categories.every(isCategory)
    );
}

export function parseGoalBackupJson(json: string): GoalBackup {
    const parsed: unknown = JSON.parse(json);
    if (!validateGoalBackup(parsed)) {
        throw new Error('Backup must include valid goals and categories.');
    }
    return parsed;
}
