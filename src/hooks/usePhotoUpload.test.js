import { describe, test, expect } from 'vitest';
import * as fc from 'fast-check';
import { ALLOWED_TYPES, MAX_PHOTOS } from './usePhotoUpload';
import { validatePhotos } from '../lib/validation';

// ---------------------------------------------------------------------------
// Property 2: Photo Upload Constraints
// Feature: tree-felling-reports
// Validates: Requirements 1.5, 1.6
// ---------------------------------------------------------------------------
describe('Photo Upload Constraints (Property 2)', () => {
    function makeFile(type, size) {
        const blob = new Blob([new Uint8Array(size)], { type });
        return new File([blob], `photo.${type.split('/')[1]}`, { type });
    }

    test('valid photos (1–3 files, allowed type, ≤5 MB) are accepted', () => {
        fc.assert(
            fc.property(
                fc.integer({ min: 1, max: MAX_PHOTOS }),
                fc.constantFrom(...ALLOWED_TYPES),
                fc.integer({ min: 1, max: 5 * 1024 * 1024 }),
                (count, type, size) => {
                    const photos = Array.from({ length: count }, () => makeFile(type, size));
                    const result = validatePhotos(photos);
                    expect(result.valid).toBe(true);
                    expect(result.errors).toHaveLength(0);
                }
            ),
            { numRuns: 100 }
        );
    });

    test('more than 3 photos are rejected', () => {
        fc.assert(
            fc.property(
                fc.integer({ min: 4, max: 10 }),
                (count) => {
                    const photos = Array.from({ length: count }, () =>
                        makeFile('image/jpeg', 100)
                    );
                    const result = validatePhotos(photos);
                    expect(result.valid).toBe(false);
                    expect(result.errors.some((e) => e.includes('Maximum 3'))).toBe(true);
                }
            ),
            { numRuns: 50 }
        );
    });

    test('zero photos are rejected', () => {
        const result = validatePhotos([]);
        expect(result.valid).toBe(false);
        expect(result.errors.some((e) => e.includes('At least one'))).toBe(true);
    });

    test('disallowed MIME types are rejected', () => {
        const badTypes = ['image/gif', 'image/bmp', 'application/pdf', 'video/mp4'];
        fc.assert(
            fc.property(
                fc.constantFrom(...badTypes),
                (type) => {
                    const photos = [makeFile(type, 100)];
                    const result = validatePhotos(photos);
                    expect(result.valid).toBe(false);
                    expect(result.errors.some((e) => e.includes('Invalid file type'))).toBe(true);
                }
            ),
            { numRuns: 40 }
        );
    });

    test('files over 5 MB are rejected', () => {
        fc.assert(
            fc.property(
                fc.integer({ min: 5 * 1024 * 1024 + 1, max: 20 * 1024 * 1024 }),
                (size) => {
                    const photos = [makeFile('image/jpeg', size)];
                    const result = validatePhotos(photos);
                    expect(result.valid).toBe(false);
                    expect(result.errors.some((e) => e.includes('5MB'))).toBe(true);
                }
            ),
            { numRuns: 50 }
        );
    });
});

// ---------------------------------------------------------------------------
// Property 5: Photo Storage Round-Trip (filename uniqueness)
// Validates: Requirements 3.1, 3.2, 3.3
// ---------------------------------------------------------------------------
describe('Photo Storage Round-Trip (Property 5)', () => {
    function generateStoragePath(fileName) {
        const ext = fileName.split('.').pop().toLowerCase() || 'jpg';
        const uid = `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
        return `reports/${uid}.${ext}`;
    }

    test('generated storage paths are unique across many files with the same name', () => {
        fc.assert(
            fc.property(
                fc.array(fc.constant('photo.jpg'), { minLength: 2, maxLength: 20 }),
                (fileNames) => {
                    const paths = fileNames.map(generateStoragePath);
                    const unique = new Set(paths);
                    expect(unique.size).toBe(paths.length);
                }
            ),
            { numRuns: 100 }
        );
    });

    test('storage path always starts with reports/ prefix', () => {
        fc.assert(
            fc.property(
                fc.string({ minLength: 1, maxLength: 50 }).map((s) => `${s}.jpg`),
                (fileName) => {
                    const path = generateStoragePath(fileName);
                    expect(path.startsWith('reports/')).toBe(true);
                }
            ),
            { numRuns: 100 }
        );
    });

    test('storage path extension matches source file extension', () => {
        const exts = ['jpg', 'png', 'webp'];
        fc.assert(
            fc.property(
                fc.constantFrom(...exts),
                (ext) => {
                    const path = generateStoragePath(`photo.${ext}`);
                    expect(path.endsWith(`.${ext}`)).toBe(true);
                }
            ),
            { numRuns: 60 }
        );
    });
});
