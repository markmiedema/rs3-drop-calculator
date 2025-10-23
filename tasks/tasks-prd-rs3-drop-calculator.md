# RS3 Drop Rate Calculator - Implementation Task List

This task list is derived from the [Product Requirements Document](prd-rs3-drop-calculator.md) and provides a comprehensive roadmap for rebuilding the RS3 Drop Rate Calculator.

## Relevant Files

- `components/RS3DropCalculator.tsx` - Main calculator component container
- `components/BossSelector.tsx` - Dropdown/search component for selecting bosses
- `components/ItemSelector.tsx` - Radio/dropdown component for selecting specific drops
- `components/ModifiersPanel.tsx` - Toggle controls for Luck and Bad Luck Mitigation
- `components/ProbabilityGraph.tsx` - Chart component showing probability curves
- `components/MilestoneCards.tsx` - Cards displaying 50%, 90%, 99% probabilities
- `components/DropMechanicExplainer.tsx` - Component explaining how the drop works
- `lib/types/boss.ts` - TypeScript interfaces for boss and drop data structures
- `lib/calculations/dropRate.ts` - Core probability calculation functions
- `lib/calculations/tableBased.ts` - Table-based drop calculations
- `lib/calculations/badLuckMitigation.ts` - Bad luck mitigation logic
- `lib/calculations/enrageScaling.ts` - Enrage-based drop rate scaling
- `lib/data/bosses.json` - Boss database with all drop information
- `lib/utils/graphDataGenerator.ts` - Utility to generate graph data points
- `lib/calculations/dropRate.test.ts` - Unit tests for drop rate calculations
- `lib/calculations/tableBased.test.ts` - Unit tests for table-based drops
- `lib/calculations/badLuckMitigation.test.ts` - Unit tests for bad luck mitigation

### Notes

- This is a React artifact rebuild, so all components will be functional components using hooks
- Unit tests should validate calculations against known RS3 Wiki examples
- The boss data structure should be easily extensible for future additions
- All calculations should be memoized for performance

## Tasks

- [ ] 1.0 Design and Implement Data Architecture
    - [ ] 1.1 Create TypeScript interfaces for boss data structure (`lib/types/boss.ts`)
        - [ ] 1.1.1 Define `DropMechanicType` enum (table_based, direct, enrage_scaling, threshold)
        - [ ] 1.1.2 Define `BossDropMechanics` interface with mitigation parameters
        - [ ] 1.1.3 Define `UniqueTableItem` interface with table weights
        - [ ] 1.1.4 Define `Boss` interface with all metadata
        - [ ] 1.1.5 Define `DropItem` interface for individual drops
    - [ ] 1.2 Design JSON schema for boss database (`lib/data/bosses.json`)
        - [ ] 1.2.1 Structure for table-based drops (Nex, GWD2)
        - [ ] 1.2.2 Structure for direct drops (Araxxor legs)
        - [ ] 1.2.3 Structure for enrage scaling bosses (Telos, Zamorak)
        - [ ] 1.2.4 Include Wiki URL references for all rates
    - [ ] 1.3 Create utility functions for data access
        - [ ] 1.3.1 Function to get boss by ID
        - [ ] 1.3.2 Function to get all items for a boss
        - [ ] 1.3.3 Function to validate boss data structure
- [ ] 2.0 Build Drop Mechanics Calculation Engine
    - [ ] 2.1 Implement base probability calculations (`lib/calculations/dropRate.ts`)
        - [ ] 2.1.1 Create function for standard 1/X drop rate: `calculateBaseProbability(attempts, dropRate)`
        - [ ] 2.1.2 Create function for cumulative probability: `calculateCumulativeProbability(attempts, dropRate)`
        - [ ] 2.1.3 Create function to find milestone attempts: `findMilestoneAttempts(targetProb, dropRate)`
        - [ ] 2.1.4 Add probability cap at 99.99%
        - [ ] 2.1.5 Write unit tests with known examples
    - [ ] 2.2 Implement table-based drop calculations (`lib/calculations/tableBased.ts`)
        - [ ] 2.2.1 Create function to calculate table hit probability
        - [ ] 2.2.2 Create function to calculate specific item probability from table
        - [ ] 2.2.3 Create combined function: `calculateTableBasedProbability(attempts, tableRate, itemWeight, totalWeight)`
        - [ ] 2.2.4 Validate against Nex drop rates (6/128 table, 2/12 items = 1/506)
        - [ ] 2.2.5 Write unit tests
    - [ ] 2.3 Implement bad luck mitigation (`lib/calculations/badLuckMitigation.ts`)
        - [ ] 2.3.1 Create function to calculate per-kill drop rate with mitigation
        - [ ] 2.3.2 Implement kill-by-kill iteration (no mitigation kills 1-10)
        - [ ] 2.3.3 Implement denominator reduction (decrease by 1 after kill 10)
        - [ ] 2.3.4 Implement 1/20 cap
        - [ ] 2.3.5 Create cumulative probability function with mitigation
        - [ ] 2.3.6 Write unit tests
    - [ ] 2.4 Implement Luck of the Dwarves multiplier
        - [ ] 2.4.1 Add 1.01x multiplier to drop rate functions
        - [ ] 2.4.2 Support combining with bad luck mitigation
        - [ ] 2.4.3 Write unit tests
    - [ ] 2.5 Implement enrage scaling (`lib/calculations/enrageScaling.ts`)
        - [ ] 2.5.1 Research and document Telos enrage formula
        - [ ] 2.5.2 Research and document Zamorak enrage formula
        - [ ] 2.5.3 Research and document Arch-Glacor enrage formula
        - [ ] 2.5.4 Create boss-specific scaling functions
        - [ ] 2.5.5 Write unit tests with known enrage→rate examples
- [ ] 3.0 Create Boss and Item Selection UI Components
    - [ ] 3.1 Build BossSelector component (`components/BossSelector.tsx`)
        - [ ] 3.1.1 Create dropdown with optgroups by tier (High-Tier, GWD1, GWD2, etc.)
        - [ ] 3.1.2 Display boss name and combat level in options
        - [ ] 3.1.3 Add search/filter functionality
        - [ ] 3.1.4 Handle boss selection change event
        - [ ] 3.1.5 Style with current dark theme
    - [ ] 3.2 Build ItemSelector component (`components/ItemSelector.tsx`)
        - [ ] 3.2.1 Create dropdown or radio group for items
        - [ ] 3.2.2 Display item name and drop rate (e.g., "Torva helm (1/506)")
        - [ ] 3.2.3 Show item icons if available
        - [ ] 3.2.4 Handle item selection change event
        - [ ] 3.2.5 Disable/hide when no boss selected
    - [ ] 3.3 Build ModifiersPanel component (`components/ModifiersPanel.tsx`)
        - [ ] 3.3.1 Create toggle button for Luck of Dwarves
        - [ ] 3.3.2 Create toggle button for Bad Luck Mitigation
        - [ ] 3.3.3 Add enrage slider (conditional on boss type)
        - [ ] 3.3.4 Style active states with amber/green colors
        - [ ] 3.3.5 Add tooltips explaining each modifier
    - [ ] 3.4 Create control panel layout combining all selectors
        - [ ] 3.4.1 Boss selector at top
        - [ ] 3.4.2 Item selector below boss
        - [ ] 3.4.3 Modifiers panel as pill buttons
        - [ ] 3.4.4 Maintain gradient card aesthetic from current design
- [ ] 4.0 Implement Probability Graph with Modifiers
    - [ ] 4.1 Build ProbabilityGraph component (`components/ProbabilityGraph.tsx`)
        - [ ] 4.1.1 Import and configure Recharts LineChart
        - [ ] 4.1.2 Create data point generator utility (`lib/utils/graphDataGenerator.ts`)
        - [ ] 4.1.3 Generate base probability line data
        - [ ] 4.1.4 Generate Luck-only line data (conditional)
        - [ ] 4.1.5 Generate Mitigation-only line data (conditional)
        - [ ] 4.1.6 Generate combined (Luck + Mitigation) line data (conditional)
        - [ ] 4.1.7 Apply color scheme: purple (base), amber (luck), green (mitigation), gradient (both)
        - [ ] 4.1.8 Add reference lines at 50%, 90%, 99%
        - [ ] 4.1.9 Configure axes labels and tooltips
        - [ ] 4.1.10 Add legend with padding
    - [ ] 4.2 Optimize graph performance
        - [ ] 4.2.1 Limit to 60 data points using useMemo
        - [ ] 4.2.2 Calculate smart max attempts based on drop rate
        - [ ] 4.2.3 Use appropriate step size for data points
    - [ ] 4.3 Build MilestoneCards component (`components/MilestoneCards.tsx`)
        - [ ] 4.3.1 Create three cards for 50%, 90%, 99%
        - [ ] 4.3.2 Display base attempts prominently
        - [ ] 4.3.3 Show modifier attempts and savings conditionally
        - [ ] 4.3.4 Color code savings (green for reduction)
        - [ ] 4.3.5 Add descriptive labels (coin flip odds, pretty likely, near guaranteed)
- [ ] 5.0 Build Drop Mechanic Explainer Component
    - [ ] 5.1 Create DropMechanicExplainer component (`components/DropMechanicExplainer.tsx`)
        - [ ] 5.1.1 Add "How This Drop Works" header
        - [ ] 5.1.2 Display mechanic type badge (Table-Based, Direct, Enrage Scaling)
        - [ ] 5.1.3 For table-based drops, show the math:
            - [ ] 5.1.3.1 Display "X/Y chance to hit unique table"
            - [ ] 5.1.3.2 Display "IF hit table, A/B chance for specific item"
            - [ ] 5.1.3.3 Display "Final rate: 1/Z"
        - [ ] 5.1.4 For direct drops, show simple 1/X rate
        - [ ] 5.1.5 For enrage scaling, explain how rate improves
        - [ ] 5.1.6 Add Wiki link button with external link icon
        - [ ] 5.1.7 Style as collapsible card
- [ ] 6.0 Populate Initial Boss Database (10-15 bosses)
    - [ ] 6.1 Research and document Nex drop table from RS Wiki
        - [ ] 6.1.1 Verify 6/128 unique table rate
        - [ ] 6.1.2 Document all armor pieces with 2/12 weight each
        - [ ] 6.1.3 Document Zaryte bow rate
        - [ ] 6.1.4 Add Wiki URL references
    - [ ] 6.2 Research and document Araxxor drop tables
        - [ ] 6.2.1 Verify 1/40 for leg pieces (direct drops)
        - [ ] 6.2.2 Verify 1/120 for fang/eye/web
        - [ ] 6.2.3 Add Wiki URL references
    - [ ] 6.3 Research and document Telos with enrage scaling
        - [ ] 6.3.1 Verify base rate at 0% enrage
        - [ ] 6.3.2 Document scaling formula
        - [ ] 6.3.3 Verify rate at 100%, 500%, 1000%
    - [ ] 6.4 Research and document GWD2 bosses (Vindicta, Helwyr, Greg, Twins)
        - [ ] 6.4.1 Verify table-based mechanics
        - [ ] 6.4.2 Document unique rates (1/512 typical)
    - [ ] 6.5 Research and document 5-7 additional bosses
        - [ ] 6.5.1 Queen Black Dragon
        - [ ] 6.5.2 Raksha
        - [ ] 6.5.3 Kerapac
        - [ ] 6.5.4 Arch-Glacor (both modes)
        - [ ] 6.5.5 Zamorak with enrage
        - [ ] 6.5.6 Rasial
    - [ ] 6.6 Format all data into bosses.json following schema
    - [ ] 6.7 Validate JSON structure and rates
- [ ] 7.0 Testing and Validation
    - [ ] 7.1 Write comprehensive unit tests
        - [ ] 7.1.1 Test base probability calculations against known examples
        - [ ] 7.1.2 Test table-based calculations (verify Nex math)
        - [ ] 7.1.3 Test bad luck mitigation iteration
        - [ ] 7.1.4 Test Luck multiplier application
        - [ ] 7.1.5 Test combined modifiers
        - [ ] 7.1.6 Test enrage scaling formulas
    - [ ] 7.2 Validate against RS Wiki examples
        - [ ] 7.2.1 Verify Nex: 1/506 for Torva helm
        - [ ] 7.2.2 Verify Araxxor: 1/40 for leg piece
        - [ ] 7.2.3 Verify Telos: rate at various enrages
        - [ ] 7.2.4 Document any discrepancies
    - [ ] 7.3 Test edge cases
        - [ ] 7.3.1 Very rare drops (1/5000+)
        - [ ] 7.3.2 Very common drops (1/10)
        - [ ] 7.3.3 Maximum attempts (30,000)
        - [ ] 7.3.4 Graph performance with extreme values
    - [ ] 7.4 Cross-browser testing
        - [ ] 7.4.1 Test in Chrome
        - [ ] 7.4.2 Test in Firefox
        - [ ] 7.4.3 Test in Safari
        - [ ] 7.4.4 Test mobile responsiveness
    - [ ] 7.5 User acceptance testing
        - [ ] 7.5.1 Verify all UI components render correctly
        - [ ] 7.5.2 Test all modifier combinations
        - [ ] 7.5.3 Verify graph displays appropriate ranges
        - [ ] 7.5.4 Check Wiki links work correctly
        - [ ] 7.5.5 Validate explainer text is clear

---

## Progress Tracking

Use this section to track overall progress:

- **Phase 1 - Foundation**: Tasks 1.0 - 5.0
- **Phase 1 - Data**: Task 6.0
- **Phase 1 - Testing**: Task 7.0

## Notes

This task list provides a comprehensive roadmap for rebuilding the RS3 Drop Rate Calculator with proper drop mechanics implementation. The tasks are structured to guide development through the entire implementation process, from data architecture to final testing.

All calculations must be validated against RS3 Wiki examples to ensure 100% accuracy.
