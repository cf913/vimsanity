import { describe, it, expect } from 'vitest'
import { computeBadges } from './badges'
import type { Progress, UnitProgress } from '../../../state/types'

const IDS = ['a', 'b', 'c']

function progress(units: Record<string, Partial<UnitProgress>>, streak?: number): Progress {
  const full: Progress['units'] = {}
  for (const id of IDS) {
    full[id] = { aStatus: 'ready', bStatus: 'locked', ...units[id] }
  }
  return streak === undefined
    ? { units: full }
    : { units: full, streak: { count: streak, lastPlayedISO: '2026-06-05' } }
}

function find(p: Progress, id: string) {
  return computeBadges(p, IDS).find((b) => b.id === id)!
}

describe('computeBadges', () => {
  it('marks first-clear earned once a unit is completed', () => {
    expect(find(progress({}), 'first-clear').earned).toBe(false)
    expect(find(progress({ a: { bStatus: 'completed' } }), 'first-clear').earned).toBe(true)
  })

  it('tracks unearned progress toward star collection', () => {
    const b = find(progress({ a: { stars: 2 }, b: { stars: 1 } }), 'collector')
    expect(b.earned).toBe(false)
    expect(b.progress).toEqual({ current: 3, target: 9 }) // min(12, 3*3)=9
  })

  it('earns flawless only when every unit is 3-starred', () => {
    const partial = progress({ a: { stars: 3 }, b: { stars: 3 }, c: { stars: 2 } })
    expect(find(partial, 'flawless').earned).toBe(false)
    const all = progress({ a: { stars: 3 }, b: { stars: 3 }, c: { stars: 3 } })
    expect(find(all, 'flawless').earned).toBe(true)
  })

  it('earns overworld when every unit is cleared', () => {
    const all = progress({ a: { bStatus: 'completed' }, b: { bStatus: 'completed' }, c: { bStatus: 'completed' } })
    expect(find(all, 'overworld').earned).toBe(true)
  })

  it('reads streak badges from the streak count', () => {
    expect(find(progress({}, 3), 'habit').earned).toBe(true)
    expect(find(progress({}, 3), 'unbreakable').earned).toBe(false)
    expect(find(progress({}, 7), 'unbreakable').earned).toBe(true)
  })
})
