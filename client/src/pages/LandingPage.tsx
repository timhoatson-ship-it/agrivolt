import { Link } from 'react-router-dom';
import { MapPin, Sun, Droplets, DollarSign, ArrowRight, Zap, Shield, BarChart3 } from 'lucide-react';

export default function LandingPage() {
  return (
    <div className="min-h-screen">
      {/* Navigation */}
      <nav className="absolute top-0 left-0 right-0 z-20 px-6 py-4">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-2">
            <AgriVoltLogo />
            <span className="text-xl font-bold text-white font-display">AgriVolt</span>
          </div>
          <div className="flex items-center gap-4">
            <button onClick={() => document.getElementById('how-it-works')?.scrollIntoView({ behavior: 'smooth' })} className="text-hero-text/70 hover:text-white text-sm font-medium transition-colors hidden sm:inline">
              How It Works
            </button>
            <button onClick={() => document.getElementById('benefits')?.scrollIntoView({ behavior: 'smooth' })} className="text-hero-text/70 hover:text-white text-sm font-medium transition-colors hidden sm:inline">
              Benefits
            </button>
            <Link to="/dashboard" className="text-hero-text/70 hover:text-white text-sm font-medium transition-colors hidden sm:inline">
              Developers
            </Link>
            <button onClick={() => document.getElementById('know-your-rights')?.scrollIntoView({ behavior: 'smooth' })} className="text-hero-text/70 hover:text-white text-sm font-medium transition-colors hidden lg:inline">
              Your Rights
            </button>
            <button onClick={() => document.getElementById('about')?.scrollIntoView({ behavior: 'smooth' })} className="text-hero-text/70 hover:text-white text-sm font-medium transition-colors hidden sm:inline">
              About
            </button>
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
              AgriVolt connects Australian farmers with solar developers.
              Discover your property's agrivoltaic potential — guaranteed passive income,
              water savings, and shade premiums.
            </p>
            <div className="mt-10 flex flex-wrap gap-4">
              <Link to="/explore" className="btn-primary text-base gap-2">
                Check Your Land <ArrowRight className="w-4 h-4" />
              </Link>
              <button onClick={() => document.getElementById('how-it-works')?.scrollIntoView({ behavior: 'smooth' })} className="btn-secondary !bg-transparent !text-white !border-white/20 hover:!border-white/40 text-base">
                Learn More
              </button>
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
                <img src="/images/hero_map_pin.jpg" alt="Aerial view of Australian farmland with location pin" className="w-full h-full object-cover" />
                {/* Floating assessment card mockup */}
                <div className="absolute bottom-6 left-6 right-6 bg-white rounded-xl shadow-2xl p-5 border border-gray-100">
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
              <div key={step} className="bg-white rounded-xl shadow-sm border border-gray-200 p-8 hover:shadow-md transition-all">
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
                <div className="w-16 h-16 rounded-2xl bg-brand-50 flex items-center justify-center mx-auto">
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

      {/* What is Agrivoltaics - Educational */}
      <section id="what-is-agrivoltaics" className="py-24 bg-hero-bg">
        <div className="max-w-7xl mx-auto px-6">
          <h2 className="text-2xl sm:text-display font-bold font-display text-white text-center">
            What is agrivoltaics?
          </h2>
          <p className="mt-4 text-center text-hero-text/60 max-w-3xl mx-auto">
            Agrivoltaics — also called agrisolar — is the practice of co-locating solar energy production
            with agricultural activity on the same land. Elevated solar panels allow farming to continue
            underneath while generating clean energy above.
          </p>

          <div className="mt-16 grid md:grid-cols-2 gap-12 items-start">
            <div>
              <img src="/images/agrivolt_sheep_grazing.jpg" alt="Merino sheep grazing under elevated solar panels on Australian farmland" className="w-full h-56 object-cover rounded-xl mb-6 shadow-lg" />
              <h3 className="text-lg font-bold font-display text-white mb-4">For graziers</h3>
              <p className="text-sm text-hero-text/70 leading-relaxed mb-4">
                Sheep and cattle graze freely beneath elevated solar panels. The shade reduces heat
                stress, improves pasture quality, and concentrates rainfall runoff into semi-irrigated
                strips — extending green feed availability during dry periods.
              </p>
              <p className="text-sm text-hero-text/70 leading-relaxed mb-4">
                According to the <a href="https://www.energyco.nsw.gov.au/agrivoltaics-handbook" target="_blank" rel="noopener noreferrer" className="text-brand-400 underline">Agrivoltaics Handbook</a> (Dec 2025),
                one Dubbo grazier reports carrying 25% more sheep overall under panels, with improved
                wool quality and quantity attributed to protection from heat, dust, and airborne contaminants.
              </p>
              <p className="text-xs text-hero-text/40 italic">
                Source: Agrivoltaics Handbook, Progressive Agriculture &amp; Farm Renewables Consulting, funded by NSW Government / EnergyCo (2025)
              </p>
            </div>
            <div>
              <img src="/images/agrivolt_crops_under_solar.jpg" alt="Vegetable crops growing under solar panels with drip irrigation" className="w-full h-56 object-cover rounded-xl mb-6 shadow-lg" />
              <h3 className="text-lg font-bold font-display text-white mb-4">For croppers &amp; horticulture</h3>
              <p className="text-sm text-hero-text/70 leading-relaxed mb-4">
                International research shows enhanced crop yields for shade-tolerant produce including
                berries, leafy greens, asparagus, and garlic. Panel shading can reduce irrigation
                requirements by up to 20% in arid regions, while protecting crops from frost and hail damage.
              </p>
              <p className="text-sm text-hero-text/70 leading-relaxed mb-4">
                In Australia, early trials show promise for vineyards and certain vegetables, though
                research tailored to Australian conditions is still developing. The key benefit for many
                Australian farmers is the drought-proof secondary income from solar lease payments.
              </p>
              <p className="text-xs text-hero-text/40 italic">
                Sources: Elamri et al., Agricultural Water Management (2018); SPE AgriSolar Best Practice Guide
              </p>
            </div>
          </div>

          {/* Key numbers */}
          <div className="mt-16 grid grid-cols-2 md:grid-cols-4 gap-6">
            {[
              { value: '$1.4B→$6.9B', label: 'Australian agrivoltaics market growth by 2031', source: 'Industry projections (30.5% CAGR)' },
              { value: '25%', label: 'More sheep carried under panels vs open paddock', source: 'Agrivoltaics Handbook case study' },
              { value: '20%', label: 'Reduction in irrigation water under panels', source: 'Elamri et al. (2018)' },
              { value: '$100–$250', label: 'Per hectare slashing cost avoided by grazing', source: 'Agrivoltaics Handbook (2025 estimates)' },
            ].map(({ value, label, source }) => (
              <div key={label} className="bg-gray-900/60 rounded-xl p-5 border border-gray-700/50 shadow-lg">
                <div className="text-xl font-bold text-brand-400 font-display">{value}</div>
                <div className="text-xs text-hero-text/50 mt-1">{label}</div>
                <div className="text-[10px] text-hero-text/30 mt-2 italic">{source}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Resources */}
      <section className="py-16 bg-surface-light">
        <div className="max-w-7xl mx-auto px-6">
          <h2 className="text-2xl sm:text-display font-bold font-display text-center text-gray-900">
            Resources &amp; references
          </h2>
          <p className="mt-4 text-center text-gray-500 max-w-2xl mx-auto">
            AgriVolt is built on publicly available Australian government data and peer-reviewed research.
          </p>

          <div className="mt-12 grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[
              {
                title: 'Agrivoltaics Handbook',
                org: 'Progressive Agriculture & Farm Renewables Consulting',
                description: 'The first comprehensive Australian guide to planning, designing, and implementing agrivoltaics projects. Covers sheep grazing, horticulture, cattle, and business models.',
                url: 'https://www.energyco.nsw.gov.au/agrivoltaics-handbook',
                year: '2025',
              },
              {
                title: 'Renewable Energy Landholder Guide',
                org: 'NSW Farmers & EnergyCo',
                description: 'Comprehensive guide for landholders considering hosting renewable energy projects. Covers agreements, rights, negotiations, and checklists.',
                url: 'https://www.nswfarmers.org.au/NSWFA/Posts/Energy-Transmission/NSW-Renewable-Energy-Landholder-Guide.aspx',
                year: '2025',
              },
              {
                title: 'National Electricity Infrastructure',
                org: 'Geoscience Australia',
                description: 'Transmission substations, power stations, and high-voltage transmission lines across Australia. Updated regularly.',
                url: 'https://services.ga.gov.au/gis/rest/services/National_Electricity_Infrastructure/MapServer',
                year: 'Ongoing',
              },
              {
                title: 'Solar Exposure Data',
                org: 'Bureau of Meteorology',
                description: 'Daily and monthly solar exposure grids for all of Australia at 5km resolution, derived from satellite imagery since 1990.',
                url: 'https://www.bom.gov.au/climate/austmaps/about-solar-maps.shtml',
                year: 'Ongoing',
              },
              {
                title: 'Strategic Cropping Land',
                org: 'QLD Department of Resources',
                description: 'Mapping of land highly suitable for cropping, regulated under the Regional Planning Interests Act 2014.',
                url: 'https://www.data.qld.gov.au/dataset/strategic-cropping-land-series',
                year: '2025',
              },
              {
                title: 'Distribution Annual Planning Reports',
                org: 'Energy Queensland (Ergon & Energex)',
                description: 'Network capacity forecasts, constrained substations, and 5-year load projections for the QLD distribution network.',
                url: 'https://www.ergon.com.au/network/about-us/company-reports,-plans-and-charters/distribution-annual-planning-report',
                year: '2025',
              },
              {
                title: 'Floodplain Assessment Overlay',
                org: 'QLD Government',
                description: 'Statewide mapping of potential floodplain areas to help identify flood risk for property assessment.',
                url: 'https://www.data.qld.gov.au/dataset/queensland-floodplain-assessment-overlay',
                year: '2024',
              },
            ].map(({ title, org, description, url, year }) => (
              <a
                key={title}
                href={url}
                target="_blank"
                rel="noopener noreferrer"
                className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 hover:shadow-md transition-all block"
              >
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-mono text-brand-600">{year}</span>
                  <ArrowRight className="w-3.5 h-3.5 text-gray-400" />
                </div>
                <h3 className="text-sm font-bold font-display text-gray-900">{title}</h3>
                <p className="text-xs text-gray-500 mt-0.5">{org}</p>
                <p className="text-xs text-gray-400 mt-2 leading-relaxed">{description}</p>
              </a>
            ))}
          </div>
        </div>
      </section>

      {/* About */}
      <section id="about" className="py-24 bg-white border-t border-gray-100">
        <div className="max-w-3xl mx-auto px-6 text-center">
          <h2 className="text-2xl sm:text-display font-bold font-display text-gray-900">
            About AgriVolt
          </h2>
          <p className="mt-6 text-gray-600 leading-relaxed">
            AgriVolt was built by <a href="https://agentika.com.au" target="_blank" rel="noopener noreferrer" className="text-brand-600 font-medium underline">Agentika</a> to
            solve the #1 bottleneck in Australia's renewable energy transition: connecting farmers
            with solar developers. The platform uses publicly available government spatial data to
            give landholders a free, instant assessment of their property's agrivoltaic potential —
            and connects them with vetted solar developers looking for land.
          </p>
          <p className="mt-4 text-gray-600 leading-relaxed">
            All data is sourced from Geoscience Australia, the Bureau of Meteorology, QLD Spatial
            Services, and Energy Queensland's Distribution Annual Planning Reports. Estimates are
            indicative only and should not be relied upon as financial advice.
          </p>
          <Link to="/contact" className="inline-flex items-center gap-2 mt-4 text-sm text-brand-600 font-medium hover:text-brand-700 transition-colors">
            Get in touch <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </section>

      {/* Know Your Rights */}
      <section id="know-your-rights" className="py-24 bg-surface-light border-t border-gray-100">
        <div className="max-w-7xl mx-auto px-6">
          <h2 className="text-2xl sm:text-display font-bold font-display text-center text-gray-900">
            Know your rights as a landholder
          </h2>
          <p className="mt-4 text-center text-gray-500 max-w-2xl mx-auto">
            If a solar developer approaches you, it's important to understand your position.
            These rights apply whether you're in QLD, NSW, or Victoria.
          </p>

          <div className="mt-12 grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[
              {
                title: 'You can say no',
                description: 'You are not required to sign an agreement with a renewable energy developer. The decision to host infrastructure on your land is voluntary and at your discretion.',
              },
              {
                title: 'No obligation to rush',
                description: 'There are no legal requirements for you to meet certain timelines. Take the time you need to seek independent advice before signing anything.',
              },
              {
                title: 'No access without agreement',
                description: 'A developer cannot undertake any activities on your land without your written agreement. This includes surveys, soil testing, and feasibility studies.',
              },
              {
                title: 'Get independent advice',
                description: 'Ensure your legal advisor has experience in renewable energy contracts. The developer\'s agreements are prepared for the developer, not for you.',
              },
              {
                title: 'Understand confidentiality clauses',
                description: 'Some agreements include confidentiality provisions. Ensure these don\'t prevent you from discussing the project with your family, neighbours, or financial advisors.',
              },
              {
                title: 'Plan for decommissioning',
                description: 'A typical solar lease runs 25-30 years. Ensure your agreement covers who is responsible for removing infrastructure and restoring the land at the end of the term.',
              },
            ].map(({ title, description }) => (
              <div key={title} className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                <div className="flex items-center gap-2 mb-3">
                  <Shield className="w-5 h-5 text-brand-600 shrink-0" />
                  <h3 className="text-sm font-bold font-display text-gray-900">{title}</h3>
                </div>
                <p className="text-xs text-gray-500 leading-relaxed">{description}</p>
              </div>
            ))}
          </div>

          <p className="mt-8 text-xs text-gray-400 text-center max-w-2xl mx-auto">
            Informed by the{' '}
            <a href="https://www.nswfarmers.org.au/NSWFA/Posts/Energy-Transmission/NSW-Renewable-Energy-Landholder-Guide.aspx" target="_blank" rel="noopener noreferrer" className="text-brand-600 underline">
              NSW Renewable Energy and Transmission Landholder Guide
            </a>{' '}
            (2025, NSW Farmers / EnergyCo) and the{' '}
            <a href="https://www.energyco.nsw.gov.au/agrivoltaics-handbook" target="_blank" rel="noopener noreferrer" className="text-brand-600 underline">
              Agrivoltaics Handbook
            </a>{' '}
            (2025, Progressive Agriculture / Farm Renewables Consulting).
            This is general information only — seek independent legal and financial advice for your situation.
          </p>
        </div>
      </section>

      {/* Questions to Ask */}
      <section className="py-24 bg-white">
        <div className="max-w-7xl mx-auto px-6">
          <h2 className="text-2xl sm:text-display font-bold font-display text-center text-gray-900">
            Questions to ask a solar developer
          </h2>
          <p className="mt-4 text-center text-gray-500 max-w-2xl mx-auto">
            Before signing any agreement, use this checklist to evaluate who you're working with.
          </p>

          <div className="mt-12 max-w-3xl mx-auto space-y-3">
            {[
              'Can you find details of the company, directors and ABN via an ASIC search?',
              'Does the company have a publicly available annual report and a corporate website listing similar projects?',
              'Does the company have experience in agrivoltaics (co-locating agriculture with solar)?',
              'Will you have a dedicated point of contact throughout the project?',
              'Will they contribute to the cost of your independent legal and financial advice?',
              'Have they explained the potential benefits AND impacts for you, your neighbours, and your community?',
              'Do they have a community benefit sharing model?',
              'Can they take you to visit a similar project that is already operational?',
              'Can the developer transfer the agreement to another company without your consent?',
              'What happens to the land and infrastructure at the end of the lease term?',
            ].map((question, i) => (
              <div key={i} className="flex items-start gap-3 p-4 bg-gray-50 rounded-lg border border-gray-200">
                <div className="w-6 h-6 rounded-full bg-brand-100 flex items-center justify-center shrink-0 mt-0.5">
                  <span className="text-xs font-bold text-brand-700">{i + 1}</span>
                </div>
                <p className="text-sm text-gray-700 leading-relaxed">{question}</p>
              </div>
            ))}
          </div>

          <p className="mt-8 text-xs text-gray-400 text-center max-w-2xl mx-auto">
            Adapted from the landholder checklists in the{' '}
            <a href="https://www.nswfarmers.org.au/NSWFA/Posts/Energy-Transmission/NSW-Renewable-Energy-Landholder-Guide.aspx" target="_blank" rel="noopener noreferrer" className="text-brand-600 underline">
              NSW Renewable Energy and Transmission Landholder Guide
            </a>{' '}
            (2025, NSW Farmers / EnergyCo). Not legal advice — consult a qualified professional.
          </p>
        </div>
      </section>

      {/* Data Sources Trust Section */}
      <section className="py-12 bg-surface-light border-t border-gray-100">
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
      <section className="py-24 bg-hero-bg relative overflow-hidden">
        <img src="/images/agrivolt_aerial_solar_farm.jpg" alt="" className="absolute inset-0 w-full h-full object-cover opacity-15" />
        <div className="absolute inset-0 bg-gradient-to-t from-[#0F2027] via-[#0F2027]/80 to-[#0F2027]/60" />
        <div className="max-w-3xl mx-auto px-6 text-center relative z-10">
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
            <div className="flex items-center gap-4 text-xs text-gray-600">
              <Link to="/explore" className="hover:text-gray-400">Map Explorer</Link>
              <Link to="/dashboard" className="hover:text-gray-400">Developers</Link>
              <Link to="/privacy" className="hover:text-gray-400">Privacy Policy</Link>
            </div>
            <p className="text-xs text-gray-500">
              Estimates are indicative only and based on publicly available government data.
              Not financial advice. Always consult a qualified professional.
            </p>
            <p className="text-xs text-gray-600">
              &copy; {new Date().getFullYear()} AgriVolt &middot; Agentika &middot; Australia
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
