import { useMemo, useState } from 'react';
import { motion } from 'framer-motion';
import { Link, useNavigate } from 'react-router-dom';
import { Search, Plus, Locate, ChevronRight } from 'lucide-react';
import { GroveMap } from '../components/dashboard';
import { useReports } from '../hooks/useReports';
import { supabase } from '../lib/supabase';
import { G } from '../lib/grove';
import { timeAgo, isHistorical } from '../lib/timeUtils';

const ECO_GREEN = '#10b981';

const STATUS_FILTERS = ['Active', 'Resolved', 'All'];
const DATE_FILTERS = ['24h', '7d', '30d', 'All time'];

function dateFromFilter(label) {
    const now = new Date();
    if (label === '24h') return new Date(now - 24 * 60 * 60 * 1000).toISOString();
    if (label === '7d') return new Date(now - 7 * 24 * 60 * 60 * 1000).toISOString();
    if (label === '30d') return new Date(now - 30 * 24 * 60 * 60 * 1000).toISOString();
    return null;
}

/**
 * MapPage — primary home view.
 *
 * Reads from the `reports` table (not the old `incidents` table).
 * Supports status + date filters, admin resolve/dismiss actions, and
 * real-time updates via useReports.
 */
function MapPage() {
    const navigate = useNavigate();
    const [statusFilter, setStatusFilter] = useState('Active');
    const [dateFilter, setDateFilter] = useState('All time');
    const isAdmin = true; // TODO: gate behind real auth

    const statusParam = statusFilter.toLowerCase(); // 'active' | 'resolved' | 'all'
    const dateFromParam = dateFromFilter(dateFilter);

    const { reports, loading } = useReports({
        status: statusParam,
        dateFrom: dateFromParam,
    });

    const handleResolve = async (id, oldStatus) => {
        const { error } = await supabase
            .from('reports')
            .update({ status: 'resolved', updated_at: new Date().toISOString() })
            .eq('id', id);
        if (!error) {
            await supabase.from('report_history').insert({
                report_id: id,
                old_status: oldStatus,
                new_status: 'resolved',
                admin_identifier:
                    (typeof localStorage !== 'undefined' && localStorage.getItem('savekbr.handle')) ||
                    'admin',
            });
        }
    };

    const handleDismiss = async (id, oldStatus) => {
        const { error } = await supabase
            .from('reports')
            .update({ status: 'dismissed', updated_at: new Date().toISOString() })
            .eq('id', id);
        if (!error) {
            await supabase.from('report_history').insert({
                report_id: id,
                old_status: oldStatus,
                new_status: 'dismissed',
                admin_identifier:
                    (typeof localStorage !== 'undefined' && localStorage.getItem('savekbr.handle')) ||
                    'admin',
            });
        }
    };

    const counts = useMemo(() => {
        const c = { active: 0, resolved: 0, dismissed: 0 };
        for (const r of reports) c[r.status] = (c[r.status] || 0) + 1;
        return c;
    }, [reports]);

    return (
        <div className="w-full h-full relative" style={{ background: '#e3dfcf' }}>
            {/* Map base layer */}
            <div className="absolute inset-0 z-0">
                <GroveMap
                    reports={reports}
                    onResolve={handleResolve}
                    onDismiss={handleDismiss}
                    isAdmin={isAdmin}
                />
            </div>

            {/* Loading shimmer */}
            {loading && (
                <div
                    className="absolute inset-0 z-10 flex items-center justify-center"
                    style={{ background: 'rgba(239,236,226,0.85)' }}
                >
                    <div className="text-ink-soft text-sm font-medium animate-pulse">
                        Loading patrol data…
                    </div>
                </div>
            )}

            {/* Top app bar */}
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
                        <div className="text-[14.5px] font-semibold leading-tight text-ink">
                            KBR National Park
                        </div>
                        <div className="text-[11px] mt-0.5 flex gap-2.5" style={{ color: G.inkSoft }}>
                            <span>
                                <span style={{ color: ECO_GREEN, fontWeight: 600 }}>
                                    {counts.active}
                                </span>{' '}
                                active
                            </span>
                            <span>
                                <span style={{ color: G.leaf, fontWeight: 600 }}>
                                    {counts.resolved}
                                </span>{' '}
                                resolved
                            </span>
                            <span>
                                <span style={{ color: G.inkMute, fontWeight: 600 }}>
                                    {reports.length}
                                </span>{' '}
                                visible
                            </span>
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

            {/* Status filter chips */}
            <div className="absolute top-[78px] left-0 right-0 px-3.5 z-20 flex gap-1.5 overflow-x-auto sk-no-scrollbar">
                {STATUS_FILTERS.map((label) => {
                    const on = label === statusFilter;
                    return (
                        <button
                            key={label}
                            onClick={() => setStatusFilter(label)}
                            className="px-3 py-1.5 rounded-full text-[12.5px] font-medium whitespace-nowrap"
                            style={{
                                background: on ? ECO_GREEN : 'rgba(255,255,255,0.92)',
                                color: on ? '#fff' : G.ink,
                                border: on ? 'none' : `1px solid ${G.line}`,
                                boxShadow: on ? `0 4px 10px -6px ${ECO_GREEN}88` : 'none',
                            }}
                            type="button"
                        >
                            {label}
                        </button>
                    );
                })}

                {/* Divider dot */}
                <span className="flex items-center text-[12px] px-0.5" style={{ color: G.inkMute }}>
                    ·
                </span>

                {DATE_FILTERS.map((label) => {
                    const on = label === dateFilter;
                    return (
                        <button
                            key={label}
                            onClick={() => setDateFilter(label)}
                            className="px-3 py-1.5 rounded-full text-[12.5px] font-medium whitespace-nowrap"
                            style={{
                                background: on ? G.forest : 'rgba(255,255,255,0.92)',
                                color: on ? G.bg : G.ink,
                                border: on ? 'none' : `1px solid ${G.line}`,
                                boxShadow: on ? '0 4px 10px -6px rgba(31,51,34,0.45)' : 'none',
                            }}
                            type="button"
                        >
                            {label}
                        </button>
                    );
                })}
            </div>

            {/* Locate-me button */}
            <div className="absolute left-3.5 top-[140px] z-20">
                <button
                    className="w-9 h-9 rounded-[10px] flex items-center justify-center"
                    style={{
                        background: 'rgba(255,255,255,0.92)',
                        border: `1px solid ${G.hairline}`,
                        color: G.forest,
                    }}
                    aria-label="Locate me"
                    type="button"
                >
                    <Locate className="w-4 h-4" strokeWidth={1.6} />
                </button>
            </div>

            {/* Legend */}
            <div
                className="absolute right-3.5 top-[140px] z-20 rounded-[10px] px-2.5 py-2 text-[11.5px] leading-[1.7]"
                style={{
                    background: 'rgba(255,255,255,0.92)',
                    border: `1px solid ${G.hairline}`,
                    color: G.inkSoft,
                }}
            >
                <LegendRow color={ECO_GREEN} label="Active" />
                <LegendRow color={G.leaf} label="Resolved" />
                <LegendRow color={G.inkMute} label="Historical" opacity={0.45} />
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
                <div
                    className="mx-auto mb-2.5 h-1 w-9 rounded-full"
                    style={{ background: G.line }}
                />
                <div className="flex items-baseline justify-between mb-2.5">
                    <div className="text-[15px] font-semibold text-ink">Reports</div>
                    <div className="text-[11.5px]" style={{ color: G.inkMute }}>
                        {reports.length} {reports.length === 1 ? 'report' : 'reports'}
                    </div>
                </div>

                <div className="max-h-[34vh] overflow-y-auto sk-no-scrollbar">
                    {reports.length === 0 ? (
                        <div className="py-6 text-center text-[13px]" style={{ color: G.inkMute }}>
                            No reports match this filter.
                        </div>
                    ) : (
                        reports.slice(0, 5).map((r) => <SheetReportRow key={r.id} report={r} />)
                    )}
                </div>

                {/* FAB */}
                <button
                    onClick={() => navigate('/report')}
                    className="absolute right-4 -top-7 h-[60px] rounded-[30px] pl-4 pr-5 flex items-center gap-2.5 text-[15px] font-semibold cursor-pointer"
                    style={{
                        background: ECO_GREEN,
                        color: '#fff',
                        border: 'none',
                        boxShadow: `0 14px 30px -10px ${ECO_GREEN}88`,
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

function LegendRow({ color, label, opacity = 1 }) {
    return (
        <div className="flex items-center gap-2">
            <span
                className="inline-block w-2 h-2 rounded-full"
                style={{ background: color, opacity }}
            />
            {label}
        </div>
    );
}

function SheetReportRow({ report }) {
    const hist = isHistorical(report.created_at);
    return (
        <Link
            to={`/report/${report.id}`}
            className="flex items-center gap-3 py-2.5 border-t"
            style={{ borderColor: G.hairline, opacity: hist ? 0.6 : 1 }}
        >
            <div
                className="w-[38px] h-[38px] rounded-[10px] flex items-center justify-center flex-shrink-0 overflow-hidden"
                style={{ background: `${ECO_GREEN}18` }}
            >
                {report.photo_urls?.[0] ? (
                    <img
                        src={report.photo_urls[0]}
                        alt=""
                        className="w-full h-full object-cover"
                    />
                ) : (
                    <span
                        className="w-2.5 h-2.5 rounded-full"
                        style={{ background: ECO_GREEN }}
                    />
                )}
            </div>
            <div className="flex-1 min-w-0">
                <div className="text-[14px] font-semibold text-ink leading-tight truncate">
                    {report.reporter_name}
                </div>
                <div className="text-[12px] mt-0.5 truncate" style={{ color: G.inkMute }}>
                    {timeAgo(report.created_at)}
                    {hist && ' · Historical'}
                    {report.description && ` · ${report.description.slice(0, 40)}…`}
                </div>
            </div>
            <ChevronRight
                className="w-3.5 h-3.5 flex-shrink-0"
                style={{ color: G.inkSoft }}
                strokeWidth={1.6}
            />
        </Link>
    );
}

export default MapPage;
