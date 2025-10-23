/**
 * Utility functions for accessing and manipulating boss data
 */

import type { Boss, BossDatabase, DropItem, DropMechanicType } from '../types/boss';
import bossDatabase from '../data/bosses.json';

/**
 * Get all bosses from the database
 */
export function getAllBosses(): Boss[] {
  return (bossDatabase as BossDatabase).bosses;
}

/**
 * Get a specific boss by ID
 * @param bossId - The unique identifier for the boss
 * @returns The boss object or undefined if not found
 */
export function getBossById(bossId: string): Boss | undefined {
  return getAllBosses().find((boss) => boss.boss_id === bossId);
}

/**
 * Get all drop items for a specific boss
 * Normalizes both table-based and direct drops into a unified DropItem format
 * @param bossId - The unique identifier for the boss
 * @returns Array of DropItem objects
 */
export function getItemsForBoss(bossId: string): DropItem[] {
  const boss = getBossById(bossId);
  if (!boss) return [];

  const items: DropItem[] = [];

  // Handle table-based drops
  if (boss.drop_mechanics.type === 'table_based' && boss.unique_table) {
    boss.unique_table.items.forEach((item) => {
      items.push({
        id: item.item_id,
        name: item.name,
        rate: item.final_rate,
        mechanic_type: DropMechanicType.TABLE_BASED,
        wiki_url: item.wiki_url,
        table_info: {
          table_chance_numerator: boss.unique_table!.numerator,
          table_chance_denominator: boss.unique_table!.base_denominator,
          item_weight: item.table_weight,
          total_weight: item.total_weight,
        },
      });
    });
  }

  // Handle direct drops
  if (boss.drop_mechanics.type === 'direct' && boss.direct_drops) {
    boss.direct_drops.forEach((drop) => {
      items.push({
        id: drop.item_id,
        name: drop.name,
        rate: drop.drop_rate,
        mechanic_type: DropMechanicType.DIRECT,
        wiki_url: drop.wiki_url,
      });
    });
  }

  return items;
}

/**
 * Validate boss data structure
 * Checks for required fields and logical consistency
 * @param boss - The boss object to validate
 * @returns Object with isValid flag and array of error messages
 */
export function validateBossData(boss: Boss): {
  isValid: boolean;
  errors: string[];
} {
  const errors: string[] = [];

  // Check required fields
  if (!boss.boss_id) errors.push('boss_id is required');
  if (!boss.boss_name) errors.push('boss_name is required');
  if (!boss.combat_level || boss.combat_level <= 0) {
    errors.push('combat_level must be a positive number');
  }
  if (!boss.wiki_url) errors.push('wiki_url is required');
  if (!boss.drop_mechanics) errors.push('drop_mechanics is required');

  // Validate drop mechanics configuration
  if (boss.drop_mechanics) {
    if (!boss.drop_mechanics.type) {
      errors.push('drop_mechanics.type is required');
    }

    // Validate bad luck mitigation settings
    if (boss.drop_mechanics.bad_luck_mitigation) {
      if (!boss.drop_mechanics.mitigation_start) {
        errors.push('mitigation_start required when bad_luck_mitigation is true');
      }
      if (!boss.drop_mechanics.mitigation_cap) {
        errors.push('mitigation_cap required when bad_luck_mitigation is true');
      }
    }

    // Validate table-based drops
    if (boss.drop_mechanics.type === 'table_based') {
      if (!boss.unique_table) {
        errors.push('unique_table required for table_based drop type');
      } else {
        if (!boss.unique_table.base_denominator || boss.unique_table.base_denominator <= 0) {
          errors.push('unique_table.base_denominator must be positive');
        }
        if (!boss.unique_table.numerator || boss.unique_table.numerator <= 0) {
          errors.push('unique_table.numerator must be positive');
        }
        if (!boss.unique_table.items || boss.unique_table.items.length === 0) {
          errors.push('unique_table must contain at least one item');
        }

        // Validate each item
        boss.unique_table.items.forEach((item, index) => {
          if (!item.item_id) errors.push(`Item ${index}: item_id is required`);
          if (!item.name) errors.push(`Item ${index}: name is required`);
          if (!item.table_weight || item.table_weight <= 0) {
            errors.push(`Item ${index}: table_weight must be positive`);
          }
          if (!item.total_weight || item.total_weight <= 0) {
            errors.push(`Item ${index}: total_weight must be positive`);
          }
          if (!item.final_rate || item.final_rate <= 0) {
            errors.push(`Item ${index}: final_rate must be positive`);
          }
          if (!item.wiki_url) errors.push(`Item ${index}: wiki_url is required`);
        });
      }
    }

    // Validate direct drops
    if (boss.drop_mechanics.type === 'direct') {
      if (!boss.direct_drops || boss.direct_drops.length === 0) {
        errors.push('direct_drops required for direct drop type');
      } else {
        boss.direct_drops.forEach((drop, index) => {
          if (!drop.item_id) errors.push(`Drop ${index}: item_id is required`);
          if (!drop.name) errors.push(`Drop ${index}: name is required`);
          if (!drop.drop_rate || drop.drop_rate <= 0) {
            errors.push(`Drop ${index}: drop_rate must be positive`);
          }
          if (!drop.wiki_url) errors.push(`Drop ${index}: wiki_url is required`);
        });
      }
    }

    // Validate enrage scaling
    if (boss.drop_mechanics.type === 'enrage_scaling') {
      if (!boss.drop_mechanics.enrage_config) {
        errors.push('enrage_config required for enrage_scaling drop type');
      } else {
        const config = boss.drop_mechanics.enrage_config;
        if (config.min_enrage === undefined) {
          errors.push('enrage_config.min_enrage is required');
        }
        if (config.max_enrage === undefined) {
          errors.push('enrage_config.max_enrage is required');
        }
        if (config.min_enrage >= config.max_enrage) {
          errors.push('enrage_config.min_enrage must be less than max_enrage');
        }
        if (!config.formula_type) {
          errors.push('enrage_config.formula_type is required');
        }
      }
    }
  }

  return {
    isValid: errors.length === 0,
    errors,
  };
}

/**
 * Validate all bosses in the database
 * @returns Object with overall validity and detailed results for each boss
 */
export function validateAllBosses(): {
  isValid: boolean;
  results: Record<string, { isValid: boolean; errors: string[] }>;
} {
  const bosses = getAllBosses();
  const results: Record<string, { isValid: boolean; errors: string[] }> = {};

  bosses.forEach((boss) => {
    results[boss.boss_id] = validateBossData(boss);
  });

  const allValid = Object.values(results).every((result) => result.isValid);

  return {
    isValid: allValid,
    results,
  };
}

/**
 * Get database metadata
 */
export function getDatabaseMetadata() {
  return {
    version: (bossDatabase as BossDatabase).version,
    last_updated: (bossDatabase as BossDatabase).last_updated,
    boss_count: getAllBosses().length,
  };
}
