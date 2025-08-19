import { motion } from 'framer-motion'
import { HelpCircleIcon, RefreshCw } from 'lucide-react'
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

export default function AdvancedDeleteLevel11() {
  // Grid with lines to delete and words to delete
  const initialGrid = [
    ['D', 'e', 'l', 'e', 't', 'e', ' ', 'W', 'o', 'r', 'd'],
    ['T', 'h', 'i', 's', ' ', 'l', 'i', 'n', 'e', ' ', '🗑'], // dd target (trash icon marks whole line)
    ['K', 'e', 'e', 'p', ' ', 't', 'h', 'i', 's', ' ', 'T'],
    ['R', 'e', 'm', 'o', 'v', 'e', '📝', '📝', '📝', '📝', 'D'], // D target (notebook icons mark from here to end)
    ['S', 'a', 'v', 'e', ' ', 'T', 'h', 'i', 's', ' ', 'T'],
  ]

  // Different types of delete targets
  const deleteTargets = [
    { row: 0, col: 7, type: 'dw', word: 'Word' }, // Delete word "Word"
    { row: 1, col: 10, type: 'dd' }, // Delete entire line (trash can icon)
    { row: 3, col: 6, type: 'D' }, // Delete from cursor to end (notebook icons)
  ]

  const [grid, setGrid] = useState(initialGrid.map((row) => [...row]))
  const [position, setPosition] = useState({ row: 0, col: 0 })
  const [score, setScore] = useState(0)
  const [completedTargets, setCompletedTargets] = useState<Set<string>>(
    new Set(),
  )
  const [showConfetti, setShowConfetti] = useState(false)
  const [levelCompleted, setLevelCompleted] = useState(false)
  const [lastKeyPressed, setLastKeyPressed] = useState<string>('')
  const [recentlyDeleted, setRecentlyDeleted] = useState<{
    row: number
    col: number
  } | null>(null)
  const [wrongMoveMessage, setWrongMoveMessage] = useState<string>('')
  const [mode, setMode] = useState<VimMode>(VIM_MODES.NORMAL)
  const [insertModeWarning, setInsertModeWarning] = useState<string>('')
  const [pendingCommand, setPendingCommand] = useState<string>('')

  const MAX_SCORE = deleteTargets.length

  // Reset recently deleted animation
  useEffect(() => {
    if (recentlyDeleted) {
      const timer = setTimeout(() => {
        setRecentlyDeleted(null)
      }, 500)
      return () => clearTimeout(timer)
    }
  }, [recentlyDeleted])

  // Reset wrong move message
  useEffect(() => {
    if (wrongMoveMessage) {
      const timer = setTimeout(() => {
        setWrongMoveMessage('')
      }, 4000)
      return () => clearTimeout(timer)
    }
  }, [wrongMoveMessage])

  // Reset insert mode warning
  useEffect(() => {
    if (insertModeWarning) {
      const timer = setTimeout(() => {
        setInsertModeWarning('')
      }, 3000)
      return () => clearTimeout(timer)
    }
  }, [insertModeWarning])

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
    setRecentlyDeleted(null)
    setWrongMoveMessage('')
    setMode(VIM_MODES.NORMAL)
    setInsertModeWarning('')
    setPendingCommand('')
  }

  const deleteWord = () => {
    const target = deleteTargets.find(
      (t) =>
        t.type === 'dw' &&
        t.row === position.row &&
        Math.abs(t.col - position.col) <= 3,
    )

    if (target && !completedTargets.has('dw')) {
      setGrid((prev) => {
        const newGrid = prev.map((row) => [...row])
        // Replace "Word" with dots
        for (let i = 7; i <= 10; i++) {
          newGrid[0][i] = '·'
        }
        return newGrid
      })
      setCompletedTargets((prev) => new Set([...prev, 'dw']))
      setScore((prev) => prev + 1)
      setRecentlyDeleted({ row: 0, col: 7 })
    }
  }

  const deleteLine = () => {
    if (position.row === 1 && !completedTargets.has('dd')) {
      setGrid((prev) => {
        const newGrid = prev.map((row) => [...row])
        // Mark entire line as deleted
        for (let i = 0; i < newGrid[1].length; i++) {
          newGrid[1][i] = '·'
        }
        return newGrid
      })
      setCompletedTargets((prev) => new Set([...prev, 'dd']))
      setScore((prev) => prev + 1)
      setRecentlyDeleted({ row: 1, col: 0 })
    }
  }

  const deleteToEnd = () => {
    if (position.row === 3 && position.col >= 6 && !completedTargets.has('D')) {
      setGrid((prev) => {
        const newGrid = prev.map((row) => [...row])
        // Delete from position to end of line
        for (let i = 6; i < newGrid[3].length; i++) {
          newGrid[3][i] = '·'
        }
        return newGrid
      })
      setCompletedTargets((prev) => new Set([...prev, 'D']))
      setScore((prev) => prev + 1)
      setRecentlyDeleted({ row: 3, col: 6 })
    }
  }

  // Handle command sequences
  const handleCommand = (key: string) => {
    if (pendingCommand === 'd') {
      // Handle second character of dd or dw
      if (key === 'd') {
        deleteLine()
        setLastKeyPressed('dd')
        setPendingCommand('')
        return
      } else if (key === 'w') {
        deleteWord()
        setLastKeyPressed('dw')
        setPendingCommand('')
        return
      } else {
        // Invalid second character, reset
        setPendingCommand('')
      }
    }

    // Handle single character commands
    if (key === 'd') {
      setPendingCommand('d')
      setLastKeyPressed('d')
      return
    }

    if (key === 'D') {
      deleteToEnd()
      setLastKeyPressed('D')
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
    }
  }

  const keyActionMap: KeyActionMap = {
    h: () => handleCommand('h'),
    j: () => handleCommand('j'),
    k: () => handleCommand('k'),
    l: () => handleCommand('l'),
    d: () => handleCommand('d'),
    w: () => handleCommand('w'),
    D: () => handleCommand('D'),
    Escape: () => {
      setMode(VIM_MODES.NORMAL)
      setLastKeyPressed('Escape')
    },
  }

  useKeyboardHandler({
    keyActionMap,
    dependencies: [position, grid, completedTargets, pendingCommand],
  })

  const getTargetInfo = (row: number, col: number) => {
    if (row === 0 && col >= 7 && col <= 10 && !completedTargets.has('dw')) {
      return { type: 'dw', color: 'text-blue-400', ring: 'ring-blue-400/50' }
    }
    if (row === 1 && col === 10 && !completedTargets.has('dd')) {
      return {
        type: 'dd',
        color: 'text-orange-400',
        ring: 'ring-orange-400/50',
      }
    }
    if (row === 3 && col >= 6 && !completedTargets.has('D')) {
      return { type: 'D', color: 'text-purple-400', ring: 'ring-purple-400/50' }
    }
    return null
  }

  const isDeleted = (row: number, col: number) => {
    return grid[row][col] === '·'
  }

  const isRecentlyDeleted = (row: number, col: number) => {
    return recentlyDeleted?.row === row && recentlyDeleted?.col === col
  }

  return (
    <div className="flex flex-col items-center gap-6">
      {showConfetti && <ConfettiBurst />}

      <div className="text-center">
        <h2 className="text-2xl font-bold mb-2 text-purple-400">
          Advanced Delete Operations
        </h2>
        <p className="text-zinc-400 px-2">
          Use <KBD>dw</KBD> to delete words, <KBD>dd</KBD> to delete lines, and{' '}
          <KBD>D</KBD> to delete to end
        </p>
        {pendingCommand && (
          <div className="mt-2 text-yellow-400 text-sm">
            Command pending: <KBD>{pendingCommand}</KBD> (press next key)
          </div>
        )}
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

      {/* Grid */}
      <div className="grid gap-1 p-6 bg-zinc-800 rounded-lg border-2 border-zinc-600">
        {grid.map((row, rowIdx) => (
          <div key={rowIdx} className="flex gap-1">
            {row.map((char, colIdx) => {
              const isCursor =
                position.row === rowIdx && position.col === colIdx
              const targetInfo = getTargetInfo(rowIdx, colIdx)
              const isDeletedCell = isDeleted(rowIdx, colIdx)
              const isRecentlyDeletedCell = isRecentlyDeleted(rowIdx, colIdx)

              // Cursor colors based on mode (matching ModeIndicator)
              const cursorBg =
                mode === VIM_MODES.INSERT ? 'bg-orange-400' : 'bg-emerald-400'
              const cursorRing =
                mode === VIM_MODES.INSERT
                  ? 'ring-orange-300'
                  : 'ring-emerald-300'
              const cursorDot =
                mode === VIM_MODES.INSERT ? 'bg-orange-400' : 'bg-emerald-400'

              return (
                <div
                  key={`${rowIdx}-${colIdx}`}
                  className={`
                    relative w-10 h-10 flex items-center justify-center text-lg font-mono rounded transition-all duration-200
                    ${
                      isCursor
                        ? `${cursorBg} text-black scale-110 shadow-lg ring-2 ${cursorRing}`
                        : 'bg-zinc-700'
                    }
                    ${
                      targetInfo && !isDeletedCell && !isCursor
                        ? `${targetInfo.color} font-bold ring-1 ${targetInfo.ring}`
                        : !isCursor
                          ? 'text-zinc-300'
                          : 'text-black'
                    }
                    ${isDeletedCell ? 'bg-green-600 text-green-200' : ''}
                    ${
                      isRecentlyDeletedCell
                        ? 'animate-pulse bg-green-500 scale-110'
                        : ''
                    }
                  `}
                >
                  {char}
                  {isCursor && (
                    <div
                      className={`absolute -top-1 -right-1 w-3 h-3 ${cursorDot} rounded-full animate-pulse`}
                    />
                  )}
                </div>
              )
            })}
          </div>
        ))}
      </div>

      {/* Instructions */}
      <div className="bg-zinc-800 rounded-lg p-4 max-w-2xl">
        <div className="grid grid-cols-3 gap-4 text-sm mb-3">
          <div className="text-center">
            <div className="text-blue-400 font-bold">dw</div>
            <div className="text-xs text-zinc-400">Delete word</div>
          </div>
          <div className="text-center">
            <div className="text-orange-400 font-bold">dd</div>
            <div className="text-xs text-zinc-400">Delete entire line</div>
          </div>
          <div className="text-center">
            <div className="text-purple-400 font-bold">D</div>
            <div className="text-xs text-zinc-400">Delete to end of line</div>
          </div>
        </div>
      </div>

      {/* Level completion */}
      {levelCompleted && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-zinc-800 rounded-lg p-8 text-center max-w-md">
            <h2 className="text-3xl font-bold mb-4 text-purple-400">
              🎉 Level Complete!
            </h2>
            <p className="text-zinc-300 mb-6">
              Excellent! You've mastered advanced delete operations. You can now
              delete words, lines, and text to end of line!
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
          levelId="level-11-advanced-delete"
          isActive={!levelCompleted}
          isCompleted={levelCompleted}
        />
      </div>

      {/* Floating Warning Message */}
      {wrongMoveMessage && (
        <motion.div
          className="fixed bottom-8 left-1/2 transform -translate-x-1/2 z-50 p-3 bg-yellow-900/90 border border-yellow-600 rounded-lg max-w-md backdrop-blur-sm"
          initial={{ y: 100, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: 100, opacity: 0 }}
          transition={{ type: 'spring', stiffness: 300, damping: 30 }}
        >
          <p className="text-yellow-200 text-sm font-medium">
            ⚠️ {wrongMoveMessage}
          </p>
        </motion.div>
      )}

      {/* Insert Mode Warning */}
      {insertModeWarning && (
        <motion.div
          className="fixed bottom-20 left-1/2 transform -translate-x-1/2 z-50 p-3 bg-orange-900/90 border border-orange-600 rounded-lg max-w-md backdrop-blur-sm"
          initial={{ y: 100, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: 100, opacity: 0 }}
          transition={{ type: 'spring', stiffness: 300, damping: 30 }}
        >
          <p className="text-orange-200 text-sm font-medium">
            🚫 {insertModeWarning}
          </p>
        </motion.div>
      )}
    </div>
  )
}

