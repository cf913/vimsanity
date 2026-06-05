// Pure scoring helpers for the light-progression layer (stars + score from a
// B-check par performance). No engine or React dependencies — fully testable.

export type Stars = 0 | 1 | 2 | 3

/**
 * Stars earned for completing a par-scored stage.
 * 3★ = at or under par, 2★ = within 1.5× par, otherwise 1★.
 * (Completion always earns at least 1★.)
 */
export function starsForKeystrokes(keystrokes: number, par: number): Stars {
  if (par <= 0) return 3
  if (keystrokes <= par) return 3
  if (keystrokes <= Math.ceil(par * 1.5)) return 2
  return 1
}

/**
 * Numeric score for a result: a flat per-star reward plus an efficiency bonus
 * for finishing under (twice) par. Deterministic; used for the best-score record.
 */
export function scoreForResult(stars: Stars, keystrokes: number, par: number): number {
  const starScore = stars * 1000
  const efficiency = Math.max(0, par * 2 - keystrokes) * 25
  return starScore + efficiency
}

export interface PuzzleResult {
  keystrokes: number
  par: number
}

export interface UnitResult {
  stars: Stars
  score: number
  keystrokes: number
  par: number
}

/** Aggregate per-puzzle results into a single unit result (sum keystrokes vs sum par). */
export function aggregateUnitResult(results: PuzzleResult[]): UnitResult {
  const keystrokes = results.reduce((s, r) => s + r.keystrokes, 0)
  const par = results.reduce((s, r) => s + r.par, 0)
  const stars = starsForKeystrokes(keystrokes, par)
  return { stars, score: scoreForResult(stars, keystrokes, par), keystrokes, par }
}
