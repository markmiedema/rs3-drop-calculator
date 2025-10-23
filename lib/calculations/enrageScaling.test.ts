/**
 * Unit tests for enrage scaling calculations
 *
 * NOTE: These tests use placeholder formulas
 * Tests will need to be updated once exact RS3 Wiki formulas are implemented
 */

import {
  calculateTelosDropRate,
  calculateZamorakDropRate,
  calculateArchGlacorDropRate,
  calculateEnrageScaledDropRate,
  calculateCumulativeProbabilityWithEnrage,
  compareEnrageLevels,
  findEnrageForTargetDropRate,
} from './enrageScaling';

describe('calculateTelosDropRate', () => {
  test('returns base rate at 0% enrage', () => {
    const dropRate = calculateTelosDropRate(0, 1000);
    expect(dropRate).toBe(1000);
  });

  test('improves drop rate at higher enrage', () => {
    const dropRate100 = calculateTelosDropRate(100, 1000);
    const dropRate500 = calculateTelosDropRate(500, 1000);
    const dropRate1000 = calculateTelosDropRate(1000, 1000);

    // Higher enrage should give better (lower denominator) drop rates
    expect(dropRate100).toBeLessThan(1000);
    expect(dropRate500).toBeLessThan(dropRate100);
    expect(dropRate1000).toBeLessThan(dropRate500);
  });

  test('throws error for invalid enrage', () => {
    expect(() => calculateTelosDropRate(-1, 1000)).toThrow(
      'must be between 0 and 4000',
    );
    expect(() => calculateTelosDropRate(5000, 1000)).toThrow(
      'must be between 0 and 4000',
    );
  });

  test('accepts valid enrage range (0-4000)', () => {
    expect(() => calculateTelosDropRate(0, 1000)).not.toThrow();
    expect(() => calculateTelosDropRate(2000, 1000)).not.toThrow();
    expect(() => calculateTelosDropRate(4000, 1000)).not.toThrow();
  });
});

describe('calculateZamorakDropRate', () => {
  test('returns base rate at 0% enrage', () => {
    const dropRate = calculateZamorakDropRate(0, 500);
    expect(dropRate).toBe(500);
  });

  test('improves drop rate at higher enrage', () => {
    const dropRate100 = calculateZamorakDropRate(100, 500);
    const dropRate500 = calculateZamorakDropRate(500, 500);
    const dropRate1000 = calculateZamorakDropRate(1000, 500);

    expect(dropRate100).toBeLessThan(500);
    expect(dropRate500).toBeLessThan(dropRate100);
    expect(dropRate1000).toBeLessThan(dropRate500);
  });

  test('throws error for invalid enrage', () => {
    expect(() => calculateZamorakDropRate(-1, 500)).toThrow(
      'must be between 0 and 4000',
    );
    expect(() => calculateZamorakDropRate(5000, 500)).toThrow(
      'must be between 0 and 4000',
    );
  });
});

describe('calculateArchGlacorDropRate', () => {
  test('returns base rate at 0% enrage', () => {
    const dropRate = calculateArchGlacorDropRate(0, 800);
    expect(dropRate).toBe(800);
  });

  test('improves drop rate at higher enrage', () => {
    const dropRate100 = calculateArchGlacorDropRate(100, 800);
    const dropRate500 = calculateArchGlacorDropRate(500, 800);
    const dropRate1000 = calculateArchGlacorDropRate(1000, 800);

    expect(dropRate100).toBeLessThan(800);
    expect(dropRate500).toBeLessThan(dropRate100);
    expect(dropRate1000).toBeLessThan(dropRate500);
  });

  test('accepts very high enrage (HM can scale infinitely)', () => {
    expect(() => calculateArchGlacorDropRate(10000, 800)).not.toThrow();
  });

  test('throws error for negative enrage', () => {
    expect(() => calculateArchGlacorDropRate(-1, 800)).toThrow('must be non-negative');
  });
});

describe('calculateEnrageScaledDropRate', () => {
  test('routes to correct boss function', () => {
    const telosRate = calculateEnrageScaledDropRate('telos', 500, 1000);
    const zamorakRate = calculateEnrageScaledDropRate('zamorak', 500, 1000);
    const archGlacorRate = calculateEnrageScaledDropRate('arch_glacor', 500, 1000);

    // All should improve the rate
    expect(telosRate).toBeLessThan(1000);
    expect(zamorakRate).toBeLessThan(1000);
    expect(archGlacorRate).toBeLessThan(1000);

    // Different bosses may have different formulas
    // So rates may differ (or may be same with placeholder formulas)
    expect(telosRate).toBeGreaterThan(0);
    expect(zamorakRate).toBeGreaterThan(0);
    expect(archGlacorRate).toBeGreaterThan(0);
  });

  test('throws error for unknown boss', () => {
    expect(() =>
      calculateEnrageScaledDropRate('nex' as any, 100, 1000),
    ).toThrow('Unknown enrage-scaling boss');
  });
});

describe('calculateCumulativeProbabilityWithEnrage', () => {
  test('returns 0 for 0 attempts', () => {
    expect(calculateCumulativeProbabilityWithEnrage(0, 'telos', 500, 1000)).toBe(0);
  });

  test('calculates probability at various enrage levels', () => {
    const prob0 = calculateCumulativeProbabilityWithEnrage(100, 'telos', 0, 1000);
    const prob500 = calculateCumulativeProbabilityWithEnrage(100, 'telos', 500, 1000);
    const prob1000 = calculateCumulativeProbabilityWithEnrage(100, 'telos', 1000, 1000);

    // Higher enrage should give better probability
    expect(prob500).toBeGreaterThan(prob0);
    expect(prob1000).toBeGreaterThan(prob500);
  });

  test('probability increases with more attempts', () => {
    const prob50 = calculateCumulativeProbabilityWithEnrage(50, 'telos', 500, 1000);
    const prob100 = calculateCumulativeProbabilityWithEnrage(100, 'telos', 500, 1000);
    const prob200 = calculateCumulativeProbabilityWithEnrage(200, 'telos', 500, 1000);

    expect(prob100).toBeGreaterThan(prob50);
    expect(prob200).toBeGreaterThan(prob100);
  });

  test('caps at 99.99%', () => {
    const veryHighAttempts = calculateCumulativeProbabilityWithEnrage(
      100000,
      'telos',
      1000,
      100,
    );
    expect(veryHighAttempts).toBe(0.9999);
  });

  test('throws error for negative attempts', () => {
    expect(() =>
      calculateCumulativeProbabilityWithEnrage(-1, 'telos', 500, 1000),
    ).toThrow('must be non-negative');
  });
});

describe('compareEnrageLevels', () => {
  test('compares drop rates at multiple enrage levels', () => {
    const comparison = compareEnrageLevels('telos', 1000, [0, 100, 500, 1000, 2000]);

    expect(comparison).toHaveLength(5);

    // Each entry should have enrage, dropRate, and improvement
    comparison.forEach((entry) => {
      expect(entry).toHaveProperty('enrage');
      expect(entry).toHaveProperty('dropRate');
      expect(entry).toHaveProperty('improvement');
    });

    // Drop rates should decrease (improve) with higher enrage
    expect(comparison[1].dropRate).toBeLessThan(comparison[0].dropRate);
    expect(comparison[2].dropRate).toBeLessThan(comparison[1].dropRate);
    expect(comparison[3].dropRate).toBeLessThan(comparison[2].dropRate);
    expect(comparison[4].dropRate).toBeLessThan(comparison[3].dropRate);
  });

  test('improvement percentage increases with enrage', () => {
    const comparison = compareEnrageLevels('telos', 1000, [0, 500, 1000]);

    expect(comparison[0].improvement).toBe(0); // No improvement at 0% enrage
    expect(comparison[1].improvement).toBeGreaterThan(0);
    expect(comparison[2].improvement).toBeGreaterThan(comparison[1].improvement);
  });

  test('works with different bosses', () => {
    const telosComparison = compareEnrageLevels('telos', 1000, [0, 500, 1000]);
    const zamorakComparison = compareEnrageLevels('zamorak', 1000, [0, 500, 1000]);

    expect(telosComparison).toHaveLength(3);
    expect(zamorakComparison).toHaveLength(3);
  });

  test('rounds drop rates to 2 decimal places', () => {
    const comparison = compareEnrageLevels('telos', 1000, [123]);

    // Drop rate should be rounded
    expect(comparison[0].dropRate).toBe(Math.round(comparison[0].dropRate * 100) / 100);
  });
});

describe('findEnrageForTargetDropRate', () => {
  test('finds enrage level for target drop rate', () => {
    const enrage = findEnrageForTargetDropRate('telos', 1000, 800);

    // Verify the enrage gives approximately the target rate
    const actualRate = calculateEnrageScaledDropRate('telos', enrage, 1000);
    expect(actualRate).toBeCloseTo(800, 0);
  });

  test('returns 0 for target equal to base rate', () => {
    const enrage = findEnrageForTargetDropRate('telos', 1000, 1000);
    expect(enrage).toBeLessThanOrEqual(1); // Should be 0 or very close
  });

  test('finds higher enrage for more aggressive targets', () => {
    const enrage500 = findEnrageForTargetDropRate('telos', 1000, 500);
    const enrage300 = findEnrageForTargetDropRate('telos', 1000, 300);

    // More aggressive target should need higher enrage
    expect(enrage300).toBeGreaterThan(enrage500);
  });

  test('respects max enrage parameter', () => {
    const enrage = findEnrageForTargetDropRate('telos', 1000, 100, 2000);
    expect(enrage).toBeLessThanOrEqual(2000);
  });

  test('throws error for impossible target', () => {
    // Target better than base rate is impossible
    expect(() => findEnrageForTargetDropRate('telos', 1000, 1500)).toThrow(
      'cannot be worse than base rate',
    );
  });
});
