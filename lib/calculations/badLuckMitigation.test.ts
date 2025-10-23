/**
 * Unit tests for bad luck mitigation calculations
 */

import {
  getDropRateForKill,
  calculateCumulativeProbabilityWithBLM,
  findMilestoneAttemptsWithBLM,
  compareBLMImpact,
  getBLMRateBreakdown,
} from './badLuckMitigation';

describe('getDropRateForKill', () => {
  test('returns base rate for kills 1-10', () => {
    expect(getDropRateForKill(1, 128, 10, 20)).toBe(128);
    expect(getDropRateForKill(5, 128, 10, 20)).toBe(128);
    expect(getDropRateForKill(10, 128, 10, 20)).toBe(128);
  });

  test('reduces denominator after kill 10', () => {
    expect(getDropRateForKill(11, 128, 10, 20)).toBe(127);
    expect(getDropRateForKill(12, 128, 10, 20)).toBe(126);
    expect(getDropRateForKill(15, 128, 10, 20)).toBe(123);
    expect(getDropRateForKill(20, 128, 10, 20)).toBe(118);
  });

  test('caps at mitigation cap (1/20)', () => {
    // Kill 118: 128 - (118 - 10) = 128 - 108 = 20 (at cap)
    expect(getDropRateForKill(118, 128, 10, 20)).toBe(20);
    // Beyond cap should stay at cap
    expect(getDropRateForKill(119, 128, 10, 20)).toBe(20);
    expect(getDropRateForKill(200, 128, 10, 20)).toBe(20);
    expect(getDropRateForKill(1000, 128, 10, 20)).toBe(20);
  });

  test('works with different base rates', () => {
    // Araxxor legs: 1/40
    expect(getDropRateForKill(5, 40, 10, 20)).toBe(40);
    expect(getDropRateForKill(11, 40, 10, 20)).toBe(39);
    expect(getDropRateForKill(30, 40, 10, 20)).toBe(20); // 40 - (30-10) = 20 (capped)
  });

  test('works with custom mitigation start', () => {
    // If mitigation starts at kill 5 instead of 10
    expect(getDropRateForKill(4, 128, 5, 20)).toBe(128);
    expect(getDropRateForKill(5, 128, 5, 20)).toBe(128);
    expect(getDropRateForKill(6, 128, 5, 20)).toBe(127);
  });

  test('works with custom mitigation cap', () => {
    // If cap is 1/10 instead of 1/20
    expect(getDropRateForKill(120, 128, 10, 10)).toBe(10);
  });

  test('throws error for invalid inputs', () => {
    expect(() => getDropRateForKill(0, 128, 10, 20)).toThrow('must be positive');
    expect(() => getDropRateForKill(-5, 128, 10, 20)).toThrow('must be positive');
    expect(() => getDropRateForKill(10, 0, 10, 20)).toThrow('must be positive');
    expect(() => getDropRateForKill(10, 128, 10, 0)).toThrow('must be positive');
  });
});

describe('calculateCumulativeProbabilityWithBLM', () => {
  test('returns 0 for 0 attempts', () => {
    expect(calculateCumulativeProbabilityWithBLM(0, 128, 10, 20)).toBe(0);
  });

  test('calculates probability for kills 1-10 without mitigation', () => {
    // First 10 kills should match standard cumulative probability
    const prob10 = calculateCumulativeProbabilityWithBLM(10, 128, 10, 20);
    const expectedProb = 1 - Math.pow(1 - 1 / 128, 10);
    expect(prob10).toBeCloseTo(expectedProb, 6);
  });

  test('improves probability after kill 10', () => {
    const prob50 = calculateCumulativeProbabilityWithBLM(50, 128, 10, 20);
    const prob100 = calculateCumulativeProbabilityWithBLM(100, 128, 10, 20);
    const prob150 = calculateCumulativeProbabilityWithBLM(150, 128, 10, 20);

    // Probability should increase
    expect(prob100).toBeGreaterThan(prob50);
    expect(prob150).toBeGreaterThan(prob100);
  });

  test('BLM gives better probability than without mitigation', () => {
    const withBLM = calculateCumulativeProbabilityWithBLM(100, 128, 10, 20);
    const withoutBLM = 1 - Math.pow(1 - 1 / 128, 100);

    expect(withBLM).toBeGreaterThan(withoutBLM);
  });

  test('provides significant improvement for long dry streaks', () => {
    // At 200 kills with BLM, should have much better odds than without
    const withBLM = calculateCumulativeProbabilityWithBLM(200, 128, 10, 20);
    const withoutBLM = 1 - Math.pow(1 - 1 / 128, 200);

    const improvement = withBLM - withoutBLM;
    // Should have at least 10 percentage points improvement
    expect(improvement).toBeGreaterThan(0.10);
  });

  test('caps at 99.99%', () => {
    const veryHighAttempts = calculateCumulativeProbabilityWithBLM(10000, 128, 10, 20);
    expect(veryHighAttempts).toBe(0.9999);
  });

  test('works with different drop rates', () => {
    // Araxxor legs: 1/40
    const prob = calculateCumulativeProbabilityWithBLM(50, 40, 10, 20);
    expect(prob).toBeGreaterThan(0);
    expect(prob).toBeLessThan(1);
  });
});

describe('findMilestoneAttemptsWithBLM', () => {
  test('finds 50% milestone with BLM (should be less than without)', () => {
    const attemptsWithBLM = findMilestoneAttemptsWithBLM(0.5, 128, 10, 20);
    const attemptsWithout = Math.ceil(Math.log(0.5) / Math.log(1 - 1 / 128));

    // With BLM should need fewer attempts
    expect(attemptsWithBLM).toBeLessThan(attemptsWithout);
  });

  test('finds 90% milestone with BLM', () => {
    const attempts = findMilestoneAttemptsWithBLM(0.9, 128, 10, 20);
    // Verify the result actually meets the target
    const actualProb = calculateCumulativeProbabilityWithBLM(attempts, 128, 10, 20);
    expect(actualProb).toBeGreaterThanOrEqual(0.9);

    // Verify one less attempt doesn't meet target
    const probMinus1 = calculateCumulativeProbabilityWithBLM(attempts - 1, 128, 10, 20);
    expect(probMinus1).toBeLessThan(0.9);
  });

  test('finds 99% milestone with BLM', () => {
    const attempts = findMilestoneAttemptsWithBLM(0.99, 128, 10, 20);
    const actualProb = calculateCumulativeProbabilityWithBLM(attempts, 128, 10, 20);
    expect(actualProb).toBeGreaterThanOrEqual(0.99);
  });

  test('works with different drop rates', () => {
    const attempts40 = findMilestoneAttemptsWithBLM(0.5, 40, 10, 20);
    const attempts128 = findMilestoneAttemptsWithBLM(0.5, 128, 10, 20);

    // Worse drop rate should need more attempts
    expect(attempts128).toBeGreaterThan(attempts40);
  });

  test('throws error for invalid target probabilities', () => {
    expect(() => findMilestoneAttemptsWithBLM(0, 128, 10, 20)).toThrow(
      'must be between 0 and 1',
    );
    expect(() => findMilestoneAttemptsWithBLM(1, 128, 10, 20)).toThrow(
      'must be between 0 and 1',
    );
    expect(() => findMilestoneAttemptsWithBLM(-0.5, 128, 10, 20)).toThrow(
      'must be between 0 and 1',
    );
    expect(() => findMilestoneAttemptsWithBLM(1.5, 128, 10, 20)).toThrow(
      'must be between 0 and 1',
    );
  });
});

describe('compareBLMImpact', () => {
  test('shows improvement with BLM for 100 kills at 1/128', () => {
    const comparison = compareBLMImpact(100, 128, 10, 20);

    expect(comparison.withBLM).toBeGreaterThan(comparison.withoutBLM);
    expect(comparison.improvement).toBeGreaterThan(0);
    expect(comparison.improvementPercent).toBeGreaterThan(0);
  });

  test('shows significant improvement for long dry streaks', () => {
    const comparison200 = compareBLMImpact(200, 128, 10, 20);

    // Should show substantial improvement at 200 kills
    expect(comparison200.improvementPercent).toBeGreaterThan(10); // At least 10% better
  });

  test('shows minimal improvement for kills before mitigation starts', () => {
    const comparison5 = compareBLMImpact(5, 128, 10, 20);

    // Before mitigation starts, should be essentially the same
    expect(comparison5.improvement).toBeCloseTo(0, 6);
  });

  test('improvement increases with more attempts past mitigation start', () => {
    const comp50 = compareBLMImpact(50, 128, 10, 20);
    const comp100 = compareBLMImpact(100, 128, 10, 20);
    const comp150 = compareBLMImpact(150, 128, 10, 20);

    expect(comp100.improvement).toBeGreaterThan(comp50.improvement);
    expect(comp150.improvement).toBeGreaterThan(comp100.improvement);
  });
});

describe('getBLMRateBreakdown', () => {
  test('provides breakdown for 1/128 drop rate', () => {
    const breakdown = getBLMRateBreakdown(128, 10, 20, 200);

    // Should have at least 2 ranges (before mitigation, after cap)
    expect(breakdown.length).toBeGreaterThanOrEqual(2);

    // First range should be kills 1-10 at base rate
    expect(breakdown[0].killRange).toBe('1-10');
    expect(breakdown[0].dropRate).toBe(128);
  });

  test('shows capped range', () => {
    const breakdown = getBLMRateBreakdown(128, 10, 20, 200);

    // Last range should show the capped rate
    const lastRange = breakdown[breakdown.length - 1];
    expect(lastRange.dropRate).toBe(20);
    expect(lastRange.killRange).toContain('+'); // Should show "X+" format
  });

  test('works with different parameters', () => {
    const breakdown = getBLMRateBreakdown(40, 5, 15, 100);
    expect(breakdown.length).toBeGreaterThan(0);

    // First range should end at mitigation start
    expect(breakdown[0].killRange).toBe('1-5');
    expect(breakdown[0].dropRate).toBe(40);
  });
});
