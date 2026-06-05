// Pure summary over Apply records, for the wing header. No DOM/engine deps.

import type { ApplyStore } from '../../state/apply'

export interface ApplySummary {
  cleared: number
  total: number
  stars: number
  maxStars: number
}

export function applySummary(store: ApplyStore, missionIds: string[]): ApplySummary {
  let cleared = 0
  let stars = 0
  for (const id of missionIds) {
    const rec = store.missions[id]
    if (rec) {
      cleared++
      stars += rec.stars
    }
  }
  return { cleared, total: missionIds.length, stars, maxStars: missionIds.length * 3 }
}
