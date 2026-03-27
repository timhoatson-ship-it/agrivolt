import { pgTable, serial, text, real, timestamp, doublePrecision } from 'drizzle-orm/pg-core';

export const farmers = pgTable('farmers', {
  id: serial('id').primaryKey(),
  firstName: text('first_name').notNull(),
  lastName: text('last_name').notNull(),
  email: text('email').notNull().unique(),
  phone: text('phone').notNull(),
  propertyAddress: text('property_address').notNull(),
  /** Exact coordinates — NEVER exposed to developers before unlock */
  lat: doublePrecision('lat').notNull(),
  lng: doublePrecision('lng').notNull(),
  totalHectares: doublePrecision('total_hectares').notNull(),
  currentLandUse: text('current_land_use').notNull(),
  interestLevel: text('interest_level').notNull().default('exploring'),
  notes: text('notes'),
  /** Nearest town/region for anonymized developer view */
  region: text('region'),
  /** Distance to nearest substation in km */
  gridDistanceKm: doublePrecision('grid_distance_km'),
  /** Grid proximity rating: green | amber | red | grey */
  gridRating: text('grid_rating'),
  /** JSON-serialized LandAssessment snapshot */
  assessmentSnapshot: text('assessment_snapshot'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
});

export const developers = pgTable('developers', {
  id: serial('id').primaryKey(),
  companyName: text('company_name').notNull(),
  contactName: text('contact_name').notNull(),
  email: text('email').notNull().unique(),
  phone: text('phone').notNull(),
  /** bcrypt-hashed password */
  passwordHash: text('password_hash'),
  /** JSON array of project types */
  projectTypes: text('project_types').notNull(),
  minSizeHectares: doublePrecision('min_size_hectares').default(10),
  maxDistanceFromGridKm: doublePrecision('max_distance_from_grid_km').default(30),
  /** JSON array of QLD regions */
  regionsOfInterest: text('regions_of_interest'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
});

/** Track which properties a developer has unlocked (paid for) */
export const unlocks = pgTable('unlocks', {
  id: serial('id').primaryKey(),
  developerId: serial('developer_id').notNull(),
  farmerId: serial('farmer_id').notNull(),
  unlockedAt: timestamp('unlocked_at').defaultNow().notNull(),
});
