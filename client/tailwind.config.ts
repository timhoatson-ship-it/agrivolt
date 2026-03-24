import type { Config } from 'tailwindcss';

export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        // AgriVolt brand palette — inspired by Searchland's dark-green premium aesthetic
        brand: {
          50: '#f0fdf4',
          100: '#dcfce7',
          200: '#bbf7d0',
          300: '#86efac',
          400: '#4ade80', // Primary CTA green
          500: '#22c55e',
          600: '#16a34a',
          700: '#15803d',
          800: '#166534',
          900: '#14532d',
          950: '#052e16',
        },
        solar: {
          gold: '#fbbf24',   // Solar/energy accent
          amber: '#f59e0b',
        },
        hero: {
          bg: '#0F1A14',     // Dark forest green hero background
          shape: '#1A3028',  // Geometric shapes on hero
          text: '#e2e8f0',   // Light text on dark backgrounds
        },
        surface: {
          light: '#F0FBF0',  // Pale sage for feature sections
          white: '#FFFFFF',
          muted: '#f8fafc',
        },
        // Grid proximity scoring
        grid: {
          green: '#22c55e',
          amber: '#f59e0b',
          red: '#ef4444',
          grey: '#9ca3af',
        },
      },
      fontFamily: {
        display: ['General Sans', 'system-ui', 'sans-serif'],
        body: ['General Sans', 'system-ui', 'sans-serif'],
        mono: ['JetBrains Mono', 'monospace'],
      },
      fontSize: {
        'hero': ['4.5rem', { lineHeight: '1.1', letterSpacing: '-0.02em' }],
        'display': ['3rem', { lineHeight: '1.15', letterSpacing: '-0.02em' }],
      },
      borderRadius: {
        'card': '12px',
      },
      boxShadow: {
        'card': '0 1px 3px 0 rgba(0,0,0,0.1), 0 1px 2px -1px rgba(0,0,0,0.1)',
        'card-hover': '0 10px 15px -3px rgba(0,0,0,0.1), 0 4px 6px -4px rgba(0,0,0,0.1)',
        'assessment': '0 20px 25px -5px rgba(0,0,0,0.1), 0 8px 10px -6px rgba(0,0,0,0.1)',
      },
    },
  },
  plugins: [],
} satisfies Config;
