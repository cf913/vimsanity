import type { Unit } from './types'

// Full motion set carries over; text objects add the i/a selectors on top of
// the existing operators.
const MOVES = ['h', 'j', 'k', 'l', 'w', 'b', 'e', '0', '$', '^']
const INSERT = ['i', 'a', 'o', 'O', 'Escape']
const EDIT = ['x', 'd', 'D', 'c', 'C']
const YANK = ['y', 'p', 'P']
const ALL = [...MOVES, ...INSERT, ...EDIT, ...YANK]

export const textObjectsUnit: Unit = {
  id: 'textObjects',
  title: 'Text Objects',
  motionLabel: 'diw daw ciw caw',
  aStage: {
    kind: 'a-drill-edit',
    allowedKeys: ALL,
    challenges: [
      {
        id: 'to-diw',
        hint: "Delete the inner word with `diw` — the spaces stay (cursor is mid-word).",
        startText: 'foo bar baz',
        startCursorIndex: 5,
        goal: { text: 'foo  baz' },
      },
      {
        id: 'to-daw',
        hint: "Delete a word with `daw` — takes the trailing space too.",
        startText: 'foo bar baz',
        startCursorIndex: 5,
        goal: { text: 'foo baz' },
      },
      {
        id: 'to-ciw',
        hint: "Change the whole word with `ciw`, then type `cat`.",
        startText: 'the kat sat',
        startCursorIndex: 5,
        goal: { text: 'the cat sat' },
      },
      {
        id: 'to-caw',
        hint: "Change a word with `caw`, then type `hey ` (with a space).",
        startText: 'say hi there',
        startCursorIndex: 5,
        goal: { text: 'say hey there' },
      },
    ],
  },
  bStage: {
    kind: 'b-check-edit-puzzles',
    allowedKeys: ALL,
    puzzles: [
      {
        id: 'textObjects-b1',
        hint: 'Delete the SHOUTING word (cursor is inside it).',
        startText: 'keep DROP keep',
        startCursorIndex: 7,
        goal: { text: 'keep keep' },
        // d a w = 3
        par: 3,
      },
      {
        id: 'textObjects-b2',
        hint: "Change 'bg' to 'fg'.",
        startText: 'fix the bg',
        startCursorIndex: 8,
        goal: { text: 'fix the fg' },
        // c i w f g Esc = 6
        par: 6,
      },
      {
        id: 'textObjects-b3',
        hint: "Change 'and' to 'or'.",
        startText: 'red and blue',
        startCursorIndex: 5,
        goal: { text: 'red or blue' },
        // c a w o r <space> Esc = 7
        par: 7,
      },
    ],
  },
}
