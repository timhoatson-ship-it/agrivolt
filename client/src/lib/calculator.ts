import type {
  LatLng,
  GridProximityRating,
  LeaseEstimate,
  WaterSavingsEstimate,
  ShadePremium,
  NearestSubstation,
} from '@shared/types';

// ============================================================
// AgriVolt Land Assessment Calculator
// Based on peer-reviewed agrivoltaics data & QLD market rates
// ============================================================

/**
 * Determine grid proximity rating based on distance to nearest substation.
 * < 5km: Green (low connection cost)
 * 5-15km: Amber (moderate cost $500k-$2M)
 * 15-30km: Red (high cost $2M-$10M+)
 * > 30km: Grey (not viable without grid upgrade)
 */
export function getGridProximityRating(distanceKm: number): GridProximityRating {
  if (distanceKm < 5) return 'green';
  if (distanceKm < 15) return 'amber';
  if (distanceKm < 30) return 'red';
  return 'grey';
}

/**
 * Get lease rate per hectare/year based on grid proximity.
 * Closer to grid = higher lease value (lower developer connection costs).
 */
function getLeaseRatePerHa(distanceKm: number): number {
  if (distanceKm < 5) return 2500;
  if (distanceKm < 15) return 2000;
  if (distanceKm < 30) return 1500;
  return 1000;
}

/**
 * Calculate estimated solar lease income for a property.
 * 
 * Assumptions:
 * - 20% of land used for elevated solar panels (agrivoltaic standard)
 * - 10% deducted for buildings, rocky areas, dense canopy
 * - Lease rates vary by grid proximity ($1,000-$2,500/ha/year)
 * - Standard 25-year lease term
 */
export function calculateLeaseEstimate(
  totalHectares: number,
  distanceToSubstationKm: number,
  isStrategicCroppingLand: boolean,
  isFloodZone: boolean
): LeaseEstimate {
  const panelCoveragePct = 0.20;
  const unusableDeductionPct = 0.10;

  let usableHectares = totalHectares * panelCoveragePct;

  // Deduct unusable area (buildings, rocks, trees)
  usableHectares *= (1 - unusableDeductionPct);

  // If SCL, reduce usable area by 50% (strict planning restrictions)
  if (isStrategicCroppingLand) {
    usableHectares *= 0.5;
  }

  // If flood zone, reduce usable area by 30% (elevated panels mitigate some risk)
  if (isFloodZone) {
    usableHectares *= 0.7;
  }

  const leaseRatePerHa = getLeaseRatePerHa(distanceToSubstationKm);
  const leaseTermYears = 25;
  const annualIncomeAud = usableHectares * leaseRatePerHa;

  return {
    annualIncomeAud: Math.round(annualIncomeAud),
    leaseRatePerHa,
    usableHectares: Math.round(usableHectares * 10) / 10,
    totalHectares,
    leaseTermYears,
    totalLifetimeIncomeAud: Math.round(annualIncomeAud * leaseTermYears),
  };
}

/**
 * Calculate estimated water savings from agrivoltaic shading.
 * 
 * Research basis:
 * - Agrivoltaic panels reduce soil evaporation by ~30% (Barron-Gafford et al., 2019)
 * - Average QLD irrigation water cost: $150-300/ML
 * - Average QLD annual evaporation: 1,200-2,400mm depending on region
 */
export function calculateWaterSavings(
  usableHectares: number,
  annualEvaporationMm: number = 1800 // QLD average
): WaterSavingsEstimate {
  const evaporationReductionPct = 30;
  const waterCostPerMl = 200; // $/ML mid-range QLD rate

  // Convert mm over hectares to megalitres
  // 1mm over 1ha = 10 cubic metres = 0.01 ML
  const totalEvaporationMl = usableHectares * annualEvaporationMm * 0.01;
  const savedMl = totalEvaporationMl * (evaporationReductionPct / 100);
  const costSavings = savedMl * waterCostPerMl;

  return {
    annualSavingsMl: Math.round(savedMl * 10) / 10,
    annualCostSavingsAud: Math.round(costSavings),
    evaporationReductionPct,
  };
}

/**
 * Calculate shade premium — the agricultural benefit of solar panel shading.
 * 
 * Research basis:
 * - Cherry tomato yield doubled under agrivoltaics (Barron-Gafford, 2019)
 * - Grape weight +20% (Dupraz et al., 2011)
 * - Sheep grazing continues at 100% under elevated panels
 * - Livestock heat stress mortality reduced significantly
 */
export function calculateShadePremium(
  currentLandUse?: string
): ShadePremium {
  // Default values for mixed farming / grazing (most common in QLD)
  return {
    yieldIncreasePct: 15, // Conservative estimate for mixed use
    waterReductionPct: 30,
    suitableUses: [
      'Sheep & cattle grazing (100% continued)',
      'Shade-tolerant horticulture (tomatoes, peppers, leafy greens)',
      'Native grass pasture improvement',
      'Beekeeping (solar-pollinator synergy)',
    ],
  };
}

/**
 * Determine overall viability score.
 * Combines grid proximity + constraint severity.
 */
export function getOverallViability(
  gridRating: GridProximityRating,
  isStrategicCroppingLand: boolean,
  isFloodZone: boolean
): GridProximityRating {
  // If grid is grey (>30km), nothing else matters
  if (gridRating === 'grey') return 'grey';

  // If both SCL and flood, downgrade by one level
  if (isStrategicCroppingLand && isFloodZone) {
    if (gridRating === 'green') return 'amber';
    return 'red';
  }

  // If either SCL or flood, downgrade green to amber
  if (isStrategicCroppingLand || isFloodZone) {
    if (gridRating === 'green') return 'amber';
  }

  return gridRating;
}
