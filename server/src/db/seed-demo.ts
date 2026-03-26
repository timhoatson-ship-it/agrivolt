/**
 * Seed realistic demo farmer properties for the developer dashboard.
 * 
 * Run via: npx tsx server/src/db/seed-demo.ts
 * Requires DATABASE_URL env var pointing to Railway PostgreSQL.
 * 
 * Properties are realistic QLD locations — mostly Darling Downs / Central QLD
 * where solar infrastructure actually exists. Grid distances and ratings
 * are calibrated against real GA substation data.
 */

import postgres from 'postgres';

const DATABASE_URL = process.env.DATABASE_URL;
if (!DATABASE_URL) {
  console.error('DATABASE_URL not set. Point it at your Railway PostgreSQL.');
  process.exit(1);
}

const sql = postgres(DATABASE_URL, { ssl: 'prefer' });

interface DemoFarmer {
  first_name: string;
  last_name: string;
  email: string;
  phone: string;
  property_address: string;
  lat: number;
  lng: number;
  total_hectares: number;
  current_land_use: string;
  interest_level: string;
  region: string;
  grid_distance_km: number;
  grid_rating: string;
  notes: string | null;
}

// Real QLD farming regions with plausible coordinates near substations
const demoFarmers: DemoFarmer[] = [
  // --- Darling Downs (near Dalby / Chinchilla substations) ---
  {
    first_name: 'James', last_name: 'McAllister',
    email: 'james.mcallister@demo.agrivolt.com.au', phone: '0412345678',
    property_address: '2145 Warrego Hwy, Dalby QLD 4405',
    lat: -26.8628, lng: 151.2658,
    total_hectares: 320, current_land_use: 'Dryland cropping',
    interest_level: 'serious', region: 'Dalby',
    grid_distance_km: 4.2, grid_rating: 'green',
    notes: 'Interested in dual-use with sorghum. Has existing water bore.',
  },
  {
    first_name: 'Sarah', last_name: 'O\'Brien',
    email: 'sarah.obrien@demo.agrivolt.com.au', phone: '0423456789',
    property_address: '780 Kogan Rd, Chinchilla QLD 4413',
    lat: -26.7412, lng: 150.6283,
    total_hectares: 540, current_land_use: 'Cattle grazing',
    interest_level: 'ready', region: 'Chinchilla',
    grid_distance_km: 7.8, grid_rating: 'amber',
    notes: 'Large flat paddocks, good road access. Wants to keep cattle under panels.',
  },
  {
    first_name: 'David', last_name: 'Nguyen',
    email: 'david.nguyen@demo.agrivolt.com.au', phone: '0434567890',
    property_address: '45 Range Rd, Oakey QLD 4401',
    lat: -27.4395, lng: 151.7241,
    total_hectares: 185, current_land_use: 'Mixed farming',
    interest_level: 'exploring', region: 'Oakey',
    grid_distance_km: 3.1, grid_rating: 'green',
    notes: 'Close to Oakey substation. Keen to understand lease terms.',
  },
  {
    first_name: 'Michelle', last_name: 'Patterson',
    email: 'michelle.patterson@demo.agrivolt.com.au', phone: '0445678901',
    property_address: '1500 Condamine Hwy, Miles QLD 4415',
    lat: -26.6588, lng: 150.1827,
    total_hectares: 720, current_land_use: 'Cattle grazing',
    interest_level: 'serious', region: 'Miles',
    grid_distance_km: 12.5, grid_rating: 'amber',
    notes: 'Large property, partial flood zone on eastern boundary.',
  },
  // --- Central QLD (near Emerald / Gladstone) ---
  {
    first_name: 'Robert', last_name: 'Jenkins',
    email: 'robert.jenkins@demo.agrivolt.com.au', phone: '0456789012',
    property_address: '3200 Capricorn Hwy, Emerald QLD 4720',
    lat: -23.4271, lng: 148.1613,
    total_hectares: 450, current_land_use: 'Irrigated cropping',
    interest_level: 'ready', region: 'Emerald',
    grid_distance_km: 5.6, grid_rating: 'amber',
    notes: 'Cotton and chickpea rotation. Excellent solar exposure.',
  },
  {
    first_name: 'Karen', last_name: 'Whitfield',
    email: 'karen.whitfield@demo.agrivolt.com.au', phone: '0467890123',
    property_address: '890 Burnett Hwy, Biloela QLD 4715',
    lat: -24.4029, lng: 150.5127,
    total_hectares: 280, current_land_use: 'Cattle grazing',
    interest_level: 'exploring', region: 'Biloela',
    grid_distance_km: 8.3, grid_rating: 'amber',
    notes: null,
  },
  {
    first_name: 'Thomas', last_name: 'Russo',
    email: 'thomas.russo@demo.agrivolt.com.au', phone: '0478901234',
    property_address: '2600 Bruce Hwy, Calliope QLD 4680',
    lat: -24.0112, lng: 151.2384,
    total_hectares: 160, current_land_use: 'Unused / fallow',
    interest_level: 'ready', region: 'Gladstone',
    grid_distance_km: 2.8, grid_rating: 'green',
    notes: 'Previously cattle, now fallow. Very close to Gladstone substation.',
  },
  // --- North QLD (Townsville / Bowen) ---
  {
    first_name: 'Linda', last_name: 'Hartley',
    email: 'linda.hartley@demo.agrivolt.com.au', phone: '0489012345',
    property_address: '4500 Bruce Hwy, Bowen QLD 4805',
    lat: -20.0124, lng: 148.2468,
    total_hectares: 95, current_land_use: 'Horticulture',
    interest_level: 'exploring', region: 'Bowen',
    grid_distance_km: 18.2, grid_rating: 'red',
    notes: 'Mango and tomato farm. Interested in shade benefits for crops.',
  },
  {
    first_name: 'Peter', last_name: 'Sullivan',
    email: 'peter.sullivan@demo.agrivolt.com.au', phone: '0490123456',
    property_address: '1200 Flinders Hwy, Charters Towers QLD 4820',
    lat: -20.0760, lng: 146.2652,
    total_hectares: 1200, current_land_use: 'Cattle grazing',
    interest_level: 'serious', region: 'Charters Towers',
    grid_distance_km: 6.4, grid_rating: 'amber',
    notes: 'Very large property, willing to allocate 200ha for solar.',
  },
  // --- Bundaberg / Wide Bay ---
  {
    first_name: 'Christine', last_name: 'Blake',
    email: 'christine.blake@demo.agrivolt.com.au', phone: '0401234567',
    property_address: '660 Isis Hwy, Childers QLD 4660',
    lat: -25.2381, lng: 152.2873,
    total_hectares: 210, current_land_use: 'Mixed farming',
    interest_level: 'serious', region: 'Bundaberg',
    grid_distance_km: 9.7, grid_rating: 'amber',
    notes: 'Sugar cane and macadamias. Good grid access via Bundaberg sub.',
  },
  // --- South Burnett ---
  {
    first_name: 'Andrew', last_name: 'Campbell',
    email: 'andrew.campbell@demo.agrivolt.com.au', phone: '0412987654',
    property_address: '340 Burnett Hwy, Kingaroy QLD 4610',
    lat: -26.5389, lng: 151.8413,
    total_hectares: 175, current_land_use: 'Dryland cropping',
    interest_level: 'exploring', region: 'Kingaroy',
    grid_distance_km: 4.9, grid_rating: 'green',
    notes: 'Peanut and navy bean rotation. Flat terrain, excellent for panels.',
  },
  {
    first_name: 'Emma', last_name: 'Thorpe',
    email: 'emma.thorpe@demo.agrivolt.com.au', phone: '0423987654',
    property_address: '1870 New England Hwy, Clifton QLD 4361',
    lat: -27.9327, lng: 151.9082,
    total_hectares: 260, current_land_use: 'Sheep grazing',
    interest_level: 'serious', region: 'Toowoomba',
    grid_distance_km: 11.3, grid_rating: 'amber',
    notes: 'Would like to combine solar with existing sheep operation.',
  },
  // --- Western QLD ---
  {
    first_name: 'Mark', last_name: 'Henderson',
    email: 'mark.henderson@demo.agrivolt.com.au', phone: '0434987654',
    property_address: '5500 Warrego Hwy, Roma QLD 4455',
    lat: -26.5754, lng: 148.7892,
    total_hectares: 890, current_land_use: 'Cattle grazing',
    interest_level: 'exploring', region: 'Roma',
    grid_distance_km: 22.4, grid_rating: 'red',
    notes: 'Remote but large. Potentially viable for utility-scale.',
  },
  {
    first_name: 'Sue', last_name: 'McKenzie',
    email: 'sue.mckenzie@demo.agrivolt.com.au', phone: '0445987654',
    property_address: '420 Leichhardt Hwy, Wandoan QLD 4419',
    lat: -26.1228, lng: 149.9651,
    total_hectares: 410, current_land_use: 'Cattle grazing',
    interest_level: 'ready', region: 'Wandoan',
    grid_distance_km: 14.8, grid_rating: 'amber',
    notes: 'Near proposed CleanCo wind/solar corridor. Strategic location.',
  },
  // --- Mackay ---
  {
    first_name: 'Jason', last_name: 'Patel',
    email: 'jason.patel@demo.agrivolt.com.au', phone: '0456987654',
    property_address: '2100 Peak Downs Hwy, Coppabella QLD 4741',
    lat: -21.9184, lng: 148.8237,
    total_hectares: 350, current_land_use: 'Cattle grazing',
    interest_level: 'serious', region: 'Mackay',
    grid_distance_km: 3.5, grid_rating: 'green',
    notes: 'Adjacent to mining infrastructure, excellent grid connection.',
  },
];

async function seed() {
  console.log(`Seeding ${demoFarmers.length} demo properties into Railway PostgreSQL...`);

  // Delete existing demo records (identified by @demo.agrivolt.com.au emails)
  const deleted = await sql`
    DELETE FROM farmers WHERE email LIKE '%@demo.agrivolt.com.au'
  `;
  console.log(`Cleared existing demo records.`);

  // Insert all demo farmers
  for (const f of demoFarmers) {
    await sql`
      INSERT INTO farmers (
        first_name, last_name, email, phone, property_address,
        lat, lng, total_hectares, current_land_use, interest_level,
        region, grid_distance_km, grid_rating, notes
      ) VALUES (
        ${f.first_name}, ${f.last_name}, ${f.email}, ${f.phone}, ${f.property_address},
        ${f.lat}, ${f.lng}, ${f.total_hectares}, ${f.current_land_use}, ${f.interest_level},
        ${f.region}, ${f.grid_distance_km}, ${f.grid_rating}, ${f.notes}
      )
    `;
    console.log(`  ✓ ${f.first_name} ${f.last_name} — ${f.total_hectares}ha ${f.current_land_use} in ${f.region}`);
  }

  console.log(`\nDone! ${demoFarmers.length} demo properties seeded.`);
  
  // Verify count
  const [count] = await sql`SELECT count(*) as total FROM farmers`;
  console.log(`Total farmers in database: ${count.total}`);

  await sql.end();
}

seed().catch(err => {
  console.error('Seed failed:', err);
  process.exit(1);
});
