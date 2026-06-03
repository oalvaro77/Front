# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Policards 2 is a political trading card game (TCG) inspired by Yu-Gi-Oh mechanics but focused on gaining "public opinion" using real political candidates and ideological narratives. The game is built with React + Vite and uses the React Compiler.

**Core Concept**: Players build decks with 4 candidates and 2 narratives, then battle a CPU opponent across multiple turns. Each turn involves responding to political events, and the winner is determined by who has more public opinion at the end. The game tracks player decisions to detect political tendencies and ideological affinities.

## Development Commands

```bash
# Start development server
npm run dev

# Build for production
vite build

# Preview production build
npm run preview

# Run linter
npm run lint
```

## Architecture

### Game Flow State Management

The entire game state is managed in `App.jsx` using React hooks (no external state management library). The game has 4 main screens:

1. **deck** - Deck selection (izquierda/centro/derecha)
2. **candidates** - Candidate and narrative selection (4 candidates + 2 narratives)
3. **battle** - Main gameplay screen with turn-based combat
4. **end** - Match results and ideology profile analysis

### Core Game Engines (src/game/)

These are the critical modules that implement game mechanics:

**battleEngine.js**
- Resolves turn-based combat between player and CPU cards
- Calculates scores using formula: `influence * 0.4 + debate * 0.3 + credibility * 0.3 - corruption * 0.2`
- Applies modifiers from narratives and events
- Implements rock-paper-scissors ideology advantages: `izquierda > derecha > centro > izquierda`
- Advantage multiplier: 1.2, Disadvantage: 0.85

**cpuEngine.js**
- Simple AI that selects best candidate + narrative combination
- Evaluates all available cards against current event modifiers
- Chooses actions to maximize estimated score

**ideologyEngine.js**
- Analyzes player's choices after match completion
- Generates profile with: dominant ideology, favorite narrative, corruption tolerance, aggression level
- Used for detecting political tendencies based on card selection patterns

### Stat System Mapping

Politician cards use these stats (from `data/candidates.js`):
- `propuestas` → mapped to `influence` (public support)
- `experiencia` → mapped to `debate` (debate skill)
- `escandalos` → mapped to `corruption` (negative stat) and inverted to `credibility` (100 - scandals)

### Card Types

**Candidate Cards** (`data/candidates.js`)
- Real Colombian politicians with ideology types: izquierda, centro, derecha
- Each has stats: propuestas, experiencia, escandalos
- Images stored in `/public/images/`

**Narrative Cards** (`data/narratives.js`)
- Represent political discourses (Orden, Cambio, Anticorrupción, Seguridad, Justicia Social)
- Apply temporary stat modifiers (e.g., `{ debate: +15 }`)

**Event Cards** (`data/events.js`)
- Represent national situations (security crisis, corruption scandal, protests, etc.)
- Provide ideology-specific modifiers (e.g., derecha gets +10 debate during security crisis)
- One random event per turn

### Game Constants

- Initial opinion: 50% for both player and CPU
- Max turns: 4
- Win: +10 opinion, opponent -5
- Loss: -5 opinion, opponent +10
- Cards are locked after use (resource management)

## Project Structure

```
src/
├── components/          # React UI components
│   ├── Board.jsx       # Main battle arena
│   ├── Card.jsx        # Generic card renderer
│   ├── DeckSelector.jsx
│   ├── OpinionBar.jsx
│   ├── EventBanner.jsx
│   └── BattleLog.jsx
├── data/               # Static game data
│   ├── candidates.js   # Politician definitions
│   ├── narratives.js   # Narrative card definitions
│   └── events.js       # Event definitions
├── game/               # Core game logic engines
│   ├── battleEngine.js
│   ├── cpuEngine.js
│   └── ideologyEngine.js
├── services/
│   ├── api.js         # API integration (BASE_URL: https://api.policars.local)
│   └── analyticsService.js
├── store/
│   └── gameStore.js   # Reducer pattern (not currently used in App.jsx)
└── types/             # Type definitions (JSDoc style)
```

## Key Implementation Details

### Turn Resolution Flow
1. Event is revealed with ideology-specific modifiers
2. Player selects 1 candidate + optionally 1 narrative
3. CPU engine calculates optimal action
4. battleEngine resolves combat with full modifier stack (narrative → event → ideology advantage)
5. Opinion scores updated based on winner
6. Cards marked as used, turn increments
7. Match ends after 4 turns or when no candidates remain

### Smooth Screen Transitions
All screen transitions use `window.scrollTo({ top: 0, behavior: 'smooth' })` to ensure proper UX.

### Analytics System
The game tracks player decisions for ideology profiling:
- Selected candidates and their ideology distribution
- Narratives used and frequency
- Events where specific cards were played
- Corruption tolerance based on scandal stats of chosen candidates

## Design Philosophy

**Keep it simple**: The game intentionally avoids multiplayer, complex animations, inventory systems, crafting, economies, or campaigns. Focus is on fast gameplay, TCG aesthetics, and political decision analysis.

## Important Notes

- React Compiler is enabled via `@vitejs/plugin-react` and `@rolldown/plugin-babel` with `babel-plugin-react-compiler`
- There's a typo in the header: "Policars" instead of "Policards" (seen in App.jsx lines 238, 251, 295, 325)
- API endpoints defined in `services/api.js` but not actively used in current implementation
- `gameStore.js` defines a reducer pattern but App.jsx uses direct useState hooks instead
