/**
 * BossSelector component
 * Dropdown for selecting RS3 bosses with search functionality
 */

import React, { useState, useMemo } from 'react';
import { Boss } from '@lib/types/boss';
import { getAllBosses } from '@lib/utils/bossData';

interface BossSelectorProps {
  selectedBoss: Boss | null;
  onBossSelect: (boss: Boss | null) => void;
}

/**
 * Group bosses by tier for organized dropdown
 * TODO: Add tier metadata to boss data structure in future
 * For now, using placeholder grouping
 */
function groupBossesByTier(bosses: Boss[]): Record<string, Boss[]> {
  // Placeholder grouping - will be improved when more bosses are added
  const groups: Record<string, Boss[]> = {
    'High-Tier Bosses': [],
    'Other Bosses': [],
  };

  bosses.forEach((boss) => {
    // Simple logic: bosses with combat level > 2000 are "high-tier"
    if (boss.combat_level >= 2000) {
      groups['High-Tier Bosses'].push(boss);
    } else {
      groups['Other Bosses'].push(boss);
    }
  });

  // Remove empty groups
  Object.keys(groups).forEach((key) => {
    if (groups[key].length === 0) {
      delete groups[key];
    }
  });

  return groups;
}

export default function BossSelector({ selectedBoss, onBossSelect }: BossSelectorProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const allBosses = useMemo(() => getAllBosses(), []);

  // Filter bosses based on search term
  const filteredBosses = useMemo(() => {
    if (!searchTerm.trim()) return allBosses;

    const lowerSearch = searchTerm.toLowerCase();
    return allBosses.filter((boss) =>
      boss.boss_name.toLowerCase().includes(lowerSearch),
    );
  }, [allBosses, searchTerm]);

  // Group filtered bosses by tier
  const groupedBosses = useMemo(() => {
    return groupBossesByTier(filteredBosses);
  }, [filteredBosses]);

  const handleBossChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
    const bossId = event.target.value;
    if (!bossId) {
      onBossSelect(null);
      return;
    }

    const boss = allBosses.find((b) => b.boss_id === bossId);
    onBossSelect(boss || null);
  };

  const handleSearchChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(event.target.value);
    // Clear selection when searching
    if (selectedBoss) {
      onBossSelect(null);
    }
  };

  return (
    <div className="space-y-3">
      <div>
        <label htmlFor="boss-search" className="block text-sm font-medium text-slate-300 mb-2">
          Search Boss
        </label>
        <input
          id="boss-search"
          type="text"
          value={searchTerm}
          onChange={handleSearchChange}
          placeholder="Type to search..."
          className="w-full px-4 py-2 bg-slate-800 border border-slate-700 rounded-lg text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-rs3-purple focus:border-transparent"
        />
      </div>

      <div>
        <label htmlFor="boss-select" className="block text-sm font-medium text-slate-300 mb-2">
          Select Boss
        </label>
        <select
          id="boss-select"
          value={selectedBoss?.boss_id || ''}
          onChange={handleBossChange}
          className="w-full px-4 py-2 bg-slate-800 border border-slate-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-rs3-purple focus:border-transparent"
        >
          <option value="">-- Select a boss --</option>
          {Object.entries(groupedBosses).map(([tierName, bosses]) => (
            <optgroup key={tierName} label={tierName}>
              {bosses.map((boss) => (
                <option key={boss.boss_id} value={boss.boss_id}>
                  {boss.boss_name} (Level {boss.combat_level})
                </option>
              ))}
            </optgroup>
          ))}
        </select>
      </div>

      {filteredBosses.length === 0 && searchTerm && (
        <p className="text-sm text-slate-400 italic">
          No bosses found matching "{searchTerm}"
        </p>
      )}

      {selectedBoss && (
        <div className="bg-slate-800 rounded-lg p-4 border border-slate-700">
          <h3 className="font-semibold text-white mb-1">{selectedBoss.boss_name}</h3>
          <p className="text-sm text-slate-400">Combat Level: {selectedBoss.combat_level}</p>
          <a
            href={selectedBoss.wiki_url}
            target="_blank"
            rel="noopener noreferrer"
            className="text-sm text-rs3-purple hover:text-rs3-amber transition-colors mt-2 inline-block"
          >
            View on RS Wiki →
          </a>
        </div>
      )}
    </div>
  );
}
