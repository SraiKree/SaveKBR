/**
 * Shared time utilities used by map components and report lists.
 */

export function timeAgo(ts) {
    if (!ts) return '';
    const s = Math.floor((Date.now() - new Date(ts).getTime()) / 1000);
    if (s < 60) return 'just now';
    const m = Math.floor(s / 60);
    if (m < 60) return `${m} min${m > 1 ? 's' : ''} ago`;
    const h = Math.floor(m / 60);
    if (h < 24) return `${h} hr${h > 1 ? 's' : ''} ago`;
    const d = Math.floor(h / 24);
    return `${d} day${d > 1 ? 's' : ''} ago`;
}

/** Returns true when a report is older than 30 days (considered historical). */
export function isHistorical(createdAt) {
    if (!createdAt) return false;
    return (Date.now() - new Date(createdAt).getTime()) > 30 * 24 * 60 * 60 * 1000;
}
