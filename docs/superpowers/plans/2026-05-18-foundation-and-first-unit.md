# Foundation + First Learn Unit Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Ship the V2 app shell (Three Wings nav + routing + `/classic` preservation) with one complete Learn unit (`hjkl`) end-to-end through A-drill and B-check stages, on a clean engine architecture that later units extend.

**Architecture:** New code lives under `src/v2/` so the existing app at `src/components/levels/*` remains untouched and continues to serve `/classic`. Routing splits the surface: `/` redirects to `/learn` (V2); `/learn`, `/practice`, `/apply` render V2 wings; `/classic` mounts the existing `App.tsx` unchanged. The V2 engine is a small pure-functional layer (`GridState` + motion registry) — narrow on purpose. Later plans extend it for text-mutating motions; we intentionally avoid generalizing now.

**Tech Stack:** React 19, TypeScript, Vite, TailwindCSS v4, Framer Motion (already present). Adds: `vitest`, `@testing-library/react`, `@testing-library/jest-dom`, `jsdom`, `react-router-dom`.

**Out of scope for this plan** (deferred to later plans per the design doc):
- Learn units 2-7 (Plan 2)
- Practice wing daily puzzle + drill library (Plan 3)
- Apply wing capstones (Plan 4)
- Onboarding demo + placement (Plan 5)
- Analytics events (Plan 6, threaded into others)
- Visual brand redesign

---

## File Structure

**New files:**

| Path | Responsibility |
|---|---|
| `src/v2/engine/types.ts` | `GridState`, `KeyEvent`, `GridMotion`, `MotionResult` types |
| `src/v2/engine/motions.ts` | `h`/`j`/`k`/`l` motions + registry + `applyKey` dispatcher |
| `src/v2/engine/motions.test.ts` | Pure-function tests for motions and dispatcher |
| `src/v2/engine/grader.ts` | `isCursorAt(state, target)` predicate |
| `src/v2/engine/grader.test.ts` | Predicate tests |
| `src/v2/state/types.ts` | `Progress`, `UnitProgress`, `StageStatus` types |
| `src/v2/state/progress.ts` | localStorage-backed progress store (namespaced `vimsanity-v2-`) |
| `src/v2/state/progress.test.ts` | Store read/write/reset tests |
| `src/v2/wings/learn/units/types.ts` | `Unit`, `AStageDef`, `BStageDef` types |
| `src/v2/wings/learn/units/hjkl.ts` | hjkl unit definition (A drill + B-check puzzles) |
| `src/v2/wings/learn/units/registry.ts` | Exported list of v1 units (just hjkl in Plan 1) |
| `src/v2/wings/learn/stages/ADrillStage.tsx` | Target-hunting drill component |
| `src/v2/wings/learn/stages/BCheckStage.tsx` | Navigation-puzzle component (cursor → goal under par) |
| `src/v2/wings/learn/UnitRunner.tsx` | Drives a unit through A → B → completed |
| `src/v2/wings/learn/UnitSidebar.tsx` | Lists units with locked/in-progress/done status |
| `src/v2/wings/learn/LearnWing.tsx` | Sidebar + active unit layout |
| `src/v2/wings/practice/PracticeWing.tsx` | "Coming soon" stub |
| `src/v2/wings/apply/ApplyWing.tsx` | "Coming soon" stub |
| `src/v2/shell/WingsNav.tsx` | Top nav: Learn / Practice / Apply |
| `src/v2/shell/Shell.tsx` | Layout wrapping WingsNav + outlet |
| `src/v2/routes.tsx` | V2 route table (nested under `/`) |
| `src/AppRouter.tsx` | Top-level router: V2 routes + `/classic` route |
| `vitest.config.ts` | Vitest config with jsdom + setup file |
| `src/test/setup.ts` | `@testing-library/jest-dom` global setup |

**Modified files:**

| Path | Change |
|---|---|
| `package.json` | Add devDependencies (vitest, testing-library, jsdom) + dependency (react-router-dom); add `test` script |
| `src/main.tsx` | Replace `<App />` with `<AppRouter />` |
| `tsconfig.json` (if present, the tsconfig that includes test files) | Ensure `vitest/globals` types are included |

**Untouched (preserved at `/classic`):** all of `src/App.tsx`, `src/components/*`, `src/hooks/*` (except as noted), `src/levels/*`, `src/utils/*`.

---

## Task 1: Set up test infrastructure

**Files:**
- Modify: `package.json`
- Create: `vitest.config.ts`
- Create: `src/test/setup.ts`
- Create: `src/v2/engine/smoke.test.ts` (verification only — deleted at end of task)

- [ ] **Step 1.1: Install test dependencies**

Run:
```bash
npm install --save-dev vitest @testing-library/react @testing-library/jest-dom @testing-library/user-event jsdom @types/node
```
Expected: dependencies appear in `package.json` under devDependencies; no install errors.

- [ ] **Step 1.2: Add `test` script to `package.json`**

In `package.json`, in the `scripts` object, add:
```json
"test": "vitest",
"test:run": "vitest run"
```
So the scripts block becomes (preserve existing entries):
```json
"scripts": {
  "dev": "vite",
  "build": "vite build",
  "lint": "eslint .",
  "preview": "vite preview",
  "test": "vitest",
  "test:run": "vitest run"
}
```

- [ ] **Step 1.3: Create `vitest.config.ts`**

```ts
import { defineConfig } from 'vitest/config'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  test: {
    globals: true,
    environment: 'jsdom',
    setupFiles: ['./src/test/setup.ts'],
    css: false,
  },
})
```

- [ ] **Step 1.4: Create `src/test/setup.ts`**

```ts
import '@testing-library/jest-dom'
```

- [ ] **Step 1.5: Create smoke test to verify infrastructure**

Create `src/v2/engine/smoke.test.ts`:
```ts
import { describe, it, expect } from 'vitest'

describe('test infrastructure', () => {
  it('runs vitest with globals and jsdom', () => {
    expect(typeof document).toBe('object')
    expect(1 + 1).toBe(2)
  })
})
```

- [ ] **Step 1.6: Run smoke test**

Run: `npm run test:run -- src/v2/engine/smoke.test.ts`
Expected: 1 test passed, 0 failed.

- [ ] **Step 1.7: Delete smoke test**

Run: `rm src/v2/engine/smoke.test.ts`

- [ ] **Step 1.8: Commit**

```bash
git add package.json package-lock.json vitest.config.ts src/test/setup.ts
git commit -m "$(cat <<'EOF'
chore: add vitest + testing-library infrastructure

Adds vitest, @testing-library/react, jsdom for unit and component tests
under the new src/v2/ tree. Wired npm scripts: 'test' (watch) and
'test:run' (single pass for CI).

Co-Authored-By: Claude Opus 4.7 (1M context) <noreply@anthropic.com>
EOF
)"
```

---

## Task 2: Add react-router-dom and create top-level router shell

**Files:**
- Modify: `package.json` (dependency)
- Create: `src/AppRouter.tsx`
- Modify: `src/main.tsx`

- [ ] **Step 2.1: Install react-router-dom**

Run: `npm install react-router-dom@^6`
Expected: `react-router-dom` ^6.x appears in `dependencies`.

- [ ] **Step 2.2: Create `src/AppRouter.tsx` with placeholder routes**

```tsx
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import ClassicApp from './App'

function V2Placeholder({ wing }: { wing: string }) {
  return <div style={{ padding: 24 }}>V2 {wing} — placeholder</div>
}

export default function AppRouter() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Navigate to="/learn" replace />} />
        <Route path="/learn/*" element={<V2Placeholder wing="Learn" />} />
        <Route path="/practice/*" element={<V2Placeholder wing="Practice" />} />
        <Route path="/apply/*" element={<V2Placeholder wing="Apply" />} />
        <Route path="/classic/*" element={<ClassicApp />} />
        <Route path="*" element={<Navigate to="/learn" replace />} />
      </Routes>
    </BrowserRouter>
  )
}
```

- [ ] **Step 2.3: Update `src/main.tsx` to render `AppRouter`**

Replace the file contents with:
```tsx
import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import AppRouter from './AppRouter.tsx'
import './index.css'
import { PostHogErrorBoundary, PostHogProvider } from 'posthog-js/react'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <PostHogProvider
      apiKey={import.meta.env.VITE_PUBLIC_POSTHOG_KEY}
      options={{
        api_host: import.meta.env.VITE_PUBLIC_POSTHOG_HOST,
        ui_host: import.meta.env.VITE_PUBLIC_POSTHOG_UI_HOST,
        debug: import.meta.env.MODE === 'development',
      }}
    >
      <PostHogErrorBoundary>
        <AppRouter />
      </PostHogErrorBoundary>
    </PostHogProvider>
  </StrictMode>,
)
```

- [ ] **Step 2.4: Smoke-test the routing manually**

Run: `npm run dev`
Open in browser:
- `http://localhost:5173/` → should redirect to `/learn` and show "V2 Learn — placeholder"
- `http://localhost:5173/practice` → "V2 Practice — placeholder"
- `http://localhost:5173/apply` → "V2 Apply — placeholder"
- `http://localhost:5173/classic` → renders existing app (sidebar, levels)
- `http://localhost:5173/bogus` → redirects to `/learn`

Stop dev server (`Ctrl+C`) when verified.

- [ ] **Step 2.5: Commit**

```bash
git add package.json package-lock.json src/AppRouter.tsx src/main.tsx
git commit -m "$(cat <<'EOF'
feat: add react-router scaffolding with /classic fallback

Wraps the app in BrowserRouter. / and /learn|/practice|/apply route to
V2 placeholders; /classic mounts the existing App unchanged so users
mid-progress on the current app stay on a working URL.

Co-Authored-By: Claude Opus 4.7 (1M context) <noreply@anthropic.com>
EOF
)"
```

---

## Task 3: Engine types

**Files:**
- Create: `src/v2/engine/types.ts`

- [ ] **Step 3.1: Write the types**

```ts
export interface GridState {
  width: number
  height: number
  cursor: { x: number; y: number }
  keystrokes: number
}

export interface KeyEvent {
  key: string
}

export interface MotionResult {
  state: GridState
  consumed: boolean
}

export type GridMotionFn = (state: GridState, event: KeyEvent) => MotionResult

export interface GridMotion {
  name: string
  keys: string[]
  apply: GridMotionFn
}
```

- [ ] **Step 3.2: Verify it compiles**

Run: `npx tsc --noEmit`
Expected: no errors.

- [ ] **Step 3.3: Commit**

```bash
git add src/v2/engine/types.ts
git commit -m "$(cat <<'EOF'
feat(v2): add engine types for grid-based motions

GridState (width, height, cursor, keystrokes) is the narrow state shape
needed for navigational units (hjkl). Later plans introduce TextState
for editing motions.

Co-Authored-By: Claude Opus 4.7 (1M context) <noreply@anthropic.com>
EOF
)"
```

---

## Task 4: Motion registry with h/j/k/l (TDD)

**Files:**
- Create: `src/v2/engine/motions.test.ts`
- Create: `src/v2/engine/motions.ts`

- [ ] **Step 4.1: Write failing tests**

Create `src/v2/engine/motions.test.ts`:
```ts
import { describe, it, expect } from 'vitest'
import { applyKey, h, j, k, l, motionRegistry } from './motions'
import type { GridState } from './types'

function state(x: number, y: number, w = 5, hgt = 5, keystrokes = 0): GridState {
  return { width: w, height: hgt, cursor: { x, y }, keystrokes }
}

describe('h motion (left)', () => {
  it('decrements x by 1', () => {
    const r = h.apply(state(2, 2), { key: 'h' })
    expect(r.consumed).toBe(true)
    expect(r.state.cursor).toEqual({ x: 1, y: 2 })
  })
  it('clamps at x=0', () => {
    const r = h.apply(state(0, 2), { key: 'h' })
    expect(r.consumed).toBe(true)
    expect(r.state.cursor).toEqual({ x: 0, y: 2 })
  })
})

describe('l motion (right)', () => {
  it('increments x by 1', () => {
    const r = l.apply(state(2, 2), { key: 'l' })
    expect(r.state.cursor).toEqual({ x: 3, y: 2 })
  })
  it('clamps at x=width-1', () => {
    const r = l.apply(state(4, 2, 5), { key: 'l' })
    expect(r.state.cursor).toEqual({ x: 4, y: 2 })
  })
})

describe('j motion (down)', () => {
  it('increments y by 1', () => {
    const r = j.apply(state(2, 2), { key: 'j' })
    expect(r.state.cursor).toEqual({ x: 2, y: 3 })
  })
  it('clamps at y=height-1', () => {
    const r = j.apply(state(2, 4, 5, 5), { key: 'j' })
    expect(r.state.cursor).toEqual({ x: 2, y: 4 })
  })
})

describe('k motion (up)', () => {
  it('decrements y by 1', () => {
    const r = k.apply(state(2, 2), { key: 'k' })
    expect(r.state.cursor).toEqual({ x: 2, y: 1 })
  })
  it('clamps at y=0', () => {
    const r = k.apply(state(2, 0), { key: 'k' })
    expect(r.state.cursor).toEqual({ x: 2, y: 0 })
  })
})

describe('applyKey dispatcher', () => {
  it('routes h/j/k/l through the registry and increments keystrokes when consumed', () => {
    const r = applyKey(state(2, 2), { key: 'l' }, motionRegistry)
    expect(r.consumed).toBe(true)
    expect(r.state.cursor).toEqual({ x: 3, y: 2 })
    expect(r.state.keystrokes).toBe(1)
  })
  it('does not increment keystrokes when no motion matches', () => {
    const r = applyKey(state(2, 2), { key: 'q' }, motionRegistry)
    expect(r.consumed).toBe(false)
    expect(r.state.cursor).toEqual({ x: 2, y: 2 })
    expect(r.state.keystrokes).toBe(0)
  })
  it('increments keystrokes even when motion is a no-op at the boundary', () => {
    const r = applyKey(state(0, 0), { key: 'h' }, motionRegistry)
    expect(r.consumed).toBe(true)
    expect(r.state.keystrokes).toBe(1)
  })
})
```

- [ ] **Step 4.2: Run tests to verify they fail**

Run: `npm run test:run -- src/v2/engine/motions.test.ts`
Expected: FAIL with module-not-found or undefined symbols (`h`, `j`, `k`, `l`, `applyKey`, `motionRegistry`).

- [ ] **Step 4.3: Implement `src/v2/engine/motions.ts`**

```ts
import type { GridMotion, GridMotionFn, GridState, KeyEvent, MotionResult } from './types'

function clamp(v: number, lo: number, hi: number): number {
  return Math.max(lo, Math.min(hi, v))
}

function moveCursor(state: GridState, dx: number, dy: number): GridState {
  return {
    ...state,
    cursor: {
      x: clamp(state.cursor.x + dx, 0, state.width - 1),
      y: clamp(state.cursor.y + dy, 0, state.height - 1),
    },
  }
}

const makeMotion = (name: string, keys: string[], fn: GridMotionFn): GridMotion => ({
  name,
  keys,
  apply: fn,
})

export const h = makeMotion('h', ['h'], (s, _e) => ({
  state: moveCursor(s, -1, 0),
  consumed: true,
}))

export const l = makeMotion('l', ['l'], (s, _e) => ({
  state: moveCursor(s, 1, 0),
  consumed: true,
}))

export const j = makeMotion('j', ['j'], (s, _e) => ({
  state: moveCursor(s, 0, 1),
  consumed: true,
}))

export const k = makeMotion('k', ['k'], (s, _e) => ({
  state: moveCursor(s, 0, -1),
  consumed: true,
}))

export const motionRegistry: GridMotion[] = [h, j, k, l]

export function findMotion(
  registry: GridMotion[],
  key: string,
): GridMotion | undefined {
  return registry.find((m) => m.keys.includes(key))
}

export function applyKey(
  state: GridState,
  event: KeyEvent,
  registry: GridMotion[],
): MotionResult {
  const motion = findMotion(registry, event.key)
  if (!motion) return { state, consumed: false }
  const result = motion.apply(state, event)
  if (!result.consumed) return { state, consumed: false }
  return {
    state: { ...result.state, keystrokes: state.keystrokes + 1 },
    consumed: true,
  }
}
```

- [ ] **Step 4.4: Run tests to verify they pass**

Run: `npm run test:run -- src/v2/engine/motions.test.ts`
Expected: all tests pass.

- [ ] **Step 4.5: Commit**

```bash
git add src/v2/engine/motions.ts src/v2/engine/motions.test.ts
git commit -m "$(cat <<'EOF'
feat(v2): add motion registry with h/j/k/l + applyKey dispatcher

Pure-functional motions over GridState. applyKey looks up the motion
for a key and increments keystrokes when consumed (including no-op
boundary cases — pressing 'h' at x=0 still costs a stroke, matching
vim semantics).

Co-Authored-By: Claude Opus 4.7 (1M context) <noreply@anthropic.com>
EOF
)"
```

---

## Task 5: Cursor-target grader (TDD)

**Files:**
- Create: `src/v2/engine/grader.test.ts`
- Create: `src/v2/engine/grader.ts`

- [ ] **Step 5.1: Write failing tests**

Create `src/v2/engine/grader.test.ts`:
```ts
import { describe, it, expect } from 'vitest'
import { isCursorAt, manhattanPar } from './grader'
import type { GridState } from './types'

function state(x: number, y: number): GridState {
  return { width: 10, height: 10, cursor: { x, y }, keystrokes: 0 }
}

describe('isCursorAt', () => {
  it('returns true when cursor equals target', () => {
    expect(isCursorAt(state(3, 4), { x: 3, y: 4 })).toBe(true)
  })
  it('returns false when cursor differs', () => {
    expect(isCursorAt(state(3, 4), { x: 3, y: 5 })).toBe(false)
    expect(isCursorAt(state(3, 4), { x: 2, y: 4 })).toBe(false)
  })
})

describe('manhattanPar', () => {
  it('computes |dx| + |dy|', () => {
    expect(manhattanPar({ x: 0, y: 0 }, { x: 3, y: 4 })).toBe(7)
    expect(manhattanPar({ x: 5, y: 5 }, { x: 2, y: 1 })).toBe(7)
  })
  it('returns 0 when start equals goal', () => {
    expect(manhattanPar({ x: 2, y: 2 }, { x: 2, y: 2 })).toBe(0)
  })
})
```

- [ ] **Step 5.2: Run tests to verify they fail**

Run: `npm run test:run -- src/v2/engine/grader.test.ts`
Expected: FAIL — `grader` module not found.

- [ ] **Step 5.3: Implement `src/v2/engine/grader.ts`**

```ts
import type { GridState } from './types'

export interface Point {
  x: number
  y: number
}

export function isCursorAt(state: GridState, target: Point): boolean {
  return state.cursor.x === target.x && state.cursor.y === target.y
}

export function manhattanPar(from: Point, to: Point): number {
  return Math.abs(from.x - to.x) + Math.abs(from.y - to.y)
}
```

- [ ] **Step 5.4: Run tests to verify they pass**

Run: `npm run test:run -- src/v2/engine/grader.test.ts`
Expected: all tests pass.

- [ ] **Step 5.5: Commit**

```bash
git add src/v2/engine/grader.ts src/v2/engine/grader.test.ts
git commit -m "$(cat <<'EOF'
feat(v2): add cursor grader (isCursorAt, manhattanPar)

Two helpers the A-drill and B-check stages share: isCursorAt for
hit-detection and manhattanPar for computing the optimal stroke count
between two grid points (used to set par on hjkl puzzles).

Co-Authored-By: Claude Opus 4.7 (1M context) <noreply@anthropic.com>
EOF
)"
```

---

## Task 6: Unit type definitions

**Files:**
- Create: `src/v2/wings/learn/units/types.ts`

- [ ] **Step 6.1: Write the types**

```ts
import type { Point } from '../../../engine/grader'

export interface AStageDef {
  kind: 'a-drill-grid'
  gridWidth: number
  gridHeight: number
  startCursor: Point
  targetCount: number
  allowedKeys: string[]
}

export interface BCheckPuzzle {
  id: string
  gridWidth: number
  gridHeight: number
  start: Point
  goal: Point
  par: number
}

export interface BStageDef {
  kind: 'b-check-cursor-puzzles'
  puzzles: BCheckPuzzle[]
  allowedKeys: string[]
}

export interface Unit {
  id: string
  title: string
  motionLabel: string
  aStage: AStageDef
  bStage: BStageDef
}
```

- [ ] **Step 6.2: Verify it compiles**

Run: `npx tsc --noEmit`
Expected: no errors.

- [ ] **Step 6.3: Commit**

```bash
git add src/v2/wings/learn/units/types.ts
git commit -m "$(cat <<'EOF'
feat(v2): add Learn unit type definitions

A unit has two stages: a drill (hit N random targets with allowed keys)
and a B-check (a list of cursor puzzles, each with start, goal, par).
Discriminated 'kind' fields let later plans add new stage shapes
(e.g. text transforms) without breaking these.

Co-Authored-By: Claude Opus 4.7 (1M context) <noreply@anthropic.com>
EOF
)"
```

---

## Task 7: Define the hjkl unit + units registry

**Files:**
- Create: `src/v2/wings/learn/units/hjkl.ts`
- Create: `src/v2/wings/learn/units/registry.ts`

- [ ] **Step 7.1: Create `src/v2/wings/learn/units/hjkl.ts`**

```ts
import type { Unit } from './types'

export const hjklUnit: Unit = {
  id: 'hjkl',
  title: 'Basic Movement',
  motionLabel: 'h j k l',
  aStage: {
    kind: 'a-drill-grid',
    gridWidth: 10,
    gridHeight: 6,
    startCursor: { x: 0, y: 0 },
    targetCount: 20,
    allowedKeys: ['h', 'j', 'k', 'l'],
  },
  bStage: {
    kind: 'b-check-cursor-puzzles',
    allowedKeys: ['h', 'j', 'k', 'l'],
    puzzles: [
      {
        id: 'hjkl-b1',
        gridWidth: 6,
        gridHeight: 4,
        start: { x: 0, y: 0 },
        goal: { x: 5, y: 3 },
        par: 8,
      },
      {
        id: 'hjkl-b2',
        gridWidth: 8,
        gridHeight: 4,
        start: { x: 0, y: 2 },
        goal: { x: 7, y: 0 },
        par: 9,
      },
      {
        id: 'hjkl-b3',
        gridWidth: 6,
        gridHeight: 5,
        start: { x: 3, y: 2 },
        goal: { x: 0, y: 4 },
        par: 5,
      },
    ],
  },
}
```

- [ ] **Step 7.2: Create `src/v2/wings/learn/units/registry.ts`**

```ts
import type { Unit } from './types'
import { hjklUnit } from './hjkl'

export const units: Unit[] = [hjklUnit]

export function findUnit(id: string): Unit | undefined {
  return units.find((u) => u.id === id)
}
```

- [ ] **Step 7.3: Verify compilation**

Run: `npx tsc --noEmit`
Expected: no errors.

- [ ] **Step 7.4: Commit**

```bash
git add src/v2/wings/learn/units/hjkl.ts src/v2/wings/learn/units/registry.ts
git commit -m "$(cat <<'EOF'
feat(v2): add the hjkl unit and units registry

A-drill: 10x6 grid, 20 random targets. B-check: three short cursor
puzzles with hand-set par values (verified by manhattan distance
between start and goal).

Co-Authored-By: Claude Opus 4.7 (1M context) <noreply@anthropic.com>
EOF
)"
```

---

## Task 8: Progress store (TDD)

**Files:**
- Create: `src/v2/state/types.ts`
- Create: `src/v2/state/progress.test.ts`
- Create: `src/v2/state/progress.ts`

- [ ] **Step 8.1: Create `src/v2/state/types.ts`**

```ts
export type StageStatus = 'locked' | 'ready' | 'in-progress' | 'completed'

export interface UnitProgress {
  aStatus: StageStatus
  bStatus: StageStatus
}

export interface Progress {
  units: Record<string, UnitProgress>
}

export const STORAGE_KEY = 'vimsanity-v2-progress'
```

- [ ] **Step 8.2: Write failing tests**

Create `src/v2/state/progress.test.ts`:
```ts
import { describe, it, expect, beforeEach } from 'vitest'
import {
  loadProgress,
  saveProgress,
  resetProgress,
  markStageCompleted,
  getUnitProgress,
  initialProgressFor,
} from './progress'
import { STORAGE_KEY } from './types'

beforeEach(() => {
  localStorage.clear()
})

describe('initialProgressFor', () => {
  it('returns the first unit ready and the rest locked', () => {
    const p = initialProgressFor(['hjkl', 'wbe', 'lineEdges'])
    expect(p.units.hjkl).toEqual({ aStatus: 'ready', bStatus: 'locked' })
    expect(p.units.wbe).toEqual({ aStatus: 'locked', bStatus: 'locked' })
    expect(p.units.lineEdges).toEqual({ aStatus: 'locked', bStatus: 'locked' })
  })
})

describe('save and load round-trip', () => {
  it('persists progress through localStorage', () => {
    const p = initialProgressFor(['hjkl'])
    saveProgress(p)
    const loaded = loadProgress(['hjkl'])
    expect(loaded).toEqual(p)
  })

  it('falls back to initialProgressFor when storage is empty', () => {
    const loaded = loadProgress(['hjkl'])
    expect(loaded.units.hjkl.aStatus).toBe('ready')
  })

  it('falls back when storage contains malformed JSON', () => {
    localStorage.setItem(STORAGE_KEY, 'not json')
    const loaded = loadProgress(['hjkl'])
    expect(loaded.units.hjkl.aStatus).toBe('ready')
  })
})

describe('markStageCompleted', () => {
  it('marks A completed and unlocks B', () => {
    const p = initialProgressFor(['hjkl', 'wbe'])
    const next = markStageCompleted(p, 'hjkl', 'a', ['hjkl', 'wbe'])
    expect(next.units.hjkl).toEqual({ aStatus: 'completed', bStatus: 'ready' })
    expect(next.units.wbe).toEqual({ aStatus: 'locked', bStatus: 'locked' })
  })

  it('marks B completed and unlocks the next unit', () => {
    const p = markStageCompleted(initialProgressFor(['hjkl', 'wbe']), 'hjkl', 'a', ['hjkl', 'wbe'])
    const next = markStageCompleted(p, 'hjkl', 'b', ['hjkl', 'wbe'])
    expect(next.units.hjkl).toEqual({ aStatus: 'completed', bStatus: 'completed' })
    expect(next.units.wbe).toEqual({ aStatus: 'ready', bStatus: 'locked' })
  })

  it('completing the last unit does nothing extra', () => {
    let p = initialProgressFor(['hjkl'])
    p = markStageCompleted(p, 'hjkl', 'a', ['hjkl'])
    p = markStageCompleted(p, 'hjkl', 'b', ['hjkl'])
    expect(p.units.hjkl).toEqual({ aStatus: 'completed', bStatus: 'completed' })
  })
})

describe('resetProgress', () => {
  it('clears localStorage', () => {
    saveProgress(initialProgressFor(['hjkl']))
    resetProgress()
    expect(localStorage.getItem(STORAGE_KEY)).toBeNull()
  })
})

describe('getUnitProgress', () => {
  it('returns the per-unit record', () => {
    const p = initialProgressFor(['hjkl'])
    expect(getUnitProgress(p, 'hjkl')).toEqual({ aStatus: 'ready', bStatus: 'locked' })
  })
  it('returns a locked record for unknown ids', () => {
    const p = initialProgressFor(['hjkl'])
    expect(getUnitProgress(p, 'unknown')).toEqual({ aStatus: 'locked', bStatus: 'locked' })
  })
})
```

- [ ] **Step 8.3: Run tests to verify failure**

Run: `npm run test:run -- src/v2/state/progress.test.ts`
Expected: FAIL — `progress` module not found.

- [ ] **Step 8.4: Implement `src/v2/state/progress.ts`**

```ts
import { STORAGE_KEY } from './types'
import type { Progress, UnitProgress } from './types'

const LOCKED: UnitProgress = { aStatus: 'locked', bStatus: 'locked' }

export function initialProgressFor(unitIds: string[]): Progress {
  const units: Record<string, UnitProgress> = {}
  unitIds.forEach((id, i) => {
    units[id] = i === 0 ? { aStatus: 'ready', bStatus: 'locked' } : { ...LOCKED }
  })
  return { units }
}

export function loadProgress(unitIds: string[]): Progress {
  const raw = localStorage.getItem(STORAGE_KEY)
  if (!raw) return initialProgressFor(unitIds)
  try {
    const parsed = JSON.parse(raw) as Progress
    if (!parsed || typeof parsed !== 'object' || !parsed.units) {
      return initialProgressFor(unitIds)
    }
    return parsed
  } catch {
    return initialProgressFor(unitIds)
  }
}

export function saveProgress(progress: Progress): void {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(progress))
}

export function resetProgress(): void {
  localStorage.removeItem(STORAGE_KEY)
}

export function getUnitProgress(progress: Progress, unitId: string): UnitProgress {
  return progress.units[unitId] ?? { ...LOCKED }
}

export function markStageCompleted(
  progress: Progress,
  unitId: string,
  stage: 'a' | 'b',
  unitIds: string[],
): Progress {
  const current = getUnitProgress(progress, unitId)
  const updated: UnitProgress =
    stage === 'a'
      ? { aStatus: 'completed', bStatus: 'ready' }
      : { aStatus: current.aStatus, bStatus: 'completed' }

  const nextUnits: Record<string, UnitProgress> = { ...progress.units, [unitId]: updated }

  if (stage === 'b') {
    const idx = unitIds.indexOf(unitId)
    const nextId = unitIds[idx + 1]
    if (nextId) {
      const nextCurrent = getUnitProgress(progress, nextId)
      nextUnits[nextId] = { ...nextCurrent, aStatus: 'ready' }
    }
  }

  return { units: nextUnits }
}
```

- [ ] **Step 8.5: Run tests to verify they pass**

Run: `npm run test:run -- src/v2/state/progress.test.ts`
Expected: all tests pass.

- [ ] **Step 8.6: Commit**

```bash
git add src/v2/state/types.ts src/v2/state/progress.ts src/v2/state/progress.test.ts
git commit -m "$(cat <<'EOF'
feat(v2): add localStorage-backed Progress store

Namespaced under 'vimsanity-v2-' so it never collides with the classic
app's keys. Strict linear unlock: completing A unlocks B; completing
B unlocks A of the next unit. Malformed/missing storage gracefully
falls back to a fresh Progress for the given unit list.

Co-Authored-By: Claude Opus 4.7 (1M context) <noreply@anthropic.com>
EOF
)"
```

---

## Task 9: Shell + WingsNav components

**Files:**
- Create: `src/v2/shell/WingsNav.tsx`
- Create: `src/v2/shell/Shell.tsx`

- [ ] **Step 9.1: Create `src/v2/shell/WingsNav.tsx`**

```tsx
import { NavLink } from 'react-router-dom'

const tabs: Array<{ to: string; label: string }> = [
  { to: '/learn', label: '📘 Learn' },
  { to: '/practice', label: '🎯 Practice' },
  { to: '/apply', label: '⚒ Apply' },
]

export default function WingsNav() {
  return (
    <nav className="flex gap-1 border-b border-gray-800 bg-gray-950 px-4 py-2">
      {tabs.map((t) => (
        <NavLink
          key={t.to}
          to={t.to}
          className={({ isActive }) =>
            `rounded-md px-4 py-2 text-sm font-medium transition-colors ${
              isActive
                ? 'bg-gray-800 text-white'
                : 'text-gray-400 hover:bg-gray-900 hover:text-gray-200'
            }`
          }
        >
          {t.label}
        </NavLink>
      ))}
    </nav>
  )
}
```

- [ ] **Step 9.2: Create `src/v2/shell/Shell.tsx`**

```tsx
import { Outlet } from 'react-router-dom'
import WingsNav from './WingsNav'

export default function Shell() {
  return (
    <div className="flex min-h-screen flex-col bg-gray-950 text-gray-100">
      <WingsNav />
      <main className="flex-1">
        <Outlet />
      </main>
    </div>
  )
}
```

- [ ] **Step 9.3: Verify compilation**

Run: `npx tsc --noEmit`
Expected: no errors.

- [ ] **Step 9.4: Commit**

```bash
git add src/v2/shell/WingsNav.tsx src/v2/shell/Shell.tsx
git commit -m "$(cat <<'EOF'
feat(v2): add Shell layout with three-wings top nav

WingsNav uses NavLink so the active route gets visually highlighted.
Shell is a thin layout wrapper with an Outlet for nested wing routes.

Co-Authored-By: Claude Opus 4.7 (1M context) <noreply@anthropic.com>
EOF
)"
```

---

## Task 10: Practice and Apply wing stubs

**Files:**
- Create: `src/v2/wings/practice/PracticeWing.tsx`
- Create: `src/v2/wings/apply/ApplyWing.tsx`

- [ ] **Step 10.1: Create `src/v2/wings/practice/PracticeWing.tsx`**

```tsx
export default function PracticeWing() {
  return (
    <div className="flex flex-col items-center justify-center p-16 text-center">
      <h1 className="text-3xl font-bold text-gray-100">Practice</h1>
      <p className="mt-4 max-w-md text-gray-400">
        The daily puzzle and drill library land here in the next release.
        For now, head to <span className="font-mono text-orange-400">Learn</span> to
        work through the curriculum.
      </p>
    </div>
  )
}
```

- [ ] **Step 10.2: Create `src/v2/wings/apply/ApplyWing.tsx`**

```tsx
export default function ApplyWing() {
  return (
    <div className="flex flex-col items-center justify-center p-16 text-center">
      <h1 className="text-3xl font-bold text-gray-100">Apply</h1>
      <p className="mt-4 max-w-md text-gray-400">
        Capstone missions unlock here once you've graduated chunks of Learn.
        Coming with the next release.
      </p>
    </div>
  )
}
```

- [ ] **Step 10.3: Commit**

```bash
git add src/v2/wings/practice/PracticeWing.tsx src/v2/wings/apply/ApplyWing.tsx
git commit -m "$(cat <<'EOF'
feat(v2): add Practice and Apply wing stubs

Visible from day one so users see all three wings in nav and know the
roadmap; functionality lands in Plans 3 and 4.

Co-Authored-By: Claude Opus 4.7 (1M context) <noreply@anthropic.com>
EOF
)"
```

---

## Task 11: A-drill stage component

**Files:**
- Create: `src/v2/wings/learn/stages/ADrillStage.tsx`

- [ ] **Step 11.1: Implement the component**

```tsx
import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { applyKey, motionRegistry } from '../../../engine/motions'
import { isCursorAt } from '../../../engine/grader'
import type { GridState } from '../../../engine/types'
import type { AStageDef } from '../units/types'

interface Point { x: number; y: number }

interface Props {
  def: AStageDef
  onCompleted: () => void
}

function randomTarget(width: number, height: number, exclude: Point): Point {
  while (true) {
    const x = Math.floor(Math.random() * width)
    const y = Math.floor(Math.random() * height)
    if (x !== exclude.x || y !== exclude.y) return { x, y }
  }
}

export default function ADrillStage({ def, onCompleted }: Props) {
  const [state, setState] = useState<GridState>({
    width: def.gridWidth,
    height: def.gridHeight,
    cursor: { ...def.startCursor },
    keystrokes: 0,
  })
  const [target, setTarget] = useState<Point>(() =>
    randomTarget(def.gridWidth, def.gridHeight, def.startCursor),
  )
  const [hits, setHits] = useState(0)
  const completedRef = useRef(false)

  const handleKeyDown = useCallback(
    (e: KeyboardEvent) => {
      if (completedRef.current) return
      if (!def.allowedKeys.includes(e.key)) return
      e.preventDefault()
      setState((prev) => {
        const { state: next } = applyKey(prev, { key: e.key }, motionRegistry)
        if (isCursorAt(next, target)) {
          const nextHits = hits + 1
          setHits(nextHits)
          if (nextHits >= def.targetCount) {
            completedRef.current = true
            queueMicrotask(onCompleted)
          } else {
            setTarget(randomTarget(def.gridWidth, def.gridHeight, next.cursor))
          }
        }
        return next
      })
    },
    [def.allowedKeys, def.gridWidth, def.gridHeight, def.targetCount, hits, target, onCompleted],
  )

  useEffect(() => {
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [handleKeyDown])

  const cells = useMemo(() => {
    const rows = []
    for (let y = 0; y < def.gridHeight; y++) {
      const row = []
      for (let x = 0; x < def.gridWidth; x++) {
        const isCursor = state.cursor.x === x && state.cursor.y === y
        const isTarget = target.x === x && target.y === y
        row.push(
          <div
            key={`${x},${y}`}
            className={`flex h-10 w-10 items-center justify-center rounded text-xs ${
              isCursor
                ? 'bg-orange-500 text-black'
                : isTarget
                ? 'bg-green-500 text-black'
                : 'bg-gray-800 text-gray-700'
            }`}
          >
            {isCursor ? '●' : isTarget ? '★' : ''}
          </div>,
        )
      }
      rows.push(
        <div key={y} className="flex gap-1">
          {row}
        </div>,
      )
    }
    return rows
  }, [state.cursor.x, state.cursor.y, target, def.gridWidth, def.gridHeight])

  return (
    <div className="flex flex-col items-center gap-6 p-8">
      <div className="text-sm text-gray-400">
        Drill · Hit the <span className="text-green-400">★</span> with{' '}
        <span className="font-mono text-orange-300">h j k l</span>
      </div>
      <div className="flex flex-col gap-1">{cells}</div>
      <div className="text-sm text-gray-300">
        <span className="font-mono">{hits}</span> / {def.targetCount} targets
      </div>
    </div>
  )
}
```

- [ ] **Step 11.2: Verify compilation**

Run: `npx tsc --noEmit`
Expected: no errors.

- [ ] **Step 11.3: Commit**

```bash
git add src/v2/wings/learn/stages/ADrillStage.tsx
git commit -m "$(cat <<'EOF'
feat(v2): add ADrillStage — hit N random targets with allowed keys

Reads keys via window listener (the unit owns full keyboard focus
while active). Calls onCompleted once targetCount targets have been
hit. The completedRef guards against double-fire if React re-runs
the handler before unmount.

Co-Authored-By: Claude Opus 4.7 (1M context) <noreply@anthropic.com>
EOF
)"
```

---

## Task 12: B-check stage component

**Files:**
- Create: `src/v2/wings/learn/stages/BCheckStage.tsx`

- [ ] **Step 12.1: Implement the component**

```tsx
import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { applyKey, motionRegistry } from '../../../engine/motions'
import { isCursorAt } from '../../../engine/grader'
import type { GridState } from '../../../engine/types'
import type { BCheckPuzzle, BStageDef } from '../units/types'

interface Props {
  def: BStageDef
  onCompleted: () => void
}

interface PuzzleResult {
  puzzleId: string
  keystrokes: number
  par: number
}

function freshState(p: BCheckPuzzle): GridState {
  return {
    width: p.gridWidth,
    height: p.gridHeight,
    cursor: { ...p.start },
    keystrokes: 0,
  }
}

export default function BCheckStage({ def, onCompleted }: Props) {
  const [puzzleIdx, setPuzzleIdx] = useState(0)
  const [state, setState] = useState<GridState>(() => freshState(def.puzzles[0]))
  const [results, setResults] = useState<PuzzleResult[]>([])
  const completedRef = useRef(false)
  const puzzle = def.puzzles[puzzleIdx]

  const handleKeyDown = useCallback(
    (e: KeyboardEvent) => {
      if (completedRef.current) return
      if (!def.allowedKeys.includes(e.key)) return
      e.preventDefault()
      setState((prev) => {
        const { state: next } = applyKey(prev, { key: e.key }, motionRegistry)
        if (isCursorAt(next, puzzle.goal)) {
          const result: PuzzleResult = {
            puzzleId: puzzle.id,
            keystrokes: next.keystrokes,
            par: puzzle.par,
          }
          const allResults = [...results, result]
          setResults(allResults)
          const nextIdx = puzzleIdx + 1
          if (nextIdx >= def.puzzles.length) {
            completedRef.current = true
            queueMicrotask(onCompleted)
          } else {
            setPuzzleIdx(nextIdx)
            return freshState(def.puzzles[nextIdx])
          }
        }
        return next
      })
    },
    [def.allowedKeys, def.puzzles, puzzle, puzzleIdx, results, onCompleted],
  )

  useEffect(() => {
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [handleKeyDown])

  const cells = useMemo(() => {
    const rows = []
    for (let y = 0; y < puzzle.gridHeight; y++) {
      const row = []
      for (let x = 0; x < puzzle.gridWidth; x++) {
        const isCursor = state.cursor.x === x && state.cursor.y === y
        const isGoal = puzzle.goal.x === x && puzzle.goal.y === y
        row.push(
          <div
            key={`${x},${y}`}
            className={`flex h-10 w-10 items-center justify-center rounded text-xs ${
              isCursor
                ? 'bg-orange-500 text-black'
                : isGoal
                ? 'bg-green-500 text-black'
                : 'bg-gray-800 text-gray-700'
            }`}
          >
            {isCursor ? '●' : isGoal ? '★' : ''}
          </div>,
        )
      }
      rows.push(
        <div key={y} className="flex gap-1">
          {row}
        </div>,
      )
    }
    return rows
  }, [puzzle, state.cursor.x, state.cursor.y])

  return (
    <div className="flex flex-col items-center gap-6 p-8">
      <div className="text-sm text-gray-400">
        Puzzle {puzzleIdx + 1} / {def.puzzles.length} · Par{' '}
        <span className="font-mono text-orange-300">{puzzle.par}</span> keystrokes
      </div>
      <div className="flex flex-col gap-1">{cells}</div>
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

- [ ] **Step 12.2: Verify compilation**

Run: `npx tsc --noEmit`
Expected: no errors.

- [ ] **Step 12.3: Commit**

```bash
git add src/v2/wings/learn/stages/BCheckStage.tsx
git commit -m "$(cat <<'EOF'
feat(v2): add BCheckStage — cursor puzzles with keystroke par

Plays through the puzzle list sequentially. Each puzzle: navigate
from start to goal; result captures strokes vs par. Reaching the
last goal calls onCompleted.

Co-Authored-By: Claude Opus 4.7 (1M context) <noreply@anthropic.com>
EOF
)"
```

---

## Task 13: UnitRunner

**Files:**
- Create: `src/v2/wings/learn/UnitRunner.tsx`

- [ ] **Step 13.1: Implement the component**

```tsx
import { useCallback, useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import ADrillStage from './stages/ADrillStage'
import BCheckStage from './stages/BCheckStage'
import { units, findUnit } from './units/registry'
import {
  loadProgress,
  saveProgress,
  markStageCompleted,
  getUnitProgress,
} from '../../state/progress'

type ActiveStage = 'a' | 'b' | 'done'

export default function UnitRunner() {
  const { unitId } = useParams<{ unitId: string }>()
  const navigate = useNavigate()
  const unit = unitId ? findUnit(unitId) : undefined
  const unitIds = units.map((u) => u.id)

  const [progress, setProgress] = useState(() => loadProgress(unitIds))
  const [active, setActive] = useState<ActiveStage>('a')

  useEffect(() => {
    if (!unit) return
    const up = getUnitProgress(progress, unit.id)
    if (up.aStatus !== 'completed') setActive('a')
    else if (up.bStatus !== 'completed') setActive('b')
    else setActive('done')
  }, [unit, progress])

  const handleAComplete = useCallback(() => {
    if (!unit) return
    const next = markStageCompleted(progress, unit.id, 'a', unitIds)
    saveProgress(next)
    setProgress(next)
  }, [progress, unit, unitIds])

  const handleBComplete = useCallback(() => {
    if (!unit) return
    const next = markStageCompleted(progress, unit.id, 'b', unitIds)
    saveProgress(next)
    setProgress(next)
  }, [progress, unit, unitIds])

  if (!unit) {
    return (
      <div className="p-8 text-gray-400">
        Unknown unit. <button onClick={() => navigate('/learn')}>Back to Learn</button>
      </div>
    )
  }

  return (
    <div className="flex flex-1 flex-col">
      <header className="border-b border-gray-800 px-6 py-4">
        <div className="text-xs uppercase tracking-wider text-gray-500">
          Unit · {unit.id}
        </div>
        <h1 className="text-xl font-semibold text-gray-100">{unit.title}</h1>
        <div className="mt-1 font-mono text-sm text-orange-300">{unit.motionLabel}</div>
      </header>
      {active === 'a' && <ADrillStage def={unit.aStage} onCompleted={handleAComplete} />}
      {active === 'b' && <BCheckStage def={unit.bStage} onCompleted={handleBComplete} />}
      {active === 'done' && (
        <div className="flex flex-col items-center gap-4 p-12 text-center">
          <div className="text-2xl">✓ Unit complete</div>
          <div className="text-sm text-gray-400">
            More units arrive in the next release.
          </div>
          <button
            className="rounded bg-orange-500 px-4 py-2 text-sm text-black"
            onClick={() => navigate('/learn')}
          >
            Back to Learn
          </button>
        </div>
      )}
    </div>
  )
}
```

- [ ] **Step 13.2: Verify compilation**

Run: `npx tsc --noEmit`
Expected: no errors.

- [ ] **Step 13.3: Commit**

```bash
git add src/v2/wings/learn/UnitRunner.tsx
git commit -m "$(cat <<'EOF'
feat(v2): add UnitRunner — drives A → B → done within a unit

Reads unitId from the route, loads progress, picks the next
incomplete stage. On stage completion writes back to localStorage
and re-derives the active stage.

Co-Authored-By: Claude Opus 4.7 (1M context) <noreply@anthropic.com>
EOF
)"
```

---

## Task 14: Unit sidebar

**Files:**
- Create: `src/v2/wings/learn/UnitSidebar.tsx`

- [ ] **Step 14.1: Implement the component**

```tsx
import { NavLink } from 'react-router-dom'
import { units } from './units/registry'
import type { Progress } from '../../state/types'
import { getUnitProgress } from '../../state/progress'

interface Props {
  progress: Progress
}

function statusLabel(p: ReturnType<typeof getUnitProgress>): string {
  if (p.bStatus === 'completed') return '✓'
  if (p.aStatus === 'completed') return '◐'
  if (p.aStatus === 'ready') return '○'
  return '🔒'
}

export default function UnitSidebar({ progress }: Props) {
  return (
    <aside className="w-64 border-r border-gray-800 bg-gray-950 p-4">
      <div className="mb-3 text-xs uppercase tracking-wider text-gray-500">
        Curriculum
      </div>
      <ul className="flex flex-col gap-1">
        {units.map((u) => {
          const up = getUnitProgress(progress, u.id)
          const locked = up.aStatus === 'locked'
          return (
            <li key={u.id}>
              <NavLink
                to={locked ? '#' : `/learn/${u.id}`}
                onClick={(e) => {
                  if (locked) e.preventDefault()
                }}
                className={({ isActive }) =>
                  `flex items-center gap-2 rounded px-3 py-2 text-sm ${
                    locked
                      ? 'cursor-not-allowed text-gray-600'
                      : isActive
                      ? 'bg-gray-800 text-white'
                      : 'text-gray-300 hover:bg-gray-900'
                  }`
                }
              >
                <span className="w-4 text-center">{statusLabel(up)}</span>
                <span className="flex-1">{u.title}</span>
              </NavLink>
            </li>
          )
        })}
      </ul>
    </aside>
  )
}
```

- [ ] **Step 14.2: Verify compilation**

Run: `npx tsc --noEmit`
Expected: no errors.

- [ ] **Step 14.3: Commit**

```bash
git add src/v2/wings/learn/UnitSidebar.tsx
git commit -m "$(cat <<'EOF'
feat(v2): add UnitSidebar with locked/ready/in-progress/done glyphs

Locked units are visually muted and clicks suppressed. Active route
highlights via NavLink. Only one unit in Plan 1 (hjkl) but layout is
ready for Plan 2's additions.

Co-Authored-By: Claude Opus 4.7 (1M context) <noreply@anthropic.com>
EOF
)"
```

---

## Task 15: Learn wing container

**Files:**
- Create: `src/v2/wings/learn/LearnWing.tsx`

- [ ] **Step 15.1: Implement the component**

```tsx
import { useEffect, useState } from 'react'
import { Navigate, Outlet, useLocation } from 'react-router-dom'
import UnitSidebar from './UnitSidebar'
import { units } from './units/registry'
import { loadProgress, getUnitProgress } from '../../state/progress'
import type { Progress } from '../../state/types'

function nextReadyUnitId(progress: Progress): string {
  for (const u of units) {
    const up = getUnitProgress(progress, u.id)
    if (up.aStatus !== 'completed' || up.bStatus !== 'completed') return u.id
  }
  return units[units.length - 1].id
}

export default function LearnWing() {
  const unitIds = units.map((u) => u.id)
  const [progress, setProgress] = useState<Progress>(() => loadProgress(unitIds))
  const location = useLocation()

  useEffect(() => {
    setProgress(loadProgress(unitIds))
  }, [location.pathname, unitIds])

  if (location.pathname === '/learn' || location.pathname === '/learn/') {
    return <Navigate to={`/learn/${nextReadyUnitId(progress)}`} replace />
  }

  return (
    <div className="flex flex-1">
      <UnitSidebar progress={progress} />
      <Outlet />
    </div>
  )
}
```

- [ ] **Step 15.2: Verify compilation**

Run: `npx tsc --noEmit`
Expected: no errors.

- [ ] **Step 15.3: Commit**

```bash
git add src/v2/wings/learn/LearnWing.tsx
git commit -m "$(cat <<'EOF'
feat(v2): add LearnWing — sidebar + unit outlet

Auto-redirects bare /learn to the next ready unit so returning users
land on their in-progress work without manual sidebar navigation.
Re-reads progress on route change so completion state stays fresh.

Co-Authored-By: Claude Opus 4.7 (1M context) <noreply@anthropic.com>
EOF
)"
```

---

## Task 16: V2 routes table

**Files:**
- Create: `src/v2/routes.tsx`

- [ ] **Step 16.1: Implement the routes**

```tsx
import { Route } from 'react-router-dom'
import Shell from './shell/Shell'
import LearnWing from './wings/learn/LearnWing'
import UnitRunner from './wings/learn/UnitRunner'
import PracticeWing from './wings/practice/PracticeWing'
import ApplyWing from './wings/apply/ApplyWing'

export function v2Routes() {
  return (
    <Route element={<Shell />}>
      <Route path="/learn" element={<LearnWing />}>
        <Route path=":unitId" element={<UnitRunner />} />
      </Route>
      <Route path="/practice" element={<PracticeWing />} />
      <Route path="/apply" element={<ApplyWing />} />
    </Route>
  )
}
```

- [ ] **Step 16.2: Verify compilation**

Run: `npx tsc --noEmit`
Expected: no errors.

- [ ] **Step 16.3: Commit**

```bash
git add src/v2/routes.tsx
git commit -m "$(cat <<'EOF'
feat(v2): add nested route table for the V2 surface

Shell is the layout route; /learn nests UnitRunner under :unitId.
Exported as a function returning Route elements so AppRouter can
splice them into its top-level <Routes>.

Co-Authored-By: Claude Opus 4.7 (1M context) <noreply@anthropic.com>
EOF
)"
```

---

## Task 17: Wire V2 routes into AppRouter

**Files:**
- Modify: `src/AppRouter.tsx`

- [ ] **Step 17.1: Replace placeholder routes with the real V2 tree**

Replace the contents of `src/AppRouter.tsx` with:
```tsx
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import ClassicApp from './App'
import { v2Routes } from './v2/routes'

export default function AppRouter() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Navigate to="/learn" replace />} />
        {v2Routes()}
        <Route path="/classic/*" element={<ClassicApp />} />
        <Route path="*" element={<Navigate to="/learn" replace />} />
      </Routes>
    </BrowserRouter>
  )
}
```

- [ ] **Step 17.2: Verify compilation**

Run: `npx tsc --noEmit`
Expected: no errors.

- [ ] **Step 17.3: Verify lint passes**

Run: `npm run lint`
Expected: no errors (warnings on existing classic files are OK; new v2 files should have none).

- [ ] **Step 17.4: Commit**

```bash
git add src/AppRouter.tsx
git commit -m "$(cat <<'EOF'
feat(v2): mount V2 wings into AppRouter

V2 takes over /, /learn, /practice, /apply. /classic remains mounted
unchanged. Unknown routes redirect to /learn.

Co-Authored-By: Claude Opus 4.7 (1M context) <noreply@anthropic.com>
EOF
)"
```

---

## Task 18: End-to-end manual verification

**Files:** none modified — verification only.

- [ ] **Step 18.1: Run full test suite**

Run: `npm run test:run`
Expected: all tests pass (motions, grader, progress).

- [ ] **Step 18.2: Run lint**

Run: `npm run lint`
Expected: no new errors on `src/v2/**` or `src/AppRouter.tsx`.

- [ ] **Step 18.3: Run typecheck**

Run: `npx tsc --noEmit`
Expected: no errors.

- [ ] **Step 18.4: Start dev server and walk the golden path**

Run: `npm run dev` (keeps running; verify manually then stop)

In a fresh browser profile (or after clearing `localStorage` for `localhost:5173`):

1. Visit `http://localhost:5173/` → redirects to `/learn/hjkl` and shows the A-drill grid.
2. Press `h j k l` keys → cursor moves, never escapes grid bounds.
3. Reach the green star → it relocates and the hit counter increments.
4. Continue until you reach 20 hits → page transitions to the B-check stage.
5. B-check shows puzzle 1 of 3 with par 8. Navigate to the goal → stroke count compared to par.
6. Solve all 3 puzzles → "✓ Unit complete" screen appears.
7. Click "Back to Learn" → returns to `/learn`; sidebar shows hjkl with ✓ glyph.
8. Reload the page → progress persists; you land back at the unit-complete screen.
9. Visit `/practice` → "Coming soon" stub.
10. Visit `/apply` → "Coming soon" stub.
11. Visit `/classic` → the existing classic app loads with its sidebar and levels.
12. Open DevTools → Application → Local Storage → confirm `vimsanity-v2-progress` exists with the hjkl unit marked completed.

Stop dev server.

- [ ] **Step 18.5: Verify no regressions on /classic**

Run: `npm run dev` again. Visit `/classic`. Navigate through 2-3 levels (e.g. Level 1 grid movement, Level 2 word motion). Confirm nothing in the classic app behaves differently than before this plan was executed.

Stop dev server.

- [ ] **Step 18.6: Final summary commit (optional, only if any docs/notes added during verification)**

If no changes during verification, skip. Otherwise:
```bash
git status
# Commit any incidental fixes with descriptive message
```

---

## Self-Review (writer's note)

Coverage check against spec sections:

- **§4 Three Wings structure** → Tasks 9, 10, 15-17 (shell, stubs, learn wing, routes, mount)
- **§5 Learn wing structure (A + B-check)** → Tasks 6, 7, 11, 12, 13 (types, unit data, stages, runner)
- **§9.1 Unit 1 (hjkl)** → Task 7 (unit definition) + 11, 12 (stages)
- **§10 Migration (/classic fallback)** → Task 2 (initial wire), Task 17 (final wire)
- **§12 Open question: localStorage namespacing** → Task 8 (`vimsanity-v2-progress` key)

Out of scope for Plan 1 (per the plan header):
- Units 2-7 → Plan 2
- Daily puzzle → Plan 3
- Capstones → Plan 4
- Onboarding (demo, placement, drop) → Plan 5; for now `/` → `/learn/<next-ready-unit>` is the entry
- Analytics → Plan 6 (or threaded into the others)
- Visual brand → separate effort

Type consistency: `Point` exported from `engine/grader.ts` is used by `units/types.ts`. `StageStatus` and `Progress` flow consistently from `state/types.ts` through `progress.ts` to all UI consumers. `GridState` flows from `engine/types.ts` through `motions.ts`, `grader.ts`, and both stage components. No naming drift.

Known limitations the next plan picks up:
- Engine is grid-only. Plan 2's word-motion unit needs a text-based state — that's where to introduce a discriminated state union and per-stage state shape.
- No `useKeyboardHandler`-style hook; stages each register their own window listener. If a third stage type needs the same pattern, extract then.
- No analytics events fire yet. Plan 6 threads PostHog calls into UnitRunner and the two stage components.
