import { G } from '../../lib/grove';

/**
 * Hand-drawn leaf glyph used in the Grove brand mark. Matches the SVG path
 * in _designs/direction-grove.jsx — keep them in sync if either changes.
 */
function Leaf({ size = 14, color = G.bg }) {
    return (
        <svg width={size} height={size} viewBox="0 0 8 8" fill={color} aria-hidden="true">
            <path d="M4 0.5 C 5 2, 5 3, 7 3.5 C 5.5 4, 5 5.5, 4 7.5 C 3 5.5, 2.5 4, 1 3.5 C 3 3, 3 2, 4 0.5 Z" />
        </svg>
    );
}

/**
 * BrandMark — small rounded-square tile with the leaf glyph inside.
 * Default background is forest green, foreground is paper.
 */
function BrandMark({ size = 36, bg = G.forest, fg = G.bg }) {
    return (
        <div
            style={{
                width: size,
                height: size,
                borderRadius: size * 0.28,
                background: bg,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
            }}
        >
            <Leaf size={size * 0.5} color={fg} />
        </div>
    );
}

export { BrandMark, Leaf };
