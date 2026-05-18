import type { Unit } from './types'
import { hjklUnit } from './hjkl'
import { wbeUnit } from './wbe'
import { lineEdgesUnit } from './lineEdges'

export const units: Unit[] = [hjklUnit, wbeUnit, lineEdgesUnit]

export function findUnit(id: string): Unit | undefined {
  return units.find((u) => u.id === id)
}
