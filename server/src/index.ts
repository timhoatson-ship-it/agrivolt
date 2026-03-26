import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import farmersRouter from './routes/farmers.js';

const app = express();
const PORT = parseInt(process.env.PORT || '3001', 10);
const CORS_ORIGIN = process.env.CORS_ORIGIN || 'http://localhost:5173';

// Middleware
app.use(helmet());
app.use(cors({
  origin: CORS_ORIGIN,
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
}));
app.use(express.json({ limit: '1mb' }));

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
