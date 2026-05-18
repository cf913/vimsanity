import type { Unit } from './types'
import { hjklUnit } from './hjkl'

export const units: Unit[] = [hjklUnit]

export function findUnit(id: string): Unit | undefined {
  return units.find((u) => u.id === id)
}
