# Modular Vim Motions Architecture

## Overview

The new modular vim motions system provides a much more maintainable and extensible way to handle vim commands. Instead of having all motions defined in a single large object, motions are now organized by category and can be easily extended or customized.

## Key Improvements

### 1. **Separation of Concerns**

- **Movement motions** (`h`, `j`, `k`, `l`, `w`, `b`, etc.) - Pure cursor navigation
- **Editing motions** (`x`, `o`, `O`, etc.) - Text manipulation
- **Mode motions** (`i`, `a`, `I`, `A`, `Escape`) - Mode switching
- **Text objects** (future extension) - Objects like words, sentences, paragraphs

### 2. **Type Safety**

```typescript
interface VimMotion {
  key: string // The key binding
  description: string // Human-readable description
  category: 'movement' | 'editing' | 'mode' | 'text-object'
  execute: (context: MotionContext, args?: any) => void
  condition?: (context: MotionContext) => boolean // When motion is available
}
```

### 3. **Conditional Execution**

Motions can specify when they should be available:

```typescript
condition: (context) => context.mode === VIM_MODES.NORMAL
```

### 4. **Easy Extension**

Adding new motions is now trivial:

```typescript
const myCustomMotion: VimMotion = {
  key: 'ctrl+d',
  description: 'Delete line',
  category: 'editing',
  execute: (context) => {
    // Implementation here
  },
}
```

## Architecture Components

### Core Types (`src/hooks/motions/types.ts`)

- `MotionContext` - Contains all the state needed by motions
- `VimMotion` - Interface for defining individual motions
- `MotionRegistry` - Type for the motion lookup table

### Motion Categories

- `movementMotions.ts` - All cursor movement commands
- `editingMotions.ts` - Text editing and manipulation
- `modeMotions.ts` - Mode switching commands

### Registry System (`src/hooks/motions/motionRegistry.ts`)

- `createMotionRegistry()` - Factory function for creating registries
- `executeMotion()` - Safe motion execution with validation
- `getMotionsByCategory()` - Filter motions by type
- `getAvailableKeys()` - Get valid keys for current context

### Improved Hook (`src/hooks/useVimMotionsV2.tsx`)

The new hook provides:

- **Custom motions** - Add your own motions
- **Motion filtering** - Enable only specific motions per level
- **Backward compatibility** - Same `keyActionMap` interface
- **Enhanced features** - Available keys, motion introspection

## Usage Examples

### Basic Usage (Drop-in Replacement)

```typescript
const { keyActionMap } = useVimMotionsV2({
  setCursorIndex,
  cursorIndex,
  setVirtualColumn,
  virtualColumn,
  setMode,
  mode,
  text,
  setText,
})
```

### With Custom Motions

```typescript
const customMotions: VimMotion[] = [
  {
    key: 'ctrl+r',
    description: 'Undo',
    category: 'editing',
    execute: (context) => handleUndo(context),
  },
]

const { keyActionMap } = useVimMotionsV2({
  // ... other props
  customMotions,
})
```

### With Motion Filtering (Perfect for Levels)

```typescript
const { keyActionMap, availableKeys } = useVimMotionsV2({
  // ... other props
  enabledMotions: ['h', 'j', 'k', 'l', 'i', 'Escape'], // Only basic motions
})

// availableKeys will only contain motions valid for current mode
```

## Benefits for VimSanity

### 1. **Level Progression**

Each level can enable only specific motions:

- Level 1: `['h', 'j', 'k', 'l']`
- Level 2: `['h', 'j', 'k', 'l', 'i', 'a', 'Escape']`
- Level 3: `['h', 'j', 'k', 'l', 'i', 'a', 'w', 'b', 'Escape']`

### 2. **Easy Testing**

Individual motions can be unit tested:

```typescript
describe('Movement Motions', () => {
  it('should move cursor left with h', () => {
    const context = createMockContext()
    const motion = movementMotions.find((m) => m.key === 'h')
    motion.execute(context)
    expect(context.setCursorIndex).toHaveBeenCalledWith(expectedIndex)
  })
})
```

### 3. **Documentation Generation**

Generate help screens automatically:

```typescript
const availableMotions = getMotionsByCategory('movement')
availableMotions.forEach((motion) => {
  console.log(`${motion.key}: ${motion.description}`)
})
```

### 4. **Plugin System**

Community could contribute motions as plugins:

```typescript
import { advancedSearchMotions } from 'vimsanity-search-plugin'

const { keyActionMap } = useVimMotionsV2({
  customMotions: [...advancedSearchMotions],
})
```

## Migration Path

1. **Gradual Migration**: The old `useVimMotions` hook still works
2. **Component-by-Component**: Migrate one component at a time
3. **Feature Compatibility**: New hook provides same `keyActionMap` interface
4. **Enhanced Features**: Get additional benefits like motion filtering

## Future Enhancements

1. **Text Objects**: `iw` (inner word), `ap` (around paragraph)
2. **Operators**: `d` (delete), `c` (change), `y` (yank)
3. **Counts**: `3w` (move 3 words), `5j` (move 5 lines down)
4. **Macros**: Record and replay motion sequences
5. **Visual Mode**: Select text ranges
6. **Search Motions**: `/pattern`, `n`, `N`

This architecture provides a solid foundation for implementing the full spectrum of Vim functionality while maintaining clean, testable, and extensible code.
