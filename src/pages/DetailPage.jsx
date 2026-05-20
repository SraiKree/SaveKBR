import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { ChevronLeft, Share2, CheckCircle2, XCircle, MapPin } from 'lucide-react';
import { supabase } from '../lib/supabase';
import { G } from '../lib/grove';
import { timeAgo, isHistorical } from '../lib/timeUtils';
import { PhotoGallery } from '../components/common/PhotoGallery';

const ECO_GREEN = '#10b981';

/**
 * DetailPage — full view of a single tree-felling report.
 *
 * Reads from the `reports` table. Shows:
 *   • Photo gallery
 *   • Reporter name, description, GPS, timestamp
 *   • Historical badge if > 30 days old
 *   • Admin resolve / dismiss actions
 */
function DetailPage() {
    const { id } = useParams();
    const [report, setReport] = useState(null);
    const [loading, setLoading] = useState(true);
    const [actionError, setActionError] = useState(null);

    const isAdmin = true; // TODO: real auth gate

    useEffect(() => {
        let cancelled = false;
        const run = async () => {
            setLoading(true);
            const { data } = await supabase
                .from('reports')
                .select('*')
                .eq('id', id)
                .maybeSingle();
            if (!cancelled) {
                setReport(data);
                setLoading(false);
            }
        };
        run();
        return () => { cancelled = true; };
    }, [id]);

    const changeStatus = async (newStatus) => {
        if (!report) return;
        setActionError(null);
        const { error } = await supabase
            .from('reports')
            .update({ status: newStatus, updated_at: new Date().toISOString() })
            .eq('id', id);
        if (error) { setActionError(error.message); return; }
        await supabase.from('report_history').insert({
            report_id: id,
            old_status: report.status,
            new_status: newStatus,
            admin_identifier:
                (typeof localStorage !== 'undefined' && localStorage.getItem('savekbr.handle')) ||
                'admin',
        });
        setReport((prev) => prev ? { ...prev, status: newStatus } : prev);
    };

    if (loading) {
        return (
            <div
                className="w-full h-full overflow-y-auto sk-no-scrollbar"
                style={{ background: G.bg }}
            >
                <div className="max-w-[480px] mx-auto">
                    {/* Hero image skeleton */}
                    <div className="skeleton-striped h-[270px] w-full border border-base-content/20" />

                    <div className="px-5 pt-5 pb-8 space-y-4">
                        {/* Badge + ticket row */}
                        <div className="flex items-center justify-between">
                            <div className="skeleton-striped h-6 w-24 rounded-box border border-base-content/20" />
                            <div className="skeleton-striped h-4 w-20 rounded-box border border-base-content/20" />
                        </div>

                        {/* Title */}
                        <div className="skeleton-striped h-8 w-4/5 rounded-box border border-base-content/20" />

                        {/* Subtitle / reporter line */}
                        <div className="skeleton-striped h-4 w-3/5 rounded-box border border-base-content/20" />

                        {/* Description block */}
                        <div className="skeleton-striped h-16 w-full rounded-box border border-base-content/20" />

                        {/* Meta grid */}
                        <div className="skeleton-striped h-32 w-full rounded-box border border-base-content/20" />

                        {/* Mini-map */}
                        <div className="skeleton-striped h-[130px] w-full rounded-box border border-base-content/20" />
                    </div>
                </div>
            </div>
        );
    }

    if (!report) {
        return (
            <div
                className="w-full h-full flex flex-col items-center justify-center px-8 text-center"
                style={{ background: G.bg, color: G.ink }}
            >
                <div className="text-[20px] font-bold mb-2">Report not found</div>
                <div className="text-[13.5px] mb-5" style={{ color: G.inkSoft }}>
                    This report may have been resolved or removed.
                </div>
                <Link
                    to="/map"
                    className="h-[44px] px-5 inline-flex items-center justify-center rounded-[12px] text-[14px] font-semibold"
                    style={{ background: G.forest, color: G.bg }}
                >
                    Back to map
                </Link>
            </div>
        );
    }

    const hist = isHistorical(report.created_at);
    const ticketId = `#KBR-${new Date(report.created_at || Date.now()).getFullYear()}-${String(report.id).slice(-4).padStart(4, '0')}`;
    const lat = Number(report.lat ?? 17.4126).toFixed(4);
    const lng = Number(report.lng ?? 78.4071).toFixed(4);

    return (
        <div
            className="w-full h-full overflow-y-auto sk-no-scrollbar"
            style={{ background: G.bg, fontFamily: G.ui, color: G.ink }}
        >
            <div className="max-w-[480px] mx-auto relative">
                {/* Top bar */}
                <div className="absolute top-0 left-0 right-0 z-10 px-4 pt-2 flex items-center justify-between">
                    <Link
                        to="/map"
                        className="w-[38px] h-[38px] rounded-[10px] flex items-center justify-center backdrop-blur-sm"
                        style={{
                            background: 'rgba(255,255,255,0.92)',
                            border: `1px solid ${G.hairline}`,
                            color: G.ink,
                        }}
                        aria-label="Back"
                    >
                        <ChevronLeft className="w-3.5 h-3.5" strokeWidth={1.8} />
                    </Link>
                    <div className="flex gap-2">
                        <button
                            className="h-[38px] px-3.5 rounded-[10px] text-[13px] font-semibold backdrop-blur-sm flex items-center gap-1.5"
                            style={{
                                background: 'rgba(255,255,255,0.92)',
                                border: `1px solid ${G.hairline}`,
                                color: G.ink,
                            }}
                            type="button"
                        >
                            <Share2 className="w-3.5 h-3.5" /> Share
                        </button>
                    </div>
                </div>

                {/* Photo gallery hero */}
                <div className="relative" style={{ minHeight: 220 }}>
                    {report.photo_urls?.length > 0 ? (
                        <div className="h-[260px] overflow-hidden">
                            <img
                                src={report.photo_urls[0]}
                                alt="Evidence"
                                className="w-full h-full object-cover"
                            />
                            {report.photo_urls.length > 1 && (
                                <div
                                    className="absolute left-4 bottom-3 text-[11px] text-white px-2.5 py-1 rounded-md backdrop-blur-sm"
                                    style={{ background: 'rgba(28,33,28,0.55)' }}
                                >
                                    +{report.photo_urls.length - 1} more photo{report.photo_urls.length > 2 ? 's' : ''}
                                </div>
                            )}
                        </div>
                    ) : (
                        <EcoHeroIllustration />
                    )}
                </div>

                {/* Body */}
                <div className="px-5 pt-5 pb-8">
                    {/* Status badge + ticket */}
                    <div className="flex items-center justify-between mb-3">
                        <span
                            className="inline-flex items-center gap-1.5 rounded-full text-[12px] font-semibold px-2.5 py-1"
                            style={{
                                background:
                                    report.status === 'active'
                                        ? `${ECO_GREEN}22`
                                        : report.status === 'resolved'
                                        ? `${G.leaf}22`
                                        : `${G.inkMute}22`,
                                color:
                                    report.status === 'active'
                                        ? ECO_GREEN
                                        : report.status === 'resolved'
                                        ? G.leaf
                                        : G.inkMute,
                            }}
                        >
                            <span
                                style={{
                                    width: 6,
                                    height: 6,
                                    borderRadius: '50%',
                                    background:
                                        report.status === 'active'
                                            ? ECO_GREEN
                                            : report.status === 'resolved'
                                            ? G.leaf
                                            : G.inkMute,
                                    display: 'inline-block',
                                }}
                            />
                            {report.status.charAt(0).toUpperCase() + report.status.slice(1)}
                            {hist && ' · Historical'}
                        </span>
                        <div className="text-[11.5px] font-mono" style={{ color: G.inkMute }}>
                            {ticketId}
                        </div>
                    </div>

                    <h1 className="font-bold text-[23px] leading-[1.15] tracking-[-0.02em] mt-1 mb-1 text-ink">
                        Tree Felling at KBR
                    </h1>
                    <div className="text-[13.5px] mb-4" style={{ color: G.inkSoft }}>
                        Reported by {report.reporter_name} · {timeAgo(report.created_at)}
                    </div>

                    {/* Description */}
                    {report.description && (
                        <div
                            className="text-[14.5px] leading-[1.55] mb-5 pl-3.5 py-1"
                            style={{ color: G.ink, borderLeft: `3px solid ${ECO_GREEN}` }}
                        >
                            &ldquo;{report.description}&rdquo;
                        </div>
                    )}

                    {/* All photos */}
                    {report.photo_urls?.length > 0 && (
                        <div className="mb-5">
                            <div className="text-[12px] font-medium mb-2" style={{ color: G.inkMute }}>
                                Evidence photos
                            </div>
                            <PhotoGallery urls={report.photo_urls} />
                        </div>
                    )}

                    {/* Meta grid */}
                    <div
                        className="grid grid-cols-2 gap-x-5 gap-y-3.5 px-4 py-3.5 rounded-[12px] mb-4"
                        style={{ background: G.white, border: `1px solid ${G.hairline}` }}
                    >
                        <Meta
                            k="Reported"
                            v={new Date(report.created_at).toLocaleString('en-IN', {
                                day: 'numeric',
                                month: 'short',
                                year: 'numeric',
                                hour: '2-digit',
                                minute: '2-digit',
                            })}
                        />
                        <Meta k="GPS" v={`${lat}° N · ${lng}° E`} mono />
                        <Meta k="Reporter" v={report.reporter_name} />
                        <Meta k="Status" v={report.status.charAt(0).toUpperCase() + report.status.slice(1)} />
                    </div>

                    {/* Mini map link */}
                    <Link
                        to="/map"
                        className="block rounded-[12px] overflow-hidden mb-4 relative"
                        style={{ border: `1px solid ${G.hairline}` }}
                    >
                        <div className="h-[130px] relative" style={{ background: '#e3dfcf' }}>
                            <svg
                                width="100%"
                                height="100%"
                                viewBox="0 0 390 130"
                                preserveAspectRatio="xMidYMid slice"
                            >
                                <rect width="390" height="130" fill="#e3dfcf" />
                                <path
                                    d="M -10 110 C 60 70, 140 50, 220 70 C 300 88, 360 70, 410 50"
                                    fill="none"
                                    stroke="#cfc7ac"
                                    strokeWidth="18"
                                />
                                <path
                                    d="M 60 130 C 90 100, 160 90, 230 110 C 290 122, 350 110, 400 130"
                                    fill="#bccda1"
                                    stroke="#6f8a4c"
                                    strokeWidth="1.5"
                                />
                                <circle cx="195" cy="92" r="18" fill={ECO_GREEN} opacity="0.18" />
                                <circle
                                    cx="195"
                                    cy="92"
                                    r="8"
                                    fill={ECO_GREEN}
                                    stroke="#fff"
                                    strokeWidth="2"
                                />
                            </svg>
                            <div
                                className="absolute left-3 bottom-2.5 text-[12px] font-semibold px-2.5 py-1 rounded-md backdrop-blur-sm inline-flex items-center gap-1"
                                style={{ background: 'rgba(255,255,255,0.92)', color: G.forest }}
                            >
                                <MapPin className="w-3 h-3" /> Open in map →
                            </div>
                        </div>
                    </Link>

                    {/* Action error */}
                    {actionError && (
                        <div
                            className="mb-3 text-[12.5px] px-3 py-2 rounded-[10px]"
                            style={{
                                background: 'rgba(204,90,58,0.10)',
                                color: G.clay,
                                border: `1px solid rgba(204,90,58,0.35)`,
                            }}
                        >
                            {actionError}
                        </div>
                    )}

                    {/* Admin actions */}
                    {isAdmin && report.status === 'active' && (
                        <div className="flex gap-2.5 mb-3">
                            <button
                                onClick={() => changeStatus('resolved')}
                                className="flex-1 h-[48px] rounded-[12px] text-[14px] font-semibold flex items-center justify-center gap-1.5"
                                style={{ background: `${G.leaf}18`, color: G.leaf, border: `1px solid ${G.leaf}44` }}
                                type="button"
                            >
                                <CheckCircle2 className="w-4 h-4" /> Mark resolved
                            </button>
                            <button
                                onClick={() => changeStatus('dismissed')}
                                className="flex-1 h-[48px] rounded-[12px] text-[14px] font-semibold flex items-center justify-center gap-1.5"
                                style={{
                                    background: `${G.clay}12`,
                                    color: G.clay,
                                    border: `1px solid ${G.clay}44`,
                                }}
                                type="button"
                            >
                                <XCircle className="w-4 h-4" /> Dismiss
                            </button>
                        </div>
                    )}

                    {/* Status strip */}
                    <div
                        className="flex items-center gap-3 px-3.5 py-3 rounded-[12px]"
                        style={{
                            background: `${ECO_GREEN}12`,
                            border: `1px solid ${ECO_GREEN}33`,
                        }}
                    >
                        <div
                            className="w-9 h-9 rounded-full flex items-center justify-center flex-shrink-0"
                            style={{ background: `${ECO_GREEN}28` }}
                        >
                            <span
                                className="w-2.5 h-2.5 rounded-full"
                                style={{ background: ECO_GREEN }}
                            />
                        </div>
                        <div className="flex-1">
                            <div className="text-[13.5px] font-semibold text-ink">
                                Forwarded to KBR ranger desk
                            </div>
                            <div className="text-[12px] mt-0.5" style={{ color: G.inkSoft }}>
                                Acknowledged · awaiting response
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

function Meta({ k, v, mono }) {
    return (
        <div>
            <div className="text-[11.5px] font-medium tracking-wider" style={{ color: G.inkMute }}>
                {k}
            </div>
            <div
                className="text-[13.5px] leading-[1.4] mt-0.5"
                style={{
                    color: G.ink,
                    fontFamily: mono ? G.mono : G.ui,
                    fontWeight: 500,
                }}
            >
                {v}
            </div>
        </div>
    );
}

function EcoHeroIllustration() {
    return (
        <div className="relative h-[270px] overflow-hidden">
            <svg
                width="100%"
                height="100%"
                viewBox="0 0 390 270"
                preserveAspectRatio="xMidYMid slice"
            >
                <defs>
                    <linearGradient id="ecoHeroSky" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor="#bccda1" />
                        <stop offset="100%" stopColor="#7e9b58" />
                    </linearGradient>
                </defs>
                <rect width="390" height="270" fill="url(#ecoHeroSky)" />
                <ellipse cx="195" cy="262" rx="180" ry="18" fill="#3a2f1a" opacity="0.45" />
                <rect x="150" y="165" width="90" height="100" rx="4" fill="#7a5a36" />
                <ellipse cx="195" cy="165" rx="46" ry="12" fill="#a37a4d" />
                <ellipse cx="195" cy="165" rx="34" ry="9" fill="#7a5a36" />
                <ellipse cx="195" cy="165" rx="20" ry="5" fill="#5a3f24" />
                <rect x="50" y="200" width="60" height="65" rx="3" fill="#6e5436" />
                <ellipse cx="80" cy="200" rx="32" ry="8" fill="#8c684b" />
                <rect x="270" y="210" width="50" height="55" rx="3" fill="#6e5436" />
                <ellipse cx="295" cy="210" rx="26" ry="6" fill="#8c684b" />
            </svg>
            <div
                className="absolute left-4 bottom-3 text-[11px] text-white px-2.5 py-1 rounded-md backdrop-blur-sm"
                style={{ background: 'rgba(28,33,28,0.55)' }}
            >
                No photos attached
            </div>
        </div>
    );
}

export default DetailPage;
