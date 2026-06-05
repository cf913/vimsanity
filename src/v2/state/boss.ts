// Boss record persistence. Kept in its own localStorage key (not in Progress)
// so the unit-progress migration contract stays completely untouched.

const BOSS_KEY = 'vimsanity-v2-boss'

export interface BossRecord {
  cleared: boolean
  /** Fewest keystrokes across a winning run. */
  bestKeystrokes?: number
  /** Fastest winning time, in ms. */
  bestTimeMs?: number
}

export function loadBossRecord(): BossRecord {
  try {
    const raw = localStorage.getItem(BOSS_KEY)
    if (raw) {
      const parsed = JSON.parse(raw) as BossRecord
      if (parsed && typeof parsed === 'object') return parsed
    }
  } catch {
    /* fall through to default */
  }
  return { cleared: false }
}

/** Merge a winning run into the record, keeping the best of each metric. */
export function recordBossWin(keystrokes: number, timeMs: number): BossRecord {
  const cur = loadBossRecord()
  const next: BossRecord = {
    cleared: true,
    bestKeystrokes: cur.bestKeystrokes === undefined ? keystrokes : Math.min(cur.bestKeystrokes, keystrokes),
    bestTimeMs: cur.bestTimeMs === undefined ? timeMs : Math.min(cur.bestTimeMs, timeMs),
  }
  localStorage.setItem(BOSS_KEY, JSON.stringify(next))
  return next
}
