import { Link } from 'react-router-dom';
import { MapPin } from 'lucide-react';

export default function NotFound() {
  return (
    <div className="min-h-screen bg-hero-bg flex items-center justify-center px-6">
      <div className="text-center">
        <MapPin className="w-12 h-12 text-brand-400 mx-auto" />
        <h1 className="mt-4 text-4xl font-bold font-display text-white">Page not found</h1>
        <p className="mt-2 text-gray-400">The page you're looking for doesn't exist.</p>
        <Link to="/" className="btn-primary mt-6 inline-flex">
          Back to Home
        </Link>
      </div>
    </div>
  );
}
