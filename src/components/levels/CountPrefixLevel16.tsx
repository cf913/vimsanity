import { motion } from 'framer-motion'
import { useEffect, useState } from 'react'
import {
  KeyActionMap,
  useKeyboardHandler,
} from '../../hooks/useKeyboardHandler'
import { useVimLevel } from '../../hooks/useVimLevel'
import { KBD } from '../common/KBD'
import {
  LevelShell,
  LevelHeader,
  LevelCompletion,
  CommandBuffer,
} from '../level-blocks'

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
  const gridSize = 10

  const [currentChallenge, setCurrentChallenge] = useState(0)
  const [position, setPosition] = useState(challenges[0].startPos)
  const [countBuffer, setCountBuffer] = useState('')
  const [commandHistory, setCommandHistory] = useState<string[]>([])
  const [showSuccess, setShowSuccess] = useState(false)
  const [keystrokeCount, setKeystrokeCount] = useState(0)

  const level = useVimLevel({
    levelId: '16-count-prefix',
    maxScore: challenges.length,
    onReset: () => {
      setCurrentChallenge(0)
      setPosition(challenges[0].startPos)
      setCountBuffer('')
      setCommandHistory([])
      setKeystrokeCount(0)
      setShowSuccess(false)
    },
  })

  const { incrementScore } = level
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
        incrementScore()
        setCurrentChallenge((prev) =>
          prev + 1 < challenges.length ? prev + 1 : prev
        )
      }, 800)
    }
  }, [position, challenge, incrementScore])

  // Execute movement with count
  const executeMovement = (direction: 'h' | 'j' | 'k' | 'l') => {
    level.activateTimer()
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

    setCountBuffer('')
  }

  const keyActionMap: KeyActionMap = {}
  for (let d = 1; d <= 9; d++) {
    const digit = String(d)
    keyActionMap[digit] = () => {
      level.activateTimer()
      setCountBuffer((prev) => prev + digit)
    }
  }
  keyActionMap.h = () => executeMovement('h')
  keyActionMap.j = () => executeMovement('j')
  keyActionMap.k = () => executeMovement('k')
  keyActionMap.l = () => executeMovement('l')
  keyActionMap.Escape = () => setCountBuffer('')

  const { lastKeyPressed } = useKeyboardHandler({
    keyActionMap,
    dependencies: [position, countBuffer, currentChallenge],
    disabled: level.levelCompleted,
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
    <LevelShell
      level={level}
      completionContent={
        <LevelCompletion
          levelId={level.levelId}
          subtitle="You've mastered count prefixes!"
        />
      }
    >
      <LevelHeader
        title="Count Prefixes"
        titleColor="text-cyan-400"
        description={
          <>
            Use numbers before motions for efficient navigation:{' '}
            <KBD>5j</KBD>, <KBD>3w</KBD>, <KBD>10l</KBD>
          </>
        }
        score={level.score}
        maxScore={level.maxScore}
        onReset={level.resetLevel}
      />

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
      <CommandBuffer buffer={countBuffer} color="cyan" />

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
              lastKeyPressed === k
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
    </LevelShell>
  )
}
