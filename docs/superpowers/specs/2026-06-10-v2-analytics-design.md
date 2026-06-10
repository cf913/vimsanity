# V2 Analytics — Minimal Funnel Instrumentation (Plan 9 scope)

**Date:** 2026-06-10
**Status:** Approved design, pending implementation plan
**Supersedes:** §11 of `2026-05-18-game-redesign-design.md` for v1 launch scope. The full §11 event set remains the post-launch target; this spec ships the minimal funnel first.

## Goal

Answer the core retention questions with the fewest events that can do it:

1. Do visitors finish onboarding?
2. Which Learn units do users start but not finish? Where does the curriculum lose them?
3. What % of users graduate (complete all 7 units)?
4. Do graduates come back for the daily puzzle on day 2 / 7 / 30? (the design doc's core retention hypothesis)

Drop-off is **inferred from the absence of the next funnel event** — no abandon/unload events in this scope.

## Architecture

One new module: **`src/v2/analytics.ts`**.

- Exports `track(event, props)` typed over a discriminated union of the event names and their property shapes below. Misspelled event names or wrong properties fail at compile time.
- Calls the global `posthog` singleton (`import posthog from 'posthog-js'`). The existing `PostHogProvider` in `src/main.tsx` initializes that singleton when `VITE_PUBLIC_POSTHOG_KEY` is set; `track()` no-ops when PostHog is uninitialized (guard on `posthog.__loaded`), so dev builds without a key stay silent — same behavior as today.
- No React coupling: callable from components and plain functions alike.
- The v2 state modules (`progress.ts`, `daily.ts`) stay pure — **no captures inside state functions**. All captures happen at component-level call sites.

Identity: PostHog's default anonymous `distinct_id` (device-scoped), same as classic. No identify calls.

## Event set

All names prefixed `v2_` to separate from classic events in the shared PostHog project.

| Event | Properties | Fired from |
|---|---|---|
| `v2_onboarding_started` | — | `LearnWing.tsx`, when the onboarding screen is shown |
| `v2_onboarding_completed` | `placement_unit: string`, `skipped: boolean` | `LearnWing.tsx` `onFinish` (placement unit chosen) and `onSkip` (`skipped: true`, `placement_unit: 'hjkl'`) |
| `v2_unit_started` | `unit_id: string` | `UnitRunner.tsx`, on mount per unit (not on replay) |
| `v2_unit_completed` | `unit_id: string`, `keystrokes: number`, `par: number`, `stars: number` | `UnitRunner.tsx` `handleBComplete`, non-replay path |
| `v2_graduated` | `units_total: number` | `UnitRunner.tsx` `handleBComplete`: fires when `next` progress has all units' B-stage completed but the prior `progress` did not (transition-edge dedupe — fires exactly once, no extra storage) |
| `v2_daily_started` | `puzzle_id: string` (date ISO) | `PracticeWing.tsx`, when today's unsolved puzzle is first shown |
| `v2_daily_solved` | `puzzle_id: string`, `keystrokes: number`, `par: number`, `stars: number` | `PracticeWing.tsx`, at the existing `recordDaily` call site |

Seven events, four files touched (one new, three edited).

### Explicitly out of scope (deferred to a later plan)

Abandon events, placement per-question answers, streak events, capstone/boss/dex/XP/badge events, share clicks, `classic_clicked`, dashboard creation in PostHog (manual, post-launch), consent banner (unchanged from classic's current stance).

## Replay and revisit semantics

- Replay mode (`replayMode === true`) fires **nothing** — replays would inflate unit completion counts.
- Revisiting a completed unit's `done` screen fires nothing (no stage completion occurs).
- `v2_unit_started` fires once per `UnitRunner` mount of a given unit; repeat visits to an unfinished unit each count as a start (that's the signal for "started but not finished").

## Error handling

`track()` wraps the capture in a try/catch; analytics must never break gameplay. PostHog absent → silent no-op.

## Testing

- Unit tests for `analytics.ts`: no-op when posthog uninitialized; capture called with the right name/props when loaded (mock `posthog-js`).
- Graduation edge: extract the predicate as a pure function `justGraduated(before: Progress, after: Progress, unitIds: string[]): boolean` in `progress.ts` and unit-test it directly (true only on the not-graduated → graduated transition). `UnitRunner` calls it; no component-level analytics test needed.
- Existing tests must stay green (252 pass, 1 skip baseline).

## Success criteria

With a PostHog key configured, a fresh user walking onboarding → hjkl → … → textObjects → daily puzzle produces exactly: 1 `v2_onboarding_started`, 1 `v2_onboarding_completed`, 7+ `v2_unit_started`, 7 `v2_unit_completed`, 1 `v2_graduated`, 1 `v2_daily_started`, 1 `v2_daily_solved`. Funnel and D2/D7/D30 retention charts are then buildable in PostHog with no further code.
