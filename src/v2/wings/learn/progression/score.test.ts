import { describe, it, expect } from 'vitest'
import {
  starsForKeystrokes,
  scoreForResult,
  aggregateUnitResult,
} from './score'

describe('starsForKeystrokes', () => {
  it('awards 3 stars at or under par', () => {
    expect(starsForKeystrokes(5, 5)).toBe(3)
    expect(starsForKeystrokes(3, 5)).toBe(3)
  })
  it('awards 2 stars within 1.5x par', () => {
    expect(starsForKeystrokes(7, 5)).toBe(2) // ceil(7.5)=8, 7<=8
    expect(starsForKeystrokes(8, 5)).toBe(2)
  })
  it('awards 1 star beyond 1.5x par', () => {
    expect(starsForKeystrokes(9, 5)).toBe(1)
    expect(starsForKeystrokes(50, 5)).toBe(1)
  })
  it('handles a zero/invalid par as a perfect score', () => {
    expect(starsForKeystrokes(10, 0)).toBe(3)
  })
})

describe('scoreForResult', () => {
  it('rewards stars and under-par efficiency', () => {
    // 3 stars (3000) + (par*2 - keystrokes)=(10-4)=6 *25 = 150 → 3150
    expect(scoreForResult(3, 4, 5)).toBe(3150)
  })
  it('never goes negative on the efficiency term', () => {
    expect(scoreForResult(1, 100, 5)).toBe(1000)
  })
})

describe('aggregateUnitResult', () => {
  it('sums keystrokes and par across puzzles', () => {
    const r = aggregateUnitResult([
      { keystrokes: 3, par: 3 },
      { keystrokes: 4, par: 4 },
    ])
    expect(r.keystrokes).toBe(7)
    expect(r.par).toBe(7)
    expect(r.stars).toBe(3)
    expect(r.score).toBeGreaterThan(0)
  })
  it('drops stars when total keystrokes exceed par', () => {
    const r = aggregateUnitResult([
      { keystrokes: 10, par: 3 },
      { keystrokes: 10, par: 4 },
    ])
    expect(r.stars).toBe(1)
  })
})
