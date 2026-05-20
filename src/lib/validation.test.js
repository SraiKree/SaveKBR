import { describe, test, expect } from 'vitest';
import * as fc from 'fast-check';
import { validateCoordinates } from './validation.js';

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
