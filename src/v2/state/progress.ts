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
    return migrate(parsed, unitIds)
  } catch {
    return initialProgressFor(unitIds)
  }
}

// Reconcile persisted progress with the current curriculum:
// - drop entries for units that no longer exist
// - add LOCKED entries for new units the user hasn't seen
// - unlock any locked unit at or before the deepest one the user has touched
//   (handles out-of-order play via direct URL) or whose predecessor is bCompleted
function migrate(persisted: Progress, unitIds: string[]): Progress {
  const units: Record<string, UnitProgress> = {}
  unitIds.forEach((id, i) => {
    const existing = persisted.units[id]
    units[id] = existing ?? (i === 0
      ? { aStatus: 'ready', bStatus: 'locked' }
      : { ...LOCKED })
  })

  let deepestTouched = -1
  unitIds.forEach((id, i) => {
    const u = units[id]
    if (u.aStatus !== 'locked' || u.bStatus !== 'locked') deepestTouched = i
  })

  unitIds.forEach((id, i) => {
    const u = units[id]
    if (u.aStatus !== 'locked') return
    const prevBCompleted = i === 0 || units[unitIds[i - 1]].bStatus === 'completed'
    if (prevBCompleted || i <= deepestTouched) {
      units[id] = { ...u, aStatus: 'ready' }
    }
  })

  // Preserve light-progression streak across migrations.
  return persisted.streak ? { units, streak: persisted.streak } : { units }
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

  return { ...progress, units: nextUnits }
}

// ─────────────────────────── Light progression ───────────────────────────

export interface UnitResultInput {
  stars: number
  score: number
  keystrokes: number
}

/**
 * Merge a B-check result into a unit's record, keeping the best of each metric
 * (highest stars, highest score, fewest keystrokes). Does not touch stage status.
 */
export function recordUnitResult(
  progress: Progress,
  unitId: string,
  result: UnitResultInput,
): Progress {
  const current = getUnitProgress(progress, unitId)
  const merged: UnitProgress = {
    ...current,
    stars: Math.max(current.stars ?? 0, result.stars),
    bestScore: Math.max(current.bestScore ?? 0, result.score),
    bestKeystrokes:
      current.bestKeystrokes === undefined
        ? result.keystrokes
        : Math.min(current.bestKeystrokes, result.keystrokes),
  }
  return { ...progress, units: { ...progress.units, [unitId]: merged } }
}

/**
 * Open every unit up to (and including) `index` that is still locked, by setting
 * its A-stage to 'ready'. Used by onboarding placement to let a self-reported
 * intermediate start partway in. Does NOT mark anything completed — it only
 * makes earlier units available, so progress stays honest.
 */
export function unlockUpTo(progress: Progress, unitIds: string[], index: number): Progress {
  const units = { ...progress.units }
  for (let i = 0; i <= index && i < unitIds.length; i++) {
    const id = unitIds[i]
    const cur = units[id] ?? { ...LOCKED }
    if (cur.aStatus === 'locked') units[id] = { ...cur, aStatus: 'ready' }
  }
  return { ...progress, units }
}

/** Whole-day difference between two YYYY-MM-DD calendar dates (b - a). */
function dayDiff(aISO: string, bISO: string): number {
  const a = Date.parse(`${aISO}T00:00:00Z`)
  const b = Date.parse(`${bISO}T00:00:00Z`)
  if (Number.isNaN(a) || Number.isNaN(b)) return NaN
  return Math.round((b - a) / 86_400_000)
}

/**
 * Advance the daily streak for an activity on `todayISO` (YYYY-MM-DD):
 * - same day as last → unchanged
 * - exactly the next day → +1
 * - any other gap (or first ever) → reset to 1
 * Pure: the caller supplies today's date so this stays testable.
 */
export function touchStreak(progress: Progress, todayISO: string): Progress {
  const prev = progress.streak
  if (!prev) return { ...progress, streak: { count: 1, lastPlayedISO: todayISO } }

  const diff = dayDiff(prev.lastPlayedISO, todayISO)
  if (diff === 0) return progress
  const count = diff === 1 ? prev.count + 1 : 1
  return { ...progress, streak: { count, lastPlayedISO: todayISO } }
}

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
