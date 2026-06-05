import { describe, it, expect } from 'vitest'
import { levelCost, totalXp, levelForXp, playerLevel, titleForLevel, MAX_LEVEL } from './xp'
import type { Progress } from '../../../state/types'

function progressWith(bestScores: number[]): Progress {
  const units: Progress['units'] = {}
  bestScores.forEach((s, i) => {
    units[`u${i}`] = { aStatus: 'completed', bStatus: 'completed', bestScore: s }
  })
  return { units }
}

describe('levelCost', () => {
  it('grows linearly per level', () => {
    expect(levelCost(1)).toBe(800)
    expect(levelCost(2)).toBe(1400)
    expect(levelCost(3)).toBe(2000)
  })
})

describe('totalXp', () => {
  it('sums best scores, treating missing as 0', () => {
    expect(totalXp(progressWith([1000, 2000, 500]))).toBe(3500)
    expect(totalXp({ units: { a: { aStatus: 'ready', bStatus: 'locked' } } })).toBe(0)
  })
})

describe('levelForXp', () => {
  it('starts at level 1 with no xp', () => {
    const l = levelForXp(0)
    expect(l.level).toBe(1)
    expect(l.xpIntoLevel).toBe(0)
    expect(l.pct).toBe(0)
    expect(l.atMax).toBe(false)
  })

  it('keeps remainder within the current level', () => {
    // 800 to reach L2, then 200 into L2 (cost 1400).
    const l = levelForXp(1000)
    expect(l.level).toBe(2)
    expect(l.xpIntoLevel).toBe(200)
    expect(l.xpForLevel).toBe(1400)
    expect(l.pct).toBeCloseTo((200 / 1400) * 100)
  })

  it('advances exactly on a threshold', () => {
    expect(levelForXp(800).level).toBe(2)
    expect(levelForXp(800).xpIntoLevel).toBe(0)
  })

  it('clamps at max level', () => {
    const l = levelForXp(10_000_000)
    expect(l.level).toBe(MAX_LEVEL)
    expect(l.atMax).toBe(true)
    expect(l.pct).toBe(100)
  })

  it('floors fractional and never goes below level 1', () => {
    expect(levelForXp(-50).level).toBe(1)
    expect(levelForXp(799.9).level).toBe(1)
  })
})

describe('titleForLevel', () => {
  it('maps level bands to titles', () => {
    expect(titleForLevel(1)).toBe('Cursor Novice')
    expect(titleForLevel(3)).toBe('Motion Apprentice')
    expect(titleForLevel(MAX_LEVEL)).toBe('Vim Lord')
  })
})

describe('playerLevel', () => {
  it('derives level from summed best scores', () => {
    expect(playerLevel(progressWith([800])).level).toBe(2)
  })
})
