// The daily-challenge pool. One puzzle is chosen deterministically per calendar
// date (see daily.ts), so everyone gets the same puzzle on the same day with no
// server/accounts. Each daily reuses the editable engine (a single-puzzle
// BEditStageDef), drawing on motions taught across the whole curriculum.

import type { BEditStageDef } from '../learn/units/types'

export interface DailyPuzzle {
  id: string
  /** Short flavor for the header. */
  theme: string
  stage: BEditStageDef
}

const MOVES = ['h', 'j', 'k', 'l', 'w', 'b', 'e', '0', '$', '^']
const INSERT = ['i', 'a', 'o', 'O', 'Escape']
const EDIT = ['x', 'd', 'D', 'c', 'C']
const YANK = ['y', 'p', 'P']
const ALL = [...MOVES, ...INSERT, ...EDIT, ...YANK]

function edit(id: string, theme: string, hint: string, startText: string, startCursorIndex: number, goalText: string, par: number): DailyPuzzle {
  return {
    id,
    theme,
    stage: {
      kind: 'b-check-edit-puzzles',
      allowedKeys: ALL,
      puzzles: [{ id, hint, startText, startCursorIndex, goal: { text: goalText }, par }],
    },
  }
}

export const dailyPool: DailyPuzzle[] = [
  edit('daily-dd', 'Line surgery', 'Delete the middle line.', 'alpha\nREMOVE\nbeta', 6, 'alpha\nbeta', 2), // dd
  edit('daily-dw', 'Trim the prefix', "Drop the leading 'just '.", 'just do it', 0, 'do it', 2), // dw
  edit('daily-x', 'Typo hunt', "Delete the extra '!'.", 'hello!!', 5, 'hello!', 1), // x
  edit('daily-cw', 'Rename', "Change 'left' to 'right'.", 'go left now', 3, 'go right now', 8), // cw right <Esc>
  edit('daily-yyp', 'Duplicate', 'Duplicate the line below it.', 'duplicate', 0, 'duplicate\nduplicate', 3), // yy p
  edit('daily-ywP', 'Echo', "Duplicate 'sing' inline.", 'sing song', 0, 'sing sing song', 3), // yw P
  edit('daily-swap', 'Swap lines', 'Move the first line below the second.', 'one\ntwo', 0, 'two\none', 3), // dd p
  edit('daily-dup-word', 'De-dup', "Remove the duplicated 'the'.", 'the the cat', 0, 'the cat', 2), // dw
]
