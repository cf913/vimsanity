import React, { useState, useEffect } from 'react'
import {
  useKeyboardHandler,
  KeyActionMap,
} from '../../hooks/useKeyboardHandler'
import ConfettiBurst from './ConfettiBurst'
import LevelTimer from '../common/LevelTimer'
import Scoreboard from '../common/Scoreboard'
import ModeIndicator from '../common/ModeIndicator'
import { KeysAllowed } from '../common/KeysAllowed'
import { useVimMotions } from '../../hooks/useVimMotions'
import { VimMode, VIM_MODES } from '../../utils/constants'

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
  const [mode, setMode] = useState<VimMode>(VIM_MODES.NORMAL)
  const [cursorIndex, setCursorIndex] = useState(0)
  const [virtualColumn, setVirtualColumn] = useState(0)
  const [score, setScore] = useState(0)
  const [scoreAnimation, setScoreAnimation] = useState(false)
  const [showConfetti, setShowConfetti] = useState(false)
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

  const isInsertMode = mode === VIM_MODES.INSERT

  const text = activeCell !== null ? cells[activeCell].content : ''

  const { keyActionMap } = useVimMotions({
    setCursorIndex,
    cursorIndex,
    setVirtualColumn,
    virtualColumn,
    setMode,
    mode,
    text,
  })

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
      { id: '8', content: 'Mood', expected: 'Mode Normal', completed: false },
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
      if (activeCell !== null) {
        keyActionMap.h()
      }
    },
    l: () => {
      if (activeCell !== null) {
        keyActionMap.l()
      }
    },
    i: () => {
      if (activeCell !== null) {
        keyActionMap.i()
      }
    },
    a: () => {
      if (activeCell !== null) {
        keyActionMap.a()
      }
    },
    A: () => {
      keyActionMap.A()
    },
    I: () => {
      keyActionMap.I()
    },
    u: () => {
      if (!isInsertMode) {
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
  }

  const insertModeActions: KeyActionMap = {
    Escape: () => {
      keyActionMap['Escape']()
      // Save the state to history when exiting insert mode (following Vim behavior)
      // Create deep copies of cells for history
      let newCursorIndex = cursorIndex

      if (cursorIndex > 0) {
        newCursorIndex = cursorIndex - 1
      }

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
    },
    Enter: () => {},
    Backspace: () => {
      if (activeCell === null) return

      const updatedCells = [...cells]
      const currentContent = updatedCells[activeCell].content

      keyActionMap['Backspace'](currentContent, (res: string) => {
        updatedCells[activeCell].content = res
        setCells(updatedCells)
      })
    },
  }

  // Handle character input in insert mode
  const handleCharInput = (char: string) => {
    if (
      isInsertMode &&
      activeCell !== null &&
      char.length === 1 &&
      !Object.keys(insertModeActions).includes(char)
    ) {
      const updatedCells = [...cells]
      const currentContent = updatedCells[activeCell].content

      keyActionMap['char'](currentContent, char, (res: string) => {
        updatedCells[activeCell].content = res
        setCells(updatedCells)
      })
    }
  }

  const handleCtrlR = (e: KeyboardEvent) => {
    // Check if Ctrl+r was pressed
    if (e.ctrlKey && e.key === 'r') {
      console.log('ctrl+r')
      e.preventDefault() // Prevent browser refresh

      if (!isInsertMode) {
        // setLastKeyPressed('ctrl+r')

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

  // Register keyboard handler
  const { lastKeyPressed } = useKeyboardHandler({
    keyActionMap: mode === VIM_MODES.INSERT ? insertModeActions : keyActions,
    dependencies: [isInsertMode, activeCell, cells],
    onAnyKey: handleCharInput,
    onCtrlKeys: handleCtrlR,
  })

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
