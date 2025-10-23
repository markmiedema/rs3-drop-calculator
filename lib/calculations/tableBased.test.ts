/**
 * Unit tests for table-based drop calculations
 */

import {
  calculateTableHitProbability,
  calculateItemFromTableProbability,
  calculateTableBasedDropRate,
  calculateTableBasedCumulativeProbability,
  findTableBasedMilestoneAttempts,
  getTableBasedDropBreakdown,
} from './tableBased';

describe('calculateTableHitProbability', () => {
  test('calculates Nex table hit rate (6/128)', () => {
    const prob = calculateTableHitProbability(6, 128);
    expect(prob).toBeCloseTo(0.046875);
  });

  test('calculates 50/50 table', () => {
    const prob = calculateTableHitProbability(1, 2);
    expect(prob).toBe(0.5);
  });

  test('calculates guaranteed table (1/1)', () => {
    const prob = calculateTableHitProbability(1, 1);
    expect(prob).toBe(1);
  });

  test('throws error for invalid inputs', () => {
    expect(() => calculateTableHitProbability(0, 128)).toThrow('must be positive');
    expect(() => calculateTableHitProbability(6, 0)).toThrow('must be positive');
    expect(() => calculateTableHitProbability(-1, 128)).toThrow('must be positive');
    expect(() => calculateTableHitProbability(200, 128)).toThrow(
      'cannot be greater than denominator',
    );
  });
});

describe('calculateItemFromTableProbability', () => {
  test('calculates Nex Torva armor piece (2/12)', () => {
    const prob = calculateItemFromTableProbability(2, 12);
    expect(prob).toBeCloseTo(0.16667, 4);
  });

  test('calculates Nex Zaryte bow (5/12)', () => {
    const prob = calculateItemFromTableProbability(5, 12);
    expect(prob).toBeCloseTo(0.41667, 4);
  });

  test('calculates even distribution (1/4)', () => {
    const prob = calculateItemFromTableProbability(1, 4);
    expect(prob).toBe(0.25);
  });

  test('throws error for invalid inputs', () => {
    expect(() => calculateItemFromTableProbability(0, 12)).toThrow('must be positive');
    expect(() => calculateItemFromTableProbability(2, 0)).toThrow('must be positive');
    expect(() => calculateItemFromTableProbability(15, 12)).toThrow(
      'cannot be greater than total weight',
    );
  });
});

describe('calculateTableBasedDropRate', () => {
  test('calculates Nex Torva armor final rate (6/128 * 2/12)', () => {
    // Expected: (128/6) * (12/2) = 21.333 * 6 = 128
    const finalRate = calculateTableBasedDropRate(6, 128, 2, 12);
    expect(finalRate).toBeCloseTo(128, 0);
  });

  test('calculates Nex Zaryte bow final rate (6/128 * 5/12)', () => {
    // Expected: (128/6) * (12/5) = 21.333 * 2.4 = 51.2
    const finalRate = calculateTableBasedDropRate(6, 128, 5, 12);
    expect(finalRate).toBeCloseTo(51.2, 1);
  });

  test('calculates simple example (1/2 table, 1/4 item)', () => {
    // Expected: 2 * 4 = 8
    const finalRate = calculateTableBasedDropRate(1, 2, 1, 4);
    expect(finalRate).toBe(8);
  });

  test('calculates guaranteed item from guaranteed table', () => {
    const finalRate = calculateTableBasedDropRate(1, 1, 1, 1);
    expect(finalRate).toBe(1);
  });

  test('result is always >= max(tableDenominator, totalWeight)', () => {
    // Final rate should never be better than the worse of the two rates
    const finalRate = calculateTableBasedDropRate(6, 128, 2, 12);
    expect(finalRate).toBeGreaterThanOrEqual(128);
  });
});

describe('calculateTableBasedCumulativeProbability', () => {
  test('calculates 0 probability for 0 attempts', () => {
    const prob = calculateTableBasedCumulativeProbability(0, 6, 128, 2, 12);
    expect(prob).toBe(0);
  });

  test('calculates single attempt probability correctly', () => {
    // Single attempt should match (6/128) * (2/12)
    const prob = calculateTableBasedCumulativeProbability(1, 6, 128, 2, 12);
    const expected = (6 / 128) * (2 / 12);
    expect(prob).toBeCloseTo(expected, 6);
  });

  test('calculates cumulative probability for 100 Nex kills (Torva)', () => {
    const prob = calculateTableBasedCumulativeProbability(100, 6, 128, 2, 12);
    // At ~1/128 rate, 100 kills should give ~54% chance
    expect(prob).toBeGreaterThan(0.53);
    expect(prob).toBeLessThan(0.56);
  });

  test('probability increases with more attempts', () => {
    const prob50 = calculateTableBasedCumulativeProbability(50, 6, 128, 2, 12);
    const prob100 = calculateTableBasedCumulativeProbability(100, 6, 128, 2, 12);
    const prob200 = calculateTableBasedCumulativeProbability(200, 6, 128, 2, 12);

    expect(prob100).toBeGreaterThan(prob50);
    expect(prob200).toBeGreaterThan(prob100);
  });
});

describe('findTableBasedMilestoneAttempts', () => {
  test('finds 50% milestone for Nex Torva (~1/128 final rate)', () => {
    const attempts = findTableBasedMilestoneAttempts(0.5, 6, 128, 2, 12);
    // At ~1/128, should need ~89 attempts for 50%
    expect(attempts).toBeGreaterThan(85);
    expect(attempts).toBeLessThan(95);
  });

  test('finds 90% milestone for Nex Torva', () => {
    const attempts = findTableBasedMilestoneAttempts(0.9, 6, 128, 2, 12);
    // Should need significantly more attempts for 90%
    expect(attempts).toBeGreaterThan(250);
    expect(attempts).toBeLessThan(350);
  });

  test('finds 99% milestone for Nex Torva', () => {
    const attempts = findTableBasedMilestoneAttempts(0.99, 6, 128, 2, 12);
    // Should need even more attempts for 99%
    expect(attempts).toBeGreaterThan(500);
    expect(attempts).toBeLessThan(700);
  });

  test('finds 50% milestone for Nex Zaryte bow (~1/51 final rate)', () => {
    const attempts = findTableBasedMilestoneAttempts(0.5, 6, 128, 5, 12);
    // At ~1/51, should need ~35 attempts for 50%
    expect(attempts).toBeGreaterThan(30);
    expect(attempts).toBeLessThan(40);
  });
});

describe('getTableBasedDropBreakdown', () => {
  test('provides complete breakdown for Nex Torva armor', () => {
    const breakdown = getTableBasedDropBreakdown(6, 128, 2, 12);

    expect(breakdown.tableChance.numerator).toBe(6);
    expect(breakdown.tableChance.denominator).toBe(128);
    expect(breakdown.tableChance.probability).toBeCloseTo(0.046875);

    expect(breakdown.itemChance.numerator).toBe(2);
    expect(breakdown.itemChance.denominator).toBe(12);
    expect(breakdown.itemChance.probability).toBeCloseTo(0.16667, 4);

    expect(breakdown.finalRate).toBeCloseTo(128, 0);
    expect(breakdown.finalProbability).toBeCloseTo(1 / 128, 6);
  });

  test('provides complete breakdown for Nex Zaryte bow', () => {
    const breakdown = getTableBasedDropBreakdown(6, 128, 5, 12);

    expect(breakdown.tableChance.numerator).toBe(6);
    expect(breakdown.tableChance.denominator).toBe(128);

    expect(breakdown.itemChance.numerator).toBe(5);
    expect(breakdown.itemChance.denominator).toBe(12);

    expect(breakdown.finalRate).toBeCloseTo(51.2, 1);
  });

  test('final probability is inverse of final rate', () => {
    const breakdown = getTableBasedDropBreakdown(6, 128, 2, 12);
    expect(breakdown.finalProbability).toBeCloseTo(1 / breakdown.finalRate, 8);
  });

  test('breakdown probabilities multiply correctly', () => {
    const breakdown = getTableBasedDropBreakdown(6, 128, 2, 12);
    const combinedProb =
      breakdown.tableChance.probability * breakdown.itemChance.probability;
    expect(combinedProb).toBeCloseTo(breakdown.finalProbability, 8);
  });
});
