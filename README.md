# RS3 Drop Rate Calculator

A comprehensive, accurate drop rate probability calculator for RuneScape 3 boss encounters. Built to properly handle RS3's complex drop mechanics including table-based drops, bad luck mitigation, enrage scaling, and the Luck of the Dwarves ring.

![Version](https://img.shields.io/badge/version-1.0.0--alpha-blue)
![License](https://img.shields.io/badge/license-MIT-green)

## 🎯 The Problem

RuneScape 3 has complex drop mechanics that simple calculators don't handle correctly:
- **Table-based drops**: You roll to hit a table first, *then* roll for the specific item
- **Bad luck mitigation**: Drop rates improve after going dry (caps at 1/20)
- **Enrage scaling**: Bosses like Telos have rates that improve with higher enrage
- **Luck items**: Luck of the Dwarves provides a 1.01x multiplier

Most calculators oversimplify these mechanics, leading to inaccurate predictions. This calculator implements them correctly using RS3 Wiki as the authoritative source.

## ✨ Features

### Current (Phase 1)
- ✅ Accurate probability calculations for 10-15 major bosses
- ✅ Proper table-based drop mechanics (Nex, GWD2, etc.)
- ✅ Bad luck mitigation system (RS3 bosses)
- ✅ Luck of the Dwarves support (1.01x multiplier)
- ✅ Visual probability curves showing cumulative chance
- ✅ Milestone cards (50%, 90%, 99% probability)
- ✅ Drop mechanic explainer (how each drop works)
- ✅ All rates linked to RS3 Wiki sources

### Planned (Phase 2)
- 🔄 50+ RS3 bosses with full drop tables
- 🔄 Enrage scaling for Telos, Zamorak, Arch-Glacor
- 🔄 Dry streak analyzer ("you're in X percentile")
- 🔄 Collection log completion calculator
- 🔄 Kill speed → time estimates
- 🔄 Boss comparison mode

### Future (Phase 3)
- 📋 Pet drop calculator with threshold system
- 📋 Session tracker (localStorage)
- 📋 Auto-updating from RS Wiki
- 📋 Community contribution system

## 🚀 Quick Start

### Prerequisites
- Node.js 18+ 
- npm or yarn

### Installation

```bash
# Clone the repository
git clone https://github.com/yourusername/rs3-drop-calculator.git
cd rs3-drop-calculator

# Install dependencies
npm install

# Start development server
npm run dev
```

Visit `http://localhost:3000` to see the calculator in action.

## 🏗️ Project Structure

```
rs3-drop-calculator/
├── components/
│   ├── RS3DropCalculator.tsx      # Main container
│   ├── BossSelector.tsx           # Boss selection dropdown
│   ├── ItemSelector.tsx           # Item selection for chosen boss
│   ├── ModifiersPanel.tsx         # Luck/Mitigation toggles
│   ├── ProbabilityGraph.tsx       # Chart showing probability curves
│   ├── MilestoneCards.tsx         # 50%, 90%, 99% display
│   └── DropMechanicExplainer.tsx  # Explains how drop works
├── lib/
│   ├── types/
│   │   └── boss.ts                # TypeScript interfaces
│   ├── calculations/
│   │   ├── dropRate.ts            # Base probability functions
│   │   ├── tableBased.ts          # Table-based drop logic
│   │   ├── badLuckMitigation.ts   # BLM calculations
│   │   └── enrageScaling.ts       # Enrage formulas
│   ├── data/
│   │   └── bosses.json            # Boss database
│   └── utils/
│       └── graphDataGenerator.ts  # Graph data utilities
├── tasks/
│   ├── prd-rs3-drop-calculator.md      # Product Requirements Doc
│   └── tasks-prd-rs3-drop-calculator.md # Implementation tasks
└── README.md
```

## 📊 How It Works

### Table-Based Drops (Example: Nex)

Nex doesn't have a simple "1/506 for Torva helm" rate. Instead:

1. **First roll**: 6/128 chance (~4.7%) to hit the unique table
2. **Second roll**: IF you hit the table, 2/12 chance (16.7%) for Torva helm
3. **Final rate**: (128/6) × (12/2) = 1/506

The calculator properly implements both rolls and shows you the math.

### Bad Luck Mitigation

RS3 bosses have a pity system:
- Kills 1-10: Base drop rate (e.g., 1/128)
- Kill 11+: Denominator decreases by 1 each dry kill
  - Kill 11: 1/127
  - Kill 12: 1/126
  - ...continues...
  - Kill 118: 1/20 (caps here)

This dramatically reduces extreme dry streaks!

### Example Calculation

For Nex with Luck of Dwarves and Bad Luck Mitigation:
```javascript
// Kill 1-10: Base 6/128 table rate
// Kill 11: 6/127 table rate with 1.01x luck
// Kill 12: 6/126 table rate with 1.01x luck
// ...continues improving until 1/20 cap
```

## 🧪 Running Tests

```bash
# Run all tests
npm test

# Run specific test file
npm test dropRate.test.ts

# Run with coverage
npm test -- --coverage
```

## 🤝 Contributing

Contributions are welcome! Here's how you can help:

### Adding New Bosses
1. Research drop rates on [RS3 Wiki](https://runescape.wiki)
2. Add boss data to `lib/data/bosses.json` following the schema
3. Include Wiki URL references for verification
4. Test calculations match Wiki examples
5. Submit a pull request

### Reporting Issues
- **Incorrect drop rate?** Please include the Wiki link showing the correct rate
- **Bug found?** Describe steps to reproduce
- **Feature request?** Explain the use case

## 📚 Data Sources

All drop rates are sourced from the [RuneScape Wiki](https://runescape.wiki), the community-maintained authoritative source for RS3 information. Every drop rate in this calculator includes a link to its Wiki source for verification.

## 🗺️ Roadmap

**Phase 1 (Current)**: Foundation
- [x] Core calculation engine
- [x] Table-based drops
- [x] Bad luck mitigation
- [x] 10-15 major bosses
- [ ] Unit test coverage

**Phase 2**: Expansion
- [ ] 50+ bosses
- [ ] Enrage scaling
- [ ] Dry streak analyzer
- [ ] Collection log calculator
- [ ] Kill speed estimates

**Phase 3**: Advanced Features
- [ ] Pet threshold system
- [ ] Session tracking
- [ ] Wiki API integration
- [ ] Community contributions

## 📖 Documentation

- [Product Requirements Document](tasks/prd-rs3-drop-calculator.md)
- [Implementation Task List](tasks/tasks-prd-rs3-drop-calculator.md)
- [API Documentation](docs/API.md) *(coming soon)*

## 🛠️ Tech Stack

- **Framework**: React 18
- **Language**: TypeScript
- **Charts**: Recharts
- **Styling**: Tailwind CSS
- **Testing**: Jest + React Testing Library
- **Data Source**: RS3 Wiki

## 📜 License

MIT License - feel free to use this calculator or fork it for your own projects!

## 🙏 Acknowledgments

- **RuneScape Wiki**: For maintaining accurate drop rate information
- **Jagex**: For creating RuneScape and occasionally revealing drop rates
- **RS3 Community**: For testing, feedback, and data verification
- **PvME Discord**: For in-depth boss mechanics documentation

## 📬 Contact

Questions? Suggestions? Found a bug?
- Open an issue on GitHub
- Discussion: [GitHub Discussions](https://github.com/yourusername/rs3-drop-calculator/discussions)

---

**Note**: This calculator is a fan-made tool and is not affiliated with or endorsed by Jagex Ltd. RuneScape is a registered trademark of Jagex Ltd.

*Made with ❤️ for the RS3 community*
