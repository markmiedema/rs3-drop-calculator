/**
 * ItemSelector component
 * Displays and allows selection of drop items for a chosen boss
 */

import { Boss, DropItem } from '@lib/types/boss';
import { getItemsForBoss } from '@lib/utils/bossData';

interface ItemSelectorProps {
  boss: Boss | null;
  selectedItem: DropItem | null;
  onItemSelect: (item: DropItem | null) => void;
}

export default function ItemSelector({
  boss,
  selectedItem,
  onItemSelect,
}: ItemSelectorProps) {
  // Get all items for the selected boss
  const items = boss ? getItemsForBoss(boss.boss_id) : [];

  // If no boss selected, show disabled state
  if (!boss) {
    return (
      <div className="bg-slate-800/50 rounded-lg p-6 border border-slate-700/50">
        <p className="text-slate-500 text-center">
          Select a boss to view drop items
        </p>
      </div>
    );
  }

  // If boss has no items (shouldn't happen with valid data)
  if (items.length === 0) {
    return (
      <div className="bg-slate-800 rounded-lg p-6 border border-slate-700">
        <p className="text-slate-400 text-center">
          No unique drops found for {boss.boss_name}
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      <label className="block text-sm font-medium text-slate-300 mb-2">
        Select Drop Item
      </label>

      <div className="space-y-2">
        {items.map((item) => {
          const isSelected = selectedItem?.id === item.id;

          return (
            <button
              key={item.id}
              onClick={() => onItemSelect(isSelected ? null : item)}
              className={`
                w-full p-4 rounded-lg border-2 text-left transition-all
                ${
                  isSelected
                    ? 'bg-rs3-purple/20 border-rs3-purple text-white'
                    : 'bg-slate-800 border-slate-700 text-slate-300 hover:border-slate-600 hover:bg-slate-750'
                }
              `}
            >
              <div className="flex items-center justify-between">
                <div className="flex-1">
                  <div className="font-medium text-white">{item.name}</div>
                  <div className="text-sm text-slate-400 mt-1">
                    Drop rate: 1/{item.rate.toFixed(0)}
                  </div>
                  {item.table_info && (
                    <div className="text-xs text-slate-500 mt-1">
                      Table-based drop ({item.table_info.table_chance_numerator}/
                      {item.table_info.table_chance_denominator} × {item.table_info.item_weight}/
                      {item.table_info.total_weight})
                    </div>
                  )}
                </div>

                {isSelected && (
                  <div className="ml-4">
                    <svg
                      className="w-6 h-6 text-rs3-purple"
                      fill="currentColor"
                      viewBox="0 0 20 20"
                    >
                      <path
                        fillRule="evenodd"
                        d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                        clipRule="evenodd"
                      />
                    </svg>
                  </div>
                )}
              </div>
            </button>
          );
        })}
      </div>

      {selectedItem && (
        <div className="mt-4 bg-slate-800 rounded-lg p-4 border border-slate-700">
          <div className="flex items-start justify-between">
            <div>
              <h4 className="font-semibold text-white mb-1">Selected: {selectedItem.name}</h4>
              <p className="text-sm text-slate-400">
                Base drop rate: 1/{selectedItem.rate.toFixed(0)}
              </p>
            </div>
            <a
              href={selectedItem.wiki_url}
              target="_blank"
              rel="noopener noreferrer"
              className="text-sm text-rs3-purple hover:text-rs3-amber transition-colors"
            >
              Wiki →
            </a>
          </div>
        </div>
      )}

      <p className="text-xs text-slate-500 mt-2">
        Showing {items.length} unique drop{items.length !== 1 ? 's' : ''} for {boss.boss_name}
      </p>
    </div>
  );
}
