import { describe, it, expect } from 'vitest'
import { bossUnlocked, unitsUntilBoss } from './boss'
import type { Progress } from '../../../state/types'

const IDS = ['a', 'b', 'c']

function progress(completed: string[]): Progress {
  const units: Progress['units'] = {}
  for (const id of IDS) {
    units[id] = completed.includes(id)
      ? { aStatus: 'completed', bStatus: 'completed' }
      : { aStatus: 'ready', bStatus: 'locked' }
  }
  return { units }
}

describe('bossUnlocked', () => {
  it('is locked until every unit is cleared', () => {
    expect(bossUnlocked(progress([]), IDS)).toBe(false)
    expect(bossUnlocked(progress(['a', 'b']), IDS)).toBe(false)
    expect(bossUnlocked(progress(['a', 'b', 'c']), IDS)).toBe(true)
  })
  it('is locked with no units', () => {
    expect(bossUnlocked({ units: {} }, [])).toBe(false)
  })
})

describe('unitsUntilBoss', () => {
  it('counts remaining uncleared units', () => {
    expect(unitsUntilBoss(progress([]), IDS)).toBe(3)
    expect(unitsUntilBoss(progress(['a']), IDS)).toBe(2)
    expect(unitsUntilBoss(progress(['a', 'b', 'c']), IDS)).toBe(0)
  })
})
