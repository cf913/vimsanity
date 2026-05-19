# Plan 4: Yank/Put Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Extend the editable engine with a register concept, add yank operators (`y`, `yy`, `yw`) and put operators (`p`, `P`), and ship the `yankPut` Learn unit (#6).

**Architecture:** A `Register` field is added to `EditableState` carrying the most recently yanked or deleted text plus a `linewise` flag. Every destructive operator from Plan 3 (x, D, C, dd, cc, d+motion, c+motion) now populates the register before mutating — this gives users a "what I just deleted" buffer to paste back, matching vim's unnamed-register semantics. Yank operations (`y`+motion, `yy`) populate the register without deleting. Put operations (`p`/`P`) read the register and either inline-insert (charwise register) or open a new line (linewise register). The Plan 3 dispatcher gains three new normal-mode cases (`y`, `p`, `P`) and the pending-operator state machine learns `'y'`. The Plan 2 text engine is untouched.

**Tech Stack:** Same as Plans 1-3 — React 19, TypeScript, Vite, TailwindCSS v4, react-router-dom, vitest, @testing-library/react. No new dependencies.

**Builds on:** Plans 1-3. Plan 3 must be merged on the current branch.

**Out of scope** (deferred):
- Named registers (`"ay`, `"bp`, etc.) — v1 supports only the unnamed register.
- Register persistence across puzzle resets — register lives on EditableState, so resetting a puzzle clears it. Acceptable for v1.
- `Y` (yank to end of line) — vim has it; not in the design-doc unit list. Skip.
- `yj`/`yk` (multi-line linewise yank) — would need count support. Charwise fallback is harmless; we just don't curate puzzles that use it.
- Visual mode yanks (`v$y`) — visual mode is out of v1 entirely.
- Register-not-empty warnings/UI feedback — `p` with an empty register is a silent no-op for v1.

---

## Engine design notes

### Register
```ts
interface Register {
  text: string
  linewise: boolean
}
```
- `text` is the content as a plain string. For linewise registers, the text does NOT include a trailing newline — the paste logic adds it.
- `linewise` is `true` for `yy`/`dd`/`cc` and `false` for `yw`/`dw`/`cw`/`x`/`D`/`C`/`d$`/`c$` etc.

### EditableState
```ts
interface EditableState {
  text: string
  cursorIndex: number
  mode: 'normal' | 'insert'
  pendingOperator: 'd' | 'c' | 'y' | null      // ← 'y' added
  keystrokes: number
  register: Register | null                     // ← new
}
```
`register: null` means "no yanked content yet" — `p`/`P` are silent no-ops in that state.

### Yank semantics
- `yw`: charwise yank from cursor to `moveToNextWordBoundary` (same range as `dw`, including trailing whitespace). **No `yw→ye` quirk** — that quirk is `cw` only.
- `y$`, `y0`, `y^`, `yb`, `ye`: charwise yank, using each motion's natural target. Inclusive motions (`e`, `$`) extend the range by one (same rule as Plan 3's `applyOperatorWithMotion`).
- `yy`: linewise yank of the current line's content (excluding the line's trailing newline).

### Put semantics

**Charwise put (`p` after / `P` before):**
- `p`: insert register text at `cursorIndex + 1` (clamped to text length). Cursor moves to the index of the last inserted character.
- `P`: insert register text at `cursorIndex`. Cursor moves to the index of the last inserted character.

**Linewise put (`p` after / `P` before):**
- `p`: insert `\n + register.text` after the current line's content (at `findLineEnd(cursor) + 1`). Cursor moves to the start of the newly created line.
- `P`: insert `register.text + \n` at the current line's start. Cursor stays at the start of what is now the new line.

### Why all destructive operators populate the register

In vim, every delete fills the unnamed register, which is why `dd` then `p` re-pastes the deleted line. Without that, a beginner would form a wrong mental model. Plan 3's operators (x, D, C, dd, cc, applyOperatorWithMotion for d/c) all need a small extension: write the about-to-be-deleted text to the register before deleting.

### The pendingOperator state machine

The Plan 3 dispatcher handles `d` and `c` via `pendingOperator`. We extend it for `y`:
- Normal mode key `y` → `pendingOperator = 'y'`.
- Pending operator with same key (`yy`) → `yankCurrentLine`, no mode change.
- Pending operator with a motion key → `applyOperatorWithMotion(state, 'y', key)`, which now also handles op `'y'` (yank without delete).
- Pending operator with `Escape` → clears pending state (same as `d`/`c`).
- Pending operator with an unknown key → clears pending but does NOT consume (same as `d`/`c`).

### allowedKeys

The yankPut unit allowedKeys carry forward all Plan 1-3 motions and operators plus the three new keys: `y`, `p`, `P`. Insert mode is still wide-open.

---

## File Structure

**New files:**

| Path | Responsibility |
|---|---|
| `src/v2/engine/put.ts` | `putAfter` and `putBefore` — read register, return new state. |
| `src/v2/engine/put.test.ts` | Tests for both put functions across charwise/linewise registers and edge cases. |
| `src/v2/wings/learn/units/yankPut.ts` | Unit 6 definition (4 A-drill challenges + 3 B-puzzles). |

**Modified files:**

| Path | Change |
|---|---|
| `src/v2/engine/editable-types.ts` | Add `Register` interface; add `register: Register \| null` field on `EditableState`; extend `OperatorKind` to include `'y'`. |
| `src/v2/engine/editable-engine.ts` | Update `freshNormal` to initialize `register: null`. Add normal-mode cases for `y`, `p`, `P`. Extend `handlePendingOperator` for `op === 'y'` (yy line yank, y+motion). |
| `src/v2/engine/editable-engine.test.ts` | Add yank/put integration tests (yw + P, yy + p, dd + p, x + p). |
| `src/v2/engine/operators.ts` | Each operator (x, D, C, dd, cc, applyOperatorWithMotion) populates the register before mutating. Add `yankCurrentLine`. Add `'y'` handling to `applyOperatorWithMotion` (no delete, no mode change). |
| `src/v2/engine/operators.test.ts` | Update `s()` helper to set `register: null`. Add register-state assertions to existing operator tests. Add `yankCurrentLine` tests. Add `applyOperatorWithMotion (y + w)` test. |
| `src/v2/engine/mode-motions.test.ts` | Update `state()` helper to set `register: null` (typecheck fix only). |
| `src/v2/wings/learn/units/registry.ts` | Add `yankPutUnit` after `changeDeleteUnit`. |

**Untouched:** all of `src/v2/engine/text-{utils,types,motions,grader}.ts`, `edits.ts`, `mode-motions.ts`, `editable-grader.ts`, `src/v2/engine/types.ts`, `motions.ts`, `grader.ts`, `src/v2/state/*`, `src/v2/shell/*`, `LearnWing.tsx`, `UnitSidebar.tsx`, `UnitRunner.tsx` (the dispatch already covers all three stage kinds — yankPut uses the existing `a-drill-edit` and `b-check-edit-puzzles` kinds via `ADrillStageEdit` and `BCheckStageEdit`), the `hjkl`/`wbe`/`lineEdges`/`insertModes`/`changeDelete` units.

---

## Task 1: Register type + EditableState extension + helper updates

**Files:**
- Modify: `src/v2/engine/editable-types.ts`
- Modify: `src/v2/engine/editable-engine.ts` (only the `freshNormal` initializer)
- Modify: `src/v2/engine/operators.test.ts` (update `s()` helper)
- Modify: `src/v2/engine/mode-motions.test.ts` (update `state()` helper)

- [ ] **Step 1.1: Update `src/v2/engine/editable-types.ts`**

Replace the file contents with:
```ts
import type { KeyEvent } from './types'

export type Mode = 'normal' | 'insert'
export type OperatorKind = 'd' | 'c' | 'y'

export interface Register {
  text: string
  linewise: boolean
}

export interface EditableState {
  text: string
  cursorIndex: number
  mode: Mode
  pendingOperator: OperatorKind | null
  keystrokes: number
  register: Register | null
}

export interface EditableResult {
  state: EditableState
  consumed: boolean
}

export type EditableFn = (state: EditableState, event: KeyEvent) => EditableResult
```

- [ ] **Step 1.2: Update `freshNormal` in `src/v2/engine/editable-engine.ts`**

Find the existing `freshNormal` (near the top of the file) and replace it with:
```ts
export function freshNormal(text: string, cursorIndex: number): EditableState {
  return {
    text,
    cursorIndex,
    mode: 'normal',
    pendingOperator: null,
    keystrokes: 0,
    register: null,
  }
}
```

- [ ] **Step 1.3: Update `s()` helper in `src/v2/engine/operators.test.ts`**

Find the `s()` helper at the top of the test file and replace it with:
```ts
function s(text: string, cursorIndex: number): EditableState {
  return {
    text,
    cursorIndex,
    mode: 'normal',
    pendingOperator: null,
    keystrokes: 0,
    register: null,
  }
}
```

- [ ] **Step 1.4: Update `state()` helper in `src/v2/engine/mode-motions.test.ts`**

Find the `state()` helper at the top of the test file and replace it with:
```ts
function state(
  text: string,
  cursorIndex: number,
  mode: 'normal' | 'insert' = 'normal',
): EditableState {
  return { text, cursorIndex, mode, pendingOperator: null, keystrokes: 0, register: null }
}
```

- [ ] **Step 1.5: Verify**

Run: `npx tsc --noEmit && npm run test:run`
Expected: no tsc errors; all 141 existing tests still pass (the register field is initialized everywhere but no operator reads/writes it yet).

- [ ] **Step 1.6: Commit**

```bash
git add src/v2/engine/editable-types.ts src/v2/engine/editable-engine.ts src/v2/engine/operators.test.ts src/v2/engine/mode-motions.test.ts
git commit -m "$(cat <<'EOF'
feat(v2): add Register type + register field on EditableState

OperatorKind extends to include 'y'. freshNormal initializes
register: null. Test helpers in operators.test.ts and
mode-motions.test.ts updated to set the new field. No behavior
change yet — register is plumbed through but unused.

Co-Authored-By: Claude Opus 4.7 (1M context) <noreply@anthropic.com>
EOF
)"
```

---

## Task 2: yankCurrentLine + extend `applyOperatorWithMotion` for `y` (TDD)

**Files:**
- Modify: `src/v2/engine/operators.ts`
- Modify: `src/v2/engine/operators.test.ts`

- [ ] **Step 2.1: Add failing tests in `operators.test.ts`**

Append to `src/v2/engine/operators.test.ts` (at the end of the file, before the final blank line):
```ts
import { yankCurrentLine } from './operators'

describe('yankCurrentLine (yy)', () => {
  it('stores the current line content linewise in the register', () => {
    const r = yankCurrentLine(s('alpha\nbeta\ngamma', 7))
    expect(r.register).toEqual({ text: 'beta', linewise: true })
    // Yank is non-destructive — text and cursor stay put.
    expect(r.text).toBe('alpha\nbeta\ngamma')
    expect(r.cursorIndex).toBe(7)
  })
  it('handles a single-line buffer', () => {
    const r = yankCurrentLine(s('todo', 0))
    expect(r.register).toEqual({ text: 'todo', linewise: true })
  })
  it('handles the last line of a multi-line buffer', () => {
    const r = yankCurrentLine(s('first\nlast', 7))
    expect(r.register).toEqual({ text: 'last', linewise: true })
  })
})

describe('applyOperatorWithMotion (y + w) — charwise yank', () => {
  it('populates the register without deleting text or changing mode', () => {
    const r = applyOperatorWithMotion(s('the quick fox', 0), 'y', 'w')
    expect(r.text).toBe('the quick fox')
    expect(r.cursorIndex).toBe(0)
    expect(r.mode).toBe('normal')
    expect(r.register).toEqual({ text: 'the ', linewise: false })
  })
  it('does not apply the cw→ce quirk to yw — yw includes trailing whitespace', () => {
    const r = applyOperatorWithMotion(s('red blue', 0), 'y', 'w')
    expect(r.register).toEqual({ text: 'red ', linewise: false })
  })
})

describe('applyOperatorWithMotion (y + $) — inclusive yank', () => {
  it('yanks through end of line inclusive', () => {
    const r = applyOperatorWithMotion(s('keep this', 5), 'y', '$')
    expect(r.register).toEqual({ text: 'this', linewise: false })
    expect(r.text).toBe('keep this')
    expect(r.cursorIndex).toBe(5)
  })
})
```

- [ ] **Step 2.2: Run — expect failure**

Run: `npm run test:run -- src/v2/engine/operators.test.ts`
Expected: tests fail (yankCurrentLine not exported; applyOperatorWithMotion ignores op='y').

- [ ] **Step 2.3: Implement `yankCurrentLine` and update `applyOperatorWithMotion` in `src/v2/engine/operators.ts`**

Find `applyOperatorWithMotion` and replace the function body. Then add `yankCurrentLine` as a new export. The full file becomes:

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
  const yanked = state.text.slice(idx, idx + 1)
  const text = deleteRange(state.text, idx, idx + 1)
  const cursorIndex = clampToLine(text, idx)
  return { ...state, text, cursorIndex, register: { text: yanked, linewise: false } }
}

export function deleteToEndOfLine(state: EditableState): EditableState {
  const end = findLineEnd(state.text, state.cursorIndex)
  const yanked = state.text.slice(state.cursorIndex, end + 1)
  const text = deleteRange(state.text, state.cursorIndex, end + 1)
  if (text.length === 0) {
    return { ...state, text, cursorIndex: 0, register: { text: yanked, linewise: false } }
  }
  const lineStart = findLineStart(text, state.cursorIndex)
  const cursorIndex = Math.max(lineStart, state.cursorIndex - 1)
  return { ...state, text, cursorIndex, register: { text: yanked, linewise: false } }
}

export function changeToEndOfLine(state: EditableState): EditableState {
  const end = findLineEnd(state.text, state.cursorIndex)
  const yanked = state.text.slice(state.cursorIndex, end + 1)
  const text = deleteRange(state.text, state.cursorIndex, end + 1)
  return { ...state, text, mode: 'insert', register: { text: yanked, linewise: false } }
}

export function deleteLine(state: EditableState): EditableState {
  const lineStart = findLineStart(state.text, state.cursorIndex)
  const nlAhead = state.text.indexOf('\n', state.cursorIndex)
  if (nlAhead !== -1) {
    const lineContent = state.text.slice(lineStart, nlAhead)
    const text = deleteRange(state.text, lineStart, nlAhead + 1)
    const cursorIndex = Math.min(text.length, lineStart)
    return { ...state, text, cursorIndex, register: { text: lineContent, linewise: true } }
  }
  if (lineStart === 0) {
    return { ...state, text: '', cursorIndex: 0, register: { text: state.text, linewise: true } }
  }
  const lineContent = state.text.slice(lineStart)
  const text = state.text.slice(0, lineStart - 1)
  const cursorIndex = findLineStart(text, text.length)
  return { ...state, text, cursorIndex, register: { text: lineContent, linewise: true } }
}

// Clear current line's content but KEEP the newline. Used by cc.
export function clearLine(state: EditableState): EditableState {
  const lineStart = findLineStart(state.text, state.cursorIndex)
  const nl = state.text.indexOf('\n', state.cursorIndex)
  const rangeEnd = nl === -1 ? state.text.length : nl
  const lineContent = state.text.slice(lineStart, rangeEnd)
  const text = deleteRange(state.text, lineStart, rangeEnd)
  return { ...state, text, cursorIndex: lineStart, register: { text: lineContent, linewise: false } }
}

// Yank the current line content linewise — non-destructive. Used by yy.
export function yankCurrentLine(state: EditableState): EditableState {
  const lineStart = findLineStart(state.text, state.cursorIndex)
  const nl = state.text.indexOf('\n', state.cursorIndex)
  const lineContent = nl === -1
    ? state.text.slice(lineStart)
    : state.text.slice(lineStart, nl)
  return { ...state, register: { text: lineContent, linewise: true } }
}

export function applyOperatorWithMotion(
  state: EditableState,
  op: OperatorKind,
  motionKey: string,
): EditableState {
  // Vim quirk: `cw` is treated as `ce`. `yw` and `dw` keep their natural range.
  const effectiveMotionKey =
    op === 'c' && motionKey === 'w' ? 'e' : motionKey
  const motion = findTextMotion(textMotionRegistry, effectiveMotionKey)
  if (!motion) return state
  const target = motion.apply(
    { text: state.text, cursorIndex: state.cursorIndex, keystrokes: 0 },
    { key: effectiveMotionKey },
  ).state.cursorIndex
  if (target === state.cursorIndex) {
    if (op === 'y') return state
    return { ...state, mode: op === 'c' ? 'insert' : 'normal' }
  }
  const start = Math.min(state.cursorIndex, target)
  const endRaw = Math.max(state.cursorIndex, target)
  const end = INCLUSIVE_MOTIONS.has(effectiveMotionKey)
    ? Math.min(state.text.length, endRaw + 1)
    : endRaw
  const yanked = state.text.slice(start, end)
  const register = { text: yanked, linewise: false }
  if (op === 'y') {
    // Yank only — no deletion, no mode change, cursor stays put.
    return { ...state, register }
  }
  const text = deleteRange(state.text, start, end)
  const cursorIndex = clampToLine(text, start)
  return {
    ...state,
    text,
    cursorIndex,
    mode: op === 'c' ? 'insert' : 'normal',
    register,
  }
}
```

- [ ] **Step 2.4: Run — all should pass**

Run: `npm run test:run -- src/v2/engine/operators.test.ts`
Expected: previous 15 tests still pass plus the 6 new ones (yankCurrentLine ×3, applyOperatorWithMotion y+w ×2, y+$ ×1).

- [ ] **Step 2.5: Run full test suite — confirm no regressions**

Run: `npm run test:run`
Expected: all V2 tests still pass.

- [ ] **Step 2.6: Commit**

```bash
git add src/v2/engine/operators.ts src/v2/engine/operators.test.ts
git commit -m "$(cat <<'EOF'
feat(v2): operators populate register; add yankCurrentLine + y op

Every destructive operator (x, D, C, dd, cc, applyOperatorWithMotion
for d/c) now writes the about-to-be-deleted text into state.register
before mutating, matching vim's unnamed-register semantics.
yankCurrentLine implements yy (linewise, non-destructive).
applyOperatorWithMotion learns op='y' — yanks the same range as d
but does not delete and does not change mode. yw retains its
trailing-whitespace inclusion (no ce quirk for y).

Co-Authored-By: Claude Opus 4.7 (1M context) <noreply@anthropic.com>
EOF
)"
```

---

## Task 3: Put operations (TDD)

**Files:**
- Create: `src/v2/engine/put.test.ts`
- Create: `src/v2/engine/put.ts`

- [ ] **Step 3.1: Write failing tests**

Create `src/v2/engine/put.test.ts`:
```ts
import { describe, it, expect } from 'vitest'
import { putAfter, putBefore } from './put'
import type { EditableState, Register } from './editable-types'

function st(
  text: string,
  cursorIndex: number,
  register: Register | null,
): EditableState {
  return {
    text,
    cursorIndex,
    mode: 'normal',
    pendingOperator: null,
    keystrokes: 0,
    register,
  }
}

describe('putAfter (p) — charwise', () => {
  it('inserts after the cursor and moves cursor to last inserted char', () => {
    const r = putAfter(st('xy', 0, { text: 'AB', linewise: false }))
    expect(r.text).toBe('xABy')
    expect(r.cursorIndex).toBe(2)
  })
  it('appends when cursor is at end of buffer', () => {
    const r = putAfter(st('xy', 1, { text: 'AB', linewise: false }))
    expect(r.text).toBe('xyAB')
    expect(r.cursorIndex).toBe(3)
  })
  it('is a no-op when register is null', () => {
    const r = putAfter(st('xy', 0, null))
    expect(r.text).toBe('xy')
    expect(r.cursorIndex).toBe(0)
  })
})

describe('putAfter (p) — linewise', () => {
  it('inserts the register content as a new line below current line', () => {
    const r = putAfter(st('alpha\nbeta', 2, { text: 'NEW', linewise: true }))
    expect(r.text).toBe('alpha\nNEW\nbeta')
    expect(r.cursorIndex).toBe(6)
  })
  it('appends a new line at end of buffer when on the last line', () => {
    const r = putAfter(st('alpha', 2, { text: 'NEW', linewise: true }))
    expect(r.text).toBe('alpha\nNEW')
    expect(r.cursorIndex).toBe(6)
  })
})

describe('putBefore (P) — charwise', () => {
  it('inserts before the cursor and moves cursor to last inserted char', () => {
    const r = putBefore(st('xy', 1, { text: 'AB', linewise: false }))
    expect(r.text).toBe('xABy')
    expect(r.cursorIndex).toBe(2)
  })
  it('handles cursor at index 0', () => {
    const r = putBefore(st('xy', 0, { text: 'AB', linewise: false }))
    expect(r.text).toBe('ABxy')
    expect(r.cursorIndex).toBe(1)
  })
})

describe('putBefore (P) — linewise', () => {
  it('inserts the register content as a new line above current line', () => {
    const r = putBefore(st('alpha\nbeta', 7, { text: 'NEW', linewise: true }))
    expect(r.text).toBe('alpha\nNEW\nbeta')
    expect(r.cursorIndex).toBe(6)
  })
  it('prepends a new line at start of buffer', () => {
    const r = putBefore(st('alpha', 2, { text: 'NEW', linewise: true }))
    expect(r.text).toBe('NEW\nalpha')
    expect(r.cursorIndex).toBe(0)
  })
})
```

- [ ] **Step 3.2: Run — expect failure**

Run: `npm run test:run -- src/v2/engine/put.test.ts`
Expected: FAIL — `put` module not found.

- [ ] **Step 3.3: Implement `src/v2/engine/put.ts`**

```ts
import type { EditableState } from './editable-types'
import { insertAt } from './edits'
import { findLineStart, findLineEnd } from './text-utils'

export function putAfter(state: EditableState): EditableState {
  if (!state.register) return state
  const { text: regText, linewise } = state.register
  if (linewise) {
    const lineEnd = findLineEnd(state.text, state.cursorIndex)
    const insertIdx = lineEnd + 1
    const text = insertAt(state.text, insertIdx, '\n' + regText)
    return { ...state, text, cursorIndex: insertIdx + 1 }
  }
  // Charwise: insert AFTER cursor (i.e. at cursor + 1).
  const insertIdx = Math.min(state.text.length, state.cursorIndex + 1)
  const text = insertAt(state.text, insertIdx, regText)
  const cursorIndex = regText.length === 0
    ? state.cursorIndex
    : insertIdx + regText.length - 1
  return { ...state, text, cursorIndex }
}

export function putBefore(state: EditableState): EditableState {
  if (!state.register) return state
  const { text: regText, linewise } = state.register
  if (linewise) {
    const lineStart = findLineStart(state.text, state.cursorIndex)
    const text = insertAt(state.text, lineStart, regText + '\n')
    return { ...state, text, cursorIndex: lineStart }
  }
  // Charwise: insert BEFORE cursor.
  const text = insertAt(state.text, state.cursorIndex, regText)
  const cursorIndex = regText.length === 0
    ? state.cursorIndex
    : state.cursorIndex + regText.length - 1
  return { ...state, text, cursorIndex }
}
```

- [ ] **Step 3.4: Run — all should pass**

Run: `npm run test:run -- src/v2/engine/put.test.ts`
Expected: 10/10 pass.

- [ ] **Step 3.5: Commit**

```bash
git add src/v2/engine/put.ts src/v2/engine/put.test.ts
git commit -m "$(cat <<'EOF'
feat(v2): add putAfter (p) and putBefore (P)

Reads state.register and pastes either inline (charwise) or as a
new line (linewise). Charwise paste positions cursor on the last
inserted character — matches vim. Linewise paste lands cursor at
the start of the new line. Empty register → silent no-op.

Co-Authored-By: Claude Opus 4.7 (1M context) <noreply@anthropic.com>
EOF
)"
```

---

## Task 4: Wire y/yy/yw and p/P into the dispatcher (TDD)

**Files:**
- Modify: `src/v2/engine/editable-engine.ts`
- Modify: `src/v2/engine/editable-engine.test.ts`

- [ ] **Step 4.1: Add failing dispatcher tests**

Append to `src/v2/engine/editable-engine.test.ts` (at the end, before the final blank line):
```ts
describe('applyEditableKey — yank/put integration', () => {
  it('yw followed by P duplicates the word before itself', () => {
    const after = drive(freshNormal('red blue', 0), ['y', 'w', 'P'])
    expect(after.text).toBe('red red blue')
    expect(after.cursorIndex).toBe(3)
  })
  it('yy followed by p duplicates the current line below', () => {
    const after = drive(freshNormal('alpha\nbeta\ngamma', 6), ['y', 'y', 'p'])
    expect(after.text).toBe('alpha\nbeta\nbeta\ngamma')
  })
  it('yy followed by P duplicates the current line above', () => {
    const after = drive(freshNormal('header\nbody', 0), ['y', 'y', 'P'])
    expect(after.text).toBe('header\nheader\nbody')
  })
  it('y followed by Escape clears the pending state', () => {
    const after = drive(freshNormal('hello', 0), ['y', 'Escape'])
    expect(after.pendingOperator).toBe(null)
  })
  it('dd populates the register so subsequent p re-inserts the deleted line', () => {
    const after = drive(freshNormal('alpha\nbeta\ngamma', 6), ['d', 'd', 'p'])
    expect(after.text).toBe('alpha\ngamma\nbeta')
  })
  it('x followed by p swaps adjacent characters (classic vim idiom)', () => {
    // x removes char at cursor → cursor lands on next char. p pastes the
    // removed char AFTER the cursor, which is the position of what used
    // to be the char to the right. Net effect: the two original chars
    // swap places.
    const after = drive(freshNormal('abc', 0), ['x', 'p'])
    expect(after.text).toBe('bac')
  })
  it('p with an empty register is a silent no-op (but counts as a keystroke)', () => {
    const after = drive(freshNormal('hi', 0), ['p'])
    expect(after.text).toBe('hi')
    expect(after.cursorIndex).toBe(0)
    expect(after.keystrokes).toBe(1)
  })
  it('y at end of buffer with no motion target consumes the operator without erroring', () => {
    // 'w' from end of single word with no following word is a no-op motion.
    const after = drive(freshNormal('end', 2), ['y', 'w'])
    expect(after.text).toBe('end')
    expect(after.pendingOperator).toBe(null)
  })
})
```

(The `drive` helper and `freshNormal` import are already at the top of the file from Plan 3.)

- [ ] **Step 4.2: Run — expect failure**

Run: `npm run test:run -- src/v2/engine/editable-engine.test.ts`
Expected: new tests fail (y/p/P not handled yet).

- [ ] **Step 4.3: Extend `src/v2/engine/editable-engine.ts`**

Update the imports section near the top to include the new operators and put helpers. The full set of editable-engine imports becomes:
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
  yankCurrentLine,
} from './operators'
import { putAfter, putBefore } from './put'
import { deleteRange, insertAt } from './edits'
import { findLineStart } from './text-utils'
```

In `handlePendingOperator`, replace the `// dd / cc — repeat operator on the current line.` block with a three-case branch that also handles `yy`:
```ts
  // dd / cc / yy — repeat operator on the current line.
  if (key === op) {
    const cleared: EditableState = { ...state, pendingOperator: null }
    if (op === 'd') {
      return { state: inc(deleteLine(cleared)), consumed: true }
    }
    if (op === 'y') {
      return { state: inc(yankCurrentLine(cleared)), consumed: true }
    }
    // cc: clear the line but keep the newline; enter insert mode at line start.
    const lineCleared = clearLine(cleared)
    return {
      state: inc({ ...lineCleared, mode: 'insert' }),
      consumed: true,
    }
  }
```

In `handleNormalMode`, add three new cases to the `switch (key)` block (insert them between the existing `'c'` case and the closing brace — i.e. before the motion-delegation tail). The new cases:
```ts
    case 'y':
      return { state: inc({ ...state, pendingOperator: 'y' }), consumed: true }
    case 'p':
      return { state: inc(putAfter(state)), consumed: true }
    case 'P':
      return { state: inc(putBefore(state)), consumed: true }
```

- [ ] **Step 4.4: Run dispatcher tests — should pass**

Run: `npm run test:run -- src/v2/engine/editable-engine.test.ts`
Expected: all tests pass (20 original + 8 new).

- [ ] **Step 4.5: Run full suite — confirm no regressions**

Run: `npm run test:run && npx tsc --noEmit`
Expected: 0 failures; tsc clean.

- [ ] **Step 4.6: Commit**

```bash
git add src/v2/engine/editable-engine.ts src/v2/engine/editable-engine.test.ts
git commit -m "$(cat <<'EOF'
feat(v2): wire y/yy/yw and p/P into the editable dispatcher

handleNormalMode gains three cases: 'y' sets pendingOperator='y',
'p' calls putAfter, 'P' calls putBefore. handlePendingOperator's
repeat-operator branch grows a 'y' case for yy (linewise yank).
Integration tests verify yw+P, yy+p, yy+P, dd+p (paste deleted
line back), x+p (paste deleted char back), and the empty-register
silent no-op.

Co-Authored-By: Claude Opus 4.7 (1M context) <noreply@anthropic.com>
EOF
)"
```

---

## Task 5: Define unit 6 (yankPut) data

**Files:**
- Create: `src/v2/wings/learn/units/yankPut.ts`

- [ ] **Step 5.1: Implement**

```ts
import type { Unit } from './types'

// Previously-learned motions stay available plus the new keys.
const MOVES = ['h', 'j', 'k', 'l', 'w', 'b', 'e', '0', '$', '^']
const INSERT = ['i', 'a', 'o', 'O', 'Escape']
const EDIT = ['x', 'd', 'D', 'c', 'C']
const NEW = ['y', 'p', 'P']

export const yankPutUnit: Unit = {
  id: 'yankPut',
  title: 'Yank & Put',
  motionLabel: 'yy yw p P',
  aStage: {
    kind: 'a-drill-edit',
    allowedKeys: [...MOVES, ...INSERT, ...EDIT, ...NEW],
    challenges: [
      {
        id: 'yp-yy-p',
        hint: "Duplicate the line below it using `yy` + `p`.",
        startText: 'todo',
        startCursorIndex: 0,
        goal: { text: 'todo\ntodo' },
      },
      {
        id: 'yp-yy-P',
        hint: "Duplicate the line above it using `yy` + `P`.",
        startText: 'note',
        startCursorIndex: 0,
        goal: { text: 'note\nnote' },
      },
      {
        id: 'yp-yw-P',
        hint: "Duplicate 'foo' inline using `yw` + `P`.",
        startText: 'foo bar',
        startCursorIndex: 0,
        goal: { text: 'foo foo bar' },
      },
      {
        id: 'yp-yy-j-p',
        hint: "Copy the first line and paste it below the second using `yy` + `j` + `p`.",
        startText: 'header\nbody',
        startCursorIndex: 0,
        goal: { text: 'header\nbody\nheader' },
      },
    ],
  },
  bStage: {
    kind: 'b-check-edit-puzzles',
    allowedKeys: [...MOVES, ...INSERT, ...EDIT, ...NEW],
    puzzles: [
      {
        id: 'yankPut-b1',
        hint: "Duplicate 'red' inline.",
        startText: 'red blue',
        startCursorIndex: 0,
        goal: { text: 'red red blue' },
        // y w P = 3
        par: 3,
      },
      {
        id: 'yankPut-b2',
        hint: "Duplicate the middle line.",
        startText: 'alpha\nbeta\ngamma',
        startCursorIndex: 6,
        goal: { text: 'alpha\nbeta\nbeta\ngamma' },
        // y y p = 3
        par: 3,
      },
      {
        id: 'yankPut-b3',
        hint: "Duplicate the first line above itself.",
        startText: 'header\nbody',
        startCursorIndex: 0,
        goal: { text: 'header\nheader\nbody' },
        // y y P = 3
        par: 3,
      },
    ],
  },
}
```

- [ ] **Step 5.2: Verify**

Run: `npx tsc --noEmit`
Expected: no errors.

- [ ] **Step 5.3: Commit**

```bash
git add src/v2/wings/learn/units/yankPut.ts
git commit -m "$(cat <<'EOF'
feat(v2): add Yank & Put unit (yy yw p P)

Four A-drill challenges teaching yy+p, yy+P, yw+P, and the
yy+navigation+p flow. Three B-check puzzles all par 3: word
duplication via yw+P, middle-line duplication via yy+p, and
above-line duplication via yy+P. allowedKeys carries forward
every motion + operator + insert-mode entry from earlier units.

Co-Authored-By: Claude Opus 4.7 (1M context) <noreply@anthropic.com>
EOF
)"
```

---

## Task 6: Register the unit

**Files:**
- Modify: `src/v2/wings/learn/units/registry.ts`

- [ ] **Step 6.1: Replace contents**

```ts
import type { Unit } from './types'
import { hjklUnit } from './hjkl'
import { wbeUnit } from './wbe'
import { lineEdgesUnit } from './lineEdges'
import { insertModesUnit } from './insertModes'
import { changeDeleteUnit } from './changeDelete'
import { yankPutUnit } from './yankPut'

export const units: Unit[] = [
  hjklUnit,
  wbeUnit,
  lineEdgesUnit,
  insertModesUnit,
  changeDeleteUnit,
  yankPutUnit,
]

export function findUnit(id: string): Unit | undefined {
  return units.find((u) => u.id === id)
}
```

- [ ] **Step 6.2: Verify**

Run: `npx tsc --noEmit && npm run test:run`
Expected: tsc clean; all tests pass.

- [ ] **Step 6.3: Commit**

```bash
git add src/v2/wings/learn/units/registry.ts
git commit -m "$(cat <<'EOF'
feat(v2): register Yank & Put unit

Sixth unit in the linear Learn progression. Unlocks after
changeDelete is completed.

Co-Authored-By: Claude Opus 4.7 (1M context) <noreply@anthropic.com>
EOF
)"
```

---

## Task 7: End-to-end verification

**Files:** none modified — verification only.

- [ ] **Step 7.1: Full test suite**

Run: `npm run test:run`
Expected: 0 failed, 1 skipped (Plan 4 adds ~25 new tests on top of Plan 3's 141 baseline; final count ~166 passing).

- [ ] **Step 7.2: Typecheck**

Run: `npx tsc --noEmit`
Expected: no errors.

- [ ] **Step 7.3: Build**

Run: `npm run build`
Expected: success.

- [ ] **Step 7.4: Lint V2 only**

Run: `npm run lint 2>&1 | grep -E 'src/v2/' | grep error || echo "no v2 errors"`
Expected: `no v2 errors`.

- [ ] **Step 7.5: Manual browser walk (requires user)**

Run: `npm run dev`

Manual flow (clear localStorage first):
1. Walk through units 1-5 (or skip-walk if progress already exists) until `yankPut` becomes ○ ready.
2. Click into `yankPut`. A-drill challenge 1 (yy+p) appears. Press `y y p` — text becomes `todo\ntodo`. Advance.
3. Challenge 2 (yy+P): `y y P` on `note` → `note\nnote`.
4. Challenge 3 (yw+P): `y w P` on `foo bar` → `foo foo bar`.
5. Challenge 4 (yy+j+p): `y y j p` on `header\nbody` → `header\nbody\nheader`.
6. B-check appears. Solve each of the 3 puzzles. Confirm par display turns green when at par and red when over par.
7. Replay button (↻) resets the unit. Progress persists across reloads.
8. Bonus playtest: in any unit, press `dd` then `p` and confirm the deleted line is re-pasted below.

Stop the dev server.

- [ ] **Step 7.6: Final summary commit (only if incidental fixes were needed)**

If verification surfaced anything, commit fixes individually with clear messages. Otherwise skip.

---

## Self-Review

### Spec coverage check (design doc §9.1, unit 6)

- `y` operator → Task 2 (extend `applyOperatorWithMotion`) + Task 4 (dispatcher case)
- `yy` linewise yank → Task 2 (`yankCurrentLine`) + Task 4 (dispatcher repeat-operator case)
- `yw` charwise yank → Task 2 (covered by `applyOperatorWithMotion` + dispatcher)
- `p` paste after → Task 3 (`putAfter`) + Task 4 (dispatcher case)
- `P` paste before → Task 3 (`putBefore`) + Task 4 (dispatcher case)
- Register concept (so `dd` then `p` re-pastes) → Task 1 (state field) + Task 2 (operators populate it)
- Linear progression → Task 6 (unit appended to array)

### Out-of-scope flags

- No named registers, no `Y`, no `yj`/`yk` linewise counts — all deferred.
- No UI surfacing of register state — user can only see register effects via `p`/`P`. Acceptable for v1.

### Type / naming consistency

- `Register` interface — single shape: `{ text: string; linewise: boolean }`. Used in `editable-types.ts`, `operators.ts`, `put.ts`, `editable-engine.ts`.
- `EditableState.register` — `Register | null`. `null` means "nothing yanked yet". `freshNormal` initializes to `null`.
- `OperatorKind` — `'d' | 'c' | 'y'`. Extended once, consistent everywhere.
- `yankCurrentLine` vs `deleteLine` — sibling naming pattern: `<verb>Line`.
- `putAfter` / `putBefore` — sibling pair, both take `EditableState` and return a new `EditableState`.

### Risks specific to Plan 4

- **Cursor positioning after charwise paste**: vim places cursor on the LAST inserted character. Verified in `putAfter`/`putBefore` tests. If a future puzzle requires cursor-position matching in the goal, double-check.
- **Empty register no-op**: `p`/`P` consume the keystroke even when register is null. This counts as a stroke in par calculations. None of the curated puzzles step on this, but a user who hits `p` before yanking will see their stroke count tick up. Document if it surprises someone.
- **`yw` does NOT have the `cw→ce` quirk**: ensured by the `op === 'c' && motionKey === 'w'` guard in `applyOperatorWithMotion`. Tested explicitly in Task 2.
- **dd+p produces an extra leading newline?** Tracing `drive(freshNormal('alpha\nbeta\ngamma', 6), ['d', 'd', 'p'])`: after `dd`, state is `text='alpha\ngamma'`, cursor=6 (start of `gamma`), register=`{text:'beta', linewise:true}`. Then `p`: linewise, `findLineEnd(text, 6)` = 10 ('a' of gamma). insertIdx=11. `insertAt(text, 11, '\nbeta')` → `'alpha\ngamma\nbeta'`. Matches the test assertion. ✓

### Pattern reuse

- Stage components (ADrillStageEdit, BCheckStageEdit) — unchanged. The new unit uses the same `'a-drill-edit'` and `'b-check-edit-puzzles'` kinds.
- UnitRunner dispatch — unchanged. Already covers all three kinds.
- One file per task, one commit per task.
- No new lint rules, no new test infra.

### Known limitations the next plan picks up

- Text objects (`diw`, `daw`, `ciw`, `caw`, `yiw`, `yaw`) — Plan 5. Text objects need a motion-as-range generalization that doesn't fit the current motion shape.
- `Y` shorthand for `y$` — trivial to add once a unit needs it.
