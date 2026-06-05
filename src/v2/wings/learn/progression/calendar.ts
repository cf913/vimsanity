// Streak-calendar helpers. The persisted streak stores only its length + the
// last-played date, but because touchStreak only ever extends on consecutive
// days, the active streak IS exactly the `count` consecutive days ending at
// lastPlayedISO — so we can render an accurate calendar with no extra storage.
// Pure date math (UTC) keeps it testable; callers pass today's date in.

import type { Streak } from '../../../state/types'

/** Whole-day difference (b - a) between two YYYY-MM-DD dates; NaN if unparseable. */
export function dayDiff(aISO: string, bISO: string): number {
  const a = Date.parse(`${aISO}T00:00:00Z`)
  const b = Date.parse(`${bISO}T00:00:00Z`)
  if (Number.isNaN(a) || Number.isNaN(b)) return NaN
  return Math.round((b - a) / 86_400_000)
}

/** Shift a YYYY-MM-DD date by `delta` whole days, returning a YYYY-MM-DD string. */
export function addDaysISO(iso: string, delta: number): string {
  const t = Date.parse(`${iso}T00:00:00Z`)
  return new Date(t + delta * 86_400_000).toISOString().slice(0, 10)
}

/**
 * The set of ISO dates that make up the *active* streak as of `todayISO`.
 * Empty if there's no streak or it has lapsed (last play before yesterday).
 */
export function activeStreakDays(streak: Streak | undefined, todayISO: string): string[] {
  if (!streak || streak.count <= 0) return []
  const diff = dayDiff(streak.lastPlayedISO, todayISO)
  // Alive only if the last completion was today or yesterday.
  if (Number.isNaN(diff) || diff < 0 || diff > 1) return []
  const days: string[] = []
  for (let i = 0; i < streak.count; i++) days.push(addDaysISO(streak.lastPlayedISO, -i))
  return days
}

/** The trailing `length` calendar days ending at (and including) `todayISO`. */
export function recentDays(todayISO: string, length: number): string[] {
  const days: string[] = []
  for (let i = length - 1; i >= 0; i--) days.push(addDaysISO(todayISO, -i))
  return days
}
