// Boss gating — the endgame "refactor" boss unlocks only once every unit's
// B-check is cleared. Pure + testable (reads progress only).

import type { Progress } from '../../../state/types'

export function bossUnlocked(progress: Progress, unitIds: string[]): boolean {
  return unitIds.length > 0 && unitIds.every((id) => progress.units[id]?.bStatus === 'completed')
}

/** How many more units must be cleared before the boss opens. */
export function unitsUntilBoss(progress: Progress, unitIds: string[]): number {
  return unitIds.filter((id) => progress.units[id]?.bStatus !== 'completed').length
}
