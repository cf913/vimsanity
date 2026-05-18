# VimSanity Redesign — Status & Next Session

**Last updated:** 2026-05-19

This file is the at-a-glance snapshot for resuming work on the VimSanity redesign. Read it first when starting a new session.

---

## TL;DR

We're rebuilding VimSanity around a **Three Wings** game model (Learn / Practice / Apply) with an **A→B→C** pedagogical loop. Code-named the rebuild lives under `src/v2/`. The classic app stays untouched at `/classic`.

Plans 1 and 2 are implemented, merged, playtested, and patched. Working software today: a full Learn wing with three units (`hjkl`, `wbe`, `lineEdges`), each running through a drill stage + a fluency-check stage with par-based scoring, and a Replay button on the unit completion screen.

Plans 3-6 are not yet written.

---

## Where the code lives

**Active branch:** `feat/v2-foundation-plan-1` — contains Plans 1 + 2 + post-playtest fixes.

| Branch | Purpose | Status |
|---|---|---|
| `main` | Docs (specs + plans) only | Plan 1, Plan 2, this file |
| `feat/v2-foundation-plan-1` | All implementation | Live, ahead of main by many commits |
| `feat/v2-text-engine-plan-2` | (deleted) | Merged into `feat/v2-foundation-plan-1` via `5500abb` |

The user's stated long-term plan: collapse `feat/v2-foundation-plan-1` into a `rebuild` branch alongside future plans.

---

## What's done

### Plan 1: Foundation + First Learn Unit (merged)
- vitest + @testing-library + jsdom test infrastructure
- react-router-dom routing with `/classic` fallback
- V2 motion engine: `GridState`, `motions.ts` (h/j/k/l), `grader.ts` (cursor-at-target + manhattan par)
- localStorage Progress store (`vimsanity-v2-progress`) with strict linear unlock
- Three Wings shell (`Shell` + `WingsNav`), `LearnWing`, `UnitRunner`, `UnitSidebar`
- A-drill and B-check stage components (grid variants)
- Practice and Apply wings as "coming soon" stubs
- One full Learn unit: **hjkl** (10×6 grid, 20 targets, 3 navigation puzzles)

Post-final-review fixes during Plan 1: ADrillStage setState/closure refactor, LearnWing infinite-loop fix (hoisted `UNIT_IDS`), eslint config for `_`-prefixed unused params, jest→vitest migration on classic test files.

### Plan 2: Text Engine + Word/Line Nav Units (merged)
- Text engine: `TextState`, `text-utils.ts` (word boundaries + line edges), `text-motions.ts` (w/b/e/0/$/^), `text-grader.ts`
- Discriminated `AStageDef` / `BStageDef` unions: grid vs text variants
- `ADrillStageText` and `BCheckStageText` components
- `UnitRunner` dispatches by stage `kind`
- Two new units: **wbe** (Word Motions) and **lineEdges** (Line Edges)

Post-final-review fix during Plan 2: `pickTargetRange` excludes initial cursor position.

### Post-merge playtesting fixes (2026-05-19, on `feat/v2-foundation-plan-1`)

User playtested and surfaced two issues, both fixed:

| Commit | Issue | Fix |
|---|---|---|
| `fb927b7` | (engine prerequisite) | Added `j`/`k` text motions + line-movement utilities (`moveToNextLine`, `moveToPrevLine`) |
| `dc3aea2` | lineEdges drill unsolvable — couldn't reach lines 2-4 | Added `j`/`k` to lineEdges `allowedKeys`. Pedagogy decision: previously-learned motions stay available in later units. |
| `dd5e268` | No replay after finishing a unit | Added ↻ Replay button on completion screen. In-memory `replayMode` flag so localStorage progress is preserved; React `key={replayKey}` forces fresh stage mount. |
| `31061f1` | A-drill could pick unreachable targets when allowed keys span a subset of the text | `computeReachableIndices` BFS from start cursor through `allowedKeys`; filter target candidates to ranges containing at least one reachable index. Graceful fallback + warning if no reachable words. |

**Verification at commit time:** 76 tests pass, 1 documented skip, tsc clean, build clean, 0 V2 lint errors.

---

## Documents

| Path | What it is |
|---|---|
| `docs/superpowers/specs/2026-05-18-game-redesign-design.md` | The approved design doc. Locked decisions on persona, game model, app structure, daily puzzle, scenarios, onboarding, migration, analytics. **Read this first to understand the why.** |
| `docs/superpowers/plans/2026-05-18-foundation-and-first-unit.md` | Plan 1 — implemented |
| `docs/superpowers/plans/2026-05-18-text-engine-and-nav-units.md` | Plan 2 — implemented |
| `docs/superpowers/NEXT-SESSION.md` | This file |

---

## What's known to work end-to-end

Start with `npm run dev`, clear localStorage, walk:

1. `/` → redirects to `/learn/hjkl`
2. **hjkl unit** — grid drill (20 targets) → B-check (3 cursor puzzles with par) → ✓ unit complete
3. Replay button works (fresh state, header chip, progress preserved)
4. **wbe unit** — text drill (12 targets on a single-line sentence) → 3 par-3 puzzles → ✓
5. **lineEdges unit** — multi-line drill with `j`/`k` allowed → 3 par-1 puzzles → ✓
6. `/practice` and `/apply` — stub screens
7. `/classic` — original app untouched

---

## Known issues and open follow-ups

**Carried forward (deferred to later):**
- **Pre-production progress migration gap** (final reviewer's Minor #3): if a user completes hjkl in a build without `wbe`/`lineEdges`, then upgrades, their stored progress has the new units `LOCKED` forever. Fix before shipping to real users: have `loadProgress` unlock the next unit if its predecessor is fully completed.
- **`useHistory` redo bug** in classic code (1 test `.skip` with TODO). Out of scope for V2; only matters if classic stays around.
- **Pre-existing classic-code lint errors** (5, in 3 level files). Out of scope until classic retires.
- **Bundle size warning** at build (classic app is large). Will go away when classic does.

**Not yet addressed:**
- No B-check par computation tool — par values are hand-set by unit authors. Worth a small CLI when authoring picks up.
- No analytics events fire yet — deferred to Plan 6.

---

## What's next

### Immediate decisions for the next session

The user is iterating between plan execution and playtesting. Two viable paths:

**Path A — Continue the curriculum (Plan 3):** Insert mode + change/delete family (units 4 and 5). Introduces *mutation* engine (state has text edits, not just cursor moves), mode tracking (NORMAL vs INSERT), and operator+motion composition (`dw`, `cw`, etc.). This is the biggest engine extension yet.

**Path B — Validate the retention loop sooner (jump to Plan 4):** Build the Practice wing's daily puzzle (Quiet Wordle v1) using the existing text engine's B-check infrastructure as the puzzle engine. Cheapest path to "users come back tomorrow." Less content per session, but tests the core retention hypothesis from the design doc.

**Recommendation when resuming:** ask the user which path. Path A is the natural sequential continuation. Path B is the higher-information move if user-feedback signal matters more than content volume right now.

### Future plan slots (per design doc §13)

| # | Plan | Status |
|---|---|---|
| 1 | Foundation + First Learn unit | ✅ done |
| 2 | Text engine + word/line nav (units 2, 3) | ✅ done |
| 3 | Insert modes + change/delete (units 4, 5) | not started |
| 4 | Practice wing — daily puzzle (Quiet Wordle v1) | not started |
| 5 | Apply wing — 5 capstone missions | not started |
| 6 | Onboarding (demo + placement + drop) | not started |
| 7 | Analytics instrumentation | not started — could thread into others |

### Pre-launch must-fix before any real ship

1. Progress migration safety (see above)
2. Manual end-to-end walk by the user (the only test I can't automate)
3. A decision on visual brand (deferred entirely from the design doc; the v2 app uses Tailwind defaults right now)

---

## How to resume

```bash
# Check out the working branch
git checkout feat/v2-foundation-plan-1

# Sanity-check the state
npm run test:run    # expect 76 pass, 1 skip
npx tsc --noEmit    # expect no output
npm run dev         # smoke-test in browser

# Read the design first for context
$EDITOR docs/superpowers/specs/2026-05-18-game-redesign-design.md

# When ready to plan next, invoke writing-plans skill
# When ready to execute, invoke subagent-driven-development
```

If the user's feedback reveals a new playtesting issue, fix it on `feat/v2-foundation-plan-1` directly (small commits — see `dc3aea2`, `dd5e268`, `31061f1` as examples of fixup commit style).

If starting a new plan: stack the branch (`feat/v2-<topic>-plan-N` from `feat/v2-foundation-plan-1`), invoke writing-plans, then subagent-driven-development. Save plan docs to `docs/superpowers/plans/YYYY-MM-DD-<topic>.md` on **main** (not the feature branch) to keep the docs tree clean.
