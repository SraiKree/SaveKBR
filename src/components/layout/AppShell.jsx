import { Outlet } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Sidebar, MobileTabBar } from './Sidebar';
import { Header } from './Header';

/**
 * AppShell — Grove layout wrapper.
 *
 * Layout shape:
 *   ┌──────┬───────────────────────────────────┐
 *   │      │  Header                            │
 *   │ Side │───────────────────────────────────│
 *   │ bar  │  <Outlet/>  (full-bleed responsive)│
 *   │      │                                    │
 *   │      │───────────────────────────────────│
 *   │      │  (mobile tab bar replaces sidebar) │
 *   └──────┴───────────────────────────────────┘
 *
 * On <md the sidebar collapses into a bottom tab bar so the design works
 * unchanged on phones; on ≥md, the rail is visible alongside content.
 */
function AppShell() {
    return (
        <div className="h-screen w-screen flex overflow-hidden bg-background">
            <Sidebar />

            <div className="flex-1 flex flex-col overflow-hidden">
                <Header />

                <motion.main
                    className="flex-1 relative overflow-hidden bg-background"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ duration: 0.3 }}
                >
                    <Outlet />
                </motion.main>

                <MobileTabBar />
            </div>
        </div>
    );
}

export { AppShell };
