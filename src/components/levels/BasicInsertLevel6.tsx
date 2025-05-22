import React, { useState, useEffect } from 'react'
import ConfettiBurst from './ConfettiBurst'
import LevelTimer from '../common/LevelTimer'
import Scoreboard from '../common/Scoreboard'
import ModeIndicator from '../common/ModeIndicator'
import { KeysAllowed } from '../common/KeysAllowed'
import { VimMode, VIM_MODES } from '../../utils/constants'
import { Cell } from './Level6/Cell'
import { RefreshCw } from 'lucide-react'

interface BasicInsertLevel6Props {
  isMuted: boolean
}

const BasicInsertLevel6: React.FC<BasicInsertLevel6Props> = ({ isMuted }) => {
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
  const [score, setScore] = useState(0)
  const [showConfetti, setShowConfetti] = useState(false)
  const [allCompleted, setAllCompleted] = useState(false)
  const [lastKeyPressed, setLastKeyPressed] = useState<string | null>(null)
  const [mode, setMode] = useState<VimMode>(VIM_MODES.NORMAL)
  const [resetCount, setResetCount] = useState(0)

  const isInsertMode = mode === VIM_MODES.INSERT

  // Check if all cells are completed
  useEffect(() => {
    if (cells.length > 0 && cells.every((cell) => cell.completed)) {
      setAllCompleted(true)
      setShowConfetti(true)

      // Reset after celebration
      setTimeout(() => {
        setShowConfetti(false)
      }, 3000)
    }
  }, [cells])

  const resetLevel = () => {
    setActiveCell(0)
    setScore(0)
    setCells(initialCells)
    setResetCount((prev) => prev + 1)
  }

  return (
    <div className="flex flex-col items-center gap-4">
      <div className="text-center">
        {/* <h3 className="text-xl font-bold mb-2">Basic Insert Mode</h3> */}
        <p className="text-zinc-400">
          Use <kbd className="px-2 py-1 bg-zinc-800 rounded">i</kbd> to enter
          insert mode before cursor,{' '}
          <kbd className="px-2 py-1 bg-zinc-800 rounded">a</kbd> to append after
          cursor, and{' '}
          <kbd className="px-2 py-1 bg-zinc-800 rounded">Escape</kbd> to return
          to normal mode.
        </p>
        <p className="text-zinc-400 text-sm mt-1">
          Use <kbd className="px-2 py-1 bg-zinc-800 rounded">u</kbd> to undo and{' '}
          <kbd className="px-2 py-1 bg-zinc-800 rounded">Ctrl+r</kbd> to redo
          changes.
        </p>
        {/* <p className="text-zinc-400 text-sm"> */}
        {/*   Edit each cell to match the expected text shown below it. */}
        {/* </p> */}
      </div>

      <div className="flex items-center gap-4 mb-2">
        {/* Score display */}
        <Scoreboard score={score} maxScore={cells.length * 10} />
        <button
          onClick={resetLevel}
          className="bg-zinc-800 p-2 rounded-lg hover:bg-zinc-700 transition-colors"
          aria-label="Reset Level"
        >
          <RefreshCw size={18} className="text-zinc-400" />
        </button>
        {/* Mode indicator */}
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
                  setScore((prev) => prev + 10)
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

      {/* Level Timer */}
      <LevelTimer levelId="6-basic-insert" isActive={true} />

      {/* Confetti for completion */}
      {showConfetti && <ConfettiBurst />}

      {/* Completion message */}
      {allCompleted && (
        <div className="mt-6 p-4 bg-emerald-500/20 border border-emerald-500 rounded-lg text-center">
          <h3 className="text-xl font-bold text-emerald-400">
            Level Complete!
          </h3>
          <p className="text-zinc-300">
            You've mastered the basic insert commands!
          </p>
        </div>
      )}
    </div>
  )
}

export default BasicInsertLevel6
