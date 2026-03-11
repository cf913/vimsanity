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

The V2 motion system (`useVimMotionsV2.tsx`) uses a **Motion Registry** pattern (`src/hooks/motions/`):
- `motionRegistry.ts` - Central registry that combines all motions
- `movementMotions.ts` - Movement commands (h, j, k, l, w, b, e, etc.)
- `editingMotions.ts` - Editing commands (x, d, c, etc.)
- `modeMotions.ts` - Mode transitions (i, a, Esc, etc.)
- `types.ts` - Shared types for MotionContext, VimMotion, etc.

**Key Architectural Benefit**: The registry system allows levels to enable/disable specific motions via the `enabledMotions` prop, making it easy to progressively introduce commands.

### Level Infrastructure

#### `useVimLevel` Hook (The Brain)

`src/hooks/useVimLevel.ts` is the centralized level state management hook used by all game levels. It provides:

- **Core state**: `score`, `maxScore`, `levelCompleted`, `showConfetti`, `isActive`
- **Actions**: `incrementScore()`, `setScore()`, `completeLevel()`, `resetLevel()`, `activateTimer()`
- **Auto-behaviors**: ESC-to-restart when level is complete, confetti auto-dismiss
- **Optional V2 integration**: Pass `enabledMotions` or `initialText` to get built-in vim state (`cursorIndex`, `mode`, `text`, `keyActionMap`)

Levels call `useKeyboardHandler` directly for keyboard wiring (avoids stale closure issues).

#### Level Block Components (`src/components/level-blocks/`)

Composable UI building blocks for levels:
- `LevelShell` - Outer wrapper handling ConfettiBurst + LevelTimer rendering
- `LevelHeader` - Title, Scoreboard, reset button, ModeIndicator
- `LevelCompletion` - Standard completion screen with SessionHistory
- `CommandBuffer` - Pending command/count display (4 color themes)

#### Level Registry (`src/levels/registry.ts`)

Single source of truth for all level metadata. Used by both `Sidebar.tsx` (navigation) and `GameArea.tsx` (rendering). When adding a new level, only update `registry.ts`.

### Level System

Levels are React components in `src/components/levels/`. Each level:
- Uses `useVimLevel` for core state management (score, completion, timer, confetti, ESC-to-restart)
- Uses `useKeyboardHandler` to connect keyboard events to custom key action maps
- Wraps its UI in `<LevelShell>` for consistent ConfettiBurst and LevelTimer rendering
- Uses `<LevelHeader>` for scoreboard, reset button, and mode indicator
- Manages only level-specific state (grid, position, challenges, etc.)

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
2. Handler looks up key in `keyActionMap` (from vim motions hook or custom)
3. Motion executes, updating cursor/text state via context
4. React re-renders TextArea with new cursor position
5. Optional: History hook records state for undo/redo

## Adding a New Level

1. Create level component in `src/components/levels/YourLevel.tsx`
2. Use `useVimLevel` hook for core state (score, completion, timer)
3. Wrap UI in `<LevelShell>` and use `<LevelHeader>` for consistent layout
4. Use `useKeyboardHandler` for keyboard event handling
5. Add entry to `src/levels/registry.ts` (metadata + component reference)
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
- Levels 0-17 are currently implemented (no Level 8)
- Level 0 is an interactive keyboard visualizer (intro/exploration tool)
- Level 13 is a playground for development/testing
- Level 14 covers text objects (diw, daw, ciw, caw)
- Level 15 covers yank and put (yy, yw, p, P)
- Some levels have subdirectories (Level0/, Level6/, Level7/, Level8/, Level9/) for complex implementations

## Level 0: Keyboard Visualizer Architecture

Level 0 is a unique learning tool that uses a 3D keyboard visualization to help users discover Vim commands:

### Structure
- `Level0/types.ts` - TypeScript interfaces for keyboard layout and commands
- `Level0/keyboardLayout.ts` - MacBook Pro-style keyboard layout data
- `Level0/vimCommandsData.ts` - Comprehensive Vim command database with examples
- `Level0/Key3D.tsx` - Individual 3D key component with glow animations
- `Level0/Keyboard3D.tsx` - Full keyboard with floating animation
- `Level0/ModeSwitcher.tsx` - Switch between Normal/Insert/Visual modes
- `Level0/ProficiencySelector.tsx` - Select skill level (Beginner to Expert)
- `Level0/CommandInfoPopup.tsx` - Animated popup showing command details

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
