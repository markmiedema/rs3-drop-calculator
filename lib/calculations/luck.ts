/**
 * Luck of the Dwarves (LOTD) multiplier calculations
 *
 * LOTD provides a 1.01x multiplier to drop rates in RS3
 * This means the drop rate denominator is divided by 1.01
 *
 * Example:
 * - Base rate: 1/128
 * - With LOTD: 1/(128/1.01) = 1/126.73
 */

import { calculateCumulativeProbability, findMilestoneAttempts } from './dropRate';
import { calculateCumulativeProbabilityWithBLM, getDropRateForKill } from './badLuckMitigation';

/**
 * Luck of the Dwarves multiplier constant
 */
export const LOTD_MULTIPLIER = 1.01;

/**
 * Apply Luck of the Dwarves to a drop rate
 * @param baseDenominator - Base drop rate denominator (e.g., 128 for 1/128)
 * @returns Improved drop rate denominator with LOTD
 * @example
 * applyLuckToDropRate(128) // Returns ~126.73 (1/126.73 with LOTD)
 */
export function applyLuckToDropRate(baseDenominator: number): number {
  if (baseDenominator <= 0) {
    throw new Error('Base denominator must be positive');
  }
  return baseDenominator / LOTD_MULTIPLIER;
}

/**
 * Calculate cumulative probability with Luck of the Dwarves
 * @param attempts - Number of attempts/kills
 * @param baseDenominator - Base drop rate denominator
 * @returns Cumulative probability with LOTD
 */
export function calculateCumulativeProbabilityWithLuck(
  attempts: number,
  baseDenominator: number,
): number {
  const improvedDenominator = applyLuckToDropRate(baseDenominator);
  return calculateCumulativeProbability(attempts, improvedDenominator);
}

/**
 * Find milestone attempts with Luck of the Dwarves
 * @param targetProbability - Target probability (0-1)
 * @param baseDenominator - Base drop rate denominator
 * @returns Number of attempts needed with LOTD
 */
export function findMilestoneAttemptsWithLuck(
  targetProbability: number,
  baseDenominator: number,
): number {
  const improvedDenominator = applyLuckToDropRate(baseDenominator);
  return findMilestoneAttempts(targetProbability, improvedDenominator);
}

/**
 * Calculate cumulative probability with BOTH Luck of the Dwarves AND Bad Luck Mitigation
 * This is the most realistic scenario for RS3 players grinding bosses
 *
 * @param attempts - Number of attempts/kills
 * @param baseDenominator - Base drop rate denominator
 * @param mitigationStart - Kill number where mitigation starts
 * @param mitigationCap - Minimum denominator cap
 * @returns Cumulative probability with both LOTD and BLM
 */
export function calculateCumulativeProbabilityWithLuckAndBLM(
  attempts: number,
  baseDenominator: number,
  mitigationStart: number = 10,
  mitigationCap: number = 20,
): number {
  if (attempts < 0) {
    throw new Error('Attempts must be non-negative');
  }
  if (attempts === 0) {
    return 0;
  }

  // Apply LOTD to the base denominator first
  const improvedBaseDenominator = applyLuckToDropRate(baseDenominator);

  // Also apply LOTD to the mitigation cap
  const improvedMitigationCap = applyLuckToDropRate(mitigationCap);

  // Track probability of NOT getting drop yet
  let probabilityOfNoDrop = 1.0;

  // Iterate through each kill
  for (let kill = 1; kill <= attempts; kill++) {
    // Get drop rate for this kill with BLM
    let dropRateDenominator = getDropRateForKill(
      kill,
      improvedBaseDenominator,
      mitigationStart,
      improvedMitigationCap,
    );

    // Probability of not getting drop on this specific kill
    const probNoDropThisKill = 1 - 1 / dropRateDenominator;

    // Update cumulative probability of no drop
    probabilityOfNoDrop *= probNoDropThisKill;
  }

  // Probability of getting at least one drop
  const cumulativeProbability = 1 - probabilityOfNoDrop;

  // Cap at 99.99%
  return Math.min(cumulativeProbability, 0.9999);
}

/**
 * Find milestone attempts with BOTH Luck and Bad Luck Mitigation
 * Uses binary search since the rate varies per kill
 *
 * @param targetProbability - Target probability (0-1)
 * @param baseDenominator - Base drop rate denominator
 * @param mitigationStart - Kill number where mitigation starts
 * @param mitigationCap - Minimum denominator cap
 * @returns Number of attempts needed with LOTD and BLM
 */
export function findMilestoneAttemptsWithLuckAndBLM(
  targetProbability: number,
  baseDenominator: number,
  mitigationStart: number = 10,
  mitigationCap: number = 20,
): number {
  if (targetProbability <= 0 || targetProbability >= 1) {
    throw new Error('Target probability must be between 0 and 1');
  }

  // Binary search for the kill count
  let low = 1;
  let high = baseDenominator * 10;

  while (low < high) {
    const mid = Math.floor((low + high) / 2);
    const prob = calculateCumulativeProbabilityWithLuckAndBLM(
      mid,
      baseDenominator,
      mitigationStart,
      mitigationCap,
    );

    if (prob < targetProbability) {
      low = mid + 1;
    } else {
      high = mid;
    }
  }

  return low;
}

/**
 * Compare all modifier combinations
 * Shows base, with LOTD only, with BLM only, and with both
 *
 * @param attempts - Number of attempts
 * @param baseDenominator - Base drop rate denominator
 * @param mitigationStart - Kill number where mitigation starts
 * @param mitigationCap - Minimum denominator cap
 * @returns Object with all probability combinations
 */
export function compareAllModifiers(
  attempts: number,
  baseDenominator: number,
  mitigationStart: number = 10,
  mitigationCap: number = 20,
): {
  base: number;
  withLuck: number;
  withBLM: number;
  withBoth: number;
  luckSavings: number;
  blmSavings: number;
  bothSavings: number;
} {
  // Calculate all combinations
  const base = calculateCumulativeProbability(attempts, baseDenominator);
  const withLuck = calculateCumulativeProbabilityWithLuck(attempts, baseDenominator);
  const withBLM = calculateCumulativeProbabilityWithBLM(
    attempts,
    baseDenominator,
    mitigationStart,
    mitigationCap,
  );
  const withBoth = calculateCumulativeProbabilityWithLuckAndBLM(
    attempts,
    baseDenominator,
    mitigationStart,
    mitigationCap,
  );

  return {
    base,
    withLuck,
    withBLM,
    withBoth,
    luckSavings: withLuck - base,
    blmSavings: withBLM - base,
    bothSavings: withBoth - base,
  };
}

/**
 * Calculate kills saved by using LOTD to reach target probability
 * @param targetProbability - Target probability (0-1)
 * @param baseDenominator - Base drop rate denominator
 * @returns Number of kills saved by using LOTD
 */
export function calculateKillsSavedWithLuck(
  targetProbability: number,
  baseDenominator: number,
): number {
  const attemptsWithout = findMilestoneAttempts(targetProbability, baseDenominator);
  const attemptsWith = findMilestoneAttemptsWithLuck(targetProbability, baseDenominator);

  return attemptsWithout - attemptsWith;
}

/**
 * Calculate kills saved by using both LOTD and BLM to reach target probability
 * @param targetProbability - Target probability (0-1)
 * @param baseDenominator - Base drop rate denominator
 * @param mitigationStart - Kill number where mitigation starts
 * @param mitigationCap - Minimum denominator cap
 * @returns Number of kills saved by using LOTD and BLM
 */
export function calculateKillsSavedWithBoth(
  targetProbability: number,
  baseDenominator: number,
  mitigationStart: number = 10,
  mitigationCap: number = 20,
): number {
  const attemptsWithout = findMilestoneAttempts(targetProbability, baseDenominator);
  const attemptsWith = findMilestoneAttemptsWithLuckAndBLM(
    targetProbability,
    baseDenominator,
    mitigationStart,
    mitigationCap,
  );

  return attemptsWithout - attemptsWith;
}
