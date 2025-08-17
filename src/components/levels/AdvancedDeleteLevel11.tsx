import React, { useState, useEffect } from 'react'
import {
  useKeyboardHandler,
  KeyActionMap,
} from '../../hooks/useKeyboardHandler'
import ConfettiBurst from './ConfettiBurst'
import LevelTimer from '../common/LevelTimer'
import { KeysAllowed } from '../common/KeysAllowed'
import Scoreboard from '../common/Scoreboard'
import { RefreshCw } from 'lucide-react'
import { KBD } from '../common/KBD'

export default function AdvancedDeleteLevel11() {
  // Grid with lines to delete and words to delete
  const initialGrid = [
    ['D', 'e', 'l', 'e', 't', 'e', ' ', 'W', 'o', 'r', 'd'],
    ['T', 'h', 'i', 's', ' ', 'l', 'i', 'n', 'e', ' ', '🗑'],  // dd target (trash icon marks whole line)
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

  const [grid, setGrid] = useState(initialGrid.map(row => [...row]))
  const [position, setPosition] = useState({ row: 0, col: 0 })
  const [score, setScore] = useState(0)
  const [completedTargets, setCompletedTargets] = useState<Set<string>>(new Set())
  const [showConfetti, setShowConfetti] = useState(false)
  const [levelCompleted, setLevelCompleted] = useState(false)
  const [lastKeyPressed, setLastKeyPressed] = useState<string>('')
  const [recentlyDeleted, setRecentlyDeleted] = useState<string | null>(null)

  const MAX_SCORE = deleteTargets.length

  // Reset recently deleted animation
  useEffect(() => {
    if (recentlyDeleted) {
      const timer = setTimeout(() => {
        setRecentlyDeleted(null)
      }, 800)
      return () => clearTimeout(timer)
    }
  }, [recentlyDeleted])

  // Check if level is completed
  useEffect(() => {
    if (score === MAX_SCORE && !levelCompleted) {
      setLevelCompleted(true)
      setShowConfetti(true)
      setTimeout(() => setShowConfetti(false), 3000)
    }
  }, [score, MAX_SCORE, levelCompleted])

  const handleRestart = () => {
    setGrid(initialGrid.map(row => [...row]))
    setPosition({ row: 0, col: 0 })
    setScore(0)
    setCompletedTargets(new Set())
    setLevelCompleted(false)
    setShowConfetti(false)
    setLastKeyPressed('')
    setRecentlyDeleted(null)
  }

  const deleteWord = () => {
    const target = deleteTargets.find(
      t => t.type === 'dw' && t.row === position.row && Math.abs(t.col - position.col) <= 3
    )
    
    if (target && !completedTargets.has('dw')) {
      setGrid(prev => {
        const newGrid = prev.map(row => [...row])
        // Replace "Word" with dots
        for (let i = 7; i <= 10; i++) {
          newGrid[0][i] = '·'
        }
        return newGrid
      })
      setCompletedTargets(prev => new Set([...prev, 'dw']))
      setScore(prev => prev + 1)
      setRecentlyDeleted('dw')
    }
  }

  const deleteLine = () => {
    if (position.row === 1 && !completedTargets.has('dd')) {
      setGrid(prev => {
        const newGrid = prev.map(row => [...row])
        // Mark entire line as deleted
        for (let i = 0; i < newGrid[1].length; i++) {
          newGrid[1][i] = '·'
        }
        return newGrid
      })
      setCompletedTargets(prev => new Set([...prev, 'dd']))
      setScore(prev => prev + 1)
      setRecentlyDeleted('dd')
    }
  }

  const deleteToEnd = () => {
    if (position.row === 3 && position.col >= 6 && !completedTargets.has('D')) {
      setGrid(prev => {
        const newGrid = prev.map(row => [...row])
        // Delete from position to end of line
        for (let i = 6; i < newGrid[3].length; i++) {
          newGrid[3][i] = '·'
        }
        return newGrid
      })
      setCompletedTargets(prev => new Set([...prev, 'D']))
      setScore(prev => prev + 1)
      setRecentlyDeleted('D')
    }
  }

  const keyActionMap: KeyActionMap = {
    h: () => {
      setPosition(prev => ({
        ...prev,
        col: Math.max(0, prev.col - 1)
      }))
      setLastKeyPressed('h')
    },
    j: () => {
      setPosition(prev => ({
        ...prev,
        row: Math.min(grid.length - 1, prev.row + 1)
      }))
      setLastKeyPressed('j')
    },
    k: () => {
      setPosition(prev => ({
        ...prev,
        row: Math.max(0, prev.row - 1)
      }))
      setLastKeyPressed('k')
    },
    l: () => {
      setPosition(prev => ({
        ...prev,
        col: Math.min(grid[0].length - 1, prev.col + 1)
      }))
      setLastKeyPressed('l')
    },
    d: () => {
      // Setup for dd or dw - wait for next key
      setLastKeyPressed('d')
    },
    dd: () => {
      deleteLine()
      setLastKeyPressed('dd')
    },
    dw: () => {
      deleteWord()
      setLastKeyPressed('dw')
    },
    D: () => {
      deleteToEnd()
      setLastKeyPressed('D')
    },
  }

  useKeyboardHandler({
    keyActionMap,
    dependencies: [position, grid, completedTargets],
  })

  const getTargetInfo = (row: number, col: number) => {
    if (row === 0 && col >= 7 && col <= 10 && !completedTargets.has('dw')) {
      return { type: 'dw', color: 'text-blue-400', ring: 'ring-blue-400/50' }
    }
    if (row === 1 && col === 10 && !completedTargets.has('dd')) {
      return { type: 'dd', color: 'text-orange-400', ring: 'ring-orange-400/50' }
    }
    if (row === 3 && col >= 6 && !completedTargets.has('D')) {
      return { type: 'D', color: 'text-purple-400', ring: 'ring-purple-400/50' }
    }
    return null
  }

  const isDeleted = (row: number, col: number) => {
    return grid[row][col] === '·'
  }

  return (
    <div className="flex flex-col items-center gap-6">
      {showConfetti && <ConfettiBurst />}

      <div className="text-center">
        <h2 className="text-2xl font-bold mb-2 text-purple-400">Advanced Delete Operations</h2>
        <p className="text-zinc-400 px-2">
          Use <KBD>dw</KBD> to delete words, <KBD>dd</KBD> to delete lines, and <KBD>D</KBD> to delete to end
        </p>
      </div>

      <div className="flex justify-center items-center gap-4 mb-4">
        <Scoreboard score={score} maxScore={MAX_SCORE} />
        <button
          onClick={handleRestart}
          className="flex items-center gap-2 px-4 py-2 bg-purple-600 hover:bg-purple-700 rounded-lg transition-colors"
        >
          <RefreshCw size={16} />
          Reset
        </button>
      </div>

      {/* Instructions */}
      <div className="bg-zinc-800 rounded-lg p-4 max-w-2xl">
        <div className="grid grid-cols-3 gap-4 text-sm">
          <div className="text-center">
            <div className="text-blue-400 font-bold">📝 dw</div>
            <div className="text-zinc-400">Delete word at "Word"</div>
          </div>
          <div className="text-center">
            <div className="text-orange-400 font-bold">🗑 dd</div>
            <div className="text-zinc-400">Delete entire line with trash</div>
          </div>
          <div className="text-center">
            <div className="text-purple-400 font-bold">📝 D</div>
            <div className="text-zinc-400">Delete to end from notebooks</div>
          </div>
        </div>
      </div>

      {/* Grid */}
      <div className="grid gap-1 p-6 bg-zinc-800 rounded-lg border-2 border-zinc-600">
        {grid.map((row, rowIdx) => (
          <div key={rowIdx} className="flex gap-1">
            {row.map((char, colIdx) => {
              const isCursor = position.row === rowIdx && position.col === colIdx
              const targetInfo = getTargetInfo(rowIdx, colIdx)
              const isDeletedCell = isDeleted(rowIdx, colIdx)
              
              return (
                <div
                  key={`${rowIdx}-${colIdx}`}
                  className={`
                    relative w-10 h-10 flex items-center justify-center text-lg font-mono rounded transition-all duration-200
                    ${isCursor 
                      ? 'bg-yellow-400 text-black scale-110 shadow-lg ring-2 ring-yellow-300' 
                      : 'bg-zinc-700'
                    }
                    ${targetInfo && !isDeletedCell
                      ? `${targetInfo.color} font-bold ring-1 ${targetInfo.ring}` 
                      : 'text-zinc-300'
                    }
                    ${isDeletedCell 
                      ? 'bg-green-600 text-green-200' 
                      : ''
                    }
                    ${recentlyDeleted && targetInfo?.type === recentlyDeleted
                      ? 'animate-pulse bg-green-500 scale-110' 
                      : ''
                    }
                  `}
                >
                  {char}
                  {isCursor && (
                    <div className="absolute -top-1 -right-1 w-3 h-3 bg-yellow-400 rounded-full animate-pulse" />
                  )}
                </div>
              )
            })}
          </div>
        ))}
      </div>

      {/* Controls */}
      <div className="flex justify-between items-center w-full max-w-md">
        <KeysAllowed keys={['h', 'j', 'k', 'l', 'dw', 'dd', 'D']} />
      </div>

      {/* Level completion */}
      {levelCompleted && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-zinc-800 rounded-lg p-8 text-center max-w-md">
            <h2 className="text-3xl font-bold mb-4 text-purple-400">🎉 Level Complete!</h2>
            <p className="text-zinc-300 mb-6">
              Excellent! You've mastered advanced delete operations. 
              You can now delete words, lines, and text to end of line!
            </p>
            <div className="text-2xl font-bold text-green-400 mb-4">
              Score: {score}/{MAX_SCORE}
            </div>
            <button
              onClick={handleRestart}
              className="px-6 py-3 bg-purple-600 hover:bg-purple-700 rounded-lg transition-colors font-semibold"
            >
              Play Again
            </button>
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
    </div>
  )
}