// Achievement badges, computed purely from persisted progress. No hidden state —
// every badge is derived from real milestones (units cleared, stars earned,
// streak length), so the UI never shows a fabricated achievement.

import type { Progress } from '../../../state/types'

export interface Badge {
  id: string
  label: string
  desc: string
  /** A single mono-friendly glyph for the CRT look. */
  icon: string
  earned: boolean
  /** Progress toward earning it (omitted once earned). */
  progress?: { current: number; target: number }
}

function badge(
  id: string,
  label: string,
  desc: string,
  icon: string,
  current: number,
  target: number,
): Badge {
  const earned = current >= target && target > 0
  return earned
    ? { id, label, desc, icon, earned: true }
    : { id, label, desc, icon, earned: false, progress: { current: Math.min(current, target), target } }
}

/** Derive the full badge set (earned + in-progress) from progress. */
export function computeBadges(progress: Progress, unitIds: string[]): Badge[] {
  const ups = unitIds.map((id) => progress.units[id]).filter(Boolean)
  const total = unitIds.length
  const cleared = ups.filter((u) => u.bStatus === 'completed').length
  const threeStar = ups.filter((u) => (u.stars ?? 0) >= 3).length
  const totalStars = ups.reduce((s, u) => s + (u.stars ?? 0), 0)
  const streak = progress.streak?.count ?? 0
  const starGoal = Math.min(12, total * 3)

  return [
    badge('first-clear', 'First Blood', 'Clear your first unit', '✓', cleared, 1),
    badge('bullseye', 'Bullseye', 'Earn 3 stars on a unit', '★', threeStar, 1),
    badge('collector', 'Star Collector', `Collect ${starGoal} stars`, '✦', totalStars, starGoal),
    badge('habit', 'Habit Forming', 'Reach a 3-day streak', '▲', streak, 3),
    badge('unbreakable', 'Unbreakable', 'Reach a 7-day streak', '※', streak, 7),
    badge('flawless', 'Flawless', '3 stars on every unit', '◆', threeStar, total),
    badge('overworld', 'Overworld Cleared', 'Clear every unit', '⬢', cleared, total),
  ]
}
