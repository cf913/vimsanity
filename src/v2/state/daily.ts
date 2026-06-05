// Daily-challenge results, persisted under their own localStorage key (separate
// from unit Progress, so the migration contract is untouched). One best result
// per calendar date drives the share string and the daily streak.

const DAILY_KEY = 'vimsanity-v2-daily'

export interface DailyResult {
  dateISO: string
  keystrokes: number
  par: number
  stars: number
}

export interface DailyStore {
  results: Record<string, DailyResult>
}

export function loadDailyStore(): DailyStore {
  try {
    const raw = localStorage.getItem(DAILY_KEY)
    if (raw) {
      const parsed = JSON.parse(raw) as DailyStore
      if (parsed && typeof parsed === 'object' && parsed.results) return parsed
    }
  } catch {
    /* fall through */
  }
  return { results: {} }
}

/** Record a solved daily, keeping the best (fewest-keystroke) run for that date. */
export function recordDaily(dateISO: string, keystrokes: number, par: number, stars: number): DailyStore {
  const store = loadDailyStore()
  const prev = store.results[dateISO]
  const next: DailyResult = !prev || keystrokes < prev.keystrokes ? { dateISO, keystrokes, par, stars } : prev
  const out: DailyStore = { results: { ...store.results, [dateISO]: next } }
  localStorage.setItem(DAILY_KEY, JSON.stringify(out))
  return out
}

export function solvedDates(store: DailyStore): string[] {
  return Object.keys(store.results)
}
