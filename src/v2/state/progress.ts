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

  return { units }
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

  return { units: nextUnits }
}
