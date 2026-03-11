import React, { useEffect, useState } from 'react'
import { VIM_MODES, VimMode } from '../../utils/constants'
import { useVimLevel } from '../../hooks/useVimLevel'
import { KeysAllowed } from '../common/KeysAllowed'
import ModeIndicator from '../common/ModeIndicator'
import { Cell } from './Level6/Cell'
import { LevelShell, LevelHeader } from '../level-blocks'

interface BasicInsertLevel6Props {
  isMuted: boolean
}

const BasicInsertLevel6: React.FC<BasicInsertLevel6Props> = () => {
  const initialCells: Cell[] = [
    { id: '1', content: '', expected: 'Hello', completed: false },
    { id: '2', content: 'H', expected: 'Hi', completed: false },
    { id: '3', content: 'ext', expected: 'Text', completed: false },
    { id: '4', content: 'im', expected: 'Vim!', completed: false },
    { id: '5', content: 'Add(i)', expected: 'Add(1)', completed: false },
    { id: '6', content: '22=51', expected: '2+2=5-1', completed: false },
    {
      id: '7',
      content: 'Insrt Hre',
      expected: 'Insert Here',
      completed: false,
    },
    { id: '8', content: 'Mood', expected: 'Mode Normal', completed: false },
  ]

  const [cells, setCells] = useState<Cell[]>(initialCells)
  const [activeCell, setActiveCell] = useState<number | null>(0)
  const [lastKeyPressed, setLastKeyPressed] = useState<string | null>(null)
  const [mode, setMode] = useState<VimMode>(VIM_MODES.NORMAL)
  const [resetCount, setResetCount] = useState(0)

  const level = useVimLevel({
    levelId: '6-basic-insert',
    maxScore: initialCells.length * 10,
    onReset: () => {
      setActiveCell(0)
      setCells(initialCells)
      setResetCount((prev) => prev + 1)
      setMode(VIM_MODES.NORMAL)
    },
  })

  // Start timer immediately (this level doesn't wait for first keypress)
  useEffect(() => { level.activateTimer() }, [])

  // Check if all cells are completed
  useEffect(() => {
    if (cells.length > 0 && cells.every((cell) => cell.completed)) {
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
          Use <kbd className="px-2 py-1 bg-bg-secondary rounded">i</kbd> to enter
          insert mode before cursor,{' '}
          <kbd className="px-2 py-1 bg-bg-secondary rounded">a</kbd> to append after
          cursor, and{' '}
          <kbd className="px-2 py-1 bg-bg-secondary rounded">Escape</kbd> to return
          to normal mode.
        </p>
        <p className="text-text-muted text-sm mt-1">
          Use <kbd className="px-2 py-1 bg-bg-secondary rounded">u</kbd> to undo and{' '}
          <kbd className="px-2 py-1 bg-bg-secondary rounded">Ctrl+r</kbd> to redo
          changes.
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

      {/* Challenge grid */}
      <div className="w-full max-w-[90vmin]">
        <div
          className="grid grid-cols-4 gap-4 h-full w-full"
          style={{ gridTemplateColumns: 'repeat(2, minmax(0, 1fr))' }}
        >
          {cells.map((cell, index) => (
            <Cell
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
        keys={['i', 'a', 'u', 'h', 'j', 'k', 'l', 'ctrl+r', 'Escape']}
        lastKeyPressed={lastKeyPressed}
      />

      {/* Completion message */}
      {level.levelCompleted && (
        <div className="mt-6 p-4 bg-emerald-500/20 border border-emerald-500 rounded-lg text-center">
          <h3 className="text-xl font-bold text-emerald-400">
            Level Complete!
          </h3>
          <p className="text-text-secondary">
            You've mastered the basic insert commands!
          </p>
        </div>
      )}
    </LevelShell>
  )
}

export default BasicInsertLevel6
