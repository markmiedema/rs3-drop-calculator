/**
 * Enrage scaling calculations for RS3 bosses
 *
 * Certain bosses have drop rates that improve with higher enrage:
 * - Telos, the Warden
 * - Zamorak, Lord of Chaos
 * - Arch-Glacor
 *
 * Each boss has a unique formula for how enrage affects drop rates.
 *
 * TODO: Verify exact formulas from RS3 Wiki
 * - Task 2.5.1: Research Telos enrage formula
 * - Task 2.5.2: Research Zamorak enrage formula
 * - Task 2.5.3: Research Arch-Glacor enrage formula
 */

export type EnrageScalingBoss = 'telos' | 'zamorak' | 'arch_glacor';

/**
 * Configuration for enrage-scaling bosses
 */
export interface EnrageConfig {
  boss: EnrageScalingBoss;
  minEnrage: number;
  maxEnrage: number;
  baseDropRate: number; // Drop rate at 0% enrage
}

/**
 * Telos enrage scaling formula
 * TODO: Verify exact formula from RS3 Wiki
 *
 * Placeholder: Linear scaling
 * Actual formula may be different
 *
 * @param enrage - Enrage percentage (0-4000)
 * @param baseDropRate - Base drop rate at 0% enrage
 * @returns Improved drop rate at given enrage
 */
export function calculateTelosDropRate(enrage: number, baseDropRate: number): number {
  if (enrage < 0 || enrage > 4000) {
    throw new Error('Telos enrage must be between 0 and 4000');
  }

  // Placeholder linear formula
  // TODO: Replace with actual Telos formula from RS3 Wiki
  // Common pattern: base rate improves linearly or exponentially with enrage
  const improvementFactor = 1 + enrage / 1000; // Example: 1% improvement per 10 enrage
  return baseDropRate / improvementFactor;
}

/**
 * Zamorak enrage scaling formula
 * TODO: Verify exact formula from RS3 Wiki
 *
 * Placeholder: Linear scaling with cap
 *
 * @param enrage - Enrage percentage (0-4000)
 * @param baseDropRate - Base drop rate at 0% enrage
 * @returns Improved drop rate at given enrage
 */
export function calculateZamorakDropRate(enrage: number, baseDropRate: number): number {
  if (enrage < 0 || enrage > 4000) {
    throw new Error('Zamorak enrage must be between 0 and 4000');
  }

  // Placeholder formula
  // TODO: Replace with actual Zamorak formula from RS3 Wiki
  const improvementFactor = 1 + enrage / 800;
  return baseDropRate / improvementFactor;
}

/**
 * Arch-Glacor enrage scaling formula
 * TODO: Verify exact formula from RS3 Wiki
 *
 * Note: Arch-Glacor has different mechanics for Normal Mode vs Hard Mode
 * Hard Mode enrage scales infinitely
 *
 * @param enrage - Enrage percentage (0-infinity in HM)
 * @param baseDropRate - Base drop rate at 0% enrage
 * @returns Improved drop rate at given enrage
 */
export function calculateArchGlacorDropRate(
  enrage: number,
  baseDropRate: number,
): number {
  if (enrage < 0) {
    throw new Error('Arch-Glacor enrage must be non-negative');
  }

  // Placeholder formula
  // TODO: Replace with actual Arch-Glacor formula from RS3 Wiki
  // May need separate formulas for Normal Mode and Hard Mode
  const improvementFactor = 1 + enrage / 1200;
  return baseDropRate / improvementFactor;
}

/**
 * Generic function to calculate drop rate with enrage scaling
 * @param boss - Boss type
 * @param enrage - Enrage percentage
 * @param baseDropRate - Base drop rate at 0% enrage
 * @returns Improved drop rate at given enrage
 */
export function calculateEnrageScaledDropRate(
  boss: EnrageScalingBoss,
  enrage: number,
  baseDropRate: number,
): number {
  switch (boss) {
    case 'telos':
      return calculateTelosDropRate(enrage, baseDropRate);
    case 'zamorak':
      return calculateZamorakDropRate(enrage, baseDropRate);
    case 'arch_glacor':
      return calculateArchGlacorDropRate(enrage, baseDropRate);
    default:
      throw new Error(`Unknown enrage-scaling boss: ${boss}`);
  }
}

/**
 * Calculate cumulative probability for enrage-scaling boss
 * @param attempts - Number of attempts
 * @param boss - Boss type
 * @param enrage - Enrage percentage
 * @param baseDropRate - Base drop rate at 0% enrage
 * @returns Cumulative probability
 */
export function calculateCumulativeProbabilityWithEnrage(
  attempts: number,
  boss: EnrageScalingBoss,
  enrage: number,
  baseDropRate: number,
): number {
  if (attempts < 0) {
    throw new Error('Attempts must be non-negative');
  }
  if (attempts === 0) {
    return 0;
  }

  const scaledDropRate = calculateEnrageScaledDropRate(boss, enrage, baseDropRate);
  const baseProbability = 1 / scaledDropRate;

  // Standard cumulative probability formula
  const probabilityOfNone = Math.pow(1 - baseProbability, attempts);
  const cumulativeProbability = 1 - probabilityOfNone;

  return Math.min(cumulativeProbability, 0.9999);
}

/**
 * Compare drop rates at different enrage levels
 * Useful for showing players the benefit of higher enrage
 *
 * @param boss - Boss type
 * @param baseDropRate - Base drop rate at 0% enrage
 * @param enrageLevels - Array of enrage levels to compare
 * @returns Array of drop rates at each enrage level
 */
export function compareEnrageLevels(
  boss: EnrageScalingBoss,
  baseDropRate: number,
  enrageLevels: number[],
): Array<{ enrage: number; dropRate: number; improvement: number }> {
  return enrageLevels.map((enrage) => {
    const dropRate = calculateEnrageScaledDropRate(boss, enrage, baseDropRate);
    const improvement = ((baseDropRate - dropRate) / baseDropRate) * 100;

    return {
      enrage,
      dropRate: Math.round(dropRate * 100) / 100, // Round to 2 decimals
      improvement: Math.round(improvement * 100) / 100,
    };
  });
}

/**
 * Find optimal enrage for a target drop rate
 * Binary search to find enrage level that gives desired drop rate
 *
 * @param boss - Boss type
 * @param baseDropRate - Base drop rate at 0% enrage
 * @param targetDropRate - Desired drop rate
 * @param maxEnrage - Maximum enrage to consider
 * @returns Enrage level needed for target drop rate
 */
export function findEnrageForTargetDropRate(
  boss: EnrageScalingBoss,
  baseDropRate: number,
  targetDropRate: number,
  maxEnrage: number = 4000,
): number {
  if (targetDropRate > baseDropRate) {
    throw new Error('Target drop rate cannot be worse than base rate');
  }

  let low = 0;
  let high = maxEnrage;

  while (high - low > 1) {
    const mid = Math.floor((low + high) / 2);
    const dropRate = calculateEnrageScaledDropRate(boss, mid, baseDropRate);

    if (dropRate > targetDropRate) {
      low = mid;
    } else {
      high = mid;
    }
  }

  return high;
}
