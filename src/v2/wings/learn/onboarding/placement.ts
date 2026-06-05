// Onboarding placement: turn three self-reported answers into a recommended
// starting unit. Pure + testable. The recommendation only *suggests* (and later
// unlocks) a unit — it never marks anything completed, so progress stays honest.

export type UsedVim = 'never' | 'some' | 'daily'
export type Operators = 'no' | 'some' | 'yes'

export interface PlacementAnswers {
  used: UsedVim
  /** Comfortable moving with h j k l. */
  movement: boolean
  operators: Operators
}

/**
 * Recommended unit index for the answers, clamped to the curriculum.
 * Curriculum order: 0 hjkl · 1 wbe · 2 lineEdges · 3 insertModes · 4 changeDelete · 5 yankPut.
 * We never recommend past `changeDelete` (index 4) — there's always something left to learn.
 */
export function recommendUnitIndex(answers: PlacementAnswers, unitCount: number): number {
  let score = 0
  if (answers.used === 'some') score = 1
  else if (answers.used === 'daily') score = 2
  if (answers.movement) score = Math.max(score, 2)
  if (answers.operators === 'some') score = Math.max(score, 3)
  else if (answers.operators === 'yes') score = Math.max(score, 4)

  const cap = Math.min(4, Math.max(0, unitCount - 1))
  return Math.min(score, cap)
}
