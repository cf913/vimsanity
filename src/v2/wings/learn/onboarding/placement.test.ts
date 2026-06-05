import { describe, it, expect } from 'vitest'
import { recommendUnitIndex } from './placement'

const N = 6

describe('recommendUnitIndex', () => {
  it('starts a total beginner at unit 0', () => {
    expect(recommendUnitIndex({ used: 'never', movement: false, operators: 'no' }, N)).toBe(0)
  })
  it('places someone comfortable with movement at least at lineEdges', () => {
    expect(recommendUnitIndex({ used: 'some', movement: true, operators: 'no' }, N)).toBe(2)
  })
  it('places an operator user at changeDelete', () => {
    expect(recommendUnitIndex({ used: 'daily', movement: true, operators: 'some' }, N)).toBe(3)
    expect(recommendUnitIndex({ used: 'daily', movement: true, operators: 'yes' }, N)).toBe(4)
  })
  it('never recommends past changeDelete (always something left)', () => {
    expect(recommendUnitIndex({ used: 'daily', movement: true, operators: 'yes' }, N)).toBeLessThanOrEqual(4)
  })
  it('clamps to the available units', () => {
    expect(recommendUnitIndex({ used: 'daily', movement: true, operators: 'yes' }, 3)).toBe(2)
  })
})
