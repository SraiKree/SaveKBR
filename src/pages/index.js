// Pages
export { default as OnboardingPage } from './OnboardingPage';
export { default as MapPage } from './MapPage';
export { default as ReportPage } from './ReportPage';
export { default as DetailPage } from './DetailPage';

// Legacy alias — the old `DashboardPage` import now resolves to MapPage so
// any external bookmarks or tests that still target it keep working until
// they're migrated.
export { default as DashboardPage } from './MapPage';
