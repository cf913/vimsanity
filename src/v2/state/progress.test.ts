import { describe, it, expect, beforeEach } from 'vitest'
import {
  loadProgress,
  saveProgress,
  resetProgress,
  markStageCompleted,
  getUnitProgress,
  initialProgressFor,
} from './progress'
import { STORAGE_KEY } from './types'

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
