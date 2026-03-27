import { Router } from 'express';
import { z } from 'zod';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { db } from '../db/index.js';
import { developers } from '../db/schema.js';
import { eq } from 'drizzle-orm';
import type { Request, Response, NextFunction } from 'express';

const router = Router();
const JWT_SECRET = process.env.JWT_SECRET || 'agrivolt-dev-secret-change-in-production';

const registerSchema = z.object({
  companyName: z.string().min(1).max(200),
  contactName: z.string().min(1).max(200),
  email: z.string().email(),
  phone: z.string().min(8).max(20),
  password: z.string().min(8).max(100),
  projectTypes: z.array(z.string()).min(1),
  minSizeHectares: z.number().positive().optional(),
  maxDistanceFromGridKm: z.number().positive().optional(),
  regionsOfInterest: z.array(z.string()).optional(),
});

const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(1),
});

// POST /api/auth/register
router.post('/register', async (req: Request, res: Response) => {
  try {
    const data = registerSchema.parse(req.body);
    const passwordHash = await bcrypt.hash(data.password, 12);

    const [dev] = await db.insert(developers).values({
      companyName: data.companyName,
      contactName: data.contactName,
      email: data.email,
      phone: data.phone,
      passwordHash,
      projectTypes: JSON.stringify(data.projectTypes),
      minSizeHectares: data.minSizeHectares ?? 10,
      maxDistanceFromGridKm: data.maxDistanceFromGridKm ?? 30,
      regionsOfInterest: data.regionsOfInterest ? JSON.stringify(data.regionsOfInterest) : null,
    }).returning();

    const token = jwt.sign({ developerId: dev.id, email: dev.email }, JWT_SECRET, { expiresIn: '7d' });

    res.status(201).json({
      success: true,
      data: {
        token,
        developer: {
          id: dev.id,
          companyName: dev.companyName,
          contactName: dev.contactName,
          email: dev.email,
        },
      },
    });
  } catch (err) {
    if (err instanceof z.ZodError) {
      return res.status(400).json({ success: false, error: 'Validation error', details: err.errors });
    }
    if ((err as any)?.code === '23505') {
      return res.status(409).json({ success: false, error: 'An account with this email already exists.' });
    }
    console.error('[Auth] Register error:', err);
    res.status(500).json({ success: false, error: 'Internal server error' });
  }
});

// POST /api/auth/login
router.post('/login', async (req: Request, res: Response) => {
  try {
    const data = loginSchema.parse(req.body);

    const [dev] = await db.select().from(developers).where(eq(developers.email, data.email)).limit(1);
    if (!dev || !dev.passwordHash) {
      return res.status(401).json({ success: false, error: 'Invalid email or password' });
    }

    const valid = await bcrypt.compare(data.password, dev.passwordHash);
    if (!valid) {
      return res.status(401).json({ success: false, error: 'Invalid email or password' });
    }

    const token = jwt.sign({ developerId: dev.id, email: dev.email }, JWT_SECRET, { expiresIn: '7d' });

    res.json({
      success: true,
      data: {
        token,
        developer: {
          id: dev.id,
          companyName: dev.companyName,
          contactName: dev.contactName,
          email: dev.email,
        },
      },
    });
  } catch (err) {
    if (err instanceof z.ZodError) {
      return res.status(400).json({ success: false, error: 'Validation error' });
    }
    console.error('[Auth] Login error:', err);
    res.status(500).json({ success: false, error: 'Internal server error' });
  }
});

// GET /api/auth/me — verify token, return developer profile
router.get('/me', async (req: Request, res: Response) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader?.startsWith('Bearer ')) {
      return res.status(401).json({ success: false, error: 'No token provided' });
    }

    const token = authHeader.slice(7);
    const payload = jwt.verify(token, JWT_SECRET) as { developerId: number; email: string };

    const [dev] = await db.select({
      id: developers.id,
      companyName: developers.companyName,
      contactName: developers.contactName,
      email: developers.email,
      phone: developers.phone,
      projectTypes: developers.projectTypes,
      minSizeHectares: developers.minSizeHectares,
      maxDistanceFromGridKm: developers.maxDistanceFromGridKm,
      createdAt: developers.createdAt,
    }).from(developers).where(eq(developers.id, payload.developerId)).limit(1);

    if (!dev) {
      return res.status(404).json({ success: false, error: 'Developer not found' });
    }

    res.json({ success: true, data: dev });
  } catch (err) {
    if ((err as any)?.name === 'JsonWebTokenError' || (err as any)?.name === 'TokenExpiredError') {
      return res.status(401).json({ success: false, error: 'Invalid or expired token' });
    }
    console.error('[Auth] Me error:', err);
    res.status(500).json({ success: false, error: 'Internal server error' });
  }
});

/** Middleware: require valid JWT. Attaches `req.developerId`. */
export function requireAuth(req: Request, res: Response, next: NextFunction) {
  const authHeader = req.headers.authorization;
  if (!authHeader?.startsWith('Bearer ')) {
    return res.status(401).json({ success: false, error: 'Authentication required' });
  }
  try {
    const payload = jwt.verify(authHeader.slice(7), JWT_SECRET) as { developerId: number };
    (req as any).developerId = payload.developerId;
    next();
  } catch {
    res.status(401).json({ success: false, error: 'Invalid or expired token' });
  }
}

export default router;
