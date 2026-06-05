import type { Unit } from './types'

// Previously-learned motions stay available plus the new operators
// and insert-mode entries (needed for cw to be solvable).
const MOVES = ['h', 'j', 'k', 'l', 'w', 'b', 'e', '0', '$', '^']
const INSERT = ['i', 'a', 'o', 'O', 'Escape']
const NEW = ['x', 'd', 'D', 'c', 'C']

export const changeDeleteUnit: Unit = {
  id: 'changeDelete',
  title: 'Change & Delete',
  motionLabel: 'x dw dd D cw C',
  aStage: {
    kind: 'a-drill-edit',
    allowedKeys: [...MOVES, ...INSERT, ...NEW],
    challenges: [
      {
        id: 'cd-x',
        hint: "Delete the stray 'q' with `x`.",
        startText: 'fooqbar',
        startCursorIndex: 3,
        goal: { text: 'foobar' },
      },
      {
        id: 'cd-dw',
        hint: "Delete the word 'quick' with `dw`.",
        startText: 'the quick brown',
        startCursorIndex: 4,
        goal: { text: 'the brown' },
      },
      {
        id: 'cd-D',
        hint: "Delete from cursor to end of line with `D`.",
        startText: 'keep me drop this',
        startCursorIndex: 7,
        goal: { text: 'keep me' },
      },
      {
        id: 'cd-cw',
        hint: "Change 'old' to 'new' with `cw`.",
        startText: 'the old fox',
        startCursorIndex: 4,
        goal: { text: 'the new fox' },
      },
      {
        id: 'cd-dd',
        hint: "Delete the middle line with `dd`.",
        startText: 'alpha\nbeta\ngamma',
        startCursorIndex: 6,
        goal: { text: 'alpha\ngamma' },
      },
    ],
  },
  bStage: {
    kind: 'b-check-edit-puzzles',
    allowedKeys: [...MOVES, ...INSERT, ...NEW],
    puzzles: [
      {
        id: 'changeDelete-b1',
        hint: "Delete the leading 'I '.",
        startText: 'I love coding',
        startCursorIndex: 0,
        goal: { text: 'love coding' },
        // d + w = 2
        par: 2,
      },
      {
        id: 'changeDelete-b2',
        hint: "Replace 'old' with 'new'.",
        startText: 'the old fox',
        startCursorIndex: 0,
        goal: { text: 'the new fox' },
        // w + c + w + n + e + w + Escape = 7
        par: 7,
      },
      {
        id: 'changeDelete-b3',
        hint: "Delete the middle line.",
        startText: 'keep\ndrop\nkeep',
        startCursorIndex: 5,
        goal: { text: 'keep\nkeep' },
        // d + d = 2
        par: 2,
      },
    ],
  },
}
