import { cn } from '../../lib/cn';

/**
 * Card — Grove white-paper card with the same slot API as before
 * (Card / CardHeader / CardTitle / CardDescription / CardContent /
 *  CardFooter). Variants now lean light:
 *
 *   default  → white card, hairline border
 *   surface  → warm raised surface (`bg-surface`)
 *   elevated → white card + soft drop shadow
 *   ghost    → no background, just structure
 */
function Card({ className, variant = 'default', children, ...props }) {
    const variants = {
        default:  'bg-white border border-[var(--grove-hairline)]',
        surface:  'bg-[var(--grove-surf)] border border-[var(--grove-hairline)]',
        elevated: 'bg-white border border-[var(--grove-hairline)] shadow-grove-card',
        ghost:    'bg-transparent',
    };

    return (
        <div className={cn('rounded-[12px]', variants[variant] || variants.default, className)} {...props}>
            {children}
        </div>
    );
}

function CardHeader({ className, children, ...props }) {
    return (
        <div className={cn('px-5 py-4 border-b border-[var(--grove-hairline)]', className)} {...props}>
            {children}
        </div>
    );
}

function CardTitle({ className, children, ...props }) {
    return (
        <h3 className={cn('text-[16px] font-semibold text-ink leading-tight', className)} {...props}>
            {children}
        </h3>
    );
}

function CardDescription({ className, children, ...props }) {
    return (
        <p className={cn('text-[13px] text-ink-soft mt-1', className)} {...props}>
            {children}
        </p>
    );
}

function CardContent({ className, children, ...props }) {
    return <div className={cn('px-5 py-4', className)} {...props}>{children}</div>;
}

function CardFooter({ className, children, ...props }) {
    return (
        <div className={cn('px-5 py-4 border-t border-[var(--grove-hairline)]', className)} {...props}>
            {children}
        </div>
    );
}

export { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter };
