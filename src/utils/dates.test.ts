import { afterEach, describe, expect, it, vi } from 'vitest';
import { dateFromToday, daysFromToday, relativeLabel, todayISO, zoomRangeLabel } from './dates';

describe('date utilities', () => {
    afterEach(() => {
        vi.useRealTimers();
    });

    it('calculates dates relative to today and simulated time', () => {
        vi.setSystemTime(new Date('2026-06-01T12:00:00Z'));

        expect(todayISO()).toBe('2026-06-01');
        expect(dateFromToday(7)).toBe('2026-06-08');
        expect(daysFromToday('2026-06-04')).toBe(3);
        expect(daysFromToday('2026-06-04', 2)).toBe(1);
    });

    it('formats relative labels for nearby and distant dates', () => {
        vi.setSystemTime(new Date('2026-06-01T12:00:00Z'));

        expect(relativeLabel('2026-06-01')).toBe('Today');
        expect(relativeLabel('2026-06-02')).toBe('Tomorrow');
        expect(relativeLabel('2026-05-31')).toBe('Yesterday');
        expect(relativeLabel('2026-06-10')).toBe('Jun 10, 2026');
    });

    it('maps rail positions to user-facing zoom labels', () => {
        expect(zoomRangeLabel(0)).toBe('~1 Week');
        expect(zoomRangeLabel(0.4)).toBe('~1 Month');
        expect(zoomRangeLabel(1)).toBe('~1 Year');
    });
});
