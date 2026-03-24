# AgriVolt 🌾⚡

**Queensland Agrivoltaics Marketplace** — Connecting farmers with solar developers through spatial intelligence.

## What is AgriVolt?

AgriVolt is a two-sided marketplace that helps Queensland farmers discover the agrivoltaic potential of their land and connects them with solar energy developers.

**For Farmers:**
- Drop a pin on your property
- Instantly see estimated solar lease income, water savings, and shade premiums
- All calculations powered by Australian government open spatial data

**For Solar Developers:**
- Access an anonymized heatmap of pre-willing farmers (locations randomized ±2km)
- Filter by property size, solar exposure, grid distance, and planning constraints
- Unlock individual sites to see exact addresses and farmer contact details

## Architecture

```
┌──────────────────┐     ┌──────────────────┐
│   Vercel (CDN)   │────▶│  Railway (API)   │
│  React + Vite    │     │  Express + PG     │
│  Mapbox GL JS    │     │                  │
│  Turf.js         │     │  /api/farmers    │
│  Tailwind CSS    │     │  /api/properties │
└──────────────────┘     └──────────────────┘
         │
         ▼
┌──────────────────────────────────────┐
│  Government Spatial Data APIs        │
│  • Geoscience Australia (grid infra) │
│  • QLD Spatial (cadastral, SCL)      │
│  • Bureau of Meteorology (solar)     │
│  • Ergon/Energex (grid capacity)     │
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

**Frontend → Vercel** (auto-deploy from GitHub)
- Root directory: `client`
- Build command: `npm run build`
- Output: `dist`

**Backend → Railway** (auto-deploy from GitHub)
- Root directory: `server`
- Build command: `npm run build`
- Start command: `node dist/index.js`

## License

MIT

---

Built in Queensland 🇦🇺 for Queensland farmers.
