import { Link } from 'react-router-dom';

export default function PrivacyPolicy() {
  return (
    <div className="min-h-screen bg-white">
      <div className="max-w-3xl mx-auto px-6 py-12">
        <Link to="/" className="text-sm text-brand-600 hover:text-brand-700 mb-8 inline-block">
          &larr; Back to AgriVolt
        </Link>

        <h1 className="text-3xl font-bold text-gray-900 mb-2">Privacy Policy</h1>
        <p className="text-sm text-gray-500 mb-8">Last updated: March 2026</p>

        <div className="prose prose-sm prose-gray max-w-none space-y-6">
          <p className="text-gray-700 leading-relaxed">
            AgriVolt (&quot;we&quot;, &quot;us&quot;, &quot;our&quot;) is committed to protecting your personal information
            in accordance with the Australian Privacy Principles (APPs) under the <em>Privacy Act 1988</em> (Cth).
            This policy explains how we collect, use, store, and disclose your information.
          </p>

          <section>
            <h2 className="text-xl font-semibold text-gray-900 mt-8 mb-3">What We Collect</h2>
            <p className="text-gray-700 leading-relaxed">When you register interest through AgriVolt, we collect:</p>
            <ul className="list-disc pl-6 text-gray-700 space-y-1">
              <li>Your name, email address, and phone number</li>
              <li>Property address and approximate coordinates</li>
              <li>Property size (hectares) and current land use</li>
              <li>Your level of interest in solar leasing</li>
              <li>Any optional notes you provide</li>
              <li>Assessment data generated for your location (solar exposure, grid proximity, lease estimates)</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-gray-900 mt-8 mb-3">Why We Collect It</h2>
            <p className="text-gray-700 leading-relaxed">We collect your information to:</p>
            <ul className="list-disc pl-6 text-gray-700 space-y-1">
              <li>Connect you with solar developers who may be interested in leasing your land</li>
              <li>Provide you with accurate solar lease estimates based on your location</li>
              <li>Communicate with you about solar opportunities relevant to your property</li>
              <li>Improve our assessment algorithms and service quality</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-gray-900 mt-8 mb-3">How We Store It</h2>
            <p className="text-gray-700 leading-relaxed">
              Your data is stored securely in a PostgreSQL database hosted on Railway (Australia-accessible servers)
              with encrypted connections. Access to the database is restricted to authorized AgriVolt personnel only.
              We use industry-standard security practices including HTTPS encryption for all data in transit,
              parameterized queries to prevent SQL injection, and input sanitization on all user-submitted data.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-gray-900 mt-8 mb-3">Who Sees Your Information</h2>
            <p className="text-gray-700 leading-relaxed">
              <strong>Solar developers</strong> who use our platform can see anonymized property listings.
              These listings include your property size, land use type, general region, and grid proximity rating.
              Crucially, your <strong>exact location is anonymized</strong> with a random offset of approximately
              &plusmn;2km, and your name, email, phone number, and exact address are never shown to developers
              until you explicitly agree to connect with them.
            </p>
            <p className="text-gray-700 leading-relaxed mt-2">
              We do not sell your personal information to third parties. We do not share your data with
              marketing companies or advertisers.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-gray-900 mt-8 mb-3">Data Sources</h2>
            <p className="text-gray-700 leading-relaxed">
              Our land assessments use publicly available government open data, including:
            </p>
            <ul className="list-disc pl-6 text-gray-700 space-y-1">
              <li>Geoscience Australia &mdash; electricity infrastructure (substations, transmission lines, power stations)</li>
              <li>Bureau of Meteorology (via Open-Meteo) &mdash; solar radiation and evapotranspiration data</li>
              <li>Queensland Spatial Services &mdash; Strategic Cropping Land, flood zones, cadastral boundaries</li>
            </ul>
            <p className="text-gray-700 leading-relaxed mt-2">
              All assessment estimates are indicative only and based on publicly available data.
              They do not constitute financial advice.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-gray-900 mt-8 mb-3">Your Rights</h2>
            <p className="text-gray-700 leading-relaxed">Under the Australian Privacy Principles, you have the right to:</p>
            <ul className="list-disc pl-6 text-gray-700 space-y-1">
              <li><strong>Access</strong> &mdash; Request a copy of the personal information we hold about you</li>
              <li><strong>Correction</strong> &mdash; Ask us to correct any inaccurate or outdated information</li>
              <li><strong>Deletion</strong> &mdash; Request that we delete all your personal data from our systems</li>
            </ul>
            <p className="text-gray-700 leading-relaxed mt-2">
              To exercise any of these rights, contact us via the contact form on our website.
              We will respond to your request within 30 days.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-gray-900 mt-8 mb-3">Security</h2>
            <p className="text-gray-700 leading-relaxed">
              We take reasonable steps to protect your personal information from misuse, interference,
              loss, and unauthorized access, modification, or disclosure. Our security measures include:
            </p>
            <ul className="list-disc pl-6 text-gray-700 space-y-1">
              <li>HTTPS encryption for all data in transit</li>
              <li>Encrypted database connections</li>
              <li>Rate limiting on API endpoints</li>
              <li>Input sanitization and validation on all form submissions</li>
              <li>Restricted database access with role-based permissions</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-gray-900 mt-8 mb-3">Contact</h2>
            <p className="text-gray-700 leading-relaxed">
              If you have questions about this privacy policy, wish to exercise your rights,
              or want to make a complaint about how we handle your personal information, please
              contact us via the <Link to="/contact" className="text-brand-600 hover:text-brand-700 underline">contact form on our website</Link>.
            </p>
            <p className="text-gray-700 mt-2">
              <strong>Agentika</strong><br />
              <a href="https://agentika.com.au" target="_blank" rel="noopener noreferrer" className="text-brand-600 hover:text-brand-700 underline">
                agentika.com.au
              </a>
            </p>
          </section>
        </div>
      </div>
    </div>
  );
}
