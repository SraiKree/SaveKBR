import { useState, useEffect, useCallback } from 'react';
import { supabase } from '../lib/supabase';

/**
 * useReports — fetches reports from Supabase and subscribes to realtime
 * INSERT / UPDATE events.
 *
 * @param {{ status?: 'active'|'resolved'|'dismissed'|'all', dateFrom?: string|null, dateTo?: string|null }} options
 */
export function useReports({ status = 'active', dateFrom = null, dateTo = null } = {}) {
    const [reports, setReports] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    const fetchReports = useCallback(async () => {
        setLoading(true);
        let q = supabase.from('reports').select('*').order('created_at', { ascending: false });
        if (status !== 'all') q = q.eq('status', status);
        if (dateFrom) q = q.gte('created_at', dateFrom);
        if (dateTo) q = q.lte('created_at', dateTo);
        const { data, error: err } = await q;
        if (err) setError(err);
        else setReports(data ?? []);
        setLoading(false);
    }, [status, dateFrom, dateTo]);

    useEffect(() => {
        fetchReports();

        const matchesDateFilter = (r) =>
            (!dateFrom || new Date(r.created_at) >= new Date(dateFrom)) &&
            (!dateTo || new Date(r.created_at) <= new Date(dateTo));

        const channel = supabase
            .channel('reports-realtime')
            .on(
                'postgres_changes',
                { event: 'INSERT', schema: 'public', table: 'reports' },
                (payload) => {
                    const r = payload.new;
                    if ((status === 'all' || r.status === status) && matchesDateFilter(r)) {
                        setReports((prev) => [r, ...prev]);
                    }
                }
            )
            .on(
                'postgres_changes',
                { event: 'UPDATE', schema: 'public', table: 'reports' },
                (payload) => {
                    const r = payload.new;
                    if (status !== 'all' && r.status !== status) {
                        setReports((prev) => prev.filter((x) => x.id !== r.id));
                    } else {
                        setReports((prev) => prev.map((x) => (x.id === r.id ? r : x)));
                    }
                }
            )
            .subscribe();

        return () => { supabase.removeChannel(channel); };
    }, [fetchReports, status, dateFrom, dateTo]);

    return { reports, loading, error, refetch: fetchReports };
}
