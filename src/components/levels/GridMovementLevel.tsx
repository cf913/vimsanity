import React, { useState, useEffect } from "react"
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
  const [scoreAnimation, setScoreAnimation] = useState(false)
  const [lastPosition, setLastPosition] = useState<{ x: number; y: number }>({
    x: 0,
    y: 0,
  })
  const [showConfetti, setShowConfetti] = useState(false)
  const [trail, setTrail] = useState<Array<{ x: number; y: number; age: number }>>([])
  const [isMoving, setIsMoving] = useState(false)
  const gridSize = 10

  // Update trail effect
  useEffect(() => {
    const timer = setInterval(() => {
      setTrail(prev => 
        prev
          .map(pos => ({ ...pos, age: pos.age - 1 }))
          .filter(pos => pos.age > 0)
      );
    }, 100);
    
    return () => clearInterval(timer);
  }, []);

  // Reset movement animation after a short delay
  useEffect(() => {
    if (isMoving) {
      const timer = setTimeout(() => {
        setIsMoving(false);
      }, 200);
      return () => clearTimeout(timer);
    }
  }, [isMoving]);

  // Define key actions for the grid movement level
  const keyActions: KeyActionMap = {
    h: () => {
      setLastPosition(position)
      setIsMoving(true)
      const newPos = { ...position, x: Math.max(0, position.x - 1) }
      if (newPos.x !== position.x) {
        setTrail(prev => [...prev, { x: position.x, y: position.y, age: 5 }])
        setPosition(newPos)
        checkTarget(newPos)
      }
    },
    l: () => {
      setLastPosition(position)
      setIsMoving(true)
      const newPos = { ...position, x: Math.min(gridSize - 1, position.x + 1) }
      if (newPos.x !== position.x) {
        setTrail(prev => [...prev, { x: position.x, y: position.y, age: 5 }])
        setPosition(newPos)
        checkTarget(newPos)
      }
    },
    j: () => {
      setLastPosition(position)
      setIsMoving(true)
      const newPos = { ...position, y: Math.min(gridSize - 1, position.y + 1) }
      if (newPos.y !== position.y) {
        setTrail(prev => [...prev, { x: position.x, y: position.y, age: 5 }])
        setPosition(newPos)
        checkTarget(newPos)
      }
    },
    k: () => {
      setLastPosition(position)
      setIsMoving(true)
      const newPos = { ...position, y: Math.max(0, position.y - 1) }
      if (newPos.y !== position.y) {
        setTrail(prev => [...prev, { x: position.x, y: position.y, age: 5 }])
        setPosition(newPos)
        checkTarget(newPos)
      }
    },
  }

  // Check if we've reached the target
  const checkTarget = (newPos: { x: number; y: number }) => {
    if (newPos.x === target.x && newPos.y === target.y) {
      // Play success sound
      if (!isMuted) {
        // You can add sound here if needed
      }

      // Animate score and show confetti
      setScoreAnimation(true)
      setShowConfetti(true)
      
      setTimeout(() => {
        setScoreAnimation(false)
        setShowConfetti(false)
      }, 1500)

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
          <div className={`bg-zinc-800 px-4 py-2 rounded-lg transition-all duration-300 ${
            scoreAnimation ? 'scale-125 bg-emerald-500 text-white' : ''
          }`}>
            Score: {score}
            {showConfetti && (
              <div className="absolute left-1/2 transform -translate-x-1/2">
                {Array.from({ length: 30 }).map((_, i) => (
                  <div
                    key={i}
                    className="absolute"
                    style={{
                      left: `${Math.random() * 200 - 100}px`,
                      top: `${Math.random() * 10}px`,
                      width: `${Math.random() * 8 + 2}px`,
                      height: `${Math.random() * 8 + 2}px`,
                      borderRadius: '50%',
                      background: ['#FF5555', '#55FF55', '#5555FF', '#FFFF55', '#FF55FF', '#55FFFF'][Math.floor(Math.random() * 6)],
                      animation: `confetti-fall ${Math.random() * 2 + 1}s linear forwards`,
                      transform: `rotate(${Math.random() * 360}deg)`,
                    }}
                  />
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="relative flex justify-center">
        <div
          className="grid gap-2 w-full max-w-[50vmin] mx-auto"
          style={{
            gridTemplateColumns: `repeat(${gridSize}, minmax(0, 1fr))`,
          }}
        >
          {Array.from({ length: gridSize * gridSize }).map((_, index) => {
            const x = index % gridSize
            const y = Math.floor(index / gridSize)
            const isPlayer = x === position.x && y === position.y
            const isTarget = x === target.x && y === target.y
            const trailCell = trail.find(pos => pos.x === x && pos.y === y);
            const trailOpacity = trailCell ? trailCell.age / 5 : 0;

            return (
              <div
                key={index}
                className={`aspect-square w-full rounded-md flex items-center justify-center relative ${
                  isPlayer
                    ? `bg-emerald-500 shadow-lg shadow-emerald-500/50 scale-110 z-10 ${isMoving ? "animate-fade-in" : ""}`
                    : isTarget
                    ? "bg-purple-500 shadow-lg shadow-purple-500/50 animate-pulse"
                    : "bg-zinc-800"
                }`}
                style={{
                  boxShadow: isPlayer ? '0 0 15px rgba(16, 185, 129, 0.6)' : (isTarget ? '0 0 15px rgba(168, 85, 247, 0.6)' : ''),
                }}
              >
                {trailCell && !isPlayer && !isTarget && (
                  <div 
                    className="absolute inset-0 rounded-md bg-emerald-500/40"
                    style={{ 
                      opacity: trailOpacity,
                    }}
                  />
                )}
                {isTarget && (
                  <div className="absolute inset-0 rounded-md animate-ping bg-purple-500 opacity-30" />
                )}
              </div>
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
      <style jsx>{`
        @keyframes confetti-fall {
          0% {
            transform: translateY(0) rotate(0deg);
            opacity: 1;
          }
          100% {
            transform: translateY(100px) rotate(360deg);
            opacity: 0;
          }
        }
        
        @keyframes fade-in {
          0% { opacity: 0.7; transform: scale(1.05); }
          100% { opacity: 1; transform: scale(1.1); }
        }
      `}</style>
    </div>
  )
}

export default GridMovementLevel
