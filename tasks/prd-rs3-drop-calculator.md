# Product Requirements Document: RS3 Drop Rate Calculator Rebuild

## Introduction/Overview

The RS3 Drop Rate Calculator is a comprehensive tool for RuneScape 3 players to accurately calculate drop probabilities for boss encounters. The current implementation has limitations in handling RS3's complex drop mechanics (table-based drops, enrage scaling, bad luck mitigation). This rebuild will create a robust, accurate calculator using RS3 Wiki as the authoritative data source, properly implementing all drop rate mechanics used in the game.

**Problem:** Players need accurate drop rate information to make informed decisions about which bosses to farm, how long grinds will take, and whether modifiers like Luck of the Dwarves are worth using. The current tool oversimplifies RS3's complex drop mechanics.

**Goal:** Build a comprehensive, accurate drop rate calculator that handles all RS3 boss drop mechanics correctly and scales to support all major bosses.

## Goals

1. Calculate drop probabilities with 100% accuracy matching RS3 Wiki data
2. Properly implement table-based drop mechanics (roll to hit table, then roll for specific item)
3. Support all major RS3 bosses (50+ bosses) with their unique mechanics
4. Implement enrage scaling for applicable bosses (Telos, Zamorak, Arch-Glacor)
5. Provide clear explanations of how each drop mechanic works
6. Create a scalable architecture that supports future feature additions
7. Maintain excellent UX with intuitive controls and visual feedback

## User Stories

**As a player hunting specific drops:**

- I want to select a boss and see all possible unique drops so I can decide what to farm for
- I want to see accurate probability curves for my target item so I know how long my grind will be
- I want to toggle Luck of the Dwarves and see the actual impact so I can decide if it's worth using

**As a high-level PvMer:**

- I want to adjust Telos enrage and see how my drop rate improves so I can optimize my farming strategy
- I want to understand bad luck mitigation mechanics so I know when my rates improve

**As a collection log completionist:**

- I want to calculate probability of completing an entire boss log so I can plan my time investment
- I want to see which item will likely be my last drop so I can prepare mentally

**As a new PvMer learning the game:**

- I want to understand how table-based drops work (hit table first, then roll item) so I understand the mechanics
- I want to see examples and explanations so I can learn RS3's drop systems
- I want every rate linked to the Wiki so I can verify accuracy

## Functional Requirements

### Core Functionality

1. The system must allow users to select from all major RS3 bosses via dropdown or search
2. The system must display all unique drops for the selected boss with accurate rates
3. The system must allow users to select a specific item they're hunting
4. The system must calculate and display probability curves from 0 to necessary attempts (up to 30,000)
5. The system must show milestone probabilities at 50%, 90%, and 99% confidence levels

### Drop Mechanics Implementation

1. The system must distinguish between table-based drops and direct drops
2. For table-based drops, the system must:
    - Calculate probability of hitting the unique table
    - Calculate probability of getting specific item from that table
    - Show both calculations separately in an explainer section
3. For direct drops, the system must use simple 1/X probability calculations
4. The system must implement RS3's bad luck mitigation:
    - No mitigation for first 10 kills
    - Denominator decreases by 1 per kill after 10 dry kills
    - Caps at 1/20 maximum drop rate
5. The system must implement Luck of the Dwarves (1.01x multiplier) accurately
6. For bosses with enrage mechanics, the system must:
    - Provide an enrage slider/input
    - Calculate drop rate scaling based on enrage
    - Support boss-specific formulas (Telos, Zamorak, Arch-Glacor differ)

### User Interface

1. The system must maintain the current dark theme aesthetic with clean card layouts
2. The system must display a probability graph showing cumulative chance over attempts
3. The system must show different colored lines for:
    - Base drop rate (purple solid)
    - With Luck of Dwarves (amber dashed)
    - With bad luck mitigation (green dashed)
    - With both combined (gradient amber/green dashed)
4. The system must display milestone cards showing attempts needed for 50%, 90%, 99% probability
5. The system must show savings when modifiers are active (e.g., "With Luck: 682 (-6)")
6. The system must include a "How This Drop Works" explainer section showing:
    - Drop mechanic type (table-based vs direct)
    - Table math if applicable
    - Link to RS Wiki source page

### Data Management

1. The system must use RS3 Wiki as the single source of truth for all drop rates
2. The system must store boss and drop data in a structured JSON format
3. The system must include metadata for each boss:
    - Boss name, combat level
    - Drop mechanic type (table_based, direct, enrage_scaling, threshold)
    - Bad luck mitigation parameters (if applicable)
    - Luck applicability
4. The system must include metadata for each drop:
    - Item name
    - Drop rate (final effective rate)
    - Table weights (if table-based)
    - Wiki URL for verification
5. The system must validate that graph probabilities never exceed 99.99%

### Advanced Features (Phase 2+)

1. The system must provide a dry streak analyzer that shows percentile rankings
2. The system must calculate collection log completion probabilities for multiple items
3. The system must allow users to input kill speed and show time estimates
4. The system must support session tracking using browser localStorage
5. The system must allow comparison between different bosses side-by-side

## Non-Goals (Out of Scope)

**Phase 1 Exclusions:**

1. OSRS content (focus exclusively on RS3)
2. Pet drop calculations (complex threshold mechanics - deferred to Phase 3)
3. Skilling boss drops (Croesus - different mechanics)
4. Clue scroll drops
5. Quest-specific boss drops
6. Slayer creature drops (non-boss monsters)
7. Elite Dungeon regular monsters (only final bosses)

**Permanent Exclusions:**

8. Real-time Wiki scraping during user sessions (too slow, cache instead)
9. Account integration/API access
10. Kill tracking from game (no official API)
11. Price calculations (focus on probability, not GP/hr)

## Design Considerations

### Visual Design

- **Theme:** Maintain current dark slate theme (bg-slate-900)
- **Colors:**
    - Purple (`#8b5cf6`) - Base rates
    - Amber (`#fbbf24`) - Luck of Dwarves
    - Green (`#10b981`) - Bad Luck Mitigation
    - Gradient amber→green - Both combined
- **Typography:** Current font stack, clear hierarchy
- **Cards:** Rounded borders, subtle shadows, clear information hierarchy

### Component Structure

```
BossSelector (dropdown with search)
├─ Shows boss name, combat level, icon

ItemSelector (radio/dropdown)
├─ Lists all unique drops with icons
└─ Shows individual drop rates

ModifiersPanel
├─ Luck of Dwarves toggle
├─ Bad Luck Mitigation toggle
└─ Enrage slider (conditional)

DropMechanicExplainer
├─ "How This Drop Works" section
├─ Shows table math if applicable
└─ Link to Wiki source

ProbabilityGraph
└─ Multiple colored lines based on active modifiers

MilestoneCards
└─ 50%, 90%, 99% with modifier comparisons

AdvancedTools (Phase 2+)
├─ Dry Streak Analyzer
├─ Collection Log Calculator
└─ Time Estimator
```

### Responsive Design

- Mobile-friendly layouts
- Collapsible sections on small screens
- Touch-friendly controls
- Readable graphs on all screen sizes

## Technical Considerations

### Data Architecture

**Boss Data Structure:**

```javascript
{
  boss_id: "nex",
  boss_name: "Nex",
  combat_level: 1001,
  wiki_url: "https://runescape.wiki/w/Nex",
  drop_mechanics: {
    type: "table_based",
    bad_luck_mitigation: true,
    mitigation_start: 10,
    mitigation_cap: 20,
    luck_applicable: true
  },
  unique_table: {
    base_denominator: 128,
    numerator: 6, // 6/128 to hit table
    items: [
      {
        item_id: "torva_helm",
        name: "Torva full helm",
        table_weight: 2,
        total_weight: 12,
        final_rate: 506, // (128/6) * (12/2)
        wiki_url: "https://runescape.wiki/w/Torva_full_helm"
      }
    ]
  }
}
```

### Calculation Engine

- Implement proper table-based probability: `P = (1 - (1 - tableChance)^n) * (itemWeight / totalWeight)`
- Bad luck mitigation: Loop through each kill, adjust denominator after kill 10, cap at 20
- Luck multiplier: Apply 1.01x to final drop rate per kill
- Enrage scaling: Boss-specific formulas stored in config

### Data Sourcing Strategy

**Phase 1:** Manual JSON database (5-10 well-documented bosses)
**Phase 2:** Expand to 50+ bosses manually curated
**Phase 3:** Build Wiki scraper for automatic updates

### Performance

- Memoize calculations with useMemo
- Lazy load boss data
- Cache graph data points
- Limit graph calculations to 60 data points max
- Use web workers for intensive calculations (if needed)

### Testing

- Unit tests for probability calculations
- Verify calculations match RS3 Wiki examples
- Test edge cases (very rare drops, enrage scaling)
- Cross-browser testing

## Success Metrics

1. **Accuracy:** 100% of drop rates match RS3 Wiki (verifiable via links)
2. **Coverage:** Support for 50+ RS3 bosses by end of Phase 2
3. **Usage:** Track artifact views/interactions in Claude.ai
4. **User Feedback:** Positive reception in RS3 community (if shared)
5. **Performance:** Graph renders in <500ms for any drop rate
6. **Completeness:** All major boss drop mechanics properly implemented

## Open Questions

1. **Enrage Formula Verification:** Need to confirm exact enrage scaling formulas for Telos, Zamorak, Arch-Glacor - are they linear, exponential, or stepped?
2. **Team Size Impact:** How do we handle bosses where drop rates change based on team size (Nex: AoD, Solak)?
3. **Hard Mode Mechanics:** Should we support HM variants as separate bosses or as a toggle?
4. **Data Update Frequency:** How often should we update drop rates from Wiki? Manual reviews vs automated scraping?
5. **Missing Drop Rates:** How do we handle bosses where Jagex hasn't officially revealed rates? Community estimates? Mark as unconfirmed?
6. **Pet Threshold Formula:** What is the exact formula for pet drops with thresholds? Need to research for Phase 3.
7. **Multiple Drops Per Kill:** How do we handle bosses that can drop multiple uniques in one kill?

---

## Implementation Phases

### Phase 1: Foundation (Priority: Critical)

- Implement proper drop mechanics (table-based, direct, enrage)
- Build 10-15 well-documented bosses
- Create boss/item selector UI
- Implement accurate calculations
- Add drop mechanic explainer
- Link all rates to Wiki sources

### Phase 2: Expansion (Priority: High)

- Add 40+ additional bosses
- Implement dry streak analyzer
- Add collection log calculator
- Build kill speed → time estimator
- Add comparison mode

### Phase 3: Advanced (Priority: Medium)

- Implement pet threshold calculator
- Build Wiki scraper for auto-updates
- Add session tracker with localStorage
- Community contribution system
- Mobile app considerations
