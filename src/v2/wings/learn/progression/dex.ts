// ─────────────────────────── DEFERRED: Motion Dex ───────────────────────────
// Extension point for the "Pokédex of vim motions" screen from the 2.0 design
// (a card per motion: mastery bar, lifetime uses, status, evolution chain).
//
// NOT built in this pass (scope = "Shell + light progression"). When picked up:
//   1. Populate a catalog keyed by motion (e.g. 'h', 'dw', 'ciw').
//   2. Derive mastery from per-motion keystroke telemetry (StageTelemetry.lastKey
//      can be aggregated; or extend the engine to count motion usage).
//   3. Add a Dex screen + route, and wire the world-map `futureNodes` entry
//      (kind: 'dex') to it.
//
// Related light-progression already in place: UnitProgress.stars / bestScore.
// Related future markers: worldMap.ts `futureNodes` (kind 'dex' | 'boss').

export type DexStatus = 'mastered' | 'learning' | 'rusty' | 'locked'

export interface DexEntry {
  /** The motion keys, e.g. 'h', 'dw', 'ciw'. */
  motion: string
  label: string
  status: DexStatus
  /** 0–100 mastery; derived from usage telemetry when implemented. */
  mastery: number
  lifetimeUses: number
}

// Intentionally empty until the Dex is built.
export const dexCatalog: DexEntry[] = []
