# Plan 2: Text Engine + Word and Line Navigation Units Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Extend the V2 engine for text-based units (cursor as a position into a string instead of a 2D grid), then ship Learn units 2 (`w`/`b`/`e` word motions) and 3 (`0`/`$`/`^` line edges) end-to-end.

**Architecture:** The grid engine from Plan 1 stays untouched and continues to drive the `hjkl` unit. A parallel text engine (new `TextState`, new `TextMotion` registry, new dispatcher) lives alongside it. `AStageDef` and `BStageDef` become discriminated unions over `kind: 'a-drill-grid' | 'a-drill-text'` (and the B equivalent), and `UnitRunner` dispatches to the right stage component by kind. Both engines share the same Progress / UnitRunner / sidebar plumbing — only the stage components differ.

**Tech Stack:** Same as Plan 1 — React 19, TypeScript, Vite, TailwindCSS v4, react-router-dom, vitest, @testing-library/react. No new dependencies.

**Builds on:** Plan 1 (foundation + hjkl unit). This plan assumes the V2 surface and engine from Plan 1 are merged or available on the current branch.

**Out of scope for this plan** (deferred to later plans per the design doc):
- Units 4-7 (insert modes, change/delete, yank/put, text objects) — Plan 3
- Practice wing daily puzzle + drill library — Plan 4
- Apply wing capstones — Plan 5
- Onboarding (demo + placement + drop) — Plan 6
- Analytics events — Plan 7 (or threaded into others)
- Text editing / mutation operations of any kind — those need mode + mutation engine, deferred

---

## File Structure

**New files:**

| Path | Responsibility |
|---|---|
| `src/v2/engine/text-utils.ts` | Pure helpers: `moveToNextWordBoundary`, `moveToPrevWordBoundary`, `moveToWordEnd`, `findLineStart`, `findLineStartNonBlank`, `findLineEnd`. Ported from `src/utils/textUtils.ts` (classic) but cleaned (no console.log) and using `string` (not `string[]`) throughout. |
| `src/v2/engine/text-utils.test.ts` | Unit tests for each helper covering boundaries (start/end of text, single-line, multi-line, punctuation). |
| `src/v2/engine/text-types.ts` | `TextState`, `TextMotion`, `TextMotionFn`, `TextMotionResult` types. |
| `src/v2/engine/text-motions.ts` | `w`, `b`, `e`, `lineStart` (0), `lineEnd` ($), `lineStartNonBlank` (^) + `textMotionRegistry` + `applyTextKey` dispatcher. |
| `src/v2/engine/text-motions.test.ts` | Tests for all six motions and the dispatcher. |
| `src/v2/engine/text-grader.ts` | `isCursorAtIndex(state, target)` predicate. Reuses concept from `grader.ts` but for `TextState`. |
| `src/v2/engine/text-grader.test.ts` | Tests. |
| `src/v2/wings/learn/stages/ADrillStageText.tsx` | Text-based A-drill: highlight a target word in text, navigate cursor to it, repeat. |
| `src/v2/wings/learn/stages/BCheckStageText.tsx` | Text-based B-check: navigate from start index to goal index under par. |
| `src/v2/wings/learn/units/wbe.ts` | Unit 2 definition (word motions). |
| `src/v2/wings/learn/units/lineEdges.ts` | Unit 3 definition (line edges). |

**Modified files:**

| Path | Change |
|---|---|
| `src/v2/wings/learn/units/types.ts` | Convert `AStageDef` and `BStageDef` to discriminated unions over `kind`. Add `AGridDrillDef`, `ATextDrillDef`, `BGridStageDef`, `BTextStageDef`, and `BTextPuzzle`. |
| `src/v2/wings/learn/units/registry.ts` | Add `wbeUnit` and `lineEdgesUnit` to the `units` array (after `hjklUnit`). |
| `src/v2/wings/learn/stages/ADrillStage.tsx` | Narrow `def` prop from `AStageDef` to `AGridDrillDef` (the grid variant of the union). |
| `src/v2/wings/learn/stages/BCheckStage.tsx` | Narrow `def` prop from `BStageDef` to `BGridStageDef`. |
| `src/v2/wings/learn/UnitRunner.tsx` | Switch on `unit.aStage.kind` / `unit.bStage.kind` to render the matching stage component. |

**Untouched from Plan 1:** all of `src/v2/engine/types.ts`, `motions.ts`, `grader.ts`, `src/v2/state/*`, `src/v2/shell/*`, `LearnWing.tsx`, `UnitSidebar.tsx`, and the `hjkl` unit data.

---

## Task 1: Port text utilities to V2 (TDD)

**Files:**
- Create: `src/v2/engine/text-utils.test.ts`
- Create: `src/v2/engine/text-utils.ts`

- [ ] **Step 1.1: Write failing tests**

Create `src/v2/engine/text-utils.test.ts`:
```ts
import { describe, it, expect } from 'vitest'
import {
  moveToNextWordBoundary,
  moveToPrevWordBoundary,
  moveToWordEnd,
  findLineStart,
  findLineEnd,
  findLineStartNonBlank,
} from './text-utils'

describe('moveToNextWordBoundary', () => {
  it('moves from start of first word to start of second word', () => {
    expect(moveToNextWordBoundary('the quick fox', 0)).toBe(4)
  })
  it('skips punctuation as its own word', () => {
    expect(moveToNextWordBoundary('foo, bar', 0)).toBe(3)
    expect(moveToNextWordBoundary('foo, bar', 3)).toBe(5)
  })
  it('returns currentPos when no boundary remains', () => {
    expect(moveToNextWordBoundary('hello', 4)).toBe(4)
  })
  it('crosses newlines', () => {
    expect(moveToNextWordBoundary('foo\nbar', 0)).toBe(4)
  })
})

describe('moveToPrevWordBoundary', () => {
  it('moves from start of second word back to start of first word', () => {
    expect(moveToPrevWordBoundary('the quick fox', 10)).toBe(4)
  })
  it('returns 0 when no earlier boundary exists', () => {
    expect(moveToPrevWordBoundary('hello', 2)).toBe(0)
  })
  it('handles punctuation as a word boundary', () => {
    expect(moveToPrevWordBoundary('foo, bar', 5)).toBe(3)
  })
})

describe('moveToWordEnd', () => {
  it('moves to the end of the current word', () => {
    expect(moveToWordEnd('the quick fox', 0)).toBe(2)
  })
  it('jumps to the end of the next word when already at end', () => {
    expect(moveToWordEnd('the quick fox', 2)).toBe(8)
  })
  it('treats punctuation as its own word ending', () => {
    expect(moveToWordEnd('foo, bar', 0)).toBe(2)
    expect(moveToWordEnd('foo, bar', 2)).toBe(3)
  })
})

describe('findLineStart', () => {
  it('returns 0 for a position on the first line', () => {
    expect(findLineStart('hello world', 6)).toBe(0)
  })
  it('returns the index after the previous newline for later lines', () => {
    expect(findLineStart('foo\nbar\nbaz', 5)).toBe(4)
    expect(findLineStart('foo\nbar\nbaz', 9)).toBe(8)
  })
})

describe('findLineEnd', () => {
  it('returns the last index of a single-line string', () => {
    expect(findLineEnd('hello', 2)).toBe(4)
  })
  it('returns the index of the char before the newline', () => {
    expect(findLineEnd('foo\nbar', 1)).toBe(2)
    expect(findLineEnd('foo\nbar', 5)).toBe(6)
  })
})

describe('findLineStartNonBlank', () => {
  it('returns the first non-space index of the line', () => {
    expect(findLineStartNonBlank('   hello', 5)).toBe(3)
  })
  it('returns the original line start when the line has no leading spaces', () => {
    expect(findLineStartNonBlank('hello', 2)).toBe(0)
  })
})
```

- [ ] **Step 1.2: Run tests — expect failure (module not found)**

Run: `npm run test:run -- src/v2/engine/text-utils.test.ts`
Expected: FAIL — `text-utils` module not found.

- [ ] **Step 1.3: Implement `src/v2/engine/text-utils.ts`**

```ts
const PUNCT = /[.,;:!?()[\]{}'"<>/\\|+=\-*&^%$#@!~`]/

function isPunct(c: string | undefined): boolean {
  return c !== undefined && c !== '_' && PUNCT.test(c)
}

function isSpace(c: string | undefined): boolean {
  return c !== undefined && /\s/.test(c)
}

function isWordBoundary(text: string, index: number): boolean {
  if (index <= 0 || index >= text.length) return false
  const cur = text[index]
  const prev = text[index - 1]
  if (cur === '\n' && prev === '\n') return true
  if (isSpace(prev) && !isPunct(cur) && !isSpace(cur)) return true
  if (isPunct(cur) && !isPunct(prev)) return true
  if (!isPunct(cur) && isPunct(prev) && !isSpace(cur)) return true
  return false
}

function isWordEnd(text: string, index: number): boolean {
  if (index < 0 || index >= text.length) return false
  const cur = text[index]
  const next = text[index + 1]
  if (index === text.length - 1) return true
  if (isSpace(next) && !isPunct(cur) && !isSpace(cur)) return true
  if (isPunct(cur) && !isPunct(next)) return true
  if (isPunct(next) && !isPunct(cur) && !isSpace(cur)) return true
  return false
}

export function moveToNextWordBoundary(text: string, pos: number): number {
  for (let i = pos + 1; i < text.length; i++) {
    if (isWordBoundary(text, i)) return i
  }
  return pos
}

export function moveToPrevWordBoundary(text: string, pos: number): number {
  for (let i = pos - 1; i > 0; i--) {
    if (isWordBoundary(text, i)) return i
  }
  return 0
}

export function moveToWordEnd(text: string, pos: number): number {
  for (let i = pos + 1; i < text.length; i++) {
    if (isWordEnd(text, i)) return i
  }
  return pos
}

export function findLineStart(text: string, pos: number): number {
  return text.lastIndexOf('\n', pos - 1) + 1
}

export function findLineEnd(text: string, pos: number): number {
  const nl = text.indexOf('\n', pos)
  return nl === -1 ? text.length - 1 : nl - 1
}

export function findLineStartNonBlank(text: string, pos: number): number {
  let i = findLineStart(text, pos)
  while (i < text.length && text[i] === ' ') i++
  return i
}
```

- [ ] **Step 1.4: Run tests — all should pass**

Run: `npm run test:run -- src/v2/engine/text-utils.test.ts`
Expected: all tests pass.

- [ ] **Step 1.5: Commit**

```bash
git add src/v2/engine/text-utils.ts src/v2/engine/text-utils.test.ts
git commit -m "$(cat <<'EOF'
feat(v2): port text utilities (word boundaries, line edges)

Pure functions over (text: string, pos: number) → number. Ported
from src/utils/textUtils.ts (classic) but cleaned up: removed stray
console.log, normalized signature to use string (not string[]) so
the engine consistently operates on indices into a string buffer.
These power word motions (w/b/e) and line-edge motions (0/$/^).

Co-Authored-By: Claude Opus 4.7 (1M context) <noreply@anthropic.com>
EOF
)"
```

---

## Task 2: Text engine types

**Files:**
- Create: `src/v2/engine/text-types.ts`

- [ ] **Step 2.1: Write the types**

```ts
import type { KeyEvent } from './types'

export interface TextState {
  text: string
  cursorIndex: number
  keystrokes: number
}

export interface TextMotionResult {
  state: TextState
  consumed: boolean
}

export type TextMotionFn = (state: TextState, event: KeyEvent) => TextMotionResult

export interface TextMotion {
  name: string
  keys: string[]
  apply: TextMotionFn
}
```

- [ ] **Step 2.2: Verify compilation**

Run: `npx tsc --noEmit`
Expected: no errors.

- [ ] **Step 2.3: Commit**

```bash
git add src/v2/engine/text-types.ts
git commit -m "$(cat <<'EOF'
feat(v2): add text engine types (TextState, TextMotion)

Parallel to GridState/GridMotion but operates on a string buffer
with cursorIndex. KeyEvent is reused from engine/types so motion
implementations across both engines share the same input shape.

Co-Authored-By: Claude Opus 4.7 (1M context) <noreply@anthropic.com>
EOF
)"
```

---

## Task 3: Text motion registry (TDD)

**Files:**
- Create: `src/v2/engine/text-motions.test.ts`
- Create: `src/v2/engine/text-motions.ts`

- [ ] **Step 3.1: Write failing tests**

Create `src/v2/engine/text-motions.test.ts`:
```ts
import { describe, it, expect } from 'vitest'
import {
  applyTextKey,
  w, b, e,
  lineStart, lineEnd, lineStartNonBlank,
  textMotionRegistry,
} from './text-motions'
import type { TextState } from './text-types'

function state(text: string, cursorIndex: number, keystrokes = 0): TextState {
  return { text, cursorIndex, keystrokes }
}

describe('w motion (next word)', () => {
  it('moves to the start of the next word', () => {
    const r = w.apply(state('the quick fox', 0), { key: 'w' })
    expect(r.consumed).toBe(true)
    expect(r.state.cursorIndex).toBe(4)
  })
  it('stays at end of text when no more words', () => {
    const r = w.apply(state('hello', 4), { key: 'w' })
    expect(r.state.cursorIndex).toBe(4)
  })
})

describe('b motion (previous word)', () => {
  it('moves to the start of the previous word', () => {
    const r = b.apply(state('the quick fox', 10), { key: 'b' })
    expect(r.state.cursorIndex).toBe(4)
  })
  it('clamps to 0', () => {
    const r = b.apply(state('hello', 2), { key: 'b' })
    expect(r.state.cursorIndex).toBe(0)
  })
})

describe('e motion (word end)', () => {
  it('moves to the end of the current word', () => {
    const r = e.apply(state('the quick fox', 0), { key: 'e' })
    expect(r.state.cursorIndex).toBe(2)
  })
})

describe('lineStart motion (0)', () => {
  it('moves to the start of the current line', () => {
    const r = lineStart.apply(state('foo\nbar baz', 8), { key: '0' })
    expect(r.state.cursorIndex).toBe(4)
  })
})

describe('lineEnd motion ($)', () => {
  it('moves to the last column of the current line', () => {
    const r = lineEnd.apply(state('hello\nworld', 1), { key: '$' })
    expect(r.state.cursorIndex).toBe(4)
  })
  it('handles a single-line buffer', () => {
    const r = lineEnd.apply(state('hello', 1), { key: '$' })
    expect(r.state.cursorIndex).toBe(4)
  })
})

describe('lineStartNonBlank motion (^)', () => {
  it('moves past leading spaces', () => {
    const r = lineStartNonBlank.apply(state('   hello', 5), { key: '^' })
    expect(r.state.cursorIndex).toBe(3)
  })
})

describe('applyTextKey dispatcher', () => {
  it('routes through registry and increments keystrokes', () => {
    const r = applyTextKey(state('the quick fox', 0), { key: 'w' }, textMotionRegistry)
    expect(r.consumed).toBe(true)
    expect(r.state.cursorIndex).toBe(4)
    expect(r.state.keystrokes).toBe(1)
  })
  it('does not increment for unmapped keys', () => {
    const r = applyTextKey(state('hello', 0), { key: 'z' }, textMotionRegistry)
    expect(r.consumed).toBe(false)
    expect(r.state.keystrokes).toBe(0)
  })
  it('increments keystrokes even when motion is a no-op (e.g. w at end of text)', () => {
    const r = applyTextKey(state('hello', 4), { key: 'w' }, textMotionRegistry)
    expect(r.consumed).toBe(true)
    expect(r.state.keystrokes).toBe(1)
  })
})
```

- [ ] **Step 3.2: Run tests — expect failure**

Run: `npm run test:run -- src/v2/engine/text-motions.test.ts`
Expected: FAIL.

- [ ] **Step 3.3: Implement `src/v2/engine/text-motions.ts`**

```ts
import type { KeyEvent } from './types'
import type { TextMotion, TextMotionFn, TextMotionResult, TextState } from './text-types'
import {
  moveToNextWordBoundary,
  moveToPrevWordBoundary,
  moveToWordEnd,
  findLineStart,
  findLineEnd,
  findLineStartNonBlank,
} from './text-utils'

const make = (name: string, keys: string[], fn: TextMotionFn): TextMotion => ({
  name,
  keys,
  apply: fn,
})

function moveCursor(state: TextState, nextIndex: number): TextState {
  return { ...state, cursorIndex: nextIndex }
}

export const w = make('w', ['w'], (s, _e) => ({
  state: moveCursor(s, moveToNextWordBoundary(s.text, s.cursorIndex)),
  consumed: true,
}))

export const b = make('b', ['b'], (s, _e) => ({
  state: moveCursor(s, moveToPrevWordBoundary(s.text, s.cursorIndex)),
  consumed: true,
}))

export const e = make('e', ['e'], (s, _ev) => ({
  state: moveCursor(s, moveToWordEnd(s.text, s.cursorIndex)),
  consumed: true,
}))

export const lineStart = make('lineStart', ['0'], (s, _e) => ({
  state: moveCursor(s, findLineStart(s.text, s.cursorIndex)),
  consumed: true,
}))

export const lineEnd = make('lineEnd', ['$'], (s, _e) => ({
  state: moveCursor(s, findLineEnd(s.text, s.cursorIndex)),
  consumed: true,
}))

export const lineStartNonBlank = make('lineStartNonBlank', ['^'], (s, _e) => ({
  state: moveCursor(s, findLineStartNonBlank(s.text, s.cursorIndex)),
  consumed: true,
}))

export const textMotionRegistry: TextMotion[] = [
  w,
  b,
  e,
  lineStart,
  lineEnd,
  lineStartNonBlank,
]

export function findTextMotion(
  registry: TextMotion[],
  key: string,
): TextMotion | undefined {
  return registry.find((m) => m.keys.includes(key))
}

export function applyTextKey(
  state: TextState,
  event: KeyEvent,
  registry: TextMotion[],
): TextMotionResult {
  const motion = findTextMotion(registry, event.key)
  if (!motion) return { state, consumed: false }
  const result = motion.apply(state, event)
  if (!result.consumed) return { state, consumed: false }
  return {
    state: { ...result.state, keystrokes: state.keystrokes + 1 },
    consumed: true,
  }
}
```

- [ ] **Step 3.4: Run tests — all should pass**

Run: `npm run test:run -- src/v2/engine/text-motions.test.ts`
Expected: all tests pass.

- [ ] **Step 3.5: Commit**

```bash
git add src/v2/engine/text-motions.ts src/v2/engine/text-motions.test.ts
git commit -m "$(cat <<'EOF'
feat(v2): add text motion registry (w b e 0 $ ^) + dispatcher

Six pure motions over TextState. applyTextKey mirrors the grid
dispatcher: looks up a motion by key, applies it, increments
keystrokes when consumed (including boundary no-ops such as
pressing w at the end of the buffer).

Co-Authored-By: Claude Opus 4.7 (1M context) <noreply@anthropic.com>
EOF
)"
```

---

## Task 4: Text grader (TDD)

**Files:**
- Create: `src/v2/engine/text-grader.test.ts`
- Create: `src/v2/engine/text-grader.ts`

- [ ] **Step 4.1: Write failing tests**

```ts
import { describe, it, expect } from 'vitest'
import { isCursorAtIndex } from './text-grader'
import type { TextState } from './text-types'

function state(text: string, cursorIndex: number): TextState {
  return { text, cursorIndex, keystrokes: 0 }
}

describe('isCursorAtIndex', () => {
  it('returns true when cursorIndex matches target', () => {
    expect(isCursorAtIndex(state('hello', 3), 3)).toBe(true)
  })
  it('returns false otherwise', () => {
    expect(isCursorAtIndex(state('hello', 3), 2)).toBe(false)
    expect(isCursorAtIndex(state('hello', 3), 4)).toBe(false)
  })
})
```

- [ ] **Step 4.2: Run — expect failure**

Run: `npm run test:run -- src/v2/engine/text-grader.test.ts`
Expected: FAIL.

- [ ] **Step 4.3: Implement `src/v2/engine/text-grader.ts`**

```ts
import type { TextState } from './text-types'

export function isCursorAtIndex(state: TextState, target: number): boolean {
  return state.cursorIndex === target
}
```

- [ ] **Step 4.4: Run — should pass**

Run: `npm run test:run -- src/v2/engine/text-grader.test.ts`
Expected: pass.

- [ ] **Step 4.5: Commit**

```bash
git add src/v2/engine/text-grader.ts src/v2/engine/text-grader.test.ts
git commit -m "$(cat <<'EOF'
feat(v2): add text grader (isCursorAtIndex)

Trivial predicate used by both text-based A-drill (target word
contains the cursor index) and B-check (target index exactly).

Co-Authored-By: Claude Opus 4.7 (1M context) <noreply@anthropic.com>
EOF
)"
```

---

## Task 5: Migrate unit types to discriminated unions

**Files:**
- Modify: `src/v2/wings/learn/units/types.ts`
- Modify: `src/v2/wings/learn/stages/ADrillStage.tsx` (narrow prop type)
- Modify: `src/v2/wings/learn/stages/BCheckStage.tsx` (narrow prop type)

- [ ] **Step 5.1: Replace `src/v2/wings/learn/units/types.ts` contents**

```ts
import type { Point } from '../../../engine/grader'

export interface AGridDrillDef {
  kind: 'a-drill-grid'
  gridWidth: number
  gridHeight: number
  startCursor: Point
  targetCount: number
  allowedKeys: string[]
}

export interface ATextDrillDef {
  kind: 'a-drill-text'
  text: string
  startCursorIndex: number
  targetCount: number
  allowedKeys: string[]
}

export type AStageDef = AGridDrillDef | ATextDrillDef

export interface BCheckPuzzle {
  id: string
  gridWidth: number
  gridHeight: number
  start: Point
  goal: Point
  par: number
}

export interface BGridStageDef {
  kind: 'b-check-cursor-puzzles'
  puzzles: BCheckPuzzle[]
  allowedKeys: string[]
}

export interface BTextPuzzle {
  id: string
  text: string
  startCursorIndex: number
  goalIndex: number
  par: number
}

export interface BTextStageDef {
  kind: 'b-check-text-puzzles'
  puzzles: BTextPuzzle[]
  allowedKeys: string[]
}

export type BStageDef = BGridStageDef | BTextStageDef

export interface Unit {
  id: string
  title: string
  motionLabel: string
  aStage: AStageDef
  bStage: BStageDef
}
```

- [ ] **Step 5.2: Narrow `ADrillStage` prop type**

In `src/v2/wings/learn/stages/ADrillStage.tsx`, change the `Props` interface from:
```tsx
interface Props {
  def: AStageDef
  onCompleted: () => void
}
```
to:
```tsx
interface Props {
  def: AGridDrillDef
  onCompleted: () => void
}
```

And update the import line at the top:
```tsx
import type { AGridDrillDef } from '../units/types'
```
(replacing `AStageDef`).

- [ ] **Step 5.3: Narrow `BCheckStage` prop type**

In `src/v2/wings/learn/stages/BCheckStage.tsx`, change `Props.def` from `BStageDef` to `BGridStageDef`. Update the import to `import type { BCheckPuzzle, BGridStageDef } from '../units/types'`.

- [ ] **Step 5.4: Verify compilation**

Run: `npx tsc --noEmit`
Expected: no errors. (The existing `hjkl` unit already uses `kind: 'a-drill-grid'` and `kind: 'b-check-cursor-puzzles'`, so the discriminator already matches.)

- [ ] **Step 5.5: Run full test suite**

Run: `npm run test:run`
Expected: all v2 tests still pass (engine, grader, progress all unaffected).

- [ ] **Step 5.6: Commit**

```bash
git add src/v2/wings/learn/units/types.ts src/v2/wings/learn/stages/ADrillStage.tsx src/v2/wings/learn/stages/BCheckStage.tsx
git commit -m "$(cat <<'EOF'
refactor(v2): make AStageDef and BStageDef discriminated unions

Adds text-stage variants (ATextDrillDef, BTextStageDef + BTextPuzzle)
alongside the existing grid ones. ADrillStage and BCheckStage narrow
their prop types to the grid variants — text-stage components arrive
in the next tasks. The hjkl unit's data is unchanged because its
'kind' fields already match the discriminators.

Co-Authored-By: Claude Opus 4.7 (1M context) <noreply@anthropic.com>
EOF
)"
```

---

## Task 6: Define unit 2 (w/b/e) data

**Files:**
- Create: `src/v2/wings/learn/units/wbe.ts`

- [ ] **Step 6.1: Implement**

```ts
import type { Unit } from './types'

export const wbeUnit: Unit = {
  id: 'wbe',
  title: 'Word Motions',
  motionLabel: 'w b e',
  aStage: {
    kind: 'a-drill-text',
    text: 'the quick brown fox jumps over the lazy dog by the river bank',
    startCursorIndex: 0,
    targetCount: 12,
    allowedKeys: ['w', 'b', 'e'],
  },
  bStage: {
    kind: 'b-check-text-puzzles',
    allowedKeys: ['w', 'b', 'e'],
    puzzles: [
      {
        id: 'wbe-b1',
        text: 'the quick brown fox',
        startCursorIndex: 0,
        goalIndex: 16,
        par: 3,
      },
      {
        id: 'wbe-b2',
        text: 'function name(arg)',
        startCursorIndex: 0,
        goalIndex: 14,
        par: 3,
      },
      {
        id: 'wbe-b3',
        text: 'the quick brown fox jumps',
        startCursorIndex: 20,
        goalIndex: 4,
        par: 3,
      },
    ],
  },
}
```

- [ ] **Step 6.2: Verify compilation**

Run: `npx tsc --noEmit`
Expected: no errors.

Par values were verified by hand:
- wbe-b1 "the quick brown fox" 0→16: `w w w` = 3
- wbe-b2 "function name(arg)" 0→14: `w w w` (the `(` is a word boundary by itself, then `arg`) = 3
- wbe-b3 "the quick brown fox jumps" 20→4: `b b b b` ... no wait, from 'j' (20): b→16 (fox), b→10 (brown), b→4 (quick) = 3

If the implementer computes a different optimal, note the discrepancy in the commit message and adjust by ±1.

- [ ] **Step 6.3: Commit**

```bash
git add src/v2/wings/learn/units/wbe.ts
git commit -m "$(cat <<'EOF'
feat(v2): add Word Motions unit (w b e)

Text-based A-drill on a 13-word sentence (12 targets). Three B-check
puzzles each solvable in 3 strokes optimal — a forward pure-w walk
through prose, a forward walk through a function signature (which
exercises the punctuation-is-its-own-word rule for the open paren),
and a backward b walk.

Co-Authored-By: Claude Opus 4.7 (1M context) <noreply@anthropic.com>
EOF
)"
```

---

## Task 7: Define unit 3 (0/$/^) data

**Files:**
- Create: `src/v2/wings/learn/units/lineEdges.ts`

- [ ] **Step 7.1: Implement**

```ts
import type { Unit } from './types'

export const lineEdgesUnit: Unit = {
  id: 'lineEdges',
  title: 'Line Edges',
  motionLabel: '0 $ ^',
  aStage: {
    kind: 'a-drill-text',
    text: '  indented line one\nsecond line here\n  third line indented\nfourth',
    startCursorIndex: 0,
    targetCount: 8,
    allowedKeys: ['0', '$', '^'],
  },
  bStage: {
    kind: 'b-check-text-puzzles',
    allowedKeys: ['0', '$', '^'],
    puzzles: [
      {
        id: 'lineEdges-b1',
        text: 'a short line',
        startCursorIndex: 5,
        goalIndex: 11,
        par: 1,
      },
      {
        id: 'lineEdges-b2',
        text: '   leading spaces here',
        startCursorIndex: 19,
        goalIndex: 3,
        par: 1,
      },
      {
        id: 'lineEdges-b3',
        text: 'line one\nline two\n  line three',
        startCursorIndex: 27,
        goalIndex: 20,
        par: 1,
      },
    ],
  },
}
```

- [ ] **Step 7.2: Verify**

Run: `npx tsc --noEmit`
Expected: no errors.

- [ ] **Step 7.3: Commit**

```bash
git add src/v2/wings/learn/units/lineEdges.ts
git commit -m "$(cat <<'EOF'
feat(v2): add Line Edges unit (0 $ ^)

Multi-line text drill that exercises both indented and non-indented
lines. B-check puzzles are single-stroke optimal — they teach the
keystroke economy of these line motions, not navigation complexity.

Co-Authored-By: Claude Opus 4.7 (1M context) <noreply@anthropic.com>
EOF
)"
```

---

## Task 8: Register units 2 and 3

**Files:**
- Modify: `src/v2/wings/learn/units/registry.ts`

- [ ] **Step 8.1: Replace contents**

```ts
import type { Unit } from './types'
import { hjklUnit } from './hjkl'
import { wbeUnit } from './wbe'
import { lineEdgesUnit } from './lineEdges'

export const units: Unit[] = [hjklUnit, wbeUnit, lineEdgesUnit]

export function findUnit(id: string): Unit | undefined {
  return units.find((u) => u.id === id)
}
```

- [ ] **Step 8.2: Verify**

Run: `npx tsc --noEmit && npm run test:run`
Expected: tsc passes; all tests pass; the existing `initialProgressFor` and `markStageCompleted` automatically handle the new units because they accept `unitIds` as a parameter.

- [ ] **Step 8.3: Commit**

```bash
git add src/v2/wings/learn/units/registry.ts
git commit -m "$(cat <<'EOF'
feat(v2): register Word Motions and Line Edges units

Adds wbeUnit and lineEdgesUnit to the units array. Progress store
auto-handles the new ids; the existing hjkl unit must still be
completed before the others unlock (linear progression).

Co-Authored-By: Claude Opus 4.7 (1M context) <noreply@anthropic.com>
EOF
)"
```

---

## Task 9: ADrillStageText component

**Files:**
- Create: `src/v2/wings/learn/stages/ADrillStageText.tsx`

- [ ] **Step 9.1: Implement**

```tsx
import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { applyTextKey, textMotionRegistry } from '../../../engine/text-motions'
import { moveToNextWordBoundary, moveToWordEnd } from '../../../engine/text-utils'
import type { TextState } from '../../../engine/text-types'
import type { ATextDrillDef } from '../units/types'

interface Props {
  def: ATextDrillDef
  onCompleted: () => void
}

interface TargetRange {
  start: number
  end: number
}

function pickTargetRange(text: string, exclude?: TargetRange): TargetRange {
  const candidates: TargetRange[] = []
  let i = 0
  while (i < text.length) {
    if (!/\s/.test(text[i])) {
      const start = i
      const end = moveToWordEnd(text, i)
      candidates.push({ start, end })
      i = moveToNextWordBoundary(text, i)
      if (i === start) break
    } else {
      i++
    }
  }
  const filtered = exclude
    ? candidates.filter((r) => r.start !== exclude.start)
    : candidates
  const pool = filtered.length > 0 ? filtered : candidates
  return pool[Math.floor(Math.random() * pool.length)]
}

function isCursorInRange(index: number, range: TargetRange): boolean {
  return index >= range.start && index <= range.end
}

export default function ADrillStageText({ def, onCompleted }: Props) {
  const [state, setState] = useState<TextState>({
    text: def.text,
    cursorIndex: def.startCursorIndex,
    keystrokes: 0,
  })
  const [target, setTarget] = useState<TargetRange>(() => pickTargetRange(def.text))
  const [hits, setHits] = useState(0)
  const completedRef = useRef(false)

  const handleKeyDown = useCallback(
    (e: KeyboardEvent) => {
      if (completedRef.current) return
      if (!def.allowedKeys.includes(e.key)) return
      e.preventDefault()
      const { state: next } = applyTextKey(state, { key: e.key }, textMotionRegistry)
      setState(next)
      if (isCursorInRange(next.cursorIndex, target)) {
        const nextHits = hits + 1
        setHits(nextHits)
        if (nextHits >= def.targetCount) {
          completedRef.current = true
          queueMicrotask(onCompleted)
        } else {
          setTarget(pickTargetRange(def.text, target))
        }
      }
    },
    [def.allowedKeys, def.text, def.targetCount, state, hits, target, onCompleted],
  )

  useEffect(() => {
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [handleKeyDown])

  const rendered = useMemo(() => {
    const out: React.ReactNode[] = []
    for (let i = 0; i < def.text.length; i++) {
      const ch = def.text[i]
      const isCursor = state.cursorIndex === i
      const isTargetChar = isCursorInRange(i, target)
      out.push(
        <span
          key={i}
          className={
            isCursor
              ? 'bg-orange-500 text-black'
              : isTargetChar
              ? 'bg-green-500/40 text-gray-100'
              : 'text-gray-300'
          }
        >
          {ch === '\n' ? <br /> : ch === ' ' ? ' ' : ch}
        </span>,
      )
    }
    return out
  }, [def.text, state.cursorIndex, target])

  return (
    <div className="flex flex-col items-center gap-6 p-8">
      <div className="text-sm text-gray-400">
        Drill · Land your cursor on the{' '}
        <span className="text-green-400">highlighted word</span> using{' '}
        <span className="font-mono text-orange-300">{def.allowedKeys.join(' ')}</span>
      </div>
      <div className="max-w-3xl whitespace-pre-wrap font-mono text-base leading-relaxed">
        {rendered}
      </div>
      <div className="text-sm text-gray-300">
        <span className="font-mono">{hits}</span> / {def.targetCount} targets
      </div>
    </div>
  )
}
```

- [ ] **Step 9.2: Verify**

Run: `npx tsc --noEmit`
Expected: no errors.

- [ ] **Step 9.3: Commit**

```bash
git add src/v2/wings/learn/stages/ADrillStageText.tsx
git commit -m "$(cat <<'EOF'
feat(v2): add ADrillStageText — text-based target drill

Picks a random non-space word in def.text, highlights every char of
that word in green, and waits for the user's cursor to land anywhere
inside the range. Renders the text inline (\n becomes <br>, space
becomes nbsp). Same handler pattern as ADrillStage: pure setState,
side effects at top level, completedRef guard.

Co-Authored-By: Claude Opus 4.7 (1M context) <noreply@anthropic.com>
EOF
)"
```

---

## Task 10: BCheckStageText component

**Files:**
- Create: `src/v2/wings/learn/stages/BCheckStageText.tsx`

- [ ] **Step 10.1: Implement**

```tsx
import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { applyTextKey, textMotionRegistry } from '../../../engine/text-motions'
import { isCursorAtIndex } from '../../../engine/text-grader'
import type { TextState } from '../../../engine/text-types'
import type { BTextPuzzle, BTextStageDef } from '../units/types'

interface Props {
  def: BTextStageDef
  onCompleted: () => void
}

interface PuzzleResult {
  puzzleId: string
  keystrokes: number
  par: number
}

function freshState(p: BTextPuzzle): TextState {
  return { text: p.text, cursorIndex: p.startCursorIndex, keystrokes: 0 }
}

export default function BCheckStageText({ def, onCompleted }: Props) {
  const [puzzleIdx, setPuzzleIdx] = useState(0)
  const [state, setState] = useState<TextState>(() => freshState(def.puzzles[0]))
  const [results, setResults] = useState<PuzzleResult[]>([])
  const completedRef = useRef(false)
  const puzzle = def.puzzles[puzzleIdx]

  const handleKeyDown = useCallback(
    (e: KeyboardEvent) => {
      if (completedRef.current) return
      if (!def.allowedKeys.includes(e.key)) return
      e.preventDefault()
      const { state: next } = applyTextKey(state, { key: e.key }, textMotionRegistry)
      if (isCursorAtIndex(next, puzzle.goalIndex)) {
        const result: PuzzleResult = {
          puzzleId: puzzle.id,
          keystrokes: next.keystrokes,
          par: puzzle.par,
        }
        setResults((prev) => [...prev, result])
        const nextIdx = puzzleIdx + 1
        if (nextIdx >= def.puzzles.length) {
          completedRef.current = true
          setState(next)
          queueMicrotask(onCompleted)
        } else {
          setPuzzleIdx(nextIdx)
          setState(freshState(def.puzzles[nextIdx]))
        }
      } else {
        setState(next)
      }
    },
    [def.allowedKeys, def.puzzles, puzzle, puzzleIdx, state, onCompleted],
  )

  useEffect(() => {
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [handleKeyDown])

  const rendered = useMemo(() => {
    const out: React.ReactNode[] = []
    for (let i = 0; i < puzzle.text.length; i++) {
      const ch = puzzle.text[i]
      const isCursor = state.cursorIndex === i
      const isGoal = puzzle.goalIndex === i
      out.push(
        <span
          key={i}
          className={
            isCursor
              ? 'bg-orange-500 text-black'
              : isGoal
              ? 'bg-green-500 text-black'
              : 'text-gray-300'
          }
        >
          {ch === '\n' ? <br /> : ch === ' ' ? ' ' : ch}
        </span>,
      )
    }
    return out
  }, [puzzle.text, puzzle.goalIndex, state.cursorIndex])

  return (
    <div className="flex flex-col items-center gap-6 p-8">
      <div className="text-sm text-gray-400">
        Puzzle {puzzleIdx + 1} / {def.puzzles.length} · Par{' '}
        <span className="font-mono text-orange-300">{puzzle.par}</span> keystrokes
      </div>
      <div className="max-w-3xl whitespace-pre-wrap font-mono text-base leading-relaxed">
        {rendered}
      </div>
      <div className="text-sm text-gray-300">
        Strokes:{' '}
        <span
          className={`font-mono ${
            state.keystrokes > puzzle.par ? 'text-red-400' : 'text-green-400'
          }`}
        >
          {state.keystrokes}
        </span>
      </div>
      {results.length > 0 && (
        <div className="mt-4 text-xs text-gray-500">
          {results.map((r) => (
            <div key={r.puzzleId}>
              {r.puzzleId}: {r.keystrokes} / par {r.par}
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
```

- [ ] **Step 10.2: Verify**

Run: `npx tsc --noEmit`
Expected: no errors.

- [ ] **Step 10.3: Commit**

```bash
git add src/v2/wings/learn/stages/BCheckStageText.tsx
git commit -m "$(cat <<'EOF'
feat(v2): add BCheckStageText — text-based cursor puzzles

Same shape as BCheckStage but operates on TextState. Renders the
puzzle text inline with cursor (orange) and goal (green)
highlighted. Advances to the next puzzle on goal hit; calls
onCompleted after the last puzzle.

Co-Authored-By: Claude Opus 4.7 (1M context) <noreply@anthropic.com>
EOF
)"
```

---

## Task 11: UnitRunner dispatch by stage kind

**Files:**
- Modify: `src/v2/wings/learn/UnitRunner.tsx`

- [ ] **Step 11.1: Replace the JSX render branches**

The current file's `return` has:
```tsx
{active === 'a' && <ADrillStage def={unit.aStage} onCompleted={handleAComplete} />}
{active === 'b' && <BCheckStage def={unit.bStage} onCompleted={handleBComplete} />}
```

Replace those two lines with dispatch helpers. First add new imports near the existing ones:
```tsx
import ADrillStageText from './stages/ADrillStageText'
import BCheckStageText from './stages/BCheckStageText'
```

Then replace those two JSX lines with:
```tsx
{active === 'a' &&
  (unit.aStage.kind === 'a-drill-grid' ? (
    <ADrillStage def={unit.aStage} onCompleted={handleAComplete} />
  ) : (
    <ADrillStageText def={unit.aStage} onCompleted={handleAComplete} />
  ))}
{active === 'b' &&
  (unit.bStage.kind === 'b-check-cursor-puzzles' ? (
    <BCheckStage def={unit.bStage} onCompleted={handleBComplete} />
  ) : (
    <BCheckStageText def={unit.bStage} onCompleted={handleBComplete} />
  ))}
```

TypeScript's discriminated-union narrowing will correctly type `unit.aStage` and `unit.bStage` inside each branch.

- [ ] **Step 11.2: Verify**

Run: `npx tsc --noEmit && npm run build`
Expected: no errors; build succeeds.

- [ ] **Step 11.3: Commit**

```bash
git add src/v2/wings/learn/UnitRunner.tsx
git commit -m "$(cat <<'EOF'
feat(v2): dispatch UnitRunner stages by kind (grid vs text)

The discriminated 'kind' on each StageDef narrows the prop type
inside each branch, so each stage component sees only its own
variant. No behavior change for hjkl; unlocks unit 2 (w/b/e) and
unit 3 (line edges).

Co-Authored-By: Claude Opus 4.7 (1M context) <noreply@anthropic.com>
EOF
)"
```

---

## Task 12: End-to-end verification

**Files:** none modified — verification only.

- [ ] **Step 12.1: Full test suite**

Run: `npm run test:run`
Expected: 34 + (4 + 9 + 1) = 48 V2 tests pass (Plan 1's 24 V2-engine/state + Plan 2's new text-utils, text-motions, text-grader), plus the 10 V2 progress tests = ~58 passing total. The 1 pre-existing classic `useHistory` skip remains.

(Exact counts may differ slightly depending on test granularity; the absolute pass count matters less than `0 failed`.)

- [ ] **Step 12.2: Typecheck**

Run: `npx tsc --noEmit`
Expected: no errors.

- [ ] **Step 12.3: Build**

Run: `npm run build`
Expected: success.

- [ ] **Step 12.4: Lint**

Run: `npm run lint 2>&1 | grep -E 'src/v2/' | grep error`
Expected: empty output (no errors in V2 files). Pre-existing classic file errors are unrelated.

- [ ] **Step 12.5: Manual browser walk (requires user)**

Run: `npm run dev`

Manual flow:
1. Clear localStorage for `localhost:5173` to start fresh.
2. Visit `http://localhost:5173/` → redirects to `/learn/hjkl`.
3. Complete the hjkl A-drill and B-check (Plan 1 unit). Confirm sidebar shows hjkl ✓ and `wbe` becomes ○ (ready).
4. Click into `wbe` → text appears with a highlighted target word. Press `w`/`b`/`e` to land on it. Hit count advances.
5. Finish 12 targets → B-check appears with three text puzzles. Solve each.
6. Confirm sidebar marks `wbe` ✓ and `lineEdges` becomes ○.
7. Click into `lineEdges` → same flow with `0`/`$`/`^`.
8. After completion, reload — progress persists; you land on the "Unit complete" screen for `lineEdges`.
9. Visit `/classic` — confirm the classic app still loads.

Stop dev server.

- [ ] **Step 12.6: Final summary commit (optional)**

If no incidental changes were made during verification, skip. Otherwise, commit fixes with a clear message.

---

## Self-Review (writer's note)

**Spec coverage check against design doc §9.1:**

- Unit 2 (`w b e` word motions) → Task 6 (data) + Tasks 9, 10 (engine reuse)
- Unit 3 (`0 $ ^` line edges) → Task 7 (data)
- A → B → C pedagogical loop: A and B stages present; C (scenarios) deferred to Plan 5
- Linear progression: enforced by existing Progress store (Plan 1, Task 8) — unchanged
- New engine layer for text: Tasks 1-4 (utils, types, motions, grader)
- Discriminated unions on stage types: Task 5
- Same Three Wings shell: unchanged from Plan 1

**Out of scope flags:**
- No mode tracking (insert/visual) — Plan 3
- No text mutation — Plan 3+
- No new tests for UI components — manual walk in Task 12 covers the integration

**Type / naming consistency:**
- `TextState` → `text-types.ts` → consumed by motions, grader, stages
- `AGridDrillDef` / `ATextDrillDef` discriminated by `kind` field — TypeScript will narrow at usage sites
- `applyTextKey` parallels `applyKey` (renamed for clarity in earlier plan to be `applyGridKey` would be nicer but the rename is out of scope; the existing `applyKey` is grid-specific and `applyTextKey` is text-specific)
- `textMotionRegistry` parallels `motionRegistry`

**Pattern reuse from Plan 1:**
- handleKeyDown structure (completedRef, allowedKeys filter, preventDefault, setState top-level, side effects at top level) — matches the post-review pattern from Plan 1
- Stage commit/onCompleted via queueMicrotask
- One file per task / one commit per task

**Known limitations the next plan picks up:**
- Per-render array references avoided (no `units.map(...)` inside components — `UNIT_IDS` is already at module scope from Plan 1)
- Modes (Normal vs Insert) — Plan 3 introduces a `mode` field on TextState
- The engine still has no concept of operators (d/c/y prefix to a motion) — Plan 3 layers operator support on top
