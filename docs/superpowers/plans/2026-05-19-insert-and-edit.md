# Plan 3: Insert Modes + Change/Delete Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Extend the V2 engine with text mutation, mode tracking, and operator+motion composition, then ship Learn units 4 (`i a o O Esc` insert modes) and 5 (`x dw dd D cw C` change/delete) end-to-end.

**Architecture:** The text engine from Plan 2 stays untouched (its motion functions are reused inside the new engine). A new `EditableState` adds three fields on top of `TextState`: `mode` ('normal' | 'insert'), `pendingOperator` (null | 'd' | 'c'), and the existing `keystrokes`. A new top-level `applyEditableKey(state, event)` dispatches by mode: in insert mode it inserts characters or exits on `Esc`; in normal mode it resolves motions (delegated to `text-motions`), mode-entry keys, and operators including the operator+motion composition (e.g. press `d` → pending; press `w` → delete-up-to-w). Two new stage components mirror Plan 2's pattern: `ADrillStageEdit` and `BCheckStageEdit`. Both consume the same kind of "challenge" (start state → goal state).

**Tech Stack:** Same as Plans 1-2 — React 19, TypeScript, Vite, TailwindCSS v4, react-router-dom, vitest, @testing-library/react. No new dependencies.

**Builds on:** Plans 1 and 2 (foundation + grid + text engines + first three units). Assumes those are merged on the current branch (`feat/v2-foundation-plan-1` as of 2026-05-19).

**Out of scope for this plan** (deferred to later plans per the design doc):
- Unit 6 (yank/put `y yy yw p P`) — later plan.
- Unit 7 (text objects `diw daw ciw caw`) — later plan; text objects need extra motion machinery.
- Capital-letter mode entries (`I A`), repeat (`.`), undo/redo, counts, registers, search, find-char — all deferred.
- Multi-line operators beyond `dd`/`cc` — e.g. `d2j`, `c}`. Counts are not in v1.
- Visual mode entirely.
- Backspace across line breaks in insert mode — for v1, Backspace at column 0 is a no-op (do not join lines).

---

## Engine design notes

### EditableState
```ts
interface EditableState {
  text: string
  cursorIndex: number
  mode: 'normal' | 'insert'
  pendingOperator: 'd' | 'c' | null
  keystrokes: number
}
```
- `cursorIndex` is the index the cursor is "on" (normal) or "before which a typed char would be inserted" (insert). At end of buffer, cursorIndex === text.length is allowed in insert mode; in normal mode it's clamped to `max(0, text.length - 1)`.
- `pendingOperator` is set when the user presses `d` or `c` with no pending op. The next normal-mode keypress is consumed as either a motion (compose to delete-range) or a repeat operator (`dd`/`cc` deletes the current line).
- Esc in normal mode clears `pendingOperator`.

### Motion → range
When an operator is pending and the user presses a motion key, the engine computes the motion's would-be target (without committing it). For **exclusive** motions (`w`, `b`, `0`, `^`, `h`, `l`, `j`, `k`) it deletes the half-open range `[min(cur, target), max(cur, target))`. For **inclusive** motions (`e`, `$`) it deletes the closed range `[min(cur, target), max(cur, target) + 1)`. Cursor ends at `min(cur, target)` after deletion (vim semantics for `dw`/`db`), clamped to the new line end if needed.

**Vim quirk for `cw`:** `cw` is treated as `ce` internally (delete the word but NOT trailing whitespace, then enter insert). This lets the user re-type the word without having to retype the trailing space. Without this quirk, the natural change-word puzzle "the old fox" → "the new fox" can't be solved with `cw new Esc` because the space would be eaten.

`dd` deletes the entire current line **including the appropriate newline** (trailing if not last line, leading if last line of multi-line). Cursor moves to the line start of the new current line.

`cc` clears the current line's content but **keeps the newline**, then enters insert mode at the line start. (Different from `dd` — vim leaves the empty line so the user can type a replacement.)

`D` is shorthand for delete-to-end-of-line (inclusive). `C` is delete-to-end-of-line plus insert.

`x` deletes the character under the cursor and clamps the cursor to the new line length.

### Insert mode
- Any printable single-character key inserts that character at `cursorIndex` and advances `cursorIndex` by 1.
- `Enter` inserts `\n`.
- `Backspace` deletes the character at `cursorIndex - 1` (no-op when `cursorIndex === 0`); cursor moves back one. Backspace across a newline is NOT supported in v1 — at the start of a line the action is a no-op.
- `Escape` exits insert mode. Cursor is clamped to `max(line_start, cursorIndex - 1)` (the classic vim "back one" on Esc), and never below 0.

### allowedKeys semantics
- In normal mode, `e.key` must be in `allowedKeys` to be processed (and counted as a keystroke). Otherwise the event is ignored.
- In insert mode, the `allowedKeys` filter does NOT apply — printable chars, Backspace, Enter, and Escape are always accepted while in insert mode. (Otherwise unit authors would need to enumerate every printable char.)

### Why no separate "operator key" filter
Operators (`d`, `c`, `x`, `D`, `C`) are normal-mode keys like any other. The unit author lists them in `allowedKeys` along with motions and mode-entry keys.

---

## File Structure

**New files:**

| Path | Responsibility |
|---|---|
| `src/v2/engine/editable-types.ts` | `EditableState`, `EditCommandResult`, `OperatorKind`, `Mode`. |
| `src/v2/engine/edits.ts` | Pure text-mutation helpers: `deleteRange`, `insertAt`. Index-arithmetic only — no state. |
| `src/v2/engine/edits.test.ts` | Unit tests for `deleteRange`, `insertAt`. |
| `src/v2/engine/mode-motions.ts` | `enterInsertBefore` (i), `enterInsertAfter` (a), `openLineBelow` (o), `openLineAbove` (O), `exitInsert` (Esc). Each returns a transition over `EditableState`. |
| `src/v2/engine/mode-motions.test.ts` | Tests for each mode transition including edge cases (end-of-buffer, first line, last line, empty buffer). |
| `src/v2/engine/operators.ts` | `applyOperatorWithMotion`, `deleteLine`, `deleteUnderCursor` (x), `deleteToEndOfLine` (D), `changeToEndOfLine` (C). |
| `src/v2/engine/operators.test.ts` | Tests for each operator, alone and in composition. |
| `src/v2/engine/editable-engine.ts` | `applyEditableKey(state, event)` — top-level dispatcher. Handles mode branching, pending-operator state machine, motion delegation, insert-mode char insertion. Also exports `freshNormal(text, cursorIndex)`. |
| `src/v2/engine/editable-engine.test.ts` | Integration tests: drives sequences like `[d, w]`, `[c, w, 'n', 'e', 'w', Esc]`, `[i, 'f', 'o', 'o', Esc]`, `[d, d]`, `[x]`, `[D]`, `[C]`, etc. |
| `src/v2/engine/editable-grader.ts` | `matchesGoal(state, goal)` — checks `text` plus optional `cursorIndex` and optional `mode`. |
| `src/v2/engine/editable-grader.test.ts` | Tests for full and partial matches. |
| `src/v2/wings/learn/stages/ADrillStageEdit.tsx` | A-drill: walks the player through a sequence of edit challenges with hints, no par. Calls `onCompleted` after all challenges match their goals. |
| `src/v2/wings/learn/stages/BCheckStageEdit.tsx` | B-check: par-graded edit puzzles. Tracks keystrokes per puzzle. |
| `src/v2/wings/learn/units/insertModes.ts` | Unit 4 definition. |
| `src/v2/wings/learn/units/changeDelete.ts` | Unit 5 definition. |

**Modified files:**

| Path | Change |
|---|---|
| `src/v2/wings/learn/units/types.ts` | Add `AEditDrillDef`, `BEditStageDef`, `EditChallenge`, `BEditPuzzle`. Extend `AStageDef` and `BStageDef` unions. |
| `src/v2/wings/learn/units/registry.ts` | Add `insertModesUnit` and `changeDeleteUnit` to the `units` array. |
| `src/v2/wings/learn/UnitRunner.tsx` | Add a third branch for `kind === 'a-drill-edit'` / `kind === 'b-check-edit-puzzles'`. |

**Untouched:** all of `src/v2/engine/text-{utils,types,motions,grader}.ts` (Plan 2 keeps working as-is and is reused inside the operator engine), `src/v2/engine/{types,grader,motions}.ts` (Plan 1 grid engine), `src/v2/state/*`, `src/v2/shell/*`, `LearnWing.tsx`, `UnitSidebar.tsx`, `ADrillStage.tsx`, `BCheckStage.tsx`, `ADrillStageText.tsx`, `BCheckStageText.tsx`, the `hjkl`/`wbe`/`lineEdges` units.

---

## Task 1: Editable engine types

**Files:**
- Create: `src/v2/engine/editable-types.ts`

- [ ] **Step 1.1: Write the types**

```ts
import type { KeyEvent } from './types'

export type Mode = 'normal' | 'insert'
export type OperatorKind = 'd' | 'c'

export interface EditableState {
  text: string
  cursorIndex: number
  mode: Mode
  pendingOperator: OperatorKind | null
  keystrokes: number
}

export interface EditableResult {
  state: EditableState
  consumed: boolean
}

export type EditableFn = (state: EditableState, event: KeyEvent) => EditableResult
```

- [ ] **Step 1.2: Verify compilation**

Run: `npx tsc --noEmit`
Expected: no errors.

- [ ] **Step 1.3: Commit**

```bash
git add src/v2/engine/editable-types.ts
git commit -m "$(cat <<'EOF'
feat(v2): add editable engine types (EditableState, Mode, OperatorKind)

Superset of TextState that adds mode + pendingOperator. The Plan 2
text motions stay untouched and are reused inside the new operator
engine; only the editable layer above them knows about modes.

Co-Authored-By: Claude Opus 4.7 (1M context) <noreply@anthropic.com>
EOF
)"
```

---

## Task 2: Pure text-edit primitives (TDD)

**Files:**
- Create: `src/v2/engine/edits.test.ts`
- Create: `src/v2/engine/edits.ts`

- [ ] **Step 2.1: Write failing tests**

```ts
import { describe, it, expect } from 'vitest'
import { deleteRange, insertAt } from './edits'

describe('deleteRange', () => {
  it('deletes the half-open range [start, end)', () => {
    expect(deleteRange('the quick fox', 4, 10)).toBe('the fox')
  })
  it('returns text unchanged when start === end', () => {
    expect(deleteRange('hello', 2, 2)).toBe('hello')
  })
  it('clamps negative start to 0', () => {
    expect(deleteRange('hello', -3, 2)).toBe('llo')
  })
  it('clamps end past length', () => {
    expect(deleteRange('hello', 2, 99)).toBe('he')
  })
  it('swaps args when start > end', () => {
    expect(deleteRange('the quick fox', 10, 4)).toBe('the fox')
  })
})

describe('insertAt', () => {
  it('inserts text at the given index', () => {
    expect(insertAt('foobar', 3, '_BAZ_')).toBe('foo_BAZ_bar')
  })
  it('handles index 0 (prepend)', () => {
    expect(insertAt('bar', 0, 'foo')).toBe('foobar')
  })
  it('handles index === length (append)', () => {
    expect(insertAt('foo', 3, 'bar')).toBe('foobar')
  })
  it('clamps negative index to 0', () => {
    expect(insertAt('bar', -5, 'foo')).toBe('foobar')
  })
  it('clamps oversize index to length', () => {
    expect(insertAt('foo', 10, 'bar')).toBe('foobar')
  })
})
```

- [ ] **Step 2.2: Run tests — expect failure (module not found)**

Run: `npm run test:run -- src/v2/engine/edits.test.ts`
Expected: FAIL — `edits` module not found.

- [ ] **Step 2.3: Implement `src/v2/engine/edits.ts`**

```ts
export function deleteRange(text: string, start: number, end: number): string {
  let s = start
  let e = end
  if (s > e) {
    const tmp = s
    s = e
    e = tmp
  }
  s = Math.max(0, s)
  e = Math.min(text.length, e)
  return text.slice(0, s) + text.slice(e)
}

export function insertAt(text: string, index: number, insert: string): string {
  const i = Math.max(0, Math.min(text.length, index))
  return text.slice(0, i) + insert + text.slice(i)
}
```

- [ ] **Step 2.4: Run tests — all should pass**

Run: `npm run test:run -- src/v2/engine/edits.test.ts`
Expected: all tests pass.

- [ ] **Step 2.5: Commit**

```bash
git add src/v2/engine/edits.ts src/v2/engine/edits.test.ts
git commit -m "$(cat <<'EOF'
feat(v2): add text-edit primitives (deleteRange, insertAt)

Pure string-in / string-out helpers. The operator and insert-mode
layers compose these to mutate text. Both helpers clamp out-of-range
inputs so callers don't have to defensively bounds-check.

Co-Authored-By: Claude Opus 4.7 (1M context) <noreply@anthropic.com>
EOF
)"
```

---

## Task 3: Mode-transition motions (TDD)

**Files:**
- Create: `src/v2/engine/mode-motions.test.ts`
- Create: `src/v2/engine/mode-motions.ts`

- [ ] **Step 3.1: Write failing tests**

```ts
import { describe, it, expect } from 'vitest'
import {
  enterInsertBefore,
  enterInsertAfter,
  openLineBelow,
  openLineAbove,
  exitInsert,
} from './mode-motions'
import type { EditableState } from './editable-types'

function state(
  text: string,
  cursorIndex: number,
  mode: 'normal' | 'insert' = 'normal',
): EditableState {
  return { text, cursorIndex, mode, pendingOperator: null, keystrokes: 0 }
}

describe('enterInsertBefore (i)', () => {
  it('switches to insert mode and keeps cursor', () => {
    const r = enterInsertBefore(state('hello', 2))
    expect(r.mode).toBe('insert')
    expect(r.cursorIndex).toBe(2)
    expect(r.text).toBe('hello')
  })
})

describe('enterInsertAfter (a)', () => {
  it('switches to insert mode and advances cursor by 1', () => {
    const r = enterInsertAfter(state('hello', 2))
    expect(r.mode).toBe('insert')
    expect(r.cursorIndex).toBe(3)
  })
  it('clamps to text length at end of buffer', () => {
    const r = enterInsertAfter(state('hi', 1))
    expect(r.cursorIndex).toBe(2)
  })
})

describe('openLineBelow (o)', () => {
  it('inserts a newline after the current line and positions cursor at start of new line', () => {
    const r = openLineBelow(state('foo\nbar', 1))
    expect(r.text).toBe('foo\n\nbar')
    expect(r.cursorIndex).toBe(4)
    expect(r.mode).toBe('insert')
  })
  it('appends a newline at end of buffer when cursor is on last line', () => {
    const r = openLineBelow(state('foo', 2))
    expect(r.text).toBe('foo\n')
    expect(r.cursorIndex).toBe(4)
    expect(r.mode).toBe('insert')
  })
})

describe('openLineAbove (O)', () => {
  it('inserts a newline before the current line and positions cursor at start of new line', () => {
    const r = openLineAbove(state('foo\nbar', 4))
    expect(r.text).toBe('foo\n\nbar')
    expect(r.cursorIndex).toBe(4)
    expect(r.mode).toBe('insert')
  })
  it('prepends a newline when cursor is on first line', () => {
    const r = openLineAbove(state('foo', 1))
    expect(r.text).toBe('\nfoo')
    expect(r.cursorIndex).toBe(0)
    expect(r.mode).toBe('insert')
  })
})

describe('exitInsert (Esc)', () => {
  it('switches mode to normal and moves cursor back one within the line', () => {
    const r = exitInsert(state('hello', 3, 'insert'))
    expect(r.mode).toBe('normal')
    expect(r.cursorIndex).toBe(2)
  })
  it('does not move cursor past the start of the line', () => {
    const r = exitInsert(state('foo\nbar', 4, 'insert'))
    expect(r.mode).toBe('normal')
    expect(r.cursorIndex).toBe(4)
  })
  it('does not move cursor below 0', () => {
    const r = exitInsert(state('foo', 0, 'insert'))
    expect(r.mode).toBe('normal')
    expect(r.cursorIndex).toBe(0)
  })
})
```

- [ ] **Step 3.2: Run tests — expect failure**

Run: `npm run test:run -- src/v2/engine/mode-motions.test.ts`
Expected: FAIL — module not found.

- [ ] **Step 3.3: Implement `src/v2/engine/mode-motions.ts`**

```ts
import type { EditableState } from './editable-types'
import { insertAt } from './edits'
import { findLineStart, findLineEnd } from './text-utils'

export function enterInsertBefore(state: EditableState): EditableState {
  return { ...state, mode: 'insert' }
}

export function enterInsertAfter(state: EditableState): EditableState {
  const nextCursor = Math.min(state.text.length, state.cursorIndex + 1)
  return { ...state, mode: 'insert', cursorIndex: nextCursor }
}

export function openLineBelow(state: EditableState): EditableState {
  const lineEnd = findLineEnd(state.text, state.cursorIndex)
  // findLineEnd returns the last non-newline column; insert AFTER that index.
  const insertAtIndex = lineEnd + 1
  const text = insertAt(state.text, insertAtIndex, '\n')
  return {
    ...state,
    text,
    cursorIndex: insertAtIndex + 1,
    mode: 'insert',
  }
}

export function openLineAbove(state: EditableState): EditableState {
  const lineStart = findLineStart(state.text, state.cursorIndex)
  const text = insertAt(state.text, lineStart, '\n')
  return {
    ...state,
    text,
    cursorIndex: lineStart,
    mode: 'insert',
  }
}

export function exitInsert(state: EditableState): EditableState {
  const lineStart = findLineStart(state.text, state.cursorIndex)
  const nextCursor = Math.max(lineStart, state.cursorIndex - 1)
  return { ...state, mode: 'normal', cursorIndex: nextCursor }
}
```

- [ ] **Step 3.4: Run tests — all should pass**

Run: `npm run test:run -- src/v2/engine/mode-motions.test.ts`
Expected: all tests pass.

- [ ] **Step 3.5: Commit**

```bash
git add src/v2/engine/mode-motions.ts src/v2/engine/mode-motions.test.ts
git commit -m "$(cat <<'EOF'
feat(v2): add insert-mode transitions (i a o O Esc)

Five pure state-transition helpers. openLineBelow uses findLineEnd
to skip past the current line's content; openLineAbove inserts at
findLineStart. exitInsert applies vim's classic "back one column"
clamped to the line start.

Co-Authored-By: Claude Opus 4.7 (1M context) <noreply@anthropic.com>
EOF
)"
```

---

## Task 4: Operators — x, D, C, d+motion, c+motion, dd, cc (TDD)

**Files:**
- Create: `src/v2/engine/operators.test.ts`
- Create: `src/v2/engine/operators.ts`

- [ ] **Step 4.1: Write failing tests**

```ts
import { describe, it, expect } from 'vitest'
import {
  deleteUnderCursor,
  deleteToEndOfLine,
  changeToEndOfLine,
  applyOperatorWithMotion,
  deleteLine,
} from './operators'
import type { EditableState } from './editable-types'

function s(text: string, cursorIndex: number): EditableState {
  return {
    text,
    cursorIndex,
    mode: 'normal',
    pendingOperator: null,
    keystrokes: 0,
  }
}

describe('deleteUnderCursor (x)', () => {
  it('removes the character at the cursor', () => {
    const r = deleteUnderCursor(s('hello', 2))
    expect(r.text).toBe('helo')
    expect(r.cursorIndex).toBe(2)
  })
  it('clamps cursor back when removing the last char of a line', () => {
    const r = deleteUnderCursor(s('hi', 1))
    expect(r.text).toBe('h')
    expect(r.cursorIndex).toBe(0)
  })
  it('is a no-op on an empty buffer', () => {
    const r = deleteUnderCursor(s('', 0))
    expect(r.text).toBe('')
    expect(r.cursorIndex).toBe(0)
  })
})

describe('deleteToEndOfLine (D)', () => {
  it('deletes from cursor to end of line, not including newline', () => {
    const r = deleteToEndOfLine(s('hello world\nnext', 6))
    expect(r.text).toBe('hello \nnext')
    expect(r.cursorIndex).toBe(5)
  })
  it('handles a single-line buffer', () => {
    const r = deleteToEndOfLine(s('hello', 2))
    expect(r.text).toBe('he')
    expect(r.cursorIndex).toBe(1)
  })
})

describe('changeToEndOfLine (C)', () => {
  it('deletes to end of line and enters insert mode', () => {
    const r = changeToEndOfLine(s('hello world', 6))
    expect(r.text).toBe('hello ')
    expect(r.mode).toBe('insert')
    expect(r.cursorIndex).toBe(6)
  })
})

describe('deleteLine (dd)', () => {
  it('deletes the only line and leaves empty text', () => {
    const r = deleteLine(s('alone', 2))
    expect(r.text).toBe('')
    expect(r.cursorIndex).toBe(0)
  })
  it('deletes a middle line including its trailing newline', () => {
    const r = deleteLine(s('alpha\nbeta\ngamma', 7))
    expect(r.text).toBe('alpha\ngamma')
    expect(r.cursorIndex).toBe(6)
  })
  it('deletes the last line including its leading newline', () => {
    const r = deleteLine(s('alpha\nbeta', 7))
    expect(r.text).toBe('alpha')
    expect(r.cursorIndex).toBe(0)
  })
  it('deletes the first line of a multi-line buffer', () => {
    const r = deleteLine(s('alpha\nbeta', 2))
    expect(r.text).toBe('beta')
    expect(r.cursorIndex).toBe(0)
  })
})

describe('applyOperatorWithMotion (d + w)', () => {
  it('deletes the range from cursor to the motion target', () => {
    const start = s('the quick brown', 0)
    const r = applyOperatorWithMotion(start, 'd', 'w')
    expect(r.text).toBe('quick brown')
    expect(r.cursorIndex).toBe(0)
    expect(r.mode).toBe('normal')
  })
  it('with a backward motion, deletes the range and moves cursor back', () => {
    const start = s('the quick brown', 10)
    const r = applyOperatorWithMotion(start, 'd', 'b')
    expect(r.text).toBe('the brown')
    expect(r.cursorIndex).toBe(4)
  })
})

describe('applyOperatorWithMotion (c + w)', () => {
  it('deletes only the word (not trailing whitespace) and enters insert mode', () => {
    // Vim quirk: cw is treated as ce. Two spaces remain so the user can
    // re-type the word in place without retyping the trailing space.
    const start = s('the quick brown', 4)
    const r = applyOperatorWithMotion(start, 'c', 'w')
    expect(r.text).toBe('the  brown')
    expect(r.cursorIndex).toBe(4)
    expect(r.mode).toBe('insert')
  })
})

describe('applyOperatorWithMotion (e is inclusive)', () => {
  it('d e includes the end-of-word character', () => {
    const start = s('the quick brown', 4)
    const r = applyOperatorWithMotion(start, 'd', 'e')
    expect(r.text).toBe('the  brown')
    expect(r.cursorIndex).toBe(4)
  })
})

describe('applyOperatorWithMotion ($)', () => {
  it('d $ removes through end of line inclusive', () => {
    const start = s('keep drop now', 5)
    const r = applyOperatorWithMotion(start, 'd', '$')
    expect(r.text).toBe('keep ')
    // Cursor clamps back to last char on the (now-shorter) line.
    expect(r.cursorIndex).toBe(4)
  })
})
```

- [ ] **Step 4.2: Run — expect failure**

Run: `npm run test:run -- src/v2/engine/operators.test.ts`
Expected: FAIL — module not found.

- [ ] **Step 4.3: Implement `src/v2/engine/operators.ts`**

```ts
import type { EditableState, OperatorKind } from './editable-types'
import { deleteRange } from './edits'
import { findLineStart, findLineEnd } from './text-utils'
import { findTextMotion, textMotionRegistry } from './text-motions'

// Motions whose deletion range includes the target character (vim semantics).
const INCLUSIVE_MOTIONS = new Set(['e', '$'])

function clampToLine(text: string, idx: number): number {
  if (text.length === 0) return 0
  const lineStart = findLineStart(text, idx)
  const nl = text.indexOf('\n', lineStart)
  const lineEnd = nl === -1 ? text.length - 1 : Math.max(lineStart, nl - 1)
  return Math.min(Math.max(0, idx), Math.max(lineStart, lineEnd))
}

export function deleteUnderCursor(state: EditableState): EditableState {
  if (state.text.length === 0) return state
  const idx = state.cursorIndex
  if (idx < 0 || idx >= state.text.length) return state
  const text = deleteRange(state.text, idx, idx + 1)
  const cursorIndex = clampToLine(text, idx)
  return { ...state, text, cursorIndex }
}

export function deleteToEndOfLine(state: EditableState): EditableState {
  const end = findLineEnd(state.text, state.cursorIndex)
  // findLineEnd points at the last char on the line; end-exclusive is end + 1.
  const text = deleteRange(state.text, state.cursorIndex, end + 1)
  if (text.length === 0) return { ...state, text, cursorIndex: 0 }
  const lineStart = findLineStart(text, state.cursorIndex)
  // After deletion, step the cursor back one within the (now-shorter) line.
  const cursorIndex = Math.max(lineStart, state.cursorIndex - 1)
  return { ...state, text, cursorIndex }
}

export function changeToEndOfLine(state: EditableState): EditableState {
  const end = findLineEnd(state.text, state.cursorIndex)
  const text = deleteRange(state.text, state.cursorIndex, end + 1)
  return { ...state, text, mode: 'insert' }
}

export function deleteLine(state: EditableState): EditableState {
  const lineStart = findLineStart(state.text, state.cursorIndex)
  const nlAhead = state.text.indexOf('\n', state.cursorIndex)
  if (nlAhead !== -1) {
    // First or middle line — delete content + trailing newline.
    const text = deleteRange(state.text, lineStart, nlAhead + 1)
    const cursorIndex = Math.min(text.length, lineStart)
    return { ...state, text, cursorIndex }
  }
  if (lineStart === 0) {
    // Only line in the buffer — delete to end of text.
    return { ...state, text: '', cursorIndex: 0 }
  }
  // Last line of multi-line — delete leading newline + content.
  const text = state.text.slice(0, lineStart - 1)
  const cursorIndex = findLineStart(text, text.length)
  return { ...state, text, cursorIndex }
}

// Clear current line's content but KEEP the newline. Used by cc.
export function clearLine(state: EditableState): EditableState {
  const lineStart = findLineStart(state.text, state.cursorIndex)
  const nl = state.text.indexOf('\n', state.cursorIndex)
  const rangeEnd = nl === -1 ? state.text.length : nl
  const text = deleteRange(state.text, lineStart, rangeEnd)
  return { ...state, text, cursorIndex: lineStart }
}

export function applyOperatorWithMotion(
  state: EditableState,
  op: OperatorKind,
  motionKey: string,
): EditableState {
  // Vim quirk: `cw` is treated as `ce` so it doesn't eat trailing whitespace.
  const effectiveMotionKey =
    op === 'c' && motionKey === 'w' ? 'e' : motionKey
  const motion = findTextMotion(textMotionRegistry, effectiveMotionKey)
  if (!motion) return state
  const target = motion.apply(
    { text: state.text, cursorIndex: state.cursorIndex, keystrokes: 0 },
    { key: effectiveMotionKey },
  ).state.cursorIndex
  // No-op motion (target === cursor): consume the operator but make no change.
  if (target === state.cursorIndex) {
    return { ...state, mode: op === 'c' ? 'insert' : 'normal' }
  }
  const start = Math.min(state.cursorIndex, target)
  const endRaw = Math.max(state.cursorIndex, target)
  const end = INCLUSIVE_MOTIONS.has(effectiveMotionKey)
    ? Math.min(state.text.length, endRaw + 1)
    : endRaw
  const text = deleteRange(state.text, start, end)
  const cursorIndex = clampToLine(text, start)
  return {
    ...state,
    text,
    cursorIndex,
    mode: op === 'c' ? 'insert' : 'normal',
  }
}
```

- [ ] **Step 4.4: Run — all should pass**

Run: `npm run test:run -- src/v2/engine/operators.test.ts`
Expected: all pass.

- [ ] **Step 4.5: Commit**

```bash
git add src/v2/engine/operators.ts src/v2/engine/operators.test.ts
git commit -m "$(cat <<'EOF'
feat(v2): add operators (x D C dd cc and d/c + motion)

deleteUnderCursor handles x, deleteToEndOfLine handles D,
changeToEndOfLine handles C. applyOperatorWithMotion takes any
text-motion key and turns the motion's target into a deletion
range — covers dw cw db cb d$ c$ and de/ce. deleteLine implements
dd/cc on the current line including the appropriate newline.

Co-Authored-By: Claude Opus 4.7 (1M context) <noreply@anthropic.com>
EOF
)"
```

---

## Task 5: Unified `applyEditableKey` dispatcher (TDD)

**Files:**
- Create: `src/v2/engine/editable-engine.test.ts`
- Create: `src/v2/engine/editable-engine.ts`

- [ ] **Step 5.1: Write failing tests**

```ts
import { describe, it, expect } from 'vitest'
import { applyEditableKey, freshNormal } from './editable-engine'
import type { EditableState } from './editable-types'

function drive(start: EditableState, keys: string[]): EditableState {
  return keys.reduce(
    (acc, k) => applyEditableKey(acc, { key: k }).state,
    start,
  )
}

describe('applyEditableKey — motions', () => {
  it('routes w through the text motion registry in normal mode', () => {
    const r = applyEditableKey(freshNormal('the quick fox', 0), { key: 'w' })
    expect(r.consumed).toBe(true)
    expect(r.state.cursorIndex).toBe(4)
    expect(r.state.keystrokes).toBe(1)
  })
})

describe('applyEditableKey — insert mode entries', () => {
  it('i enters insert mode and counts as a keystroke', () => {
    const r = applyEditableKey(freshNormal('hello', 2), { key: 'i' })
    expect(r.state.mode).toBe('insert')
    expect(r.state.keystrokes).toBe(1)
  })
  it('a advances cursor and enters insert mode', () => {
    const r = applyEditableKey(freshNormal('hello', 2), { key: 'a' })
    expect(r.state.cursorIndex).toBe(3)
    expect(r.state.mode).toBe('insert')
  })
  it('o opens a line below and enters insert mode', () => {
    const r = applyEditableKey(freshNormal('foo', 1), { key: 'o' })
    expect(r.state.text).toBe('foo\n')
    expect(r.state.mode).toBe('insert')
    expect(r.state.cursorIndex).toBe(4)
  })
})

describe('applyEditableKey — insert mode behavior', () => {
  it('inserts a printable char and advances cursor', () => {
    const after = drive(freshNormal('he', 2), ['a', 'y'])
    expect(after.text).toBe('hey')
    expect(after.mode).toBe('insert')
    expect(after.cursorIndex).toBe(3)
  })
  it('Escape exits insert mode and moves cursor back one', () => {
    const after = drive(freshNormal('he', 2), ['a', 'y', 'Escape'])
    expect(after.text).toBe('hey')
    expect(after.mode).toBe('normal')
    expect(after.cursorIndex).toBe(2)
  })
  it('Enter inserts a newline in insert mode', () => {
    const after = drive(freshNormal('ab', 1), ['i', 'Enter'])
    expect(after.text).toBe('a\nb')
    expect(after.cursorIndex).toBe(2)
  })
  it('Backspace removes the char before the cursor', () => {
    const after = drive(freshNormal('abc', 1), ['i', 'Backspace'])
    expect(after.text).toBe('bc')
    expect(after.cursorIndex).toBe(0)
  })
  it('Backspace at start of line is a no-op (no line-joining in v1)', () => {
    const after = drive(freshNormal('a\nb', 2), ['i', 'Backspace'])
    expect(after.text).toBe('a\nb')
  })
  it('keystrokes increment for every consumed insert-mode key', () => {
    const after = drive(freshNormal('', 0), ['i', 'h', 'i'])
    expect(after.keystrokes).toBe(3)
  })
})

describe('applyEditableKey — operators', () => {
  it('x deletes the character under the cursor', () => {
    const after = drive(freshNormal('hello', 2), ['x'])
    expect(after.text).toBe('helo')
    expect(after.cursorIndex).toBe(2)
  })
  it('dw composes operator + motion', () => {
    const after = drive(freshNormal('the quick brown', 0), ['d', 'w'])
    expect(after.text).toBe('quick brown')
    expect(after.pendingOperator).toBe(null)
  })
  it('dd deletes the current line', () => {
    const after = drive(freshNormal('alpha\nbeta\ngamma', 7), ['d', 'd'])
    expect(after.text).toBe('alpha\ngamma')
  })
  it('cc clears the current line content but keeps the newline, enters insert mode', () => {
    const after = drive(freshNormal('alpha\nbeta\ngamma', 7), ['c', 'c'])
    expect(after.text).toBe('alpha\n\ngamma')
    expect(after.cursorIndex).toBe(6)
    expect(after.mode).toBe('insert')
  })
  it('cw deletes only the word and enters insert mode', () => {
    // cw → ce semantics: trailing space stays so user can type replacement.
    const after = drive(freshNormal('the old fox', 4), ['c', 'w'])
    expect(after.text).toBe('the  fox')
    expect(after.mode).toBe('insert')
  })
  it('typing the replacement after cw produces the natural single-space result', () => {
    // The whole "change old to new" flow: cw + n + e + w + Escape on 'the |old fox'.
    const after = drive(freshNormal('the old fox', 4), [
      'c', 'w', 'n', 'e', 'w', 'Escape',
    ])
    expect(after.text).toBe('the new fox')
    expect(after.mode).toBe('normal')
  })
  it('D deletes to end of line', () => {
    const after = drive(freshNormal('keep me drop this', 7), ['D'])
    expect(after.text).toBe('keep me')
  })
  it('Escape during pending operator clears the pending state', () => {
    const after = drive(freshNormal('hello', 0), ['d', 'Escape'])
    expect(after.pendingOperator).toBe(null)
    expect(after.mode).toBe('normal')
  })
})

describe('applyEditableKey — keystroke accounting', () => {
  it('does not count an unmapped key in normal mode', () => {
    const r = applyEditableKey(freshNormal('hello', 0), { key: 'Q' })
    expect(r.consumed).toBe(false)
    expect(r.state.keystrokes).toBe(0)
  })
  it('counts every consumed normal-mode key including the operator prefix', () => {
    const after = drive(freshNormal('the quick brown', 0), ['d', 'w'])
    expect(after.keystrokes).toBe(2)
  })
})
```

- [ ] **Step 5.2: Run — expect failure**

Run: `npm run test:run -- src/v2/engine/editable-engine.test.ts`
Expected: FAIL — module not found.

- [ ] **Step 5.3: Implement `src/v2/engine/editable-engine.ts`**

```ts
import type { KeyEvent } from './types'
import type { EditableResult, EditableState, OperatorKind } from './editable-types'
import { applyTextKey, findTextMotion, textMotionRegistry } from './text-motions'
import {
  enterInsertBefore,
  enterInsertAfter,
  openLineBelow,
  openLineAbove,
  exitInsert,
} from './mode-motions'
import {
  applyOperatorWithMotion,
  changeToEndOfLine,
  clearLine,
  deleteLine,
  deleteToEndOfLine,
  deleteUnderCursor,
} from './operators'
import { deleteRange, insertAt } from './edits'
import { findLineStart } from './text-utils'

export function freshNormal(text: string, cursorIndex: number): EditableState {
  return {
    text,
    cursorIndex,
    mode: 'normal',
    pendingOperator: null,
    keystrokes: 0,
  }
}

function inc(state: EditableState): EditableState {
  return { ...state, keystrokes: state.keystrokes + 1 }
}

function isPrintable(key: string): boolean {
  return key.length === 1
}

function handleInsertMode(state: EditableState, key: string): EditableResult {
  if (key === 'Escape') {
    return { state: inc(exitInsert(state)), consumed: true }
  }
  if (key === 'Backspace') {
    if (state.cursorIndex === 0) {
      return { state: inc(state), consumed: true }
    }
    const lineStart = findLineStart(state.text, state.cursorIndex)
    if (state.cursorIndex === lineStart) {
      // No line-joining in v1; consume the keystroke but don't mutate.
      return { state: inc(state), consumed: true }
    }
    const text = deleteRange(state.text, state.cursorIndex - 1, state.cursorIndex)
    return {
      state: inc({ ...state, text, cursorIndex: state.cursorIndex - 1 }),
      consumed: true,
    }
  }
  if (key === 'Enter') {
    const text = insertAt(state.text, state.cursorIndex, '\n')
    return {
      state: inc({ ...state, text, cursorIndex: state.cursorIndex + 1 }),
      consumed: true,
    }
  }
  if (isPrintable(key)) {
    const text = insertAt(state.text, state.cursorIndex, key)
    return {
      state: inc({ ...state, text, cursorIndex: state.cursorIndex + 1 }),
      consumed: true,
    }
  }
  return { state, consumed: false }
}

function handlePendingOperator(
  state: EditableState,
  key: string,
): EditableResult {
  const op = state.pendingOperator as OperatorKind
  if (key === 'Escape') {
    return {
      state: inc({ ...state, pendingOperator: null }),
      consumed: true,
    }
  }
  // dd / cc — repeat operator on the current line.
  if (key === op) {
    const cleared: EditableState = { ...state, pendingOperator: null }
    if (op === 'd') {
      return { state: inc(deleteLine(cleared)), consumed: true }
    }
    // cc: clear the line but keep the newline; enter insert mode at line start.
    const lineCleared = clearLine(cleared)
    return {
      state: inc({ ...lineCleared, mode: 'insert' }),
      consumed: true,
    }
  }
  // Operator + motion (e.g. dw, cw, d$).
  const motion = findTextMotion(textMotionRegistry, key)
  if (motion) {
    const cleared: EditableState = { ...state, pendingOperator: null }
    const next = applyOperatorWithMotion(cleared, op, key)
    return { state: inc(next), consumed: true }
  }
  // Unknown follow-up — clear pending state but do NOT consume the key.
  return {
    state: { ...state, pendingOperator: null },
    consumed: false,
  }
}

function handleNormalMode(state: EditableState, key: string): EditableResult {
  switch (key) {
    case 'i':
      return { state: inc(enterInsertBefore(state)), consumed: true }
    case 'a':
      return { state: inc(enterInsertAfter(state)), consumed: true }
    case 'o':
      return { state: inc(openLineBelow(state)), consumed: true }
    case 'O':
      return { state: inc(openLineAbove(state)), consumed: true }
    case 'Escape':
      return { state: inc({ ...state, pendingOperator: null }), consumed: true }
    case 'x':
      return { state: inc(deleteUnderCursor(state)), consumed: true }
    case 'D':
      return { state: inc(deleteToEndOfLine(state)), consumed: true }
    case 'C':
      return { state: inc(changeToEndOfLine(state)), consumed: true }
    case 'd':
      return { state: inc({ ...state, pendingOperator: 'd' }), consumed: true }
    case 'c':
      return { state: inc({ ...state, pendingOperator: 'c' }), consumed: true }
  }
  // Motion: delegate to the text engine for the cursor update, then re-emit.
  const textResult = applyTextKey(
    { text: state.text, cursorIndex: state.cursorIndex, keystrokes: state.keystrokes },
    { key },
    textMotionRegistry,
  )
  if (!textResult.consumed) return { state, consumed: false }
  return {
    state: {
      ...state,
      cursorIndex: textResult.state.cursorIndex,
      keystrokes: textResult.state.keystrokes,
    },
    consumed: true,
  }
}

export function applyEditableKey(
  state: EditableState,
  event: KeyEvent,
): EditableResult {
  if (state.mode === 'insert') return handleInsertMode(state, event.key)
  if (state.pendingOperator) return handlePendingOperator(state, event.key)
  return handleNormalMode(state, event.key)
}
```

- [ ] **Step 5.4: Run — all should pass**

Run: `npm run test:run -- src/v2/engine/editable-engine.test.ts`
Expected: all pass.

- [ ] **Step 5.5: Commit**

```bash
git add src/v2/engine/editable-engine.ts src/v2/engine/editable-engine.test.ts
git commit -m "$(cat <<'EOF'
feat(v2): add applyEditableKey dispatcher (modes + operators + motions)

Top-level entry point for unit-4/5 stages. Dispatches by mode:
  - insert: printable inserts, Backspace, Enter, Escape exit
  - pending operator (after d/c): motion completes the op, or
    repeated key (dd/cc) deletes the line
  - normal: mode entries (i a o O), operators (x D C), pending
    setters (d c), and motion delegation to text-motions.

Every consumed key increments keystrokes, including the operator
prefix (so 'dw' costs 2). Unmapped normal-mode keys are not
consumed and do not count.

Co-Authored-By: Claude Opus 4.7 (1M context) <noreply@anthropic.com>
EOF
)"
```

---

## Task 6: Editable grader (TDD)

**Files:**
- Create: `src/v2/engine/editable-grader.test.ts`
- Create: `src/v2/engine/editable-grader.ts`

- [ ] **Step 6.1: Write failing tests**

```ts
import { describe, it, expect } from 'vitest'
import { matchesGoal } from './editable-grader'
import { freshNormal } from './editable-engine'

describe('matchesGoal', () => {
  it('matches when text alone is required and matches', () => {
    expect(matchesGoal(freshNormal('hello', 0), { text: 'hello' })).toBe(true)
  })
  it('rejects on text mismatch', () => {
    expect(matchesGoal(freshNormal('hello', 0), { text: 'helo' })).toBe(false)
  })
  it('matches cursorIndex when specified', () => {
    expect(matchesGoal(freshNormal('hello', 3), { text: 'hello', cursorIndex: 3 })).toBe(true)
    expect(matchesGoal(freshNormal('hello', 2), { text: 'hello', cursorIndex: 3 })).toBe(false)
  })
  it('matches mode when specified', () => {
    expect(matchesGoal({ ...freshNormal('hi', 0), mode: 'normal' }, { text: 'hi', mode: 'normal' })).toBe(true)
    expect(matchesGoal({ ...freshNormal('hi', 0), mode: 'insert' }, { text: 'hi', mode: 'normal' })).toBe(false)
  })
})
```

- [ ] **Step 6.2: Run — expect failure**

Run: `npm run test:run -- src/v2/engine/editable-grader.test.ts`
Expected: FAIL.

- [ ] **Step 6.3: Implement `src/v2/engine/editable-grader.ts`**

```ts
import type { EditableState, Mode } from './editable-types'

export interface EditableGoal {
  text: string
  cursorIndex?: number
  mode?: Mode
}

export function matchesGoal(state: EditableState, goal: EditableGoal): boolean {
  if (state.text !== goal.text) return false
  if (goal.cursorIndex !== undefined && state.cursorIndex !== goal.cursorIndex) {
    return false
  }
  if (goal.mode !== undefined && state.mode !== goal.mode) return false
  return true
}
```

- [ ] **Step 6.4: Run — should pass**

Run: `npm run test:run -- src/v2/engine/editable-grader.test.ts`
Expected: pass.

- [ ] **Step 6.5: Commit**

```bash
git add src/v2/engine/editable-grader.ts src/v2/engine/editable-grader.test.ts
git commit -m "$(cat <<'EOF'
feat(v2): add editable grader (matchesGoal)

Partial match: text is required; cursorIndex and mode are optional.
This lets unit authors write puzzles that only care about end-state
text (most common) without pinning cursor position.

Co-Authored-By: Claude Opus 4.7 (1M context) <noreply@anthropic.com>
EOF
)"
```

---

## Task 7: Extend unit type unions with edit-stage variants

**Files:**
- Modify: `src/v2/wings/learn/units/types.ts`

- [ ] **Step 7.1: Append the new variants and union members**

Add the following to `src/v2/wings/learn/units/types.ts` (preserving the existing content). The full file becomes:

```ts
import type { Point } from '../../../engine/grader'
import type { EditableGoal } from '../../../engine/editable-grader'

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

export interface EditChallenge {
  id: string
  hint: string
  startText: string
  startCursorIndex: number
  goal: EditableGoal
}

export interface AEditDrillDef {
  kind: 'a-drill-edit'
  challenges: EditChallenge[]
  allowedKeys: string[]
}

export type AStageDef = AGridDrillDef | ATextDrillDef | AEditDrillDef

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

export interface BEditPuzzle {
  id: string
  hint: string
  startText: string
  startCursorIndex: number
  goal: EditableGoal
  par: number
}

export interface BEditStageDef {
  kind: 'b-check-edit-puzzles'
  puzzles: BEditPuzzle[]
  allowedKeys: string[]
}

export type BStageDef = BGridStageDef | BTextStageDef | BEditStageDef

export interface Unit {
  id: string
  title: string
  motionLabel: string
  aStage: AStageDef
  bStage: BStageDef
}
```

- [ ] **Step 7.2: Verify**

Run: `npx tsc --noEmit && npm run test:run`
Expected: no tsc errors; tests still pass (no existing data uses the new variants yet).

- [ ] **Step 7.3: Commit**

```bash
git add src/v2/wings/learn/units/types.ts
git commit -m "$(cat <<'EOF'
refactor(v2): add edit-stage variants to AStageDef/BStageDef

AEditDrillDef carries a list of EditChallenge (start text, hint,
goal). BEditStageDef carries BEditPuzzle (same shape + par). The
grid and text variants are unchanged; this is purely additive.

Co-Authored-By: Claude Opus 4.7 (1M context) <noreply@anthropic.com>
EOF
)"
```

---

## Task 8: `ADrillStageEdit` component

**Files:**
- Create: `src/v2/wings/learn/stages/ADrillStageEdit.tsx`

- [ ] **Step 8.1: Implement**

```tsx
import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { applyEditableKey, freshNormal } from '../../../engine/editable-engine'
import { matchesGoal } from '../../../engine/editable-grader'
import type { EditableState } from '../../../engine/editable-types'
import type { AEditDrillDef, EditChallenge } from '../units/types'

interface Props {
  def: AEditDrillDef
  onCompleted: () => void
}

function freshFor(c: EditChallenge): EditableState {
  return freshNormal(c.startText, c.startCursorIndex)
}

function isEventKey(e: KeyboardEvent): string {
  return e.key
}

export default function ADrillStageEdit({ def, onCompleted }: Props) {
  const [idx, setIdx] = useState(0)
  const [state, setState] = useState<EditableState>(() => freshFor(def.challenges[0]))
  const completedRef = useRef(false)
  const challenge = def.challenges[idx]

  const handleKeyDown = useCallback(
    (e: KeyboardEvent) => {
      if (completedRef.current) return
      const key = isEventKey(e)
      // Insert mode accepts anything; normal mode is filtered.
      if (state.mode === 'normal' && !def.allowedKeys.includes(key)) return
      e.preventDefault()
      const { state: next } = applyEditableKey(state, { key })
      if (matchesGoal(next, challenge.goal)) {
        const nextIdx = idx + 1
        if (nextIdx >= def.challenges.length) {
          completedRef.current = true
          setState(next)
          queueMicrotask(onCompleted)
        } else {
          setIdx(nextIdx)
          setState(freshFor(def.challenges[nextIdx]))
        }
      } else {
        setState(next)
      }
    },
    [def.allowedKeys, def.challenges, state, idx, challenge.goal, onCompleted],
  )

  useEffect(() => {
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [handleKeyDown])

  const renderedCurrent = useMemo(
    () => renderText(state.text, state.cursorIndex, state.mode),
    [state.text, state.cursorIndex, state.mode],
  )
  const renderedGoal = useMemo(
    () => renderText(challenge.goal.text, -1, 'normal'),
    [challenge.goal.text],
  )

  return (
    <div className="flex flex-col items-center gap-6 p-8">
      <div className="text-sm text-gray-400">
        Drill {idx + 1} / {def.challenges.length} ·{' '}
        <span className="text-orange-300">{challenge.hint}</span>
      </div>
      <div className="flex w-full max-w-3xl flex-col gap-2 font-mono text-base">
        <div className="text-xs uppercase tracking-wider text-gray-500">You</div>
        <div className="whitespace-pre-wrap rounded border border-gray-800 bg-gray-900/50 p-4 leading-relaxed">
          {renderedCurrent}
        </div>
        <div className="mt-3 text-xs uppercase tracking-wider text-gray-500">Goal</div>
        <div className="whitespace-pre-wrap rounded border border-green-900 bg-green-950/30 p-4 leading-relaxed text-green-300">
          {renderedGoal}
        </div>
      </div>
      <div className="text-xs text-gray-500">
        Mode:{' '}
        <span className="font-mono text-orange-300">{state.mode.toUpperCase()}</span>
        {state.pendingOperator && (
          <>
            {' '}
            · Pending:{' '}
            <span className="font-mono text-orange-300">{state.pendingOperator}</span>
          </>
        )}
      </div>
    </div>
  )
}

function renderText(text: string, cursorIndex: number, mode: 'normal' | 'insert') {
  const out: React.ReactNode[] = []
  const len = text.length
  for (let i = 0; i <= len; i++) {
    const isCursor = i === cursorIndex
    if (i === len) {
      if (isCursor) {
        out.push(
          <span key={`cursor-${i}`} className="bg-orange-500 text-black">
            {mode === 'insert' ? '|' : ' '}
          </span>,
        )
      }
      continue
    }
    const ch = text[i]
    out.push(
      <span
        key={i}
        className={
          isCursor
            ? mode === 'insert'
              ? 'border-l-2 border-orange-400 text-gray-100'
              : 'bg-orange-500 text-black'
            : 'text-gray-300'
        }
      >
        {ch === '\n' ? <br /> : ch === ' ' ? ' ' : ch}
      </span>,
    )
  }
  return out
}
```

- [ ] **Step 8.2: Verify**

Run: `npx tsc --noEmit`
Expected: no errors.

- [ ] **Step 8.3: Commit**

```bash
git add src/v2/wings/learn/stages/ADrillStageEdit.tsx
git commit -m "$(cat <<'EOF'
feat(v2): add ADrillStageEdit — guided edit drill

Walks the player through a sequence of (start, goal, hint)
challenges. Allowed-keys filter applies only in normal mode so
insert-mode typing is unrestricted. Renders 'You' vs 'Goal'
side-by-side with a mode/pending-operator hint below.

Co-Authored-By: Claude Opus 4.7 (1M context) <noreply@anthropic.com>
EOF
)"
```

---

## Task 9: `BCheckStageEdit` component

**Files:**
- Create: `src/v2/wings/learn/stages/BCheckStageEdit.tsx`

- [ ] **Step 9.1: Implement**

```tsx
import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { applyEditableKey, freshNormal } from '../../../engine/editable-engine'
import { matchesGoal } from '../../../engine/editable-grader'
import type { EditableState } from '../../../engine/editable-types'
import type { BEditPuzzle, BEditStageDef } from '../units/types'

interface Props {
  def: BEditStageDef
  onCompleted: () => void
}

interface PuzzleResult {
  puzzleId: string
  keystrokes: number
  par: number
}

function freshFor(p: BEditPuzzle): EditableState {
  return freshNormal(p.startText, p.startCursorIndex)
}

export default function BCheckStageEdit({ def, onCompleted }: Props) {
  const [puzzleIdx, setPuzzleIdx] = useState(0)
  const [state, setState] = useState<EditableState>(() => freshFor(def.puzzles[0]))
  const [results, setResults] = useState<PuzzleResult[]>([])
  const completedRef = useRef(false)
  const puzzle = def.puzzles[puzzleIdx]

  const handleKeyDown = useCallback(
    (e: KeyboardEvent) => {
      if (completedRef.current) return
      if (state.mode === 'normal' && !def.allowedKeys.includes(e.key)) return
      e.preventDefault()
      const { state: next } = applyEditableKey(state, { key: e.key })
      if (matchesGoal(next, puzzle.goal)) {
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
          setState(freshFor(def.puzzles[nextIdx]))
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

  const renderedCurrent = useMemo(
    () => renderText(state.text, state.cursorIndex, state.mode),
    [state.text, state.cursorIndex, state.mode],
  )
  const renderedGoal = useMemo(
    () => renderText(puzzle.goal.text, -1, 'normal'),
    [puzzle.goal.text],
  )

  return (
    <div className="flex flex-col items-center gap-6 p-8">
      <div className="text-sm text-gray-400">
        Puzzle {puzzleIdx + 1} / {def.puzzles.length} · Par{' '}
        <span className="font-mono text-orange-300">{puzzle.par}</span> keystrokes ·{' '}
        <span className="text-gray-500">{puzzle.hint}</span>
      </div>
      <div className="flex w-full max-w-3xl flex-col gap-2 font-mono text-base">
        <div className="text-xs uppercase tracking-wider text-gray-500">You</div>
        <div className="whitespace-pre-wrap rounded border border-gray-800 bg-gray-900/50 p-4 leading-relaxed">
          {renderedCurrent}
        </div>
        <div className="mt-3 text-xs uppercase tracking-wider text-gray-500">Goal</div>
        <div className="whitespace-pre-wrap rounded border border-green-900 bg-green-950/30 p-4 leading-relaxed text-green-300">
          {renderedGoal}
        </div>
      </div>
      <div className="text-sm text-gray-300">
        Strokes:{' '}
        <span
          className={`font-mono ${
            state.keystrokes > puzzle.par ? 'text-red-400' : 'text-green-400'
          }`}
        >
          {state.keystrokes}
        </span>{' '}
        · Mode:{' '}
        <span className="font-mono text-orange-300">{state.mode.toUpperCase()}</span>
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

function renderText(text: string, cursorIndex: number, mode: 'normal' | 'insert') {
  const out: React.ReactNode[] = []
  const len = text.length
  for (let i = 0; i <= len; i++) {
    const isCursor = i === cursorIndex
    if (i === len) {
      if (isCursor) {
        out.push(
          <span key={`cursor-${i}`} className="bg-orange-500 text-black">
            {mode === 'insert' ? '|' : ' '}
          </span>,
        )
      }
      continue
    }
    const ch = text[i]
    out.push(
      <span
        key={i}
        className={
          isCursor
            ? mode === 'insert'
              ? 'border-l-2 border-orange-400 text-gray-100'
              : 'bg-orange-500 text-black'
            : 'text-gray-300'
        }
      >
        {ch === '\n' ? <br /> : ch === ' ' ? ' ' : ch}
      </span>,
    )
  }
  return out
}
```

- [ ] **Step 9.2: Verify**

Run: `npx tsc --noEmit`
Expected: no errors.

- [ ] **Step 9.3: Commit**

```bash
git add src/v2/wings/learn/stages/BCheckStageEdit.tsx
git commit -m "$(cat <<'EOF'
feat(v2): add BCheckStageEdit — par-graded edit puzzles

Same shape as BCheckStageText but on EditableState with goal-state
matching via matchesGoal. Allowed-keys filter applies only in
normal mode. Renders You / Goal side-by-side with the live cursor
and mode badge.

Co-Authored-By: Claude Opus 4.7 (1M context) <noreply@anthropic.com>
EOF
)"
```

---

## Task 10: Define unit 4 (insert modes) data

**Files:**
- Create: `src/v2/wings/learn/units/insertModes.ts`

- [ ] **Step 10.1: Implement**

```ts
import type { Unit } from './types'

// Allowed keys mirror previously-learned units plus the new ones.
// (Per the lineEdges precedent: previously-learned motions stay available.)
const MOVES = ['h', 'j', 'k', 'l', 'w', 'b', 'e', '0', '$', '^']
const NEW = ['i', 'a', 'o', 'O', 'Escape']

export const insertModesUnit: Unit = {
  id: 'insertModes',
  title: 'Insert Modes',
  motionLabel: 'i a o O Esc',
  aStage: {
    kind: 'a-drill-edit',
    allowedKeys: [...MOVES, ...NEW],
    challenges: [
      {
        id: 'insert-i',
        hint: "Insert 'pre' before the word using `i`.",
        startText: 'word',
        startCursorIndex: 0,
        goal: { text: 'preword' },
      },
      {
        id: 'insert-a',
        hint: "Append 'ed' to the word using `a`.",
        startText: 'walk',
        startCursorIndex: 3,
        goal: { text: 'walked' },
      },
      {
        id: 'insert-o',
        hint: "Open a line below and add 'beta' using `o`.",
        startText: 'alpha\ngamma',
        startCursorIndex: 0,
        goal: { text: 'alpha\nbeta\ngamma' },
      },
      {
        id: 'insert-O',
        hint: "Open a line above and add 'title' using `O`.",
        startText: 'body',
        startCursorIndex: 0,
        goal: { text: 'title\nbody' },
      },
    ],
  },
  bStage: {
    kind: 'b-check-edit-puzzles',
    allowedKeys: [...MOVES, ...NEW],
    puzzles: [
      {
        id: 'insertModes-b1',
        hint: "Pluralize 'apple' to 'apples'.",
        startText: 'apple banana',
        startCursorIndex: 0,
        goal: { text: 'apples banana' },
        // e (to end of apple) + a + s + Escape = 4
        par: 4,
      },
      {
        id: 'insertModes-b2',
        hint: "Add a comma after 'foo'.",
        startText: 'foo bar',
        startCursorIndex: 0,
        goal: { text: 'foo, bar' },
        // e (to end of foo) + a + ',' + Escape = 4
        par: 4,
      },
      {
        id: 'insertModes-b3',
        hint: "Add a 'title' line above 'body'.",
        startText: 'body',
        startCursorIndex: 0,
        goal: { text: 'title\nbody' },
        // O + t + i + t + l + e + Escape = 7
        par: 7,
      },
    ],
  },
}
```

- [ ] **Step 10.2: Verify par values by hand**

The par counts are documented inline in the comments above. Re-derive each one when reading; if the implementer computes a different optimal, leave par as-is and note the discrepancy in the commit message.

- [ ] **Step 10.3: Verify compilation**

Run: `npx tsc --noEmit`
Expected: no errors.

- [ ] **Step 10.4: Commit**

```bash
git add src/v2/wings/learn/units/insertModes.ts
git commit -m "$(cat <<'EOF'
feat(v2): add Insert Modes unit (i a o O Esc)

Four A-drill challenges, one per mode-entry key, each demonstrating
the difference (cursor placement of i vs a, line-direction of o vs O).
Three B-check puzzles: pluralize a word, add punctuation after a
word, prepend a new title line. All solvable in 4-7 strokes.

Co-Authored-By: Claude Opus 4.7 (1M context) <noreply@anthropic.com>
EOF
)"
```

---

## Task 11: Define unit 5 (change/delete) data

**Files:**
- Create: `src/v2/wings/learn/units/changeDelete.ts`

- [ ] **Step 11.1: Implement**

```ts
import type { Unit } from './types'

// Previously-learned motions stay available plus the new operators
// and insert-mode entries (needed for cw to be solvable).
const MOVES = ['h', 'j', 'k', 'l', 'w', 'b', 'e', '0', '$', '^']
const INSERT = ['i', 'a', 'o', 'O', 'Escape']
const NEW = ['x', 'd', 'D', 'c', 'C']

export const changeDeleteUnit: Unit = {
  id: 'changeDelete',
  title: 'Change & Delete',
  motionLabel: 'x dw dd D cw C',
  aStage: {
    kind: 'a-drill-edit',
    allowedKeys: [...MOVES, ...INSERT, ...NEW],
    challenges: [
      {
        id: 'cd-x',
        hint: "Delete the stray 'q' with `x`.",
        startText: 'fooqbar',
        startCursorIndex: 3,
        goal: { text: 'foobar' },
      },
      {
        id: 'cd-dw',
        hint: "Delete the word 'quick' with `dw`.",
        startText: 'the quick brown',
        startCursorIndex: 4,
        goal: { text: 'the brown' },
      },
      {
        id: 'cd-D',
        hint: "Delete from cursor to end of line with `D`.",
        startText: 'keep me drop this',
        startCursorIndex: 7,
        goal: { text: 'keep me' },
      },
      {
        id: 'cd-cw',
        hint: "Change 'old' to 'new' with `cw`.",
        startText: 'the old fox',
        startCursorIndex: 4,
        goal: { text: 'the new fox' },
      },
      {
        id: 'cd-dd',
        hint: "Delete the middle line with `dd`.",
        startText: 'alpha\nbeta\ngamma',
        startCursorIndex: 6,
        goal: { text: 'alpha\ngamma' },
      },
    ],
  },
  bStage: {
    kind: 'b-check-edit-puzzles',
    allowedKeys: [...MOVES, ...INSERT, ...NEW],
    puzzles: [
      {
        id: 'changeDelete-b1',
        hint: "Delete the leading 'I '.",
        startText: 'I love coding',
        startCursorIndex: 0,
        goal: { text: 'love coding' },
        // d + w = 2
        par: 2,
      },
      {
        id: 'changeDelete-b2',
        hint: "Replace 'old' with 'new'.",
        startText: 'the old fox',
        startCursorIndex: 0,
        goal: { text: 'the new fox' },
        // w + c + w + n + e + w + Escape = 7
        par: 7,
      },
      {
        id: 'changeDelete-b3',
        hint: "Delete the middle line.",
        startText: 'keep\ndrop\nkeep',
        startCursorIndex: 5,
        goal: { text: 'keep\nkeep' },
        // d + d = 2
        par: 2,
      },
    ],
  },
}
```

- [ ] **Step 11.2: Verify compilation**

Run: `npx tsc --noEmit`
Expected: no errors.

- [ ] **Step 11.3: Commit**

```bash
git add src/v2/wings/learn/units/changeDelete.ts
git commit -m "$(cat <<'EOF'
feat(v2): add Change & Delete unit (x dw dd D cw C)

Five A-drill challenges covering each operator individually. Three
B-check puzzles: delete-leading-word, change-a-word, delete-a-line.
allowedKeys carries forward all previously-learned motions and
insert-mode entries (cw needs insert to be solvable).

Co-Authored-By: Claude Opus 4.7 (1M context) <noreply@anthropic.com>
EOF
)"
```

---

## Task 12: Register units 4 and 5

**Files:**
- Modify: `src/v2/wings/learn/units/registry.ts`

- [ ] **Step 12.1: Replace contents**

```ts
import type { Unit } from './types'
import { hjklUnit } from './hjkl'
import { wbeUnit } from './wbe'
import { lineEdgesUnit } from './lineEdges'
import { insertModesUnit } from './insertModes'
import { changeDeleteUnit } from './changeDelete'

export const units: Unit[] = [
  hjklUnit,
  wbeUnit,
  lineEdgesUnit,
  insertModesUnit,
  changeDeleteUnit,
]

export function findUnit(id: string): Unit | undefined {
  return units.find((u) => u.id === id)
}
```

- [ ] **Step 12.2: Verify**

Run: `npx tsc --noEmit && npm run test:run`
Expected: no errors; tests pass.

- [ ] **Step 12.3: Commit**

```bash
git add src/v2/wings/learn/units/registry.ts
git commit -m "$(cat <<'EOF'
feat(v2): register Insert Modes and Change/Delete units

Adds insertModesUnit and changeDeleteUnit to the units array. Linear
progression is preserved: insertModes unlocks after lineEdges, and
changeDelete unlocks after insertModes.

Co-Authored-By: Claude Opus 4.7 (1M context) <noreply@anthropic.com>
EOF
)"
```

---

## Task 13: Dispatch edit stages in `UnitRunner`

**Files:**
- Modify: `src/v2/wings/learn/UnitRunner.tsx`

- [ ] **Step 13.1: Add imports**

Near the existing stage imports at the top of `UnitRunner.tsx`, add:
```tsx
import ADrillStageEdit from './stages/ADrillStageEdit'
import BCheckStageEdit from './stages/BCheckStageEdit'
```

- [ ] **Step 13.2: Extend the dispatch branches**

Replace the existing two render blocks:
```tsx
{active === 'a' &&
  (unit.aStage.kind === 'a-drill-grid' ? (
    <ADrillStage key={replayKey} def={unit.aStage} onCompleted={handleAComplete} />
  ) : (
    <ADrillStageText key={replayKey} def={unit.aStage} onCompleted={handleAComplete} />
  ))}
{active === 'b' &&
  (unit.bStage.kind === 'b-check-cursor-puzzles' ? (
    <BCheckStage key={replayKey} def={unit.bStage} onCompleted={handleBComplete} />
  ) : (
    <BCheckStageText key={replayKey} def={unit.bStage} onCompleted={handleBComplete} />
  ))}
```

with:
```tsx
{active === 'a' && (() => {
  switch (unit.aStage.kind) {
    case 'a-drill-grid':
      return <ADrillStage key={replayKey} def={unit.aStage} onCompleted={handleAComplete} />
    case 'a-drill-text':
      return <ADrillStageText key={replayKey} def={unit.aStage} onCompleted={handleAComplete} />
    case 'a-drill-edit':
      return <ADrillStageEdit key={replayKey} def={unit.aStage} onCompleted={handleAComplete} />
  }
})()}
{active === 'b' && (() => {
  switch (unit.bStage.kind) {
    case 'b-check-cursor-puzzles':
      return <BCheckStage key={replayKey} def={unit.bStage} onCompleted={handleBComplete} />
    case 'b-check-text-puzzles':
      return <BCheckStageText key={replayKey} def={unit.bStage} onCompleted={handleBComplete} />
    case 'b-check-edit-puzzles':
      return <BCheckStageEdit key={replayKey} def={unit.bStage} onCompleted={handleBComplete} />
  }
})()}
```

The TypeScript discriminated-union narrowing means each `case` body sees only its specific variant — no type assertions needed.

- [ ] **Step 13.3: Verify**

Run: `npx tsc --noEmit && npm run build`
Expected: no errors; build succeeds.

- [ ] **Step 13.4: Commit**

```bash
git add src/v2/wings/learn/UnitRunner.tsx
git commit -m "$(cat <<'EOF'
feat(v2): dispatch UnitRunner stages for edit units

Switches on aStage.kind / bStage.kind with full coverage. Adds
ADrillStageEdit and BCheckStageEdit alongside the existing grid
and text variants. No behavior change for hjkl/wbe/lineEdges.

Co-Authored-By: Claude Opus 4.7 (1M context) <noreply@anthropic.com>
EOF
)"
```

---

## Task 14: End-to-end verification

**Files:** none modified — verification only.

- [ ] **Step 14.1: Full test suite**

Run: `npm run test:run`
Expected: prior 76 passes plus the new ones from this plan (edits, mode-motions, operators, editable-engine, editable-grader). Final count: 0 failed, 1 skipped (the pre-existing classic useHistory test).

- [ ] **Step 14.2: Typecheck**

Run: `npx tsc --noEmit`
Expected: no errors.

- [ ] **Step 14.3: Build**

Run: `npm run build`
Expected: success.

- [ ] **Step 14.4: Lint V2 only**

Run: `npm run lint 2>&1 | grep -E 'src/v2/' | grep error || echo "no v2 errors"`
Expected: `no v2 errors`.

- [ ] **Step 14.5: Manual browser walk (requires user)**

Run: `npm run dev`

Manual flow (clearing localStorage first to start fresh):
1. Visit `/` → redirects to `/learn/hjkl`.
2. Complete units 1, 2, 3 (or skip-walk if already familiar) until `insertModes` becomes ○ ready.
3. Click into `insertModes`. The A-drill shows challenge 1 ("Insert 'pre' before the word using `i`"). Press `i`, type `pre`, press Esc. Confirm goal hit; advance to challenge 2.
4. Complete all 4 A-drill challenges. B-check appears. Solve each of the 3 puzzles; confirm par display goes red when over par, green when under or at par.
5. Confirm sidebar marks `insertModes` ✓ and `changeDelete` becomes ○.
6. Click into `changeDelete`. Walk all 5 A-drill challenges (`x`, `dw`, `D`, `cw`, `dd`). Then 3 B-puzzles.
7. After completion, click ↻ Replay — confirm the unit resets to its A-drill and the header shows the replay chip. Progress remains intact on reload.
8. Visit `/classic` — confirm the classic app still loads.
9. Look at devtools localStorage `vimsanity-v2-progress` — confirm `insertModes.b: 'completed'` etc.

Stop the dev server.

- [ ] **Step 14.6: Final summary commit (only if any incidental fixes were made)**

If no changes during verification, skip. Otherwise commit fixes individually with clear messages (one fix per commit).

---

## Self-Review

### Spec coverage check (design doc §9.1)

- Unit 4 (`i a o O Esc` insert modes) → Tasks 1-5 (engine) + Tasks 8, 10 (stage + data)
- Unit 5 (`x d dw dd D c cw C` change/delete) → Tasks 4, 5 (engine) + Tasks 11 (data); the stage components from Tasks 8-9 are shared with unit 4
- Linear progression → unchanged (Progress store from Plan 1)
- A → B pedagogical loop → A-drill via `ADrillStageEdit`, B-check via `BCheckStageEdit`
- Previously-learned motions remain available → MOVES / INSERT spread into allowedKeys in unit data (Tasks 10, 11)

### Out-of-scope flags

- Unit 6 (yank/put) and Unit 7 (text objects) — separate plans.
- `I`, `A`, count prefixes, `.`, `u`, `Ctrl-r`, visual mode — deferred per design doc §9.1.
- Multi-line `c` and `d` with motion (e.g. `dj`) — supported by the engine because `j`/`k` are real motions, but no current unit puzzle uses them.

### Type / naming consistency

- `EditableState` — used by every editable-engine module + both new stage components.
- `EditableGoal` — exported from `editable-grader.ts`; referenced by `units/types.ts`.
- `applyEditableKey` — single dispatcher entry point, called from both stage components.
- `freshNormal(text, cursorIndex)` — exported from `editable-engine.ts`; used by both stage components.
- `EditChallenge` and `BEditPuzzle` — shape diverges only by the presence of `par` and `id` is mandatory on both.
- All discriminator strings (`'a-drill-edit'`, `'b-check-edit-puzzles'`) are referenced consistently in unit data, types, and UnitRunner dispatch.

### Pattern reuse from Plans 1-2

- Stage components: same handleKeyDown shape — `completedRef` guard, `allowedKeys.includes` filter (normal mode only), `e.preventDefault()`, `setState` at top of branch, `queueMicrotask(onCompleted)` on completion.
- Operator state machine is contained inside the engine, not leaked into stage components — they only ever call `applyEditableKey`.
- `key={replayKey}` on stage components preserves the Plan 2 Replay button behavior unchanged.
- One file per task, one commit per task.
