# V2 Analytics (Minimal Funnel) Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Instrument the V2 game with the 7-event minimal funnel (onboarding → units → graduation → daily puzzle) from the approved spec `docs/superpowers/specs/2026-06-10-v2-analytics-design.md`.

**Architecture:** One new typed module `src/v2/analytics.ts` wrapping the global `posthog-js` singleton (already initialized by `PostHogProvider` in `src/main.tsx` when `VITE_PUBLIC_POSTHOG_KEY` is set; silent no-op otherwise). A pure `justGraduated()` predicate in `src/v2/state/progress.ts` dedupes the graduation event. Components call `track()` at milestone moments; state modules stay pure.

**Tech Stack:** React 19, TypeScript, vitest, posthog-js (^1.239.1, already a dependency).

**Branch:** Work directly on `rebuild` (the consolidated V2 branch).

---

## File map

| File | Action | Responsibility |
|---|---|---|
| `src/v2/analytics.ts` | Create | Typed `track()` over the posthog singleton |
| `src/v2/analytics.test.ts` | Create | Unit tests for `track()` |
| `src/v2/state/progress.ts` | Modify | Add pure `justGraduated()` predicate |
| `src/v2/state/progress.test.ts` | Modify | Tests for `justGraduated()` |
| `src/v2/wings/learn/LearnWing.tsx` | Modify | `v2_onboarding_started` / `v2_onboarding_completed` |
| `src/v2/wings/learn/UnitRunner.tsx` | Modify | `v2_unit_started` / `v2_unit_completed` / `v2_graduated` |
| `src/v2/wings/practice/PracticeWing.tsx` | Modify | `v2_daily_started` / `v2_daily_solved` |
| `docs/superpowers/NEXT-SESSION.md` | Modify | Record Plans 5–9 as done |

Baseline before starting: 252 tests pass, 1 skip (`npm run test:run`).

---

### Task 1: `analytics.ts` — typed track() module

**Files:**
- Create: `src/v2/analytics.ts`
- Test: `src/v2/analytics.test.ts`

- [ ] **Step 1: Write the failing test**

Create `src/v2/analytics.test.ts`:

```ts
import { describe, it, expect, vi, beforeEach } from 'vitest'

vi.mock('posthog-js', () => ({
  default: { __loaded: false, capture: vi.fn() },
}))

import posthog from 'posthog-js'
import { track } from './analytics'

const capture = vi.mocked(posthog.capture)

beforeEach(() => {
  posthog.__loaded = false
  capture.mockReset()
})

describe('track', () => {
  it('does nothing when PostHog is not initialized', () => {
    track('v2_unit_started', { unit_id: 'hjkl' })
    expect(capture).not.toHaveBeenCalled()
  })

  it('captures the event with its properties when PostHog is loaded', () => {
    posthog.__loaded = true
    track('v2_unit_completed', { unit_id: 'wbe', keystrokes: 12, par: 9, stars: 2 })
    expect(capture).toHaveBeenCalledWith('v2_unit_completed', {
      unit_id: 'wbe',
      keystrokes: 12,
      par: 9,
      stars: 2,
    })
  })

  it('captures a property-less event with undefined props', () => {
    posthog.__loaded = true
    track('v2_onboarding_started')
    expect(capture).toHaveBeenCalledWith('v2_onboarding_started', undefined)
  })

  it('never throws, even if capture does', () => {
    posthog.__loaded = true
    capture.mockImplementation(() => {
      throw new Error('boom')
    })
    expect(() => track('v2_graduated', { units_total: 7 })).not.toThrow()
  })
})
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npx vitest run src/v2/analytics.test.ts`
Expected: FAIL — cannot resolve `./analytics`.

- [ ] **Step 3: Write the implementation**

Create `src/v2/analytics.ts`:

```ts
import posthog from 'posthog-js'

/**
 * V2 funnel events — the minimal set from the analytics design spec
 * (docs/superpowers/specs/2026-06-10-v2-analytics-design.md).
 * `undefined` marks events that carry no properties.
 */
export interface AnalyticsEvents {
  v2_onboarding_started: undefined
  v2_onboarding_completed: { placement_unit: string; skipped: boolean }
  v2_unit_started: { unit_id: string }
  v2_unit_completed: { unit_id: string; keystrokes: number; par: number; stars: number }
  v2_graduated: { units_total: number }
  v2_daily_started: { puzzle_id: string }
  v2_daily_solved: { puzzle_id: string; keystrokes: number; par: number; stars: number }
}

/**
 * Capture a funnel event. Safe everywhere: no-ops when PostHog was never
 * initialized (no VITE_PUBLIC_POSTHOG_KEY configured) and swallows capture
 * errors — analytics must never break gameplay.
 */
export function track<K extends keyof AnalyticsEvents>(
  event: K,
  ...props: AnalyticsEvents[K] extends undefined ? [] : [AnalyticsEvents[K]]
): void {
  try {
    if (!posthog.__loaded) return
    posthog.capture(event, props[0])
  } catch {
    /* analytics must never break gameplay */
  }
}
```

Notes for the implementer:
- `posthog.__loaded` is a public boolean on the PostHog class — it flips to true after `init()`. `PostHogProvider` in `src/main.tsx` calls init only when the env key exists, so this guard makes `track()` a no-op in dev/test.
- The variadic-tuple signature makes props **required and typed** for events that declare them, and **forbidden** for `v2_onboarding_started`. Misspelled event names fail to compile.

- [ ] **Step 4: Run test to verify it passes**

Run: `npx vitest run src/v2/analytics.test.ts`
Expected: 4 tests PASS.

- [ ] **Step 5: Commit**

```bash
git add src/v2/analytics.ts src/v2/analytics.test.ts
git commit -m "feat(v2): typed analytics track() over posthog singleton"
```

---

### Task 2: `justGraduated()` predicate in progress.ts

**Files:**
- Modify: `src/v2/state/progress.ts` (append after `touchStreak`, ~line 168)
- Test: `src/v2/state/progress.test.ts` (append at end)

- [ ] **Step 1: Write the failing tests**

In `src/v2/state/progress.test.ts`, add `justGraduated` to the existing import from `./progress`, add `import type { Progress } from './types'`, and append:

```ts
describe('justGraduated', () => {
  const ids = ['hjkl', 'wbe']
  const done = { aStatus: 'completed', bStatus: 'completed' } as const

  it('is true on the not-graduated → graduated transition', () => {
    const before: Progress = {
      units: { hjkl: done, wbe: { aStatus: 'completed', bStatus: 'ready' } },
    }
    const after: Progress = { units: { hjkl: done, wbe: done } }
    expect(justGraduated(before, after, ids)).toBe(true)
  })

  it('is false when the player was already graduated (e.g. replay)', () => {
    const grad: Progress = { units: { hjkl: done, wbe: done } }
    expect(justGraduated(grad, grad, ids)).toBe(false)
  })

  it('is false when an earlier unit completes but others remain', () => {
    const before: Progress = {
      units: {
        hjkl: { aStatus: 'completed', bStatus: 'ready' },
        wbe: { aStatus: 'locked', bStatus: 'locked' },
      },
    }
    const after: Progress = {
      units: { hjkl: done, wbe: { aStatus: 'ready', bStatus: 'locked' } },
    }
    expect(justGraduated(before, after, ids)).toBe(false)
  })

  it('is false for an empty curriculum', () => {
    expect(justGraduated({ units: {} }, { units: {} }, [])).toBe(false)
  })
})
```

- [ ] **Step 2: Run tests to verify they fail**

Run: `npx vitest run src/v2/state/progress.test.ts`
Expected: FAIL — `justGraduated` is not exported.

- [ ] **Step 3: Write the implementation**

Append to `src/v2/state/progress.ts`:

```ts
/**
 * True only on the transition where `after` has every unit's B-check completed
 * but `before` does not — i.e. the exact moment the player graduates. Used to
 * fire the v2_graduated analytics event exactly once without extra storage.
 */
export function justGraduated(before: Progress, after: Progress, unitIds: string[]): boolean {
  if (unitIds.length === 0) return false
  const allDone = (p: Progress) =>
    unitIds.every((id) => getUnitProgress(p, id).bStatus === 'completed')
  return allDone(after) && !allDone(before)
}
```

- [ ] **Step 4: Run tests to verify they pass**

Run: `npx vitest run src/v2/state/progress.test.ts`
Expected: all PASS (existing tests plus 4 new).

- [ ] **Step 5: Commit**

```bash
git add src/v2/state/progress.ts src/v2/state/progress.test.ts
git commit -m "feat(v2): justGraduated predicate for one-shot graduation event"
```

---

### Task 3: Onboarding events in LearnWing

**Files:**
- Modify: `src/v2/wings/learn/LearnWing.tsx` (lines 1–8 imports; `enterMap` ~line 36; `finishOnboarding`/`onSkip` ~lines 52–68)

No new unit tests (per spec: component call sites are one-liners; logic is covered by Task 1/2 tests). Verify by running the full suite after editing.

- [ ] **Step 1: Add the import**

In `src/v2/wings/learn/LearnWing.tsx`, after the existing imports (line 8):

```ts
import { track } from '../../analytics'
```

- [ ] **Step 2: Fire `v2_onboarding_started`**

In `enterMap`, replace:

```ts
      // First-timers get placement before the map.
      if (!localStorage.getItem(ONBOARDED_KEY)) setOnboarding(true)
```

with:

```ts
      // First-timers get placement before the map.
      if (!localStorage.getItem(ONBOARDED_KEY)) {
        setOnboarding(true)
        track('v2_onboarding_started')
      }
```

- [ ] **Step 3: Fire `v2_onboarding_completed` on finish and on skip**

In `finishOnboarding`, add the track call before `navigate`:

```ts
    const finishOnboarding = (unitId: string) => {
      localStorage.setItem(ONBOARDED_KEY, '1')
      const idx = UNIT_IDS.indexOf(unitId)
      const next = unlockUpTo(loadProgress(UNIT_IDS), UNIT_IDS, idx)
      saveProgress(next)
      setProgress(next)
      setOnboarding(false)
      track('v2_onboarding_completed', { placement_unit: unitId, skipped: false })
      navigate(`/learn/${unitId}`)
    }
```

And in the `<Onboarding>` JSX, replace the `onSkip` prop:

```ts
        onSkip={() => {
          localStorage.setItem(ONBOARDED_KEY, '1')
          track('v2_onboarding_completed', { placement_unit: UNIT_IDS[0], skipped: true })
          setOnboarding(false)
        }}
```

(Skipping drops the player at the first unit, so `placement_unit` is `UNIT_IDS[0]` per the spec.)

- [ ] **Step 4: Verify suite and types**

Run: `npm run test:run && npx tsc --noEmit`
Expected: 260 tests pass (252 baseline + 8 from Tasks 1–2), 1 skip; tsc silent.

- [ ] **Step 5: Commit**

```bash
git add src/v2/wings/learn/LearnWing.tsx
git commit -m "feat(v2): onboarding funnel events"
```

---

### Task 4: Unit events in UnitRunner

**Files:**
- Modify: `src/v2/wings/learn/UnitRunner.tsx` (imports ~lines 14–21; new effect after state declarations ~line 57; `handleBComplete` ~lines 71–108)

- [ ] **Step 1: Add imports**

In `src/v2/wings/learn/UnitRunner.tsx`, extend the existing `../../state/progress` import with `justGraduated`:

```ts
import {
  loadProgress,
  saveProgress,
  markStageCompleted,
  recordUnitResult,
  touchStreak,
  getUnitProgress,
  justGraduated,
} from '../../state/progress'
import { track } from '../../analytics'
```

- [ ] **Step 2: Fire `v2_unit_started` on mount per unit**

Add after the telemetry-reset effect (the `useEffect` ending `}, [active, replayKey])`, ~line 57):

```ts
  // Funnel: mounting a not-yet-completed unit counts as a start. In-session
  // replays don't re-fire (deps don't change), and revisiting a finished
  // unit's completion screen isn't a start.
  useEffect(() => {
    if (!unit) return
    const up = getUnitProgress(loadProgress(UNIT_IDS), unit.id)
    if (up.bStatus !== 'completed') track('v2_unit_started', { unit_id: unit.id })
  }, [unit])
```

(`unit` comes from `findUnit(unitId)`, which returns the same object from the module-level registry array, so the dep is referentially stable per unit id. The fresh `loadProgress` read avoids putting the `progress` state in the deps, which would re-fire on every save.)

- [ ] **Step 3: Fire `v2_unit_completed` and `v2_graduated` in handleBComplete**

In `handleBComplete`, in the non-replay path, after `next = touchStreak(next, todayISO())` and before the `const before = playerLevel(progress)` line, add:

```ts
      track('v2_unit_completed', {
        unit_id: unit.id,
        keystrokes: levelResult?.keystrokes ?? 0,
        par: levelResult?.par ?? 0,
        stars: levelResult?.stars ?? 0,
      })
      if (justGraduated(progress, next, UNIT_IDS)) {
        track('v2_graduated', { units_total: UNIT_IDS.length })
      }
```

The replay path returns early above this point (`if (replayMode) { setActive('done'); return }`), so replays fire neither event — matching the spec.

- [ ] **Step 4: Verify suite and types**

Run: `npm run test:run && npx tsc --noEmit`
Expected: 260 pass, 1 skip; tsc silent.

- [ ] **Step 5: Commit**

```bash
git add src/v2/wings/learn/UnitRunner.tsx
git commit -m "feat(v2): unit started/completed/graduated funnel events"
```

---

### Task 5: Daily puzzle events in PracticeWing

**Files:**
- Modify: `src/v2/wings/practice/PracticeWing.tsx` (imports line 1; new effect after state declarations ~line 38; `handleComplete` ~lines 40–46)

- [ ] **Step 1: Add imports**

Change line 1 to include `useEffect`, and add the track import after the existing imports:

```ts
import { useEffect, useMemo, useState } from 'react'
```

```ts
import { track } from '../../analytics'
```

- [ ] **Step 2: Fire `v2_daily_started` when today's unsolved puzzle is shown**

Add after the `const [copied, setCopied] = useState(false)` line:

```ts
  // Funnel: showing today's unsolved puzzle counts as a start. Mount-only so
  // post-solve replays don't re-fire.
  useEffect(() => {
    if (!store.results[todayISO]) track('v2_daily_started', { puzzle_id: todayISO })
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])
```

- [ ] **Step 3: Fire `v2_daily_solved` on the first solve of the day**

Replace `handleComplete`:

```ts
  function handleComplete(r?: StageResult) {
    if (r) {
      const stars = starsForKeystrokes(r.keystrokes, r.par)
      // Only the first solve of the day is a funnel event — replays to beat
      // your own keystrokes aren't new solves.
      if (!store.results[todayISO]) {
        track('v2_daily_solved', { puzzle_id: todayISO, keystrokes: r.keystrokes, par: r.par, stars })
      }
      setStore(recordDaily(todayISO, r.keystrokes, r.par, stars))
    }
    setPhase('done')
  }
```

- [ ] **Step 4: Verify suite and types**

Run: `npm run test:run && npx tsc --noEmit`
Expected: 260 pass, 1 skip; tsc silent.

- [ ] **Step 5: Commit**

```bash
git add src/v2/wings/practice/PracticeWing.tsx
git commit -m "feat(v2): daily puzzle funnel events"
```

---

### Task 6: Full verification + status doc update

**Files:**
- Modify: `docs/superpowers/NEXT-SESSION.md`

- [ ] **Step 1: Run the full verification battery**

```bash
npm run test:run     # expect 260 pass, 1 skip
npx tsc --noEmit     # expect no output
npm run lint         # expect no NEW errors (pre-existing classic-code errors are known)
npm run build        # expect success (bundle-size warning from classic app is known)
```

If lint reports errors in any file touched by this plan, fix them before proceeding.

- [ ] **Step 2: Update NEXT-SESSION.md**

In `docs/superpowers/NEXT-SESSION.md`:

1. Change `**Last updated:** 2026-05-19` to `**Last updated:** 2026-06-10`.
2. Change `**Active branch:** \`feat/v2-foundation-plan-1\`` to `**Active branch:** \`rebuild\` — all V2 work consolidated here (see merge \`b0a8d52\`).`
3. In the "Future plan slots" table, mark plans 5–9:

```markdown
| 5 | Text objects (unit 7) | ✅ done (`04f38ad`) |
| 6 | Practice wing — daily puzzle (Quiet Wordle v1) | ✅ done (`18a91f6`) |
| 7 | Apply wing — 5 capstone missions | ✅ done (`28d1ac0`) |
| 8 | Onboarding (demo + placement + drop) | ✅ done (`cdaf546`) |
| 9 | Analytics instrumentation | ✅ done — minimal funnel (spec: `2026-06-10-v2-analytics-design.md`) |
```

4. At the end of the "What's done" section, add:

```markdown
### Plans 5–9 + facelift (merged into `rebuild`, 2026-05/06)

Implemented after this doc's last full update: Text Objects unit, Practice
daily challenge, Apply capstones, onboarding (demo + placement), boss level,
Motion Dex, XP/badges/streak progression, phosphor CRT facelift, the progress
migration fix (`0e0ecbc`, closing the pre-launch must-fix), and V2 analytics
(minimal funnel — 7 typed `v2_*` events via `src/v2/analytics.ts`; spec at
`docs/superpowers/specs/2026-06-10-v2-analytics-design.md`).
```

- [ ] **Step 3: Commit**

```bash
git add docs/superpowers/NEXT-SESSION.md
git commit -m "docs: mark Plans 5-9 done in NEXT-SESSION"
```

- [ ] **Step 4 (optional, needs a real key): Manual smoke test**

If a `VITE_PUBLIC_POSTHOG_KEY` is available in `.env.local`: `npm run dev`, open a private window, clear localStorage for the origin, walk hero → onboarding → complete hjkl A+B → open `/practice` and solve the daily. With PostHog `debug: true` (already on in dev), each event logs to the console: expect `v2_onboarding_started`, `v2_onboarding_completed`, `v2_unit_started`, `v2_unit_completed`, `v2_daily_started`, `v2_daily_solved`. Without a key, skip — the no-key path is covered by unit tests.

---

## Spec coverage checklist

- §Architecture: typed module over singleton, no-op guard, pure state modules → Task 1 (module), Tasks 3–5 (call sites only in components)
- §Event set, all 7 rows → Tasks 3 (onboarding ×2), 4 (unit ×3), 5 (daily ×2)
- §Replay semantics → Task 4 Step 2 (started: dep-stable effect + completed-unit guard), Step 3 (replay early-return), Task 5 Step 3 (first-solve guard)
- §Error handling → Task 1 try/catch + test
- §Testing: analytics unit tests (Task 1), `justGraduated` pure tests (Task 2), baseline stays green (every task's verify step)
- §Success criteria → Task 6 Step 4 manual walk
