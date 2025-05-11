import React, { useState, useEffect } from 'react'
import {
  useKeyboardHandler,
  KeyActionMap,
} from '../../hooks/useKeyboardHandler'
import ConfettiBurst from './ConfettiBurst'
import LevelTimer from '../common/LevelTimer'

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
  const [lines, setLines] = useState<TextLine[]>([])
  const [activeLine, setActiveLine] = useState<number | null>(null)
  const [isInsertMode, setIsInsertMode] = useState(false)
  const [insertCommand, setInsertCommand] = useState<string>('')
  const [score, setScore] = useState(0)
  const [scoreAnimation, setScoreAnimation] = useState(false)
  const [showConfetti, setShowConfetti] = useState(false)
  const [lastKeyPressed, setLastKeyPressed] = useState<string>('')
  const [allCompleted, setAllCompleted] = useState(false)
  const [cursorPosition, setCursorPosition] = useState<
    'start' | 'end' | 'normal'
  >('normal')

  // Initialize lines with challenges
  useEffect(() => {
    const initialLines: TextLine[] = [
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
    setLines(initialLines)
    setActiveLine(0)
  }, [])

  // Check if all lines are completed
  useEffect(() => {
    if (lines.length > 0 && lines.every((line) => line.completed)) {
      setAllCompleted(true)
      setShowConfetti(true)

      // Reset after celebration
      setTimeout(() => {
        setShowConfetti(false)
      }, 3000)
    }
  }, [lines])

  // Define key actions
  const keyActions: KeyActionMap = {
    j: () => {
      if (!isInsertMode && activeLine !== null) {
        setLastKeyPressed('j')
        setActiveLine(Math.min(lines.length - 1, activeLine + 1))
      }
    },
    k: () => {
      if (!isInsertMode && activeLine !== null) {
        setLastKeyPressed('k')
        setActiveLine(Math.max(0, activeLine - 1))
      }
    },
    I: () => {
      if (!isInsertMode) {
        setLastKeyPressed('I')
        setInsertCommand('I')
        setIsInsertMode(true)
        setCursorPosition('start')
      }
    },
    A: () => {
      if (!isInsertMode) {
        setLastKeyPressed('A')
        setInsertCommand('A')
        setIsInsertMode(true)
        setCursorPosition('end')
      }
    },
    o: () => {
      if (!isInsertMode) {
        setLastKeyPressed('o')
        setInsertCommand('o')
        setIsInsertMode(true)

        // In a real editor, this would create a new line below
        if (activeLine !== null) {
          const updatedLines = [...lines]
          const parts = updatedLines[activeLine].content.split('\n')

          // For our simulation, we'll add a newline character
          if (!updatedLines[activeLine].content.includes('\n')) {
            updatedLines[activeLine].content += '\n'
            setLines(updatedLines)
          }
        }
      }
    },
    O: () => {
      if (!isInsertMode) {
        setLastKeyPressed('O')
        setInsertCommand('O')
        setIsInsertMode(true)

        // In a real editor, this would create a new line above
        if (activeLine !== null) {
          const updatedLines = [...lines]

          // For our simulation, we'll add a newline character at the beginning
          if (!updatedLines[activeLine].content.includes('\n')) {
            updatedLines[activeLine].content =
              '\n' + updatedLines[activeLine].content
            setLines(updatedLines)
          }
        }
      }
    },
    Escape: () => {
      if (isInsertMode) {
        setLastKeyPressed('Escape')
        setIsInsertMode(false)
        setCursorPosition('normal')

        // Check if the current line is completed
        if (activeLine !== null) {
          const currentLine = lines[activeLine]

          // Normalize line breaks for comparison
          const normalizedContent = currentLine.content.replace(/\r\n/g, '\n')
          const normalizedExpected = currentLine.expected.replace(/\r\n/g, '\n')

          if (
            normalizedContent === normalizedExpected &&
            !currentLine.completed
          ) {
            // Mark as completed
            const updatedLines = [...lines]
            updatedLines[activeLine].completed = true
            setLines(updatedLines)

            // Update score
            setScore((prev) => prev + 15)
            setScoreAnimation(true)
            setTimeout(() => setScoreAnimation(false), 500)
          }
        }
      }
    },
  }

  // Handle character input in insert mode
  const handleCharInput = (char: string) => {
    if (isInsertMode && activeLine !== null) {
      const updatedLines = [...lines]
      const currentLine = updatedLines[activeLine]

      switch (insertCommand) {
        case 'I':
          // Insert at beginning of line
          if (currentLine.content.includes('\n')) {
            const parts = currentLine.content.split('\n')
            parts[0] = char + parts[0]
            updatedLines[activeLine].content = parts.join('\n')
          } else {
            updatedLines[activeLine].content = char + currentLine.content
          }
          break

        case 'A':
          // Append at end of line
          if (currentLine.content.includes('\n')) {
            const parts = currentLine.content.split('\n')
            parts[parts.length - 1] = parts[parts.length - 1] + char
            updatedLines[activeLine].content = parts.join('\n')
          } else {
            updatedLines[activeLine].content = currentLine.content + char
          }
          break

        case 'o':
          // Add after the newline
          if (currentLine.content.endsWith('\n')) {
            updatedLines[activeLine].content += char
          } else if (currentLine.content.includes('\n')) {
            const parts = currentLine.content.split('\n')
            parts[parts.length - 1] += char
            updatedLines[activeLine].content = parts.join('\n')
          }
          break

        case 'O':
          // Add before the first line
          if (currentLine.content.startsWith('\n')) {
            updatedLines[activeLine].content = char + currentLine.content
          } else if (currentLine.content.includes('\n')) {
            const parts = currentLine.content.split('\n')
            if (parts[0] === '') {
              parts[0] = char
            } else {
              parts.unshift(char)
            }
            updatedLines[activeLine].content = parts.join('\n')
          }
          break
      }

      setLines(updatedLines)
    }
  }
  
  // Handle backspace key in insert mode
  const handleBackspace = () => {
    if (isInsertMode && activeLine !== null) {
      const updatedLines = [...lines]
      const currentLine = updatedLines[activeLine]
      
      switch (insertCommand) {
        case 'I':
          // Delete at beginning of line
          if (currentLine.content.includes('\n')) {
            const parts = currentLine.content.split('\n')
            if (parts[0].length > 0) {
              parts[0] = parts[0].slice(0, -1)
              updatedLines[activeLine].content = parts.join('\n')
            }
          } else if (currentLine.content.length > 0) {
            updatedLines[activeLine].content = currentLine.content.slice(1)
          }
          break
          
        case 'A':
          // Delete at end of line
          if (currentLine.content.includes('\n')) {
            const parts = currentLine.content.split('\n')
            const lastPart = parts[parts.length - 1]
            if (lastPart.length > 0) {
              parts[parts.length - 1] = lastPart.slice(0, -1)
              updatedLines[activeLine].content = parts.join('\n')
            }
          } else if (currentLine.content.length > 0) {
            updatedLines[activeLine].content = currentLine.content.slice(0, -1)
          }
          break
          
        case 'o':
          // Delete after the newline
          if (currentLine.content.endsWith('\n')) {
            // Do nothing if there's just a newline
          } else if (currentLine.content.includes('\n')) {
            const parts = currentLine.content.split('\n')
            const lastPart = parts[parts.length - 1]
            if (lastPart.length > 0) {
              parts[parts.length - 1] = lastPart.slice(0, -1)
              updatedLines[activeLine].content = parts.join('\n')
            }
          }
          break
          
        case 'O':
          // Delete before the first line
          if (currentLine.content.startsWith('\n')) {
            // Do nothing if there's just a newline
          } else if (currentLine.content.includes('\n')) {
            const parts = currentLine.content.split('\n')
            if (parts[0].length > 0) {
              parts[0] = parts[0].slice(0, -1)
              updatedLines[activeLine].content = parts.join('\n')
            }
          }
          break
      }
      
      setLines(updatedLines)
    }
  }

  // Register keyboard handler
  const { lastKeyPressed: keyboardLastKey } = useKeyboardHandler({
    keyActionMap: keyActions,
    dependencies: [isInsertMode, activeLine, lines, lastKeyPressed],
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
  }, [isInsertMode, activeLine, lines, insertCommand])

  return (
    <div className="flex flex-col items-center gap-6">
      <div className="text-center mb-4">
        <h3 className="text-xl font-bold mb-2">Insert at Line Positions</h3>
        <p className="text-zinc-300 mb-4">
          Use <kbd className="px-2 py-1 bg-zinc-800 rounded">I</kbd> to insert
          at line start, <kbd className="px-2 py-1 bg-zinc-800 rounded">A</kbd>{' '}
          to append at line end,{' '}
          <kbd className="px-2 py-1 bg-zinc-800 rounded">o</kbd> to open line
          below, and <kbd className="px-2 py-1 bg-zinc-800 rounded">O</kbd> to
          open line above.
        </p>
        <p className="text-zinc-400 text-sm">
          Edit each line to match the expected text shown below it.
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

      {/* Challenge lines */}
      <div className="w-full max-w-[90vmin]">
        <div className="flex flex-col gap-4">
          {lines.map((line, index) => (
            <div
              key={line.id}
              className={`relative p-4 rounded-lg transition-all duration-200 ${
                activeLine === index
                  ? 'bg-zinc-700 ring-2 ring-emerald-500 shadow-lg'
                  : 'bg-zinc-800'
              } ${line.completed ? 'border-2 border-emerald-500' : ''}`}
              onClick={() => {
                if (!isInsertMode) {
                  setActiveLine(index)
                }
              }}
            >
              <div className="font-mono mb-2 whitespace-pre-wrap min-h-[2rem] text-lg">
                {activeLine === index && cursorPosition === 'start' && (
                  <span 
                    className={`inline-block w-2 h-5 ${isInsertMode ? 'bg-orange-400' : 'bg-emerald-400'} animate-pulse mr-0.5`}
                  ></span>
                )}

                {line.content.split('\n').map((part, i, arr) => (
                  <React.Fragment key={i}>
                    {part}
                    {i < arr.length - 1 && <br />}
                  </React.Fragment>
                ))}

                {activeLine === index && cursorPosition === 'end' && (
                  <span 
                    className={`inline-block w-2 h-5 ${isInsertMode ? 'bg-orange-400' : 'bg-emerald-400'} animate-pulse ml-0.5`}
                  ></span>
                )}
              </div>

              <div className="text-sm text-zinc-400 mt-2 border-t border-zinc-700 pt-2">
                <div className="font-semibold mb-1">Expected:</div>
                <div className="whitespace-pre-wrap">
                  {line.expected.split('\n').map((part, i, arr) => (
                    <React.Fragment key={i}>
                      {part}
                      {i < arr.length - 1 && <br />}
                    </React.Fragment>
                  ))}
                </div>
              </div>

              {line.completed && (
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
          Mode: {isInsertMode ? `Insert (${insertCommand})` : 'Normal'}
        </span>
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
    </div>
  )
}

export default LineInsertLevel7
