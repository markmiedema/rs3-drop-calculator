/**
 * MilestoneCards component
 * Displays 50%, 90%, 99% probability milestone cards
 */

import React, { useMemo } from 'react';
import type { Boss, DropItem } from '@lib/types/boss';
import { findMilestoneAttempts } from '@lib/calculations/dropRate';
import {
  findMilestoneAttemptsWithLuck,
  findMilestoneAttemptsWithLuckAndBLM,
} from '@lib/calculations/luck';
import { findMilestoneAttemptsWithBLM } from '@lib/calculations/badLuckMitigation';

interface MilestoneCardsProps {
  boss: Boss;
  item: DropItem;
  luckEnabled: boolean;
  badLuckMitigationEnabled: boolean;
}

interface MilestoneData {
  probability: number;
  label: string;
  description: string;
  baseAttempts: number;
  modifiedAttempts: number;
  savings: number;
  color: string;
}

export default function MilestoneCards({
  boss,
  item,
  luckEnabled,
  badLuckMitigationEnabled,
}: MilestoneCardsProps) {
  const blmApplicable = boss.drop_mechanics.bad_luck_mitigation;
  const luckApplicable = boss.drop_mechanics.luck_applicable;
  const blmStart = boss.drop_mechanics.mitigation_start ?? 10;
  const blmCap = boss.drop_mechanics.mitigation_cap ?? 20;

  // Calculate milestones with memoization
  const milestones = useMemo<MilestoneData[]>(() => {
    const probabilities = [
      {
        prob: 0.5,
        label: '50%',
        description: 'Coin flip odds',
        color: 'bg-blue-500',
      },
      {
        prob: 0.9,
        label: '90%',
        description: 'Pretty likely',
        color: 'bg-yellow-500',
      },
      {
        prob: 0.99,
        label: '99%',
        description: 'Near guaranteed',
        color: 'bg-green-500',
      },
    ];

    return probabilities.map(({ prob, label, description, color }) => {
      // Calculate base attempts (no modifiers)
      const baseAttempts = findMilestoneAttempts(prob, item.rate);

      // Calculate with modifiers
      let modifiedAttempts = baseAttempts;

      if (luckEnabled && luckApplicable && badLuckMitigationEnabled && blmApplicable) {
        // Both modifiers
        modifiedAttempts = findMilestoneAttemptsWithLuckAndBLM(
          prob,
          item.rate,
          blmStart,
          blmCap,
        );
      } else if (luckEnabled && luckApplicable) {
        // Luck only
        modifiedAttempts = findMilestoneAttemptsWithLuck(prob, item.rate);
      } else if (badLuckMitigationEnabled && blmApplicable) {
        // BLM only
        modifiedAttempts = findMilestoneAttemptsWithBLM(
          prob,
          item.rate,
          blmStart,
          blmCap,
        );
      }

      const savings = baseAttempts - modifiedAttempts;

      return {
        probability: prob,
        label,
        description,
        baseAttempts,
        modifiedAttempts,
        savings,
        color,
      };
    });
  }, [item.rate, luckEnabled, badLuckMitigationEnabled, luckApplicable, blmApplicable, blmStart, blmCap]);

  const hasModifiers = (luckEnabled && luckApplicable) || (badLuckMitigationEnabled && blmApplicable);

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
      {milestones.map((milestone) => (
        <div
          key={milestone.label}
          className="bg-slate-800 rounded-lg p-6 border border-slate-700"
        >
          {/* Header */}
          <div className="flex items-center justify-between mb-4">
            <div>
              <h4 className="text-2xl font-bold text-white">{milestone.label}</h4>
              <p className="text-sm text-slate-400">{milestone.description}</p>
            </div>
            <div className={`w-3 h-3 rounded-full ${milestone.color}`} />
          </div>

          {/* Attempts Display */}
          <div className="space-y-3">
            {hasModifiers ? (
              <>
                {/* Show modified attempts prominently */}
                <div>
                  <p className="text-xs text-slate-500 uppercase tracking-wide mb-1">
                    Kills needed
                  </p>
                  <p className="text-3xl font-bold text-white">
                    {milestone.modifiedAttempts.toLocaleString()}
                  </p>
                </div>

                {/* Show savings if any */}
                {milestone.savings > 0 && (
                  <div className="bg-slate-900 rounded p-3 border border-slate-700">
                    <div className="flex items-center justify-between">
                      <span className="text-xs text-slate-400">Without modifiers:</span>
                      <span className="text-sm text-slate-300">
                        {milestone.baseAttempts.toLocaleString()}
                      </span>
                    </div>
                    <div className="flex items-center justify-between mt-1">
                      <span className="text-xs text-rs3-green font-medium">Savings:</span>
                      <span className="text-sm text-rs3-green font-semibold">
                        -{milestone.savings.toLocaleString()}
                      </span>
                    </div>
                  </div>
                )}

                {/* No savings message */}
                {milestone.savings === 0 && (
                  <p className="text-xs text-slate-500 italic">
                    (Modifiers have minimal impact at this probability)
                  </p>
                )}
              </>
            ) : (
              <>
                {/* No modifiers - show base attempts */}
                <div>
                  <p className="text-xs text-slate-500 uppercase tracking-wide mb-1">
                    Kills needed
                  </p>
                  <p className="text-3xl font-bold text-white">
                    {milestone.baseAttempts.toLocaleString()}
                  </p>
                </div>
              </>
            )}
          </div>

          {/* Additional Info */}
          <div className="mt-4 pt-4 border-t border-slate-700">
            <p className="text-xs text-slate-500">
              {milestone.probability * 100}% chance of getting{' '}
              <span className="text-slate-300">{item.name}</span>
            </p>
          </div>
        </div>
      ))}
    </div>
  );
}
