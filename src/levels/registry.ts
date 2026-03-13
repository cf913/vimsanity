import React from 'react'
import KeyboardVisualizerLevel0 from '../components/levels/KeyboardVisualizerLevel0'
import GridMovementLevel from '../components/levels/GridMovementLevel'
import WordMovementLevel from '../components/levels/WordMovementLevel'
import LineOperations3 from '../components/levels/LineOperations3'
import FindChars4 from '../components/levels/FindChars4'
import SearchLevel5 from '../components/levels/SearchLevel5'
import BasicInsertLevel6 from '../components/levels/BasicInsertLevel6'
import LineInsertLevel7 from '../components/levels/LineInsertLevel7'
import UndoRedoLevel9 from '../components/levels/Level9/UndoRedoLevel9'
import BasicDeleteLevel10 from '../components/levels/BasicDeleteLevel10'
import AdvancedDeleteLevel11 from '../components/levels/AdvancedDeleteLevel11'
import RecapLevel12 from '../components/levels/RecapLevel12'
import PlaygroundLevel from '../components/levels/PlaygroundLevel'
import TextObjectLevel14 from '../components/levels/TextObjectLevel14'
import YankPutLevel15 from '../components/levels/YankPutLevel15'
import CountPrefixLevel16 from '../components/levels/CountPrefixLevel16'
import FileNavLevel17 from '../components/levels/FileNavLevel17'
import DotCommandLevel18 from '../components/levels/DotCommandLevel18'

export type LevelCategory =
  | 'intro'
  | 'navigate'
  | 'insert'
  | 'history'
  | 'delete'
  | 'yank'
  | 'advanced'
  | 'recap'
  | 'playground'

export interface LevelEntry {
  id: number
  title: string
  description: string
  category: LevelCategory
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  component: React.ComponentType<any>
  wip: boolean
  locked: boolean
}

export const levelRegistry: LevelEntry[] = [
  // --- intro ---
  {
    id: 0,
    title: 'Vim Command Explorer',
    description: 'Interactive 3D keyboard to discover what every key does',
    category: 'intro',
    component: KeyboardVisualizerLevel0,
    wip: false,
    locked: false,
  },
  // --- navigate ---
  {
    id: 1,
    title: 'Basic Movement (h, j, k, l)',
    description: 'Learn the fundamental vim motions',
    category: 'navigate',
    component: GridMovementLevel,
    wip: false,
    locked: false,
  },
  {
    id: 2,
    title: 'Word Movement (w, b, e)',
    description: 'Navigate through words efficiently',
    category: 'navigate',
    component: WordMovementLevel,
    wip: false,
    locked: false,
  },
  {
    id: 3,
    title: 'Line Operations (0, $)',
    description: 'Move to start and end of lines',
    category: 'navigate',
    component: LineOperations3,
    wip: false,
    locked: false,
  },
  {
    id: 4,
    title: 'Find Characters (f, t)',
    description: 'Jump to specific characters',
    category: 'navigate',
    component: FindChars4,
    wip: false,
    locked: false,
  },
  {
    id: 5,
    title: 'Search Operations (/, ?, n, N)',
    description: 'Search text and navigate matches',
    category: 'navigate',
    component: SearchLevel5,
    wip: false,
    locked: false,
  },
  {
    id: 16,
    title: 'Count Prefixes (5j, 3w, etc.)',
    description: 'Use numbers for efficient navigation',
    category: 'navigate',
    component: CountPrefixLevel16,
    wip: false,
    locked: false,
  },
  {
    id: 17,
    title: 'File Navigation (gg, G)',
    description: 'Jump to any line in a file instantly',
    category: 'navigate',
    component: FileNavLevel17,
    wip: false,
    locked: false,
  },
  // --- insert ---
  {
    id: 6,
    title: 'Basic Insert Mode (i, a, Esc)',
    description: 'Enter insert mode and make text changes',
    category: 'insert',
    component: BasicInsertLevel6,
    wip: false,
    locked: false,
  },
  {
    id: 7,
    title: 'Line Insert Commands (I, A, o, O)',
    description: 'Insert at line positions and create new lines',
    category: 'insert',
    component: LineInsertLevel7,
    wip: false,
    locked: false,
  },
  // --- history ---
  {
    id: 9,
    title: 'Undo & Redo (u, Ctrl+r)',
    description: 'Navigate through your editing history',
    category: 'history',
    component: UndoRedoLevel9,
    wip: false,
    locked: false,
  },
  // --- delete ---
  {
    id: 10,
    title: 'Basic Delete (x, D, C, S)',
    description: 'Master single-key delete and change commands',
    category: 'delete',
    component: BasicDeleteLevel10,
    wip: false,
    locked: false,
  },
  {
    id: 11,
    title: 'Advanced Delete (dw, dd, D)',
    description: 'Master word, line, and partial line deletion',
    category: 'delete',
    component: AdvancedDeleteLevel11,
    wip: false,
    locked: false,
  },
  {
    id: 14,
    title: 'Text Objects (diw, daw, ciw, caw)',
    description: 'Delete and change inner/around word text objects',
    category: 'delete',
    component: TextObjectLevel14,
    wip: false,
    locked: false,
  },
  // --- yank ---
  {
    id: 15,
    title: 'Yank & Put (y, p)',
    description: 'Copy and paste text with yank and put commands',
    category: 'yank',
    component: YankPutLevel15,
    wip: false,
    locked: false,
  },
  // --- advanced ---
  {
    id: 18,
    title: 'The Dot Command (.)',
    description: 'Repeat your last change with a single keystroke',
    category: 'advanced',
    component: DotCommandLevel18,
    wip: false,
    locked: false,
  },
  // --- recap ---
  {
    id: 12,
    title: 'Quick Recap',
    description: 'Review and practice all vim motions learned so far',
    category: 'recap',
    component: RecapLevel12,
    wip: false,
    locked: false,
  },
  // --- playground ---
  {
    id: 13,
    title: 'Dev Playground',
    description: 'Practice all Vim motions in a free environment',
    category: 'playground',
    component: PlaygroundLevel,
    wip: false,
    locked: false,
  },
]

/** Get levels grouped by category (preserving insertion order) */
export function getLevelsByCategory(): Record<LevelCategory, LevelEntry[]> {
  const result = {} as Record<LevelCategory, LevelEntry[]>
  for (const entry of levelRegistry) {
    if (!result[entry.category]) result[entry.category] = []
    result[entry.category].push(entry)
  }
  return result
}

/** Find a level entry by its numeric ID */
export function getLevelById(id: number): LevelEntry | undefined {
  return levelRegistry.find((l) => l.id === id)
}
