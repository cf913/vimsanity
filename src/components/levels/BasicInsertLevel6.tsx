import React, { useState, useEffect } from 'react'
import {
  useKeyboardHandler,
  KeyActionMap,
} from '../../hooks/useKeyboardHandler'
import ConfettiBurst from './ConfettiBurst'
import LevelTimer from '../common/LevelTimer'
import Scoreboard from '../common/Scoreboard'
import ModeIndicator from '../common/ModeIndicator'

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
  const [cursorPosition, setCursorPosition] = useState<'normal' | 'append'>(
    'normal'
  )
  const [cursorIndex, setCursorIndex] = useState(0)
  const [score, setScore] = useState(0)
  const [scoreAnimation, setScoreAnimation] = useState(false)
  const [showConfetti, setShowConfetti] = useState(false)
  const [lastKeyPressed, setLastKeyPressed] = useState<string>('')
  const [completedCells, setCompletedCells] = useState<Set<string>>(new Set())
  const [allCompleted, setAllCompleted] = useState(false)
  // History state for undo functionality
  const [history, setHistory] = useState<
    { cells: Cell[]; cursorIndex: number; activeCell: number | null }[]
  >([])
  // Redo history state for Ctrl+r functionality
  const [redoHistory, setRedoHistory] = useState<
    { cells: Cell[]; cursorIndex: number; activeCell: number | null }[]
  >([])

  // Initialize cells with challenges
  useEffect(() => {
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
      { id: '8', content: 'Mood', expected: 'Mode', completed: false },
    ]
    setCells(initialCells)
    setActiveCell(0)
    setHistory([
      {
        cells: JSON.parse(JSON.stringify(initialCells)),
        cursorIndex: 0,
        activeCell: 0,
      },
    ])
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
        // Move cursor left within the cell
        if (cursorIndex > 0) {
          setCursorIndex(cursorIndex - 1)
        }
      }
    },
    l: () => {
      if (!isInsertMode && activeCell !== null) {
        setLastKeyPressed('l')
        // Move cursor right within the cell
        const cellContent = cells[activeCell].content
        if (cursorIndex < cellContent.length - 1) {
          setCursorIndex(cursorIndex + 1)
        }
      }
    },
    i: () => {
      if (!isInsertMode) {
        setLastKeyPressed('i')
        setIsInsertMode(true)
        setCursorPosition('normal')
        // Keep cursor at current index for insert mode
      }
    },
    a: () => {
      if (!isInsertMode) {
        setLastKeyPressed('a')
        setIsInsertMode(true)

        // Move cursor position one to the right for append
        if (activeCell !== null) {
          setCursorPosition('append')
          // Get the current cell content
          const cellContent = cells[activeCell].content

          // If the line is empty, keep cursor in the same position
          if (cellContent.length === 0) {
            // Keep cursor at index 0 for empty lines
            setCursorIndex(0)
          }
          // If cursor is at the end of the content, keep it there
          // Otherwise, move it one position to the right
          else if (cursorIndex < cellContent.length) {
            setCursorIndex(cursorIndex + 1)
          } else {
            setCursorIndex(cellContent.length)
          }
        }
      }
    },
    u: () => {
      if (!isInsertMode) {
        setLastKeyPressed('u')

        if (history.length === 0) return

        let previousState = null

        if (history.length === 1) {
          // If there's only one state, reset the level
          previousState = history[0]
        } else {
          // Otherwise, get the second last state from history (the last one is the current state)
          previousState = history[history.length - 2]
          // state on current cell if it's different
          if (previousState.activeCell !== activeCell) return
        }

        // Create a deep copy of the cells from history
        const restoredCells = JSON.parse(JSON.stringify(previousState.cells))
        // Restore the previous state
        setCells(restoredCells)
        setCursorIndex(previousState.cursorIndex)
        setActiveCell(previousState.activeCell)

        if (history.length > 1) {
          // Save the current state to redo history
          const currentState = history[history.length - 1]
          setRedoHistory((prev) => [...prev, currentState])

          // Remove the old current state from history
          setHistory((prev) => prev.slice(0, -1))
        }
      }
    },
    // 'ctrl+r' is handled separately with a direct event listener

    Escape: () => {
      if (isInsertMode) {
        setLastKeyPressed('Escape')

        setIsInsertMode(false)
        setCursorPosition('normal')

        // Move cursor one position to the left when exiting insert mode
        // unless it's at the beginning of the line
        let newCursorIndex = cursorIndex
        if (cursorIndex > 0) {
          newCursorIndex = cursorIndex - 1
          setCursorIndex(newCursorIndex)
        }

        // Save the state to history when exiting insert mode (following Vim behavior)
        // Create deep copies of cells for history
        const cellsCopy = JSON.parse(JSON.stringify(cells))
        // Save current state to history before switching to normal mode
        setHistory((prev) => [
          ...prev,
          { cells: cellsCopy, cursorIndex: newCursorIndex, activeCell },
        ])

        // Clear redo history when making a new change (following Vim behavior)
        setRedoHistory([])

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

            // Move to the next cell if available
            const nextCellIndex = activeCell + 1
            if (nextCellIndex < cells.length) {
              // save the state to history
              setHistory((prev) => [
                ...prev,
                {
                  cells: JSON.parse(JSON.stringify(cells)),
                  cursorIndex: 0,
                  activeCell: nextCellIndex,
                },
              ])

              // Clear redo history when making a new change (following Vim behavior)
              setRedoHistory([])
              setActiveCell(nextCellIndex)
              // Reset cursor index for the new cell
              setCursorIndex(0)
            }
          }
        }
      }
    },
  }

  // Handle character input in insert mode
  const handleCharInput = (char: string) => {
    if (isInsertMode && activeCell !== null) {
      const updatedCells = [...cells]
      const currentContent = updatedCells[activeCell].content

      const beforeCursor = currentContent.substring(0, cursorIndex)
      const afterCursor = currentContent.substring(cursorIndex)
      updatedCells[activeCell].content = beforeCursor + char + afterCursor

      if (lastKeyPressed === 'i') {
        // Move cursor forward
        setCursorIndex(cursorIndex + 1)
      } else if (lastKeyPressed === 'a') {
        // Move cursor forward
        setCursorIndex(cursorIndex + 1)
      }

      setCells(updatedCells)
    }
  }

  // Handle backspace key in insert mode
  const handleBackspace = () => {
    if (isInsertMode && activeCell !== null && cursorIndex > 0) {
      const updatedCells = [...cells]
      const currentContent = updatedCells[activeCell].content

      // Remove character before cursor
      const beforeCursor = currentContent.substring(0, cursorIndex - 1)
      const afterCursor = currentContent.substring(cursorIndex)
      updatedCells[activeCell].content = beforeCursor + afterCursor

      // Move cursor back
      setCursorIndex(cursorIndex - 1)

      setCells(updatedCells)
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

    // Handle Ctrl+r for redo functionality
    const handleCtrlR = (e: KeyboardEvent) => {
      // Check if Ctrl+r was pressed
      if (e.ctrlKey && e.key === 'r') {
        e.preventDefault() // Prevent browser refresh

        if (!isInsertMode) {
          setLastKeyPressed('ctrl+r')

          if (redoHistory.length === 0) return

          // Get the last state from redo history
          const nextState = redoHistory[redoHistory.length - 1]

          // Only redo if we're on the same cell
          if (nextState.activeCell !== activeCell) return

          // Create a deep copy of the cells from redo history
          const restoredCells = JSON.parse(JSON.stringify(nextState.cells))

          // Restore the next state
          setCells(restoredCells)
          setCursorIndex(nextState.cursorIndex)
          setActiveCell(nextState.activeCell)

          // Add the restored state back to history
          setHistory((prev) => [...prev, nextState])

          // Remove the restored state from redo history
          setRedoHistory((prev) => prev.slice(0, -1))
        }
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    window.addEventListener('keydown', handleCtrlR)
    return () => {
      window.removeEventListener('keydown', handleKeyDown)
      window.removeEventListener('keydown', handleCtrlR)
    }
  }, [isInsertMode, activeCell, cells, lastKeyPressed, redoHistory, history])

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
                  // Reset cursor index when selecting a new cell
                  setCursorIndex(0)
                }
              }}
            >
              <div className="text-2xl font-mono mb-2 min-h-[2rem]">
                {activeCell === index ? (
                  <>
                    {cell.content.split('').map((char, charIdx) => {
                      const isCursorPosition = charIdx === cursorIndex
                      return (
                        <span
                          key={charIdx}
                          className={`${
                            isCursorPosition
                              ? isInsertMode
                                ? 'bg-orange-400 text-white rounded'
                                : 'bg-emerald-400 text-white rounded'
                              : ''
                          }`}
                        >
                          {char === ' ' ? '\u00A0' : char}
                        </span>
                      )
                    })}
                    {/* Show cursor at the end if in append mode */}
                    {isInsertMode &&
                      cursorIndex === cell.content.length &&
                      cursorIndex > 0 && (
                        <span className="bg-orange-400 text-white rounded">
                          {'\u00A0'}
                        </span>
                      )}
                    {/* Show cursor if content is empty */}
                    {cell.content.length === 0 && (
                      <span
                        className={
                          isInsertMode
                            ? 'bg-orange-400 text-white rounded'
                            : 'bg-emerald-400 text-white rounded'
                        }
                      >
                        {'\u00A0'}
                      </span>
                    )}
                  </>
                ) : (
                  cell.content || '\u00A0'
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
            lastKeyPressed === 'u'
              ? 'bg-emerald-500 text-white shadow-lg shadow-emerald-500/60 scale-110'
              : ''
          }`}
        >
          u
        </kbd>
        <kbd
          className={`px-3 py-1 bg-zinc-800 rounded-lg transition-all duration-150 ${
            lastKeyPressed === 'ctrl+r'
              ? 'bg-emerald-500 text-white shadow-lg shadow-emerald-500/60 scale-110'
              : ''
          }`}
        >
          Ctrl+r
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
