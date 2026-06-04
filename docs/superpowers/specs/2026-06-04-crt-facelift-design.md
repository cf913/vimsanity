# VimSanity 2.0 — Phosphor CRT Facelift (UI rebuild on the V2 engine)

**Date:** 2026-06-04
**Status:** Implemented (phases 0–6) on `feat/v2-foundation-plan-1`
**Source:** Claude Design handoff bundle "Vimsanity 2.0 Designs" + chat transcript.

## Context

A facelift was mocked up in Claude Design: a phosphor-green **CRT terminal** look, GSAP
game-feel, and a game-loop flow (landing → world map → in-level → cinematic complete →
mastery/boss). It deliberately leaves the engine alone — it's a **presentation + game-feel +
progression-metadata layer**, which matches the earlier game-redesign spec that *deferred the
visual brand* to a separate effort. This is that effort.

**Decision:** keep the tested V2 foundation (`src/v2/engine`, `units`, grading, progress) and
**rebuild only the UI**. Scope = "shell + light progression": new look, hjkl world-map flow,
cinematic completion, light progression (stars/score per unit + a localStorage daily streak).
Existing drills are **reskinned** (no bespoke per-level mini-games yet). **GSAP** adopted.

## What shipped

- **Design system** — `src/v2/design/`: `tokens.ts` (phosphor palette), `crt.css` (scanlines,
  vignette, noise, glow/keyframes, all scoped under `.vs-crt-root`; reduced-motion gated),
  `theme.css` (`vs-*` Tailwind colors), `useGsap.ts` (context-scoped, StrictMode/reduced-motion
  safe), and typed primitives (`Kbd`, `Pill`, `TermButton`, `CursorSprite`, `CRT`, `Prompt`,
  `ASCIIHeading`, `Stat`, `BlockBar`, `PixelStar`, `StatusBar`).
- **Shell/Nav** — `Shell.tsx` wraps the app in `CRT` + `.vs-crt-root`; `WingsNav.tsx` is a
  terminal modeline with phosphor tabs. `/classic/*` is untouched (CSS is scoped).
- **Hero** — `wings/learn/screens/Hero.tsx`: booting-terminal landing with typewriter taglines,
  glyph rain, CTAs. Shown once per browser (`vimsanity-v2-seen-hero`).
- **World Map** — `screens/WorldMap.tsx` + `useMapNavigation.ts`: lesson nodes laid out on a
  grid, **navigated with hjkl** (Enter/o to enter, Esc to Hero), dashed SVG paths, player/streak
  panel, selected-node detail. The hub for `/learn`.
- **Progression** — `wings/learn/progression/`: `worldMap.ts` (node coords/blurbs + future boss
  node), `score.ts` (pure stars/score), `dex.ts` (deferred Motion Dex stub). Light progression
  layered additively on `state/types.ts` (`UnitProgress.stars/bestScore/bestKeystrokes`,
  `Progress.streak`) with `recordUnitResult` + `touchStreak` in `state/progress.ts`.
- **In-level** — `level/LevelChrome.tsx` HUD wraps every stage; board views
  (`level/views/GridBoard|TextBoard|EditorBoard`) restyle the play area to CRT. Stages keep their
  engine loop and `{def, onCompleted}` contract; they publish an **optional** `onTelemetry`
  (`level/types.ts`) for the live HUD, and B-checks pass an aggregated par result on completion.
  `UnitRunner.tsx` plumbs telemetry, records stars/score + streak, and routes to completion.
- **Level Complete** — `level/LevelComplete.tsx`: cinematic CLEARED banner, star reveal, score
  breakdown, streak, confetti (GSAP, reduced-motion gated). Revisits show stored best.
- **Practice/Apply** — reskinned CRT "coming soon" panels.

## Seams / invariants (kept safe)

- Engine + `units/*` data + required `Progress`/`UnitProgress` shapes unchanged → all 188 vitest
  tests stay green. New optional fields only; `migrate` preserves `streak`.
- `Unit` stays engine-pure; display metadata lives in `progression/worldMap.ts`.
- World-map hjkl and in-level keydown never coexist (different routes).
- CRT CSS scoped under `.vs-crt-root` → `/classic` visually untouched.

## Deferred (future plans)

Full XP/player-level economy · Motion Dex screen (stub: `progression/dex.ts`) · Boss levels
(node reserved in `worldMap.ts`) · bespoke per-level mini-games (maze, snake, stepping-stones,
sniper…) — extension point: new `def.kind` + a new board view, no chrome change · Practice daily
puzzle + Apply capstones · migrating classic-only motions (find, search, gg/G, dot, undo) into V2.

## Verification

`npm run build` ✓ · `npx tsc --noEmit` ✓ · `npx eslint src/v2` clean ✓ · `npm run test:run`
188 passed ✓ (5 lint errors remain in untouched `src/components/levels/*` classic code —
pre-existing, not introduced here). Manually walked Hero → Map (hjkl nav) → Drill (live HUD) →
Complete (stars/streak) → next; Practice/Apply render.
