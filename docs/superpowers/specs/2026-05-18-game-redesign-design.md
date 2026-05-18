# VimSanity Game Redesign — Design Document

**Date:** 2026-05-18
**Status:** Design — awaiting implementation plan
**Scope:** Game model, learning structure, retention loops, analytics. **Architecture (code-level) and visual brand are explicitly out of scope for this spec** — those decisions follow from the game model and will be specified separately.

---

## 1. Problem and motivation

VimSanity teaches vim motions through 18 hand-built browser levels (0-18, no 8). An audit before this redesign found two converging problems:

1. **The game model has run its course.** ~70% of levels are variants of "navigate cursor to a highlighted target using the motion of the week." Users complete the curriculum, then leave. The only retention signal in the wild is verbatim user feedback: *"I'll come back when you add more levels."* That framing reveals users see VimSanity as content to consume, not skill to build. Adding more levels of the same pattern would feed the wrong appetite.
2. **No retention infrastructure exists.** Analytics are wired (PostHog, Vercel Analytics) but only one event fires (`feedback_button_clicked`). There is no streak, no leaderboard, no daily content, no cross-session score, no progression gating. Per-level completion times are stored in localStorage but never surfaced cross-level.

This spec redesigns the game model and retention loops to convert VimSanity from a one-shot drill collection into a graduate-then-daily-puzzle product. Architecture cleanup is a separate downstream effort, deliberately deferred until after the game design is validated.

## 2. Audience and success

**Primary persona: the hand-rolled beginner.** Has tried vim, knows `h/j/k/l`, gets lost past basic insert mode, wants a structured path to "I can use vim in my editor tomorrow." Optimizes for graduation, not entertainment.

**Secondary persona: the plateau'd intermediate.** Uses vim daily, knows basics, never internalized text objects, registers, macros, or `.`. Wants to break past "arrow keys with extra steps." The redesigned curriculum serves them as the back half of the Learn track; the daily puzzle is what keeps them coming back after they graduate.

**The never-vim'd user is not optimized for**, but is accommodated via a "no idea, teach me" branch in onboarding placement (see §7).

**Success definition:**
- **Primary:** Users complete the Learn curriculum and turn on vim mode in their actual editor. Success = throughput of users graduating.
- **Secondary:** A meaningful fraction of graduates come back regularly for the daily puzzle. Success = D7+ retention among graduates.

This is intentionally a **two-surface product**: a finite curriculum that graduates users, plus an infinite daily puzzle that brings a subset back. The two surfaces have separate success metrics and are not in tension.

## 3. Game model: A → B → C as pedagogical stages

The current app is all "A" (drill on highlighted target). The redesign treats this as one stage of three.

| Stage | What it teaches | Mechanic | Current app |
|---|---|---|---|
| **A. Drill** | Recognition — "I know what `f` does" | Cursor → highlighted target, use the motion-of-the-week | Yes (the whole app) |
| **B. Golf** | Fluency — "I can chain motions efficiently under par" | Transform START → exact GOAL, scored on keystrokes vs. par | No |
| **C. Scenario** | Transfer — "I reach for these motions in real editing" | Realistic code/prose with a story; transform to goal state | No |

This maps onto how skills actually get acquired (recognition → fluency → transfer; Bloom's taxonomy applied to vim). **No existing vim game does the full pipeline.** vim-adventures jumps to scenarios. vim-golf is fluency-only. vim-be-good is drill-only.

The A→B→C model also reframes the "70% of levels feel the same" audit finding: the drills aren't redundant, they're one stage of three, and the reason they currently feel hollow is that B and C are missing.

**Authoring discipline:** not every motion deserves the full A→B→C arc. `hjkl` warrants A and a short B; nobody needs a Scenario for arrow keys. Text objects need almost no A but heavy B and C. The unit author decides per-motion which stages exist.

## 4. App structure: Three Wings

The app has three top-level areas. Skills unlocked in **Learn** become available in **Practice** and **Apply**.

```
┌─────────────────┬──────────────────┬─────────────────┐
│  📘 LEARN       │  🎯 PRACTICE     │  ⚒  APPLY       │
│  Linear         │  Daily puzzle    │  Capstone       │
│  curriculum     │  + drills        │  missions       │
│  (A → short B   │  (full B,        │  (C, gated by   │
│  per skill)     │  replayable)     │  Learn progress)│
├─────────────────┼──────────────────┼─────────────────┤
│ Metric:         │ Metric:          │ Metric:         │
│ % graduated     │ D7 retention,    │ % graduates who │
│                 │ streak length    │ complete each   │
│                 │                  │ mission         │
└─────────────────┴──────────────────┴─────────────────┘
```

- **Learn** is content-bound. Ship it once; users consume it linearly.
- **Practice** is the retention engine. Always-fresh daily puzzle plus permanent drill library.
- **Apply** is graduation proof. A small number of high-quality capstone missions unlocked by Learn progress.

This shape was chosen over a "Skill Units" alternative (each unit = self-contained A→B→C) because the daily puzzle needs a clear home, and great scenarios compose many motions and don't fit inside a single-unit container.

## 5. Learn wing — units and progression

The unit of curriculum is a **skill**, not a "level." A skill teaches one motion or concept (e.g. `w/b/e`, text objects, `cgn`-style replace).

**Structure of a skill within Learn:**
1. **A stage** — short drill (1-3 mini-challenges). Recognition. Always present.
2. **B-check** — 1-2 short par-puzzles using only the skill just learned (plus what came before). Fluency check. Required to unlock the next skill.
3. (No C inside Learn — scenarios live in Apply.)

**Progression model:** strict linear. Each skill unlocks the next. No branching for v1. This matches the audit's recommendation to introduce concept gating (currently all 18 levels are unlocked from minute zero, which lets users skip foundations and then fail at intermediate content).

**Re-entry:** completed skills remain accessible. A returning user lands on their current in-progress skill, but can revisit any completed skill from the Learn sidebar.

## 6. Practice wing — the daily puzzle and the habit

### 6.1 v1: Quiet Wordle

Launch shape: one shared daily puzzle (same for all users), localStorage-backed streak counter, emoji-grid shareable result. **Zero backend beyond serving today's puzzle JSON.** No accounts, no leaderboard.

**Puzzle mechanic:** transform START → exact GOAL with the fewest keystrokes. Par is set by an authored reference solution. The user sees their stroke count vs par at the end.

**Share artifact (after solving):**
```
VimSanity #237
🟩🟩🟩🟩🟩🟩🟨
7 / par 6
```
Inspired by Wordle's emoji grid. Each square = 1 keystroke; greens are within par, yellows are over. Shareable as plain text on any platform.

**Streak rules:**
- Solve today's puzzle → streak +1
- Skip a day → streak resets to 0
- Show longest-ever streak alongside current
- One free "skip" per week to forgive missed days (Duolingo-style protection; reduces churn from a single missed day)

### 6.2 v2 (post-validation): Friendly Hybrid

Once daily puzzle adoption is validated, add:
- **Anonymous score distribution** ("you beat 64% of today's solvers") — needs a tiny aggregation backend
- **Optional accounts** for cross-device streaks and friend-list comparison
- **No global leaderboard** even in v2 — that's optimizing for the wrong persona

v2 is gated on v1 retention data showing that a meaningful fraction of users come back daily. If they don't, ditching the daily puzzle entirely is on the table — building the distribution chart wouldn't fix a missing habit.

### 6.3 Permanent drills

Beyond the daily, Practice also hosts replayable par-puzzles drawn from the same engine. Users can browse "drills using `f/t/F/T`" or "drills using text objects" and play any of them for stroke economy. This is the "I want to sharpen" surface for engaged users.

## 7. Apply wing — capstone missions

Apply v1 is **not an infinite library.** It is 10-15 hand-crafted **capstone missions**, each unlocked when the user completes the cluster of Learn skills it draws on.

**Mission shape (same engine as daily puzzle):** realistic code or prose as START, exact GOAL as the target, one-line story for framing ("the intern named everything 'data' — clean it up"). Scored on completion + keystroke par.

**Why exact-goal and not predicate-based:** uses the same engine as the daily puzzle. One grading system to ship and debug. The cost is that "real refactors have multiple right answers" — true, and predicate-based grading (assertion: "the word `sum` appears 0 times") is on the v3+ roadmap if data shows users want it.

**Unlock model:** each mission lists the Learn skills it requires. Mission appears in Apply once those skills are completed. Encourages graduating; gives a sense of "I've earned this."

**Authoring cadence:** v1 ships with ~10-15 missions. Post-launch, ~1-2 new missions per month, framed as "new content" not "missing content."

## 8. Onboarding — first 60 seconds

**Flow:** Landing → 20-second auto-playing demo → 3-question placement quiz → drop into the right Learn unit.

**Demo:** silent screencast (or animated) of an expert solving today's daily puzzle in 6 keystrokes. Shows the destination, not the journey. **Doubles as marketing GIF for landing page and social.**

**Placement:** three multiple-choice questions, each asking "what does this do in normal mode?" with the motion shown large (e.g. `dw`, `ciw`, `5j`). One of the answer choices is always **"No idea, teach me"** — that's the never-vim'd branch that drops them at Learn Unit 1.

**Drop:** based on placement answers, user lands on the first skill they don't already know. Knew `hjkl` and `dw`? They start at the word-motions or text-objects unit, not at `hjkl` drill.

**Daily-puzzle awareness from minute 1:** Practice tab is visible from the first screen post-onboarding with a "🎯 Today's puzzle is live" affordance. Users don't have to graduate to discover the retention loop exists.

## 9. v1 scope and content plan

### 9.1 Learn — 7 units for v1

Chosen for: clearest A→B→C arc, most natural starting curriculum, capstone scenarios write themselves from them. Ordered so each unit composes with the prior ones.

| # | Skill | A | B-check | Capstone use |
|---|---|---|---|---|
| 1 | `h j k l` movement | ✓ | short | Used in nearly every mission |
| 2 | `w b e` word motions | ✓ | ✓ | "Skip across" missions |
| 3 | `0 $ ^` line edges | ✓ | short | "Edit at end of line" missions |
| 4 | `i a o O Esc` insert modes | ✓ | ✓ | Required for any edit mission |
| 5 | `x d dw dd D c cw C` change/delete | ✓ | ✓ | Core of refactor missions |
| 6 | `y yy yw p P` yank/put | ✓ | ✓ | Move/duplicate lines and words |
| 7 | `diw daw ciw caw` text objects | ✓ | ✓ | "Rename in scope" missions; expands earlier `d/c/y` |

**Deferred to v1.x / v2** (post-launch, monthly cadence): `f/t/F/T` find character, `/ ? n N` search, `gg G #G` file nav, count prefixes, `.` dot command, `u Ctrl-r` undo/redo, visual mode, macros, registers, marks.

### 9.2 Practice — Quiet Wordle + drill library

- 1 daily puzzle (authored 30 days ahead)
- ~50 replayable par-puzzles in the drill library at launch, growing weekly

### 9.3 Apply — 5 capstone missions for v1

Each composes only the Learn skills available at v1 launch:

1. **"The intern named everything 'data'"** — rename a variable in 3-5 places across a small function (text objects + change). Hand-navigates between instances; `*`/search not required.
2. **"Sort these imports"** — reorder 4-5 import lines into alphabetical order (yank/put + line motions).
3. **"Add closing tags"** — append `);` to the end of each of 4 lines (line edges + insert). Practices `A` + repetition by movement.
4. **"Extract this constant"** — pull a magic number out into a named const (text objects + insert + change).
5. **"Reformat the function signature"** — break a long signature onto multiple lines (line motions + insert + change).

All five compose only v1 skills; none require search or the dot command.

Post-launch: +1-2 new capstones per month, drawing on whatever Learn units have been added.

### 9.4 What's explicitly NOT in v1

- Accounts, authentication, user profiles
- Global leaderboards
- Friend/social features
- Mission library beyond the 5 capstones
- Visual brand redesign (separate effort, follows this)
- Architecture cleanup (separate effort, follows validation)
- Mobile support (continues to be hard-walled via existing `MobileWarning.tsx`)
- The vim concepts not in the 7 v1 units (find chars, search, count prefixes, file nav, dot command, undo/redo, visual mode, macros, registers, marks) — all deferred to post-launch monthly cadence

## 10. Migration strategy

**Phased greenfield with `/classic` fallback.**

- Build the new app as a fresh surface. Do not attempt to incrementally migrate existing levels.
- Old vimsanity.com remains accessible at `/classic` route for users mid-progress. Near-zero ongoing cost — just don't break it.
- Old code in `src/components/levels/` is **not refactored** — the audit's architectural debt is paid down only for code that ships in v1. Old levels remain on the V1 code paths until /classic is retired.
- `/classic` retirement is a follow-up decision once v1 retention data is in. If v1 lands well, /classic can be sunset within 3-6 months.

This explicitly rejects the alternative of "refactor all 18 levels onto the new architecture." The audit found the levels themselves are the problem, not just the code. Polishing them ships a tidier version of the same complaint.

## 11. Analytics — what we instrument from day 1

Currently only `feedback_button_clicked` fires. v1 must instrument enough events to answer:

1. Who drops off in onboarding? Which placement question is hardest?
2. Which Learn units have the highest abandon rate?
3. What % of users who start the curriculum graduate?
4. What % of graduates solve the daily puzzle on day 2? day 7? day 30?
5. What's the streak distribution? How many users hit 7+ day streaks?
6. Do graduates engage with Apply, or only Practice?
7. Do users discover Practice on their own, or only post-graduation?

**Event set for v1:**

| Event | Properties |
|---|---|
| `onboarding_started` | source (direct, social, etc.) |
| `onboarding_demo_completed` | watched_full (bool) |
| `onboarding_placement_answered` | question_id, answer, correct |
| `onboarding_completed` | placement_unit (which unit they dropped into) |
| `learn_unit_started` | unit_id |
| `learn_unit_a_completed` | unit_id, time_seconds |
| `learn_unit_b_attempted` | unit_id, keystrokes, par |
| `learn_unit_b_completed` | unit_id, attempts, keystrokes_vs_par |
| `learn_unit_b_abandoned` | unit_id, attempts |
| `daily_puzzle_started` | puzzle_id (date-derived), is_returning_user |
| `daily_puzzle_solved` | puzzle_id, keystrokes, par, time_seconds |
| `daily_puzzle_abandoned` | puzzle_id, keystrokes_so_far |
| `daily_puzzle_share_clicked` | puzzle_id |
| `streak_incremented` | current_streak |
| `streak_broken` | previous_streak |
| `streak_protected` | used_weekly_skip (bool) |
| `capstone_started` | mission_id |
| `capstone_solved` | mission_id, keystrokes_vs_par, time_seconds |
| `capstone_abandoned` | mission_id, keystrokes_so_far |
| `classic_clicked` | from_screen |
| `practice_drill_started` / `solved` / `abandoned` | drill_id, keystrokes |

PostHog dashboards to build at launch:
- Funnel: landing → onboarding_completed → first_unit_a_completed → unit_2_started
- Cohort retention by acquisition week (D1, D3, D7, D30)
- Per-unit completion rate + median attempts to pass B-check
- Daily puzzle solve rate by day-of-week
- Streak histogram

## 12. Open questions deferred to implementation planning

These were not decided in brainstorming and should be resolved during implementation planning, not in this spec:

1. **Where do daily puzzles come from?** Hand-authored by maintainer? Templated? This needs a content-pipeline answer before v1 launch but doesn't change game design.
2. **How is "par" computed?** Author submits a solution; par = author's stroke count. Is this trustworthy enough, or do we need community-validated par? v1 = author's stroke count, accept the noise.
3. **How is the placement quiz scored?** Specifically: how do we map 3 quiz answers to a Learn unit drop point? Needs a small decision matrix during implementation.
4. **Demo content for onboarding:** auto-playing screencast vs. real animated solve from a controlled state machine. Cosmetic — designer's call during build.
5. **Visual brand and UI redesign:** entirely deferred. This spec defines game model; brand follows. Recommend a separate brand/visual exploration once game model is implemented.
6. **Migration of localStorage keys:** existing users have `vimsanity-` keys from v1. v2 keys should be namespaced `vimsanity-v2-` and not collide. Implementation detail.

## 13. Summary of locked decisions

| Decision | Choice | Rationale |
|---|---|---|
| Persona | Hand-rolled beginner → plateau'd intermediate | Solvable pain, real audience |
| Success metric | Graduate Learn + D7 daily-puzzle retention | Two-surface product |
| Game model | A (drill) → B (golf) → C (scenario) | Pedagogically complete; nobody else does this |
| App structure | Three Wings (Learn / Practice / Apply) | Daily puzzle gets a home; scenarios compose many skills |
| Learn progression | Linear, B-check gated | Audit said no gating is a problem |
| Daily puzzle v1 | Quiet Wordle (no accounts, localStorage, emoji share) | Smallest viable habit loop, no backend |
| Daily puzzle v2 | Friendly Hybrid (distribution + optional accounts) | Gated on v1 validation |
| Scenario engine | Vimgolf++ exact-goal, same engine as daily | One engine, two surfaces |
| Onboarding | Demo (20s) → Placement (3 Q) → Drop | Respects existing knowledge; demo doubles as marketing |
| Migration | Phased greenfield, /classic fallback | Audit found levels themselves are the problem; refactor ≠ fix |
| v1 content | 7 Learn units + 5 capstones + daily + drill library | Ship in ~6 weeks, validate, then expand |
