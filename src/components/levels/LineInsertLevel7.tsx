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
import { VIM_MODES } from '../../utils/constants'
import {
  findLineEnd,
  findLineEndColumn,
  findLineStart,
} from '../../utils/textUtils'

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
  const [mode, setMode] = useState<string>(VIM_MODES.NORMAL)
  const [activeCell, setActiveCell] = useState<number | null>(null)
  const [insertCommand, setInsertCommand] = useState<string>('')
  const [score, setScore] = useState(0)
  const [scoreAnimation, setScoreAnimation] = useState(false)
  const [showConfetti, setShowConfetti] = useState(false)
  const [completedCells, setCompletedCells] = useState<Set<string>>(new Set())
  const [allCompleted, setAllCompleted] = useState(false)
  const [cursorPosition, setCursorPosition] = useState<
    'start' | 'end' | 'normal'
  >('normal')
  const [cursorIndex, setCursorIndex] = useState(1)
  const [virtualColumn, setVirtualColumn] = useState(1)

  const isInsertMode = mode === VIM_MODES.INSERT

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

  const setCursorToLineAndColumn = (
    lineStart: number,
    targetColumn: number,
    lineLength: number,
  ) => {
    // For empty lines or if target column exceeds line length, place at line start or end
    if (lineLength === 0) {
      console.log('nextCursorPosition', lineStart)
      setCursorIndex(lineStart)
    } else {
      // Calculate actual column (bounded by line length)
      const actualColumn = Math.min(
        targetColumn,
        lineLength > 0 ? lineLength - 1 : 0,
      )
      console.log('nextCursorPosition', lineStart + actualColumn)
      setCursorIndex(lineStart + actualColumn)
    }
  }

  // Helper to get the current column position
  const getCurrentColumn = () => {
    if (activeCell !== null) {
      const cellContent = cells[activeCell].content
      const lineStart = findLineStart(cellContent, cursorIndex)
      return cursorIndex - lineStart
    }
    return 0
  }

  // Define key actions
  const normalModeActions: KeyActionMap = {
    h: () => {
      if (activeCell !== null) {
        // Only move left if not at the beginning of a line
        const cellContent = cells[activeCell].content
        const lineStart = findLineStart(cellContent, cursorIndex)
        // Move cursor left within the cell
        if (cursorIndex > lineStart) {
          setCursorIndex(cursorIndex - 1)
          setVirtualColumn(getCurrentColumn() - 1)
        }
      }
    },
    l: () => {
      if (activeCell !== null) {
        // Move cursor right within the cell
        const cellContent = cells[activeCell].content
        // Only move right if not at the end of a line
        const lineEnd = findLineEnd(cellContent, cursorIndex)
        if (cursorIndex < lineEnd) {
          setCursorIndex(cursorIndex + 1)
          setVirtualColumn(getCurrentColumn() + 1)
        }
      }
    },
    j: () => {
      if (activeCell !== null) {
        // setActiveCell(Math.min(cells.length - 1, activeCell + 1))
        // got to the next line
        const cellContent = cells[activeCell].content
        const currentLineStart = findLineStart(cellContent, cursorIndex)
        const currentColumn = cursorIndex - currentLineStart

        // Remember this column if it's not already saved
        // or if horizontal movement has changed it
        if (currentColumn > virtualColumn) {
          setVirtualColumn(currentColumn)
        }

        // Find the next line boundaries
        const currentLineEnd = cellContent.indexOf('\n', cursorIndex)
        if (currentLineEnd === -1) return // Already at the last line

        const nextLineStart = currentLineEnd + 1
        const nextLineEnd = cellContent.indexOf('\n', nextLineStart)
        const nextLineLength =
          (nextLineEnd === -1 ? cellContent.length : nextLineEnd) -
          nextLineStart

        // Set cursor to appropriate position in next line based on virtual column
        setCursorToLineAndColumn(nextLineStart, virtualColumn, nextLineLength)
      }
    },
    k: () => {
      if (activeCell !== null) {
        // Move up a line
        const cellContent = cells[activeCell].content
        const lineStart = findLineStart(cellContent, cursorIndex)
        const currentColumn = cursorIndex - lineStart

        if (currentColumn > virtualColumn) {
          console.log('currentColumn', currentColumn)
          console.log('virtualColumn', virtualColumn)
          setVirtualColumn(currentColumn)
        }

        // Cannot go up if already at first line
        if (lineStart <= 0) return

        // Find the previous line boundaries
        const prevLineEnd = lineStart - 1
        const prevLineStart = cellContent.lastIndexOf('\n', prevLineEnd - 1) + 1
        const prevLineLength = prevLineEnd - prevLineStart

        // Set cursor to appropriate position in previous line based on virtual column
        setCursorToLineAndColumn(prevLineStart, virtualColumn, prevLineLength)
      }
    },
    i: () => {
      if (!isInsertMode) {
        setMode(VIM_MODES.INSERT)
        setCursorPosition('normal')
        // Keep cursor at current index for insert mode
      }
    },
    a: () => {
      if (!isInsertMode) {
        setMode(VIM_MODES.INSERT)

        // Move cursor position one to the right for append
        if (activeCell !== null) {
          // setCursorPosition('append')
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
    I: () => {
      if (activeCell !== null) {
        setMode(VIM_MODES.INSERT)
        setCursorPosition('start')

        const cellContent = cells[activeCell].content
        const lineStart = findLineStart(cellContent, cursorIndex)
        // move cursor to start of line
        setCursorIndex(lineStart)
        setVirtualColumn(0)
      }
    },
    A: () => {
      if (activeCell !== null) {
        setMode(VIM_MODES.INSERT)
        setCursorPosition('end')
        const cellContent = cells[activeCell].content
        const lineEnd = findLineEnd(cellContent, cursorIndex)
        // move cursor to end of currentLine
        setCursorIndex(lineEnd + 1) // +1 because appending to the end of a line
        setVirtualColumn(findLineEndColumn(cellContent, cursorIndex))
      }
    },
    o: () => {
      if (activeCell !== null) {
        setInsertCommand('o')
        setMode(VIM_MODES.INSERT)

        const updatedCells = [...cells]
        const currentContent = updatedCells[activeCell].content

        // Insert newline after current line
        const lineEnd = findLineEnd(currentContent, cursorIndex)
        const newContent =
          currentContent.substring(0, lineEnd + 1) +
          '\n' +
          currentContent.substring(lineEnd + 1)

        updatedCells[activeCell].content = newContent
        setCells(updatedCells)

        // Move cursor to start of new line
        setCursorIndex(lineEnd + 2) // +1 for newline, +1 to move to start of new line
        setVirtualColumn(0)
      }
    },
    O: () => {
      if (activeCell !== null) {
        setInsertCommand('O')
        setMode(VIM_MODES.INSERT)

        const updatedCells = [...cells]
        const currentContent = updatedCells[activeCell].content

        const lineStart = findLineStart(currentContent, cursorIndex)

        // Insert newline before current line
        const newContent =
          currentContent.substring(0, lineStart) +
          '\n' +
          currentContent.substring(lineStart)

        updatedCells[activeCell].content = newContent
        setCells(updatedCells)

        setCursorIndex(lineStart) // -1 to move to start of new line above
        setVirtualColumn(0)
      }
    },
  }

  const insertModeActions: KeyActionMap = {
    // Enter: () => {
    //   if (activeCell === null) return
    //   // Clear any pending commands
    //   // setPendingCommand(null)
    //   const updatedCells = [...cells]
    //   const currentContent = updatedCells[activeCell].content
    //   updatedCells[activeCell].content =
    //     currentContent.substring(0, cursorIndex) +
    //     '\n' +
    //     currentContent.substring(cursorIndex)
    //
    //   setCells(updatedCells)
    //   setCursorIndex((prev) => prev + 1)
    //   setVirtualColumn(0)
    // },
    Escape: () => {
      setMode(VIM_MODES.NORMAL)
      setCursorPosition('normal')

      // Move cursor one position to the left when exiting insert mode
      // unless it's at the beginning of the line

      // Check if the current line is completed
      if (activeCell !== null) {
        let newCursorIndex = cursorIndex
        const editableText = cells[activeCell].content
        const lineStart = findLineStart(editableText, cursorIndex)
        if (cursorIndex > 0) {
          newCursorIndex = Math.max(lineStart, cursorIndex - 1)
          setCursorIndex(newCursorIndex)
          setVirtualColumn(newCursorIndex - lineStart)
        }
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
            setCursorIndex(1)
          }
        }
      }
    },
    Backspace: () => {
      if (activeCell !== null && cursorIndex > 0) {
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

  // Register keyboard handler
  const { lastKeyPressed } = useKeyboardHandler({
    keyActionMap:
      mode === VIM_MODES.NORMAL ? normalModeActions : insertModeActions,
    dependencies: [isInsertMode, activeCell, cells, mode, cursorPosition],
    onAnyKey: handleCharInput,
  })

  // Register all key actions
  // useEffect(() => {
  //   // Register normal mode actions
  //   // Object.entries(keyActions).forEach(([key, action]) => {
  //   //   registerKeyAction(key, action)
  //   // })
  //
  //   // Register character input and backspace for insert mode
  //   const handleKeyDown = (e: KeyboardEvent) => {
  //     if (isInsertMode) {
  //       if (e.key.length === 1) {
  //         handleCharInput(e.key)
  //       } else if (e.key === 'Backspace') {
  //         handleBackspace()
  //       }
  //     }
  //   }
  //
  //   window.addEventListener('keydown', handleKeyDown)
  //   return () => {
  //     window.removeEventListener('keydown', handleKeyDown)
  //   }
  // }, [isInsertMode, activeCell, cells, insertCommand])
  //
  //

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
          {cells.map((cell, index) => {
            const editableText = cell.content

            const lines = editableText.split('\n')
            return (
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
                  {activeCell === index
                    ? lines.map((line, lineIdx) => {
                        // Calculate line start position in the entire text
                        const lineStartPosition =
                          editableText.split('\n').slice(0, lineIdx).join('\n')
                            .length + (lineIdx > 0 ? 1 : 0)
                        // Calculate if cursor is on this line
                        const isCursorOnThisLine =
                          cursorIndex >= lineStartPosition &&
                          (lineIdx === lines.length - 1 ||
                            cursorIndex < lineStartPosition + line.length + 1)

                        return (
                          <div
                            key={lineIdx}
                            className="min-h-[1.5em] whitespace-pre"
                          >
                            {line.split('').map((char, charIdx) => {
                              const absoluteIdx = lineStartPosition + charIdx
                              const isCursorPosition =
                                absoluteIdx === cursorIndex
                              const isCursorOnLastChar =
                                absoluteIdx + 1 === cursorIndex

                              const isInsertMode = mode === 'insert'

                              const isCursorOnLastCharInInsertMode =
                                isInsertMode &&
                                isCursorOnLastChar &&
                                charIdx === line.length - 1

                              return (
                                <>
                                  <span
                                    key={charIdx}
                                    className={`${
                                      isCursorPosition
                                        ? mode === 'normal'
                                          ? 'bg-emerald-500 text-white rounded'
                                          : 'bg-amber-500 text-white rounded'
                                        : ''
                                    }`}
                                  >
                                    {char === ' ' ? '\u00A0' : char}
                                  </span>
                                  {isCursorOnLastCharInInsertMode && (
                                    <span className="bg-amber-500 text-white rounded">
                                      {'\u00A0'}
                                    </span>
                                  )}
                                </>
                              )
                            })}
                            {/* empty line */}
                            {/* Display cursor on empty line */}
                            {line.length === 0 &&
                              (isCursorOnThisLine ? (
                                <span
                                  className={
                                    mode === 'normal'
                                      ? 'bg-emerald-500 text-white rounded'
                                      : 'bg-amber-500 text-white rounded'
                                  }
                                >
                                  {'\u00A0'}
                                </span>
                              ) : (
                                <span className="">{'\u00A0'}</span>
                              ))}
                          </div>
                        )
                      })
                    : cell.content || '\u00A0'}
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
            )
          })}
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
