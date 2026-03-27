import { drizzle } from 'drizzle-orm/postgres-js';
import postgres from 'postgres';
import * as schema from './schema.js';

const DATABASE_URL = process.env.DATABASE_URL;

if (!DATABASE_URL) {
  console.error('[DB] ERROR: DATABASE_URL environment variable is required.');
  console.error('[DB] For local dev, set DATABASE_URL=postgresql://localhost:5432/agrivolt');
  console.error('[DB] Railway auto-provisions this for you in production.');
  process.exit(1);
}

const sql = postgres(DATABASE_URL, {
  max: 10,
  idle_timeout: 20,
  connect_timeout: 10,
});

export const db = drizzle(sql, { schema });

// Auto-migrate: ensure all required columns exist
(async () => {
  try {
    // Add password_hash column to developers table if it doesn't exist
    await sql`ALTER TABLE developers ADD COLUMN IF NOT EXISTS password_hash text`;
    console.log('[DB] Schema migration check complete');
  } catch (err) {
    // Table might not exist yet — that's fine, Drizzle will create it
    console.warn('[DB] Migration check skipped:', (err as Error).message);
  }
})();

console.log('[DB] PostgreSQL connected');
