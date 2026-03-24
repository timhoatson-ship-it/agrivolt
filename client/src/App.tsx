import { Routes, Route } from 'react-router-dom';
import LandingPage from './pages/LandingPage';
import MapExplorer from './pages/MapExplorer';
import DeveloperDashboard from './pages/DeveloperDashboard';
import NotFound from './pages/NotFound';

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<LandingPage />} />
      <Route path="/explore" element={<MapExplorer />} />
      <Route path="/dashboard" element={<DeveloperDashboard />} />
      <Route path="*" element={<NotFound />} />
    </Routes>
  );
}
