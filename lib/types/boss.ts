/**
 * Type definitions for RS3 Drop Rate Calculator
 * Based on RS3 Wiki drop mechanics
 */

/**
 * Types of drop mechanics used by different RS3 bosses
 */
export enum DropMechanicType {
  /** Standard table-based drops (e.g., Nex, GWD2) - roll to hit table, then roll for item */
  TABLE_BASED = 'table_based',

  /** Direct drop with simple 1/X probability (e.g., Araxxor leg pieces) */
  DIRECT = 'direct',

  /** Drop rate scales with enrage (e.g., Telos, Zamorak, Arch-Glacor) */
  ENRAGE_SCALING = 'enrage_scaling',

  /** Threshold-based drops with cumulative progress (e.g., pets - Phase 3) */
  THRESHOLD = 'threshold',
}

/**
 * Configuration for boss drop mechanics including bad luck mitigation
 */
export interface BossDropMechanics {
  /** Type of drop mechanic this boss uses */
  type: DropMechanicType;

  /** Whether bad luck mitigation applies to this boss */
  bad_luck_mitigation: boolean;

  /** Kill number where bad luck mitigation starts (typically 10) */
  mitigation_start?: number;

  /** Maximum drop rate improvement cap (1/X, typically 20) */
  mitigation_cap?: number;

  /** Whether Luck of the Dwarves affects drop rates */
  luck_applicable: boolean;

  /** Enrage configuration (for ENRAGE_SCALING type) */
  enrage_config?: {
    /** Minimum enrage value */
    min_enrage: number;

    /** Maximum enrage value */
    max_enrage: number;

    /** Formula type for scaling (boss-specific) */
    formula_type: 'telos' | 'zamorak' | 'arch_glacor';
  };
}

/**
 * Represents a single item in a unique drop table
 */
export interface UniqueTableItem {
  /** Unique identifier for the item */
  item_id: string;

  /** Display name of the item */
  name: string;

  /** Weight of this item in the table (numerator) */
  table_weight: number;

  /** Total weight of all items in the table (denominator) */
  total_weight: number;

  /** Final calculated drop rate (1/X format) */
  final_rate: number;

  /** RS3 Wiki URL for this specific item */
  wiki_url: string;
}

/**
 * Configuration for table-based unique drops
 */
export interface UniqueTable {
  /** Denominator for hitting the unique table (e.g., 128 for Nex) */
  base_denominator: number;

  /** Numerator for hitting the unique table (e.g., 6 for Nex = 6/128) */
  numerator: number;

  /** List of all items in the unique table */
  items: UniqueTableItem[];
}

/**
 * Represents a direct drop (not table-based)
 */
export interface DirectDrop {
  /** Unique identifier for the item */
  item_id: string;

  /** Display name of the item */
  name: string;

  /** Drop rate in 1/X format (just the X value) */
  drop_rate: number;

  /** RS3 Wiki URL for this specific item */
  wiki_url: string;
}

/**
 * Complete boss data structure
 */
export interface Boss {
  /** Unique identifier for the boss */
  boss_id: string;

  /** Display name of the boss */
  boss_name: string;

  /** Combat level of the boss */
  combat_level: number;

  /** RS3 Wiki URL for the boss page */
  wiki_url: string;

  /** Drop mechanics configuration */
  drop_mechanics: BossDropMechanics;

  /** Unique table configuration (only for TABLE_BASED type) */
  unique_table?: UniqueTable;

  /** Direct drops list (only for DIRECT type) */
  direct_drops?: DirectDrop[];
}

/**
 * Generic drop item interface for UI components
 * Normalizes both table-based and direct drops for easier handling
 */
export interface DropItem {
  /** Unique identifier */
  id: string;

  /** Display name */
  name: string;

  /** Final drop rate (1/X) */
  rate: number;

  /** Type of drop mechanic */
  mechanic_type: DropMechanicType;

  /** Wiki URL for verification */
  wiki_url: string;

  /** Table information (only for TABLE_BASED items) */
  table_info?: {
    table_chance_numerator: number;
    table_chance_denominator: number;
    item_weight: number;
    total_weight: number;
  };
}

/**
 * Database structure for all bosses
 */
export interface BossDatabase {
  bosses: Boss[];
  version: string;
  last_updated: string;
}
