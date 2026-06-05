import { describe, it, expect } from 'vitest'
import { dexCatalog, buildDex, dexSummary } from './dex'
import { units } from '../units/registry'
import type { Progress } from '../../../state/types'

describe('dexCatalog ↔ unit registry', () => {
  it('has an entry for every motion every unit teaches', () => {
    const catalogMotions = new Set(dexCatalog.map((m) => m.motion))
    for (const unit of units) {
      for (const token of unit.motionLabel.split(/\s+/)) {
        expect(catalogMotions.has(token), `missing dex entry for "${token}" (${unit.id})`).toBe(true)
      }
    }
  })

  it('only references real unit ids', () => {
    const ids = new Set(units.map((u) => u.id))
    for (const m of dexCatalog) expect(ids.has(m.unitId)).toBe(true)
  })

  it('has unique motion keys', () => {
    const seen = new Set<string>()
    for (const m of dexCatalog) {
      expect(seen.has(m.motion)).toBe(false)
      seen.add(m.motion)
    }
  })
})

describe('buildDex', () => {
  const progress: Progress = {
    units: {
      hjkl: { aStatus: 'completed', bStatus: 'completed', stars: 3 },
      wbe: { aStatus: 'completed', bStatus: 'completed', stars: 2 },
      lineEdges: { aStatus: 'ready', bStatus: 'locked' },
      // insertModes/changeDelete/yankPut absent → locked
    },
  }
  const entries = buildDex(progress)
  const get = (motion: string) => entries.find((e) => e.motion === motion)!

  it('marks 3-starred units as mastered', () => {
    expect(get('h').status).toBe('mastered')
  })
  it('marks completed-but-not-3-star units as learning', () => {
    expect(get('w').status).toBe('learning')
  })
  it('marks reachable-but-unfinished units as learning', () => {
    expect(get('0').status).toBe('learning')
  })
  it('marks unreached units as locked', () => {
    expect(get('i').status).toBe('locked')
    expect(get('yy').status).toBe('locked')
  })
})

describe('dexSummary', () => {
  it('counts discovered and mastered honestly', () => {
    const entries = buildDex({
      units: {
        hjkl: { aStatus: 'completed', bStatus: 'completed', stars: 3 },
        wbe: { aStatus: 'ready', bStatus: 'locked' },
      },
    })
    const s = dexSummary(entries)
    expect(s.total).toBe(dexCatalog.length)
    expect(s.mastered).toBe(4) // h j k l
    expect(s.discovered).toBe(7) // hjkl(4) + wbe(3)
  })
})
