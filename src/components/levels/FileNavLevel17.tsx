import { motion } from 'framer-motion'
import { useEffect, useRef, useState } from 'react'
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
  targetLine: number
  hint: string
}

const challenges: Challenge[] = [
  {
    id: 1,
    instruction: 'Jump to the first line',
    targetLine: 1,
    hint: 'Type gg',
  },
  {
    id: 2,
    instruction: 'Jump to the last line',
    targetLine: 15,
    hint: 'Type G',
  },
  {
    id: 3,
    instruction: 'Jump to line 8',
    targetLine: 8,
    hint: 'Type 8G',
  },
  {
    id: 4,
    instruction: 'Jump to line 3',
    targetLine: 3,
    hint: 'Type 3G',
  },
  {
    id: 5,
    instruction: 'Jump to line 12',
    targetLine: 12,
    hint: 'Type 12G',
  },
]

const fileContent = [
  'function fibonacci(n) {',
  '  if (n <= 1) return n;',
  '  return fibonacci(n - 1) + fibonacci(n - 2);',
  '}',
  '',
  '// Calculate first 10 fibonacci numbers',
  'const results = [];',
  'for (let i = 0; i < 10; i++) {',
  '  results.push(fibonacci(i));',
  '}',
  '',
  'console.log("Fibonacci sequence:");',
  'console.log(results);',
  '',
  '// Output: 0, 1, 1, 2, 3, 5, 8, 13, 21, 34',
]

export default function FileNavLevel17() {
  const totalLines = fileContent.length

  const [currentChallenge, setCurrentChallenge] = useState(0)
  const [currentLine, setCurrentLine] = useState(7)
  const [countBuffer, setCountBuffer] = useState('')
  const [pendingG, setPendingG] = useState(false)
  const [showSuccess, setShowSuccess] = useState(false)

  const containerRef = useRef<HTMLDivElement>(null)
  const currentLineRef = useRef<HTMLDivElement>(null)

  const level = useVimLevel({
    levelId: '17-file-nav',
    maxScore: challenges.length,
    onReset: () => {
      setCurrentChallenge(0)
      setCurrentLine(7)
      setCountBuffer('')
      setPendingG(false)
      setShowSuccess(false)
    },
  })

  const { incrementScore } = level
  const challenge = challenges[currentChallenge]

  // Reset for new challenge
  useEffect(() => {
    if (currentChallenge < challenges.length) {
      const target = challenges[currentChallenge].targetLine
      if (target <= 5) {
        setCurrentLine(12)
      } else if (target >= 12) {
        setCurrentLine(3)
      } else {
        setCurrentLine(target > 7 ? 2 : 14)
      }
      setCountBuffer('')
      setPendingG(false)
    }
  }, [currentChallenge])

  // Auto-scroll to keep current line visible
  useEffect(() => {
    if (currentLineRef.current && containerRef.current) {
      const container = containerRef.current
      const line = currentLineRef.current
      const lineTop = line.offsetTop
      const lineBottom = lineTop + line.offsetHeight
      const containerScrollTop = container.scrollTop
      const containerHeight = container.clientHeight

      if (lineTop < containerScrollTop) {
        container.scrollTo({ top: lineTop, behavior: 'smooth' })
      } else if (lineBottom > containerScrollTop + containerHeight) {
        container.scrollTo({
          top: lineBottom - containerHeight,
          behavior: 'smooth',
        })
      }
    }
  }, [currentLine])

  // Check if target reached
  useEffect(() => {
    if (!challenge) return

    if (currentLine === challenge.targetLine) {
      setShowSuccess(true)
      setTimeout(() => {
        setShowSuccess(false)
        incrementScore()
        setCurrentChallenge((prev) =>
          prev + 1 < challenges.length ? prev + 1 : prev
        )
      }, 800)
    }
  }, [currentLine, challenge, incrementScore])

  // Handle gg command
  const handleGG = () => {
    level.activateTimer()
    setCurrentLine(1)
    setCountBuffer('')
    setPendingG(false)
  }

  // Handle G command (with optional count)
  const handleG = () => {
    level.activateTimer()

    if (countBuffer) {
      const targetLine = Math.min(
        Math.max(1, parseInt(countBuffer)),
        totalLines
      )
      setCurrentLine(targetLine)
    } else {
      setCurrentLine(totalLines)
    }

    setCountBuffer('')
    setPendingG(false)
  }

  const keyActionMap: KeyActionMap = {}
  for (let d = 0; d <= 9; d++) {
    const digit = String(d)
    keyActionMap[digit] = () => {
      level.activateTimer()
      setCountBuffer((prev) => prev + digit)
    }
  }
  keyActionMap.g = () => {
    level.activateTimer()
    if (pendingG) {
      handleGG()
    } else {
      setPendingG(true)
    }
  }
  keyActionMap.G = () => handleG()
  keyActionMap.j = () => {
    level.activateTimer()
    const count = countBuffer ? parseInt(countBuffer) : 1
    setCurrentLine((prev) => Math.min(totalLines, prev + count))
    setCountBuffer('')
    setPendingG(false)
  }
  keyActionMap.k = () => {
    level.activateTimer()
    const count = countBuffer ? parseInt(countBuffer) : 1
    setCurrentLine((prev) => Math.max(1, prev - count))
    setCountBuffer('')
    setPendingG(false)
  }
  keyActionMap.Escape = () => {
    setCountBuffer('')
    setPendingG(false)
  }

  const { lastKeyPressed } = useKeyboardHandler({
    keyActionMap,
    dependencies: [currentLine, countBuffer, pendingG, currentChallenge],
    disabled: level.levelCompleted,
  })

  return (
    <LevelShell
      level={level}
      completionContent={
        <LevelCompletion
          levelId={level.levelId}
          subtitle="You've mastered file navigation!"
        />
      }
    >
      <LevelHeader
        title="File Navigation"
        titleColor="text-purple-400"
        description={
          <>
            Jump anywhere in a file with <KBD>gg</KBD>, <KBD>G</KBD>, and{' '}
            <KBD>{'{'}<span className="text-purple-400">n</span>{'}'}G</KBD>
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
        className="bg-bg-secondary rounded-lg p-4 border border-purple-500/30"
      >
        <div className="text-center">
          <p className="text-lg font-semibold text-purple-300">
            Challenge {currentChallenge + 1}: {challenge?.instruction}
          </p>
          <p className="text-sm text-text-muted mt-1">
            Hint: <span className="text-purple-400">{challenge?.hint}</span>
          </p>
        </div>
      </motion.div>

      {/* Command Buffer Display */}
      <CommandBuffer
        buffer={countBuffer}
        suffix={pendingG ? 'g' : undefined}
        color="purple"
      />

      {/* File Content Display */}
      <div
        ref={containerRef}
        className="bg-bg-primary rounded-lg border border-border-secondary overflow-y-auto h-80 w-full max-w-2xl"
      >
        <div className="font-mono text-sm">
          {fileContent.map((line, index) => {
            const lineNum = index + 1
            const isCurrent = lineNum === currentLine
            const isTarget = challenge && lineNum === challenge.targetLine

            return (
              <motion.div
                key={index}
                ref={isCurrent ? currentLineRef : null}
                className={`flex ${
                  isCurrent
                    ? 'bg-emerald-500/20'
                    : isTarget
                      ? 'bg-purple-500/20'
                      : 'bg-bg-primary'
                }`}
                animate={
                  isCurrent && showSuccess
                    ? { backgroundColor: ['rgba(16, 185, 129, 0.2)', 'rgba(16, 185, 129, 0.5)', 'rgba(16, 185, 129, 0.2)'] }
                    : {}
                }
                transition={{ duration: 0.3 }}
              >
                {/* Line Number */}
                <div
                  className={`w-12 text-right pr-3 py-1 select-none border-r border-border-secondary ${
                    isCurrent
                      ? 'text-emerald-400 font-bold'
                      : isTarget
                        ? 'text-purple-400'
                        : 'text-text-muted'
                  }`}
                >
                  {lineNum}
                </div>

                {/* Line Content */}
                <div className="flex-1 px-3 py-1 overflow-x-auto">
                  <span
                    className={
                      isCurrent
                        ? 'text-emerald-300'
                        : isTarget
                          ? 'text-purple-300'
                          : 'text-text-secondary'
                    }
                  >
                    {line || ' '}
                  </span>
                </div>

                {/* Indicators */}
                <div className="w-8 flex items-center justify-center">
                  {isCurrent && (
                    <motion.div
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      className="w-3 h-3 bg-emerald-500 rounded-full"
                    />
                  )}
                  {isTarget && !isCurrent && (
                    <motion.div
                      animate={{ scale: [1, 1.2, 1] }}
                      transition={{ repeat: Infinity, duration: 1 }}
                      className="w-3 h-3 bg-purple-500 rounded-full opacity-60"
                    />
                  )}
                </div>
              </motion.div>
            )
          })}
        </div>
      </div>

      {/* Current Line Indicator */}
      <div className="text-sm text-text-muted">
        Current line:{' '}
        <span className="text-emerald-400 font-mono font-bold">
          {currentLine}
        </span>{' '}
        / {totalLines}
      </div>

      {/* Keys Allowed */}
      <div className="flex gap-3 text-text-muted justify-center flex-wrap">
        <div className="flex gap-1 items-center">
          <kbd
            className={`px-3 py-1 bg-bg-secondary rounded-lg transition-all duration-150 ${
              lastKeyPressed === 'g'
                ? 'bg-purple-500 text-white shadow-lg shadow-purple-500/50 scale-110'
                : ''
            }`}
          >
            gg
          </kbd>
          <span className="text-text-muted/50 text-xs">first</span>
        </div>
        <div className="flex gap-1 items-center">
          <kbd
            className={`px-3 py-1 bg-bg-secondary rounded-lg transition-all duration-150 ${
              lastKeyPressed === 'G'
                ? 'bg-purple-500 text-white shadow-lg shadow-purple-500/50 scale-110'
                : ''
            }`}
          >
            G
          </kbd>
          <span className="text-text-muted/50 text-xs">last</span>
        </div>
        <div className="flex gap-1 items-center">
          <kbd className="px-3 py-1 bg-bg-secondary rounded-lg">
            <span className="text-purple-400">{'{n}'}</span>G
          </kbd>
          <span className="text-text-muted/50 text-xs">line n</span>
        </div>
        <div className="flex gap-1 items-center">
          <kbd
            className={`px-3 py-1 bg-bg-secondary rounded-lg transition-all duration-150 ${
              lastKeyPressed === 'j'
                ? 'bg-emerald-500 text-white shadow-lg shadow-emerald-500/50 scale-110'
                : ''
            }`}
          >
            j
          </kbd>
          <kbd
            className={`px-3 py-1 bg-bg-secondary rounded-lg transition-all duration-150 ${
              lastKeyPressed === 'k'
                ? 'bg-emerald-500 text-white shadow-lg shadow-emerald-500/50 scale-110'
                : ''
            }`}
          >
            k
          </kbd>
          <span className="text-text-muted/50 text-xs">up/down</span>
        </div>
      </div>

      {/* Explanation */}
      <div className="bg-bg-secondary/50 rounded-lg p-4 max-w-lg text-center">
        <p className="text-sm text-text-muted">
          <KBD>gg</KBD> = first line • <KBD>G</KBD> = last line •{' '}
          <KBD>8G</KBD> = line 8
        </p>
      </div>
    </LevelShell>
  )
}
