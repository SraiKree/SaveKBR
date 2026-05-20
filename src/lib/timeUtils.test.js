import { describe, test, expect } from 'vitest';
import * as fc from 'fast-check';
import { timeAgo, isHistorical } from './timeUtils';

const MS_IN_DAY = 24 * 60 * 60 * 1000;

// ---------------------------------------------------------------------------
// Property 12: Relative Time Formatting
// Feature: tree-felling-reports
// Validates: Requirements 5.2
// ---------------------------------------------------------------------------
describe('Relative Time Formatting (Property 12)', () => {
    test('timestamps in the last 60 seconds return "just now"', () => {
        fc.assert(
            fc.property(
                fc.integer({ min: 0, max: 59 }),
                (secsAgo) => {
                    const ts = new Date(Date.now() - secsAgo * 1000).toISOString();
                    expect(timeAgo(ts)).toBe('just now');
                }
            ),
            { numRuns: 100 }
        );
    });

    test('timestamps 1–59 minutes ago contain "min" in the output', () => {
        fc.assert(
            fc.property(
                fc.integer({ min: 1, max: 59 }),
                (minsAgo) => {
                    const ts = new Date(Date.now() - minsAgo * 60 * 1000).toISOString();
                    expect(timeAgo(ts)).toMatch(/min/);
                }
            ),
            { numRuns: 100 }
        );
    });

    test('timestamps 1–23 hours ago contain "hr" in the output', () => {
        fc.assert(
            fc.property(
                fc.integer({ min: 1, max: 23 }),
                (hoursAgo) => {
                    const ts = new Date(Date.now() - hoursAgo * 60 * 60 * 1000).toISOString();
                    expect(timeAgo(ts)).toMatch(/hr/);
                }
            ),
            { numRuns: 100 }
        );
    });

    test('timestamps >= 1 day ago contain "day" in the output', () => {
        fc.assert(
            fc.property(
                fc.integer({ min: 1, max: 365 }),
                (daysAgo) => {
                    const ts = new Date(Date.now() - daysAgo * MS_IN_DAY).toISOString();
                    expect(timeAgo(ts)).toMatch(/day/);
                }
            ),
            { numRuns: 100 }
        );
    });

    test('null or undefined timestamp returns empty string', () => {
        expect(timeAgo(null)).toBe('');
        expect(timeAgo(undefined)).toBe('');
    });
});

// ---------------------------------------------------------------------------
// Property 11: Historical Report Indicator
// Feature: tree-felling-reports
// Validates: Requirements 5.4
// ---------------------------------------------------------------------------
describe('Historical Report Indicator (Property 11)', () => {
    const THRESHOLD_DAYS = 30;

    test('reports older than 30 days are marked historical', () => {
        fc.assert(
            fc.property(
                fc.integer({ min: 31, max: 3650 }),
                (daysOld) => {
                    const ts = new Date(Date.now() - daysOld * MS_IN_DAY).toISOString();
                    expect(isHistorical(ts)).toBe(true);
                }
            ),
            { numRuns: 100 }
        );
    });

    test('reports 30 days or newer are NOT marked historical', () => {
        fc.assert(
            fc.property(
                fc.integer({ min: 0, max: 29 }),
                (daysOld) => {
                    const ts = new Date(Date.now() - daysOld * MS_IN_DAY).toISOString();
                    expect(isHistorical(ts)).toBe(false);
                }
            ),
            { numRuns: 100 }
        );
    });

    test('null / undefined timestamps are not historical', () => {
        expect(isHistorical(null)).toBe(false);
        expect(isHistorical(undefined)).toBe(false);
    });

    test('historical threshold is exactly 30 days', () => {
        const justOver = new Date(Date.now() - (THRESHOLD_DAYS + 0.1) * MS_IN_DAY).toISOString();
        const justUnder = new Date(Date.now() - (THRESHOLD_DAYS - 0.1) * MS_IN_DAY).toISOString();
        expect(isHistorical(justOver)).toBe(true);
        expect(isHistorical(justUnder)).toBe(false);
    });
});
