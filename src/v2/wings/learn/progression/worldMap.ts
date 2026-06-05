// World-map display metadata for Learn units. This is PRESENTATION data only —
// it lives outside the engine-pure `Unit` type (units/types.ts) so the engine
// never depends on layout/blurb/reward concerns. Keyed by unit id; the display
// label + motion come from the Unit itself (single source of truth).

import { units } from '../units/registry'

/** A node position on the abstract world-map grid (col, row). */
export interface MapNode {
  c: number
  r: number
}

export interface WorldMapMeta {
  node: MapNode
  /** One-line, friendly description shown in the selected-node panel. */
  blurb: string
  /** Short reward/why-it-matters line. */
  rewardBlurb?: string
}

// Coordinates form a readable winding path left→right. Row 0 is top.
export const worldMapMeta: Record<string, WorldMapMeta> = {
  hjkl: {
    node: { c: 1, r: 5 },
    blurb: 'The four horsemen of the cursor. Move left, down, up, right — no arrow keys.',
    rewardBlurb: 'Used in literally every motion that follows.',
  },
  wbe: {
    node: { c: 3, r: 5 },
    blurb: 'Hop word by word instead of crawling character by character. Start, back, end.',
    rewardBlurb: 'Travel across a line in a handful of keys.',
  },
  lineEdges: {
    node: { c: 5, r: 4 },
    blurb: 'Snap to column zero, the first real character, or the end of the line.',
    rewardBlurb: 'Where most edits begin and end.',
  },
  insertModes: {
    node: { c: 7, r: 4 },
    blurb: 'Drop into insert mode the right way: before, after, or on a fresh line.',
    rewardBlurb: 'Required for every edit you will ever make.',
  },
  changeDelete: {
    node: { c: 7, r: 2 },
    blurb: 'Delete and change with operators + motions. The heart of refactoring.',
    rewardBlurb: 'Turn messy text into clean text, fast.',
  },
  yankPut: {
    node: { c: 9, r: 2 },
    blurb: 'Copy and paste, vim style. Yank a line or word, put it before or after.',
    rewardBlurb: 'Move and duplicate without ever touching the mouse.',
  },
  textObjects: {
    node: { c: 11, r: 3 },
    blurb: 'Operate on a whole word wherever the cursor sits: diw, daw, ciw, caw.',
    rewardBlurb: 'Edit a word without aiming at its edges.',
  },
}

// Future, non-unit decorative nodes (rendered as locked "coming soon").
// Extension point for the deferred Motion Dex / Boss content.
export interface FutureNode extends MapNode {
  id: string
  kind: 'dex' | 'boss'
  label: string
}

export const futureNodes: FutureNode[] = [
  { id: 'boss', kind: 'boss', label: 'BOSS · refactor', c: 11, r: 1 },
]

// Dev-time invariant: every unit must have map metadata, and vice versa.
if (import.meta.env?.DEV) {
  const unitIds = new Set(units.map((u) => u.id))
  const metaIds = new Set(Object.keys(worldMapMeta))
  for (const id of unitIds) {
    if (!metaIds.has(id)) console.warn(`[worldMap] unit "${id}" has no map metadata`)
  }
  for (const id of metaIds) {
    if (!unitIds.has(id)) console.warn(`[worldMap] map metadata "${id}" has no matching unit`)
  }
}
