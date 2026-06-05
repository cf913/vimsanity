// Pure helpers for the daily challenge: deterministic day→puzzle selection,
// a stable "Daily #N" number, a spoiler-free share string, and streak math over
// a set of solved dates. No DOM/engine deps so it's fully testable.

import { addDaysISO } from '../learn/progression'

// Anchor for day counting. Day 0 = 2026-01-01.
const EPOCH_ISO = '2026-01-01'

function daysSinceEpoch(todayISO: string): number {
  const epoch = Date.parse(`${EPOCH_ISO}T00:00:00Z`)
  const t = Date.parse(`${todayISO}T00:00:00Z`)
  if (Number.isNaN(t)) return 0
  return Math.floor((t - epoch) / 86_400_000)
}

/** Index into a pool of `poolLen` puzzles for the given date (cycles, never negative). */
export function dailyIndex(todayISO: string, poolLen: number): number {
  if (poolLen <= 0) return 0
  const n = daysSinceEpoch(todayISO)
  return ((n % poolLen) + poolLen) % poolLen
}

/** Human-facing daily number ("Daily #N"), 1-based from the epoch. */
export function dailyNumber(todayISO: string): number {
  return daysSinceEpoch(todayISO) + 1
}

/** Spoiler-free share text (no puzzle content), Quiet-Wordle style. */
export function shareString(todayISO: string, keystrokes: number, par: number, stars: number): string {
  const pips = '★★★☆☆☆'.slice(3 - stars, 6 - stars)
  return `VimSanity Daily #${dailyNumber(todayISO)}\n${pips}  ⌨ ${keystrokes} keys · par ${par}\nvimsanity.com`
}

/**
 * Length of the active daily streak given the set of solved YYYY-MM-DD dates.
 * Counts consecutive days ending today (or yesterday, so a day isn't "lost"
 * until fully missed).
 */
export function dailyStreak(solvedDates: Iterable<string>, todayISO: string): number {
  const set = solvedDates instanceof Set ? solvedDates : new Set(solvedDates)
  if (set.size === 0) return 0
  // Anchor: today if solved, else yesterday (grace), else streak is 0.
  let anchor: string
  if (set.has(todayISO)) anchor = todayISO
  else if (set.has(addDaysISO(todayISO, -1))) anchor = addDaysISO(todayISO, -1)
  else return 0
  let count = 0
  let day = anchor
  while (set.has(day)) {
    count++
    day = addDaysISO(day, -1)
  }
  return count
}
