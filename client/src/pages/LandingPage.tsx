import { Link } from 'react-router-dom';
import { MapPin, Sun, Droplets, DollarSign, ArrowRight, Zap, Shield, BarChart3 } from 'lucide-react';

export default function LandingPage() {
  return (
    <div className="min-h-screen">
      {/* Navigation */}
      <nav className="absolute top-0 left-0 right-0 z-10 px-6 py-4">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-2">
            <AgriVoltLogo />
            <span className="text-xl font-bold text-white font-display">AgriVolt</span>
          </div>
          <div className="flex items-center gap-4">
            <a href="#how-it-works" className="text-hero-text/70 hover:text-white text-sm font-medium transition-colors hidden sm:inline">
              How It Works
            </a>
            <a href="#benefits" className="text-hero-text/70 hover:text-white text-sm font-medium transition-colors hidden sm:inline">
              Benefits
            </a>
            <Link
              to="/explore"
              className="btn-primary text-sm"
            >
              Check Your Land
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero */}
      <section className="relative bg-hero-bg overflow-hidden min-h-[90vh] flex items-center">
        {/* Geometric background shapes */}
        <div className="absolute inset-0">
          <div className="absolute top-20 left-10 w-96 h-96 bg-hero-shape/30 rounded-full blur-3xl" />
          <div className="absolute bottom-20 right-20 w-80 h-80 bg-hero-shape/20 rounded-full blur-2xl" />
          <div className="absolute top-40 right-40 w-64 h-64 bg-brand-900/20 rounded-full blur-2xl" />
          {/* Topographic line pattern (SVG) */}
          <svg className="absolute inset-0 w-full h-full opacity-5" xmlns="http://www.w3.org/2000/svg">
            <defs>
              <pattern id="topo" x="0" y="0" width="200" height="200" patternUnits="userSpaceOnUse">
                <path d="M0 100 Q50 80, 100 100 Q150 120, 200 100" stroke="#4ade80" fill="none" strokeWidth="0.5" />
                <path d="M0 60 Q50 40, 100 60 Q150 80, 200 60" stroke="#4ade80" fill="none" strokeWidth="0.5" />
                <path d="M0 140 Q50 120, 100 140 Q150 160, 200 140" stroke="#4ade80" fill="none" strokeWidth="0.5" />
              </pattern>
            </defs>
            <rect width="100%" height="100%" fill="url(#topo)" />
          </svg>
        </div>

        <div className="relative z-10 max-w-7xl mx-auto px-6 py-32 grid lg:grid-cols-2 gap-16 items-center">
          <div>
            <h1 className="text-3xl sm:text-5xl lg:text-hero font-bold font-display text-white leading-tight">
              Turn your{' '}
              <span className="text-brand-400">farm land</span>
              {' '}into{' '}
              <span className="text-brand-400">solar income</span>
            </h1>
            <p className="mt-6 text-lg text-hero-text/70 max-w-lg leading-relaxed">
              AgriVolt connects Queensland farmers with solar developers.
              Discover your property's agrivoltaic potential — guaranteed passive income,
              water savings, and shade premiums.
            </p>
            <div className="mt-10 flex flex-wrap gap-4">
              <Link to="/explore" className="btn-primary text-base gap-2">
                Check Your Land <ArrowRight className="w-4 h-4" />
              </Link>
              <a href="#how-it-works" className="btn-secondary !bg-transparent !text-white !border-white/20 hover:!border-white/40 text-base">
                Learn More
              </a>
            </div>
            {/* Quick stats */}
            <div className="mt-16 grid grid-cols-1 sm:grid-cols-3 gap-6 sm:gap-8">
              <div>
                <div className="text-2xl sm:text-3xl font-bold text-brand-400 font-display">$6.9B</div>
                <div className="text-sm text-hero-text/50 mt-1">AU agrivoltaics market by 2031</div>
              </div>
              <div>
                <div className="text-2xl sm:text-3xl font-bold text-brand-400 font-display">30%</div>
                <div className="text-sm text-hero-text/50 mt-1">water savings from panel shading</div>
              </div>
              <div>
                <div className="text-2xl sm:text-3xl font-bold text-brand-400 font-display">25yr</div>
                <div className="text-sm text-hero-text/50 mt-1">guaranteed lease income</div>
              </div>
            </div>
          </div>

          {/* Map mockup / CTA card */}
          <div className="relative hidden lg:block">
            <div className="bg-hero-shape/40 rounded-2xl p-1 shadow-2xl">
              <div className="bg-gray-900 rounded-xl overflow-hidden aspect-[4/3] flex items-center justify-center relative">
                {/* QLD satellite preview — replace with Mapbox static image using your token */}
                <div className="w-full h-full bg-gradient-to-br from-gray-800 via-green-900/30 to-gray-900 flex items-center justify-center">
                  <div className="text-center">
                    <MapPin className="w-12 h-12 text-brand-400/40 mx-auto" />
                    <p className="text-xs text-gray-500 mt-2">Queensland, Australia</p>
                  </div>
                </div>
                {/* Floating assessment card mockup */}
                <div className="absolute bottom-6 left-6 right-6 bg-white rounded-card shadow-assessment p-5">
                  <div className="flex items-center gap-2 mb-3">
                    <span className="badge-green">High Viability</span>
                    <span className="text-xs text-gray-500">2.3km from substation</span>
                  </div>
                  <div className="grid grid-cols-3 gap-4 text-center">
                    <div>
                      <div className="text-xl font-bold text-gray-900 font-mono">$87k</div>
                      <div className="text-xs text-gray-500">Annual lease</div>
                    </div>
                    <div>
                      <div className="text-xl font-bold text-brand-600 font-mono">42ML</div>
                      <div className="text-xs text-gray-500">Water saved</div>
                    </div>
                    <div>
                      <div className="text-xl font-bold text-solar-amber font-mono">21.3</div>
                      <div className="text-xs text-gray-500">MJ/m²/day</div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section id="how-it-works" className="py-24 bg-surface-light">
        <div className="max-w-7xl mx-auto px-6">
          <h2 className="text-2xl sm:text-display font-bold font-display text-center text-gray-900">
            How it works
          </h2>
          <p className="mt-4 text-center text-gray-500 max-w-2xl mx-auto">
            Three steps to discover your farm's solar potential
          </p>

          <div className="mt-16 grid md:grid-cols-3 gap-8">
            {[
              {
                icon: MapPin,
                step: '01',
                title: 'Drop a Pin',
                description: 'Search your address or click on the map. We instantly pull your property boundary, grid infrastructure, and constraint layers.',
              },
              {
                icon: BarChart3,
                step: '02',
                title: 'See Your Assessment',
                description: 'Get an instant estimate of solar lease income, water savings, shade premiums, and grid proximity score — all backed by government spatial data.',
              },
              {
                icon: Zap,
                step: '03',
                title: 'Connect with Developers',
                description: 'Register your interest and we connect you with vetted solar developers looking for agrivoltaic-ready land in your region.',
              },
            ].map(({ icon: Icon, step, title, description }) => (
              <div key={step} className="bg-white rounded-card shadow-card p-8 hover:shadow-card-hover transition-shadow">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-10 h-10 rounded-full bg-brand-100 flex items-center justify-center">
                    <Icon className="w-5 h-5 text-brand-600" />
                  </div>
                  <span className="text-xs font-mono text-brand-500 font-medium">{step}</span>
                </div>
                <h3 className="text-lg font-bold font-display text-gray-900">{title}</h3>
                <p className="mt-2 text-sm text-gray-500 leading-relaxed">{description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Benefits */}
      <section id="benefits" className="py-24 bg-white">
        <div className="max-w-7xl mx-auto px-6">
          <h2 className="text-2xl sm:text-display font-bold font-display text-center text-gray-900">
            Why agrivoltaics?
          </h2>

          <div className="mt-16 grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {[
              {
                icon: DollarSign,
                title: 'Guaranteed Income',
                value: '$1.5–2.5k/ha/yr',
                description: 'Drought-proof passive income from solar leases for 25 years, while keeping your land in production.',
              },
              {
                icon: Droplets,
                title: 'Water Savings',
                value: '30% less evaporation',
                description: 'Solar panels shade the soil, reducing evaporation and cutting your irrigation costs significantly.',
              },
              {
                icon: Sun,
                title: 'Shade Premium',
                value: 'Up to 2x crop yield',
                description: 'Australian sun is often too harsh. Panel shading can double yields for tomatoes and increase grape weight by 20%.',
              },
              {
                icon: Shield,
                title: 'Livestock Friendly',
                value: '100% grazing continues',
                description: 'Elevated panels allow sheep and cattle to graze underneath, reducing heat stress and improving animal welfare.',
              },
            ].map(({ icon: Icon, title, value, description }) => (
              <div key={title} className="text-center">
                <div className="w-14 h-14 rounded-full bg-brand-50 flex items-center justify-center mx-auto">
                  <Icon className="w-7 h-7 text-brand-600" />
                </div>
                <h3 className="mt-4 font-bold font-display text-gray-900">{title}</h3>
                <div className="mt-1 text-sm font-mono text-brand-600 font-medium">{value}</div>
                <p className="mt-2 text-sm text-gray-500 leading-relaxed">{description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Data Sources Trust Section */}
      <section className="py-16 bg-surface-light border-t border-gray-100">
        <div className="max-w-7xl mx-auto px-6 text-center">
          <p className="text-sm text-gray-500 mb-6">Powered by trusted Australian government data</p>
          <div className="flex flex-wrap items-center justify-center gap-x-12 gap-y-4 text-xs text-gray-400 font-medium">
            <span>Geoscience Australia</span>
            <span>QLD Spatial</span>
            <span>Bureau of Meteorology</span>
            <span>Ergon Energy</span>
            <span>Energex</span>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-24 bg-hero-bg">
        <div className="max-w-3xl mx-auto px-6 text-center">
          <h2 className="text-2xl sm:text-display font-bold font-display text-white">
            Ready to see what your land could earn?
          </h2>
          <p className="mt-4 text-lg text-hero-text/60">
            Free, instant assessment. No commitment required.
          </p>
          <Link to="/explore" className="btn-primary text-lg mt-8 gap-2">
            Check Your Land Now <ArrowRight className="w-5 h-5" />
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-950 text-gray-400 py-12">
        <div className="max-w-7xl mx-auto px-6">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-2">
              <AgriVoltLogo />
              <span className="text-sm font-bold text-white font-display">AgriVolt</span>
            </div>
            <p className="text-xs text-gray-500">
              Estimates are indicative only and based on publicly available government data.
              Not financial advice. Always consult a qualified professional.
            </p>
            <p className="text-xs text-gray-600">
              &copy; {new Date().getFullYear()} AgriVolt &middot; Queensland, Australia
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}

/** AgriVolt SVG logo — solar panel + leaf mark */
function AgriVoltLogo({ className = 'w-8 h-8' }: { className?: string }) {
  return (
    <svg
      className={className}
      viewBox="0 0 32 32"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-label="AgriVolt logo"
    >
      {/* Solar panel (tilted rectangle with grid lines) */}
      <rect x="6" y="8" width="20" height="14" rx="2" stroke="#4ade80" strokeWidth="1.5" transform="rotate(-5 16 15)" />
      <line x1="11" y1="8" x2="11" y2="22" stroke="#4ade80" strokeWidth="0.75" transform="rotate(-5 16 15)" />
      <line x1="16" y1="8" x2="16" y2="22" stroke="#4ade80" strokeWidth="0.75" transform="rotate(-5 16 15)" />
      <line x1="21" y1="8" x2="21" y2="22" stroke="#4ade80" strokeWidth="0.75" transform="rotate(-5 16 15)" />
      <line x1="6" y1="15" x2="26" y2="15" stroke="#4ade80" strokeWidth="0.75" transform="rotate(-5 16 15)" />
      {/* Leaf accent */}
      <path d="M24 20 Q28 16 26 12 Q22 14 24 20Z" fill="#4ade80" opacity="0.6" />
    </svg>
  );
}
