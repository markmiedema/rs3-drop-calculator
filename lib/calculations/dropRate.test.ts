/**
 * Unit tests for drop rate probability calculations
 */

import {
  calculateBaseProbability,
  calculateCumulativeProbability,
  findMilestoneAttempts,
  formatProbability,
  getMilestoneProbabilities,
} from './dropRate';

describe('calculateBaseProbability', () => {
  test('calculates 1/128 correctly', () => {
    expect(calculateBaseProbability(128)).toBeCloseTo(0.0078125);
  });

  test('calculates 1/40 correctly', () => {
    expect(calculateBaseProbability(40)).toBe(0.025);
  });

  test('calculates 1/1 as 100%', () => {
    expect(calculateBaseProbability(1)).toBe(1);
  });

  test('throws error for non-positive drop rate', () => {
    expect(() => calculateBaseProbability(0)).toThrow('Drop rate must be positive');
    expect(() => calculateBaseProbability(-5)).toThrow('Drop rate must be positive');
  });
});

describe('calculateCumulativeProbability', () => {
  test('returns 0 for 0 attempts', () => {
    expect(calculateCumulativeProbability(0, 128)).toBe(0);
  });

  test('calculates single attempt probability correctly', () => {
    expect(calculateCumulativeProbability(1, 128)).toBeCloseTo(0.0078125);
  });

  test('calculates 50% probability correctly for 1/128 drop rate', () => {
    // At 1/128, should need ~89 attempts for 50%
    const prob89 = calculateCumulativeProbability(89, 128);
    expect(prob89).toBeGreaterThan(0.499);
    expect(prob89).toBeLessThan(0.501);
  });

  test('calculates 90% probability correctly for 1/128 drop rate', () => {
    // At 1/128, should need ~295 attempts for 90%
    const prob295 = calculateCumulativeProbability(295, 128);
    expect(prob295).toBeGreaterThan(0.899);
    expect(prob295).toBeLessThan(0.901);
  });

  test('caps probability at 99.99%', () => {
    // Even with an absurd number of attempts, should cap at 99.99%
    const veryHighAttempts = calculateCumulativeProbability(100000, 10);
    expect(veryHighAttempts).toBe(0.9999);
  });

  test('handles very rare drops (1/5000)', () => {
    // 5000 attempts at 1/5000 should give ~63.2%
    const prob = calculateCumulativeProbability(5000, 5000);
    expect(prob).toBeGreaterThan(0.63);
    expect(prob).toBeLessThan(0.64);
  });

  test('throws error for negative attempts', () => {
    expect(() => calculateCumulativeProbability(-1, 128)).toThrow(
      'Attempts must be non-negative',
    );
  });
});

describe('findMilestoneAttempts', () => {
  test('finds 50% milestone for 1/128 drop rate', () => {
    const attempts = findMilestoneAttempts(0.5, 128);
    // Should be ~89 attempts
    expect(attempts).toBe(89);
    // Verify by calculating cumulative probability
    const actualProb = calculateCumulativeProbability(attempts, 128);
    expect(actualProb).toBeGreaterThanOrEqual(0.5);
  });

  test('finds 90% milestone for 1/128 drop rate', () => {
    const attempts = findMilestoneAttempts(0.9, 128);
    // Should be ~295 attempts
    expect(attempts).toBe(295);
    const actualProb = calculateCumulativeProbability(attempts, 128);
    expect(actualProb).toBeGreaterThanOrEqual(0.9);
  });

  test('finds 99% milestone for 1/128 drop rate', () => {
    const attempts = findMilestoneAttempts(0.99, 128);
    // Should be ~589 attempts
    expect(attempts).toBe(589);
    const actualProb = calculateCumulativeProbability(attempts, 128);
    expect(actualProb).toBeGreaterThanOrEqual(0.99);
  });

  test('finds 50% milestone for 1/40 drop rate (Araxxor legs)', () => {
    const attempts = findMilestoneAttempts(0.5, 40);
    // Should be ~28 attempts
    expect(attempts).toBe(28);
    const actualProb = calculateCumulativeProbability(attempts, 40);
    expect(actualProb).toBeGreaterThanOrEqual(0.5);
  });

  test('finds 90% milestone for 1/120 drop rate (Araxxor hilts)', () => {
    const attempts = findMilestoneAttempts(0.9, 120);
    // Should be ~277 attempts
    expect(attempts).toBe(277);
    const actualProb = calculateCumulativeProbability(attempts, 120);
    expect(actualProb).toBeGreaterThanOrEqual(0.9);
  });

  test('handles very common drops (1/10)', () => {
    const attempts = findMilestoneAttempts(0.5, 10);
    expect(attempts).toBe(7);
  });

  test('handles very rare drops (1/5000)', () => {
    const attempts = findMilestoneAttempts(0.5, 5000);
    expect(attempts).toBe(3466);
  });

  test('throws error for invalid target probabilities', () => {
    expect(() => findMilestoneAttempts(0, 128)).toThrow(
      'Target probability must be between 0 and 1',
    );
    expect(() => findMilestoneAttempts(1, 128)).toThrow(
      'Target probability must be between 0 and 1',
    );
    expect(() => findMilestoneAttempts(-0.5, 128)).toThrow(
      'Target probability must be between 0 and 1',
    );
    expect(() => findMilestoneAttempts(1.5, 128)).toThrow(
      'Target probability must be between 0 and 1',
    );
  });

  test('rounds up to ensure target is met', () => {
    const attempts = findMilestoneAttempts(0.5, 128);
    const probAtAttempts = calculateCumulativeProbability(attempts, 128);
    const probAtAttemptsMinus1 = calculateCumulativeProbability(attempts - 1, 128);

    // Probability at returned attempts should meet or exceed target
    expect(probAtAttempts).toBeGreaterThanOrEqual(0.5);
    // Probability at one less attempt should be below target
    expect(probAtAttemptsMinus1).toBeLessThan(0.5);
  });
});

describe('formatProbability', () => {
  test('formats 50% correctly', () => {
    expect(formatProbability(0.5)).toBe('50.00%');
  });

  test('formats with custom decimal places', () => {
    expect(formatProbability(0.123456, 4)).toBe('12.3456%');
    expect(formatProbability(0.123456, 0)).toBe('12%');
  });

  test('formats very small probabilities', () => {
    expect(formatProbability(0.001)).toBe('0.10%');
    expect(formatProbability(0.001, 4)).toBe('0.1000%');
  });

  test('formats 100%', () => {
    expect(formatProbability(1)).toBe('100.00%');
  });

  test('formats 99.99%', () => {
    expect(formatProbability(0.9999)).toBe('99.99%');
  });
});

describe('getMilestoneProbabilities', () => {
  test('calculates all milestones for 1/128 drop rate (Nex table)', () => {
    const milestones = getMilestoneProbabilities(128);
    expect(milestones.fifty).toBe(89);
    expect(milestones.ninety).toBe(295);
    expect(milestones.ninetyNine).toBe(589);
  });

  test('calculates all milestones for 1/40 drop rate (Araxxor legs)', () => {
    const milestones = getMilestoneProbabilities(40);
    expect(milestones.fifty).toBe(28);
    expect(milestones.ninety).toBe(92);
    expect(milestones.ninetyNine).toBe(184);
  });

  test('calculates all milestones for 1/120 drop rate (Araxxor hilts)', () => {
    const milestones = getMilestoneProbabilities(120);
    expect(milestones.fifty).toBe(83);
    expect(milestones.ninety).toBe(277);
    expect(milestones.ninetyNine).toBe(553);
  });

  test('returns consistent results', () => {
    const milestones1 = getMilestoneProbabilities(506);
    const milestones2 = getMilestoneProbabilities(506);
    expect(milestones1).toEqual(milestones2);
  });
});
