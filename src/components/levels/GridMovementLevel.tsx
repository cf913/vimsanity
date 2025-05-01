import React, { useState } from "react"
import {
  useKeyboardHandler,
  KeyActionMap,
} from "../../hooks/useKeyboardHandler"

interface GridMovementLevelProps {
  isMuted: boolean
}

const GridMovementLevel: React.FC<GridMovementLevelProps> = ({ isMuted }) => {
  const [position, setPosition] = useState<{ x: number; y: number }>({
    x: 0,
    y: 0,
  })
  const [target, setTarget] = useState<{ x: number; y: number }>({
    x: 5,
    y: 5,
  })
  const [score, setScore] = useState(0)
  const gridSize = 10

  // Define key actions for the grid movement level
  const keyActions: KeyActionMap = {
    h: () => {
      const newPos = { ...position, x: Math.max(0, position.x - 1) }
      setPosition(newPos)
      checkTarget(newPos)
    },
    l: () => {
      const newPos = { ...position, x: Math.min(gridSize - 1, position.x + 1) }
      setPosition(newPos)
      checkTarget(newPos)
    },
    j: () => {
      const newPos = { ...position, y: Math.min(gridSize - 1, position.y + 1) }
      setPosition(newPos)
      checkTarget(newPos)
    },
    k: () => {
      const newPos = { ...position, y: Math.max(0, position.y - 1) }
      setPosition(newPos)
      checkTarget(newPos)
    },
  }

  // Check if we've reached the target
  const checkTarget = (newPos: { x: number; y: number }) => {
    if (newPos.x === target.x && newPos.y === target.y) {
      // Play success sound
      if (!isMuted) {
        // You can add sound here if needed
      }

      // Increment score
      setScore(score + 1)

      // Set new random target
      setTarget({
        x: Math.floor(Math.random() * gridSize),
        y: Math.floor(Math.random() * gridSize),
      })
    }
  }

  // Use our custom keyboard handler
  const { lastKeyPressed } = useKeyboardHandler({
    keyActionMap: keyActions,
    dependencies: [position, target, score],
  })

  return (
    <div className="w-full h-full flex flex-col justify-center">
      <div className="text-center mb-4">
        <p className="text-zinc-400">
          Use h, j, k, l to move the cursor to the target
        </p>
        <div className="mt-4 flex items-center justify-center gap-4">
          <div className="bg-zinc-800 px-4 py-2 rounded-lg">Score: {score}</div>
        </div>
      </div>

      <div className="relative flex justify-center">
        <div
          className="grid gap-2 w-full max-w-[50vmin]  mx-auto"
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
                className={`aspect-square w-full rounded-md transition-all duration-150 flex items-center justify-center ${
                  isPlayer
                    ? "bg-emerald-500 shadow-lg shadow-emerald-500/50 scale-110"
                    : isTarget
                    ? "bg-purple-500 shadow-lg shadow-purple-500/50"
                    : "bg-zinc-800"
                }`}
              />
            )
          })}
        </div>
      </div>

      <div className="flex gap-4 text-zinc-400 mt-4 justify-center">
        <kbd
          className={`px-3 py-1 bg-zinc-800 rounded-lg transition-all duration-150 ${
            lastKeyPressed === "h"
              ? "bg-emerald-500 text-white shadow-lg shadow-emerald-500/50 scale-110"
              : ""
          }`}
        >
          h
        </kbd>
        <kbd
          className={`px-3 py-1 bg-zinc-800 rounded-lg transition-all duration-150 ${
            lastKeyPressed === "j"
              ? "bg-emerald-500 text-white shadow-lg shadow-emerald-500/50 scale-110"
              : ""
          }`}
        >
          j
        </kbd>
        <kbd
          className={`px-3 py-1 bg-zinc-800 rounded-lg transition-all duration-150 ${
            lastKeyPressed === "k"
              ? "bg-emerald-500 text-white shadow-lg shadow-emerald-500/50 scale-110"
              : ""
          }`}
        >
          k
        </kbd>
        <kbd
          className={`px-3 py-1 bg-zinc-800 rounded-lg transition-all duration-150 ${
            lastKeyPressed === "l"
              ? "bg-emerald-500 text-white shadow-lg shadow-emerald-500/50 scale-110"
              : ""
          }`}
        >
          l
        </kbd>
      </div>
    </div>
  )
}

export default GridMovementLevel
