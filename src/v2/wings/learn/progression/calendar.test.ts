import { describe, it, expect } from 'vitest'
import { dayDiff, addDaysISO, activeStreakDays, recentDays } from './calendar'

describe('dayDiff', () => {
  it('counts whole days between dates', () => {
    expect(dayDiff('2026-06-01', '2026-06-05')).toBe(4)
    expect(dayDiff('2026-06-05', '2026-06-05')).toBe(0)
    expect(dayDiff('2026-06-05', '2026-06-04')).toBe(-1)
  })
  it('crosses month boundaries', () => {
    expect(dayDiff('2026-05-31', '2026-06-01')).toBe(1)
  })
})

describe('addDaysISO', () => {
  it('shifts forward and backward', () => {
    expect(addDaysISO('2026-06-05', -1)).toBe('2026-06-04')
    expect(addDaysISO('2026-06-30', 1)).toBe('2026-07-01')
  })
})

describe('activeStreakDays', () => {
  it('returns the consecutive run ending at lastPlayed when alive today', () => {
    expect(activeStreakDays({ count: 3, lastPlayedISO: '2026-06-05' }, '2026-06-05')).toEqual([
      '2026-06-05',
      '2026-06-04',
      '2026-06-03',
    ])
  })
  it('still counts as alive when last play was yesterday', () => {
    expect(activeStreakDays({ count: 2, lastPlayedISO: '2026-06-04' }, '2026-06-05')).toEqual([
      '2026-06-04',
      '2026-06-03',
    ])
  })
  it('is empty when the streak has lapsed', () => {
    expect(activeStreakDays({ count: 5, lastPlayedISO: '2026-06-01' }, '2026-06-05')).toEqual([])
  })
  it('is empty with no streak', () => {
    expect(activeStreakDays(undefined, '2026-06-05')).toEqual([])
    expect(activeStreakDays({ count: 0, lastPlayedISO: '2026-06-05' }, '2026-06-05')).toEqual([])
  })
})

describe('recentDays', () => {
  it('lists trailing days ending today, oldest first', () => {
    expect(recentDays('2026-06-05', 3)).toEqual(['2026-06-03', '2026-06-04', '2026-06-05'])
  })
})
