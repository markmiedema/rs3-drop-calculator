/**
 * Unit tests for Luck of the Dwarves calculations
 */

import {
  LOTD_MULTIPLIER,
  applyLuckToDropRate,
  calculateCumulativeProbabilityWithLuck,
  findMilestoneAttemptsWithLuck,
  calculateCumulativeProbabilityWithLuckAndBLM,
  findMilestoneAttemptsWithLuckAndBLM,
  compareAllModifiers,
  calculateKillsSavedWithLuck,
  calculateKillsSavedWithBoth,
} from './luck';

describe('LOTD_MULTIPLIER', () => {
  test('is 1.01', () => {
    expect(LOTD_MULTIPLIER).toBe(1.01);
  });
});

describe('applyLuckToDropRate', () => {
  test('applies 1.01x multiplier to 1/128 rate', () => {
    const improved = applyLuckToDropRate(128);
    expect(improved).toBeCloseTo(126.73, 2);
  });

  test('applies 1.01x multiplier to 1/40 rate', () => {
    const improved = applyLuckToDropRate(40);
    expect(improved).toBeCloseTo(39.60, 2);
  });

  test('applies 1.01x multiplier to 1/506 rate', () => {
    const improved = applyLuckToDropRate(506);
    expect(improved).toBeCloseTo(501.0, 1);
  });

  test('improved rate is always better (lower denominator)', () => {
    const improved = applyLuckToDropRate(128);
    expect(improved).toBeLessThan(128);
  });

  test('throws error for invalid input', () => {
    expect(() => applyLuckToDropRate(0)).toThrow('must be positive');
    expect(() => applyLuckToDropRate(-128)).toThrow('must be positive');
  });
});

describe('calculateCumulativeProbabilityWithLuck', () => {
  test('gives better probability than without luck', () => {
    const withLuck = calculateCumulativeProbabilityWithLuck(100, 128);
    const withoutLuck = 1 - Math.pow(1 - 1 / 128, 100);

    expect(withLuck).toBeGreaterThan(withoutLuck);
  });

  test('improvement is modest (1% better drop rate)', () => {
    const withLuck = calculateCumulativeProbabilityWithLuck(100, 128);
    const withoutLuck = 1 - Math.pow(1 - 1 / 128, 100);
    const improvement = withLuck - withoutLuck;

    // Should be a small but noticeable improvement
    expect(improvement).toBeGreaterThan(0);
    expect(improvement).toBeLessThan(0.02); // Less than 2 percentage points
  });

  test('returns 0 for 0 attempts', () => {
    expect(calculateCumulativeProbabilityWithLuck(0, 128)).toBe(0);
  });

  test('works with different drop rates', () => {
    const prob40 = calculateCumulativeProbabilityWithLuck(50, 40);
    const prob128 = calculateCumulativeProbabilityWithLuck(50, 128);

    // Better base rate should give better probability
    expect(prob40).toBeGreaterThan(prob128);
  });
});

describe('findMilestoneAttemptsWithLuck', () => {
  test('finds 50% milestone with luck (fewer attempts than without)', () => {
    const withLuck = findMilestoneAttemptsWithLuck(0.5, 128);
    const withoutLuck = Math.ceil(Math.log(0.5) / Math.log(1 - 1 / 128));

    expect(withLuck).toBeLessThan(withoutLuck);
  });

  test('finds 90% milestone with luck', () => {
    const attempts = findMilestoneAttemptsWithLuck(0.9, 128);
    const actualProb = calculateCumulativeProbabilityWithLuck(attempts, 128);

    expect(actualProb).toBeGreaterThanOrEqual(0.9);
  });

  test('finds 99% milestone with luck', () => {
    const attempts = findMilestoneAttemptsWithLuck(0.99, 128);
    const actualProb = calculateCumulativeProbabilityWithLuck(attempts, 128);

    expect(actualProb).toBeGreaterThanOrEqual(0.99);
  });

  test('saves a few kills compared to without luck', () => {
    const withLuck = findMilestoneAttemptsWithLuck(0.5, 128);
    const withoutLuck = Math.ceil(Math.log(0.5) / Math.log(1 - 1 / 128));

    const saved = withoutLuck - withLuck;
    expect(saved).toBeGreaterThan(0);
    expect(saved).toBeLessThan(10); // Modest savings for 50% milestone
  });
});

describe('calculateCumulativeProbabilityWithLuckAndBLM', () => {
  test('gives best probability (better than luck-only or BLM-only)', () => {
    const withBoth = calculateCumulativeProbabilityWithLuckAndBLM(100, 128, 10, 20);
    const withLuckOnly = calculateCumulativeProbabilityWithLuck(100, 128);

    expect(withBoth).toBeGreaterThan(withLuckOnly);
  });

  test('returns 0 for 0 attempts', () => {
    expect(calculateCumulativeProbabilityWithLuckAndBLM(0, 128, 10, 20)).toBe(0);
  });

  test('works with different drop rates', () => {
    const prob40 = calculateCumulativeProbabilityWithLuckAndBLM(50, 40, 10, 20);
    const prob128 = calculateCumulativeProbabilityWithLuckAndBLM(50, 128, 10, 20);

    expect(prob40).toBeGreaterThan(prob128);
  });

  test('caps at 99.99%', () => {
    const veryHighAttempts = calculateCumulativeProbabilityWithLuckAndBLM(
      10000,
      128,
      10,
      20,
    );
    expect(veryHighAttempts).toBe(0.9999);
  });

  test('throws error for negative attempts', () => {
    expect(() => calculateCumulativeProbabilityWithLuckAndBLM(-1, 128, 10, 20)).toThrow(
      'must be non-negative',
    );
  });
});

describe('findMilestoneAttemptsWithLuckAndBLM', () => {
  test('finds 50% milestone with both modifiers (best case)', () => {
    const withBoth = findMilestoneAttemptsWithLuckAndBLM(0.5, 128, 10, 20);
    const withLuckOnly = findMilestoneAttemptsWithLuck(0.5, 128);

    // With both should be even better
    expect(withBoth).toBeLessThanOrEqual(withLuckOnly);
  });

  test('finds 90% milestone with both modifiers', () => {
    const attempts = findMilestoneAttemptsWithLuckAndBLM(0.9, 128, 10, 20);
    const actualProb = calculateCumulativeProbabilityWithLuckAndBLM(
      attempts,
      128,
      10,
      20,
    );

    expect(actualProb).toBeGreaterThanOrEqual(0.9);
  });

  test('finds 99% milestone with both modifiers', () => {
    const attempts = findMilestoneAttemptsWithLuckAndBLM(0.99, 128, 10, 20);
    const actualProb = calculateCumulativeProbabilityWithLuckAndBLM(
      attempts,
      128,
      10,
      20,
    );

    expect(actualProb).toBeGreaterThanOrEqual(0.99);
  });

  test('throws error for invalid probabilities', () => {
    expect(() => findMilestoneAttemptsWithLuckAndBLM(0, 128, 10, 20)).toThrow(
      'must be between 0 and 1',
    );
    expect(() => findMilestoneAttemptsWithLuckAndBLM(1, 128, 10, 20)).toThrow(
      'must be between 0 and 1',
    );
  });
});

describe('compareAllModifiers', () => {
  test('shows all four scenarios for 100 kills at 1/128', () => {
    const comparison = compareAllModifiers(100, 128, 10, 20);

    expect(comparison.base).toBeGreaterThan(0);
    expect(comparison.withLuck).toBeGreaterThan(comparison.base);
    expect(comparison.withBLM).toBeGreaterThan(comparison.base);
    expect(comparison.withBoth).toBeGreaterThan(comparison.withBLM);
    expect(comparison.withBoth).toBeGreaterThan(comparison.withLuck);
  });

  test('calculates savings correctly', () => {
    const comparison = compareAllModifiers(100, 128, 10, 20);

    expect(comparison.luckSavings).toBeCloseTo(
      comparison.withLuck - comparison.base,
      6,
    );
    expect(comparison.blmSavings).toBeCloseTo(comparison.withBLM - comparison.base, 6);
    expect(comparison.bothSavings).toBeCloseTo(
      comparison.withBoth - comparison.base,
      6,
    );
  });

  test('bothSavings is greatest improvement', () => {
    const comparison = compareAllModifiers(150, 128, 10, 20);

    expect(comparison.bothSavings).toBeGreaterThan(comparison.luckSavings);
    expect(comparison.bothSavings).toBeGreaterThan(comparison.blmSavings);
  });

  test('all savings are positive for attempts > mitigation start', () => {
    const comparison = compareAllModifiers(50, 128, 10, 20);

    expect(comparison.luckSavings).toBeGreaterThan(0);
    expect(comparison.blmSavings).toBeGreaterThan(0);
    expect(comparison.bothSavings).toBeGreaterThan(0);
  });
});

describe('calculateKillsSavedWithLuck', () => {
  test('saves kills for 50% milestone', () => {
    const saved = calculateKillsSavedWithLuck(0.5, 128);
    expect(saved).toBeGreaterThan(0);
    expect(saved).toBeLessThan(5); // Modest savings
  });

  test('saves kills for 90% milestone', () => {
    const saved = calculateKillsSavedWithLuck(0.9, 128);
    expect(saved).toBeGreaterThan(0);
  });

  test('saves kills for 99% milestone', () => {
    const saved = calculateKillsSavedWithLuck(0.99, 128);
    expect(saved).toBeGreaterThan(0);
  });

  test('savings increase with higher target probability', () => {
    const saved50 = calculateKillsSavedWithLuck(0.5, 128);
    const saved90 = calculateKillsSavedWithLuck(0.9, 128);
    const saved99 = calculateKillsSavedWithLuck(0.99, 128);

    expect(saved90).toBeGreaterThanOrEqual(saved50);
    expect(saved99).toBeGreaterThanOrEqual(saved90);
  });
});

describe('calculateKillsSavedWithBoth', () => {
  test('saves more kills than luck-only', () => {
    const savedWithBoth = calculateKillsSavedWithBoth(0.5, 128, 10, 20);
    const savedWithLuckOnly = calculateKillsSavedWithLuck(0.5, 128);

    expect(savedWithBoth).toBeGreaterThan(savedWithLuckOnly);
  });

  test('saves significant kills for high probabilities', () => {
    const saved99 = calculateKillsSavedWithBoth(0.99, 128, 10, 20);
    expect(saved99).toBeGreaterThan(10); // Should save at least 10 kills
  });

  test('works with different drop rates', () => {
    const saved40 = calculateKillsSavedWithBoth(0.5, 40, 10, 20);
    const saved128 = calculateKillsSavedWithBoth(0.5, 128, 10, 20);

    // Both should save kills
    expect(saved40).toBeGreaterThan(0);
    expect(saved128).toBeGreaterThan(0);
  });
});
