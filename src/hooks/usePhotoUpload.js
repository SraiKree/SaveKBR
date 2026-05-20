import { useState, useCallback } from 'react';
import { supabase } from '../lib/supabase';

const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5 MB
export const ALLOWED_TYPES = ['image/jpeg', 'image/png', 'image/webp'];
export const MAX_PHOTOS = 3;

/**
 * usePhotoUpload — validates, optionally compresses, and uploads photos to
 * Supabase Storage `report-photos` bucket.
 *
 * Returns { uploadFiles, validateFiles, compressIfNeeded, uploading, progress, error, setError }
 */
export function usePhotoUpload() {
    const [uploading, setUploading] = useState(false);
    const [progress, setProgress] = useState(0);
    const [error, setError] = useState(null);

    /**
     * Pure validation — does NOT perform any I/O.
     * Returns an array of error strings (empty = valid).
     */
    const validateFiles = useCallback((files) => {
        const arr = Array.from(files);
        const errors = [];
        if (arr.length < 1) errors.push('At least one photo is required');
        if (arr.length > MAX_PHOTOS) errors.push(`Maximum ${MAX_PHOTOS} photos allowed`);
        arr.forEach((file, i) => {
            if (!ALLOWED_TYPES.includes(file.type))
                errors.push(`Photo ${i + 1}: must be JPEG, PNG, or WebP`);
            if (file.size > MAX_FILE_SIZE)
                errors.push(`Photo ${i + 1}: exceeds 5 MB limit`);
        });
        return errors;
    }, []);

    /**
     * Compress an image file so it fits under maxMB.
     * Resolves to the original file if it's already small enough.
     */
    const compressIfNeeded = useCallback((file, maxMB = 2) => {
        return new Promise((resolve) => {
            if (file.size <= maxMB * 1024 * 1024) { resolve(file); return; }
            const img = new Image();
            const blobUrl = URL.createObjectURL(file);
            img.onload = () => {
                URL.revokeObjectURL(blobUrl);
                const scale = Math.sqrt((maxMB * 1024 * 1024) / file.size);
                const canvas = document.createElement('canvas');
                canvas.width = Math.floor(img.width * scale);
                canvas.height = Math.floor(img.height * scale);
                canvas.getContext('2d').drawImage(img, 0, 0, canvas.width, canvas.height);
                canvas.toBlob(
                    (blob) => resolve(new File([blob], file.name, { type: 'image/jpeg' })),
                    'image/jpeg',
                    0.82
                );
            };
            img.onerror = () => { URL.revokeObjectURL(blobUrl); resolve(file); };
            img.src = blobUrl;
        });
    }, []);

    /**
     * Upload files to Supabase Storage.
     * @param {FileList|File[]} rawFiles
     * @param {{ compress?: boolean }} options  compress=true enables mobile compression
     * @returns {Promise<{ urls: string[]|null, error: string|null }>}
     */
    const uploadFiles = useCallback(async (rawFiles, { compress = false } = {}) => {
        setError(null);
        const arr = Array.from(rawFiles).slice(0, MAX_PHOTOS);
        const validationErrors = validateFiles(arr);
        if (validationErrors.length > 0) {
            const msg = validationErrors.join('; ');
            setError(msg);
            return { urls: null, error: msg };
        }

        if (!supabase.storage) {
            const msg = 'Storage is not configured — add Supabase credentials to .env';
            setError(msg);
            return { urls: null, error: msg };
        }

        setUploading(true);
        setProgress(0);
        try {
            const urls = [];
            for (let i = 0; i < arr.length; i++) {
                const raw = arr[i];
                const file = compress ? await compressIfNeeded(raw) : raw;
                const ext = raw.name.split('.').pop().toLowerCase() || 'jpg';
                const uid = `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
                const storagePath = `reports/${uid}.${ext}`;

                const { error: upErr } = await supabase.storage
                    .from('report-photos')
                    .upload(storagePath, file, { contentType: file.type, upsert: false });
                if (upErr) throw upErr;

                const { data } = supabase.storage.from('report-photos').getPublicUrl(storagePath);
                urls.push(data.publicUrl);
                setProgress(Math.round(((i + 1) / arr.length) * 100));
            }
            setUploading(false);
            return { urls, error: null };
        } catch (err) {
            const msg = err.message || 'Upload failed. Please try again.';
            setError(msg);
            setUploading(false);
            return { urls: null, error: msg };
        }
    }, [validateFiles, compressIfNeeded]);

    return { uploadFiles, validateFiles, compressIfNeeded, uploading, progress, error, setError };
}
