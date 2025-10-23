/**
 * DropMechanicExplainer component
 * Explains how drop mechanics work for the selected item
 */

import { useState } from 'react';
import type { Boss, DropItem, DropMechanicType } from '@lib/types/boss';
import { getTableBasedDropBreakdown } from '@lib/calculations/tableBased';

interface DropMechanicExplainerProps {
  boss: Boss;
  item: DropItem;
}

export default function DropMechanicExplainer({ boss, item }: DropMechanicExplainerProps) {
  const [isExpanded, setIsExpanded] = useState(true);

  // Get mechanic type badge info
  const getMechanicBadge = (type: DropMechanicType): { label: string; color: string } => {
    switch (type) {
      case 'table_based':
        return { label: 'Table-Based Drop', color: 'bg-purple-600' };
      case 'direct':
        return { label: 'Direct Drop', color: 'bg-blue-600' };
      case 'enrage_scaling':
        return { label: 'Enrage Scaling', color: 'bg-orange-600' };
      case 'threshold':
        return { label: 'Threshold Drop', color: 'bg-green-600' };
      default:
        return { label: 'Unknown', color: 'bg-gray-600' };
    }
  };

  const mechanicBadge = getMechanicBadge(item.mechanic_type);

  // Render table-based drop explanation
  const renderTableBasedExplanation = () => {
    if (!item.table_info) return null;

    const breakdown = getTableBasedDropBreakdown(
      item.table_info.table_chance_numerator,
      item.table_info.table_chance_denominator,
      item.table_info.item_weight,
      item.table_info.total_weight,
    );

    return (
      <div className="space-y-4">
        <p className="text-slate-300">
          This is a <span className="font-semibold text-white">two-step drop process</span>:
        </p>

        {/* Step 1: Hit the table */}
        <div className="bg-slate-900 rounded-lg p-4 border border-slate-700">
          <div className="flex items-start">
            <div className="flex-shrink-0 w-8 h-8 bg-rs3-purple rounded-full flex items-center justify-center text-white font-bold mr-3">
              1
            </div>
            <div className="flex-1">
              <h5 className="font-semibold text-white mb-1">Hit the unique table</h5>
              <p className="text-sm text-slate-400 mb-2">
                First, you need to roll onto the unique drop table:
              </p>
              <div className="bg-slate-800 rounded px-3 py-2 font-mono text-sm">
                <span className="text-rs3-amber">
                  {breakdown.tableChance.numerator}/{breakdown.tableChance.denominator}
                </span>
                <span className="text-slate-400"> chance </span>
                <span className="text-slate-500">
                  ({(breakdown.tableChance.probability * 100).toFixed(2)}%)
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Step 2: Get specific item */}
        <div className="bg-slate-900 rounded-lg p-4 border border-slate-700">
          <div className="flex items-start">
            <div className="flex-shrink-0 w-8 h-8 bg-rs3-purple rounded-full flex items-center justify-center text-white font-bold mr-3">
              2
            </div>
            <div className="flex-1">
              <h5 className="font-semibold text-white mb-1">Roll for specific item</h5>
              <p className="text-sm text-slate-400 mb-2">
                <span className="font-semibold">IF</span> you hit the table, then roll for the specific item:
              </p>
              <div className="bg-slate-800 rounded px-3 py-2 font-mono text-sm">
                <span className="text-rs3-amber">
                  {breakdown.itemChance.numerator}/{breakdown.itemChance.denominator}
                </span>
                <span className="text-slate-400"> chance </span>
                <span className="text-slate-500">
                  ({(breakdown.itemChance.probability * 100).toFixed(2)}%)
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Final calculation */}
        <div className="bg-slate-800 rounded-lg p-4 border-2 border-rs3-purple">
          <h5 className="font-semibold text-white mb-2">Final drop rate</h5>
          <p className="text-sm text-slate-400 mb-3">
            Combining both steps:
          </p>
          <div className="bg-slate-900 rounded px-4 py-3 font-mono text-center">
            <div className="text-xs text-slate-500 mb-1">
              ({breakdown.tableChance.denominator}/{breakdown.tableChance.numerator}) × ({breakdown.itemChance.denominator}/{breakdown.itemChance.numerator})
            </div>
            <div className="text-2xl font-bold text-white">
              1/{breakdown.finalRate.toFixed(0)}
            </div>
            <div className="text-xs text-slate-500 mt-1">
              ({(breakdown.finalProbability * 100).toFixed(4)}% per kill)
            </div>
          </div>
        </div>
      </div>
    );
  };

  // Render direct drop explanation
  const renderDirectDropExplanation = () => {
    return (
      <div className="space-y-4">
        <p className="text-slate-300">
          This is a <span className="font-semibold text-white">simple direct drop</span> with a fixed probability.
        </p>

        <div className="bg-slate-800 rounded-lg p-6 border-2 border-blue-600">
          <h5 className="font-semibold text-white mb-2">Drop rate</h5>
          <div className="bg-slate-900 rounded px-4 py-3 font-mono text-center">
            <div className="text-2xl font-bold text-white">
              1/{item.rate.toFixed(0)}
            </div>
            <div className="text-xs text-slate-500 mt-1">
              ({((1 / item.rate) * 100).toFixed(4)}% per kill)
            </div>
          </div>
          <p className="text-sm text-slate-400 mt-3">
            Each kill has an independent {((1 / item.rate) * 100).toFixed(2)}% chance of dropping this item.
          </p>
        </div>
      </div>
    );
  };

  // Render enrage scaling explanation
  const renderEnrageScalingExplanation = () => {
    const enrageConfig = boss.drop_mechanics.enrage_config;

    return (
      <div className="space-y-4">
        <p className="text-slate-300">
          This drop has <span className="font-semibold text-white">enrage scaling</span> - the drop rate improves as you increase enrage.
        </p>

        <div className="bg-slate-800 rounded-lg p-6 border-2 border-orange-600">
          <h5 className="font-semibold text-white mb-2">Base drop rate (0% enrage)</h5>
          <div className="bg-slate-900 rounded px-4 py-3 font-mono text-center mb-4">
            <div className="text-2xl font-bold text-white">
              1/{item.rate.toFixed(0)}
            </div>
          </div>

          {enrageConfig && (
            <>
              <p className="text-sm text-slate-400 mb-2">
                Enrage range: {enrageConfig.min_enrage}% - {enrageConfig.max_enrage}%
              </p>
              <p className="text-sm text-slate-400">
                Higher enrage = better drop rate. Use the enrage slider in the modifiers panel to see the impact.
              </p>
              {enrageConfig.formula_type && (
                <div className="mt-3 p-2 bg-amber-900/20 border border-amber-700/30 rounded text-xs text-amber-300">
                  <span className="font-semibold">Note:</span> This uses the {enrageConfig.formula_type} scaling formula.
                  Exact formula needs RS3 Wiki verification.
                </div>
              )}
            </>
          )}
        </div>
      </div>
    );
  };

  return (
    <div className="bg-slate-900 rounded-lg border border-slate-700">
      {/* Header - Collapsible */}
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className="w-full flex items-center justify-between p-4 hover:bg-slate-800 transition-colors"
      >
        <div className="flex items-center space-x-3">
          <span className="text-lg font-semibold text-white">How This Drop Works</span>
          <span className={`px-2 py-1 rounded text-xs font-medium text-white ${mechanicBadge.color}`}>
            {mechanicBadge.label}
          </span>
        </div>
        <svg
          className={`w-5 h-5 text-slate-400 transition-transform ${isExpanded ? 'rotate-180' : ''}`}
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      {/* Content */}
      {isExpanded && (
        <div className="p-4 pt-0">
          <div className="border-t border-slate-700 pt-4">
            {/* Render appropriate explanation based on mechanic type */}
            {item.mechanic_type === 'table_based' && renderTableBasedExplanation()}
            {item.mechanic_type === 'direct' && renderDirectDropExplanation()}
            {item.mechanic_type === 'enrage_scaling' && renderEnrageScalingExplanation()}

            {/* Wiki Link */}
            <div className="mt-6 pt-4 border-t border-slate-700">
              <a
                href={item.wiki_url}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center space-x-2 text-sm text-rs3-purple hover:text-rs3-amber transition-colors"
              >
                <span>View on RS3 Wiki</span>
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"
                  />
                </svg>
              </a>
              <p className="text-xs text-slate-500 mt-2">
                All drop rates are sourced from the RuneScape Wiki, the community-maintained source of RS3 information.
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
