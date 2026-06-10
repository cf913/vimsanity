import { describe, it, expect, beforeEach } from 'vitest'
import {
  loadProgress,
  saveProgress,
  resetProgress,
  markStageCompleted,
  getUnitProgress,
  initialProgressFor,
  justGraduated,
} from './progress'
import { STORAGE_KEY } from './types'
import type { Progress } from './types'

beforeEach(() => {
  localStorage.clear()
})

describe('initialProgressFor', () => {
  it('returns the first unit ready and the rest locked', () => {
    const p = initialProgressFor(['hjkl', 'wbe', 'lineEdges'])
    expect(p.units.hjkl).toEqual({ aStatus: 'ready', bStatus: 'locked' })
    expect(p.units.wbe).toEqual({ aStatus: 'locked', bStatus: 'locked' })
    expect(p.units.lineEdges).toEqual({ aStatus: 'locked', bStatus: 'locked' })
  })
})

describe('save and load round-trip', () => {
  it('persists progress through localStorage', () => {
    const p = initialProgressFor(['hjkl'])
    saveProgress(p)
    const loaded = loadProgress(['hjkl'])
    expect(loaded).toEqual(p)
  })

  it('falls back to initialProgressFor when storage is empty', () => {
    const loaded = loadProgress(['hjkl'])
    expect(loaded.units.hjkl.aStatus).toBe('ready')
  })

  it('falls back when storage contains malformed JSON', () => {
    localStorage.setItem(STORAGE_KEY, 'not json')
    const loaded = loadProgress(['hjkl'])
    expect(loaded.units.hjkl.aStatus).toBe('ready')
  })
})

describe('loadProgress migration', () => {
  it('adds entries for new units the persisted state has never seen', () => {
    saveProgress({ units: { hjkl: { aStatus: 'completed', bStatus: 'completed' } } })
    const loaded = loadProgress(['hjkl', 'wbe', 'lineEdges'])
    expect(loaded.units.wbe).toBeDefined()
    expect(loaded.units.lineEdges).toBeDefined()
  })

  it('unlocks the unit after the last completed one', () => {
    saveProgress({ units: { hjkl: { aStatus: 'completed', bStatus: 'completed' } } })
    const loaded = loadProgress(['hjkl', 'wbe', 'lineEdges'])
    expect(loaded.units.wbe.aStatus).toBe('ready')
    expect(loaded.units.lineEdges.aStatus).toBe('locked')
  })

  it('cascades unlock across a chain of completed units', () => {
    saveProgress({
      units: {
        hjkl: { aStatus: 'completed', bStatus: 'completed' },
        // wbe missing entirely — represents the bug we hit in playtest:
        // user finished hjkl in v1 when wbe didn't exist yet, then
        // jumped forward via direct URL.
        lineEdges: { aStatus: 'completed', bStatus: 'completed' },
      },
    })
    const loaded = loadProgress(['hjkl', 'wbe', 'lineEdges', 'insertModes'])
    // wbe sits between two completed units; it should at minimum be ready.
    expect(loaded.units.wbe.aStatus).toBe('ready')
    expect(loaded.units.insertModes.aStatus).toBe('ready')
  })

  it('does not downgrade an already-completed unit', () => {
    saveProgress({
      units: {
        hjkl: { aStatus: 'completed', bStatus: 'completed' },
        wbe: { aStatus: 'completed', bStatus: 'completed' },
      },
    })
    const loaded = loadProgress(['hjkl', 'wbe'])
    expect(loaded.units.wbe).toEqual({ aStatus: 'completed', bStatus: 'completed' })
  })

  it('unlocks earlier locked units when a later unit has been completed (out-of-order play)', () => {
    saveProgress({
      units: {
        hjkl: { aStatus: 'ready', bStatus: 'locked' },
        insertModes: { aStatus: 'completed', bStatus: 'completed' },
      },
    })
    const loaded = loadProgress(['hjkl', 'wbe', 'lineEdges', 'insertModes'])
    expect(loaded.units.wbe.aStatus).toBe('ready')
    expect(loaded.units.lineEdges.aStatus).toBe('ready')
  })

  it('drops persisted entries for units no longer in the curriculum', () => {
    saveProgress({
      units: {
        hjkl: { aStatus: 'completed', bStatus: 'completed' },
        removed: { aStatus: 'completed', bStatus: 'completed' },
      },
    })
    const loaded = loadProgress(['hjkl'])
    expect(loaded.units.removed).toBeUndefined()
  })
})

describe('markStageCompleted', () => {
  it('marks A completed and unlocks B', () => {
    const p = initialProgressFor(['hjkl', 'wbe'])
    const next = markStageCompleted(p, 'hjkl', 'a', ['hjkl', 'wbe'])
    expect(next.units.hjkl).toEqual({ aStatus: 'completed', bStatus: 'ready' })
    expect(next.units.wbe).toEqual({ aStatus: 'locked', bStatus: 'locked' })
  })

  it('marks B completed and unlocks the next unit', () => {
    const p = markStageCompleted(initialProgressFor(['hjkl', 'wbe']), 'hjkl', 'a', ['hjkl', 'wbe'])
    const next = markStageCompleted(p, 'hjkl', 'b', ['hjkl', 'wbe'])
    expect(next.units.hjkl).toEqual({ aStatus: 'completed', bStatus: 'completed' })
    expect(next.units.wbe).toEqual({ aStatus: 'ready', bStatus: 'locked' })
  })

  it('completing the last unit does nothing extra', () => {
    let p = initialProgressFor(['hjkl'])
    p = markStageCompleted(p, 'hjkl', 'a', ['hjkl'])
    p = markStageCompleted(p, 'hjkl', 'b', ['hjkl'])
    expect(p.units.hjkl).toEqual({ aStatus: 'completed', bStatus: 'completed' })
  })
})

describe('resetProgress', () => {
  it('clears localStorage', () => {
    saveProgress(initialProgressFor(['hjkl']))
    resetProgress()
    expect(localStorage.getItem(STORAGE_KEY)).toBeNull()
  })
})

describe('getUnitProgress', () => {
  it('returns the per-unit record', () => {
    const p = initialProgressFor(['hjkl'])
    expect(getUnitProgress(p, 'hjkl')).toEqual({ aStatus: 'ready', bStatus: 'locked' })
  })
  it('returns a locked record for unknown ids', () => {
    const p = initialProgressFor(['hjkl'])
    expect(getUnitProgress(p, 'unknown')).toEqual({ aStatus: 'locked', bStatus: 'locked' })
  })
})

describe('justGraduated', () => {
  const ids = ['hjkl', 'wbe']
  const done = { aStatus: 'completed', bStatus: 'completed' } as const

  it('is true on the not-graduated → graduated transition', () => {
    const before: Progress = {
      units: { hjkl: done, wbe: { aStatus: 'completed', bStatus: 'ready' } },
    }
    const after: Progress = { units: { hjkl: done, wbe: done } }
    expect(justGraduated(before, after, ids)).toBe(true)
  })

  it('is false when the player was already graduated (e.g. replay)', () => {
    const grad: Progress = { units: { hjkl: done, wbe: done } }
    expect(justGraduated(grad, grad, ids)).toBe(false)
  })

  it('is false when an earlier unit completes but others remain', () => {
    const before: Progress = {
      units: {
        hjkl: { aStatus: 'completed', bStatus: 'ready' },
        wbe: { aStatus: 'locked', bStatus: 'locked' },
      },
    }
    const after: Progress = {
      units: { hjkl: done, wbe: { aStatus: 'ready', bStatus: 'locked' } },
    }
    expect(justGraduated(before, after, ids)).toBe(false)
  })

  it('is false for an empty curriculum', () => {
    expect(justGraduated({ units: {} }, { units: {} }, [])).toBe(false)
  })
})
