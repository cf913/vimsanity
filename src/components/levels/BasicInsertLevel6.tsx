import React, { useState, useEffect } from 'react'
import {
  useKeyboardHandler,
  KeyActionMap,
} from '../../hooks/useKeyboardHandler'
import ConfettiBurst from './ConfettiBurst'
import LevelTimer from '../common/LevelTimer'

interface BasicInsertLevel6Props {
  isMuted: boolean
}

interface Cell {
  id: string
  content: string
  expected: string
  completed: boolean
}

const BasicInsertLevel6: React.FC<BasicInsertLevel6Props> = ({ isMuted }) => {
  const [cells, setCells] = useState<Cell[]>([])
  const [activeCell, setActiveCell] = useState<number | null>(null)
  const [isInsertMode, setIsInsertMode] = useState(false)
  const [score, setScore] = useState(0)
  const [scoreAnimation, setScoreAnimation] = useState(false)
  const [showConfetti, setShowConfetti] = useState(false)
  const [lastKeyPressed, setLastKeyPressed] = useState<string>('')
  const [completedCells, setCompletedCells] = useState<Set<string>>(new Set())
  const [allCompleted, setAllCompleted] = useState(false)

  // Initialize cells with challenges
  useEffect(() => {
    const initialCells: Cell[] = [
      { id: '1', content: '', expected: 'Hello', completed: false },
      { id: '2', content: 'H', expected: 'Hi', completed: false },
      { id: '3', content: 'Tex', expected: 'Text', completed: false },
      { id: '4', content: 'Vim', expected: 'Vim!', completed: false },
      { id: '5', content: 'Cod', expected: 'Code', completed: false },
      { id: '6', content: '', expected: 'Edit', completed: false },
      { id: '7', content: 'Inser', expected: 'Insert', completed: false },
      { id: '8', content: 'Mod', expected: 'Mode', completed: false },
    ]
    setCells(initialCells)
    setActiveCell(0)
  }, [])

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

  // Define key actions
  const keyActions: KeyActionMap = {
    h: () => {
      if (!isInsertMode && activeCell !== null) {
        setLastKeyPressed('h')
        setActiveCell(Math.max(0, activeCell - 1))
      }
    },
    l: () => {
      if (!isInsertMode && activeCell !== null) {
        setLastKeyPressed('l')
        setActiveCell(Math.min(cells.length - 1, activeCell + 1))
      }
    },
    i: () => {
      if (!isInsertMode) {
        setLastKeyPressed('i')
        setIsInsertMode(true)
      }
    },
    a: () => {
      if (!isInsertMode) {
        setLastKeyPressed('a')
        setIsInsertMode(true)

        // Move cursor position to end of content for append
        if (activeCell !== null) {
          // In a real editor, this would move the cursor
          // For our simplified model, we just set the mode
        }
      }
    },
    Escape: () => {
      if (isInsertMode) {
        setLastKeyPressed('Escape')
        setIsInsertMode(false)

        // Check if the current cell is completed
        if (activeCell !== null) {
          const currentCell = cells[activeCell]
          if (
            currentCell.content === currentCell.expected &&
            !currentCell.completed
          ) {
            // Mark as completed
            const updatedCells = [...cells]
            updatedCells[activeCell].completed = true
            setCells(updatedCells)

            // Update completed cells set
            setCompletedCells((prev) => new Set([...prev, currentCell.id]))

            // Update score
            setScore((prev) => prev + 10)
            setScoreAnimation(true)
            setTimeout(() => setScoreAnimation(false), 500)
          }
        }
      }
    },
  }

  // Handle character input in insert mode
  const handleCharInput = (char: string) => {
    if (isInsertMode && activeCell !== null) {
      const updatedCells = [...cells]

      if (lastKeyPressed === 'i') {
        // Insert mode - add at current position
        updatedCells[activeCell].content += char
      } else if (lastKeyPressed === 'a') {
        // Append mode - add at end
        updatedCells[activeCell].content += char
      }

      setCells(updatedCells)
    }
  }
  
  // Handle backspace key in insert mode
  const handleBackspace = () => {
    if (isInsertMode && activeCell !== null) {
      const updatedCells = [...cells]
      const currentContent = updatedCells[activeCell].content
      
      if (currentContent.length > 0) {
        // Remove the last character
        updatedCells[activeCell].content = currentContent.slice(0, -1)
        setCells(updatedCells)
      }
    }
  }

  // Register keyboard handler
  const { lastKeyPressed: keyboardLastKey } = useKeyboardHandler({
    keyActionMap: keyActions,
    dependencies: [isInsertMode, activeCell, cells, lastKeyPressed],
  })

  // Register all key actions
  useEffect(() => {
    // Register normal mode actions
    // Object.entries(keyActions).forEach(([key, action]) => {
    //   registerKeyAction(key, action)
    // })

    // Register character input and backspace for insert mode
    const handleKeyDown = (e: KeyboardEvent) => {
      if (isInsertMode) {
        if (e.key.length === 1) {
          handleCharInput(e.key)
        } else if (e.key === 'Backspace') {
          handleBackspace()
        }
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => {
      window.removeEventListener('keydown', handleKeyDown)
    }
  }, [isInsertMode, activeCell, cells, lastKeyPressed])

  return (
    <div className="flex flex-col items-center gap-6">
      <div className="text-center mb-4">
        <h3 className="text-xl font-bold mb-2">Basic Insert Mode</h3>
        <p className="text-zinc-300 mb-4">
          Use <kbd className="px-2 py-1 bg-zinc-800 rounded">i</kbd> to enter
          insert mode before cursor,{' '}
          <kbd className="px-2 py-1 bg-zinc-800 rounded">a</kbd> to append after
          cursor, and{' '}
          <kbd className="px-2 py-1 bg-zinc-800 rounded">Escape</kbd> to return
          to normal mode.
        </p>
        <p className="text-zinc-400 text-sm">
          Edit each cell to match the expected text shown below it.
        </p>
      </div>

      {/* Score display */}
      <div className="relative mb-4">
        <div
          className={`text-2xl font-bold ${
            scoreAnimation ? 'text-emerald-400 scale-125' : 'text-white'
          } transition-all duration-300`}
        >
          Score: {score}
        </div>
      </div>

      {/* Challenge grid */}
      <div className="w-full max-w-[90vmin] aspect-square">
        <div
          className="grid grid-cols-2 gap-4 h-full w-full"
          style={{ gridTemplateColumns: 'repeat(2, minmax(0, 1fr))' }}
        >
          {cells.map((cell, index) => (
            <div
              key={cell.id}
              className={`relative flex flex-col justify-center items-center p-4 rounded-lg transition-all duration-200 ${
                activeCell === index
                  ? 'bg-zinc-700 ring-2 ring-emerald-500 shadow-lg'
                  : 'bg-zinc-800'
              } ${cell.completed ? 'border-2 border-emerald-500' : ''}`}
              onClick={() => {
                if (!isInsertMode) {
                  setActiveCell(index)
                }
              }}
            >
              <div className="text-2xl font-mono mb-2 min-h-[2rem]">
                {cell.content}
                {activeCell === index && (
                  <span 
                    className={`inline-block w-2 h-5 ${isInsertMode ? 'bg-orange-400' : 'bg-emerald-400'} animate-pulse ml-0.5`}
                  ></span>
                )}
              </div>
              <div className="text-sm text-zinc-400 absolute bottom-2">
                Expected: {cell.expected}
              </div>
              {cell.completed && (
                <div className="absolute top-2 right-2">
                  <span className="text-emerald-500 text-xl">✓</span>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Mode indicator */}
      <div className="mt-4 text-center">
        <span className="px-3 py-1 rounded-full bg-zinc-800">
          Mode: {isInsertMode ? 'Insert' : 'Normal'}
        </span>
      </div>

      {/* Key indicators */}
      <div className="flex gap-4 text-zinc-400 mt-4 justify-center">
        <kbd
          className={`px-3 py-1 bg-zinc-800 rounded-lg transition-all duration-150 ${
            lastKeyPressed === 'h'
              ? 'bg-emerald-500 text-white shadow-lg shadow-emerald-500/60 scale-110'
              : ''
          }`}
        >
          h
        </kbd>
        <kbd
          className={`px-3 py-1 bg-zinc-800 rounded-lg transition-all duration-150 ${
            lastKeyPressed === 'l'
              ? 'bg-emerald-500 text-white shadow-lg shadow-emerald-500/60 scale-110'
              : ''
          }`}
        >
          l
        </kbd>
        <kbd
          className={`px-3 py-1 bg-zinc-800 rounded-lg transition-all duration-150 ${
            lastKeyPressed === 'i'
              ? 'bg-emerald-500 text-white shadow-lg shadow-emerald-500/60 scale-110'
              : ''
          }`}
        >
          i
        </kbd>
        <kbd
          className={`px-3 py-1 bg-zinc-800 rounded-lg transition-all duration-150 ${
            lastKeyPressed === 'a'
              ? 'bg-emerald-500 text-white shadow-lg shadow-emerald-500/60 scale-110'
              : ''
          }`}
        >
          a
        </kbd>
        <kbd
          className={`px-3 py-1 bg-zinc-800 rounded-lg transition-all duration-150 ${
            lastKeyPressed === 'Escape'
              ? 'bg-emerald-500 text-white shadow-lg shadow-emerald-500/60 scale-110'
              : ''
          }`}
        >
          Esc
        </kbd>
      </div>

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
