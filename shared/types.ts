// ============================================================
// AgriVolt — Shared Types (client + server)
// ============================================================

// --- Geospatial ---

export interface LatLng {
  lat: number;
  lng: number;
}

export interface BoundingBox {
  north: number;
  south: number;
  east: number;
  west: number;
}

// --- Grid Proximity ---

export type GridProximityRating = 'green' | 'amber' | 'red' | 'grey';

export interface NearestSubstation {
  name: string;
  distanceKm: number;
  rating: GridProximityRating;
  coordinates: LatLng;
  voltageKv?: number;
}

export interface NearestTransmissionLine {
  distanceKm: number;
  rating: GridProximityRating;
  voltageKv?: number;
}

// --- Constraint Layers ---

export interface ConstraintFlags {
  strategicCroppingLand: boolean;
  floodZone: boolean;
  koalaHabitat: boolean;
  /** Other zoning/planning constraints */
  otherConstraints: string[];
}

// --- Solar & Climate ---

export interface SolarExposure {
  /** Average daily global solar exposure in MJ/m² */
  annualAvgMjM2: number;
  /** Monthly averages (Jan=0, Dec=11) */
  monthlyAvgMjM2: number[];
  /** Estimated annual energy yield for a 1MW system (MWh) */
  estimatedAnnualYieldMwh?: number;
}

// --- Farmer Income Calculator ---

export interface LeaseEstimate {
  /** Estimated annual lease income in AUD */
  annualIncomeAud: number;
  /** Lease rate used ($/hectare/year) */
  leaseRatePerHa: number;
  /** Usable hectares after constraints removed */
  usableHectares: number;
  /** Total property hectares */
  totalHectares: number;
  /** Lease term in years */
  leaseTermYears: number;
  /** Total income over lease term */
  totalLifetimeIncomeAud: number;
}

export interface WaterSavingsEstimate {
  /** Estimated annual water savings in megalitres */
  annualSavingsMl: number;
  /** Estimated annual cost savings in AUD */
  annualCostSavingsAud: number;
  /** Evaporation reduction percentage */
  evaporationReductionPct: number;
}

export interface ShadePremium {
  /** Potential yield increase for shade-tolerant crops */
  yieldIncreasePct: number;
  /** Water use reduction from shading */
  waterReductionPct: number;
  /** Suitable crop/livestock types for agrivoltaics */
  suitableUses: string[];
}

export interface LandAssessment {
  coordinates: LatLng;
  propertyAddress?: string;
  totalHectares: number;
  nearestSubstation: NearestSubstation;
  nearestTransmissionLine: NearestTransmissionLine;
  constraints: ConstraintFlags;
  solarExposure: SolarExposure;
  leaseEstimate: LeaseEstimate;
  waterSavings: WaterSavingsEstimate;
  shadePremium: ShadePremium;
  overallViabilityScore: GridProximityRating;
  assessedAt: string; // ISO timestamp
}

// --- Farmer Registration ---

export interface FarmerRegistration {
  id?: number;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  propertyAddress: string;
  coordinates: LatLng;
  totalHectares: number;
  currentLandUse: string;
  interestLevel: 'exploring' | 'serious' | 'ready';
  notes?: string;
  assessmentSnapshot?: LandAssessment;
  createdAt?: string;
}

// --- Developer ---

export interface DeveloperProfile {
  id?: number;
  companyName: string;
  contactName: string;
  email: string;
  phone: string;
  projectTypes: ('utility_solar' | 'community_solar' | 'agrivoltaics' | 'wind')[];
  minSizeHectares: number;
  maxDistanceFromGridKm: number;
  regionsOfInterest: string[];
  createdAt?: string;
}

export interface PropertyLead {
  farmerId: number;
  farmerName: string;
  propertyAddress: string;
  coordinates: LatLng;
  totalHectares: number;
  usableHectares: number;
  gridProximityRating: GridProximityRating;
  distanceToSubstationKm: number;
  annualSolarExposureMj: number;
  constraintFlags: ConstraintFlags;
  estimatedLeaseIncomeAud: number;
  interestLevel: string;
  registeredAt: string;
}

// --- API Responses ---

export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
}

export interface PaginatedResponse<T> extends ApiResponse<T[]> {
  total: number;
  page: number;
  pageSize: number;
}
