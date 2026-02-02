import { motion } from 'framer-motion'
import { RefreshCw } from 'lucide-react'
import { useEffect, useState } from 'react'
import {
  KeyActionMap,
  useKeyboardHandler,
} from '../../hooks/useKeyboardHandler'
import { KBD } from '../common/KBD'
import LevelTimer from '../common/LevelTimer'
import Scoreboard from '../common/Scoreboard'
import ConfettiBurst from './ConfettiBurst'

interface Challenge {
  id: number
  instruction: string
  expectedCommand: string
  startPos: { x: number; y: number }
  targetPos: { x: number; y: number }
  hint: string
}

const challenges: Challenge[] = [
  {
    id: 1,
    instruction: 'Move down 5 lines',
    expectedCommand: '5j',
    startPos: { x: 5, y: 0 },
    targetPos: { x: 5, y: 5 },
    hint: 'Type 5 then j',
  },
  {
    id: 2,
    instruction: 'Move right 8 characters',
    expectedCommand: '8l',
    startPos: { x: 0, y: 4 },
    targetPos: { x: 8, y: 4 },
    hint: 'Type 8 then l',
  },
  {
    id: 3,
    instruction: 'Move up 3 lines',
    expectedCommand: '3k',
    startPos: { x: 3, y: 7 },
    targetPos: { x: 3, y: 4 },
    hint: 'Type 3 then k',
  },
  {
    id: 4,
    instruction: 'Move left 6 characters',
    expectedCommand: '6h',
    startPos: { x: 9, y: 2 },
    targetPos: { x: 3, y: 2 },
    hint: 'Type 6 then h',
  },
  {
    id: 5,
    instruction: 'Move down 4, then right 5',
    expectedCommand: '4j5l',
    startPos: { x: 0, y: 0 },
    targetPos: { x: 5, y: 4 },
    hint: 'Type 4j then 5l',
  },
]

export default function CountPrefixLevel16() {
  const LEVEL_ID = '16-count-prefix'
  const gridSize = 10

  const [currentChallenge, setCurrentChallenge] = useState(0)
  const [position, setPosition] = useState(challenges[0].startPos)
  const [score, setScore] = useState(0)
  const [levelCompleted, setLevelCompleted] = useState(false)
  const [showConfetti, setShowConfetti] = useState(false)
  const [lastKeyPressed, setLastKeyPressed] = useState<string>('')
  const [isActive, setIsActive] = useState(false)

  // Count prefix state
  const [countBuffer, setCountBuffer] = useState('')
  const [commandHistory, setCommandHistory] = useState<string[]>([])
  const [showSuccess, setShowSuccess] = useState(false)
  const [keystrokeCount, setKeystrokeCount] = useState(0)

  const MAX_SCORE = challenges.length
  const challenge = challenges[currentChallenge]

  // Reset challenge position when challenge changes
  useEffect(() => {
    if (currentChallenge < challenges.length) {
      setPosition(challenges[currentChallenge].startPos)
      setCountBuffer('')
      setCommandHistory([])
      setKeystrokeCount(0)
    }
  }, [currentChallenge])

  // Handle ESC for restart when completed
  useEffect(() => {
    if (levelCompleted) {
      const handler = (e: KeyboardEvent) => {
        if (e.key === 'Escape') {
          handleRestart()
        }
      }
      window.addEventListener('keydown', handler)
      return () => window.removeEventListener('keydown', handler)
    }
  }, [levelCompleted])

  // Check if target reached
  useEffect(() => {
    if (!challenge) return

    if (
      position.x === challenge.targetPos.x &&
      position.y === challenge.targetPos.y
    ) {
      setShowSuccess(true)
      setTimeout(() => {
        setShowSuccess(false)
        const nextScore = score + 1

        if (nextScore >= MAX_SCORE) {
          setLevelCompleted(true)
          setShowConfetti(true)
          setIsActive(false)
          setTimeout(() => setShowConfetti(false), 3000)
        } else {
          setScore(nextScore)
          setCurrentChallenge((prev) => prev + 1)
        }
      }, 800)
    }
  }, [position, challenge, score, MAX_SCORE])

  const handleRestart = () => {
    setCurrentChallenge(0)
    setPosition(challenges[0].startPos)
    setScore(0)
    setLevelCompleted(false)
    setShowConfetti(false)
    setLastKeyPressed('')
    setCountBuffer('')
    setCommandHistory([])
    setIsActive(false)
    setKeystrokeCount(0)
  }

  const activateTimer = () => {
    if (!isActive && !levelCompleted) {
      setIsActive(true)
    }
  }

  // Execute movement with count
  const executeMovement = (direction: 'h' | 'j' | 'k' | 'l') => {
    activateTimer()
    const count = countBuffer ? parseInt(countBuffer) : 1
    const command = countBuffer ? `${countBuffer}${direction}` : direction

    setCommandHistory((prev) => [...prev, command])
    setKeystrokeCount((prev) => prev + (countBuffer.length + 1))

    setPosition((prev) => {
      let newX = prev.x
      let newY = prev.y

      for (let i = 0; i < count; i++) {
        switch (direction) {
          case 'h':
            newX = Math.max(0, newX - 1)
            break
          case 'l':
            newX = Math.min(gridSize - 1, newX + 1)
            break
          case 'k':
            newY = Math.max(0, newY - 1)
            break
          case 'j':
            newY = Math.min(gridSize - 1, newY + 1)
            break
        }
      }

      return { x: newX, y: newY }
    })

    setLastKeyPressed(command)
    setCountBuffer('')
  }

  const keyActionMap: KeyActionMap = {
    '1': () => {
      activateTimer()
      setCountBuffer((prev) => prev + '1')
      setLastKeyPressed('1')
    },
    '2': () => {
      activateTimer()
      setCountBuffer((prev) => prev + '2')
      setLastKeyPressed('2')
    },
    '3': () => {
      activateTimer()
      setCountBuffer((prev) => prev + '3')
      setLastKeyPressed('3')
    },
    '4': () => {
      activateTimer()
      setCountBuffer((prev) => prev + '4')
      setLastKeyPressed('4')
    },
    '5': () => {
      activateTimer()
      setCountBuffer((prev) => prev + '5')
      setLastKeyPressed('5')
    },
    '6': () => {
      activateTimer()
      setCountBuffer((prev) => prev + '6')
      setLastKeyPressed('6')
    },
    '7': () => {
      activateTimer()
      setCountBuffer((prev) => prev + '7')
      setLastKeyPressed('7')
    },
    '8': () => {
      activateTimer()
      setCountBuffer((prev) => prev + '8')
      setLastKeyPressed('8')
    },
    '9': () => {
      activateTimer()
      setCountBuffer((prev) => prev + '9')
      setLastKeyPressed('9')
    },
    h: () => executeMovement('h'),
    j: () => executeMovement('j'),
    k: () => executeMovement('k'),
    l: () => executeMovement('l'),
    Escape: () => {
      setCountBuffer('')
      setLastKeyPressed('Esc')
    },
  }

  useKeyboardHandler({
    keyActionMap,
    dependencies: [position, countBuffer, currentChallenge],
  })

  // Calculate efficiency
  const getEfficiency = () => {
    if (!challenge) return null
    const optimal = challenge.expectedCommand.length
    const actual = keystrokeCount
    if (actual === 0) return null
    return Math.round((optimal / actual) * 100)
  }

  return (
    <div className="w-full h-full flex flex-col items-center gap-6">
      {showConfetti && <ConfettiBurst />}

      {/* Header */}
      <div className="text-center">
        <h2 className="text-2xl font-bold mb-2 text-cyan-400">
          Count Prefixes
        </h2>
        <p className="text-text-muted">
          Use numbers before motions for efficient navigation:{' '}
          <KBD>5j</KBD>, <KBD>3w</KBD>, <KBD>10l</KBD>
        </p>
      </div>

      {/* Controls */}
      <div className="flex items-center gap-4">
        <Scoreboard score={score} maxScore={MAX_SCORE} />
        <button
          onClick={handleRestart}
          className="bg-bg-secondary p-2 rounded-lg hover:bg-bg-tertiary transition-colors"
          aria-label="Reset Level"
        >
          <RefreshCw size={18} className="text-text-muted" />
        </button>
      </div>

      {!levelCompleted ? (
        <>
          {/* Current Challenge */}
          <motion.div
            key={currentChallenge}
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-bg-secondary rounded-lg p-4 border border-cyan-500/30"
          >
            <div className="text-center">
              <p className="text-lg font-semibold text-cyan-300">
                Challenge {currentChallenge + 1}: {challenge?.instruction}
              </p>
              <p className="text-sm text-text-muted mt-1">
                Hint: <span className="text-cyan-400">{challenge?.hint}</span>
              </p>
            </div>
          </motion.div>

          {/* Count Buffer Display */}
          <div className="h-12 flex items-center justify-center">
            {countBuffer && (
              <motion.div
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                className="bg-cyan-500/20 border-2 border-cyan-500 rounded-lg px-6 py-2"
              >
                <span className="text-2xl font-mono font-bold text-cyan-400">
                  {countBuffer}
                </span>
                <span className="text-cyan-400/50 animate-pulse">_</span>
              </motion.div>
            )}
          </div>

          {/* Grid */}
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
                const isTarget =
                  challenge &&
                  x === challenge.targetPos.x &&
                  y === challenge.targetPos.y
                const isStart =
                  challenge &&
                  x === challenge.startPos.x &&
                  y === challenge.startPos.y

                return (
                  <motion.div
                    key={index}
                    className={`w-8 h-8 rounded-md flex items-center justify-center relative ${
                      isPlayer
                        ? 'bg-emerald-500 shadow-lg shadow-emerald-500/60 scale-110 z-10'
                        : isTarget
                          ? 'bg-cyan-500 shadow-lg shadow-cyan-500/60 animate-pulse'
                          : isStart && !isPlayer
                            ? 'bg-emerald-500/30'
                            : 'bg-bg-secondary'
                    }`}
                    animate={
                      isPlayer && showSuccess
                        ? { scale: [1.1, 1.3, 1.1] }
                        : {}
                    }
                    transition={{ duration: 0.3 }}
                  >
                    {isTarget && !isPlayer && (
                      <div className="absolute inset-0 rounded-md animate-ping bg-cyan-500 opacity-30" />
                    )}
                  </motion.div>
                )
              })}
            </div>
          </div>

          {/* Command History */}
          <div className="flex flex-col items-center gap-2">
            <div className="text-sm text-text-muted">Commands used:</div>
            <div className="flex gap-2 flex-wrap justify-center max-w-md">
              {commandHistory.length === 0 ? (
                <span className="text-text-muted/50 italic">None yet</span>
              ) : (
                commandHistory.map((cmd, i) => (
                  <motion.span
                    key={i}
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    className="px-2 py-1 bg-bg-tertiary rounded font-mono text-sm"
                  >
                    {cmd}
                  </motion.span>
                ))
              )}
            </div>
            {getEfficiency() !== null && (
              <div className="text-sm">
                <span className="text-text-muted">Efficiency: </span>
                <span
                  className={
                    getEfficiency()! >= 100
                      ? 'text-emerald-400'
                      : getEfficiency()! >= 50
                        ? 'text-yellow-400'
                        : 'text-red-400'
                  }
                >
                  {getEfficiency()}%
                </span>
              </div>
            )}
          </div>

          {/* Keys Allowed */}
          <div className="flex gap-2 text-text-muted mt-4 justify-center flex-wrap">
            {['1', '2', '3', '4', '5', '6', '7', '8', '9'].map((k) => (
              <kbd
                key={k}
                className={`px-3 py-1 bg-bg-secondary rounded-lg transition-all duration-150 ${
                  lastKeyPressed === k
                    ? 'bg-cyan-500 text-white shadow-lg shadow-cyan-500/50 scale-110'
                    : ''
                }`}
              >
                {k}
              </kbd>
            ))}
            <span className="text-text-muted/50">+</span>
            {['h', 'j', 'k', 'l'].map((k) => (
              <kbd
                key={k}
                className={`px-3 py-1 bg-bg-secondary rounded-lg transition-all duration-150 ${
                  lastKeyPressed.endsWith(k)
                    ? 'bg-emerald-500 text-white shadow-lg shadow-emerald-500/50 scale-110'
                    : ''
                }`}
              >
                {k}
              </kbd>
            ))}
          </div>

          {/* Explanation */}
          <div className="bg-bg-secondary/50 rounded-lg p-4 max-w-lg text-center">
            <p className="text-sm text-text-muted">
              Instead of pressing <KBD>j</KBD> five times, type <KBD>5j</KBD> to
              move down 5 lines instantly. This works with any motion!
            </p>
          </div>
        </>
      ) : (
        /* Level Complete */
        <motion.div
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          className="flex flex-col items-center gap-6 p-8 bg-bg-secondary rounded-2xl border-4 border-emerald-500"
        >
          <h2 className="text-4xl font-bold text-emerald-400">
            Level Complete! 🎉
          </h2>
          <p className="text-xl text-text-secondary">
            You've mastered count prefixes!
          </p>
          <p className="text-text-muted">
            Press <KBD>Esc</KBD> to restart
          </p>
        </motion.div>
      )}

      {/* Timer */}
      <LevelTimer
        levelId={LEVEL_ID}
        isActive={isActive}
        isCompleted={levelCompleted}
      />
    </div>
  )
}
