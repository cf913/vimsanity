import { describe, it, expect } from 'vitest'
import { recordUnitResult, touchStreak, initialProgressFor, markStageCompleted } from './progress'

describe('recordUnitResult', () => {
  it('records stars/score/keystrokes on first result', () => {
    const p = initialProgressFor(['hjkl'])
    const next = recordUnitResult(p, 'hjkl', { stars: 2, score: 2150, keystrokes: 8 })
    expect(next.units.hjkl.stars).toBe(2)
    expect(next.units.hjkl.bestScore).toBe(2150)
    expect(next.units.hjkl.bestKeystrokes).toBe(8)
    // does not touch stage status
    expect(next.units.hjkl.aStatus).toBe('ready')
  })

  it('keeps the best of each metric across attempts', () => {
    let p = initialProgressFor(['hjkl'])
    p = recordUnitResult(p, 'hjkl', { stars: 1, score: 1000, keystrokes: 12 })
    p = recordUnitResult(p, 'hjkl', { stars: 3, score: 3100, keystrokes: 6 })
    p = recordUnitResult(p, 'hjkl', { stars: 2, score: 2000, keystrokes: 9 })
    expect(p.units.hjkl.stars).toBe(3)
    expect(p.units.hjkl.bestScore).toBe(3100)
    expect(p.units.hjkl.bestKeystrokes).toBe(6)
  })

  it('preserves stage status set by markStageCompleted', () => {
    let p = initialProgressFor(['hjkl', 'wbe'])
    p = markStageCompleted(p, 'hjkl', 'a', ['hjkl', 'wbe'])
    p = markStageCompleted(p, 'hjkl', 'b', ['hjkl', 'wbe'])
    p = recordUnitResult(p, 'hjkl', { stars: 3, score: 3000, keystrokes: 5 })
    expect(p.units.hjkl.aStatus).toBe('completed')
    expect(p.units.hjkl.bStatus).toBe('completed')
    expect(p.units.wbe.aStatus).toBe('ready')
  })
})

describe('touchStreak', () => {
  it('starts a streak at 1 on first activity', () => {
    const p = touchStreak(initialProgressFor(['hjkl']), '2026-06-04')
    expect(p.streak).toEqual({ count: 1, lastPlayedISO: '2026-06-04' })
  })

  it('is idempotent on the same day', () => {
    let p = touchStreak(initialProgressFor(['hjkl']), '2026-06-04')
    p = touchStreak(p, '2026-06-04')
    expect(p.streak).toEqual({ count: 1, lastPlayedISO: '2026-06-04' })
  })

  it('increments on consecutive days', () => {
    let p = touchStreak(initialProgressFor(['hjkl']), '2026-06-04')
    p = touchStreak(p, '2026-06-05')
    p = touchStreak(p, '2026-06-06')
    expect(p.streak).toEqual({ count: 3, lastPlayedISO: '2026-06-06' })
  })

  it('resets to 1 after a missed day', () => {
    let p = touchStreak(initialProgressFor(['hjkl']), '2026-06-04')
    p = touchStreak(p, '2026-06-07') // skipped 5th & 6th
    expect(p.streak).toEqual({ count: 1, lastPlayedISO: '2026-06-07' })
  })

  it('handles month boundaries', () => {
    let p = touchStreak(initialProgressFor(['hjkl']), '2026-01-31')
    p = touchStreak(p, '2026-02-01')
    expect(p.streak).toEqual({ count: 2, lastPlayedISO: '2026-02-01' })
  })
})
