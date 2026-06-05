import type { Unit } from './types'
import { hjklUnit } from './hjkl'
import { wbeUnit } from './wbe'
import { lineEdgesUnit } from './lineEdges'
import { insertModesUnit } from './insertModes'
import { changeDeleteUnit } from './changeDelete'
import { yankPutUnit } from './yankPut'
import { textObjectsUnit } from './textObjects'

export const units: Unit[] = [
  hjklUnit,
  wbeUnit,
  lineEdgesUnit,
  insertModesUnit,
  changeDeleteUnit,
  yankPutUnit,
  textObjectsUnit,
]

export function findUnit(id: string): Unit | undefined {
  return units.find((u) => u.id === id)
}
