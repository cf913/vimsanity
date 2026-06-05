// Apply capstones — themed, multi-step "missions" that apply the learned motions
// to realistic little refactors. Each mission is a multi-puzzle editable stage
// (Vimgolf++ exact-goal), reusing the same engine as Learn's B-checks.

import type { BEditStageDef, BEditPuzzle } from '../learn/units/types'

export interface ApplyMission {
  id: string
  title: string
  blurb: string
  stage: BEditStageDef
}

const MOVES = ['h', 'j', 'k', 'l', 'w', 'b', 'e', '0', '$', '^']
const INSERT = ['i', 'a', 'o', 'O', 'Escape']
const EDIT = ['x', 'd', 'D', 'c', 'C']
const YANK = ['y', 'p', 'P']
const ALL = [...MOVES, ...INSERT, ...EDIT, ...YANK]

function p(id: string, hint: string, startText: string, startCursorIndex: number, goalText: string, par: number): BEditPuzzle {
  return { id, hint, startText, startCursorIndex, goal: { text: goalText }, par }
}

function mission(id: string, title: string, blurb: string, puzzles: BEditPuzzle[]): ApplyMission {
  return { id, title, blurb, stage: { kind: 'b-check-edit-puzzles', allowedKeys: ALL, puzzles } }
}

export const missions: ApplyMission[] = [
  mission('tidy', 'Tidy the TODOs', 'Clean a scratch list: drop a line, trim a prefix, fix a typo.', [
    p('tidy-1', 'Delete the TODO line.', 'ship it\nTODO: remove\nship it', 8, 'ship it\nship it', 2), // dd
    p('tidy-2', "Drop the leading 'TODO '.", 'TODO fix later', 0, 'fix later', 2), // dw
    p('tidy-3', "Delete the extra 'e'.", 'donee', 4, 'done', 1), // x
  ]),
  mission('rename', 'Rename refactor', 'Rename a variable, remove a duplicate word, copy a row.', [
    p('rename-1', "Change 'foo' to 'bar'.", 'let foo = 1', 4, 'let bar = 1', 6), // cw bar <Esc>
    p('rename-2', "Remove the duplicated 'the'.", 'the the end', 0, 'the end', 2), // dw
    p('rename-3', 'Duplicate the line below it.', 'row', 0, 'row\nrow', 3), // yy p
  ]),
  mission('arrange', 'Duplicate & arrange', 'Echo a word, swap two lines, clone a heading.', [
    p('arrange-1', "Duplicate 'go' inline.", 'go team', 0, 'go go team', 3), // yw P
    p('arrange-2', 'Move the first line below the second.', 'b\na', 0, 'a\nb', 3), // dd p
    p('arrange-3', 'Duplicate the heading above itself.', 'title', 0, 'title\ntitle', 3), // yy P
  ]),
]

export function findMission(id: string): ApplyMission | undefined {
  return missions.find((m) => m.id === id)
}

/** Total par for a mission (sum of puzzle pars). */
export function missionPar(m: ApplyMission): number {
  return m.stage.puzzles.reduce((s, q) => s + q.par, 0)
}
