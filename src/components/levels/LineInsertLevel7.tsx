import React, { useState, useEffect, use } from 'react'
import {
  useKeyboardHandler,
  KeyActionMap,
} from '../../hooks/useKeyboardHandler'
import ConfettiBurst from './ConfettiBurst'
import LevelTimer from '../common/LevelTimer'
import Scoreboard from '../common/Scoreboard'
import ModeIndicator from '../common/ModeIndicator'
import WarningSplash from '../common/WarningSplash'

interface LineInsertLevel7Props {
  isMuted: boolean
}

interface TextLine {
  id: string
  content: string
  expected: string
  completed: boolean
}

const LineInsertLevel7: React.FC<LineInsertLevel7Props> = ({ isMuted }) => {
  const [cells, setCells] = useState<TextLine[]>([])
  const [activeCell, setActiveCell] = useState<number | null>(null)
  const [isInsertMode, setIsInsertMode] = useState(false)
  const [insertCommand, setInsertCommand] = useState<string>('')
  const [score, setScore] = useState(0)
  const [scoreAnimation, setScoreAnimation] = useState(false)
  const [showConfetti, setShowConfetti] = useState(false)
  const [completedCells, setCompletedCells] = useState<Set<string>>(new Set())
  const [lastKeyPressed, setLastKeyPressed] = useState<string>('')
  const [allCompleted, setAllCompleted] = useState(false)
  const [cursorPosition, setCursorPosition] = useState<
    'start' | 'end' | 'normal'
  >('normal')
  const [cursorIndex, setCursorIndex] = useState(1)

  // Initialize cells with challenges
  useEffect(() => {
    const initialCells: TextLine[] = [
      { id: '1', content: 'text', expected: 'PREFIX text', completed: false },
      { id: '2', content: 'line', expected: 'line SUFFIX', completed: false },
      {
        id: '3',
        content: 'middle',
        expected: 'ABOVE\nmiddle\nBELOW',
        completed: false,
      },
      { id: '4', content: 'vim', expected: 'NEW LINE\nvim', completed: false },
      {
        id: '5',
        content: 'editor',
        expected: 'editor\nAFTER LINE',
        completed: false,
      },
    ]
    setCells(initialCells)
    setActiveCell(0)
  }, [])

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
    j: () => {
      if (!isInsertMode && activeCell !== null) {
        setLastKeyPressed('j')
        // setActiveCell(Math.min(cells.length - 1, activeCell + 1))
      }
    },
    k: () => {
      if (!isInsertMode && activeCell !== null) {
        setLastKeyPressed('k')
        // setActiveCell(Math.max(0, activeCell - 1))
      }
    },
    I: () => {
      if (!isInsertMode) {
        setLastKeyPressed('I')
        setIsInsertMode(true)
        setCursorPosition('start')
        // move cursor to start of line
        setCursorIndex(0)
      }
    },
    A: () => {
      if (!isInsertMode) {
        setLastKeyPressed('A')
        setIsInsertMode(true)
        setCursorPosition('end')
        // move cursor to end of line
        if (activeCell !== null) {
          const currentCell = cells[activeCell]
          // Split the content into lines
          const lines = currentCell.content.split('\n')
          const currentLineIndex = Math.min(cursorIndex, lines.length - 1)
          // move cursor to end of currentLine
          setCursorIndex(lines[currentLineIndex].length)
        }
      }
    },
    o: () => {
      if (!isInsertMode) {
        setLastKeyPressed('o')
        setInsertCommand('o')
        setIsInsertMode(true)

        if (activeCell !== null) {
          const currentCell = cells[activeCell]

          // Split the content into lines
          const lines = currentCell.content.split('\n')
          const currentLineIndex = Math.min(cursorIndex, lines.length - 1)

          // add a new line at the end of the current line
          const newLine = lines[currentLineIndex] + '\n'
          currentCell.content =
            lines.slice(0, currentLineIndex).join('\n') + newLine

          // Move cursor to the start of the new line
          setCursorIndex(lines[currentLineIndex].length + 1)
          // setCursorPosition('start')
        }
      }
    },
    O: () => {
      if (!isInsertMode) {
        setLastKeyPressed('O')
        setInsertCommand('O')
        setIsInsertMode(true)

        // In a real editor, this would create a new line above
        if (activeCell !== null) {
          const updatedCells = [...cells]

          // For our simulation, we'll add a newline character at the beginning
          if (!updatedCells[activeCell].content.includes('\n')) {
            updatedCells[activeCell].content =
              '\n' + updatedCells[activeCell].content
            setCells(updatedCells)
          }
        }
      }
    },
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

        // Check if the current line is completed
        if (activeCell !== null) {
          const currentLine = cells[activeCell]

          // Normalize line breaks for comparison
          const normalizedContent = currentLine.content.replace(/\r\n/g, '\n')
          const normalizedExpected = currentLine.expected.replace(/\r\n/g, '\n')

          const currentCell = cells[activeCell]
          if (
            normalizedContent === normalizedExpected &&
            !currentLine.completed
          ) {
            // Mark as completed
            const updatedCells = [...cells]
            updatedCells[activeCell].completed = true
            setCells(updatedCells)

            setCompletedCells((prev) => new Set([...prev, currentCell.id]))

            // Update score
            setScore((prev) => prev + 15)
            setScoreAnimation(true)
            setTimeout(() => setScoreAnimation(false), 500)

            // Move to the next cell if available
            const nextCellIndex = activeCell + 1
            if (nextCellIndex < cells.length) {
              setActiveCell(nextCellIndex)
              // Reset cursor index for the new cell
              setCursorIndex(2)
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

      // if (lastKeyPressed === 'i') {
      //   // Move cursor forward
      setCursorIndex(cursorIndex + 1)
      // } else if (lastKeyPressed === 'a') {
      //   // Move cursor forward
      //   setCursorIndex(cursorIndex + 1)
      // }

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
    // if (isInsertMode && activeCell !== null) {
    //   const updatedCells = [...cells]
    //   const currentLine = updatedCells[activeCell]
    //
    //   switch (insertCommand) {
    //     case 'I':
    //       // Delete at beginning of line
    //       if (currentLine.content.includes('\n')) {
    //         const parts = currentLine.content.split('\n')
    //         if (parts[0].length > 0) {
    //           parts[0] = parts[0].slice(0, -1)
    //           updatedCells[activeCell].content = parts.join('\n')
    //         }
    //       } else if (currentLine.content.length > 0) {
    //         updatedCells[activeCell].content = currentLine.content.slice(1)
    //       }
    //       break
    //
    //     case 'A':
    //       // Delete at end of line
    //       if (currentLine.content.includes('\n')) {
    //         const parts = currentLine.content.split('\n')
    //         const lastPart = parts[parts.length - 1]
    //         if (lastPart.length > 0) {
    //           parts[parts.length - 1] = lastPart.slice(0, -1)
    //           updatedCells[activeCell].content = parts.join('\n')
    //         }
    //       } else if (currentLine.content.length > 0) {
    //         updatedCells[activeCell].content = currentLine.content.slice(0, -1)
    //       }
    //       break
    //
    //     case 'o':
    //       // Delete after the newline
    //       if (currentLine.content.endsWith('\n')) {
    //         // Do nothing if there's just a newline
    //       } else if (currentLine.content.includes('\n')) {
    //         const parts = currentLine.content.split('\n')
    //         const lastPart = parts[parts.length - 1]
    //         if (lastPart.length > 0) {
    //           parts[parts.length - 1] = lastPart.slice(0, -1)
    //           updatedCells[activeCell].content = parts.join('\n')
    //         }
    //       }
    //       break
    //
    //     case 'O':
    //       // Delete before the first line
    //       if (currentLine.content.startsWith('\n')) {
    //         // Do nothing if there's just a newline
    //       } else if (currentLine.content.includes('\n')) {
    //         const parts = currentLine.content.split('\n')
    //         if (parts[0].length > 0) {
    //           parts[0] = parts[0].slice(0, -1)
    //           updatedCells[activeCell].content = parts.join('\n')
    //         }
    //       }
    //       break
    //   }
    //
    //   setCells(updatedCells)
    // }
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
  }, [isInsertMode, activeCell, cells, insertCommand])

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

        {/* Mode indicator */}
        <ModeIndicator
          isInsertMode={isInsertMode}
          insertCommand={insertCommand}
        />
      </div>

      {/* Challenge cells */}
      <div className="w-full max-w-[90vmin]">
        <div className="flex flex-col gap-4">
          {cells.map((cell, index) => (
            <div
              key={cell.id}
              className={`relative p-4 rounded-lg transition-all duration-200 ${
                activeCell === index
                  ? 'bg-zinc-700 ring-2 ring-emerald-500 shadow-lg'
                  : 'bg-zinc-800'
              } ${cell.completed ? 'border-2 border-emerald-500' : ''}`}
              onClick={() => {
                if (!isInsertMode) {
                  setActiveCell(index)
                  setCursorIndex(2)
                }
              }}
            >
              <div className="font-mono mb-2 whitespace-pre-wrap min-h-[2rem] text-lg">
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

              <div className="text-sm text-zinc-400 mt-2 border-t border-zinc-700 pt-2">
                <div className="font-semibold mb-1">Expected:</div>
                <div className="whitespace-pre-wrap">
                  {cell.expected.split('\n').map((part, i, arr) => (
                    <React.Fragment key={i}>
                      {part}
                      {i < arr.length - 1 && <br />}
                    </React.Fragment>
                  ))}
                </div>
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
      <div className="flex gap-4 text-zinc-400 mt-4 justify-center flex-wrap">
        <kbd
          className={`px-3 py-1 bg-zinc-800 rounded-lg transition-all duration-150 ${
            lastKeyPressed === 'j'
              ? 'bg-emerald-500 text-white shadow-lg shadow-emerald-500/60 scale-110'
              : ''
          }`}
        >
          j
        </kbd>
        <kbd
          className={`px-3 py-1 bg-zinc-800 rounded-lg transition-all duration-150 ${
            lastKeyPressed === 'k'
              ? 'bg-emerald-500 text-white shadow-lg shadow-emerald-500/60 scale-110'
              : ''
          }`}
        >
          k
        </kbd>
        <kbd
          className={`px-3 py-1 bg-zinc-800 rounded-lg transition-all duration-150 ${
            lastKeyPressed === 'I'
              ? 'bg-emerald-500 text-white shadow-lg shadow-emerald-500/60 scale-110'
              : ''
          }`}
        >
          I
        </kbd>
        <kbd
          className={`px-3 py-1 bg-zinc-800 rounded-lg transition-all duration-150 ${
            lastKeyPressed === 'A'
              ? 'bg-emerald-500 text-white shadow-lg shadow-emerald-500/60 scale-110'
              : ''
          }`}
        >
          A
        </kbd>
        <kbd
          className={`px-3 py-1 bg-zinc-800 rounded-lg transition-all duration-150 ${
            lastKeyPressed === 'o'
              ? 'bg-emerald-500 text-white shadow-lg shadow-emerald-500/60 scale-110'
              : ''
          }`}
        >
          o
        </kbd>
        <kbd
          className={`px-3 py-1 bg-zinc-800 rounded-lg transition-all duration-150 ${
            lastKeyPressed === 'O'
              ? 'bg-emerald-500 text-white shadow-lg shadow-emerald-500/60 scale-110'
              : ''
          }`}
        >
          O
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
      <WarningSplash />
    </div>
  )
}

export default LineInsertLevel7
