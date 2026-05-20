import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ChevronRight } from 'lucide-react';
import { BrandMark } from '../components/common/BrandMark';
import { G } from '../lib/grove';

/**
 * Three random-but-plausible volunteer handles, used by the "Shuffle"
 * button. Mirrors the placeholder shown in the Grove design.
 */
const HANDLE_POOL = [
    'anita_p', 'kiran_v', 'leaf_walker', 'banjara_anu', 'ranger_friend',
    'gulmohar', 'neem_guard', 'monsoon_p', 'arjun_v', 'roopa_k',
];

/**
 * OnboardingPage — splash screen for the #SAVEKBR patrol app.
 *
 * No sign-up flow: the volunteer picks an optional handle (or leaves it
 * blank) and hits "Start patrolling" → /map. The handle is persisted to
 * localStorage so the rest of the app can read it back (e.g. report
 * submission, "Mine" filter on the map).
 *
 * The hero illustration is a layered SVG: park boundary as concentric
 * contour lines, scattered severity-coloured pins, and a corner pair of
 * map labels. It is a static decoration — no leaflet here.
 */
function OnboardingPage() {
    const navigate = useNavigate();
    const [handle, setHandle] = useState(localStorage.getItem('savekbr.handle') || 'anita_p');

    const shuffle = () => {
        const next = HANDLE_POOL[Math.floor(Math.random() * HANDLE_POOL.length)];
        setHandle(next);
    };

    const start = () => {
        localStorage.setItem('savekbr.handle', handle.trim());
        navigate('/map');
    };

    return (
        <div className="min-h-screen w-full flex justify-center" style={{ background: G.bg }}>
            <div
                className="w-full max-w-[440px] min-h-screen flex flex-col px-6 pb-6 pt-3"
                style={{ fontFamily: G.ui, color: G.ink, letterSpacing: '-0.005em' }}
            >
                {/* Brand strip */}
                <div className="flex items-center justify-between pt-1.5">
                    <div className="flex items-center gap-2.5">
                        <BrandMark size={32} />
                        <div>
                            <div className="text-[14px] font-bold leading-none text-ink">#SAVEKBR</div>
                            <div className="text-[10.5px] text-ink-mute mt-0.5 tracking-wider">Volunteer · Hyderabad</div>
                        </div>
                    </div>
                </div>

                {/* Hero — concentric contours of the park */}
                <motion.div
                    initial={{ opacity: 0, scale: 0.97 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ duration: 0.6, ease: 'easeOut' }}
                    className="-mx-6 mt-6 h-[300px] relative overflow-hidden"
                >
                    <svg viewBox="0 0 390 300" width="100%" height="100%" preserveAspectRatio="xMidYMid slice">
                        <defs>
                            <linearGradient id="groveSky" x1="0" y1="0" x2="0" y2="1">
                                <stop offset="0%" stopColor="#efece2" />
                                <stop offset="100%" stopColor="#e2dfce" />
                            </linearGradient>
                        </defs>
                        <rect width="390" height="300" fill="url(#groveSky)" />

                        {/* faint grid */}
                        <g stroke={G.line} strokeWidth="0.5" opacity="0.6">
                            {Array.from({ length: 8 }).map((_, i) => (
                                <line key={`v${i}`} x1={i * 50} y1="0" x2={i * 50} y2="300" />
                            ))}
                            {Array.from({ length: 6 }).map((_, i) => (
                                <line key={`h${i}`} x1="0" y1={i * 50} x2="390" y2={i * 50} />
                            ))}
                        </g>

                        {/* park contours, drawn from outermost to innermost */}
                        <g transform="translate(195 155)">
                            {[1, 0.86, 0.72, 0.58, 0.42, 0.26].map((s, i) => (
                                <path key={i}
                                    d={`M ${-110 * s} 0 C ${-110 * s} ${-90 * s}, ${-50 * s} ${-130 * s}, ${10 * s} ${-125 * s}
                                       C ${90 * s} ${-120 * s}, ${135 * s} ${-60 * s}, ${130 * s} ${10 * s}
                                       C ${125 * s} ${75 * s}, ${50 * s} ${125 * s}, ${-30 * s} ${115 * s}
                                       C ${-95 * s} ${105 * s}, ${-110 * s} ${50 * s}, ${-110 * s} 0 Z`}
                                    fill="none" stroke={G.forest}
                                    strokeWidth={i === 0 ? 1.5 : 0.8}
                                    opacity={0.18 + i * 0.1} />
                            ))}
                            {/* filled centre */}
                            <path d="M -40 0 C -40 -30, -15 -45, 10 -42 C 35 -40, 50 -20, 48 5 C 45 28, 18 42, -10 38 C -32 35, -40 18, -40 0 Z"
                                fill={G.leaf} opacity="0.28" />
                            {/* scattered pins */}
                            <g>
                                <circle cx="-30" cy="-50" r="4" fill={G.clay} />
                                <circle cx="55" cy="-20" r="4" fill={G.clay} />
                                <circle cx="60" cy="55" r="4" fill={G.amber} />
                                <circle cx="-65" cy="30" r="4" fill={G.amber} />
                                <circle cx="-10" cy="70" r="4" fill={G.leaf} />
                                <circle cx="0" cy="-5" r="6" fill={G.forest} stroke="#fff" strokeWidth="2" />
                                <circle cx="0" cy="-5" r="14" fill={G.forest} opacity="0.18" />
                            </g>
                        </g>

                        {/* corner labels */}
                        <text x="22" y="26" fontFamily={G.ui} fontSize="10" fontWeight="500" fill={G.inkMute} letterSpacing="0.04em">KBR National Park</text>
                        <text x="368" y="26" fontFamily={G.ui} fontSize="10" fontWeight="500" fill={G.inkMute} letterSpacing="0.04em" textAnchor="end">11 km loop</text>
                        <text x="22" y="284" fontFamily={G.mono} fontSize="9" fill={G.inkMute}>17.41° N</text>
                        <text x="368" y="284" fontFamily={G.mono} fontSize="9" fill={G.inkMute} textAnchor="end">78.43° E</text>
                    </svg>
                </motion.div>

                {/* Headline + handle + CTA pinned to bottom */}
                <div className="flex-1 flex flex-col justify-end pt-4">
                    <h1 className="m-0 font-bold text-[30px] leading-[1.08] tracking-[-0.02em] text-ink">
                        Help protect <span style={{ color: G.forest }}>KBR&nbsp;Park</span>, one&nbsp;pin&nbsp;at&nbsp;a&nbsp;time.
                    </h1>
                    <p className="text-[14.5px] leading-[1.5] mt-3 mb-0 max-w-[320px]" style={{ color: G.inkSoft }}>
                        See tree-felling? Drop a pin with a photo or video. No sign-up — your report is timestamped and shared with rangers automatically.
                    </p>

                    {/* Optional handle */}
                    <div
                        className="mt-5 flex items-center gap-2.5 px-3.5 py-3 rounded-[14px]"
                        style={{ background: G.white, border: `1px solid ${G.line}` }}
                    >
                        <div
                            className="w-8 h-8 rounded-full flex items-center justify-center font-semibold text-[14px]"
                            style={{ background: `${G.forest}1a`, color: G.forest }}
                        >
                            {(handle.trim()[0] || 'A').toUpperCase()}
                        </div>
                        <div className="flex-1 min-w-0">
                            <div className="text-[11.5px] font-medium" style={{ color: G.inkMute }}>
                                Pick a handle (optional)
                            </div>
                            <div className="flex items-center gap-0.5 mt-0.5">
                                <span style={{ color: G.inkMute, fontSize: 15 }}>@</span>
                                <input
                                    value={handle}
                                    onChange={(e) => setHandle(e.target.value.replace(/\s/g, '_').slice(0, 20))}
                                    className="flex-1 bg-transparent outline-none text-[15px] font-medium text-ink"
                                    placeholder="anita_p"
                                    spellCheck={false}
                                    autoCapitalize="off"
                                />
                            </div>
                        </div>
                        <button
                            onClick={shuffle}
                            className="bg-transparent text-[13px] font-semibold cursor-pointer"
                            style={{ color: G.forest }}
                            type="button"
                        >
                            Shuffle
                        </button>
                    </div>

                    <button
                        onClick={start}
                        className="mt-3.5 h-[54px] rounded-[14px] flex items-center justify-center gap-2.5 text-[15.5px] font-semibold"
                        style={{
                            background: G.forest,
                            color: G.bg,
                            boxShadow: '0 12px 28px -12px rgba(31,51,34,0.55)',
                        }}
                        type="button"
                    >
                        Start patrolling
                        <ChevronRight className="w-3.5 h-3.5" strokeWidth={2.4} />
                    </button>

                    <div className="text-center mt-2.5 text-[11.5px]" style={{ color: G.inkMute }}>
                        Open-source · volunteer-run ·{' '}
                        <Link to="/map" style={{ color: G.forest, textDecoration: 'underline', textUnderlineOffset: 2 }}>
                            how it works
                        </Link>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default OnboardingPage;
