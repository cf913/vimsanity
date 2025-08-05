import { RefreshCw } from 'lucide-react'
import React, { useEffect, useState } from 'react'
import { VIM_MODES, VimMode } from '../../utils/constants'
import { KeysAllowed } from '../common/KeysAllowed'
import LevelTimer from '../common/LevelTimer'
import ModeIndicator from '../common/ModeIndicator'
import Scoreboard from '../common/Scoreboard'
import ConfettiBurst from './ConfettiBurst'
import { Cell7 } from './Level7/Cell'

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
  const [score, setScore] = useState(0)
  const [lastKeyPressed, setLastKeyPressed] = useState<string | null>(null)
  const [showConfetti, setShowConfetti] = useState(false)
  const [allCompleted, setAllCompleted] = useState(false)
  const [resetCount, setResetCount] = useState(0)

  const isInsertMode = mode === VIM_MODES.INSERT

  // Check if all cells are completed
  useEffect(() => {
    if (cells.length > 0 && cells.every((line) => line.completed)) {
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
        <p className="text-zinc-400">
          Use <kbd className="px-2 py-1 bg-zinc-800 rounded">I</kbd> to insert
          at line start, <kbd className="px-2 py-1 bg-zinc-800 rounded">A</kbd>{' '}
          to append at line end,{' '}
          <kbd className="px-2 py-1 bg-zinc-800 rounded">o</kbd> to open line
          below, and <kbd className="px-2 py-1 bg-zinc-800 rounded">O</kbd> to
          open line above.
        </p>
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
        keys={['I', 'A', 'o', 'O', 'h', 'j', 'k', 'l']}
        lastKeyPressed={lastKeyPressed}
      />

      {/* Level Timer */}
      <LevelTimer levelId="7-line-insert" isActive={true} />

      {/* Confetti for completion */}
      {showConfetti && <ConfettiBurst />}

      {/* Completion message */}
      {allCompleted && (
        <div className="mt-6 p-4 bg-emerald-500/20 border border-emerald-500 rounded-lg text-center">
          <h3 className="text-xl font-bold text-emerald-400">
            Level Complete!
          </h3>
          <p className="text-zinc-300">
            You've mastered line position insert commands!
          </p>
        </div>
      )}
    </div>
  )
}

export default LineInsertLevel7
