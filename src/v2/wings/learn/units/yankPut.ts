import type { Unit } from './types'

// Previously-learned motions stay available plus the new keys.
const MOVES = ['h', 'j', 'k', 'l', 'w', 'b', 'e', '0', '$', '^']
const INSERT = ['i', 'a', 'o', 'O', 'Escape']
const EDIT = ['x', 'd', 'D', 'c', 'C']
const NEW = ['y', 'p', 'P']

export const yankPutUnit: Unit = {
  id: 'yankPut',
  title: 'Yank & Put',
  motionLabel: 'yy yw p P',
  aStage: {
    kind: 'a-drill-edit',
    allowedKeys: [...MOVES, ...INSERT, ...EDIT, ...NEW],
    challenges: [
      {
        id: 'yp-yy-p',
        hint: "Duplicate the line below it using `yy` + `p`.",
        startText: 'todo',
        startCursorIndex: 0,
        goal: { text: 'todo\ntodo' },
      },
      {
        id: 'yp-yy-P',
        hint: "Duplicate the line above it using `yy` + `P`.",
        startText: 'note',
        startCursorIndex: 0,
        goal: { text: 'note\nnote' },
      },
      {
        id: 'yp-yw-P',
        hint: "Duplicate 'foo' inline using `yw` + `P`.",
        startText: 'foo bar',
        startCursorIndex: 0,
        goal: { text: 'foo foo bar' },
      },
      {
        id: 'yp-yy-j-p',
        hint: "Copy the first line and paste it below the second using `yy` + `j` + `p`.",
        startText: 'header\nbody',
        startCursorIndex: 0,
        goal: { text: 'header\nbody\nheader' },
      },
    ],
  },
  bStage: {
    kind: 'b-check-edit-puzzles',
    allowedKeys: [...MOVES, ...INSERT, ...EDIT, ...NEW],
    puzzles: [
      {
        id: 'yankPut-b1',
        hint: "Duplicate 'red' inline.",
        startText: 'red blue',
        startCursorIndex: 0,
        goal: { text: 'red red blue' },
        // y w P = 3
        par: 3,
      },
      {
        id: 'yankPut-b2',
        hint: "Duplicate the middle line.",
        startText: 'alpha\nbeta\ngamma',
        startCursorIndex: 6,
        goal: { text: 'alpha\nbeta\nbeta\ngamma' },
        // y y p = 3
        par: 3,
      },
      {
        id: 'yankPut-b3',
        hint: "Duplicate the first line above itself.",
        startText: 'header\nbody',
        startCursorIndex: 0,
        goal: { text: 'header\nheader\nbody' },
        // y y P = 3
        par: 3,
      },
    ],
  },
}
