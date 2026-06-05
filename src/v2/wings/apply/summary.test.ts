import { describe, it, expect } from 'vitest'
import { applySummary } from './summary'
import type { ApplyStore } from '../../state/apply'

const IDS = ['tidy', 'rename', 'arrange']

function store(recs: Record<string, { stars: number }>): ApplyStore {
  const missions: ApplyStore['missions'] = {}
  for (const [id, r] of Object.entries(recs)) {
    missions[id] = { stars: r.stars, bestKeystrokes: 10, bestScore: 1000 }
  }
  return { missions }
}

describe('applySummary', () => {
  it('counts cleared missions and total stars', () => {
    const s = applySummary(store({ tidy: { stars: 3 }, rename: { stars: 2 } }), IDS)
    expect(s).toEqual({ cleared: 2, total: 3, stars: 5, maxStars: 9 })
  })
  it('is empty with no records', () => {
    expect(applySummary({ missions: {} }, IDS)).toEqual({ cleared: 0, total: 3, stars: 0, maxStars: 9 })
  })
})
