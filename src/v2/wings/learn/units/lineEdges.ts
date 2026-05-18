import type { Unit } from './types'

export const lineEdgesUnit: Unit = {
  id: 'lineEdges',
  title: 'Line Edges',
  motionLabel: '0 $ ^',
  aStage: {
    kind: 'a-drill-text',
    text: '  indented line one\nsecond line here\n  third line indented\nfourth',
    startCursorIndex: 0,
    targetCount: 8,
    allowedKeys: ['0', '$', '^'],
  },
  bStage: {
    kind: 'b-check-text-puzzles',
    allowedKeys: ['0', '$', '^'],
    puzzles: [
      {
        id: 'lineEdges-b1',
        text: 'a short line',
        startCursorIndex: 5,
        goalIndex: 11,
        par: 1,
      },
      {
        id: 'lineEdges-b2',
        text: '   leading spaces here',
        startCursorIndex: 19,
        goalIndex: 3,
        par: 1,
      },
      {
        id: 'lineEdges-b3',
        text: 'line one\nline two\n  line three',
        startCursorIndex: 27,
        goalIndex: 20,
        par: 1,
      },
    ],
  },
}
