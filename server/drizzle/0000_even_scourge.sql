CREATE TABLE IF NOT EXISTS "developers" (
	"id" serial PRIMARY KEY NOT NULL,
	"company_name" text NOT NULL,
	"contact_name" text NOT NULL,
	"email" text NOT NULL,
	"phone" text NOT NULL,
	"password_hash" text,
	"project_types" text NOT NULL,
	"min_size_hectares" double precision DEFAULT 10,
	"max_distance_from_grid_km" double precision DEFAULT 30,
	"regions_of_interest" text,
	"created_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "developers_email_unique" UNIQUE("email")
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "farmers" (
	"id" serial PRIMARY KEY NOT NULL,
	"first_name" text NOT NULL,
	"last_name" text NOT NULL,
	"email" text NOT NULL,
	"phone" text NOT NULL,
	"property_address" text NOT NULL,
	"lat" double precision NOT NULL,
	"lng" double precision NOT NULL,
	"total_hectares" double precision NOT NULL,
	"current_land_use" text NOT NULL,
	"interest_level" text DEFAULT 'exploring' NOT NULL,
	"notes" text,
	"region" text,
	"grid_distance_km" double precision,
	"grid_rating" text,
	"assessment_snapshot" text,
	"created_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "farmers_email_unique" UNIQUE("email")
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "unlocks" (
	"id" serial PRIMARY KEY NOT NULL,
	"developer_id" serial NOT NULL,
	"farmer_id" serial NOT NULL,
	"unlocked_at" timestamp DEFAULT now() NOT NULL
);
