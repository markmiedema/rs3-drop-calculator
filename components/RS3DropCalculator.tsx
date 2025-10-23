/**
 * RS3DropCalculator - Main calculator component container
 * Orchestrates all child components and manages shared state
 */

import { useState } from 'react';
import { Boss, DropItem } from '@lib/types/boss';
import BossSelector from './BossSelector';
import ItemSelector from './ItemSelector';
import ModifiersPanel from './ModifiersPanel';
import ProbabilityGraph from './ProbabilityGraph';
import MilestoneCards from './MilestoneCards';
import DropMechanicExplainer from './DropMechanicExplainer';

export default function RS3DropCalculator() {
  // State management
  const [selectedBoss, setSelectedBoss] = useState<Boss | null>(null);
  const [selectedItem, setSelectedItem] = useState<DropItem | null>(null);
  const [luckEnabled, setLuckEnabled] = useState<boolean>(false);
  const [badLuckMitigationEnabled, setBadLuckMitigationEnabled] = useState<boolean>(true);
  const [enrage, setEnrage] = useState<number>(0);

  // Handle boss selection - reset dependent state
  const handleBossSelect = (boss: Boss | null) => {
    setSelectedBoss(boss);
    setSelectedItem(null); // Clear item when boss changes
    setEnrage(0); // Reset enrage

    // Set default modifier states based on boss
    if (boss) {
      setLuckEnabled(boss.drop_mechanics.luck_applicable);
      setBadLuckMitigationEnabled(boss.drop_mechanics.bad_luck_mitigation);
    }
  };

  return (
    <div className="min-h-screen bg-slate-900 text-white p-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold mb-2">RS3 Drop Rate Calculator</h1>
          <p className="text-slate-400">
            Accurate drop probability calculations for RuneScape 3 bosses
          </p>
        </div>

        {/* Control Panel */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
          {/* Boss Selection */}
          <div className="bg-slate-800 rounded-lg p-6 border border-slate-700">
            <h2 className="text-xl font-semibold mb-4">1. Select Boss</h2>
            <BossSelector selectedBoss={selectedBoss} onBossSelect={handleBossSelect} />
          </div>

          {/* Item Selection */}
          <div className="bg-slate-800 rounded-lg p-6 border border-slate-700">
            <h2 className="text-xl font-semibold mb-4">2. Select Drop</h2>
            <ItemSelector
              boss={selectedBoss}
              selectedItem={selectedItem}
              onItemSelect={setSelectedItem}
            />
          </div>

          {/* Modifiers */}
          <div className="bg-slate-800 rounded-lg p-6 border border-slate-700">
            <h2 className="text-xl font-semibold mb-4">3. Configure Modifiers</h2>
            <ModifiersPanel
              boss={selectedBoss}
              luckEnabled={luckEnabled}
              badLuckMitigationEnabled={badLuckMitigationEnabled}
              enrage={enrage}
              onLuckToggle={setLuckEnabled}
              onBadLuckMitigationToggle={setBadLuckMitigationEnabled}
              onEnrageChange={setEnrage}
            />
          </div>
        </div>

        {/* Results Section - Placeholder for future components */}
        {selectedBoss && selectedItem && (
          <div className="space-y-6">
            {/* Probability Graph */}
            <div className="bg-slate-800 rounded-lg p-6 border border-slate-700">
              <h3 className="text-xl font-semibold mb-4">Probability Graph</h3>
              <ProbabilityGraph
                boss={selectedBoss}
                item={selectedItem}
                luckEnabled={luckEnabled}
                badLuckMitigationEnabled={badLuckMitigationEnabled}
                enrage={enrage}
              />
            </div>

            {/* Milestone Cards */}
            <div className="bg-slate-800 rounded-lg p-6 border border-slate-700">
              <h3 className="text-xl font-semibold mb-4">Milestone Probabilities</h3>
              <MilestoneCards
                boss={selectedBoss}
                item={selectedItem}
                luckEnabled={luckEnabled}
                badLuckMitigationEnabled={badLuckMitigationEnabled}
              />
            </div>

            {/* Drop Mechanic Explainer */}
            <DropMechanicExplainer boss={selectedBoss} item={selectedItem} />

            {/* Debug Info */}
            <details className="bg-slate-800 rounded-lg p-6 border border-slate-700">
              <summary className="cursor-pointer text-slate-400 hover:text-white">
                Debug Information
              </summary>
              <div className="mt-4 text-xs text-slate-400 font-mono space-y-1">
                <p>Boss: {selectedBoss.boss_name} (Level {selectedBoss.combat_level})</p>
                <p>Item: {selectedItem.name}</p>
                <p>Base Rate: 1/{selectedItem.rate.toFixed(0)}</p>
                <p>Mechanic Type: {selectedItem.mechanic_type}</p>
                <p>Luck Enabled: {luckEnabled.toString()}</p>
                <p>BLM Enabled: {badLuckMitigationEnabled.toString()}</p>
                {enrage > 0 && <p>Enrage: {enrage}%</p>}
              </div>
            </details>
          </div>
        )}

        {/* Getting Started Message */}
        {!selectedBoss && (
          <div className="bg-slate-800 rounded-lg p-8 border border-slate-700 text-center">
            <h3 className="text-xl font-semibold mb-2">Get Started</h3>
            <p className="text-slate-400">
              Select a boss from the dropdown above to begin calculating drop probabilities
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
