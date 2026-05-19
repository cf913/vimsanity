# VimSanity Redesign — Status & Next Session

**Last updated:** 2026-05-19

This file is the at-a-glance snapshot for resuming work on the VimSanity redesign. Read it first when starting a new session.

---

## TL;DR

We're rebuilding VimSanity around a **Three Wings** game model (Learn / Practice / Apply) with an **A→B→C** pedagogical loop. The rebuild lives under `src/v2/`. The classic app stays untouched at `/classic`.

Plans 1, 2, and 3 are implemented, with playtest fixes from Plans 1+2 already landed. Working software today: a full Learn wing with **five units** — `hjkl`, `wbe`, `lineEdges`, `insertModes`, `changeDelete` — each running through a drill stage + a fluency-check stage with par-based scoring. Replay button on completion. Insert mode + change/delete are live, so users can do real text editing inside the unit drills.

Plans 4-7 are not yet written.

---

## Where the code lives

**Active branch:** `feat/v2-foundation-plan-1` — contains Plans 1 + 2 + 3 + post-playtest fixes.

| Branch | Purpose | Status |
|---|---|---|
| `main` | Docs (specs + plans) only | Plan 1, Plan 2, Plan 3, this file |
| `feat/v2-foundation-plan-1` | All implementation | Live, ahead of main by ~50 commits |
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
- One full Learn unit: **hjkl**

### Plan 2: Text Engine + Word/Line Nav Units (merged)
- Text engine: `TextState`, `text-utils.ts` (word boundaries + line edges), `text-motions.ts` (w/b/e/0/$/^ + j/k), `text-grader.ts`
- Discriminated `AStageDef` / `BStageDef` unions: grid vs text variants
- `ADrillStageText` and `BCheckStageText` components
- `UnitRunner` dispatches by stage `kind`
- Two new units: **wbe** (Word Motions) and **lineEdges** (Line Edges)

### Plan 3: Insert Modes + Change/Delete (merged 2026-05-19)
- **Editable engine** layered on top of the text engine (`src/v2/engine/`):
  - `editable-types.ts` — `EditableState` (text + cursor + mode + pendingOperator + keystrokes), `Mode`, `OperatorKind`
  - `edits.ts` — `deleteRange`, `insertAt` (pure text mutations with clamping)
  - `mode-motions.ts` — `i`/`a`/`o`/`O`/`Esc` transitions
  - `operators.ts` — `x`, `D`, `C`, `dd` (deleteLine), `cc` (clearLine), `applyOperatorWithMotion` with vim's `cw→ce` quirk and inclusive-motion handling for `e` and `$`
  - `editable-engine.ts` — `applyEditableKey` top-level dispatcher with mode + pending-operator state machine; delegates plain motions to the Plan 2 text engine
  - `editable-grader.ts` — `matchesGoal` (text required, cursorIndex + mode optional)
- New stage components: `ADrillStageEdit` (guided edit drill, "You/Goal" panes) and `BCheckStageEdit` (par-graded edit puzzles)
- Two new Learn units: **insertModes** (4 A-drill challenges + 3 B-puzzles, par 4-7) and **changeDelete** (5 A-drill challenges + 3 B-puzzles, par 2-7)
- Post-review fix: added `h`/`l` text motions (`0da37ab`) — they were listed in the new units' `allowedKeys` but missing from `text-motions.ts`.

**Verification at Plan 3 completion:** 141 tests pass, 1 documented skip, tsc clean, build clean, 0 V2 lint errors.

### Post-merge playtesting fixes (still in place from Plans 1+2)

| Commit | Issue | Fix |
|---|---|---|
| `fb927b7` | (engine prerequisite) | Added `j`/`k` text motions + line-movement utilities |
| `dc3aea2` | lineEdges drill unsolvable | Added `j`/`k` to lineEdges `allowedKeys`. Pedagogy: previously-learned motions stay available in later units. |
| `dd5e268` | No replay after finishing a unit | Added ↻ Replay button |
| `31061f1` | A-drill could pick unreachable targets | BFS-based reachability filter on target candidates |
| `0da37ab` | `h`/`l` silently did nothing in unit 4/5 | Added h/l text motions clamped to line boundaries |

---

## Documents

| Path | What it is |
|---|---|
| `docs/superpowers/specs/2026-05-18-game-redesign-design.md` | Approved design doc. **Read this first to understand the why.** |
| `docs/superpowers/plans/2026-05-18-foundation-and-first-unit.md` | Plan 1 — implemented |
| `docs/superpowers/plans/2026-05-18-text-engine-and-nav-units.md` | Plan 2 — implemented |
| `docs/superpowers/plans/2026-05-19-insert-and-edit.md` | Plan 3 — implemented |
| `docs/superpowers/NEXT-SESSION.md` | This file |

---

## What's known to work end-to-end

Start with `npm run dev`, clear localStorage, walk:

1. `/` → redirects to `/learn/hjkl`
2. **hjkl unit** — grid drill (20 targets) → B-check (3 cursor puzzles with par) → ✓
3. **wbe unit** — text drill (12 targets on a single-line sentence) → 3 par-3 puzzles → ✓
4. **lineEdges unit** — multi-line drill with `j`/`k` allowed → 3 par-1 puzzles → ✓
5. **insertModes unit** — 4 A-drill challenges (one per i/a/o/O), then 3 B-puzzles (par 4, 4, 7)
6. **changeDelete unit** — 5 A-drill challenges (x, dw, D, cw, dd), then 3 B-puzzles (par 2, 7, 2)
7. Replay button works on each unit (fresh state, header chip, progress preserved)
8. `/practice` and `/apply` — stub screens
9. `/classic` — original app untouched

**Note:** Plan 3 ships without a hands-on manual browser walk-through by the user yet — that's the next playtest step.

---

## Known issues and open follow-ups

**Carried forward (deferred to later):**
- **Pre-production progress migration gap**: if a user completes hjkl in an older build, then upgrades, their stored progress has the new units `LOCKED` forever. Fix before shipping to real users: have `loadProgress` unlock the next unit if its predecessor is fully completed. (Risk grows now that Plan 3 added two new units.)
- **`useHistory` redo bug** in classic code (1 test `.skip` with TODO). Out of scope for V2.
- **Pre-existing classic-code lint errors** (5, in 3 level files). Out of scope until classic retires.
- **Bundle size warning** at build (classic app is large). Will go away when classic does.

**Plan 3 specific:**
- `renderText` helper is duplicated byte-for-byte between `ADrillStageEdit.tsx` and `BCheckStageEdit.tsx`. YAGNI for now; extract to a shared helper if a third edit-stage variant appears.
- No backspace-across-newline in insert mode (deliberate v1 simplification — Backspace at column 0 is a no-op).
- Modifier-key combos in insert mode (`Ctrl+C` etc.) currently insert the letter. Minor v1 quirk.
- No B-check par computation tool — par values are hand-set by unit authors.

**Not yet addressed:**
- No analytics events fire yet — deferred to Plan 7.

---

## What's next

### Immediate decisions for the next session

Three viable paths:

**Path A — Continue the curriculum (Plan 4 = Yank/Put):** Unit 6 (`y yy yw p P`). Engine extension: registers (start with the unnamed default register only). Smaller engine lift than Plan 3.

**Path B — Text objects (Plan 4' = Unit 7):** `diw daw ciw caw`. Requires motion-as-range generalization (text objects produce ranges, not target cursor positions). Bigger engine lift.

**Path C — Validate the retention loop (Plan 5 = Daily puzzle):** Build the Practice wing's daily puzzle (Quiet Wordle v1) using the now-substantial editable engine as the puzzle solver. Cheapest path to "users come back tomorrow." Less content per session, but tests the retention hypothesis.

**Recommendation when resuming:** ask the user which path. Sequential default is Path A (yank/put → text objects). Path C is the bigger-information move.

### Future plan slots (per design doc §13)

| # | Plan | Status |
|---|---|---|
| 1 | Foundation + First Learn unit | ✅ done |
| 2 | Text engine + word/line nav (units 2, 3) | ✅ done |
| 3 | Insert modes + change/delete (units 4, 5) | ✅ done |
| 4 | Yank/put (unit 6) | not started |
| 5 | Text objects (unit 7) | not started |
| 6 | Practice wing — daily puzzle (Quiet Wordle v1) | not started |
| 7 | Apply wing — 5 capstone missions | not started |
| 8 | Onboarding (demo + placement + drop) | not started |
| 9 | Analytics instrumentation | not started — could thread into others |

(Plans renumbered to reflect the natural split between yank/put and text-objects.)

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
npm run test:run    # expect 141 pass, 1 skip
npx tsc --noEmit    # expect no output
npm run dev         # smoke-test in browser

# Read the design first for context
$EDITOR docs/superpowers/specs/2026-05-18-game-redesign-design.md

# When ready to plan next, invoke writing-plans skill
# When ready to execute, invoke subagent-driven-development
```

If the user's feedback reveals a new playtesting issue, fix it on `feat/v2-foundation-plan-1` directly (small commits — see `dc3aea2`, `dd5e268`, `31061f1`, `0da37ab` as examples of fixup commit style).

If starting a new plan: invoke writing-plans, then subagent-driven-development. Save plan docs to `docs/superpowers/plans/YYYY-MM-DD-<topic>.md` on **main** (not the feature branch) to keep the docs tree clean.
