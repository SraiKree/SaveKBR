import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { ChevronLeft, Share2, MoreHorizontal, Plus, MapPin } from 'lucide-react';
import { supabase } from '../lib/supabase';
import { SeverityPill } from '../components/common/Badge';
import { G, severityFromIncident } from '../lib/grove';

/**
 * DetailPage — full view of a single incident.
 *
 * Pulls the incident by `id` from Supabase. While loading we show a calm
 * skeleton; if the row isn't found we show a friendly "report not found"
 * card with a link back to the map.
 *
 * Visual elements (matching the Grove design):
 *   • Hero illustration (currently a stylised SVG of a fallen-tree scene
 *     — once Supabase Storage is wired up this will become a real photo
 *     carousel).
 *   • Severity pill + ticket-style id.
 *   • Title + sub-location line.
 *   • Two-column meta grid (reported / GPS / reporter / witnessed).
 *   • Mini-map placeholder routing to the full map.
 *   • Reporter's note in a leaf-green quote block.
 *   • Status strip ("Forwarded to KBR ranger desk").
 *   • Action buttons (+ Add evidence / I'm here too).
 */
function DetailPage() {
    const { id } = useParams();
    const [incident, setIncident] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        let cancelled = false;
        const run = async () => {
            setLoading(true);
            const { data } = await supabase.from('incidents').select('*').eq('id', id).maybeSingle();
            if (!cancelled) {
                setIncident(data);
                setLoading(false);
            }
        };
        run();
        return () => { cancelled = true; };
    }, [id]);

    if (loading) {
        return (
            <div className="w-full h-full flex items-center justify-center" style={{ background: G.bg }}>
                <div className="text-ink-soft text-sm animate-pulse">Loading report…</div>
            </div>
        );
    }

    if (!incident) {
        return (
            <div className="w-full h-full flex flex-col items-center justify-center px-8 text-center" style={{ background: G.bg, color: G.ink }}>
                <div className="text-[20px] font-bold mb-2">Report not found</div>
                <div className="text-[13.5px] mb-5" style={{ color: G.inkSoft }}>
                    This incident may have been resolved or removed.
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

    const severity = severityFromIncident(incident);
    const ticketId = `#KBR-${new Date(incident.created_at || Date.now()).getFullYear()}-${String(incident.id).slice(-4).padStart(4, '0')}`;
    const lat = Number(incident.lat ?? 17.4126).toFixed(4);
    const lng = Number(incident.lng ?? 78.4071).toFixed(4);

    return (
        <div className="w-full h-full overflow-y-auto sk-no-scrollbar" style={{ background: G.bg, fontFamily: G.ui, color: G.ink }}>
            <div className="max-w-[480px] mx-auto relative">
                {/* Top bar — sits on top of the hero */}
                <div className="absolute top-0 left-0 right-0 z-10 px-4 pt-2 flex items-center justify-between">
                    <Link
                        to="/map"
                        className="w-[38px] h-[38px] rounded-[10px] flex items-center justify-center backdrop-blur-sm"
                        style={{ background: 'rgba(255,255,255,0.92)', border: `1px solid ${G.hairline}`, color: G.ink }}
                        aria-label="Back"
                    >
                        <ChevronLeft className="w-3.5 h-3.5" strokeWidth={1.8} />
                    </Link>
                    <div className="flex gap-2">
                        <button
                            className="h-[38px] px-3.5 rounded-[10px] text-[13px] font-semibold backdrop-blur-sm flex items-center gap-1.5"
                            style={{ background: 'rgba(255,255,255,0.92)', border: `1px solid ${G.hairline}`, color: G.ink }}
                            type="button"
                        >
                            <Share2 className="w-3.5 h-3.5" /> Share
                        </button>
                        <button
                            className="w-[38px] h-[38px] rounded-[10px] flex items-center justify-center backdrop-blur-sm"
                            style={{ background: 'rgba(255,255,255,0.92)', border: `1px solid ${G.hairline}`, color: G.ink }}
                            aria-label="More"
                            type="button"
                        >
                            <MoreHorizontal className="w-4 h-4" />
                        </button>
                    </div>
                </div>

                {/* Hero — stylised tree-stump scene */}
                <HeroIllustration />

                {/* Body */}
                <div className="px-5 pt-5 pb-8">
                    <div className="flex items-center justify-between mb-3">
                        <SeverityPill severity={severity} />
                        <div className="text-[11.5px] font-mono" style={{ color: G.inkMute }}>{ticketId}</div>
                    </div>

                    <h1 className="font-bold text-[23px] leading-[1.15] tracking-[-0.02em] mt-1 mb-1 text-ink">
                        {incident.title || incident.type || 'Tree-felling at KBR boundary'}
                    </h1>
                    <div className="text-[13.5px] mb-4" style={{ color: G.inkSoft }}>
                        {incident.location_label || 'KBR National Park · boundary loop'}
                    </div>

                    {/* Meta grid */}
                    <div
                        className="grid grid-cols-2 gap-x-5 gap-y-3.5 px-4 py-3.5 rounded-[12px] mb-4"
                        style={{ background: G.white, border: `1px solid ${G.hairline}` }}
                    >
                        <Meta k="Reported" v={new Date(incident.created_at).toLocaleString('en-IN', { day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' })} />
                        <Meta k="Auto-GPS" v={`${lat}° N · ${lng}° E`} mono />
                        <Meta k="Reporter" v={incident.reporter ? `@${incident.reporter}` : 'anonymous'} link={!!incident.reporter} />
                        <Meta k="Severity" v={severity.charAt(0).toUpperCase() + severity.slice(1)} />
                    </div>

                    {/* Mini-map placeholder. We can swap this for a real GroveMap
                        with a single pin once the Detail page settles. */}
                    <Link
                        to="/map"
                        className="block rounded-[12px] overflow-hidden mb-4 relative"
                        style={{ border: `1px solid ${G.hairline}` }}
                    >
                        <div className="h-[130px] relative" style={{ background: '#e3dfcf' }}>
                            <svg width="100%" height="100%" viewBox="0 0 390 130" preserveAspectRatio="xMidYMid slice">
                                <rect width="390" height="130" fill="#e3dfcf" />
                                <path
                                    d="M -10 110 C 60 70, 140 50, 220 70 C 300 88, 360 70, 410 50"
                                    fill="none" stroke="#cfc7ac" strokeWidth="18"
                                />
                                <path
                                    d="M 60 130 C 90 100, 160 90, 230 110 C 290 122, 350 110, 400 130"
                                    fill="#bccda1" stroke="#6f8a4c" strokeWidth="1.5"
                                />
                                <circle cx="195" cy="92" r="18" fill={G.clay} opacity="0.18" />
                                <circle cx="195" cy="92" r="8" fill={G.clay} stroke="#fff" strokeWidth="2" />
                            </svg>
                            <div
                                className="absolute left-3 bottom-2.5 text-[12px] font-semibold px-2.5 py-1 rounded-md backdrop-blur-sm inline-flex items-center gap-1"
                                style={{ background: 'rgba(255,255,255,0.92)', color: G.forest }}
                            >
                                <MapPin className="w-3 h-3" /> Open in map →
                            </div>
                        </div>
                    </Link>

                    {/* Note */}
                    {incident.note && (
                        <div className="text-[14.5px] leading-[1.55] mb-5 pl-3.5 py-1" style={{ color: G.ink, borderLeft: `3px solid ${G.leaf}` }}>
                            &ldquo;{incident.note}&rdquo;
                        </div>
                    )}

                    {/* Status strip */}
                    <div
                        className="flex items-center gap-3 px-3.5 py-3 rounded-[12px] mb-3.5"
                        style={{ background: `${G.amber}14`, border: `1px solid ${G.amber}44` }}
                    >
                        <div
                            className="w-9 h-9 rounded-full flex items-center justify-center flex-shrink-0"
                            style={{ background: `${G.amber}33` }}
                        >
                            <span className="w-2.5 h-2.5 rounded-full" style={{ background: G.amber }} />
                        </div>
                        <div className="flex-1">
                            <div className="text-[13.5px] font-semibold text-ink">Forwarded to KBR ranger desk</div>
                            <div className="text-[12px] mt-0.5" style={{ color: G.inkSoft }}>Acknowledged · awaiting response</div>
                        </div>
                    </div>

                    {/* Actions */}
                    <div className="flex gap-2.5">
                        <button
                            className="flex-1 h-[48px] rounded-[12px] text-[14px] font-semibold flex items-center justify-center gap-1.5"
                            style={{ background: G.white, color: G.ink, border: `1px solid ${G.line}` }}
                            type="button"
                        >
                            <Plus className="w-4 h-4" /> Add evidence
                        </button>
                        <button
                            className="flex-1 h-[48px] rounded-[12px] text-[14px] font-semibold"
                            style={{ background: G.forest, color: G.bg, border: 'none' }}
                            type="button"
                        >
                            I&apos;m here too
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}

function Meta({ k, v, mono, link }) {
    return (
        <div>
            <div className="text-[11.5px] font-medium tracking-wider" style={{ color: G.inkMute }}>{k}</div>
            <div
                className="text-[13.5px] leading-[1.4] mt-0.5"
                style={{
                    color: link ? G.forest : G.ink,
                    fontFamily: mono ? G.mono : G.ui,
                    fontWeight: link ? 600 : 500,
                }}
            >
                {v}
            </div>
        </div>
    );
}

function HeroIllustration() {
    return (
        <div className="relative h-[270px] overflow-hidden">
            <svg width="100%" height="100%" viewBox="0 0 390 270" preserveAspectRatio="xMidYMid slice">
                <defs>
                    <linearGradient id="dHeroSky" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor="#bccda1" />
                        <stop offset="100%" stopColor="#7e9b58" />
                    </linearGradient>
                </defs>
                <rect width="390" height="270" fill="url(#dHeroSky)" />
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
                Photo placeholder · tap to expand
            </div>
        </div>
    );
}

export default DetailPage;
