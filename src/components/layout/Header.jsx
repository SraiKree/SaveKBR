import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Wifi, WifiOff } from 'lucide-react';
import { cn } from '../../lib/cn';
import { BrandMark } from '../common/BrandMark';

/**
 * Grove top bar.
 *
 * Warm surface, brand mark on the left, a small "patrolling" pill so the
 * volunteer feels part of a group, plus a live clock on the right.
 * The wifi icon doubles as the connectivity indicator (online/offline).
 */
function Header({ className }) {
    const [currentTime, setCurrentTime] = useState(new Date());
    const [isOnline, setIsOnline] = useState(navigator?.onLine ?? true);

    useEffect(() => {
        const t = setInterval(() => setCurrentTime(new Date()), 1000);
        const on = () => setIsOnline(true);
        const off = () => setIsOnline(false);
        window.addEventListener('online', on);
        window.addEventListener('offline', off);
        return () => {
            clearInterval(t);
            window.removeEventListener('online', on);
            window.removeEventListener('offline', off);
        };
    }, []);

    const formatTime = (d) => d.toLocaleTimeString('en-IN', { hour12: false, hour: '2-digit', minute: '2-digit' });
    const formatDate = (d) => d.toLocaleDateString('en-IN', { weekday: 'short', month: 'short', day: 'numeric' });

    return (
        <header className={cn(
            'h-14 bg-[var(--grove-surf)] border-b border-[var(--grove-hairline)] flex items-center justify-between px-4 md:px-6',
            className
        )}>
            {/* Left — brand + product name */}
            <div className="flex items-center gap-3">
                {/* Mobile-only brand mark (sidebar shows it on desktop) */}
                <div className="md:hidden"><BrandMark size={30} /></div>
                <div className="flex flex-col leading-tight">
                    <span className="text-[13px] font-bold text-ink tracking-tight">#SAVEKBR</span>
                    <span className="text-[10.5px] text-ink-mute tracking-wider">Volunteer · Hyderabad</span>
                </div>
            </div>

            {/* Right — patrolling pill, status, clock */}
            <div className="flex items-center gap-3 md:gap-5">


                <div className="flex items-center gap-1.5 text-ink-soft">
                    {isOnline ? <Wifi className="w-4 h-4 text-forest" /> : <WifiOff className="w-4 h-4 text-ink-mute" />}
                    <span className="hidden md:inline text-[11px] font-semibold uppercase tracking-wider">
                        {isOnline ? 'Online' : 'Offline'}
                    </span>
                </div>

                <div className="hidden md:flex items-center gap-2 text-ink-soft">
                    <span className="text-[11px] font-medium">{formatDate(currentTime)}</span>
                    <span className="font-mono text-[12.5px] text-ink tabular-nums">{formatTime(currentTime)}</span>
                </div>
            </div>
        </header>
    );
}

export { Header };
