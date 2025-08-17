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

export default function BasicDeleteLevel10() {
  // Simple grid with some characters marked for deletion
  const initialGrid = [
    ['V', 'i', 'm', 'x', 'D', 'e', 'l', 'e', 't', 'e'],
    ['L', 'e', 'a', 'r', 'n', 'x', 'd', 'd', 'N', 'o'],
    ['P', 'r', 'a', 'c', 't', 'i', 'c', 'e', 'x', 'D'],
    ['D', 'e', 'l', 'e', 't', 'e', 'x', 'L', 'i', 'n'],
    ['S', 'i', 'm', 'p', 'l', 'e', 'x', 'F', 'u', 'n'],
  ]

  // Targets to delete (marked with 'x' in the grid)
  const deleteTargets = [
    { row: 0, col: 3, type: 'x' }, // Delete single character
    { row: 1, col: 5, type: 'x' }, // Delete single character  
    { row: 2, col: 8, type: 'x' }, // Delete single character
    { row: 3, col: 6, type: 'x' }, // Delete single character
    { row: 4, col: 6, type: 'x' }, // Delete single character
  ]

  const [grid, setGrid] = useState(initialGrid)
  const [position, setPosition] = useState({ row: 0, col: 0 })
  const [score, setScore] = useState(0)
  const [deletedTargets, setDeletedTargets] = useState<Set<string>>(new Set())
  const [showConfetti, setShowConfetti] = useState(false)
  const [levelCompleted, setLevelCompleted] = useState(false)
  const [lastKeyPressed, setLastKeyPressed] = useState<string>('')
  const [recentlyDeleted, setRecentlyDeleted] = useState<{ row: number; col: number } | null>(null)

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
    setDeletedTargets(new Set())
    setLevelCompleted(false)
    setShowConfetti(false)
    setLastKeyPressed('')
    setRecentlyDeleted(null)
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
    x: () => {
      const currentChar = grid[position.row][position.col]
      const targetKey = `${position.row}-${position.col}`
      
      // Check if this is a valid delete target
      const isTarget = deleteTargets.some(
        target => target.row === position.row && target.col === position.col
      )
      
      if (isTarget && currentChar === 'x' && !deletedTargets.has(targetKey)) {
        // Mark as deleted
        setDeletedTargets(prev => new Set([...prev, targetKey]))
        setScore(prev => prev + 1)
        setRecentlyDeleted({ row: position.row, col: position.col })
        
        // Update grid to show deletion
        setGrid(prev => {
          const newGrid = prev.map(row => [...row])
          newGrid[position.row][position.col] = '·' // Show as deleted
          return newGrid
        })
      }
      setLastKeyPressed('x')
    },
  }

  useKeyboardHandler({
    keyActionMap,
    dependencies: [position, grid, deletedTargets],
  })

  const isTarget = (row: number, col: number) => {
    return deleteTargets.some(target => target.row === row && target.col === col)
  }

  const isDeleted = (row: number, col: number) => {
    return deletedTargets.has(`${row}-${col}`)
  }

  const isRecentlyDeleted = (row: number, col: number) => {
    return recentlyDeleted?.row === row && recentlyDeleted?.col === col
  }

  return (
    <div className="flex flex-col items-center gap-6">
      {showConfetti && <ConfettiBurst />}

      <div className="text-center">
        <h2 className="text-2xl font-bold mb-2 text-red-400">Basic Delete Operations</h2>
        <p className="text-zinc-400 px-2">
          Navigate with <KBD>h j k l</KBD> and delete the <span className="text-red-400 font-bold">x</span> characters with <KBD>x</KBD>
        </p>
      </div>

      <div className="flex justify-center items-center gap-4 mb-4">
        <Scoreboard score={score} maxScore={MAX_SCORE} />
        <button
          onClick={handleRestart}
          className="flex items-center gap-2 px-4 py-2 bg-red-600 hover:bg-red-700 rounded-lg transition-colors"
        >
          <RefreshCw size={16} />
          Reset
        </button>
      </div>

      {/* Grid */}
      <div className="grid gap-1 p-6 bg-zinc-800 rounded-lg border-2 border-zinc-600">
        {grid.map((row, rowIdx) => (
          <div key={rowIdx} className="flex gap-1">
            {row.map((char, colIdx) => {
              const isCursor = position.row === rowIdx && position.col === colIdx
              const isTargetCell = isTarget(rowIdx, colIdx)
              const isDeletedCell = isDeleted(rowIdx, colIdx)
              const isRecentlyDeletedCell = isRecentlyDeleted(rowIdx, colIdx)

              return (
                <div
                  key={`${rowIdx}-${colIdx}`}
                  className={`
                    relative w-10 h-10 flex items-center justify-center text-lg font-mono rounded transition-all duration-200
                    ${isCursor 
                      ? 'bg-yellow-400 text-black scale-110 shadow-lg ring-2 ring-yellow-300' 
                      : 'bg-zinc-700'
                    }
                    ${isTargetCell && !isDeletedCell
                      ? 'text-red-400 font-bold ring-1 ring-red-400/50' 
                      : 'text-zinc-300'
                    }
                    ${isDeletedCell 
                      ? 'bg-green-600 text-green-200' 
                      : ''
                    }
                    ${isRecentlyDeletedCell 
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
        <KeysAllowed keys={['h', 'j', 'k', 'l', 'x']} />
      </div>

      {/* Level completion */}
      {levelCompleted && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-zinc-800 rounded-lg p-8 text-center max-w-md">
            <h2 className="text-3xl font-bold mb-4 text-red-400">🎉 Level Complete!</h2>
            <p className="text-zinc-300 mb-6">
              Great job! You've learned to delete characters with <KBD>x</KBD>.
              This is the foundation of Vim's delete operations!
            </p>
            <div className="text-2xl font-bold text-green-400 mb-4">
              Score: {score}/{MAX_SCORE}
            </div>
            <button
              onClick={handleRestart}
              className="px-6 py-3 bg-red-600 hover:bg-red-700 rounded-lg transition-colors font-semibold"
            >
              Play Again
            </button>
          </div>
        </div>
      )}

      <div className="mt-6">
        <LevelTimer
          levelId="level-10-basic-delete"
          isActive={!levelCompleted}
          isCompleted={levelCompleted}
        />
      </div>
    </div>
  )
}