import { describe, it, expect } from 'vitest'
import { dailyIndex, dailyNumber, shareString, dailyStreak } from './daily'

describe('dailyIndex', () => {
  it('is deterministic per date and cycles through the pool', () => {
    expect(dailyIndex('2026-01-01', 8)).toBe(0)
    expect(dailyIndex('2026-01-02', 8)).toBe(1)
    expect(dailyIndex('2026-01-09', 8)).toBe(0) // 8 days later → wraps
  })
  it('never returns a negative index for pre-epoch dates', () => {
    const i = dailyIndex('2025-12-30', 8)
    expect(i).toBeGreaterThanOrEqual(0)
    expect(i).toBeLessThan(8)
  })
})

describe('dailyNumber', () => {
  it('is 1-based from the epoch', () => {
    expect(dailyNumber('2026-01-01')).toBe(1)
    expect(dailyNumber('2026-01-10')).toBe(10)
  })
})

describe('shareString', () => {
  it('encodes stars as pips without leaking the puzzle', () => {
    const s = shareString('2026-01-05', 14, 12, 2)
    expect(s).toContain('VimSanity Daily #5')
    expect(s).toContain('★★☆')
    expect(s).toContain('14 keys · par 12')
    expect(s).not.toMatch(/delete|line|word/i)
  })
  it('renders three filled stars at 3', () => {
    expect(shareString('2026-01-01', 2, 2, 3)).toContain('★★★')
  })
})

describe('dailyStreak', () => {
  it('counts consecutive days ending today', () => {
    expect(dailyStreak(['2026-06-03', '2026-06-04', '2026-06-05'], '2026-06-05')).toBe(3)
  })
  it('gives a one-day grace (yesterday still counts)', () => {
    expect(dailyStreak(['2026-06-03', '2026-06-04'], '2026-06-05')).toBe(2)
  })
  it('breaks on a gap', () => {
    expect(dailyStreak(['2026-06-01', '2026-06-05'], '2026-06-05')).toBe(1)
  })
  it('is zero when lapsed or empty', () => {
    expect(dailyStreak(['2026-06-01'], '2026-06-05')).toBe(0)
    expect(dailyStreak([], '2026-06-05')).toBe(0)
  })
})
