import { differenceInDays, format, parseISO, startOfDay, addDays, isToday, isPast, isFuture } from 'date-fns';

/**
 * Get the number of days between today and a target date.
 * Positive = future, Negative = past.
 */
export function daysFromToday(dateStr: string): number {
    const today = startOfDay(new Date());
    const target = startOfDay(parseISO(dateStr));
    return differenceInDays(target, today);
}

/**
 * Format a date string for display.
 */
export function formatDate(dateStr: string): string {
    return format(parseISO(dateStr), 'MMM d, yyyy');
}

/**
 * Format date with day of week.
 */
export function formatDateWithDay(dateStr: string): string {
    return format(parseISO(dateStr), 'EEE, MMM d, yyyy');
}

/**
 * Get today's date as ISO string.
 */
export function todayISO(): string {
    return format(new Date(), 'yyyy-MM-dd');
}

/**
 * Check if a date is today.
 */
export function isDateToday(dateStr: string): boolean {
    return isToday(parseISO(dateStr));
}

/**
 * Check if a date is in the past.
 */
export function isDatePast(dateStr: string): boolean {
    return isPast(startOfDay(parseISO(dateStr))) && !isToday(parseISO(dateStr));
}

/**
 * Check if a date is in the future.
 */
export function isDateFuture(dateStr: string): boolean {
    return isFuture(startOfDay(parseISO(dateStr)));
}

/**
 * Get a date N days from today as ISO string.
 */
export function dateFromToday(days: number): string {
    return format(addDays(new Date(), days), 'yyyy-MM-dd');
}

/**
 * Get a human-readable relative label.
 */
export function relativeLabel(dateStr: string): string {
    const days = daysFromToday(dateStr);
    if (days === 0) return 'Today';
    if (days === 1) return 'Tomorrow';
    if (days === -1) return 'Yesterday';
    if (days > 0 && days <= 7) return `In ${days} days`;
    if (days < 0 && days >= -7) return `${Math.abs(days)} days ago`;
    return formatDate(dateStr);
}

/**
 * Map a camera rail position (0-1) to a day range.
 * 0 = ~7 days (week view), 1 = ~365 days (year view)
 */
export function railPositionToDayRange(position: number): number {
    const minDays = 7;
    const maxDays = 365;
    // Exponential scaling for more control at near distances
    return Math.round(minDays * Math.pow(maxDays / minDays, position));
}

/**
 * Get a label for the current zoom range.
 */
export function zoomRangeLabel(position: number): string {
    const days = railPositionToDayRange(position);
    if (days <= 10) return '~1 Week';
    if (days <= 21) return '~2 Weeks';
    if (days <= 45) return '~1 Month';
    if (days <= 100) return '~3 Months';
    if (days <= 200) return '~6 Months';
    return '~1 Year';
}
