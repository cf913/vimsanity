export type StageStatus = 'locked' | 'ready' | 'in-progress' | 'completed'

export interface UnitProgress {
  aStatus: StageStatus
  bStatus: StageStatus
  // ── Light-progression fields (optional, backward-compatible). ──
  /** Best stars earned on the B-check (0–3). */
  stars?: number
  /** Best numeric score recorded for this unit. */
  bestScore?: number
  /** Fewest total keystrokes recorded on the B-check. */
  bestKeystrokes?: number
}

/** Daily-practice streak (light progression). */
export interface Streak {
  count: number
  /** ISO calendar date (YYYY-MM-DD) of the last day a unit was completed. */
  lastPlayedISO: string
}

export interface Progress {
  units: Record<string, UnitProgress>
  streak?: Streak
  // DEFERRED: full XP/player-level economy from the 2.0 design lives here later
  // (e.g. `xp?: number`, `playerLevel?: number`). Add as optional fields so
  // migration stays backward-compatible — see progress.ts `migrate`.
}

export const STORAGE_KEY = 'vimsanity-v2-progress'
