// ─────────────────────────── Motion Dex ───────────────────────────
// The "Pokédex of vim motions" from the 2.0 design: a card per motion the
// curriculum teaches. Discovery is HONEST — derived from real unit progress,
// not a separate tracker: a motion is revealed once its teaching unit is
// reachable, and "mastered" once that unit is 3-starred.
//
// The catalog is hand-authored (keys + descriptions) but kept in lock-step with
// the unit registry by a test that asserts every unit's motionLabel token has a
// matching entry (see dex.test.ts). Pure + dependency-light so it stays testable.

import type { Progress } from '../../../state/types'

export type DexStatus = 'mastered' | 'learning' | 'locked'
export type DexCategory = 'move' | 'word' | 'line' | 'mode' | 'edit' | 'yank'

export interface DexMotion {
  /** The motion keys, e.g. 'h', 'dw', 'ciw'. */
  motion: string
  name: string
  desc: string
  category: DexCategory
  /** The unit that teaches this motion (drives discovery). */
  unitId: string
}

export interface DexEntry extends DexMotion {
  status: DexStatus
}

export const CATEGORY_LABEL: Record<DexCategory, string> = {
  move: 'Movement',
  word: 'Word motion',
  line: 'Line motion',
  mode: 'Modes',
  edit: 'Editing',
  yank: 'Yank & Put',
}

export const dexCatalog: DexMotion[] = [
  // hjkl — Movement
  { motion: 'h', name: 'Left', desc: 'Move one column left.', category: 'move', unitId: 'hjkl' },
  { motion: 'j', name: 'Down', desc: 'Move one line down.', category: 'move', unitId: 'hjkl' },
  { motion: 'k', name: 'Up', desc: 'Move one line up.', category: 'move', unitId: 'hjkl' },
  { motion: 'l', name: 'Right', desc: 'Move one column right.', category: 'move', unitId: 'hjkl' },
  // wbe — Word motion
  { motion: 'w', name: 'Word forward', desc: 'Jump to the start of the next word.', category: 'word', unitId: 'wbe' },
  { motion: 'b', name: 'Word back', desc: 'Jump back to the start of the previous word.', category: 'word', unitId: 'wbe' },
  { motion: 'e', name: 'Word end', desc: 'Jump to the end of the current or next word.', category: 'word', unitId: 'wbe' },
  // lineEdges — Line motion
  { motion: '0', name: 'Line start', desc: 'Jump to the first column of the line.', category: 'line', unitId: 'lineEdges' },
  { motion: '$', name: 'Line end', desc: 'Jump to the last character of the line.', category: 'line', unitId: 'lineEdges' },
  { motion: '^', name: 'First non-blank', desc: 'Jump to the first non-whitespace character.', category: 'line', unitId: 'lineEdges' },
  // insertModes — Modes
  { motion: 'i', name: 'Insert', desc: 'Enter insert mode before the cursor.', category: 'mode', unitId: 'insertModes' },
  { motion: 'a', name: 'Append', desc: 'Enter insert mode after the cursor.', category: 'mode', unitId: 'insertModes' },
  { motion: 'o', name: 'Open below', desc: 'Open a new line below and start inserting.', category: 'mode', unitId: 'insertModes' },
  { motion: 'O', name: 'Open above', desc: 'Open a new line above and start inserting.', category: 'mode', unitId: 'insertModes' },
  { motion: 'Esc', name: 'Normal mode', desc: 'Leave insert mode, return to normal mode.', category: 'mode', unitId: 'insertModes' },
  // changeDelete — Editing
  { motion: 'x', name: 'Delete char', desc: 'Delete the character under the cursor.', category: 'edit', unitId: 'changeDelete' },
  { motion: 'dw', name: 'Delete word', desc: 'Delete from the cursor to the next word.', category: 'edit', unitId: 'changeDelete' },
  { motion: 'dd', name: 'Delete line', desc: 'Delete the whole current line.', category: 'edit', unitId: 'changeDelete' },
  { motion: 'D', name: 'Delete to EOL', desc: 'Delete from the cursor to the end of the line.', category: 'edit', unitId: 'changeDelete' },
  { motion: 'cw', name: 'Change word', desc: 'Delete a word and drop into insert mode.', category: 'edit', unitId: 'changeDelete' },
  { motion: 'C', name: 'Change to EOL', desc: 'Delete to end of line and insert.', category: 'edit', unitId: 'changeDelete' },
  // yankPut — Yank & Put
  { motion: 'yy', name: 'Yank line', desc: 'Copy the whole current line.', category: 'yank', unitId: 'yankPut' },
  { motion: 'yw', name: 'Yank word', desc: 'Copy from the cursor to the next word.', category: 'yank', unitId: 'yankPut' },
  { motion: 'p', name: 'Put after', desc: 'Paste after the cursor / below the line.', category: 'yank', unitId: 'yankPut' },
  { motion: 'P', name: 'Put before', desc: 'Paste before the cursor / above the line.', category: 'yank', unitId: 'yankPut' },
]

/** Derive each motion's discovery status from persisted unit progress. */
export function buildDex(progress: Progress): DexEntry[] {
  return dexCatalog.map((m) => {
    const up = progress.units[m.unitId]
    let status: DexStatus = 'locked'
    if (up) {
      if (up.bStatus === 'completed') status = (up.stars ?? 0) >= 3 ? 'mastered' : 'learning'
      else if (up.aStatus !== 'locked') status = 'learning'
    }
    return { ...m, status }
  })
}

export interface DexSummary {
  discovered: number
  mastered: number
  total: number
}

export function dexSummary(entries: DexEntry[]): DexSummary {
  return {
    discovered: entries.filter((e) => e.status !== 'locked').length,
    mastered: entries.filter((e) => e.status === 'mastered').length,
    total: entries.length,
  }
}
