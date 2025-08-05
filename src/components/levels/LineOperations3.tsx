import React, { useState, useRef, useEffect } from 'react'
import {
  useKeyboardHandler,
  KeyActionMap,
} from '../../hooks/useKeyboardHandler'
import { processTextForVim } from '../../utils/textUtils'
import ExplosionEffect from './ExplosionEffect'
import ConfettiBurst from './ConfettiBurst'
import LevelTimer from '../common/LevelTimer'
import { RefreshCw, Zap } from 'lucide-react'
import Scoreboard from '../common/Scoreboard'
import { KeysAllowed } from '../common/KeysAllowed'

interface LevelProps {
  isMuted: boolean
}

const LineOperations3: React.FC<LevelProps> = () => {
  // Array of 5 different lines of text
  const sampleTexts = [
    'Norem ipsum dolor sC',
    'Ied do eiusmod tempO',
    '  Colo re magna aliN',
    '   Eia quis nostrudG',
    '  Oor = niaasdf jjiR',
    ' Nbo asanisi utaaliA',
    'Eabori anis aut aliT',
    '!abo asd isiaut a iS',
  ]

  // Process each line of text separately
  const processedLines = sampleTexts.map((text) => processTextForVim(text))

  // Create squares for each line
  const linesOfSquares = processedLines.map((characters) =>
    characters.map((char, idx) => ({
      isSpace: char === ' ',
      idx,
      char,
    })),
  )

  // Group characters into words for each line
  const linesOfWords = linesOfSquares.map(
    (squares) =>
      squares
        .reduce((acc: Array<Array<(typeof squares)[0]>>, square) => {
          if (square.isSpace) {
            // Add space as its own "word"
            acc.push([square])
            // Start a new word
            acc.push([])
          } else {
            // If we have no words yet or the last word is a space, start a new word
            if (acc.length === 0 || acc[acc.length - 1][0]?.isSpace) {
              acc.push([square])
            } else {
              // Add to the current word
              acc[acc.length - 1].push(square)
            }
          }
          return acc
        }, [])
        .filter((word) => word.length > 0), // Remove any empty words
  )

  // Track current line and position within that line
  const [currentLineIndex, setCurrentLineIndex] = useState<number>(0)
  const [cursor, setCursor] = useState<number>(0)
  const [target, setTarget] = useState<number>(5)
  const [targetLineIndex, setTargetLineIndex] = useState<number>(0)
  const [score, setScore] = useState(0)
  const [showConfetti, setShowConfetti] = useState(false)
  const [showExplosion, setShowExplosion] = useState(false)
  const [explosionIdx, setExplosionIdx] = useState<number | null>(null)
  const [explosionLineIdx, setExplosionLineIdx] = useState<number | null>(null)
  const [revealedLetters, setRevealedLetters] = useState<Set<string>>(new Set()) // Using "lineIdx-charIdx" format
  const [levelCompleted, setLevelCompleted] = useState(false)
  const [timerActive, setTimerActive] = useState<boolean>(false)
  const [lastKeyPressed, setLastKeyPressed] = useState<string>('')

  // Refs for scrolling
  const containerRef = useRef<HTMLDivElement>(null)
  const playerRef = useRef<HTMLSpanElement>(null)

  useEffect(() => {
    if (playerRef.current && containerRef.current) {
      playerRef.current.scrollIntoView({
        behavior: 'smooth',
        block: 'nearest',
        inline: 'center',
      })
    }
  }, [cursor, currentLineIndex])

  // Set a new target randomly - only select unrevealed squares
  const setNewTarget = () => {
    // Determine if we should target start or end of line based on previous target
    const prevWasAtStart =
      target ===
      linesOfSquares[targetLineIndex].findIndex((square) => !square.isSpace)

    // Collect all available unrevealed positions that match our constraint
    const availablePositions: { lineIndex: number; position: number }[] = []

    linesOfSquares.forEach((line, lineIdx) => {
      // Get the position based on our alternating pattern
      const startPos = line.findIndex((square) => !square.isSpace)
      const endPos = line.length - 1

      // Choose position based on alternating pattern
      const posToCheck = prevWasAtStart ? endPos : startPos

      // Check if this position is unrevealed
      if (
        !revealedLetters.has(`${lineIdx}-${posToCheck}`) &&
        !line[posToCheck].isSpace
      ) {
        availablePositions.push({ lineIndex: lineIdx, position: posToCheck })
      }
    })

    // If we have available positions, choose one randomly
    if (availablePositions.length > 0) {
      const randomIndex = Math.floor(Math.random() * availablePositions.length)
      const { lineIndex, position } = availablePositions[randomIndex]

      setTarget(position)
      setTargetLineIndex(lineIndex)
    } else {
      // If no unrevealed positions match our constraint, try the opposite constraint
      const secondaryPositions: { lineIndex: number; position: number }[] = []

      linesOfSquares.forEach((line, lineIdx) => {
        // Get the opposite position from our alternating pattern
        const startPos = line.findIndex((square) => !square.isSpace)
        const endPos = line.length - 1

        // Choose the opposite position
        const posToCheck = prevWasAtStart ? startPos : endPos

        // Check if this position is unrevealed
        if (
          !revealedLetters.has(`${lineIdx}-${posToCheck}`) &&
          !line[posToCheck].isSpace
        ) {
          secondaryPositions.push({ lineIndex: lineIdx, position: posToCheck })
        }
      })

      if (secondaryPositions.length > 0) {
        const randomIndex = Math.floor(
          Math.random() * secondaryPositions.length,
        )
        const { lineIndex, position } = secondaryPositions[randomIndex]

        setTarget(position)
        setTargetLineIndex(lineIndex)
      } else {
        // If still no unrevealed positions, check for any unrevealed position
        const anyPositions: { lineIndex: number; position: number }[] = []

        linesOfSquares.forEach((line, lineIdx) => {
          line.forEach((square, squareIdx) => {
            if (
              !square.isSpace &&
              !revealedLetters.has(`${lineIdx}-${squareIdx}`)
            ) {
              anyPositions.push({ lineIndex: lineIdx, position: squareIdx })
            }
          })
        })

        if (anyPositions.length > 0) {
          const randomIndex = Math.floor(Math.random() * anyPositions.length)
          const { lineIndex, position } = anyPositions[randomIndex]

          setTarget(position)
          setTargetLineIndex(lineIndex)
        } else {
          // All squares have been revealed - level complete!
          setLevelCompleted(true)
          setShowConfetti(true)
        }
      }
    }
  }

  // Initialize the game with a random target
  useEffect(() => {
    setNewTarget()
  }, [])

  // Start timer on first key press
  const activateTimer = () => {
    if (!timerActive) {
      setTimerActive(true)
    }
  }

  // Key actions for movement
  const keyActions: KeyActionMap = {
    0: () => {
      activateTimer()
      // move cursor to start of line
      setCursor(0)
      checkTarget(0, currentLineIndex)
    },
    _: () => {
      activateTimer()
      // Find the first non-space character in the line
      const firstNonSpace = linesOfSquares[currentLineIndex].findIndex(
        (square) => !square.isSpace,
      )
      if (firstNonSpace !== -1) {
        setCursor(firstNonSpace)
        checkTarget(firstNonSpace, currentLineIndex)
      }
    },
    $: () => {
      // move cursor to end of current line
      setCursor(linesOfSquares[currentLineIndex].length - 1)
      checkTarget(linesOfSquares[currentLineIndex].length - 1, currentLineIndex)
    },
    j: () => {
      activateTimer()
      // Move down a line
      if (currentLineIndex < linesOfSquares.length - 1) {
        const nextLineIndex = currentLineIndex + 1
        setCurrentLineIndex(nextLineIndex)

        // Adjust cursor if needed (if the new line is shorter)
        const newLineCursorPos = Math.min(
          cursor,
          linesOfSquares[nextLineIndex].length - 1,
        )
        setCursor(newLineCursorPos)

        // Check if we hit a target
        checkTarget(newLineCursorPos, nextLineIndex)
      }
    },
    k: () => {
      setLastKeyPressed('k')
      if (currentLineIndex > 0) {
        // Move up a line
        // Move to previous line
        const prevLineIndex = currentLineIndex - 1
        // Ensure cursor doesn't go beyond the end of the previous line
        const prevLineCursor = Math.min(
          cursor,
          linesOfSquares[prevLineIndex].length - 1,
        )

        setCurrentLineIndex(prevLineIndex)
        setCursor(prevLineCursor)
        checkTarget(prevLineCursor, prevLineIndex)
      }
    },
  }

  // Register keyboard handler
  const { lastKeyPressed: keyboardLastKey } = useKeyboardHandler({
    keyActionMap: keyActions,
    dependencies: [cursor, currentLineIndex, linesOfSquares],
  })

  // Update lastKeyPressed state when keyboard events happen
  useEffect(() => {
    if (keyboardLastKey) {
      setLastKeyPressed(keyboardLastKey)
    }
  }, [keyboardLastKey])

  // Check if the player has reached the target
  const checkTarget = (newPos: number, lineIndex: number) => {
    if (newPos === target && lineIndex === targetLineIndex) {
      // Play explosion effect
      setExplosionIdx(newPos)
      setExplosionLineIdx(lineIndex)
      setShowExplosion(true)

      // Reveal the letter
      setRevealedLetters((prev) => {
        const newSet = new Set(prev)
        newSet.add(`${lineIndex}-${newPos}`)
        if (newSet.size === 16) {
          setLevelCompleted(true)
          setShowConfetti(true)
        }
        return newSet
      })

      // Increment score
      setScore((prevScore) => prevScore + 1)

      // Set a timeout to hide the explosion and set a new target
      setTimeout(() => {
        setShowExplosion(false)
        setExplosionIdx(null)
        setExplosionLineIdx(null)

        // Set a new target
        setNewTarget()

        // Level completion is now handled in setNewTarget when no unrevealed squares remain
      }, 200)
    }
  }

  // Reset the level
  const resetLevel = () => {
    setCursor(0)
    setCurrentLineIndex(0)
    setScore(0)
    setLevelCompleted(false)
    setRevealedLetters(new Set())
    setNewTarget()
  }

  return (
    <div className="flex flex-col items-center justify-center bg-zinc-900 text-white">
      <div className="w-full max-w-4xl">
        <div className="flex flex-col items-center mb-2">
          {/* <h1 className="text-3xl font-bold mb-2 text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 to-blue-500">
            Line Navigation
          </h1> */}
          <p className="text-zinc-400 text-center max-w-lg mb-4">
            Use <kbd className="px-2 py-1 bg-zinc-800 rounded">0</kbd>,{' '}
            <kbd className="px-2 py-1 bg-zinc-800 rounded">_</kbd> and{' '}
            <kbd className="px-2 py-1 bg-zinc-800 rounded">$</kbd> to quickly
            jump to ends of a line.
          </p>

          <div className="flex items-center gap-4 mb-2">
            <Scoreboard score={score} maxScore={16} />
            <button
              onClick={resetLevel}
              className="bg-zinc-800 p-2 rounded-lg hover:bg-zinc-700 transition-colors"
              aria-label="Reset Level"
            >
              <RefreshCw size={18} className="text-zinc-400" />
            </button>
            {levelCompleted && (
              <div className="bg-emerald-600 px-4 py-2 rounded-lg text-white animate-pulse flex items-center gap-2 shadow-md">
                <Zap size={18} className="text-yellow-300" />
                <span>Level Complete!</span>
              </div>
            )}
          </div>
        </div>
        <div className="relative w-full max-w-4xl bg-zinc-800 p-6 py-8 rounded-lg mx-auto overflow-y-scroll">
          {/* Global Confetti Burst over the game area */}
          {showConfetti && <ConfettiBurst />}

          {/* Container for all lines */}
          <div className="flex flex-col">
            {linesOfWords.map((words, lineIdx) => (
              <div
                key={`line-${lineIdx}`}
                className={`flex flex-row overflow-visible scrollbar-thin scrollbar-thumb-zinc-700 scrollbar-track-zinc-900 ${
                  lineIdx === currentLineIndex
                    ? 'bg-zinc-700/30 rounded-md'
                    : ''
                }`}
                ref={lineIdx === currentLineIndex ? containerRef : undefined}
              >
                {words.map((word, wordIdx) => (
                  <div
                    key={`word-${lineIdx}-${wordIdx}`}
                    className="flex flex-row whitespace-nowrap mb-1"
                  >
                    {word.map((square) => {
                      const isPlayer =
                        square.idx === cursor && lineIdx === currentLineIndex

                      const isTarget =
                        square.idx === target && lineIdx === targetLineIndex

                      const isRevealed = revealedLetters.has(
                        `${lineIdx}-${square.idx}`,
                      )

                      let base =
                        'inline-flex items-center justify-center mx-0.5 my-0.5 min-w-8 h-8 transition-all duration-150 rounded-md '

                      if (isPlayer)
                        base +=
                          'bg-emerald-500 text-white scale-110 shadow-lg shadow-emerald-500/50 '
                      else if (isTarget)
                        base +=
                          'bg-purple-500 text-white scale-105 shadow-lg shadow-purple-500/60 animate-pulse '
                      else base += 'bg-zinc-700 text-zinc-300 '

                      if (square.isSpace) {
                        let baseSpace =
                          'inline-block mx-0.5 my-0.5 w-8 h-8 transition-all duration-150 rounded-md '
                        if (isPlayer) {
                          baseSpace +=
                            'bg-emerald-500/25 text-white scale-110 shadow-lg shadow-emerald-500/10 '
                        }
                        return (
                          <span
                            key={`space-${lineIdx}-${square.idx}`}
                            ref={isPlayer ? playerRef : undefined}
                            className={baseSpace}
                          ></span>
                        )
                      }

                      return (
                        <span
                          key={`char-${lineIdx}-${square.idx}`}
                          ref={isPlayer ? playerRef : undefined}
                          className={base}
                          style={{ position: 'relative' }}
                        >
                          {isTarget && (
                            <span className="absolute inset-0 rounded-md animate-ping bg-purple-500 opacity-30 z-0"></span>
                          )}

                          {/* Show the character if it's been revealed */}
                          {isRevealed && square.char !== ' ' && (
                            <span className="z-10 text-lg font-medium font-mono">
                              {square.char}
                            </span>
                          )}

                          {/* Explosion effect */}
                          {showExplosion &&
                            explosionIdx === square.idx &&
                            explosionLineIdx === lineIdx && (
                              <div className="absolute inset-0 z-20">
                                <ExplosionEffect />
                              </div>
                            )}
                        </span>
                      )
                    })}
                  </div>
                ))}
              </div>
            ))}
          </div>
        </div>
        <KeysAllowed
          keys={['0', '_', '$', 'j', 'k']}
          lastKeyPressed={lastKeyPressed}
        />

        {/* Level Timer */}
        <LevelTimer
          levelId="3-line-operations"
          isActive={timerActive}
          isCompleted={levelCompleted}
        />
      </div>
    </div>
  )
}

export default LineOperations3
