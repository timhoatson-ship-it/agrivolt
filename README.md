# AgriVolt 🌾⚡

**Queensland Agrivoltaics Marketplace** — Connecting farmers with solar developers through spatial intelligence.

🌐 **Live:** [agrivolt-navy.vercel.app](https://agrivolt-navy.vercel.app)

## What is AgriVolt?

AgriVolt is a two-sided marketplace that helps Queensland farmers discover the agrivoltaic potential of their land and connects them with solar energy developers.

**For Farmers:**
- Drop a pin on your property to get an instant site assessment
- See estimated solar lease income, water savings, and shade premiums
- All calculations powered by Australian government open spatial data
- Register your interest directly through the platform

**For Solar Developers:**
- Access an anonymized map of pre-willing farmers (locations randomized ±2km for privacy)
- Filter properties by size, grid proximity rating, and distance to infrastructure
- View clustered property markers with grid viability colour-coding
- Unlock individual sites to see exact addresses and farmer contact details

## Features

### Map Explorer (`/explore`)
- Interactive Mapbox GL map centred on Queensland
- Three government data layers: Transmission Substations, Transmission Lines, Strategic Cropping Land
- Click anywhere for instant site assessment (grid distance, solar exposure, land suitability)
- Address search via Mapbox Geocoding API
- Collapsible sidebar with layer controls and grid proximity legend
- Mobile-responsive with toggleable sidebar

### Developer Dashboard (`/dashboard`)
- Anonymized property listings with clustered map markers
- Filter by max grid distance, minimum hectares, and grid proximity rating
- Property cards with grid viability indicators (green/amber/red)
- "Unlock Site" gating for farmer privacy
- Mobile-responsive with collapsible filter sidebar

### Landing Page
- Responsive hero section with animated assessment card mockup
- Key market statistics ($6.9B, 30% water savings, 25yr lease)
- Farmer registration modal with form validation
- How It Works and Benefits sections

### Technical Features
- **Code splitting**: Map Explorer and Developer Dashboard are lazy-loaded (~40% smaller initial bundle)
- **Error boundaries**: Graceful error recovery with user-friendly fallback UI
- **Loading states**: Skeleton loaders and spinners during data fetches
- **Rate limiting**: 60 requests/minute per IP on API endpoints
- **Input sanitization**: HTML tag stripping on all user inputs
- **Farmer anonymity**: Coordinates randomized ±2km, generalized land-use labels

## Architecture

```
┌──────────────────┐     ┌──────────────────┐     ┌─────────────┐
│   Vercel (CDN)   │────▶│  Railway (API)   │────▶│ PostgreSQL  │
│  React + Vite    │     │  Express + TS    │     │  (Railway)  │
│  Mapbox GL JS    │     │                  │     │             │
│  Turf.js         │     │  /api/farmers    │     │ 16 farmers  │
│  Tailwind CSS    │     │  /api/properties │     │ (15 demo)   │
└──────────────────┘     └──────────────────┘     └─────────────┘
         │
         ▼
┌──────────────────────────────────────┐
│  Government Spatial Data APIs        │
│  • Geoscience Australia (grid infra) │
│  • QLD Spatial (cadastral, SCL)      │
│  • Bureau of Meteorology (solar)     │
└──────────────────────────────────────┘
```

## Getting Started

### Prerequisites
- Node.js 20+
- A [Mapbox](https://mapbox.com) account (free tier: 50k map loads/month)

### Development

```bash
# Client (React frontend)
cd client
npm install
cp .env.example .env  # Add your VITE_MAPBOX_TOKEN
npm run dev            # → http://localhost:5173

# Server (Express API)
cd server
npm install
npm run dev            # → http://localhost:3001
```

### Environment Variables

**Client (.env):**
```
VITE_MAPBOX_TOKEN=your_mapbox_token_here
VITE_API_URL=/api
```

**Server (.env):**
```
PORT=3001
CORS_ORIGIN=http://localhost:5173
DATABASE_URL=postgresql://postgres:dev@localhost:5432/agrivolt
```

## Data Sources

| Data | Source | Status |
|------|--------|--------|
| Property Boundaries | QLD Spatial (ArcGIS REST + WMS) | ✅ Free |
| Transmission Lines & Substations | Geoscience Australia MapServer | ✅ Free |
| Strategic Cropping Land | QLD Data Portal (ArcGIS REST) | ✅ Free |
| Solar Exposure | Bureau of Meteorology | ✅ Free |
| Grid Hosting Capacity | Ergon/Energex DAPR/TAPR | 🟡 Manual |
| High-Res Solar Irradiance | Solargis / Meteonorm | 💰 Paid (Phase 2) |
| Aerial Imagery + AI | Nearmap | 💰 Paid (Phase 3) |

## Deployment

**Frontend → Vercel** (auto-deploy from GitHub `main` branch)
- Root directory: `client`
- Build command: `npm run build`
- Output: `dist`
- Environment: `VITE_MAPBOX_TOKEN`, `VITE_API_URL=/api`

**Backend → Railway** (auto-deploy from GitHub `main` branch)
- Root directory: `server`
- Build command: `npm run build`
- Start command: `node dist/index.js`
- Environment: `DATABASE_URL` (linked from Railway Postgres addon), `CORS_ORIGIN`

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | React 18, TypeScript, Vite, Tailwind CSS |
| Mapping | Mapbox GL JS, Turf.js (centroid-to-point) |
| Backend | Express.js, TypeScript |
| Database | PostgreSQL (Railway) |
| Hosting | Vercel (frontend), Railway (API + DB) |
| Data APIs | Geoscience Australia, QLD Spatial, BoM |

## License

MIT

---

Built in Queensland 🇦🇺 for Queensland farmers.
