import React, { useEffect, useState } from 'react'
import { VIM_MODES, VimMode } from '../../utils/constants'
import { useVimLevel } from '../../hooks/useVimLevel'
import { KeysAllowed } from '../common/KeysAllowed'
import ModeIndicator from '../common/ModeIndicator'
import { Cell7 } from './Level7/Cell'
import { LevelShell, LevelHeader } from '../level-blocks'

interface LineInsertLevel7Props {
  isMuted: boolean
}

interface TextLine {
  id: string
  content: string
  startIndex: number
  expected: string
  completed: boolean
}

const LineInsertLevel7: React.FC<LineInsertLevel7Props> = () => {
  const initialCells: TextLine[] = [
    {
      id: '1',
      content: "<- Don't worry, be happy.",
      expected: "PREFIX <- Don't worry, be happy.",
      startIndex: 15,
      completed: false,
    },
    {
      id: '2',
      content: 'Surely there is a faster way to insert here -> ',
      expected: 'Surely there is a faster way to insert here -> SUFFIX',
      startIndex: 0,
      completed: false,
    },
    {
      id: '3',
      content: 'middle',
      expected: 'ABOVE\nmiddle\nBELOW',
      startIndex: 5,
      completed: false,
    },
    {
      id: '4',
      content: 'Vim is actually quite',
      expected: 'ABOVE\nVim is actually quite FUN',
      startIndex: 7,
      completed: false,
    },
    {
      id: '5',
      content: 'console.log("hello world!");\n// Output: "hello world!"',
      expected:
        'BEFORE console.log("hello world!"); END\nBETWEEN\n// Output: "hello world!"\nBELOW',
      startIndex: 0,
      completed: false,
    },
  ]

  const [cells, setCells] = useState<TextLine[]>(initialCells)
  const [mode, setMode] = useState<VimMode>(VIM_MODES.NORMAL)
  const [activeCell, setActiveCell] = useState<number | null>(0)
  const [lastKeyPressed, setLastKeyPressed] = useState<string | null>(null)
  const [resetCount, setResetCount] = useState(0)

  const level = useVimLevel({
    levelId: '7-line-insert',
    maxScore: initialCells.length * 10,
    onReset: () => {
      setActiveCell(0)
      setCells(initialCells)
      setResetCount((prev) => prev + 1)
      setMode(VIM_MODES.NORMAL)
    },
  })

  // Start timer immediately
  useEffect(() => { level.activateTimer() }, [])

  // Check if all cells are completed
  useEffect(() => {
    if (cells.length > 0 && cells.every((line) => line.completed)) {
      level.completeLevel()
    }
  }, [cells, level.completeLevel])

  const isInsertMode = mode === VIM_MODES.INSERT

  return (
    <LevelShell
      level={level}
      className="flex flex-col items-center gap-4"
    >
      <div className="text-center">
        <p className="text-text-muted">
          Use <kbd className="px-2 py-1 bg-bg-secondary rounded">I</kbd> to insert
          at line start, <kbd className="px-2 py-1 bg-bg-secondary rounded">A</kbd>{' '}
          to append at line end,{' '}
          <kbd className="px-2 py-1 bg-bg-secondary rounded">o</kbd> to open line
          below, and <kbd className="px-2 py-1 bg-bg-secondary rounded">O</kbd> to
          open line above.
        </p>
      </div>

      <div className="flex items-center gap-4 mb-2">
        <LevelHeader
          title=""
          score={level.score}
          maxScore={level.maxScore}
          onReset={level.resetLevel}
        />
        <ModeIndicator isInsertMode={isInsertMode} />
      </div>

      {/* Challenge cells */}
      <div className="w-full max-w-[90vmin]">
        <div className="flex flex-col gap-4">
          {cells.map((cell, index) => (
            <Cell7
              {...{
                cell,
                isActive: activeCell === index,
                setLastKeyPressed,
                setCompletedCell: () => {
                  const updatedCells = [...cells]
                  updatedCells[index].completed = true
                  setCells(updatedCells)
                  level.setScore((prev) => prev + 10)
                  const nextCellIndex = index + 1
                  setActiveCell(nextCellIndex)
                },
                mode,
                setMode,
                resetCount,
              }}
            />
          ))}
        </div>
      </div>

      {/* Key indicators */}
      <KeysAllowed
        keys={['I', 'A', 'o', 'O', 'h', 'j', 'k', 'l']}
        lastKeyPressed={lastKeyPressed}
      />

      {/* Completion message */}
      {level.levelCompleted && (
        <div className="mt-6 p-4 bg-emerald-500/20 border border-emerald-500 rounded-lg text-center">
          <h3 className="text-xl font-bold text-emerald-400">
            Level Complete!
          </h3>
          <p className="text-text-secondary">
            You've mastered line position insert commands!
          </p>
        </div>
      )}
    </LevelShell>
  )
}

export default LineInsertLevel7
