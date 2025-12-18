import { motion } from 'framer-motion'
import { Clipboard, RefreshCw } from 'lucide-react'
import { useEffect, useState } from 'react'
import {
  KeyActionMap,
  useKeyboardHandler,
} from '../../hooks/useKeyboardHandler'
import { VIM_MODES, VimMode } from '../../utils/constants'
import { KBD } from '../common/KBD'
import LevelTimer from '../common/LevelTimer'
import ModeIndicator from '../common/ModeIndicator'
import Scoreboard from '../common/Scoreboard'
import ConfettiBurst from './ConfettiBurst'

export default function YankPutLevel15() {
  // Grid with lines to yank and targets to paste into
  const initialGrid = [
    ['C', 'o', 'p', 'y', ' ', 't', 'h', 'i', 's', ' ', 'l', 'i', 'n', 'e'],
    ['_', '_', '_', '_', '_', '_', '_', '_', '_', '_', '_', '_', '_', '_'],
    ['T', 'h', 'e', ' ', 'q', 'u', 'i', 'c', 'k', ' ', 'f', 'o', 'x', ' '],
    ['T', 'h', 'e', ' ', '_', '_', '_', '_', '_', ' ', 'd', 'o', 'g', ' '],
    ['w', 'o', 'r', 'l', 'd', ' ', 'h', 'e', 'l', 'l', 'o', ' ', ' ', ' '],
    ['_', '_', '_', '_', '_', ' ', '_', '_', '_', '_', '_', ' ', ' ', ' '],
  ]

  // Target definitions
  const targets = [
    {
      id: 'line-paste',
      row: 1,
      type: 'line',
      expectedContent: 'Copy this line',
      description: 'Paste the copied line here',
    },
    {
      id: 'word-paste',
      row: 3,
      col: 4,
      type: 'word',
      expectedWord: 'quick',
      description: 'Paste "quick" here',
    },
    {
      id: 'reorder-1',
      row: 5,
      col: 0,
      type: 'word',
      expectedWord: 'hello',
      description: 'Paste "hello" first',
    },
    {
      id: 'reorder-2',
      row: 5,
      col: 6,
      type: 'word',
      expectedWord: 'world',
      description: 'Paste "world" second',
    },
  ]
  const [grid, setGrid] = useState(initialGrid.map((row) => [...row]))
  const [position, setPosition] = useState({ row: 0, col: 0 })
  const [score, setScore] = useState(0)
  const [completedTargets, setCompletedTargets] = useState<Set<string>>(
    new Set(),
  )
  const [showConfetti, setShowConfetti] = useState(false)
  const [levelCompleted, setLevelCompleted] = useState(false)
  const [, setLastKeyPressed] = useState<string>('')
  const [mode, setMode] = useState<VimMode>(VIM_MODES.NORMAL)
  const [pendingCommand, setPendingCommand] = useState<string>('')

  // Yank-specific state
  const [yankBuffer, setYankBuffer] = useState<string | null>(null)
  const [yankType, setYankType] = useState<'line' | 'characterwise' | null>(
    null,
  )
  const [showYankAnimation, setShowYankAnimation] = useState(false)
  const [showPasteAnimation, setShowPasteAnimation] = useState<{
    row: number
    col: number
  } | null>(null)

  // History for undo
  const [gridHistory, setGridHistory] = useState<
    {
      grid: string[][]
      completedTargets: Set<string>
      score: number
    }[]
  >([
    {
      grid: initialGrid.map((row) => [...row]),
      completedTargets: new Set(),
      score: 0,
    },
  ])

  const [feedbackMessage, setFeedbackMessage] = useState<string>('')

  const MAX_SCORE = targets.length

  // Reset animations
  useEffect(() => {
    if (showYankAnimation) {
      const timer = setTimeout(() => setShowYankAnimation(false), 500)
      return () => clearTimeout(timer)
    }
  }, [showYankAnimation])

  useEffect(() => {
    if (showPasteAnimation) {
      const timer = setTimeout(() => setShowPasteAnimation(null), 500)
      return () => clearTimeout(timer)
    }
  }, [showPasteAnimation])

  useEffect(() => {
    if (feedbackMessage) {
      const timer = setTimeout(() => setFeedbackMessage(''), 3000)
      return () => clearTimeout(timer)
    }
  }, [feedbackMessage])

  // Check if level is completed
  useEffect(() => {
    if (score === MAX_SCORE && !levelCompleted) {
      setLevelCompleted(true)
      setShowConfetti(true)
      setTimeout(() => setShowConfetti(false), 3000)
    }
  }, [score, MAX_SCORE, levelCompleted])

  // Handle ESC key for level completion reset
  useEffect(() => {
    if (levelCompleted) {
      const handleEscKey = (e: KeyboardEvent) => {
        if (e.key === 'Escape') {
          handleRestart()
        }
      }
      window.addEventListener('keydown', handleEscKey)
      return () => window.removeEventListener('keydown', handleEscKey)
    }
  }, [levelCompleted])

  const handleRestart = () => {
    setGrid(initialGrid.map((row) => [...row]))
    setPosition({ row: 0, col: 0 })
    setScore(0)
    setCompletedTargets(new Set())
    setLevelCompleted(false)
    setShowConfetti(false)
    setLastKeyPressed('')
    setMode(VIM_MODES.NORMAL)
    setPendingCommand('')
    setYankBuffer(null)
    setYankType(null)
    setShowYankAnimation(false)
    setShowPasteAnimation(null)
    setFeedbackMessage('')
    setGridHistory([
      {
        grid: initialGrid.map((row) => [...row]),
        completedTargets: new Set(),
        score: 0,
      },
    ])
  }

  // Yank entire line
  const yankLine = () => {
    const lineContent = grid[position.row].join('').trim()
    setYankBuffer(lineContent)
    setYankType('line')
    setShowYankAnimation(true)
    setFeedbackMessage(
      `Yanked line: "${lineContent.substring(0, 20)}${lineContent.length > 20 ? '...' : ''}"`,
    )
  }

  // Yank word
  const yankWord = () => {
    const currentRow = grid[position.row]
    const startCol = position.col
    let endCol = position.col

    // Skip if on space or underscore
    if (currentRow[startCol] === ' ' || currentRow[startCol] === '_') {
      setFeedbackMessage('Cursor not on a word!')
      return
    }

    // Find end of word (include trailing space like vim)
    while (
      endCol < currentRow.length &&
      currentRow[endCol] !== ' ' &&
      currentRow[endCol] !== '_'
    ) {
      endCol++
    }

    const word = currentRow.slice(startCol, endCol).join('')
    setYankBuffer(word)
    setYankType('characterwise')
    setShowYankAnimation(true)
    setFeedbackMessage(`Yanked word: "${word}"`)
  }

  // Paste after cursor
  const pasteAfter = () => {
    if (!yankBuffer) {
      setFeedbackMessage('Nothing in clipboard! Use yy or yw first.')
      return
    }

    // Save current state to history
    setGridHistory((prev) => [
      ...prev,
      {
        grid: grid.map((row) => [...row]),
        completedTargets: new Set(completedTargets),
        score: score,
      },
    ])

    if (yankType === 'line') {
      // For line yank, paste on the next line
      const targetRow = position.row + 1
      if (targetRow < grid.length) {
        setGrid((prev) => {
          const newGrid = prev.map((row) => [...row])
          // Fill the target row with yanked content
          const chars = yankBuffer.split('')
          for (let i = 0; i < newGrid[targetRow].length; i++) {
            newGrid[targetRow][i] = chars[i] || ' '
          }
          return newGrid
        })
        setShowPasteAnimation({ row: targetRow, col: 0 })
        checkTargetCompletion(targetRow, 0, 'line')
      }
    } else {
      // For characterwise yank, paste at cursor position (simplified for beginners)
      const targetRow = position.row
      const targetCol = position.col
      setGrid((prev) => {
        const newGrid = prev.map((row) => [...row])
        const chars = yankBuffer.split('')
        for (
          let i = 0;
          i < chars.length && targetCol + i < newGrid[targetRow].length;
          i++
        ) {
          newGrid[targetRow][targetCol + i] = chars[i]
        }
        return newGrid
      })
      setShowPasteAnimation({ row: targetRow, col: targetCol })
      checkTargetCompletion(targetRow, targetCol, 'word')
    }
  }

  // Paste before cursor
  const pasteBefore = () => {
    if (!yankBuffer) {
      setFeedbackMessage('Nothing in clipboard! Use yy or yw first.')
      return
    }

    // Save current state to history
    setGridHistory((prev) => [
      ...prev,
      {
        grid: grid.map((row) => [...row]),
        completedTargets: new Set(completedTargets),
        score: score,
      },
    ])

    if (yankType === 'line') {
      // For line yank, paste on current line (overwrite)
      const targetRow = position.row
      setGrid((prev) => {
        const newGrid = prev.map((row) => [...row])
        const chars = yankBuffer.split('')
        for (let i = 0; i < newGrid[targetRow].length; i++) {
          newGrid[targetRow][i] = chars[i] || ' '
        }
        return newGrid
      })
      setShowPasteAnimation({ row: targetRow, col: 0 })
      checkTargetCompletion(targetRow, 0, 'line')
    } else {
      // For characterwise yank, paste at cursor position
      const targetRow = position.row
      const targetCol = position.col
      setGrid((prev) => {
        const newGrid = prev.map((row) => [...row])
        const chars = yankBuffer.split('')
        for (
          let i = 0;
          i < chars.length && targetCol + i < newGrid[targetRow].length;
          i++
        ) {
          newGrid[targetRow][targetCol + i] = chars[i]
        }
        return newGrid
      })
      setShowPasteAnimation({ row: targetRow, col: targetCol })
      checkTargetCompletion(targetRow, targetCol, 'word')
    }
  }

  // Check if paste completed a target
  const checkTargetCompletion = (row: number, col: number, type: string) => {
    const target = targets.find((t) => {
      if (t.type === 'line' && type === 'line') {
        return t.row === row
      }
      if (t.type === 'word' && type === 'word') {
        // Check if we're pasting in the right area
        return (
          t.row === row && t.col !== undefined && Math.abs(t.col - col) <= 1
        )
      }
      return false
    })

    if (target && !completedTargets.has(target.id)) {
      // Verify content matches
      let matches = false
      if (target.type === 'line' && 'expectedContent' in target) {
        matches = yankBuffer === target.expectedContent
      } else if (target.type === 'word' && 'expectedWord' in target) {
        matches = yankBuffer === target.expectedWord
      }

      if (matches) {
        setCompletedTargets((prev) => new Set([...prev, target.id]))
        setScore((prev) => prev + 1)
        setFeedbackMessage('Correct paste!')
      } else {
        setFeedbackMessage(
          `Pasted, but expected "${('expectedWord' in target ? target.expectedWord : '') || ('expectedContent' in target ? target.expectedContent : '')}". Use u to undo.`,
        )
      }
    }
  }

  const undoLastAction = () => {
    if (gridHistory.length > 1) {
      const newHistory = gridHistory.slice(0, -1)
      const previousState = newHistory[newHistory.length - 1]

      setGrid(previousState.grid.map((row) => [...row]))
      setCompletedTargets(new Set(previousState.completedTargets))
      setScore(previousState.score)
      setGridHistory(newHistory)
      setFeedbackMessage('Undone!')
    }
  }

  // Word movement helpers
  const moveToNextWord = () => {
    const currentRow = grid[position.row]
    let newCol = position.col

    // Skip current word
    while (newCol < currentRow.length && currentRow[newCol] !== ' ') {
      newCol++
    }
    // Skip spaces
    while (newCol < currentRow.length && currentRow[newCol] === ' ') {
      newCol++
    }

    setPosition((prev) => ({
      ...prev,
      col: Math.min(currentRow.length - 1, newCol),
    }))
  }

  const moveToPrevWord = () => {
    const currentRow = grid[position.row]
    let newCol = position.col

    if (newCol > 0) newCol--

    // Skip spaces
    while (newCol > 0 && currentRow[newCol] === ' ') {
      newCol--
    }
    // Skip to start of word
    while (newCol > 0 && currentRow[newCol - 1] !== ' ') {
      newCol--
    }

    setPosition((prev) => ({
      ...prev,
      col: Math.max(0, newCol),
    }))
  }

  const moveToWordEnd = () => {
    const currentRow = grid[position.row]
    let newCol = position.col

    // Skip spaces first
    while (newCol < currentRow.length && currentRow[newCol] === ' ') {
      newCol++
    }
    // Move to end of word
    while (newCol < currentRow.length - 1 && currentRow[newCol + 1] !== ' ') {
      newCol++
    }

    setPosition((prev) => ({
      ...prev,
      col: Math.min(currentRow.length - 1, newCol),
    }))
  }

  // Handle command sequences
  const handleCommand = (key: string) => {
    if (pendingCommand === 'y') {
      if (key === 'y') {
        yankLine()
        setLastKeyPressed('yy')
        setPendingCommand('')
        return
      } else if (key === 'w') {
        yankWord()
        setLastKeyPressed('yw')
        setPendingCommand('')
        return
      } else {
        setPendingCommand('')
      }
    }

    // Single character commands
    if (key === 'y') {
      setPendingCommand('y')
      setLastKeyPressed('y')
      return
    }

    if (key === 'p') {
      pasteAfter()
      setLastKeyPressed('p')
      return
    }

    if (key === 'P') {
      pasteBefore()
      setLastKeyPressed('P')
      return
    }

    // Movement commands
    if (key === 'h') {
      setPosition((prev) => ({
        ...prev,
        col: Math.max(0, prev.col - 1),
      }))
      setLastKeyPressed('h')
      setPendingCommand('')
    } else if (key === 'j') {
      setPosition((prev) => ({
        ...prev,
        row: Math.min(grid.length - 1, prev.row + 1),
      }))
      setLastKeyPressed('j')
      setPendingCommand('')
    } else if (key === 'k') {
      setPosition((prev) => ({
        ...prev,
        row: Math.max(0, prev.row - 1),
      }))
      setLastKeyPressed('k')
      setPendingCommand('')
    } else if (key === 'l') {
      setPosition((prev) => ({
        ...prev,
        col: Math.min(grid[0].length - 1, prev.col + 1),
      }))
      setLastKeyPressed('l')
      setPendingCommand('')
    } else if (key === 'w') {
      moveToNextWord()
      setLastKeyPressed('w')
      setPendingCommand('')
    } else if (key === 'b') {
      moveToPrevWord()
      setLastKeyPressed('b')
      setPendingCommand('')
    } else if (key === 'e') {
      moveToWordEnd()
      setLastKeyPressed('e')
      setPendingCommand('')
    } else if (key === '0') {
      setPosition((prev) => ({
        ...prev,
        col: 0,
      }))
      setLastKeyPressed('0')
      setPendingCommand('')
    } else if (key === '$') {
      setPosition((prev) => ({
        ...prev,
        col: grid[prev.row].length - 1,
      }))
      setLastKeyPressed('$')
      setPendingCommand('')
    } else if (key === 'u') {
      undoLastAction()
      setLastKeyPressed('u')
      setPendingCommand('')
    }
  }

  const keyActionMap: KeyActionMap = {
    h: () => handleCommand('h'),
    j: () => handleCommand('j'),
    k: () => handleCommand('k'),
    l: () => handleCommand('l'),
    w: () => handleCommand('w'),
    b: () => handleCommand('b'),
    e: () => handleCommand('e'),
    '0': () => handleCommand('0'),
    $: () => handleCommand('$'),
    y: () => handleCommand('y'),
    p: () => handleCommand('p'),
    P: () => handleCommand('P'),
    u: () => handleCommand('u'),
    Escape: () => {
      setPendingCommand('')
      setMode(VIM_MODES.NORMAL)
      setLastKeyPressed('Escape')
    },
  }

  useKeyboardHandler({
    keyActionMap,
    dependencies: [
      position,
      grid,
      completedTargets,
      pendingCommand,
      gridHistory,
      yankBuffer,
      yankType,
    ],
  })

  // Check if cell is a target location
  const isTargetCell = (row: number, col: number) => {
    return targets.some((t) => {
      if (t.type === 'line' && t.row === row) {
        return !completedTargets.has(t.id)
      }
      if (t.type === 'word' && t.row === row && t.col !== undefined) {
        const isInRange = col >= t.col && col < t.col + 5
        return isInRange && !completedTargets.has(t.id)
      }
      return false
    })
  }

  // Check if cell is a source (something to yank)
  const isSourceCell = (row: number, col: number) => {
    // Row 0 is line source, row 2 word "quick", row 4 words "world" and "hello"
    if (row === 0) return true
    if (row === 2 && col >= 4 && col <= 8) return true // "quick"
    if (row === 4 && col >= 0 && col <= 4) return true // "world"
    if (row === 4 && col >= 6 && col <= 10) return true // "hello"
    return false
  }

  return (
    <div className="flex flex-col items-center gap-6">
      {showConfetti && <ConfettiBurst />}

      <div className="text-center">
        <h2 className="text-2xl font-bold mb-2 text-amber-400">
          Yank & Put (Copy & Paste)
        </h2>
        <p className="text-zinc-400 px-2">
          Use <KBD>yy</KBD> to yank a line, <KBD>yw</KBD> to yank a word,{' '}
          <KBD>p</KBD> to paste after, <KBD>P</KBD> to paste before
        </p>
      </div>

      <div className="flex justify-center items-center gap-4 mb-4">
        <Scoreboard score={score} maxScore={MAX_SCORE} />
        <button
          onClick={handleRestart}
          className="bg-zinc-800 p-3 rounded-lg hover:bg-zinc-700 transition-colors"
          aria-label="Reset Level"
        >
          <RefreshCw size={18} className="text-zinc-400" />
        </button>
        <ModeIndicator isInsertMode={mode === VIM_MODES.INSERT} />
      </div>

      {/* Clipboard Indicator */}
      <motion.div
        className={`bg-zinc-800 rounded-lg p-4 border-2 ${
          yankBuffer ? 'border-amber-500/50' : 'border-zinc-600'
        } min-w-[300px]`}
        animate={showYankAnimation ? { scale: [1, 1.05, 1] } : {}}
        transition={{ duration: 0.3 }}
      >
        <div className="flex items-center gap-2 mb-1">
          <Clipboard
            size={16}
            className={yankBuffer ? 'text-amber-400' : 'text-zinc-500'}
          />
          <span className="text-xs text-zinc-400 uppercase tracking-wide">
            Clipboard
          </span>
          {yankType && (
            <span className="text-xs text-zinc-500 ml-auto">
              [{yankType === 'line' ? 'LINE' : 'WORD'}]
            </span>
          )}
        </div>
        <div className="font-mono text-sm">
          {yankBuffer ? (
            <span className="text-amber-300">
              "
              {yankBuffer.length > 25
                ? yankBuffer.substring(0, 25) + '...'
                : yankBuffer}
              "
            </span>
          ) : (
            <span className="text-zinc-600 italic">empty</span>
          )}
        </div>
      </motion.div>

      {/* Grid */}
      <div className="bg-zinc-800 rounded-lg border-2 border-zinc-600">
        <div className="grid gap-1 p-6">
          {grid.map((row, rowIdx) => (
            <div key={rowIdx} className="flex gap-1" data-row={rowIdx}>
              {row.map((char, colIdx) => {
                const isCursor =
                  position.row === rowIdx && position.col === colIdx
                const isTarget = isTargetCell(rowIdx, colIdx)
                const isSource = isSourceCell(rowIdx, colIdx)
                const isPasteLocation =
                  showPasteAnimation?.row === rowIdx &&
                  showPasteAnimation?.col === colIdx

                return (
                  <motion.div
                    key={`${rowIdx}-${colIdx}`}
                    className={`
                      relative w-8 h-10 flex items-center justify-center text-lg font-mono rounded transition-all duration-200
                      ${
                        isCursor
                          ? 'bg-emerald-400 text-black scale-110 shadow-lg ring-2 ring-emerald-300'
                          : isTarget
                            ? 'bg-cyan-900/30 border border-dashed border-cyan-500/50 text-cyan-400'
                            : isSource && !isCursor
                              ? 'bg-amber-900/30 text-amber-300'
                              : 'bg-zinc-700 text-zinc-300'
                      }
                    `}
                    animate={
                      isPasteLocation
                        ? {
                            scale: [1, 1.2, 1],
                            backgroundColor: ['#3f3f46', '#10b981', '#3f3f46'],
                          }
                        : {}
                    }
                    transition={{ duration: 0.3 }}
                  >
                    {char}
                    {isCursor && (
                      <div className="absolute -top-1 -right-1 w-3 h-3 bg-emerald-400 rounded-full animate-pulse" />
                    )}
                  </motion.div>
                )
              })}
            </div>
          ))}
        </div>

        {/* Command Line */}
        <div className="bg-zinc-900 rounded-b-lg px-4 py-2 border-t border-zinc-600 font-mono text-sm min-h-[2.5rem] flex items-center">
          {pendingCommand && (
            <span className="text-yellow-300">
              {pendingCommand}
              <span className="animate-pulse">_</span>
            </span>
          )}
          {!pendingCommand && (
            <span className="text-zinc-500">-- NORMAL --</span>
          )}
        </div>
      </div>

      {/* Instructions */}
      <div className="bg-zinc-800 rounded-lg p-4 max-w-2xl">
        <div className="grid grid-cols-4 gap-4 text-sm mb-3">
          <div className="text-center">
            <div className="text-amber-400 font-bold">yy</div>
            <div className="text-xs text-zinc-400">Yank line</div>
          </div>
          <div className="text-center">
            <div className="text-amber-400 font-bold">yw</div>
            <div className="text-xs text-zinc-400">Yank word</div>
          </div>
          <div className="text-center">
            <div className="text-cyan-400 font-bold">p</div>
            <div className="text-xs text-zinc-400">Put after</div>
          </div>
          <div className="text-center">
            <div className="text-cyan-400 font-bold">P</div>
            <div className="text-xs text-zinc-400">Put before</div>
          </div>
        </div>

        <div className="text-xs text-zinc-500 text-center">
          <span className="text-amber-400/70">Amber</span> = source to copy |{' '}
          <span className="text-cyan-400/70">Cyan dashed</span> = paste target |{' '}
          <KBD>u</KBD> to undo
        </div>
      </div>

      {/* Tasks */}
      <div className="bg-zinc-800/50 rounded-lg p-4 max-w-2xl">
        <h3 className="text-sm font-semibold text-zinc-300 mb-2">Tasks:</h3>
        <ol className="text-sm text-zinc-400 space-y-1 list-decimal list-inside">
          <li
            className={
              completedTargets.has('line-paste')
                ? 'text-emerald-400 line-through'
                : ''
            }
          >
            Yank line 1 with <KBD>yy</KBD>, move to line 2, paste with{' '}
            <KBD>p</KBD>
          </li>
          <li
            className={
              completedTargets.has('word-paste')
                ? 'text-emerald-400 line-through'
                : ''
            }
          >
            Yank word "quick" with <KBD>yw</KBD>, paste into line 4
          </li>
          <li
            className={
              completedTargets.has('reorder-1') &&
              completedTargets.has('reorder-2')
                ? 'text-emerald-400 line-through'
                : ''
            }
          >
            Reorder "world hello" to "hello world" on line 6
          </li>
        </ol>
      </div>

      {/* Level completion */}
      {levelCompleted && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-zinc-800 rounded-lg p-8 text-center max-w-md">
            <h2 className="text-3xl font-bold mb-4 text-amber-400">
              Level Complete!
            </h2>
            <p className="text-zinc-300 mb-6">
              You've mastered Vim's yank and put commands! You can now copy and
              paste text like a pro.
            </p>
            <div className="text-2xl font-bold text-green-400 mb-4">
              Score: {score}/{MAX_SCORE}
            </div>
            <p className="text-zinc-400 text-sm">
              Press <KBD>Esc</KBD> to play again
            </p>
          </div>
        </div>
      )}

      <div className="mt-6">
        <LevelTimer
          levelId="level-15-yank-put"
          isActive={!levelCompleted}
          isCompleted={levelCompleted}
        />
      </div>

      {/* Feedback Message */}
      {feedbackMessage && (
        <motion.div
          className="fixed bottom-8 left-1/2 transform -translate-x-1/2 z-50 p-3 bg-zinc-800 border border-amber-500/50 rounded-lg max-w-md backdrop-blur-sm"
          initial={{ y: 100, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: 100, opacity: 0 }}
          transition={{ type: 'spring', stiffness: 300, damping: 30 }}
        >
          <p className="text-amber-200 text-sm font-medium">
            {feedbackMessage}
          </p>
        </motion.div>
      )}
    </div>
  )
}
