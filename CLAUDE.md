# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

VimSanity is an interactive web application designed to teach Vim motions through hands-on practice. It's built with React 19, TypeScript, Vite, and TailwindCSS v4. The application abstracts Vim motions away from code editors to make the learning process beginner-friendly.

Website: https://www.vimsanity.com

## Development Commands

### Build & Development
- `npm run dev` - Start development server with Vite
- `npm run build` - Build production bundle with Vite
- `npm run preview` - Preview production build locally
- `npm run lint` - Run ESLint on the codebase

### Installation
- `npm install` - Install all dependencies

## Architecture

### Core Vim Motion System

The application implements a sophisticated Vim motion engine with two implementations:

1. **Legacy System** (`useVimMotions.tsx`): Original implementation with monolithic key action map
2. **V2 System** (`useVimMotionsV2.tsx`): Modular registry-based system (recommended for new levels)

The V2 system uses a **Motion Registry** pattern (`src/hooks/motions/`):
- `motionRegistry.ts` - Central registry that combines all motions
- `movementMotions.ts` - Movement commands (h, j, k, l, w, b, e, etc.)
- `editingMotions.ts` - Editing commands (x, d, c, etc.)
- `modeMotions.ts` - Mode transitions (i, a, Esc, etc.)
- `types.ts` - Shared types for MotionContext, VimMotion, etc.

**Key Architectural Benefit**: The registry system allows levels to enable/disable specific motions via the `enabledMotions` prop, making it easy to progressively introduce commands.

### Level System

Levels are React components in `src/components/levels/` that implement the `LevelProps` interface:
```typescript
interface LevelProps {
  isMuted: boolean;
}
```

Each level component:
- Manages its own text content and cursor state
- Uses either `useVimMotions` or `useVimMotionsV2` for motion handling
- Uses `useKeyboardHandler` to connect keyboard events to motions
- Renders a `<TextArea>` component with visual feedback
- Often includes level-specific UI like `<KeysAllowed>`, `<SessionHistory>`, `<Scoreboard>`

Level routing is handled in `GameArea.tsx` via a switch statement based on the current level number.

### State Management

The app uses React's built-in state management with localStorage persistence:
- **App.tsx** manages global state (current level, sidebar visibility, muted state)
- All state is synced to localStorage using keys prefixed with `vimsanity-`
- Level components manage their own local state (cursor position, text content, virtual column)

### Virtual Column System

Critical for vertical movement (j/k):
- When moving vertically, Vim remembers the column you intended to be in
- Implemented via `virtualColumn` state in vim motion hooks
- Updated on horizontal movements and preserved during vertical navigation

### Text Utilities

`src/utils/textUtils.ts` provides core navigation functions:
- `findLineStart`, `findLineEnd` - Line boundary detection
- `moveToNextWordBoundary`, `moveToPrevWordBoundary` - Word navigation
- `findLineStartNonBlank` - First non-whitespace character
- These are used by motion implementations to calculate cursor positions

### Level Metadata

Level information is duplicated in two places (this is intentional):
1. `Sidebar.tsx` - Contains level metadata organized by category (navigate, insert, delete, etc.)
2. `GameArea.tsx` - Switch statement that renders the actual level component

When adding a new level, update both locations.

### Changelog System

`GameArea.tsx` includes a version-based changelog popup:
- `GAME_VERSION` constant tracks current version
- `CHANGELOG_MESSAGE` shows what's new
- Uses localStorage key `vimsanity_last_seen_version` to show once per version

## Component Patterns

### Common Components (`src/components/common/`)
- `TextArea.tsx` - Main text editor display with cursor rendering
- `KeysAllowed.tsx` - Shows available keyboard commands for the level
- `SessionHistory.tsx` - Displays keystroke history for learning
- `ModeIndicator.tsx` - Shows current Vim mode (NORMAL, INSERT, etc.)
- `Scoreboard.tsx` - Tracks level progress and scoring
- `KBD.tsx` - Keyboard key display component

### Animation
- Uses `framer-motion` extensively for smooth transitions
- Sidebar animations with spring physics
- Level transition animations
- Confetti/celebration effects in `ConfettiBurst.tsx`

## Data Flow for Vim Motions

1. User presses key → `useKeyboardHandler` captures event
2. Handler looks up key in `keyActionMap` (from vim motions hook)
3. Motion executes, updating cursor/text state via context
4. React re-renders TextArea with new cursor position
5. Optional: History hook records state for undo/redo

## Adding a New Level

1. Create level component in `src/components/levels/YourLevel.tsx`
2. Import in `GameArea.tsx` and add case to switch statement
3. Add level metadata to `Sidebar.tsx` levels object
4. Use `useVimMotionsV2` with `enabledMotions` array to control available commands
5. Implement level-specific logic (challenges, scoring, etc.)
6. Update `GAME_VERSION` and `CHANGELOG_MESSAGE` if releasing

## Key Technologies

- **React 19** with TypeScript
- **Vite** for build tooling
- **TailwindCSS v4** (uses new `@tailwindcss/postcss` plugin)
- **Framer Motion** for animations
- **PostHog** for analytics
- **Vercel Analytics** for deployment metrics

## Important Notes

- The app is desktop-only (mobile users see `MobileWarning.tsx`)
- Levels 0-13 are currently implemented
- Level 0 is a playground for development/testing
- Level 13 is a special interactive keyboard visualizer with 3D animations
- Some levels have subdirectories (Level6/, Level7/, Level8/, Level9/, Level13/) for complex implementations
- The app uses a WIP banner to indicate in-development features

## Level 13: Keyboard Visualizer Architecture

Level 13 is a unique learning tool that uses a 3D keyboard visualization to help users discover Vim commands:

### Structure
- `Level13/types.ts` - TypeScript interfaces for keyboard layout and commands
- `Level13/keyboardLayout.ts` - MacBook Pro-style keyboard layout data
- `Level13/vimCommandsData.ts` - Comprehensive Vim command database with examples
- `Level13/Key3D.tsx` - Individual 3D key component with glow animations
- `Level13/Keyboard3D.tsx` - Full keyboard with floating animation
- `Level13/ModeSwitcher.tsx` - Switch between Normal/Insert/Visual modes
- `Level13/ProficiencySelector.tsx` - Select skill level (Beginner to Expert)
- `Level13/CommandInfoPopup.tsx` - Animated popup showing command details

### Key Features
- **3D Animations**: Uses CSS `perspective` and Framer Motion for smooth wiggling keyboard
- **Interactive Learning**: Press any physical key to see what it does in Vim
- **Proficiency Levels**: Highlights different key sets based on user experience
- **Mode-Aware**: Shows different commands for Normal, Insert, and Visual modes
- **Color-Coded**: Categories (movement, editing, search) have distinct colors
- **Auto-Dismiss Popup**: Command info disappears after 5 seconds

### Implementation Notes
- Does NOT use the vim motion hooks (standalone keyboard listener)
- Custom keyboard event handlers with `normalizeKeyName` for cross-platform support
- Glow effects use dynamic box-shadow animations
- Keyboard layout supports variable-width keys (Space, Enter, Shift, etc.)
