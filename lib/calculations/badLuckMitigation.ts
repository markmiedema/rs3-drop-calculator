/**
 * Bad Luck Mitigation (BLM) calculations for RS3 bosses
 *
 * RS3 implements a pity system where drop rates improve after going dry:
 * - Kills 1-10: Base drop rate (no mitigation)
 * - Kill 11+: Denominator decreases by 1 per kill
 * - Caps at 1/20 (denominator cannot go below 20)
 *
 * Example for 1/128 base rate:
 * - Kills 1-10: 1/128
 * - Kill 11: 1/127
 * - Kill 12: 1/126
 * - ...continues...
 * - Kill 118: 1/20 (capped)
 * - Kill 119+: Still 1/20
 */

/**
 * Calculate the drop rate for a specific kill number with bad luck mitigation
 * @param killNumber - The kill number (1-indexed)
 * @param baseDenominator - Base drop rate denominator (e.g., 128 for 1/128)
 * @param mitigationStart - Kill number where mitigation starts (typically 10)
 * @param mitigationCap - Minimum denominator cap (typically 20 for 1/20)
 * @returns Drop rate denominator for this specific kill
 * @example
 * getDropRateForKill(15, 128, 10, 20) // Returns 124 (1/124 rate)
 * getDropRateForKill(120, 128, 10, 20) // Returns 20 (capped at 1/20)
 */
export function getDropRateForKill(
  killNumber: number,
  baseDenominator: number,
  mitigationStart: number = 10,
  mitigationCap: number = 20,
): number {
  if (killNumber <= 0) {
    throw new Error('Kill number must be positive');
  }
  if (baseDenominator <= 0) {
    throw new Error('Base denominator must be positive');
  }
  if (mitigationCap <= 0) {
    throw new Error('Mitigation cap must be positive');
  }
  if (mitigationStart < 0) {
    throw new Error('Mitigation start must be non-negative');
  }

  // No mitigation before the start threshold
  if (killNumber <= mitigationStart) {
    return baseDenominator;
  }

  // Calculate how many kills past the mitigation start
  const killsPastStart = killNumber - mitigationStart;

  // Reduce denominator by 1 for each kill past start
  const adjustedDenominator = baseDenominator - killsPastStart;

  // Apply cap (cannot go below mitigation cap)
  return Math.max(adjustedDenominator, mitigationCap);
}

/**
 * Calculate cumulative probability with bad luck mitigation
 * This requires kill-by-kill iteration since drop rate changes
 *
 * @param attempts - Total number of attempts/kills
 * @param baseDenominator - Base drop rate denominator
 * @param mitigationStart - Kill number where mitigation starts
 * @param mitigationCap - Minimum denominator cap
 * @returns Cumulative probability as a decimal (0-1)
 * @example
 * calculateCumulativeProbabilityWithBLM(100, 128, 10, 20)
 */
export function calculateCumulativeProbabilityWithBLM(
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

  // Track probability of NOT getting drop yet
  let probabilityOfNoDrop = 1.0;

  // Iterate through each kill
  for (let kill = 1; kill <= attempts; kill++) {
    const dropRateDenominator = getDropRateForKill(
      kill,
      baseDenominator,
      mitigationStart,
      mitigationCap,
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
 * Find the kill number needed to reach a target probability with BLM
 * Uses binary search since we can't use closed-form formula due to varying rates
 *
 * @param targetProbability - Target probability (0-1)
 * @param baseDenominator - Base drop rate denominator
 * @param mitigationStart - Kill number where mitigation starts
 * @param mitigationCap - Minimum denominator cap
 * @returns Number of kills needed
 */
export function findMilestoneAttemptsWithBLM(
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
  let high = baseDenominator * 10; // Conservative upper bound

  while (low < high) {
    const mid = Math.floor((low + high) / 2);
    const prob = calculateCumulativeProbabilityWithBLM(
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
 * Compare drop rates with and without bad luck mitigation
 * Useful for showing the impact of BLM in the UI
 *
 * @param attempts - Number of attempts to compare
 * @param baseDenominator - Base drop rate denominator
 * @param mitigationStart - Kill number where mitigation starts
 * @param mitigationCap - Minimum denominator cap
 * @returns Object with probabilities and improvement stats
 */
export function compareBLMImpact(
  attempts: number,
  baseDenominator: number,
  mitigationStart: number = 10,
  mitigationCap: number = 20,
): {
  withoutBLM: number;
  withBLM: number;
  improvement: number;
  improvementPercent: number;
} {
  // Calculate without BLM (standard cumulative probability)
  const baseProbability = 1 / baseDenominator;
  const withoutBLM = Math.min(
    1 - Math.pow(1 - baseProbability, attempts),
    0.9999,
  );

  // Calculate with BLM
  const withBLM = calculateCumulativeProbabilityWithBLM(
    attempts,
    baseDenominator,
    mitigationStart,
    mitigationCap,
  );

  const improvement = withBLM - withoutBLM;
  const improvementPercent = withoutBLM > 0 ? (improvement / withoutBLM) * 100 : 0;

  return {
    withoutBLM,
    withBLM,
    improvement,
    improvementPercent,
  };
}

/**
 * Get detailed breakdown of drop rates across kill ranges with BLM
 * Useful for visualizing how rates improve
 *
 * @param baseDenominator - Base drop rate denominator
 * @param mitigationStart - Kill number where mitigation starts
 * @param mitigationCap - Minimum denominator cap
 * @param maxKills - Maximum kills to show (default: 200)
 * @returns Array of kill ranges with their drop rates
 */
export function getBLMRateBreakdown(
  baseDenominator: number,
  mitigationStart: number = 10,
  mitigationCap: number = 20,
  maxKills: number = 200,
): Array<{ killRange: string; dropRate: number; denominator: number }> {
  const breakdown: Array<{ killRange: string; dropRate: number; denominator: number }> = [];

  // Initial range (before mitigation)
  if (mitigationStart > 0) {
    breakdown.push({
      killRange: `1-${mitigationStart}`,
      dropRate: baseDenominator,
      denominator: baseDenominator,
    });
  }

  // Find where rate hits cap
  const killsToHitCap = baseDenominator - mitigationCap + mitigationStart;

  // Range where mitigation is improving
  if (killsToHitCap > mitigationStart + 1) {
    const rangeEnd = Math.min(killsToHitCap, maxKills);
    breakdown.push({
      killRange: `${mitigationStart + 1}-${rangeEnd}`,
      dropRate: NaN, // Variable rate
      denominator: NaN, // Decreasing
    });
  }

  // Capped range
  if (maxKills > killsToHitCap) {
    breakdown.push({
      killRange: `${killsToHitCap + 1}+`,
      dropRate: mitigationCap,
      denominator: mitigationCap,
    });
  }

  return breakdown;
}
