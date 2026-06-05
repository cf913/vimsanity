// Apply-capstone results, persisted under their own localStorage key (separate
// from unit Progress, so the migration contract is untouched). Best run per
// mission drives the mission cards + the wing summary.

const APPLY_KEY = 'vimsanity-v2-apply'

export interface ApplyRecord {
  stars: number
  bestKeystrokes: number
  bestScore: number
}

export interface ApplyStore {
  missions: Record<string, ApplyRecord>
}

export function loadApplyStore(): ApplyStore {
  try {
    const raw = localStorage.getItem(APPLY_KEY)
    if (raw) {
      const parsed = JSON.parse(raw) as ApplyStore
      if (parsed && typeof parsed === 'object' && parsed.missions) return parsed
    }
  } catch {
    /* fall through */
  }
  return { missions: {} }
}

/** Merge a run into a mission's record, keeping best stars/score and fewest keys. */
export function recordApply(id: string, stars: number, keystrokes: number, score: number): ApplyStore {
  const store = loadApplyStore()
  const prev = store.missions[id]
  const merged: ApplyRecord = {
    stars: Math.max(prev?.stars ?? 0, stars),
    bestScore: Math.max(prev?.bestScore ?? 0, score),
    bestKeystrokes: prev ? Math.min(prev.bestKeystrokes, keystrokes) : keystrokes,
  }
  const out: ApplyStore = { missions: { ...store.missions, [id]: merged } }
  localStorage.setItem(APPLY_KEY, JSON.stringify(out))
  return out
}
