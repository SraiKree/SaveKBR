import { useEffect, useRef, useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ChevronLeft, ChevronRight, Camera, MapPin, User } from 'lucide-react';
import { supabase } from '../lib/supabase';
import { useLocation as useGeo } from '../hooks/useLocation';
import { usePhotoUpload } from '../hooks/usePhotoUpload';
import { validateReporterName, validateDescription, sanitizeInput } from '../lib/validation';
import { G, groveMapTheme } from '../lib/grove';

const isMobile =
    typeof navigator !== 'undefined' && /Mobi|Android/i.test(navigator.userAgent);

/**
 * ReportPage — tree-felling report submission form.
 *
 * Fields:
 *   • Reporter name  (required, max 100)
 *   • Evidence       (1–3 photos; JPEG/PNG/WebP, max 5 MB each)
 *   • Location       (auto GPS)
 *   • Description    (required, max 500)
 *
 * On submit: uploads photos to Supabase Storage → inserts `reports` row
 * → navigates to /report/:id.
 */
function ReportPage() {
    const navigate = useNavigate();
    const { coords, accuracy: accuracyLabel, status: geoStatus } = useGeo();
    const fileInputRef = useRef(null);
    const { uploadFiles, uploading: photosUploading, progress, error: uploadError } = usePhotoUpload();

    const stored =
        typeof localStorage !== 'undefined' ? localStorage.getItem('savekbr.handle') || '' : '';
    const [reporterName, setReporterName] = useState(stored);
    const [description, setDescription] = useState('');
    const [photos, setPhotos] = useState([]); // [{ id, url, file }]
    const [submitting, setSubmitting] = useState(false);
    const [error, setError] = useState(null);
    const [fieldErrors, setFieldErrors] = useState({});

    const busy = submitting || photosUploading;
    const canSubmit =
        reporterName.trim().length > 0 &&
        description.trim().length > 0 &&
        photos.length > 0 &&
        !busy;

    /* Revoke blob URLs on unmount to avoid memory leaks */
    useEffect(
        () => () => {
            photos.forEach((p) => URL.revokeObjectURL(p.url));
        },
        [photos]
    );

    const handleFiles = (fileList) => {
        const maxNew = 3 - photos.length;
        const incoming = Array.from(fileList || []).slice(0, maxNew);
        const newItems = incoming.map((f) => ({
            id: `${f.name}-${f.lastModified}-${Math.random().toString(36).slice(2, 7)}`,
            url: URL.createObjectURL(f),
            file: f,
        }));
        setPhotos((prev) => [...prev, ...newItems].slice(0, 3));
    };

    const removePhoto = (id) => {
        setPhotos((prev) => {
            const removed = prev.find((p) => p.id === id);
            if (removed) URL.revokeObjectURL(removed.url);
            return prev.filter((p) => p.id !== id);
        });
    };

    const submit = async () => {
        if (!canSubmit) return;
        setError(null);
        setFieldErrors({});

        const nameRes = validateReporterName(reporterName);
        const descRes = validateDescription(description);
        if (!nameRes.valid || !descRes.valid) {
            setFieldErrors({
                reporterName: nameRes.errors[0],
                description: descRes.errors[0],
            });
            return;
        }

        setSubmitting(true);

        const { urls, error: upErr } = await uploadFiles(photos.map((p) => p.file), {
            compress: isMobile,
        });
        if (upErr) {
            setSubmitting(false);
            return;
        }

        const lat = coords?.lat ?? 17.4126;
        const lng = coords?.lng ?? 78.4071;

        const { data, error: insertError } = await supabase
            .from('reports')
            .insert({
                reporter_name: sanitizeInput(reporterName.trim()),
                description: sanitizeInput(description.trim()),
                lat,
                lng,
                status: 'active',
                photo_urls: urls,
            })
            .select()
            .maybeSingle();

        setSubmitting(false);

        if (insertError) {
            setError(insertError.message || 'Could not file the report. Try again.');
            return;
        }

        navigate(data?.id ? `/report/${data.id}` : '/map');
    };

    const errMsg = error || uploadError;

    return (
        <div
            className="w-full h-full overflow-y-auto sk-no-scrollbar"
            style={{ background: G.bg, fontFamily: G.ui, color: G.ink }}
        >
            <div className="max-w-[440px] mx-auto pb-8">
                {/* Top bar */}
                <div className="flex items-center justify-between pt-2 px-4">
                    <Link
                        to="/map"
                        className="w-[38px] h-[38px] rounded-[10px] flex items-center justify-center"
                        style={{ background: G.white, border: `1px solid ${G.line}`, color: G.ink }}
                        aria-label="Back"
                    >
                        <ChevronLeft className="w-3.5 h-3.5" strokeWidth={1.8} />
                    </Link>
                    <div className="text-[13px] font-semibold">New report</div>
                    <div className="w-[38px]" />
                </div>

                <div className="px-4 mt-3">
                    <h1 className="font-bold text-[24px] leading-[1.15] tracking-[-0.02em] mb-4 text-ink">
                        What did you see?
                    </h1>

                    {/* Reporter name */}
                    <Section label="Your name" required error={fieldErrors.reporterName}>
                        <div
                            className="flex items-center gap-2.5 rounded-[12px] px-3.5 h-[48px]"
                            style={{
                                background: G.white,
                                border: `1px solid ${fieldErrors.reporterName ? G.clay : G.hairline}`,
                            }}
                        >
                            <User
                                className="w-4 h-4 flex-shrink-0"
                                style={{ color: G.inkMute }}
                                strokeWidth={1.6}
                            />
                            <input
                                value={reporterName}
                                onChange={(e) => {
                                    setReporterName(e.target.value.slice(0, 100));
                                    setFieldErrors((p) => ({ ...p, reporterName: undefined }));
                                }}
                                placeholder="Your name or handle"
                                className="flex-1 bg-transparent outline-none text-[14px] text-ink"
                                autoCapitalize="words"
                                spellCheck={false}
                            />
                        </div>
                    </Section>

                    {/* Evidence */}
                    <Section label="Evidence" required>
                        <EvidenceTile
                            items={photos}
                            onPick={() => fileInputRef.current?.click()}
                            onRemove={removePhoto}
                        />
                        <input
                            ref={fileInputRef}
                            type="file"
                            accept="image/jpeg,image/png,image/webp"
                            multiple
                            capture={isMobile ? 'environment' : undefined}
                            className="hidden"
                            onChange={(e) => handleFiles(e.target.files)}
                        />
                        <div className="text-[11.5px] mt-1.5" style={{ color: G.inkSoft }}>
                            1–3 photos · JPEG, PNG, or WebP · max 5 MB each
                        </div>
                        {photosUploading && (
                            <div
                                className="mt-2 h-1.5 rounded-full overflow-hidden"
                                style={{ background: `${G.leaf}22` }}
                            >
                                <div
                                    className="h-full rounded-full transition-all duration-300"
                                    style={{ width: `${progress}%`, background: '#10b981' }}
                                />
                            </div>
                        )}
                    </Section>

                    {/* Location */}
                    <Section label="Location" auto>
                        <div
                            className="flex items-center gap-3 p-3 rounded-[12px]"
                            style={{ background: G.white, border: `1px solid ${G.hairline}` }}
                        >
                            <div
                                className="w-[72px] h-[72px] rounded-[10px] overflow-hidden flex-shrink-0"
                                style={{ border: `1px solid ${G.hairline}`, background: groveMapTheme.land }}
                            >
                                <svg viewBox="60 480 140 140" width="72" height="72" aria-hidden="true">
                                    <rect x="0" y="0" width="390" height="844" fill={groveMapTheme.land} />
                                    <path
                                        d="M 90 250 C 80 320, 70 400, 90 480 C 110 560, 160 640, 220 680 C 290 720, 360 680, 380 600 C 400 510, 380 410, 340 320 C 300 250, 230 210, 170 220 C 130 225, 100 230, 90 250 Z"
                                        fill={groveMapTheme.park}
                                        stroke={groveMapTheme.parkStroke}
                                        strokeWidth="2"
                                    />
                                    <circle cx="130" cy="550" r="9" fill="#10b981" />
                                    <circle cx="130" cy="550" r="4" fill={G.bg} />
                                </svg>
                            </div>
                            <div className="flex-1 min-w-0">
                                <div className="text-[15px] font-semibold leading-tight text-ink">
                                    {coords ? 'Detected location' : 'KBR Park, Hyderabad'}
                                </div>
                                <div className="text-[12px] mt-0.5" style={{ color: G.inkSoft }}>
                                    {coords
                                        ? `GPS · ${accuracyLabel ?? 'medium'} accuracy`
                                        : geoStatus === 'denied'
                                        ? 'Location access denied — using park centre'
                                        : 'Allow location for a precise pin'}
                                </div>
                                <div
                                    className="text-[11.5px] mt-1 font-mono"
                                    style={{ color: G.inkMute }}
                                >
                                    {coords
                                        ? `${coords.lat.toFixed(4)}° N  ${coords.lng.toFixed(4)}° E`
                                        : '17.4126° N  78.4071° E  (default)'}
                                </div>
                            </div>
                        </div>
                    </Section>

                    {/* Description */}
                    <Section label="Description" required error={fieldErrors.description}>
                        <div
                            className="rounded-[12px] px-3.5 py-3 min-h-[88px]"
                            style={{
                                background: G.white,
                                border: `1px solid ${
                                    fieldErrors.description ? G.clay : G.hairline
                                }`,
                            }}
                        >
                            <textarea
                                value={description}
                                onChange={(e) => {
                                    setDescription(e.target.value.slice(0, 500));
                                    setFieldErrors((p) => ({ ...p, description: undefined }));
                                }}
                                placeholder="Describe what you saw — chainsaw sounds, number of people, tree species…"
                                className="w-full resize-none bg-transparent outline-none text-[14px] leading-[1.5] text-ink"
                                style={{ minHeight: 60 }}
                                rows={4}
                            />
                            <div
                                className="text-right text-[11px] mt-1"
                                style={{ color: G.inkMute }}
                            >
                                {description.length} / 500
                            </div>
                        </div>
                    </Section>

                    {/* Error banner */}
                    {errMsg && (
                        <div
                            className="mb-4 text-[12.5px] px-3 py-2 rounded-[10px]"
                            style={{
                                background: 'rgba(204,90,58,0.10)',
                                color: G.clay,
                                border: `1px solid rgba(204,90,58,0.35)`,
                            }}
                        >
                            {errMsg}
                        </div>
                    )}

                    {/* Submit */}
                    <motion.button
                        whileTap={{ scale: canSubmit ? 0.985 : 1 }}
                        onClick={submit}
                        disabled={!canSubmit}
                        className="w-full h-[54px] rounded-[14px] flex items-center justify-center gap-2.5 text-[15.5px] font-semibold mt-1.5"
                        style={{
                            background: canSubmit ? G.forest : `${G.forest}66`,
                            color: G.bg,
                            border: 'none',
                            cursor: canSubmit ? 'pointer' : 'not-allowed',
                            boxShadow: canSubmit ? '0 12px 28px -12px rgba(31,51,34,0.55)' : 'none',
                        }}
                        type="button"
                    >
                        {busy
                            ? photosUploading
                                ? `Uploading… ${progress}%`
                                : 'Filing…'
                            : 'File report'}
                        {!busy && <ChevronRight className="w-3.5 h-3.5" strokeWidth={2.4} />}
                    </motion.button>

                    <div className="text-center text-[11.5px] mt-2.5" style={{ color: G.inkMute }}>
                        Timestamped{' '}
                        {new Date().toLocaleString('en-IN', {
                            day: 'numeric',
                            month: 'short',
                            year: 'numeric',
                            hour: '2-digit',
                            minute: '2-digit',
                        })}
                    </div>
                </div>
            </div>
        </div>
    );
}

function Section({ label, required, optional, auto, error: err, children }) {
    return (
        <div className="mb-5">
            <div className="flex items-baseline gap-2 mb-2">
                <div className="text-[11.5px] font-medium tracking-wider text-ink">{label}</div>
                {required && (
                    <span className="text-[11px] font-semibold" style={{ color: G.clay }}>
                        Required
                    </span>
                )}
                {optional && (
                    <span className="text-[11px]" style={{ color: G.inkMute }}>
                        Optional
                    </span>
                )}
                {auto && (
                    <span className="text-[11px]" style={{ color: G.inkMute }}>
                        Auto-detected
                    </span>
                )}
            </div>
            {children}
            {err && (
                <div className="text-[12px] mt-1.5" style={{ color: G.clay }}>
                    {err}
                </div>
            )}
        </div>
    );
}

function EvidenceTile({ items, onPick, onRemove }) {
    if (items.length === 0) {
        return (
            <button
                onClick={onPick}
                className="w-full h-[200px] rounded-[14px] flex flex-col items-center justify-center gap-2"
                style={{
                    background: G.white,
                    border: `1.5px dashed ${G.line}`,
                    color: G.inkSoft,
                }}
                type="button"
            >
                <Camera className="w-6 h-6" style={{ color: '#10b981' }} strokeWidth={1.6} />
                <div className="text-[13.5px] font-semibold text-ink">Add evidence photo</div>
                <div className="text-[11.5px]" style={{ color: G.inkMute }}>
                    {isMobile ? 'Tap to open camera or gallery' : 'Tap to choose a photo'}
                </div>
            </button>
        );
    }

    const first = items[0];
    return (
        <div className="space-y-1.5">
            <div
                className="relative rounded-[14px] overflow-hidden h-[180px]"
                style={{ border: `1px solid ${G.line}` }}
            >
                <img src={first.url} alt="First evidence photo" className="w-full h-full object-cover" />
                <div className="absolute left-2.5 top-2.5">
                    <span
                        className="text-[11px] font-medium px-2 py-1 rounded-md text-white"
                        style={{ background: 'rgba(28,33,28,0.55)' }}
                    >
                        {items.length} / 3
                    </span>
                </div>
                <div className="absolute right-2.5 top-2.5 flex gap-1.5">
                    <PhotoChip onClick={() => onRemove(first.id)}>Remove</PhotoChip>
                    {items.length < 3 && (
                        <PhotoChip primary onClick={onPick}>
                            + Add
                        </PhotoChip>
                    )}
                </div>
                <div
                    className="absolute left-2.5 bottom-2.5 text-[11px] text-white px-2 py-1 rounded-md inline-flex items-center gap-1.5"
                    style={{ background: 'rgba(28,33,28,0.55)' }}
                >
                    <MapPin className="w-3 h-3" />
                    Captured at this pin
                </div>
            </div>

            {items.length > 1 && (
                <div className="flex gap-1.5">
                    {items.slice(1).map((item) => (
                        <div
                            key={item.id}
                            className="relative w-[72px] h-[72px] rounded-[10px] overflow-hidden flex-shrink-0 group"
                            style={{ border: `1px solid ${G.line}` }}
                        >
                            <img
                                src={item.url}
                                alt="Evidence"
                                className="w-full h-full object-cover"
                            />
                            <button
                                onClick={() => onRemove(item.id)}
                                type="button"
                                className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity text-[13px] font-bold text-white"
                                style={{ background: 'rgba(0,0,0,0.5)' }}
                            >
                                ✕
                            </button>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}

function PhotoChip({ children, primary, onClick }) {
    return (
        <button
            onClick={onClick}
            type="button"
            className="h-[30px] px-3 rounded-[8px] text-[12.5px] font-semibold backdrop-blur-sm"
            style={{
                background: primary ? '#10b981' : 'rgba(255,255,255,0.92)',
                color: primary ? '#fff' : G.ink,
                border: 'none',
            }}
        >
            {children}
        </button>
    );
}

export default ReportPage;
