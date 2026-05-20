import { forwardRef } from 'react';
import { cn } from '../../lib/cn';

/**
 * Button — Grove-styled, with the same prop shape as the legacy tactical
 * button so existing call sites keep working. Variants:
 *
 *   primary / default → forest green (the headline CTA)
 *   alert / danger    → clay (the critical-alert button)
 *   safe              → leaf green
 *   ghost             → transparent
 *   outline           → white + line border
 */
const Button = forwardRef(({
    className,
    variant = 'default',
    size = 'md',
    children,
    ...props
}, ref) => {
    const baseStyles = 'inline-flex items-center justify-center rounded-[12px] font-semibold transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-forest focus-visible:ring-offset-2 focus-visible:ring-offset-background disabled:opacity-50 disabled:pointer-events-none';

    const variants = {
        default: 'bg-forest text-background hover:bg-forest-deep shadow-grove-primary',
        primary: 'bg-forest text-background hover:bg-forest-deep shadow-grove-primary',
        danger:  'bg-clay text-background hover:brightness-95 shadow-grove-fab',
        alert:   'bg-clay text-background hover:brightness-95 shadow-grove-fab',
        safe:    'bg-leaf text-background hover:brightness-95',
        ghost:   'bg-transparent text-ink hover:bg-[var(--grove-surf)]',
        outline: 'border border-[var(--grove-line)] bg-white text-ink hover:bg-[var(--grove-surf)]',
    };

    const sizes = {
        sm: 'h-9 px-3 text-[13px]',
        md: 'h-11 px-4 text-[14px]',
        lg: 'h-12 px-6 text-[15px]',
        xl: 'h-[54px] px-8 text-[15.5px]',
    };

    return (
        <button
            ref={ref}
            className={cn(baseStyles, variants[variant] || variants.default, sizes[size] || sizes.md, className)}
            {...props}
        >
            {children}
        </button>
    );
});

Button.displayName = 'Button';

export { Button };
