import type { Unit } from './types'

export const wbeUnit: Unit = {
  id: 'wbe',
  title: 'Word Motions',
  motionLabel: 'w b e',
  aStage: {
    kind: 'a-drill-text',
    text: 'the quick brown fox jumps over the lazy dog by the river bank',
    startCursorIndex: 0,
    targetCount: 12,
    allowedKeys: ['w', 'b', 'e'],
  },
  bStage: {
    kind: 'b-check-text-puzzles',
    allowedKeys: ['w', 'b', 'e'],
    puzzles: [
      {
        id: 'wbe-b1',
        text: 'the quick brown fox',
        startCursorIndex: 0,
        goalIndex: 16,
        par: 3,
      },
      {
        id: 'wbe-b2',
        text: 'function name(arg)',
        startCursorIndex: 0,
        goalIndex: 14,
        par: 3,
      },
      {
        id: 'wbe-b3',
        text: 'the quick brown fox jumps',
        startCursorIndex: 20,
        goalIndex: 4,
        par: 3,
      },
    ],
  },
}
