import { Router } from 'express';
import { z } from 'zod';
import { db } from '../db/index.js';
import { farmers } from '../db/schema.js';
import { eq } from 'drizzle-orm';

const router = Router();

/** Strip HTML tags and trim whitespace */
function sanitize(input: string): string {
  return input.replace(/<[^>]*>/g, '').trim();
}

const farmerSchema = z.object({
  firstName: z.string().min(1).max(100),
  lastName: z.string().min(1).max(100),
  email: z.string().email(),
  phone: z.string().min(8).max(20),
  propertyAddress: z.string().min(1),
  coordinates: z.object({
    lat: z.number().min(-45).max(-10),
    lng: z.number().min(-180).max(180),
  }),
  totalHectares: z.number().positive(),
  currentLandUse: z.string().min(1),
  interestLevel: z.enum(['exploring', 'serious', 'ready']).default('exploring'),
  notes: z.string().optional(),
  region: z.string().optional(),
  gridDistanceKm: z.number().optional(),
  gridRating: z.string().optional(),
  assessmentSnapshot: z.any().optional(),
});

// POST /api/farmers — Register a farmer's expression of interest
router.post('/', async (req, res) => {
  try {
    const data = farmerSchema.parse(req.body);

    const safe = {
      ...data,
      firstName: sanitize(data.firstName),
      lastName: sanitize(data.lastName),
      propertyAddress: sanitize(data.propertyAddress),
      notes: data.notes ? sanitize(data.notes) : null,
    };

    const [result] = await db.insert(farmers).values({
      firstName: safe.firstName,
      lastName: safe.lastName,
      email: data.email,
      phone: data.phone,
      propertyAddress: safe.propertyAddress,
      lat: data.coordinates.lat,
      lng: data.coordinates.lng,
      totalHectares: data.totalHectares,
      currentLandUse: data.currentLandUse,
      interestLevel: data.interestLevel,
      notes: safe.notes,
      region: data.region || null,
      gridDistanceKm: data.gridDistanceKm || null,
      gridRating: data.gridRating || null,
      assessmentSnapshot: data.assessmentSnapshot ? JSON.stringify(data.assessmentSnapshot) : null,
    }).returning();

    res.status(201).json({ success: true, data: result });
  } catch (err) {
    if (err instanceof z.ZodError) {
      res.status(400).json({ success: false, error: 'Validation error', details: err.errors });
      return;
    }
    // Duplicate email
    if ((err as any)?.code === '23505') {
      res.status(409).json({ success: false, error: 'A registration with this email already exists.' });
      return;
    }
    console.error('[Farmers] Error:', err);
    res.status(500).json({ success: false, error: 'Internal server error' });
  }
});

/**
 * GET /api/properties — ANONYMIZED developer view
 * 
 * Returns properties with:
 * - Randomized coordinates (±2km offset to prevent bypass)
 * - Generalized location ("50ha lot in Dalby region")
 * - Grid rating and constraints (useful for filtering)
 * - NO farmer name, email, phone, or exact address
 */
router.get('/properties', async (_req, res) => {
  try {
    const all = await db.select({
      id: farmers.id,
      totalHectares: farmers.totalHectares,
      currentLandUse: farmers.currentLandUse,
      interestLevel: farmers.interestLevel,
      region: farmers.region,
      gridDistanceKm: farmers.gridDistanceKm,
      gridRating: farmers.gridRating,
      lat: farmers.lat,
      lng: farmers.lng,
      createdAt: farmers.createdAt,
    }).from(farmers);

    // Anonymize: apply ±2km random offset to coordinates
    const anonymized = all.map(p => ({
      id: p.id,
      totalHectares: p.totalHectares,
      currentLandUse: p.currentLandUse,
      interestLevel: p.interestLevel,
      region: p.region || 'Queensland',
      gridDistanceKm: p.gridDistanceKm,
      gridRating: p.gridRating,
      // Randomize position within ~2km radius
      lat: p.lat + (Math.random() - 0.5) * 0.036, // ~2km at QLD latitudes
      lng: p.lng + (Math.random() - 0.5) * 0.036,
      label: `${Math.round(p.totalHectares)}ha ${p.currentLandUse} in ${p.region || 'QLD'}`,
      registeredAt: p.createdAt,
      locked: true, // Always locked until developer pays
    }));

    res.json({ success: true, data: anonymized, total: anonymized.length });
  } catch (err) {
    console.error('[Properties] Error:', err);
    res.status(500).json({ success: false, error: 'Internal server error' });
  }
});

// POST /api/contact — contact form submission
router.post('/contact', async (req, res) => {
  try {
    const { name, email, type, message } = req.body;

    // Basic validation
    if (!name || !email || !message) {
      return res.status(400).json({ success: false, error: 'Missing required fields' });
    }

    // Strip HTML tags
    const clean = (s: string) => s.replace(/<[^>]*>/g, '').trim();

    // For MVP, just log the contact (later: store in DB or send email)
    console.log('[AgriVolt Contact]', {
      name: clean(name),
      email: clean(email),
      type: clean(type || 'other'),
      message: clean(message).substring(0, 1000),
      timestamp: new Date().toISOString(),
    });

    res.json({ success: true, message: 'Message received' });
  } catch (error) {
    console.error('Contact form error:', error);
    res.status(500).json({ success: false, error: 'Failed to process message' });
  }
});

// DELETE /api/farmers/:id — data deletion request
router.delete('/:id', async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    if (isNaN(id)) return res.status(400).json({ success: false, error: 'Invalid ID' });
    await db.delete(farmers).where(eq(farmers.id, id));
    res.json({ success: true, message: 'Your data has been deleted.' });
  } catch (error) {
    console.error('[Farmers] Delete error:', error);
    res.status(500).json({ success: false, error: 'Failed to delete record' });
  }
});

export default router;
