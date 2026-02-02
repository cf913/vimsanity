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
  const LEVEL_ID = '17-file-nav'
  const totalLines = fileContent.length

  const [currentChallenge, setCurrentChallenge] = useState(0)
  const [currentLine, setCurrentLine] = useState(7) // Start in the middle
  const [score, setScore] = useState(0)
  const [levelCompleted, setLevelCompleted] = useState(false)
  const [showConfetti, setShowConfetti] = useState(false)
  const [lastKeyPressed, setLastKeyPressed] = useState<string>('')
  const [isActive, setIsActive] = useState(false)

  // Count buffer for {n}G
  const [countBuffer, setCountBuffer] = useState('')
  const [pendingG, setPendingG] = useState(false)
  const [showSuccess, setShowSuccess] = useState(false)

  const MAX_SCORE = challenges.length
  const challenge = challenges[currentChallenge]

  // Reset for new challenge
  useEffect(() => {
    if (currentChallenge < challenges.length) {
      // Set start position opposite to target for variety
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

    if (currentLine === challenge.targetLine) {
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
  }, [currentLine, challenge, score, MAX_SCORE])

  const handleRestart = () => {
    setCurrentChallenge(0)
    setCurrentLine(7)
    setScore(0)
    setLevelCompleted(false)
    setShowConfetti(false)
    setLastKeyPressed('')
    setCountBuffer('')
    setPendingG(false)
    setIsActive(false)
  }

  const activateTimer = () => {
    if (!isActive && !levelCompleted) {
      setIsActive(true)
    }
  }

  // Handle gg command
  const handleGG = () => {
    activateTimer()
    setCurrentLine(1)
    setLastKeyPressed('gg')
    setCountBuffer('')
    setPendingG(false)
  }

  // Handle G command (with optional count)
  const handleG = () => {
    activateTimer()

    if (countBuffer) {
      // {n}G - go to line n
      const targetLine = Math.min(
        Math.max(1, parseInt(countBuffer)),
        totalLines
      )
      setCurrentLine(targetLine)
      setLastKeyPressed(`${countBuffer}G`)
    } else {
      // G alone - go to last line
      setCurrentLine(totalLines)
      setLastKeyPressed('G')
    }

    setCountBuffer('')
    setPendingG(false)
  }

  const keyActionMap: KeyActionMap = {
    '0': () => {
      activateTimer()
      setCountBuffer((prev) => prev + '0')
      setLastKeyPressed('0')
    },
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
    g: () => {
      activateTimer()
      if (pendingG) {
        // gg command
        handleGG()
      } else {
        setPendingG(true)
        setLastKeyPressed('g')
      }
    },
    G: () => {
      handleG()
    },
    j: () => {
      activateTimer()
      const count = countBuffer ? parseInt(countBuffer) : 1
      setCurrentLine((prev) => Math.min(totalLines, prev + count))
      setLastKeyPressed(countBuffer ? `${countBuffer}j` : 'j')
      setCountBuffer('')
      setPendingG(false)
    },
    k: () => {
      activateTimer()
      const count = countBuffer ? parseInt(countBuffer) : 1
      setCurrentLine((prev) => Math.max(1, prev - count))
      setLastKeyPressed(countBuffer ? `${countBuffer}k` : 'k')
      setCountBuffer('')
      setPendingG(false)
    },
    Escape: () => {
      setCountBuffer('')
      setPendingG(false)
      setLastKeyPressed('Esc')
    },
  }

  useKeyboardHandler({
    keyActionMap,
    dependencies: [currentLine, countBuffer, pendingG, currentChallenge],
  })

  return (
    <div className="w-full h-full flex flex-col items-center gap-6">
      {showConfetti && <ConfettiBurst />}

      {/* Header */}
      <div className="text-center">
        <h2 className="text-2xl font-bold mb-2 text-purple-400">
          File Navigation
        </h2>
        <p className="text-text-muted">
          Jump anywhere in a file with <KBD>gg</KBD>, <KBD>G</KBD>, and{' '}
          <KBD>{'{'}<span className="text-purple-400">n</span>{'}'}G</KBD>
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
          <div className="h-12 flex items-center justify-center gap-2">
            {(countBuffer || pendingG) && (
              <motion.div
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                className="bg-purple-500/20 border-2 border-purple-500 rounded-lg px-6 py-2"
              >
                <span className="text-2xl font-mono font-bold text-purple-400">
                  {countBuffer}
                  {pendingG && 'g'}
                </span>
                <span className="text-purple-400/50 animate-pulse">_</span>
              </motion.div>
            )}
          </div>

          {/* File Content Display */}
          <div className="bg-bg-secondary rounded-lg border border-border-secondary overflow-hidden max-h-96 w-full max-w-2xl">
            <div className="font-mono text-sm">
              {fileContent.map((line, index) => {
                const lineNum = index + 1
                const isCurrent = lineNum === currentLine
                const isTarget = challenge && lineNum === challenge.targetLine

                return (
                  <motion.div
                    key={index}
                    className={`flex ${
                      isCurrent
                        ? 'bg-emerald-500/20'
                        : isTarget
                          ? 'bg-purple-500/10'
                          : ''
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
                  lastKeyPressed === 'g' || lastKeyPressed === 'gg'
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
                  lastKeyPressed === 'G' || lastKeyPressed.endsWith('G')
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
                  lastKeyPressed === 'j' || lastKeyPressed.endsWith('j')
                    ? 'bg-emerald-500 text-white shadow-lg shadow-emerald-500/50 scale-110'
                    : ''
                }`}
              >
                j
              </kbd>
              <kbd
                className={`px-3 py-1 bg-bg-secondary rounded-lg transition-all duration-150 ${
                  lastKeyPressed === 'k' || lastKeyPressed.endsWith('k')
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
            You've mastered file navigation!
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
