import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AppShell } from './components/layout';
import { OnboardingPage, MapPage, ReportPage, DetailPage } from './pages';
import './index.css';

/**
 * #SAVEKBR — KBR National Park tree-felling patrol app.
 *
 * Routes:
 *   /                  → OnboardingPage  (full-bleed splash, no shell)
 *   /map               → MapPage         (primary home, wrapped in AppShell)
 *   /report            → ReportPage      (new report form)
 *   /report/:id        → DetailPage      (single report view)
 *   *                  → /map            (catch-all)
 *
 * The shell (sidebar + header + mobile tab bar) only wraps the
 * post-onboarding routes — the welcome screen is meant to feel like a
 * full-screen splash.
 */
function App() {
    return (
        <BrowserRouter>
            <Routes>
                <Route path="/" element={<OnboardingPage />} />

                <Route element={<AppShell />}>
                    <Route path="/map" element={<MapPage />} />
                    <Route path="/report" element={<ReportPage />} />
                    <Route path="/report/:id" element={<DetailPage />} />
                </Route>

                <Route path="*" element={<Navigate to="/map" replace />} />
            </Routes>
        </BrowserRouter>
    );
}

export default App;
