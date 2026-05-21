import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
    ChevronLeft,
    ChevronRight,
    User,
    Map as MapIcon,
    Plus,
    Camera,
    Send,
    Bell,
} from 'lucide-react';
import { BrandMark } from '../components/common/BrandMark';
import { G } from '../lib/grove';


const STEPS = [
    {
        icon: User,
        title: 'Pick a handle',
        body:
            'No sign-up, no email, no password. Type a nickname so your reports have a name on them.',
    },
    {
        icon: MapIcon,
        title: 'See the live map',
        body:
            'You land on the KBR Park map. Coloured pins show what other volunteers have reported — red for critical, amber for active, green for resolved.',
    },
    {
        icon: Plus,
        title: 'Spot felling? Tap the + button',
        body:
            'See illegal tree-cutting or fresh stumps? Tap the green "+" button in the corner of the map to open a new report.',
    },
    {
        icon: Camera,
        title: 'Add 1–3 photos and a quick note',
        body:
            'Photos are the evidence. Your phone\'s GPS and the current timestamp are attached for you — just describe what you saw.',
    },
    {
        icon: Send,
        title: 'Submit — all volunteers see it instantly',
        body:
            'Your report appears on every volunteer\'s map within seconds.',
    },
    {
        icon: Bell,
        title: 'Track follow-up',
        body:
            'Tap any pin to view its full thread: photos, who reported it, the status timeline, and any ranger updates. You\'ll see when your report gets resolved.',
    },
];

function HowItWorksPage() {
    return (
        <div className="min-h-screen w-full flex justify-center" style={{ background: G.bg }}>
            <div
                className="w-full max-w-[440px] min-h-screen flex flex-col px-6 pb-10 pt-3"
                style={{ fontFamily: G.ui, color: G.ink, letterSpacing: '-0.005em' }}
            >
                {/* Brand strip with a back link to the splash */}
                <div className="flex items-center justify-between pt-1.5">
                    <Link
                        to="/"
                        className="flex items-center gap-1 text-[13px] font-medium"
                        style={{ color: G.inkSoft }}
                    >
                        <ChevronLeft className="w-4 h-4" strokeWidth={2.2} />
                        Back
                    </Link>
                    <div className="flex items-center gap-2">
                        <BrandMark size={24} />
                        <div className="text-[12px] font-bold text-ink">#SAVEKBR</div>
                    </div>
                </div>

                {/* Headline */}
                <motion.div
                    initial={{ opacity: 0, y: 6 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.45, ease: 'easeOut' }}
                    className="mt-8"
                >
                    <div
                        className="text-[11px] font-semibold tracking-[0.14em] uppercase"
                        style={{ color: G.forest }}
                    >
                        How it works
                    </div>
                    <h1 className="m-0 font-bold text-[28px] leading-[1.1] tracking-[-0.02em] mt-2 text-ink">
                        From spotting a felled tree to bringing it to everyone's attention, in six&nbsp;steps.
                    </h1>
                    <p
                        className="text-[14px] leading-[1.55] mt-3 mb-0"
                        style={{ color: G.inkSoft }}
                    >
                        #SAVEKBR turns every volunteer in Hyderabad into a pair of eyes for
                        KBR National Park. Here&rsquo;s exactly what happens when you open the
                        app.
                    </p>
                </motion.div>

                {/* Steps */}
                <ol className="mt-7 flex flex-col gap-3" style={{ listStyle: 'none', padding: 0 }}>
                    {STEPS.map((step, idx) => {
                        const Icon = step.icon;
                        return (
                            <motion.li
                                key={step.title}
                                initial={{ opacity: 0, y: 8 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ duration: 0.35, delay: 0.05 + idx * 0.05 }}
                                className="flex gap-3.5 p-4 rounded-[14px]"
                                style={{ background: G.white, border: `1px solid ${G.line}` }}
                            >
                                <div
                                    className="shrink-0 w-10 h-10 rounded-full flex items-center justify-center relative"
                                    style={{ background: `${G.forest}14`, color: G.forest }}
                                >
                                    <Icon className="w-[18px] h-[18px]" strokeWidth={2} />
                                    <span
                                        className="absolute -top-1.5 -right-1.5 w-[18px] h-[18px] rounded-full flex items-center justify-center text-[10px] font-bold"
                                        style={{
                                            background: G.forest,
                                            color: G.bg,
                                            fontFamily: G.mono,
                                        }}
                                    >
                                        {idx + 1}
                                    </span>
                                </div>
                                <div className="flex-1 min-w-0">
                                    <div className="text-[14.5px] font-semibold leading-tight text-ink">
                                        {step.title}
                                    </div>
                                    <p
                                        className="text-[13px] leading-[1.5] mt-1 mb-0"
                                        style={{ color: G.inkSoft }}
                                    >
                                        {step.body}
                                    </p>
                                </div>
                            </motion.li>
                        );
                    })}
                </ol>

                {/* CTA back to onboarding */}
                <Link
                    to="/"
                    className="mt-7 h-[50px] rounded-[14px] flex items-center justify-center gap-2 text-[15px] font-semibold no-underline"
                    style={{
                        background: G.forest,
                        color: G.bg,
                        boxShadow: '0 10px 24px -12px rgba(31,51,34,0.5)',
                    }}
                >
                    Got it — let&rsquo;s patrol
                    <ChevronRight className="w-3.5 h-3.5" strokeWidth={2.4} />
                </Link>

                <div
                    className="text-center mt-4 text-[11.5px]"
                    style={{ color: G.inkMute }}
                >
                    Questions? Open-source on GitHub · volunteer-run.
                </div>
            </div>
        </div>
    );
}

export default HowItWorksPage;
