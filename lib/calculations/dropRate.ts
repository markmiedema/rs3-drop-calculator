/**
 * Core probability calculation functions for drop rates
 * All calculations use standard probability theory
 */

/**
 * Maximum probability cap to prevent floating point precision issues
 * Set at 99.99% as per requirements
 */
const MAX_PROBABILITY = 0.9999;

/**
 * Calculate the base probability for a single attempt
 * @param dropRate - Drop rate in 1/X format (just the X value, e.g., 128 for 1/128)
 * @returns Probability as a decimal (0-1)
 * @example
 * calculateBaseProbability(128) // returns 0.0078125 (0.78125%)
 */
export function calculateBaseProbability(dropRate: number): number {
  if (dropRate <= 0) {
    throw new Error('Drop rate must be positive');
  }
  return 1 / dropRate;
}

/**
 * Calculate cumulative probability of getting at least one drop in N attempts
 * Uses the formula: P(at least one) = 1 - P(none) = 1 - (1 - p)^n
 *
 * @param attempts - Number of attempts/kills
 * @param dropRate - Drop rate in 1/X format (just the X value)
 * @returns Cumulative probability as a decimal (0-1), capped at 99.99%
 * @example
 * calculateCumulativeProbability(100, 128) // Probability of getting drop in 100 kills at 1/128
 */
export function calculateCumulativeProbability(
  attempts: number,
  dropRate: number,
): number {
  if (attempts < 0) {
    throw new Error('Attempts must be non-negative');
  }
  if (attempts === 0) {
    return 0;
  }

  const baseProbability = calculateBaseProbability(dropRate);

  // P(at least one drop) = 1 - P(no drops)
  // P(no drops) = (1 - p)^n
  const probabilityOfNone = Math.pow(1 - baseProbability, attempts);
  const cumulativeProbability = 1 - probabilityOfNone;

  // Cap at 99.99% to prevent floating point precision issues
  return Math.min(cumulativeProbability, MAX_PROBABILITY);
}

/**
 * Find the number of attempts needed to reach a target probability
 * Uses logarithmic formula: n = log(1 - target) / log(1 - p)
 *
 * @param targetProbability - Target probability as a decimal (0-1)
 * @param dropRate - Drop rate in 1/X format (just the X value)
 * @returns Number of attempts needed (rounded up to nearest integer)
 * @example
 * findMilestoneAttempts(0.5, 128) // ~89 attempts for 50% probability at 1/128
 */
export function findMilestoneAttempts(
  targetProbability: number,
  dropRate: number,
): number {
  if (targetProbability <= 0 || targetProbability >= 1) {
    throw new Error('Target probability must be between 0 and 1 (exclusive)');
  }

  const baseProbability = calculateBaseProbability(dropRate);

  // For very high target probabilities (> 99.99%), cap to prevent infinity
  const cappedTarget = Math.min(targetProbability, MAX_PROBABILITY);

  // Formula: n = log(1 - target) / log(1 - p)
  // This comes from solving: target = 1 - (1 - p)^n
  const attempts = Math.log(1 - cappedTarget) / Math.log(1 - baseProbability);

  // Round up since you can't do a fractional attempt
  return Math.ceil(attempts);
}

/**
 * Calculate probability as a percentage string with specified decimal places
 * @param probability - Probability as a decimal (0-1)
 * @param decimalPlaces - Number of decimal places (default: 2)
 * @returns Formatted percentage string
 * @example
 * formatProbability(0.5) // "50.00%"
 * formatProbability(0.123456, 4) // "12.3456%"
 */
export function formatProbability(
  probability: number,
  decimalPlaces: number = 2,
): string {
  const percentage = probability * 100;
  return `${percentage.toFixed(decimalPlaces)}%`;
}

/**
 * Get milestone probabilities (50%, 90%, 99%) for a given drop rate
 * @param dropRate - Drop rate in 1/X format (just the X value)
 * @returns Object with attempts needed for each milestone
 * @example
 * getMilestoneProbabilities(128)
 * // Returns: { fifty: 89, ninety: 295, ninetyNine: 589 }
 */
export function getMilestoneProbabilities(dropRate: number): {
  fifty: number;
  ninety: number;
  ninetyNine: number;
} {
  return {
    fifty: findMilestoneAttempts(0.5, dropRate),
    ninety: findMilestoneAttempts(0.9, dropRate),
    ninetyNine: findMilestoneAttempts(0.99, dropRate),
  };
}
