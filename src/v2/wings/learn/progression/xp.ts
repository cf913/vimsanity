// Player level / XP — an honest progression veneer over the light-progression
// data we already persist. Total XP is the sum of each unit's best score (real,
// already-earned points), mapped to a level via a growing per-level cost curve.
// Pure + dependency-free (engine/React-agnostic), so it's fully testable.

import type { Progress } from '../../../state/types'

export const MAX_LEVEL = 12

export interface PlayerLevel {
  /** 1-based player level. */
  level: number
  /** Flavor title for the current level band. */
  title: string
  /** Total accumulated XP. */
  xp: number
  /** XP earned within the current level. */
  xpIntoLevel: number
  /** XP span of the current level (cost to reach the next). 0 at max level. */
  xpForLevel: number
  /** Progress through the current level, 0–100. */
  pct: number
  atMax: boolean
}

const TITLES: ReadonlyArray<{ min: number; title: string }> = [
  { min: 1, title: 'Cursor Novice' },
  { min: 3, title: 'Motion Apprentice' },
  { min: 5, title: 'Word Wrangler' },
  { min: 7, title: 'Buffer Adept' },
  { min: 9, title: 'Modal Operator' },
  { min: 11, title: 'Vim Master' },
  { min: 12, title: 'Vim Lord' },
]

export function titleForLevel(level: number): string {
  let title = TITLES[0].title
  for (const entry of TITLES) if (level >= entry.min) title = entry.title
  return title
}

/** XP needed to advance FROM level n to n+1 (cheap early, steeper later). */
export function levelCost(n: number): number {
  return 800 + (n - 1) * 600
}

/** Total XP = sum of best score across all units. */
export function totalXp(progress: Progress): number {
  return Object.values(progress.units).reduce((sum, u) => sum + (u.bestScore ?? 0), 0)
}

/** Resolve a raw XP total into a level + within-level progress. */
export function levelForXp(xp: number): PlayerLevel {
  const safeXp = Math.max(0, Math.floor(xp))
  let level = 1
  let remaining = safeXp
  while (level < MAX_LEVEL) {
    const cost = levelCost(level)
    if (remaining < cost) {
      return {
        level,
        title: titleForLevel(level),
        xp: safeXp,
        xpIntoLevel: remaining,
        xpForLevel: cost,
        pct: cost > 0 ? (remaining / cost) * 100 : 0,
        atMax: false,
      }
    }
    remaining -= cost
    level++
  }
  return {
    level: MAX_LEVEL,
    title: titleForLevel(MAX_LEVEL),
    xp: safeXp,
    xpIntoLevel: 0,
    xpForLevel: 0,
    pct: 100,
    atMax: true,
  }
}

/** The player's current level derived from their persisted progress. */
export function playerLevel(progress: Progress): PlayerLevel {
  return levelForXp(totalXp(progress))
}
