import { useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft, Send, CheckCircle2, Loader2 } from 'lucide-react';

export default function Contact() {
  const [form, setForm] = useState({
    name: '',
    email: '',
    type: 'farmer',
    message: '',
    honeypot: '', // bot trap
  });
  const [submitted, setSubmitted] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [mathAnswer, setMathAnswer] = useState('');
  const [mathChallenge] = useState(() => {
    const a = Math.floor(Math.random() * 10) + 1;
    const b = Math.floor(Math.random() * 10) + 1;
    return { a, b, answer: a + b };
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    setForm(f => ({ ...f, [e.target.name]: e.target.value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    // Honeypot check
    if (form.honeypot) return;

    // Math verification
    if (parseInt(mathAnswer) !== mathChallenge.answer) {
      setError('Please check your answer to the verification question.');
      return;
    }

    // Basic validation
    if (!form.name.trim() || !form.email.trim() || !form.message.trim()) {
      setError('Please fill in all required fields.');
      return;
    }

    setSubmitting(true);

    try {
      const res = await fetch('/api/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: form.name,
          email: form.email,
          type: form.type,
          message: form.message,
        }),
      });

      if (res.ok) {
        setSubmitted(true);
      } else {
        setError('Something went wrong. Please try again.');
      }
    } catch {
      setError('Unable to send message. Please try again later.');
    } finally {
      setSubmitting(false);
    }
  };

  if (submitted) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="max-w-md mx-auto px-6 text-center">
          <CheckCircle2 className="w-16 h-16 text-green-500 mx-auto mb-6" />
          <h1 className="text-2xl font-bold font-display text-gray-900 mb-3">Message sent</h1>
          <p className="text-gray-600 mb-8">
            Thanks {form.name}. We'll get back to you as soon as possible.
          </p>
          <Link to="/" className="btn-primary text-sm">
            Back to Home
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <div className="bg-hero-bg py-16">
        <div className="max-w-3xl mx-auto px-6">
          <Link to="/" className="inline-flex items-center gap-2 text-sm text-gray-400 hover:text-white transition-colors mb-8">
            <ArrowLeft className="w-4 h-4" /> Back to home
          </Link>
          <h1 className="text-3xl font-bold font-display text-white">Get in touch</h1>
          <p className="mt-3 text-hero-text/60">
            Whether you're a farmer interested in assessing your land, or a solar developer looking
            for sites, we'd like to hear from you.
          </p>
        </div>
      </div>

      {/* Form */}
      <div className="max-w-3xl mx-auto px-6 py-16">
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid sm:grid-cols-2 gap-6">
            <div>
              <label className="text-sm font-medium text-gray-700 block mb-2">Your name *</label>
              <input
                name="name"
                value={form.name}
                onChange={handleChange}
                required
                className="w-full h-11 px-4 rounded-lg bg-gray-50 border border-gray-200 text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-brand-400 focus:border-transparent"
                placeholder="John Smith"
              />
            </div>
            <div>
              <label className="text-sm font-medium text-gray-700 block mb-2">Email address *</label>
              <input
                name="email"
                type="email"
                value={form.email}
                onChange={handleChange}
                required
                className="w-full h-11 px-4 rounded-lg bg-gray-50 border border-gray-200 text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-brand-400 focus:border-transparent"
                placeholder="you@example.com"
              />
            </div>
          </div>

          <div>
            <label className="text-sm font-medium text-gray-700 block mb-2">I am a...</label>
            <select
              name="type"
              value={form.type}
              onChange={handleChange}
              className="w-full h-11 px-4 rounded-lg bg-gray-50 border border-gray-200 text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-brand-400 focus:border-transparent"
            >
              <option value="farmer">Farmer / Landholder</option>
              <option value="developer">Solar Developer</option>
              <option value="investor">Investor / Funder</option>
              <option value="researcher">Researcher / Academic</option>
              <option value="government">Government / Policy</option>
              <option value="other">Other</option>
            </select>
          </div>

          <div>
            <label className="text-sm font-medium text-gray-700 block mb-2">Message *</label>
            <textarea
              name="message"
              value={form.message}
              onChange={handleChange}
              required
              rows={5}
              className="w-full px-4 py-3 rounded-lg bg-gray-50 border border-gray-200 text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-brand-400 focus:border-transparent resize-none"
              placeholder="Tell us about your property, your project, or how we can help..."
            />
          </div>

          {/* Honeypot - hidden from real users */}
          <input
            name="honeypot"
            value={form.honeypot}
            onChange={handleChange}
            tabIndex={-1}
            autoComplete="off"
            style={{ position: 'absolute', left: '-9999px', opacity: 0 }}
          />

          {/* Math verification */}
          <div className="bg-gray-50 rounded-lg border border-gray-200 p-4">
            <label className="text-sm font-medium text-gray-700 block mb-2">
              Verification: What is {mathChallenge.a} + {mathChallenge.b}? *
            </label>
            <input
              type="number"
              value={mathAnswer}
              onChange={e => setMathAnswer(e.target.value)}
              required
              className="w-24 h-11 px-4 rounded-lg bg-white border border-gray-200 text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-brand-400 focus:border-transparent"
              placeholder="?"
            />
          </div>

          {error && (
            <div className="p-4 bg-red-50 border border-red-200 rounded-lg text-sm text-red-700">
              {error}
            </div>
          )}

          <button
            type="submit"
            disabled={submitting}
            className="btn-primary text-sm flex items-center gap-2 disabled:opacity-50"
          >
            {submitting ? (
              <><Loader2 className="w-4 h-4 animate-spin" /> Sending...</>
            ) : (
              <><Send className="w-4 h-4" /> Send Message</>
            )}
          </button>

          <p className="text-xs text-gray-400">
            Your information will be handled in accordance with our{' '}
            <Link to="/privacy" className="text-brand-600 underline">Privacy Policy</Link>.
            We will not share your details with third parties without your consent.
          </p>
        </form>
      </div>
    </div>
  );
}
