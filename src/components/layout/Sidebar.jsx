import { NavLink, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Map, FilePlus2 } from 'lucide-react';
import { cn } from '../../lib/cn';
import { BrandMark } from '../common/BrandMark';

/**
 * Grove navigation rail.
 *
 * 64-wide rail (collapses to a bottom bar on phones in `AppShell`), warm-paper
 * background, forest-accent active state. The brand mark at the top doubles
 * as a link back to the map.
 */
const navItems = [
    { icon: Map,       label: 'Map',    path: '/map' },
    { icon: FilePlus2, label: 'Report', path: '/report' },
];

function Sidebar() {
    return (
        <aside className="hidden md:flex w-16 h-full bg-[var(--grove-surf)] border-r border-[var(--grove-hairline)] flex-col">
            {/* Brand */}
            <div className="h-14 flex items-center justify-center border-b border-[var(--grove-hairline)]">
                <Link to="/map" aria-label="#SAVEKBR home">
                    <motion.div whileTap={{ scale: 0.93 }}>
                        <BrandMark size={36} />
                    </motion.div>
                </Link>
            </div>

            {/* Nav */}
            <nav className="flex-1 py-4 flex flex-col gap-1 px-2">
                {navItems.map((item) => {
                    const Icon = item.icon;
                    return (
                        <NavLink key={item.path} to={item.path} className="relative group">
                            {({ isActive }) => (
                                <>
                                    <motion.div
                                        whileTap={{ scale: 0.95 }}
                                        className={cn(
                                            'w-12 h-10 rounded-[10px] flex items-center justify-center transition-colors duration-100',
                                            isActive
                                                ? 'bg-white text-forest border border-[var(--grove-line)] shadow-[0_4px_10px_-6px_rgba(31,51,34,0.5)]'
                                                : 'text-ink-soft hover:text-ink hover:bg-white/60 border border-transparent'
                                        )}
                                    >
                                        <Icon className="w-[18px] h-[18px]" />
                                        {isActive && (
                                            <motion.span
                                                layoutId="sidebar-active"
                                                className="absolute left-0 w-[3px] h-5 bg-forest rounded-r-sm"
                                                transition={{ type: 'spring', stiffness: 500, damping: 35 }}
                                            />
                                        )}
                                    </motion.div>

                                    {/* Hover tooltip */}
                                    <div className="absolute left-full ml-2 top-1/2 -translate-y-1/2 px-2.5 py-1 bg-white border border-[var(--grove-line)] text-ink text-xs font-medium rounded-md opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap z-50 shadow-grove-card">
                                        {item.label}
                                    </div>
                                </>
                            )}
                        </NavLink>
                    );
                })}
            </nav>

            {/* Build label */}
            <div className="py-3 px-2 border-t border-[var(--grove-hairline)] flex items-center justify-center">
                <span className="font-mono text-[9px] text-ink-mute uppercase tracking-widest select-none">
                    v0.2
                </span>
            </div>
        </aside>
    );
}

/**
 * Mobile bottom-bar variant of the sidebar (md:hidden). Same routes,
 * tab-bar style.
 */
function MobileTabBar() {
    return (
        <nav className="md:hidden h-14 bg-white border-t border-[var(--grove-hairline)] flex items-stretch z-30">
            {navItems.map((item) => {
                const Icon = item.icon;
                return (
                    <NavLink key={item.path} to={item.path} className="flex-1">
                        {({ isActive }) => (
                            <div className={cn(
                                'flex flex-col items-center justify-center gap-0.5 h-full text-[11px] font-medium',
                                isActive ? 'text-forest' : 'text-ink-mute'
                            )}>
                                <Icon className="w-5 h-5" />
                                <span>{item.label}</span>
                            </div>
                        )}
                    </NavLink>
                );
            })}
        </nav>
    );
}

export { Sidebar, MobileTabBar };
