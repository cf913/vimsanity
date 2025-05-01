import React, { useState, useEffect, useCallback } from 'react'
import { Trophy } from 'lucide-react'

interface GameAreaProps {
  level: number
  isMuted: boolean
}

interface Position {
  x: number
  y: number
}

const successSound = new Audio('https://assets.mixkit.co/active_storage/sfx/2017/2017-preview.mp3')

const GameArea: React.FC<GameAreaProps> = ({ level, isMuted }) => {
  const [position, setPosition] = useState<Position>({ x: 0, y: 0 })
  const [target, setTarget] = useState<Position>({ x: 5, y: 5 })
  const [score, setScore] = useState(0)
  const gridSize = 10

  const handleKeyDown = useCallback((e: KeyboardEvent) => {
    e.preventDefault()
    let newPos = { ...position }

    switch (e.key) {
      case 'h':
        newPos.x = Math.max(0, position.x - 1)
        break
      case 'l':
        newPos.x = Math.min(gridSize - 1, position.x + 1)
        break
      case 'j':
        newPos.y = Math.min(gridSize - 1, position.y + 1)
        break
      case 'k':
        newPos.y = Math.max(0, position.y - 1)
        break
    }

    setPosition(newPos)

    if (newPos.x === target.x && newPos.y === target.y) {
      if (!isMuted) {
        successSound.currentTime = 0
        successSound.play()
      }
      setScore(score + 1)
      setTarget({
        x: Math.floor(Math.random() * gridSize),
        y: Math.floor(Math.random() * gridSize),
      })
    }
  }, [position, target, score, isMuted])

  useEffect(() => {
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [handleKeyDown])

  return (
    <div className="flex flex-col items-center gap-8">
      <div className="text-center">
        <h2 className="text-3xl font-bold mb-2">Level {level}</h2>
        <p className="text-zinc-400">Use h, j, k, l to move the cursor to the target</p>
        <div className="mt-4 flex items-center justify-center gap-4">
          <div className="bg-zinc-800 px-4 py-2 rounded-lg">
            Score: {score}
          </div>
        </div>
      </div>

      <div className="relative">
        <div 
          className="grid gap-1"
          style={{ 
            gridTemplateColumns: `repeat(${gridSize}, minmax(0, 1fr))`,
          }}
        >
          {Array.from({ length: gridSize * gridSize }).map((_, index) => {
            const x = index % gridSize
            const y = Math.floor(index / gridSize)
            const isPlayer = x === position.x && y === position.y
            const isTarget = x === target.x && y === target.y

            return (
              <div
                key={index}
                className={`w-12 h-12 rounded-md transition-all duration-150 flex items-center justify-center ${
                  isPlayer
                    ? 'bg-emerald-500 shadow-lg shadow-emerald-500/50 scale-110'
                    : isTarget
                    ? 'bg-purple-500 shadow-lg shadow-purple-500/50'
                    : 'bg-zinc-800'
                }`}
              />
            )
          })}
        </div>
      </div>

      <div className="flex gap-4 text-zinc-400">
        <kbd className="px-3 py-1 bg-zinc-800 rounded-lg">h</kbd>
        <kbd className="px-3 py-1 bg-zinc-800 rounded-lg">j</kbd>
        <kbd className="px-3 py-1 bg-zinc-800 rounded-lg">k</kbd>
        <kbd className="px-3 py-1 bg-zinc-800 rounded-lg">l</kbd>
      </div>
    </div>
  )
}

export default GameArea