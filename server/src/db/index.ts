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

// Auto-migrate: ensure all required tables and columns exist
(async () => {
  try {
    // Ensure developers table exists with all required columns
    await sql`
      CREATE TABLE IF NOT EXISTS developers (
        id serial PRIMARY KEY,
        company_name text NOT NULL,
        contact_name text NOT NULL,
        email text NOT NULL UNIQUE,
        phone text NOT NULL,
        password_hash text,
        project_types text NOT NULL,
        min_size_hectares double precision DEFAULT 10,
        max_distance_from_grid_km double precision DEFAULT 30,
        regions_of_interest text,
        created_at timestamp DEFAULT now() NOT NULL
      )
    `;
    // Add password_hash column if it doesn't exist (for existing installations)
    await sql`ALTER TABLE developers ADD COLUMN IF NOT EXISTS password_hash text`;
    console.log('[DB] Schema migration check complete');
  } catch (err) {
    console.warn('[DB] Migration check:', (err as Error).message);
  }
})();

console.log('[DB] PostgreSQL connected');
