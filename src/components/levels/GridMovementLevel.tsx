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
import SessionHistory from '../common/SessionHistory'
import { KBD } from '../common/KBD'

interface GridMovementLevelProps {
  isMuted: boolean
}

const GridMovementLevel: React.FC<GridMovementLevelProps> = ({ isMuted }) => {
  const LEVEL_ID = '1-grid-movement'
  // ...existing state...
  // Add a key listener for Escape to reset
  const [scoreAnimation, setScoreAnimation] = useState(false)
  const [lastPosition, setLastPosition] = useState<{ x: number; y: number }>({
    x: 0,
    y: 0,
  })

  // Reset all state to initial values
  function handleRestart() {
    setPosition({ x: 0, y: 0 })
    setTarget({ x: 5, y: 5 })
    setScore(0)
    setScoreAnimation(false)
    setLevelCompleted(false)
    setLastPosition({ x: 0, y: 0 })
    setShowConfetti(false)
    setTrail([])
    setIsMoving(false)
    setTargetEaten(null)
    setIsActive(false)
  }

  const [isActive, setIsActive] = useState(false) // Timer state
  const [position, setPosition] = useState<{ x: number; y: number }>({
    x: 0,
    y: 0,
  })
  const [target, setTarget] = useState<{ x: number; y: number }>({
    x: 5,
    y: 5,
  })
  const [score, setScore] = useState(0)
  const [levelCompleted, setLevelCompleted] = useState(false)
  const [showConfetti, setShowConfetti] = useState(false)
  const [trail, setTrail] = useState<
    Array<{ x: number; y: number; age: number }>
  >([])
  const [isMoving, setIsMoving] = useState(false)
  const [targetEaten, setTargetEaten] = useState<{
    x: number
    y: number
  } | null>(null)

  const gridSize = 10
  const MAX_SCORE = 50 //gridSize * gridSize

  useEffect(() => {
    if (!levelCompleted) return
    const handler = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        handleRestart()
      }
    }
    window.addEventListener('keydown', handler)
    return () => window.removeEventListener('keydown', handler)
  }, [levelCompleted])

  // Update trail effect
  useEffect(() => {
    const timer = setInterval(() => {
      setTrail((prev) =>
        prev
          .map((pos) => ({ ...pos, age: pos.age - 1 }))
          .filter((pos) => pos.age > 0),
      )
    }, 100)

    return () => clearInterval(timer)
  }, [])

  // Reset movement animation after a short delay
  useEffect(() => {
    if (isMoving) {
      const timer = setTimeout(() => {
        setIsMoving(false)
      }, 200)
      return () => clearTimeout(timer)
    }
  }, [isMoving])

  // Reset target eaten animation after delay
  useEffect(() => {
    if (targetEaten) {
      const timer = setTimeout(() => {
        setTargetEaten(null)
      }, 300)
      return () => clearTimeout(timer)
    }
  }, [targetEaten])

  // Start timer on first key press
  const activateTimer = () => {
    if (!isActive && !levelCompleted) {
      setIsActive(true)
    }
  }

  // Define key actions for the grid movement level
  const keyActions: KeyActionMap = {
    h: () => {
      activateTimer()
      setLastPosition(position)
      setIsMoving(true)
      const newPos = { ...position, x: Math.max(0, position.x - 1) }
      if (newPos.x !== position.x) {
        setTrail((prev) => [...prev, { x: position.x, y: position.y, age: 5 }])
        setPosition(newPos)
        checkTarget(newPos)
      }
    },
    l: () => {
      activateTimer()
      setLastPosition(position)
      setIsMoving(true)
      const newPos = { ...position, x: Math.min(gridSize - 1, position.x + 1) }
      if (newPos.x !== position.x) {
        setTrail((prev) => [...prev, { x: position.x, y: position.y, age: 5 }])
        setPosition(newPos)
        checkTarget(newPos)
      }
    },
    j: () => {
      activateTimer()
      setLastPosition(position)
      setIsMoving(true)
      const newPos = { ...position, y: Math.min(gridSize - 1, position.y + 1) }
      if (newPos.y !== position.y) {
        setTrail((prev) => [...prev, { x: position.x, y: position.y, age: 5 }])
        setPosition(newPos)
        checkTarget(newPos)
      }
    },
    k: () => {
      activateTimer()
      setLastPosition(position)
      setIsMoving(true)
      const newPos = { ...position, y: Math.max(0, position.y - 1) }
      if (newPos.y !== position.y) {
        setTrail((prev) => [...prev, { x: position.x, y: position.y, age: 5 }])
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

      // Set target eaten position for animation
      setTargetEaten({ ...target })

      setTimeout(() => {
        setScoreAnimation(false)
        setShowConfetti(false)
      }, 1500)

      const nextScore = score + 1

      if (nextScore >= MAX_SCORE) {
        setLevelCompleted(true)
        setShowConfetti(true)
        setIsActive(false)
      }
      // Increment score
      setScore(nextScore)

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

  // If completed, show session history instead of game area
  // if (levelCompleted) {
  //   return (
  //     <div className="flex flex-col items-center justify-center min-h-[60vh] w-full animate-fade-in">
  //       <SessionHistory levelId="1-grid-movement" />
  //       <button
  //         onClick={handleRestart}
  //         className="mt-6 px-6 py-3 flex items-center gap-2 bg-gradient-to-r from-purple-500 to-emerald-500 hover:from-emerald-500 hover:to-purple-500 text-white font-bold rounded-xl shadow-lg transition-all duration-300 text-lg focus:outline-none focus:ring-4 focus:ring-emerald-400/40 active:scale-95"
  //       >
  //         <RefreshCw className="mr-2" size={20} />
  //         Restart (ESC)
  //       </button>
  //       <p className="mt-2 text-text-muted text-sm">
  //         Press <kbd className="px-2 py-1 bg-bg-tertiary rounded">ESC</kbd> to
  //         restart
  //       </p>
  //     </div>
  //   )
  // }

  return (
    <div className="w-full h-full flex flex-col justify-center">
      <div className="text-center mb-4">
        <p className="text-text-muted">
          Use <KBD>h</KBD>, <KBD>j</KBD>, <KBD>k</KBD>, <KBD>l</KBD> to move the
          cursor to the target
        </p>
        {levelCompleted ? (
          <div className="flex flex-col items-center justify-center min-h-[60vh] w-full animate-fade-in">
            {/* HISTORY */}
            <SessionHistory levelId={LEVEL_ID} />
            <p className="mt-6 text-text-muted text-sm">
              Press <KBD>ESC</KBD> to restart
            </p>
          </div>
        ) : (
          <div className="flex flex-col gap-4">
            {/* GAME */}
            <div className="mt-4 flex items-center justify-center gap-4">
              <div>
                <Scoreboard score={score} maxScore={MAX_SCORE} />
                {showConfetti && <ConfettiBurst />}
              </div>
              <button
                onClick={handleRestart}
                className="bg-bg-secondary p-2 rounded-lg hover:bg-bg-tertiary transition-colors"
                aria-label="Reset Level"
              >
                <RefreshCw size={18} className="text-text-muted" />
              </button>
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
                  const isTargetEaten =
                    targetEaten && x === targetEaten.x && y === targetEaten.y
                  const trailCell = trail.find(
                    (pos) => pos.x === x && pos.y === y,
                  )
                  const trailOpacity = trailCell ? trailCell.age / 5 : 0

                  return (
                    <div
                      key={index}
                      className={`aspect-square w-full rounded-md flex items-center justify-center relative ${
                        isPlayer
                          ? `bg-emerald-500 shadow-lg shadow-emerald-500/60 scale-110 z-10 ${
                              isMoving ? 'animate-fade-in' : ''
                            }`
                          : isTarget
                            ? 'bg-purple-500 shadow-lg shadow-purple-500/60 animate-pulse'
                            : 'bg-bg-secondary'
                      }`}
                      style={{
                        boxShadow: isPlayer
                          ? '0 0 20px rgba(16, 185, 129, 0.7)'
                          : isTarget
                            ? '0 0 20px rgba(168, 85, 247, 0.7)'
                            : '',
                      }}
                    >
                      {trailCell && !isPlayer && !isTarget && (
                        <div
                          className="absolute inset-0 rounded-md bg-emerald-500/40"
                          style={{
                            opacity: trailOpacity,
                            boxShadow: 'inset 0 0 10px rgba(16, 185, 129, 0.5)',
                          }}
                        />
                      )}
                      {isTarget && (
                        <div className="absolute inset-0 rounded-md animate-ping bg-purple-500 opacity-30" />
                      )}
                      {isTargetEaten && (
                        <div className="absolute inset-0 z-20">
                          <div
                            className="absolute inset-0 rounded-md bg-white"
                            style={{
                              animation:
                                'explosion-ring 0.3s forwards ease-out',
                            }}
                          />
                          <div
                            className="absolute inset-0 rounded-md bg-purple-500"
                            style={{
                              animation:
                                'explosion-glow 0.3s forwards ease-out',
                            }}
                          />
                          {/* {Array.from({ length: 8 }).map((_, i) => (
                      <div 
                        key={i}
                        className="absolute w-2 h-2 bg-white rounded-full"
                        style={{
                          left: '50%',
                          top: '50%',
                          transform: `translate(-50%, -50%) rotate(${i * 45}deg) translateY(-15px)`,
                          animation: 'explosion-particle 0.3s forwards ease-out',
                        }}
                      />
                    ))} */}
                        </div>
                      )}
                    </div>
                  )
                })}
              </div>
            </div>
            <KeysAllowed
              keys={['h', 'j', 'k', 'l']}
              lastKeyPressed={lastKeyPressed}
            />
          </div>
        )}
      </div>
      {/* Level Timer */}
      <LevelTimer
        levelId={LEVEL_ID}
        isActive={isActive}
        isCompleted={levelCompleted}
      />
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
          0% {
            opacity: 0.7;
            transform: scale(1.05);
          }
          100% {
            opacity: 1;
            transform: scale(1.1);
          }
        }

        @keyframes explosion-ring {
          0% {
            transform: scale(0.8);
            opacity: 0.9;
          }
          60% {
            transform: scale(1.8);
            opacity: 0.7;
          }
          100% {
            transform: scale(2.5);
            opacity: 0;
          }
        }

        @keyframes explosion-glow {
          0% {
            transform: scale(0.8);
            opacity: 0.9;
            box-shadow: 0 0 30px 20px rgba(168, 85, 247, 0.8);
          }
          100% {
            transform: scale(1.5);
            opacity: 0;
            box-shadow: 0 0 0 0 rgba(168, 85, 247, 0);
          }
        }

        @keyframes explosion-particle {
          0% {
            opacity: 1;
            transform: translate(-50%, -50%) rotate(inherit) translateY(-15px)
              scale(1);
          }
          100% {
            opacity: 0;
            transform: translate(-50%, -50%) rotate(inherit) translateY(-40px)
              scale(0);
          }
        }
      `}</style>
    </div>
  )
}

export default GridMovementLevel
