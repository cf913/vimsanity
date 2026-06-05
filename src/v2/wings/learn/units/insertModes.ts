import type { Unit } from './types'

// Allowed keys mirror previously-learned units plus the new ones.
// (Per the lineEdges precedent: previously-learned motions stay available.)
const MOVES = ['h', 'j', 'k', 'l', 'w', 'b', 'e', '0', '$', '^']
const NEW = ['i', 'a', 'o', 'O', 'Escape']

export const insertModesUnit: Unit = {
  id: 'insertModes',
  title: 'Insert Modes',
  motionLabel: 'i a o O Esc',
  aStage: {
    kind: 'a-drill-edit',
    allowedKeys: [...MOVES, ...NEW],
    challenges: [
      {
        id: 'insert-i',
        hint: "Insert 'pre' before the word using `i`.",
        startText: 'word',
        startCursorIndex: 0,
        goal: { text: 'preword' },
      },
      {
        id: 'insert-a',
        hint: "Append 'ed' to the word using `a`.",
        startText: 'walk',
        startCursorIndex: 3,
        goal: { text: 'walked' },
      },
      {
        id: 'insert-o',
        hint: "Open a line below and add 'beta' using `o`.",
        startText: 'alpha\ngamma',
        startCursorIndex: 0,
        goal: { text: 'alpha\nbeta\ngamma' },
      },
      {
        id: 'insert-O',
        hint: "Open a line above and add 'title' using `O`.",
        startText: 'body',
        startCursorIndex: 0,
        goal: { text: 'title\nbody' },
      },
    ],
  },
  bStage: {
    kind: 'b-check-edit-puzzles',
    allowedKeys: [...MOVES, ...NEW],
    puzzles: [
      {
        id: 'insertModes-b1',
        hint: "Pluralize 'apple' to 'apples'.",
        startText: 'apple banana',
        startCursorIndex: 0,
        goal: { text: 'apples banana' },
        // e (to end of apple) + a + s + Escape = 4
        par: 4,
      },
      {
        id: 'insertModes-b2',
        hint: "Add a comma after 'foo'.",
        startText: 'foo bar',
        startCursorIndex: 0,
        goal: { text: 'foo, bar' },
        // e (to end of foo) + a + ',' + Escape = 4
        par: 4,
      },
      {
        id: 'insertModes-b3',
        hint: "Add a 'title' line above 'body'.",
        startText: 'body',
        startCursorIndex: 0,
        goal: { text: 'title\nbody' },
        // O + t + i + t + l + e + Escape = 7
        par: 7,
      },
    ],
  },
}
