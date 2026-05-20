import { cn } from '../../lib/cn';
import { severityColor } from '../../lib/grove';

/**
 * Generic badge — kept for compatibility with the legacy code paths
 * (Header/Modal/etc.). Tints now lean Grove: emerald → leaf, amber → amber,
 * red → clay.
 */
function Badge({ className, variant = 'default', children, ...props }) {
    const variants = {
        default:   'bg-[var(--grove-surf)] text-ink-soft border border-[var(--grove-line)]',
        success:   'bg-leaf/15 text-leaf border border-leaf/30',
        warning:   'bg-amber/15 text-amber border border-amber/30',
        danger:    'bg-clay/15 text-clay border border-clay/30',
        info:      'bg-forest/10 text-forest border border-forest/25',
        online:    'bg-leaf/15 text-leaf border border-leaf/30',
        offline:   'bg-[var(--grove-surf)] text-ink-mute border border-[var(--grove-line)]',
        open:      'bg-amber/15 text-amber border border-amber/30',
        fulfilled: 'bg-leaf/15 text-leaf border border-leaf/30',
        urgent:    'bg-clay/15 text-clay border border-clay/30 animate-pulse-slow',
    };

    return (
        <span
            className={cn(
                'inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold',
                variants[variant] || variants.default,
                className
            )}
            {...props}
        >
            {children}
        </span>
    );
}

/**
 * StatusDot — small dot indicator. The "danger" colour is now clay (Grove's
 * critical accent) instead of pure red so it matches the rest of the system.
 */
function StatusDot({ className, status = 'default', pulse = false, ...props }) {
    const colors = {
        default: 'bg-ink-mute',
        online:  'bg-leaf',
        offline: 'bg-ink-mute',
        danger:  'bg-clay',
        warning: 'bg-amber',
    };

    return (
        <span
            className={cn(
                'inline-block w-2 h-2 rounded-full',
                colors[status] || colors.default,
                pulse && 'animate-pulse',
                className
            )}
            {...props}
        />
    );
}

/**
 * SeverityPill — the Grove "critical / active / resolved" pill used on the
 * map sheet, the detail page, and the report form. Colour is driven by the
 * `severity` prop via the shared `severityColor` helper so a chip on the
 * map and a chip in the form look identical.
 */
function SeverityPill({ severity = 'active', size = 'md', className }) {
    const c = severityColor(severity);
    const label = severity.charAt(0).toUpperCase() + severity.slice(1);
    const isSm = size === 'sm';
    return (
        <span
            className={cn('inline-flex items-center gap-1.5 rounded-full font-semibold', className)}
            style={{
                padding: isSm ? '3px 8px' : '5px 10px',
                fontSize: isSm ? 11 : 12.5,
                background: `${c}1f`,
                color: c,
            }}
        >
            <span style={{ width: 7, height: 7, borderRadius: '50%', background: c }} />
            {label}
        </span>
    );
}

export { Badge, StatusDot, SeverityPill };
