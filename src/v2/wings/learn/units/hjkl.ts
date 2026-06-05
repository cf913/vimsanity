import type { Unit } from './types'

export const hjklUnit: Unit = {
  id: 'hjkl',
  title: 'Basic Movement',
  motionLabel: 'h j k l',
  aStage: {
    kind: 'a-drill-grid',
    gridWidth: 10,
    gridHeight: 6,
    startCursor: { x: 0, y: 0 },
    targetCount: 20,
    allowedKeys: ['h', 'j', 'k', 'l'],
  },
  bStage: {
    kind: 'b-check-cursor-puzzles',
    allowedKeys: ['h', 'j', 'k', 'l'],
    puzzles: [
      {
        id: 'hjkl-b1',
        gridWidth: 6,
        gridHeight: 4,
        start: { x: 0, y: 0 },
        goal: { x: 5, y: 3 },
        par: 8,
      },
      {
        id: 'hjkl-b2',
        gridWidth: 8,
        gridHeight: 4,
        start: { x: 0, y: 2 },
        goal: { x: 7, y: 0 },
        par: 9,
      },
      {
        id: 'hjkl-b3',
        gridWidth: 6,
        gridHeight: 5,
        start: { x: 3, y: 2 },
        goal: { x: 0, y: 4 },
        par: 5,
      },
    ],
  },
}
