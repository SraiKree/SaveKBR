import { useMemo, useState } from 'react';
import { motion } from 'framer-motion';
import { Link, useNavigate } from 'react-router-dom';
import { Search, Plus, Locate, ChevronRight } from 'lucide-react';
import { GroveMap } from '../components/dashboard';
import { useIncidents } from '../hooks/useIncidents';
import { supabase } from '../lib/supabase';
import { G, severityColor, severityFromIncident } from '../lib/grove';

const FILTERS = ['Last 24 h', 'Critical', 'Active', 'Resolved', 'Mine'];

/**
 * Convert an absolute ISO timestamp into the short relative form the design
 * sheet uses: "12 min ago", "3 h ago", "2 d ago".
 */
function shortAgo(ts) {
    if (!ts) return '';
    const s = Math.floor((Date.now() - new Date(ts).getTime()) / 1000);
    if (s < 60) return 'just now';
    const m = Math.floor(s / 60);
    if (m < 60) return `${m} min ago`;
    const h = Math.floor(m / 60);
    if (h < 24) return `${h} h ago`;
    return `${Math.floor(h / 24)} d ago`;
}

/**
 * MapPage — primary "home" view of the patrol app.
 *
 * Layout overview:
 *   • Full-bleed leaflet map underneath (`GroveMap`).
 *   • Floating top app bar with counts (critical / active / resolved).
 *   • Horizontal filter chip strip below.
 *   • Right-side legend, left-side zoom stack.
 *   • Bottom sheet listing the most recent reports.
 *   • Clay FAB ("+ Report") jutting out of the sheet, routes to /report.
 *
 * Data: pulled from `useIncidents` (Supabase realtime). The filter chips
 * are wired to a local state hook; selecting a chip restricts the bottom
 * sheet listing. "Mark resolved" updates Supabase, which auto-removes the
 * pin via the realtime subscription.
 */
function MapPage() {
    const { incidents, loading } = useIncidents();
    const navigate = useNavigate();
    const [activeFilter, setActiveFilter] = useState('Last 24 h');
    const isAdmin = true; // TODO: gate behind real auth when the auth flow lands
    const myHandle = (typeof localStorage !== 'undefined' && localStorage.getItem('savekbr.handle')) || '';

    const handleResolve = async (id) => {
        const { error } = await supabase.from('incidents').update({ status: 'resolved' }).eq('id', id);
        if (error) console.error('Failed to resolve incident:', error);
    };

    /**
     * Apply the currently selected filter chip to the incident feed. The
     * map and the bottom sheet share the same filtered list so they never
     * disagree about what's "active".
     */
    const visible = useMemo(() => {
        const within24h = (i) => (Date.now() - new Date(i.created_at).getTime()) < 24 * 60 * 60 * 1000;
        switch (activeFilter) {
            case 'Critical': return incidents.filter((i) => severityFromIncident(i) === 'critical');
            case 'Active':   return incidents.filter((i) => severityFromIncident(i) === 'active');
            case 'Resolved': return incidents.filter((i) => severityFromIncident(i) === 'resolved');
            case 'Mine':     return incidents.filter((i) => i.reporter && myHandle && i.reporter === myHandle);
            case 'Last 24 h':
            default:         return incidents.filter(within24h);
        }
    }, [incidents, activeFilter, myHandle]);

    /**
     * Bucket counts for the top-bar summary. Always computed off the full
     * unfiltered feed so the user sees the true totals even while a chip
     * is restricting the view.
     */
    const counts = useMemo(() => {
        const c = { critical: 0, active: 0, resolved: 0 };
        for (const i of incidents) c[severityFromIncident(i)] = (c[severityFromIncident(i)] || 0) + 1;
        return c;
    }, [incidents]);

    return (
        <div className="w-full h-full relative" style={{ background: '#e3dfcf' }}>
            {/* Map base layer */}
            <div className="absolute inset-0 z-0">
                <GroveMap incidents={visible} onDeleteIncident={handleResolve} isAdmin={isAdmin} />
            </div>

            {/* Loading shimmer */}
            {loading && (
                <div className="absolute inset-0 z-10 flex items-center justify-center" style={{ background: 'rgba(239,236,226,0.85)' }}>
                    <div className="text-ink-soft text-sm font-medium animate-pulse">Loading patrol data…</div>
                </div>
            )}

            {/* Top app bar — KBR title + counts + search */}
            <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.35 }}
                className="absolute top-2.5 left-3.5 right-3.5 z-20"
            >
                <div
                    className="rounded-[14px] px-3 py-2.5 flex items-center gap-2.5 backdrop-blur-md"
                    style={{
                        background: 'rgba(255,255,255,0.92)',
                        border: `1px solid ${G.hairline}`,
                        boxShadow: '0 8px 22px -14px rgba(31,51,34,0.35)',
                    }}
                >
                    <div className="flex-1 min-w-0">
                        <div className="text-[14.5px] font-semibold leading-tight text-ink">KBR National Park</div>
                        <div className="text-[11px] mt-0.5 flex gap-2.5" style={{ color: G.inkSoft }}>
                            <span><span style={{ color: G.clay, fontWeight: 600 }}>{counts.critical}</span> critical</span>
                            <span><span style={{ color: G.amber, fontWeight: 600 }}>{counts.active}</span> active</span>
                            <span><span style={{ color: G.leaf, fontWeight: 600 }}>{counts.resolved}</span> resolved</span>
                        </div>
                    </div>
                    <button
                        className="w-9 h-9 rounded-[10px] flex items-center justify-center"
                        style={{ border: `1px solid ${G.line}`, color: G.ink }}
                        aria-label="Search"
                        type="button"
                    >
                        <Search className="w-3.5 h-3.5" strokeWidth={1.8} />
                    </button>
                </div>
            </motion.div>

            {/* Filter chips */}
            <div className="absolute top-[78px] left-0 right-0 px-3.5 z-20 flex gap-1.5 overflow-x-auto sk-no-scrollbar">
                {FILTERS.map((label) => {
                    const on = label === activeFilter;
                    return (
                        <button
                            key={label}
                            onClick={() => setActiveFilter(label)}
                            className="px-3 py-1.5 rounded-full text-[12.5px] font-medium whitespace-nowrap"
                            style={{
                                background: on ? G.forest : 'rgba(255,255,255,0.92)',
                                color: on ? G.bg : G.ink,
                                border: on ? 'none' : `1px solid ${G.line}`,
                                boxShadow: on ? '0 4px 10px -6px rgba(31,51,34,0.5)' : 'none',
                            }}
                            type="button"
                        >
                            {label}
                        </button>
                    );
                })}
            </div>

            {/* Legend (right) */}
            <div
                className="absolute right-3.5 top-[140px] z-20 rounded-[10px] px-2.5 py-2 text-[11.5px] leading-[1.7]"
                style={{ background: 'rgba(255,255,255,0.92)', border: `1px solid ${G.hairline}`, color: G.inkSoft }}
            >
                <LegendRow color={G.clay} label="Critical" />
                <LegendRow color={G.amber} label="Active" />
                <LegendRow color={G.leaf} label="Resolved" />
            </div>

            {/* Locate-me (left). Leaflet's own zoom controls are disabled in
                GroveMap — clicking this asks the browser for the user's
                current position and pans there with `flyTo`. */}
            <div className="absolute left-3.5 top-[140px] z-20">
                <button
                    className="w-9 h-9 rounded-[10px] flex items-center justify-center"
                    style={{ background: 'rgba(255,255,255,0.92)', border: `1px solid ${G.hairline}`, color: G.forest }}
                    aria-label="Locate me"
                    type="button"
                >
                    <Locate className="w-4 h-4" strokeWidth={1.6} />
                </button>
            </div>

            {/* Bottom sheet */}
            <motion.div
                initial={{ opacity: 0, y: 24 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.45, delay: 0.05 }}
                className="absolute left-0 right-0 bottom-0 z-20 px-4 pt-2.5 pb-5"
                style={{
                    background: G.white,
                    borderRadius: '18px 18px 0 0',
                    borderTop: `1px solid ${G.hairline}`,
                    boxShadow: '0 -14px 32px -16px rgba(31,51,34,0.3)',
                }}
            >
                <div className="mx-auto mb-2.5 h-1 w-9 rounded-full" style={{ background: G.line }} />
                <div className="flex items-baseline justify-between mb-2.5">
                    <div className="text-[15px] font-semibold text-ink">Nearby reports</div>
                    <div className="text-[11.5px]" style={{ color: G.inkMute }}>
                        {visible.length} {visible.length === 1 ? 'report' : 'reports'}
                    </div>
                </div>

                {/* Listing — show up to three; if there's nothing, show a friendly empty state */}
                <div className="max-h-[34vh] overflow-y-auto sk-no-scrollbar">
                    {visible.length === 0 ? (
                        <div className="py-6 text-center text-[13px]" style={{ color: G.inkMute }}>
                            No reports match this filter yet.
                        </div>
                    ) : (
                        visible.slice(0, 5).map((inc) => (
                            <SheetReportRow key={inc.id} incident={inc} />
                        ))
                    )}
                </div>

                {/* Floating FAB */}
                <button
                    onClick={() => navigate('/report')}
                    className="absolute right-4 -top-7 h-[60px] rounded-[30px] pl-4 pr-5 flex items-center gap-2.5 text-[15px] font-semibold cursor-pointer"
                    style={{
                        background: G.clay,
                        color: G.bg,
                        border: 'none',
                        boxShadow: '0 14px 30px -10px rgba(204,90,58,0.55)',
                    }}
                    type="button"
                >
                    <span
                        className="w-7 h-7 rounded-full flex items-center justify-center"
                        style={{ background: 'rgba(255,255,255,0.2)' }}
                    >
                        <Plus className="w-4 h-4" strokeWidth={2.4} />
                    </span>
                    Report
                </button>
            </motion.div>
        </div>
    );
}

function LegendRow({ color, label }) {
    return (
        <div className="flex items-center gap-2">
            <span className="inline-block w-2 h-2 rounded-full" style={{ background: color }} />
            {label}
        </div>
    );
}

function SheetReportRow({ incident }) {
    const severity = severityFromIncident(incident);
    const c = severityColor(severity);
    return (
        <Link
            to={`/report/${incident.id}`}
            className="flex items-center gap-3 py-2.5 border-t"
            style={{ borderColor: G.hairline }}
        >
            <div
                className="w-[38px] h-[38px] rounded-[10px] flex items-center justify-center flex-shrink-0"
                style={{ background: `${c}1a` }}
            >
                <span className="w-2.5 h-2.5 rounded-full" style={{ background: c }} />
            </div>
            <div className="flex-1 min-w-0">
                <div className="text-[14px] font-semibold text-ink leading-tight truncate">
                    {incident.type || incident.title || 'Tree-felling report'}
                </div>
                <div className="text-[12px] mt-0.5" style={{ color: G.inkMute }}>
                    {shortAgo(incident.created_at)}
                    {incident.reporter && (
                        <>
                            {' · '}
                            <span style={{ color: G.forest }}>@{incident.reporter}</span>
                        </>
                    )}
                </div>
            </div>
            <ChevronRight className="w-3.5 h-3.5" style={{ color: G.inkSoft }} strokeWidth={1.6} />
        </Link>
    );
}

export default MapPage;
