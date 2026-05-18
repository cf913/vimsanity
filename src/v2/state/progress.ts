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
    return parsed
  } catch {
    return initialProgressFor(unitIds)
  }
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
