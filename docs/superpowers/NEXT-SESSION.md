# VimSanity Redesign — Status & Next Session

**Last updated:** 2026-06-11

This file is the at-a-glance snapshot for resuming work on the VimSanity redesign. Read it first when starting a new session.

---

## TL;DR

We're rebuilding VimSanity around a **Three Wings** game model (Learn / Practice / Apply) with an **A→B→C** pedagogical loop. The rebuild lives under `src/v2/`. The classic app stays untouched at `/classic`.

Plans 1, 2, 3, and 4 are implemented. Working software today: a full Learn wing with **six units** — `hjkl`, `wbe`, `lineEdges`, `insertModes`, `changeDelete`, `yankPut` — each running through a drill stage + a fluency-check stage with par-based scoring. Replay button on completion. Insert mode, change/delete, and now yank/put are live — users can do real text editing including register-based paste flows (including the `dd`+`p` "paste deleted line back" and `xp` swap idioms).

Plans 5-9 are not yet written.

---

## Where the code lives

**Active branch:** `rebuild` — all V2 work consolidated here (see merge `b0a8d52`).

| Branch | Purpose | Status |
|---|---|---|
| `main` | Docs (specs + plans) only | Plan 1, Plan 2, Plan 3, Plan 4, this file |
| `feat/v2-foundation-plan-1` | All implementation | Live, ~60 commits ahead of main |
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
- Text engine: `TextState`, `text-utils.ts`, `text-motions.ts` (w/b/e/0/$/^ + j/k + h/l), `text-grader.ts`
- Discriminated `AStageDef` / `BStageDef` unions: grid vs text variants
- `ADrillStageText` and `BCheckStageText` components
- `UnitRunner` dispatches by stage `kind`
- Two new units: **wbe** (Word Motions) and **lineEdges** (Line Edges)

### Plan 3: Insert Modes + Change/Delete (merged)
- **Editable engine**: `editable-types.ts`, `edits.ts`, `mode-motions.ts`, `operators.ts`, `editable-engine.ts`, `editable-grader.ts`
- Mode tracking (normal/insert), pending-operator state machine, operator+motion composition with vim's `cw→ce` quirk and inclusive motions (`e`, `$`)
- New stage components: `ADrillStageEdit` and `BCheckStageEdit`
- Two new units: **insertModes** (`i a o O Esc`) and **changeDelete** (`x dw dd D cw C`)
- Post-review fix: added `h`/`l` text motions (`0da37ab`)

### Plan 4: Yank & Put (merged 2026-05-19)
- **Register concept** added to `EditableState`: `register: Register | null` where `Register = { text, linewise }`
- `OperatorKind` extended to `'d' | 'c' | 'y'`
- Every destructive operator (x, D, C, dd, cc, d+motion, c+motion) populates the register before mutating — matches vim unnamed-register semantics. Enables `dd`+`p` (paste deleted line back) and the `x`+`p` swap idiom.
- New: `yankCurrentLine` (yy linewise), `applyOperatorWithMotion` handles `op='y'` (no delete), `putAfter` (p), `putBefore` (P) in new `put.ts`. `yw` keeps trailing whitespace (no `ce` quirk for yank).
- Dispatcher: `y` sets pendingOperator, `yy` → yankCurrentLine, `y+motion` → yank range, `p`/`P` → put. Empty register `p` is silent no-op (still counts as a keystroke).
- One new unit: **yankPut** (`yy yw p P`) — 4 A-drill challenges + 3 B-puzzles (all par 3)
- Uses the existing `ADrillStageEdit`/`BCheckStageEdit` components — no new UI components needed.

**Verification at Plan 4 completion:** 164 tests pass, 1 documented skip, tsc clean, build clean, 0 V2 lint errors.

### Post-merge playtesting fixes (still in place)

| Commit | Issue | Fix |
|---|---|---|
| `fb927b7` | (engine prerequisite) | Added `j`/`k` text motions + line-movement utilities |
| `dc3aea2` | lineEdges drill unsolvable | Added `j`/`k` to lineEdges `allowedKeys`. Pedagogy: previously-learned motions stay available. |
| `dd5e268` | No replay after finishing a unit | Added ↻ Replay button |
| `31061f1` | A-drill could pick unreachable targets | BFS-based reachability filter on target candidates |
| `0da37ab` | `h`/`l` silently did nothing in unit 4/5 | Added h/l text motions clamped to line boundaries |

### Plans 5–9 + facelift (merged into `rebuild`, 2026-05/06)

Implemented after this doc's last full update: Text Objects unit, Practice
daily challenge, Apply capstones, onboarding (demo + placement), boss level,
Motion Dex, XP/badges/streak progression, phosphor CRT facelift, the progress
migration fix (`0e0ecbc`, closing the pre-launch must-fix), and V2 analytics
(minimal funnel — 7 typed `v2_*` events via `src/v2/analytics.ts`, eager
PostHog init in `src/main.tsx`; spec at
`docs/superpowers/specs/2026-06-10-v2-analytics-design.md`).

---

## Documents

| Path | What it is |
|---|---|
| `docs/superpowers/specs/2026-05-18-game-redesign-design.md` | Approved design doc. **Read this first to understand the why.** |
| `docs/superpowers/plans/2026-05-18-foundation-and-first-unit.md` | Plan 1 — implemented |
| `docs/superpowers/plans/2026-05-18-text-engine-and-nav-units.md` | Plan 2 — implemented |
| `docs/superpowers/plans/2026-05-19-insert-and-edit.md` | Plan 3 — implemented |
| `docs/superpowers/plans/2026-05-19-yank-and-put.md` | Plan 4 — implemented |
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
7. **yankPut unit** — 4 A-drill challenges (yy+p, yy+P, yw+P, yy+j+p), then 3 B-puzzles (all par 3)
8. Replay button works on each unit (fresh state, header chip, progress preserved)
9. `/practice` and `/apply` — stub screens
10. `/classic` — original app untouched

**Note:** Plans 3 and 4 ship without a hands-on manual browser walk-through by the user yet — that's the next playtest step.

---

## Known issues and open follow-ups

**Carried forward (deferred to later):**
- **Pre-production progress migration gap**: if a user completes hjkl in an older build, then upgrades, their stored progress has the new units `LOCKED` forever. Fix before shipping to real users. Risk grows with each new unit added.
- **`useHistory` redo bug** in classic code (1 test `.skip`). Out of scope for V2.
- **Pre-existing classic-code lint errors** (5, in 3 level files). Out of scope until classic retires.
- **Bundle size warning** at build (classic app is large). Will go away when classic does.

**Plan 3 specific (carried forward):**
- `renderText` helper is duplicated byte-for-byte between `ADrillStageEdit.tsx` and `BCheckStageEdit.tsx`. YAGNI for now.
- No backspace-across-newline in insert mode (deliberate v1 simplification).
- Modifier-key combos in insert mode (`Ctrl+C` etc.) currently insert the letter. Minor v1 quirk.

**Plan 4 specific:**
- `p` with an empty register is a silent no-op but still counts as a keystroke. Curated puzzles avoid this; users who hit `p` before yanking will see counter tick up. Acceptable for v1.
- Register isn't visualized anywhere in the UI. Users only learn what's in the register by trying `p`/`P`. Acceptable for v1.

**Not yet addressed:**
- No B-check par computation tool — par values are hand-set by unit authors.
- No analytics events fire yet — deferred to Plan 9.

---

## What's next

### Plan options for the next session

Three viable paths:

**Path A — Plan 5: Text objects (unit 7):** `diw daw ciw caw` (and `yiw`, `yaw` for free if registers carry forward). Requires motion-as-range generalization — text objects produce ranges directly, not target cursor positions. This is the biggest remaining curriculum engine extension. Caps off the Learn curriculum at 7 units.

**Path B — Plan 6: Practice wing daily puzzle (Quiet Wordle v1):** Build the always-fresh daily puzzle using the now-substantial editable engine as the puzzle solver. Tests the core retention hypothesis from the design doc. Less curriculum content per session but high-information move.

**Path C — Plan 7: Apply wing capstones:** 5 hand-crafted scenarios that compose the units we've shipped. Same engine as the daily puzzle. Gives users a "graduate" goal.

**Recommendation when resuming:** Path A is the natural sequential continuation; it closes out the Learn curriculum. Path B is the higher-information move on retention. Path C requires the same engine as B so might come together. Ask the user.

### Future plan slots

| # | Plan | Status |
|---|---|---|
| 1 | Foundation + First Learn unit | ✅ done |
| 2 | Text engine + word/line nav (units 2, 3) | ✅ done |
| 3 | Insert modes + change/delete (units 4, 5) | ✅ done |
| 4 | Yank/put (unit 6) | ✅ done |
| 5 | Text objects (unit 7) | ✅ done (`04f38ad`) |
| 6 | Practice wing — daily puzzle (Quiet Wordle v1) | ✅ done (`18a91f6`) |
| 7 | Apply wing — 5 capstone missions | ✅ done (`28d1ac0`) |
| 8 | Onboarding (demo + placement + drop) | ✅ done (`cdaf546`) |
| 9 | Analytics instrumentation | ✅ done — minimal funnel (spec: `2026-06-10-v2-analytics-design.md`) |

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
npm run test:run    # expect 164 pass, 1 skip
npx tsc --noEmit    # expect no output
npm run dev         # smoke-test in browser

# Read the design first for context
$EDITOR docs/superpowers/specs/2026-05-18-game-redesign-design.md

# When ready to plan next, invoke writing-plans skill
# When ready to execute, invoke subagent-driven-development
```

If the user's feedback reveals a new playtesting issue, fix it on `feat/v2-foundation-plan-1` directly (small commits — see `dc3aea2`, `dd5e268`, `31061f1`, `0da37ab` as examples of fixup commit style).

If starting a new plan: invoke writing-plans, then subagent-driven-development. Save plan docs to `docs/superpowers/plans/YYYY-MM-DD-<topic>.md` on **main** (not the feature branch) to keep the docs tree clean.
