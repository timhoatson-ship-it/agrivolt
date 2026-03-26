import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import farmersRouter from './routes/farmers.js';

const app = express();
const PORT = parseInt(process.env.PORT || '3001', 10);
// In production, Railway should set CORS_ORIGIN=https://agrivolt-navy.vercel.app (no wildcard)
const CORS_ORIGIN = process.env.CORS_ORIGIN || 'http://localhost:5173';

// Simple in-memory rate limiter
const rateLimitMap = new Map<string, { count: number; resetAt: number }>();
const RATE_LIMIT = 60; // requests per window
const RATE_WINDOW = 60_000; // 1 minute

function rateLimit(req: express.Request, res: express.Response, next: express.NextFunction) {
  const ip = req.ip || req.socket.remoteAddress || 'unknown';
  const now = Date.now();
  const entry = rateLimitMap.get(ip);
  
  if (!entry || now > entry.resetAt) {
    rateLimitMap.set(ip, { count: 1, resetAt: now + RATE_WINDOW });
    return next();
  }
  
  if (entry.count >= RATE_LIMIT) {
    res.status(429).json({ success: false, error: 'Too many requests. Please try again later.' });
    return;
  }
  
  entry.count++;
  next();
}

// Middleware
app.use(helmet());
app.use(cors({
  origin: CORS_ORIGIN,
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
}));
app.use(express.json({ limit: '1mb' }));
app.use(rateLimit);

// Health check
app.get('/api/health', (_req, res) => {
  res.json({
    status: 'ok',
    service: 'agrivolt-api',
    database: 'postgresql',
    timestamp: new Date().toISOString(),
  });
});

// Routes
app.use('/api/farmers', farmersRouter);

// Convenience alias: /api/properties -> farmer properties (anonymized)
app.use('/api/properties', (_req, res, next) => {
  // Forward to the properties sub-route on farmers router
  _req.url = '/properties' + (_req.url === '/' ? '' : _req.url);
  farmersRouter(_req, res, next);
});

// 404 handler
app.use((_req, res) => {
  res.status(404).json({ success: false, error: 'Route not found' });
});

// Error handler
app.use((err: Error, _req: express.Request, res: express.Response, _next: express.NextFunction) => {
  console.error('[Server] Unhandled error:', err);
  res.status(500).json({ success: false, error: 'Internal server error' });
});

app.listen(PORT, '0.0.0.0', () => {
  console.log(`[AgriVolt API] Running on http://0.0.0.0:${PORT}`);
  console.log(`[AgriVolt API] CORS origin: ${CORS_ORIGIN}`);
  console.log(`[AgriVolt API] Database: PostgreSQL (Railway)`);
});
