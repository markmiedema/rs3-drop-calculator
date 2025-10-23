/**
 * ModifiersPanel component
 * Controls for Luck of the Dwarves, Bad Luck Mitigation, and Enrage
 */

import React, { useState } from 'react';
import { Boss, DropMechanicType } from '@lib/types/boss';

interface ModifiersPanelProps {
  boss: Boss | null;
  luckEnabled: boolean;
  badLuckMitigationEnabled: boolean;
  enrage: number;
  onLuckToggle: (enabled: boolean) => void;
  onBadLuckMitigationToggle: (enabled: boolean) => void;
  onEnrageChange: (enrage: number) => void;
}

export default function ModifiersPanel({
  boss,
  luckEnabled,
  badLuckMitigationEnabled,
  enrage,
  onLuckToggle,
  onBadLuckMitigationToggle,
  onEnrageChange,
}: ModifiersPanelProps) {
  const [showLuckTooltip, setShowLuckTooltip] = useState(false);
  const [showBLMTooltip, setShowBLMTooltip] = useState(false);
  const [showEnrageTooltip, setShowEnrageTooltip] = useState(false);

  // Check if boss supports luck
  const luckApplicable = boss?.drop_mechanics.luck_applicable ?? false;

  // Check if boss has bad luck mitigation
  const blmApplicable = boss?.drop_mechanics.bad_luck_mitigation ?? false;

  // Check if boss has enrage scaling
  const hasEnrageScaling =
    boss?.drop_mechanics.type === DropMechanicType.ENRAGE_SCALING;
  const enrageConfig = boss?.drop_mechanics.enrage_config;

  // If no boss selected, show disabled state
  if (!boss) {
    return (
      <div className="bg-slate-800/50 rounded-lg p-6 border border-slate-700/50">
        <p className="text-slate-500 text-center">
          Select a boss and item to configure modifiers
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <h3 className="text-lg font-semibold text-white">Modifiers</h3>

      {/* Luck of the Dwarves Toggle */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <label htmlFor="luck-toggle" className="text-sm font-medium text-slate-300">
            Luck of the Dwarves
          </label>
          <button
            type="button"
            onMouseEnter={() => setShowLuckTooltip(true)}
            onMouseLeave={() => setShowLuckTooltip(false)}
            className="text-slate-500 hover:text-slate-300"
          >
            <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
              <path
                fillRule="evenodd"
                d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z"
                clipRule="evenodd"
              />
            </svg>
          </button>
        </div>
        <button
          id="luck-toggle"
          onClick={() => onLuckToggle(!luckEnabled)}
          disabled={!luckApplicable}
          className={`
            relative inline-flex h-6 w-11 items-center rounded-full transition-colors
            ${luckEnabled ? 'bg-rs3-amber' : 'bg-slate-700'}
            ${!luckApplicable ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}
          `}
        >
          <span
            className={`
              inline-block h-4 w-4 transform rounded-full bg-white transition-transform
              ${luckEnabled ? 'translate-x-6' : 'translate-x-1'}
            `}
          />
        </button>
      </div>

      {showLuckTooltip && (
        <div className="text-xs text-slate-400 bg-slate-900 p-2 rounded border border-slate-700">
          Provides a 1.01x multiplier to drop rates (1% improvement)
        </div>
      )}

      {!luckApplicable && (
        <p className="text-xs text-slate-500 italic">
          Luck does not affect {boss.boss_name} drops
        </p>
      )}

      {/* Bad Luck Mitigation Toggle */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <label htmlFor="blm-toggle" className="text-sm font-medium text-slate-300">
            Bad Luck Mitigation
          </label>
          <button
            type="button"
            onMouseEnter={() => setShowBLMTooltip(true)}
            onMouseLeave={() => setShowBLMTooltip(false)}
            className="text-slate-500 hover:text-slate-300"
          >
            <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
              <path
                fillRule="evenodd"
                d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z"
                clipRule="evenodd"
              />
            </svg>
          </button>
        </div>
        <button
          id="blm-toggle"
          onClick={() => onBadLuckMitigationToggle(!badLuckMitigationEnabled)}
          disabled={!blmApplicable}
          className={`
            relative inline-flex h-6 w-11 items-center rounded-full transition-colors
            ${badLuckMitigationEnabled ? 'bg-rs3-green' : 'bg-slate-700'}
            ${!blmApplicable ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}
          `}
        >
          <span
            className={`
              inline-block h-4 w-4 transform rounded-full bg-white transition-transform
              ${badLuckMitigationEnabled ? 'translate-x-6' : 'translate-x-1'}
            `}
          />
        </button>
      </div>

      {showBLMTooltip && (
        <div className="text-xs text-slate-400 bg-slate-900 p-2 rounded border border-slate-700">
          Drop rates improve after going dry. Starts at kill 10, caps at 1/20 rate.
        </div>
      )}

      {!blmApplicable && (
        <p className="text-xs text-slate-500 italic">
          Bad luck mitigation not available for {boss.boss_name}
        </p>
      )}

      {/* Enrage Slider (conditional) */}
      {hasEnrageScaling && enrageConfig && (
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <label htmlFor="enrage-slider" className="text-sm font-medium text-slate-300">
                Enrage: {enrage}%
              </label>
              <button
                type="button"
                onMouseEnter={() => setShowEnrageTooltip(true)}
                onMouseLeave={() => setShowEnrageTooltip(false)}
                className="text-slate-500 hover:text-slate-300"
              >
                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                  <path
                    fillRule="evenodd"
                    d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z"
                    clipRule="evenodd"
                  />
                </svg>
              </button>
            </div>
          </div>

          {showEnrageTooltip && (
            <div className="text-xs text-slate-400 bg-slate-900 p-2 rounded border border-slate-700">
              Higher enrage improves drop rates. Exact formula varies by boss.
            </div>
          )}

          <input
            id="enrage-slider"
            type="range"
            min={enrageConfig.min_enrage}
            max={enrageConfig.max_enrage}
            value={enrage}
            onChange={(e) => onEnrageChange(Number(e.target.value))}
            className="w-full h-2 bg-slate-700 rounded-lg appearance-none cursor-pointer accent-rs3-purple"
          />

          <div className="flex justify-between text-xs text-slate-500">
            <span>{enrageConfig.min_enrage}%</span>
            <span>{enrageConfig.max_enrage}%</span>
          </div>
        </div>
      )}

      {/* Active Modifiers Summary */}
      {(luckEnabled || badLuckMitigationEnabled || (hasEnrageScaling && enrage > 0)) && (
        <div className="mt-4 bg-slate-900 rounded-lg p-3 border border-slate-700">
          <p className="text-xs font-medium text-slate-300 mb-2">Active modifiers:</p>
          <ul className="space-y-1 text-xs text-slate-400">
            {luckEnabled && (
              <li className="flex items-center">
                <span className="inline-block w-2 h-2 rounded-full bg-rs3-amber mr-2" />
                Luck of the Dwarves (+1% drop rate)
              </li>
            )}
            {badLuckMitigationEnabled && (
              <li className="flex items-center">
                <span className="inline-block w-2 h-2 rounded-full bg-rs3-green mr-2" />
                Bad Luck Mitigation (improves after 10 kills)
              </li>
            )}
            {hasEnrageScaling && enrage > 0 && (
              <li className="flex items-center">
                <span className="inline-block w-2 h-2 rounded-full bg-rs3-purple mr-2" />
                Enrage: {enrage}%
              </li>
            )}
          </ul>
        </div>
      )}
    </div>
  );
}
