/**
 * Table-based drop calculations (e.g., Nex, GWD2 bosses)
 * Two-step process: roll to hit table, then roll for specific item
 */

import { calculateCumulativeProbability, findMilestoneAttempts } from './dropRate';

/**
 * Calculate the probability of hitting a unique table
 * @param numerator - Numerator of table chance (e.g., 6 for Nex's 6/128)
 * @param denominator - Denominator of table chance (e.g., 128 for Nex's 6/128)
 * @returns Probability as a decimal (0-1)
 * @example
 * calculateTableHitProbability(6, 128) // 0.046875 (4.6875%)
 */
export function calculateTableHitProbability(
  numerator: number,
  denominator: number,
): number {
  if (numerator <= 0 || denominator <= 0) {
    throw new Error('Numerator and denominator must be positive');
  }
  if (numerator > denominator) {
    throw new Error('Numerator cannot be greater than denominator');
  }
  return numerator / denominator;
}

/**
 * Calculate the probability of getting a specific item from the table
 * @param itemWeight - Weight of the specific item in the table
 * @param totalWeight - Total weight of all items in the table
 * @returns Probability as a decimal (0-1)
 * @example
 * calculateItemFromTableProbability(2, 12) // 0.16667 (16.67%)
 */
export function calculateItemFromTableProbability(
  itemWeight: number,
  totalWeight: number,
): number {
  if (itemWeight <= 0 || totalWeight <= 0) {
    throw new Error('Weights must be positive');
  }
  if (itemWeight > totalWeight) {
    throw new Error('Item weight cannot be greater than total weight');
  }
  return itemWeight / totalWeight;
}

/**
 * Calculate the final drop rate for a table-based item
 * Combines table hit probability and item-from-table probability
 *
 * @param tableNumerator - Numerator of table chance
 * @param tableDenominator - Denominator of table chance
 * @param itemWeight - Weight of specific item
 * @param totalWeight - Total weight of all items
 * @returns Final drop rate in 1/X format (just the X value)
 * @example
 * // Nex Torva helm: 6/128 table, 2/12 item
 * calculateTableBasedDropRate(6, 128, 2, 12) // Returns ~128
 */
export function calculateTableBasedDropRate(
  tableNumerator: number,
  tableDenominator: number,
  itemWeight: number,
  totalWeight: number,
): number {
  const tableProb = calculateTableHitProbability(tableNumerator, tableDenominator);
  const itemProb = calculateItemFromTableProbability(itemWeight, totalWeight);

  // Combined probability: P(hit table AND get item)
  const finalProbability = tableProb * itemProb;

  // Convert to 1/X format
  return 1 / finalProbability;
}

/**
 * Calculate cumulative probability for a table-based drop over N attempts
 * This uses the final combined probability in the standard cumulative formula
 *
 * @param attempts - Number of attempts/kills
 * @param tableNumerator - Numerator of table chance
 * @param tableDenominator - Denominator of table chance
 * @param itemWeight - Weight of specific item
 * @param totalWeight - Total weight of all items
 * @returns Cumulative probability as a decimal (0-1)
 * @example
 * // Probability of getting Torva helm in 100 Nex kills
 * calculateTableBasedCumulativeProbability(100, 6, 128, 2, 12)
 */
export function calculateTableBasedCumulativeProbability(
  attempts: number,
  tableNumerator: number,
  tableDenominator: number,
  itemWeight: number,
  totalWeight: number,
): number {
  const finalDropRate = calculateTableBasedDropRate(
    tableNumerator,
    tableDenominator,
    itemWeight,
    totalWeight,
  );

  return calculateCumulativeProbability(attempts, finalDropRate);
}

/**
 * Find attempts needed for milestone probability on table-based drop
 * @param targetProbability - Target probability (0-1)
 * @param tableNumerator - Numerator of table chance
 * @param tableDenominator - Denominator of table chance
 * @param itemWeight - Weight of specific item
 * @param totalWeight - Total weight of all items
 * @returns Number of attempts needed
 */
export function findTableBasedMilestoneAttempts(
  targetProbability: number,
  tableNumerator: number,
  tableDenominator: number,
  itemWeight: number,
  totalWeight: number,
): number {
  const finalDropRate = calculateTableBasedDropRate(
    tableNumerator,
    tableDenominator,
    itemWeight,
    totalWeight,
  );

  return findMilestoneAttempts(targetProbability, finalDropRate);
}

/**
 * Get detailed breakdown of table-based drop mechanics
 * Useful for the "How This Drop Works" explainer component
 *
 * @param tableNumerator - Numerator of table chance
 * @param tableDenominator - Denominator of table chance
 * @param itemWeight - Weight of specific item
 * @param totalWeight - Total weight of all items
 * @returns Object with breakdown of probabilities and rates
 * @example
 * getTableBasedDropBreakdown(6, 128, 2, 12)
 * // Returns detailed breakdown for Nex Torva helm
 */
export function getTableBasedDropBreakdown(
  tableNumerator: number,
  tableDenominator: number,
  itemWeight: number,
  totalWeight: number,
): {
  tableChance: { numerator: number; denominator: number; probability: number };
  itemChance: { numerator: number; denominator: number; probability: number };
  finalRate: number;
  finalProbability: number;
} {
  const tableProb = calculateTableHitProbability(tableNumerator, tableDenominator);
  const itemProb = calculateItemFromTableProbability(itemWeight, totalWeight);
  const finalRate = calculateTableBasedDropRate(
    tableNumerator,
    tableDenominator,
    itemWeight,
    totalWeight,
  );

  return {
    tableChance: {
      numerator: tableNumerator,
      denominator: tableDenominator,
      probability: tableProb,
    },
    itemChance: {
      numerator: itemWeight,
      denominator: totalWeight,
      probability: itemProb,
    },
    finalRate: finalRate,
    finalProbability: 1 / finalRate,
  };
}
