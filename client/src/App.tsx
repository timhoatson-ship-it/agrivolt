import { Routes, Route } from 'react-router-dom';
import { Suspense, lazy } from 'react';
import { ErrorBoundary } from './components/ErrorBoundary';
import LandingPage from './pages/LandingPage';
import NotFound from './pages/NotFound';

// Lazy-load heavy map pages
const MapExplorer = lazy(() => import('./pages/MapExplorer'));
const DeveloperDashboard = lazy(() => import('./pages/DeveloperDashboard'));

function LoadingFallback() {
  return (
    <div className="h-screen flex items-center justify-center bg-gray-950">
      <div className="flex items-center gap-3 text-white">
        <svg className="w-5 h-5 animate-spin" viewBox="0 0 24 24" fill="none">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
        </svg>
        <span className="text-sm font-medium">Loading AgriVolt...</span>
      </div>
    </div>
  );
}

export default function App() {
  return (
    <ErrorBoundary>
      <Suspense fallback={<LoadingFallback />}>
        <Routes>
          <Route path="/" element={<LandingPage />} />
          <Route path="/explore" element={<MapExplorer />} />
          <Route path="/dashboard" element={<DeveloperDashboard />} />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </Suspense>
    </ErrorBoundary>
  );
}
