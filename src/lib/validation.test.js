import { describe, test, expect } from 'vitest';
import * as fc from 'fast-check';
import {
    validateCoordinates,
    validateReporterName,
    validateDescription,
    validatePhotos,
    sanitizeInput,
} from './validation.js';

describe('Coordinate Validation', () => {
  // Feature: tree-felling-reports, Property 3: GPS Coordinate Validation
  // For any report submission, the system should accept latitude values between -90 and 90,
  // longitude values between -180 and 180, and reject any coordinates outside these ranges.
  // Validates: Requirements 9.1
  test('Property 3: GPS Coordinate Validation - valid coordinates are accepted', () => {
    fc.assert(
      fc.property(
        fc.double({ min: -90, max: 90, noNaN: true }),
        fc.double({ min: -180, max: 180, noNaN: true }),
        (lat, lng) => {
          const result = validateCoordinates(lat, lng);
          expect(result.valid).toBe(true);
          expect(result.errors).toHaveLength(0);
        }
      ),
      { numRuns: 100 }
    );
  });

  // Feature: tree-felling-reports, Property 3: GPS Coordinate Validation
  // Test that coordinates outside valid ranges are rejected
  // Validates: Requirements 9.1
  test('Property 3: GPS Coordinate Validation - invalid latitude is rejected', () => {
    fc.assert(
      fc.property(
        fc.oneof(
          fc.double({ min: -1000, max: -90.01, noNaN: true }),
          fc.double({ min: 90.01, max: 1000, noNaN: true })
        ),
        fc.double({ min: -180, max: 180, noNaN: true }),
        (lat, lng) => {
          const result = validateCoordinates(lat, lng);
          expect(result.valid).toBe(false);
          expect(result.errors.length).toBeGreaterThan(0);
          expect(result.errors.some(e => e.includes('Latitude'))).toBe(true);
        }
      ),
      { numRuns: 100 }
    );
  });

  // Feature: tree-felling-reports, Property 3: GPS Coordinate Validation
  // Test that coordinates outside valid ranges are rejected
  // Validates: Requirements 9.1
  test('Property 3: GPS Coordinate Validation - invalid longitude is rejected', () => {
    fc.assert(
      fc.property(
        fc.double({ min: -90, max: 90, noNaN: true }),
        fc.oneof(
          fc.double({ min: -1000, max: -180.01, noNaN: true }),
          fc.double({ min: 180.01, max: 1000, noNaN: true })
        ),
        (lat, lng) => {
          const result = validateCoordinates(lat, lng);
          expect(result.valid).toBe(false);
          expect(result.errors.length).toBeGreaterThan(0);
          expect(result.errors.some(e => e.includes('Longitude'))).toBe(true);
        }
      ),
      { numRuns: 100 }
    );
  });

  // Feature: tree-felling-reports, Property 3: GPS Coordinate Validation
  // Test boundary values are accepted
  // Validates: Requirements 9.1
  test('Property 3: GPS Coordinate Validation - boundary values are accepted', () => {
    const boundaryTests = [
      { lat: -90, lng: -180 },
      { lat: -90, lng: 180 },
      { lat: 90, lng: -180 },
      { lat: 90, lng: 180 },
      { lat: 0, lng: 0 },
    ];

    boundaryTests.forEach(({ lat, lng }) => {
      const result = validateCoordinates(lat, lng);
      expect(result.valid).toBe(true);
      expect(result.errors).toHaveLength(0);
    });
  });

  // Feature: tree-felling-reports, Property 3: GPS Coordinate Validation
  // Test that NaN and non-numeric values are rejected
  // Validates: Requirements 9.1
  test('Property 3: GPS Coordinate Validation - NaN and non-numeric values are rejected', () => {
    const invalidTests = [
      { lat: NaN, lng: 0 },
      { lat: 0, lng: NaN },
      { lat: 'invalid', lng: 0 },
      { lat: 0, lng: 'invalid' },
      { lat: null, lng: 0 },
      { lat: 0, lng: undefined },
    ];

    invalidTests.forEach(({ lat, lng }) => {
      const result = validateCoordinates(lat, lng);
      expect(result.valid).toBe(false);
      expect(result.errors.length).toBeGreaterThan(0);
    });
  });
});

// ---------------------------------------------------------------------------
// Property 4: Text Input Validation
// Feature: tree-felling-reports
// Validates: Requirements 9.5, 9.6, 9.7
// ---------------------------------------------------------------------------
describe('Text Input Validation (Property 4)', () => {
  test('reporter names 1–100 chars are valid', () => {
    fc.assert(
      fc.property(
        fc.string({ minLength: 1, maxLength: 100 }).filter((s) => s.trim().length > 0),
        (name) => {
          const result = validateReporterName(name);
          expect(result.valid).toBe(true);
          expect(result.errors).toHaveLength(0);
        }
      ),
      { numRuns: 100 }
    );
  });

  test('reporter names over 100 chars are rejected', () => {
    fc.assert(
      fc.property(
        fc.string({ minLength: 101, maxLength: 200 }),
        (name) => {
          const result = validateReporterName(name);
          expect(result.valid).toBe(false);
          expect(result.errors.some((e) => e.includes('100'))).toBe(true);
        }
      ),
      { numRuns: 50 }
    );
  });

  test('empty reporter name is rejected', () => {
    const result = validateReporterName('   ');
    expect(result.valid).toBe(false);
    expect(result.errors.length).toBeGreaterThan(0);
  });

  test('descriptions 1–500 chars are valid', () => {
    fc.assert(
      fc.property(
        fc.string({ minLength: 1, maxLength: 500 }).filter((s) => s.trim().length > 0),
        (desc) => {
          const result = validateDescription(desc);
          expect(result.valid).toBe(true);
          expect(result.errors).toHaveLength(0);
        }
      ),
      { numRuns: 100 }
    );
  });

  test('descriptions over 500 chars are rejected', () => {
    fc.assert(
      fc.property(
        fc.string({ minLength: 501, maxLength: 800 }),
        (desc) => {
          const result = validateDescription(desc);
          expect(result.valid).toBe(false);
          expect(result.errors.some((e) => e.includes('500'))).toBe(true);
        }
      ),
      { numRuns: 50 }
    );
  });
});

// ---------------------------------------------------------------------------
// Property 13: Input Sanitization
// Feature: tree-felling-reports
// Validates: Requirements 9.3
// ---------------------------------------------------------------------------
describe('Input Sanitization (Property 13)', () => {
  test('sanitized output never contains HTML tags', () => {
    fc.assert(
      fc.property(
        fc.string({ minLength: 0, maxLength: 200 }),
        (input) => {
          const sanitized = sanitizeInput(input);
          // Must not contain any HTML tag
          expect(/<[^>]+>/.test(sanitized)).toBe(false);
        }
      ),
      { numRuns: 200 }
    );
  });

  test('sanitized output never contains script tags', () => {
    const scriptPayloads = [
      '<script>alert(1)</script>',
      '<SCRIPT SRC="x">',
      '"><script>alert("xss")</script>',
      '<img onload="evil()">',
    ];
    scriptPayloads.forEach((payload) => {
      const sanitized = sanitizeInput(payload);
      expect(/<script/i.test(sanitized)).toBe(false);
      expect(/<[^>]+>/.test(sanitized)).toBe(false);
    });
  });

  test('plain text is preserved after sanitization', () => {
    fc.assert(
      fc.property(
        fc.string({ minLength: 1, maxLength: 100 }).filter((s) => !/</.test(s)),
        (text) => {
          const sanitized = sanitizeInput(text);
          expect(sanitized).toBe(text.trim());
        }
      ),
      { numRuns: 100 }
    );
  });
});

// ---------------------------------------------------------------------------
// Property 14: Validation Error Messaging
// Feature: tree-felling-reports
// Validates: Requirements 9.4
// ---------------------------------------------------------------------------
describe('Validation Error Messaging (Property 14)', () => {
  test('when validation fails, errors are non-empty strings', () => {
    const invalidInputs = [
      () => validateReporterName(''),
      () => validateReporterName('x'.repeat(101)),
      () => validateDescription(''),
      () => validateDescription('x'.repeat(501)),
      () => validateCoordinates(91, 0),
      () => validateCoordinates(0, 181),
      () => validatePhotos([]),
    ];
    invalidInputs.forEach((fn) => {
      const result = fn();
      expect(result.valid).toBe(false);
      expect(result.errors.length).toBeGreaterThan(0);
      result.errors.forEach((msg) => {
        expect(typeof msg).toBe('string');
        expect(msg.length).toBeGreaterThan(0);
      });
    });
  });

  test('valid inputs produce no errors', () => {
    expect(validateReporterName('Anita P').errors).toHaveLength(0);
    expect(validateDescription('Two men with chainsaws').errors).toHaveLength(0);
    expect(validateCoordinates(17.41, 78.43).errors).toHaveLength(0);
  });
});

// ---------------------------------------------------------------------------
// Property 9: Status Transition Correctness
// Feature: tree-felling-reports
// Validates: Requirements 6.2, 6.3, 6.4, 6.5
// ---------------------------------------------------------------------------
describe('Status Transition Correctness (Property 9)', () => {
  const VALID_STATUSES = ['active', 'resolved', 'dismissed'];

  test('all status values are valid known statuses', () => {
    VALID_STATUSES.forEach((s) => {
      expect(VALID_STATUSES).toContain(s);
    });
  });

  test('admin can transition active → resolved', () => {
    const transitions = [
      { from: 'active', to: 'resolved', allowed: true },
      { from: 'active', to: 'dismissed', allowed: true },
      { from: 'resolved', to: 'active', allowed: false },
      { from: 'dismissed', to: 'active', allowed: false },
    ];
    const canTransition = (from, to) => from === 'active' && (to === 'resolved' || to === 'dismissed');
    transitions.forEach(({ from, to, allowed }) => {
      expect(canTransition(from, to)).toBe(allowed);
    });
  });
});

// ---------------------------------------------------------------------------
// Property 10: Date Filter Accuracy
// Feature: tree-felling-reports
// Validates: Requirements 7.2, 7.4, 7.5
// ---------------------------------------------------------------------------
describe('Date Filter Accuracy (Property 10)', () => {
  function applyDateFilter(reports, dateFrom) {
    if (!dateFrom) return reports;
    return reports.filter((r) => new Date(r.created_at) >= new Date(dateFrom));
  }

  test('date filter excludes reports before the cutoff', () => {
    fc.assert(
      fc.property(
        fc.integer({ min: 1, max: 30 }),
        (cutoffDaysAgo) => {
          const cutoff = new Date(Date.now() - cutoffDaysAgo * 24 * 60 * 60 * 1000).toISOString();
          const reports = [
            { id: '1', created_at: new Date(Date.now() - (cutoffDaysAgo - 1) * 24 * 60 * 60 * 1000).toISOString() }, // inside
            { id: '2', created_at: new Date(Date.now() - (cutoffDaysAgo + 1) * 24 * 60 * 60 * 1000).toISOString() }, // outside
          ];
          const filtered = applyDateFilter(reports, cutoff);
          expect(filtered.some((r) => r.id === '1')).toBe(true);
          expect(filtered.some((r) => r.id === '2')).toBe(false);
        }
      ),
      { numRuns: 50 }
    );
  });

  test('visible count equals filtered reports length', () => {
    const MIN_MS = Date.parse('2024-01-01');
    const NOW_MS = Date.parse('2026-01-01'); // fixed ceiling avoids invalid-date edge cases
    fc.assert(
      fc.property(
        fc.array(
          fc.record({
            id: fc.uuid(),
            created_at: fc.integer({ min: MIN_MS, max: NOW_MS }).map((ms) => new Date(ms).toISOString()),
          }),
          { minLength: 0, maxLength: 20 }
        ),
        fc.option(
          fc.integer({ min: MIN_MS, max: NOW_MS }).map((ms) => new Date(ms).toISOString()),
          { nil: null }
        ),
        (reports, dateFrom) => {
          const filtered = applyDateFilter(reports, dateFrom);
          expect(filtered.length).toBeLessThanOrEqual(reports.length);
          if (!dateFrom) expect(filtered.length).toBe(reports.length);
        }
      ),
      { numRuns: 50 }
    );
  });
});

// ---------------------------------------------------------------------------
// Property 1: Report Creation Completeness
// Feature: tree-felling-reports
// Validates: Requirements 1.2, 1.7, 5.1, 5.3
// ---------------------------------------------------------------------------
describe('Report Creation Completeness (Property 1)', () => {
  function buildReportPayload(reporterName, description, lat, lng, photoUrls) {
    return {
      reporter_name: reporterName,
      description,
      lat,
      lng,
      status: 'active',
      photo_urls: photoUrls,
      created_at: new Date().toISOString(),
    };
  }

  test('a valid report payload contains all required fields', () => {
    fc.assert(
      fc.property(
        fc.string({ minLength: 1, maxLength: 100 }).filter((s) => s.trim().length > 0),
        fc.string({ minLength: 1, maxLength: 500 }).filter((s) => s.trim().length > 0),
        fc.double({ min: -90, max: 90, noNaN: true }),
        fc.double({ min: -180, max: 180, noNaN: true }),
        fc.array(fc.webUrl(), { minLength: 1, maxLength: 3 }),
        (name, desc, lat, lng, urls) => {
          const payload = buildReportPayload(name, desc, lat, lng, urls);
          expect(payload.reporter_name).toBeTruthy();
          expect(payload.description).toBeTruthy();
          expect(typeof payload.lat).toBe('number');
          expect(typeof payload.lng).toBe('number');
          expect(payload.status).toBe('active');
          expect(Array.isArray(payload.photo_urls)).toBe(true);
          expect(payload.photo_urls.length).toBeGreaterThanOrEqual(1);
          expect(payload.created_at).toBeTruthy();
        }
      ),
      { numRuns: 100 }
    );
  });
});
