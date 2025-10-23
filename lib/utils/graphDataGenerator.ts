/**
 * Graph data generator utility
 * Generates optimized data points for probability curves
 */

import { calculateCumulativeProbability } from '../calculations/dropRate';
import {
  calculateCumulativeProbabilityWithLuck,
  calculateCumulativeProbabilityWithLuckAndBLM,
} from '../calculations/luck';
import { calculateCumulativeProbabilityWithBLM } from '../calculations/badLuckMitigation';
import { calculateEnrageScaledDropRate } from '../calculations/enrageScaling';
import type { DropMechanicType, Boss, DropItem } from '../types/boss';

export interface GraphDataPoint {
  attempts: number;
  base: number;
  withLuck?: number;
  withBLM?: number;
  withBoth?: number;
  withEnrage?: number;
}

export interface GraphGeneratorOptions {
  dropRate: number;
  luckEnabled: boolean;
  blmEnabled: boolean;
  enrage: number;
  boss: Boss | null;
  item: DropItem | null;
  maxDataPoints?: number;
}

/**
 * Calculate smart maximum attempts based on drop rate
 * Aims to show enough data to reach ~99% probability
 */
export function calculateSmartMaxAttempts(dropRate: number): number {
  // For 99% probability: n = log(0.01) / log(1 - p)
  const baseProbability = 1 / dropRate;
  const attemptsFor99 = Math.ceil(Math.log(0.01) / Math.log(1 - baseProbability));

  // Add 20% buffer to show the curve leveling off
  const maxAttempts = Math.ceil(attemptsFor99 * 1.2);

  // Ensure reasonable bounds
  return Math.min(Math.max(maxAttempts, 50), 30000);
}

/**
 * Generate evenly-spaced attempt values for graph
 * Uses smart spacing to ensure smooth curves with limited data points
 */
export function generateAttemptValues(
  maxAttempts: number,
  maxDataPoints: number = 60,
): number[] {
  const attempts: number[] = [];

  // Always include 0
  attempts.push(0);

  // Calculate step size
  const step = Math.ceil(maxAttempts / (maxDataPoints - 1));

  // Generate evenly-spaced points
  for (let i = step; i < maxAttempts; i += step) {
    attempts.push(i);
  }

  // Always include the max
  if (attempts[attempts.length - 1] !== maxAttempts) {
    attempts.push(maxAttempts);
  }

  return attempts;
}

/**
 * Generate graph data for base probability (no modifiers)
 */
export function generateBaseData(
  attempts: number[],
  dropRate: number,
): GraphDataPoint[] {
  return attempts.map((attempt) => ({
    attempts: attempt,
    base: calculateCumulativeProbability(attempt, dropRate),
  }));
}

/**
 * Generate complete graph data with all modifier combinations
 */
export function generateGraphData(options: GraphGeneratorOptions): GraphDataPoint[] {
  const {
    dropRate,
    luckEnabled,
    blmEnabled,
    enrage,
    boss,
    item,
    maxDataPoints = 60,
  } = options;

  // Calculate max attempts to display
  const maxAttempts = calculateSmartMaxAttempts(dropRate);

  // Generate attempt values
  const attemptValues = generateAttemptValues(maxAttempts, maxDataPoints);

  // Check if boss supports BLM
  const blmApplicable = boss?.drop_mechanics.bad_luck_mitigation ?? false;
  const blmStart = boss?.drop_mechanics.mitigation_start ?? 10;
  const blmCap = boss?.drop_mechanics.mitigation_cap ?? 20;

  // Check if boss supports luck
  const luckApplicable = boss?.drop_mechanics.luck_applicable ?? false;

  // Check if boss has enrage
  const hasEnrage = boss?.drop_mechanics.type === 'enrage_scaling';

  // Generate data points
  return attemptValues.map((attempt) => {
    const dataPoint: GraphDataPoint = {
      attempts: attempt,
      base: calculateCumulativeProbability(attempt, dropRate),
    };

    // Add luck-only data if enabled and applicable
    if (luckEnabled && luckApplicable) {
      dataPoint.withLuck = calculateCumulativeProbabilityWithLuck(attempt, dropRate);
    }

    // Add BLM-only data if enabled and applicable
    if (blmEnabled && blmApplicable) {
      dataPoint.withBLM = calculateCumulativeProbabilityWithBLM(
        attempt,
        dropRate,
        blmStart,
        blmCap,
      );
    }

    // Add combined luck + BLM if both enabled
    if (luckEnabled && blmEnabled && luckApplicable && blmApplicable) {
      dataPoint.withBoth = calculateCumulativeProbabilityWithLuckAndBLM(
        attempt,
        dropRate,
        blmStart,
        blmCap,
      );
    }

    // Add enrage data if applicable
    // Note: For now, enrage is applied to base rate before other modifiers
    // This is a simplification - actual mechanics may differ
    if (hasEnrage && enrage > 0 && boss && item) {
      const enrageScaledRate = calculateEnrageScaledDropRate(
        boss.drop_mechanics.enrage_config?.formula_type as any,
        enrage,
        dropRate,
      );
      dataPoint.withEnrage = calculateCumulativeProbability(attempt, enrageScaledRate);
    }

    return dataPoint;
  });
}

/**
 * Format probability as percentage for display
 */
export function formatProbabilityPercent(probability: number): string {
  return `${(probability * 100).toFixed(2)}%`;
}

/**
 * Get graph configuration based on active modifiers
 * Returns which lines should be displayed
 */
export function getActiveLines(
  luckEnabled: boolean,
  blmEnabled: boolean,
  luckApplicable: boolean,
  blmApplicable: boolean,
): {
  showBase: boolean;
  showLuck: boolean;
  showBLM: boolean;
  showBoth: boolean;
} {
  const showLuck = luckEnabled && luckApplicable;
  const showBLM = blmEnabled && blmApplicable;
  const showBoth = showLuck && showBLM;

  return {
    showBase: true, // Always show base
    showLuck: showLuck && !showBoth, // Hide if showing combined
    showBLM: showBLM && !showBoth, // Hide if showing combined
    showBoth: showBoth,
  };
}
