import { units, findUnit } from '../units/registry'
import { worldMapMeta, type WorldMapMeta } from './worldMap'
import type { Unit } from '../units/types'

export * from './score'
export * from './xp'
export * from './badges'
export * from './calendar'
export { worldMapMeta, futureNodes, type WorldMapMeta, type MapNode, type FutureNode } from './worldMap'

export function getMeta(unitId: string): WorldMapMeta | undefined {
  return worldMapMeta[unitId]
}

export interface OrderedNode {
  unit: Unit
  meta: WorldMapMeta
}

/** Units in curriculum order, paired with their map metadata (skips any without meta). */
export function orderedNodes(): OrderedNode[] {
  return units
    .map((unit) => ({ unit, meta: worldMapMeta[unit.id] }))
    .filter((n): n is OrderedNode => Boolean(n.meta))
}

/** Path edges between consecutive units (by id) for the dashed connectors. */
export function pathEdges(): Array<[string, string]> {
  const nodes = orderedNodes()
  const edges: Array<[string, string]> = []
  for (let i = 0; i < nodes.length - 1; i++) {
    edges.push([nodes[i].unit.id, nodes[i + 1].unit.id])
  }
  return edges
}

export { findUnit }
