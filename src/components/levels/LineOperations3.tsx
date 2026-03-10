import React, { useState, useRef, useEffect } from 'react'
import {
  useKeyboardHandler,
  KeyActionMap,
} from '../../hooks/useKeyboardHandler'
import { useVimLevel } from '../../hooks/useVimLevel'
import { processTextForVim } from '../../utils/textUtils'
import ExplosionEffect from './ExplosionEffect'
import { KeysAllowed } from '../common/KeysAllowed'
import { LevelShell, LevelHeader } from '../level-blocks'

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
            acc.push([square])
            acc.push([])
          } else {
            if (acc.length === 0 || acc[acc.length - 1][0]?.isSpace) {
              acc.push([square])
            } else {
              acc[acc.length - 1].push(square)
            }
          }
          return acc
        }, [])
        .filter((word) => word.length > 0),
  )

  // Level-specific state
  const [currentLineIndex, setCurrentLineIndex] = useState<number>(0)
  const [cursor, setCursor] = useState<number>(0)
  const [target, setTarget] = useState<number>(5)
  const [targetLineIndex, setTargetLineIndex] = useState<number>(0)
  const [showExplosion, setShowExplosion] = useState(false)
  const [explosionIdx, setExplosionIdx] = useState<number | null>(null)
  const [explosionLineIdx, setExplosionLineIdx] = useState<number | null>(null)
  const [revealedLetters, setRevealedLetters] = useState<Set<string>>(new Set())

  const level = useVimLevel({
    levelId: '3-line-operations',
    maxScore: 16,
    onReset: () => {
      setCursor(0)
      setCurrentLineIndex(0)
      setRevealedLetters(new Set())
      setShowExplosion(false)
      setExplosionIdx(null)
      setExplosionLineIdx(null)
      setNewTarget()
    },
  })

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
    const prevWasAtStart =
      target ===
      linesOfSquares[targetLineIndex].findIndex((square) => !square.isSpace)

    const availablePositions: { lineIndex: number; position: number }[] = []

    linesOfSquares.forEach((line, lineIdx) => {
      const startPos = line.findIndex((square) => !square.isSpace)
      const endPos = line.length - 1
      const posToCheck = prevWasAtStart ? endPos : startPos

      if (
        !revealedLetters.has(`${lineIdx}-${posToCheck}`) &&
        !line[posToCheck].isSpace
      ) {
        availablePositions.push({ lineIndex: lineIdx, position: posToCheck })
      }
    })

    if (availablePositions.length > 0) {
      const randomIndex = Math.floor(Math.random() * availablePositions.length)
      const { lineIndex, position } = availablePositions[randomIndex]
      setTarget(position)
      setTargetLineIndex(lineIndex)
    } else {
      const secondaryPositions: { lineIndex: number; position: number }[] = []

      linesOfSquares.forEach((line, lineIdx) => {
        const startPos = line.findIndex((square) => !square.isSpace)
        const endPos = line.length - 1
        const posToCheck = prevWasAtStart ? startPos : endPos

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
          level.completeLevel()
        }
      }
    }
  }

  // Initialize the game with a random target
  useEffect(() => {
    setNewTarget()
  }, [])

  // Check if the player has reached the target
  const checkTarget = (newPos: number, lineIndex: number) => {
    if (newPos === target && lineIndex === targetLineIndex) {
      setExplosionIdx(newPos)
      setExplosionLineIdx(lineIndex)
      setShowExplosion(true)

      setRevealedLetters((prev) => {
        const newSet = new Set(prev)
        newSet.add(`${lineIndex}-${newPos}`)
        if (newSet.size >= 16) {
          level.completeLevel()
        }
        return newSet
      })

      level.setScore((prev) => prev + 1)

      setTimeout(() => {
        setShowExplosion(false)
        setExplosionIdx(null)
        setExplosionLineIdx(null)
        setNewTarget()
      }, 200)
    }
  }

  // Key actions for movement
  const keyActions: KeyActionMap = {
    0: () => {
      level.activateTimer()
      setCursor(0)
      checkTarget(0, currentLineIndex)
    },
    _: () => {
      level.activateTimer()
      const firstNonSpace = linesOfSquares[currentLineIndex].findIndex(
        (square) => !square.isSpace,
      )
      if (firstNonSpace !== -1) {
        setCursor(firstNonSpace)
        checkTarget(firstNonSpace, currentLineIndex)
      }
    },
    $: () => {
      setCursor(linesOfSquares[currentLineIndex].length - 1)
      checkTarget(linesOfSquares[currentLineIndex].length - 1, currentLineIndex)
    },
    j: () => {
      level.activateTimer()
      if (currentLineIndex < linesOfSquares.length - 1) {
        const nextLineIndex = currentLineIndex + 1
        setCurrentLineIndex(nextLineIndex)
        const newLineCursorPos = Math.min(
          cursor,
          linesOfSquares[nextLineIndex].length - 1,
        )
        setCursor(newLineCursorPos)
        checkTarget(newLineCursorPos, nextLineIndex)
      }
    },
    k: () => {
      if (currentLineIndex > 0) {
        const prevLineIndex = currentLineIndex - 1
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

  const { lastKeyPressed } = useKeyboardHandler({
    keyActionMap: keyActions,
    dependencies: [cursor, currentLineIndex, linesOfSquares],
    disabled: level.levelCompleted,
  })

  return (
    <LevelShell
      level={level}
      className="flex flex-col items-center justify-center bg-bg-primary text-white"
    >
      <div className="w-full max-w-4xl">
        <div className="flex flex-col items-center mb-2">
          <p className="text-text-muted text-center max-w-lg mb-4">
            Use <kbd className="px-2 py-1 bg-bg-secondary rounded">0</kbd>,{' '}
            <kbd className="px-2 py-1 bg-bg-secondary rounded">_</kbd> and{' '}
            <kbd className="px-2 py-1 bg-bg-secondary rounded">$</kbd> to quickly
            jump to ends of a line.
          </p>

          <div className="flex items-center gap-4 mb-2">
            <LevelHeader
              title=""
              score={level.score}
              maxScore={level.maxScore}
              onReset={level.resetLevel}
            />
          </div>
        </div>
        <div className="relative w-full max-w-4xl bg-bg-secondary p-6 py-8 rounded-lg mx-auto overflow-y-scroll">
          {/* Container for all lines */}
          <div className="flex flex-col">
            {linesOfWords.map((words, lineIdx) => (
              <div
                key={`line-${lineIdx}`}
                className={`flex flex-row overflow-visible scrollbar-thin scrollbar-thumb-border-primary scrollbar-track-bg-primary ${
                  lineIdx === currentLineIndex
                    ? 'bg-bg-tertiary/30 rounded-md'
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
                      else base += 'bg-bg-tertiary text-text-secondary '

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

                          {isRevealed && square.char !== ' ' && (
                            <span className="z-10 text-lg font-medium font-mono">
                              {square.char}
                            </span>
                          )}

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
      </div>
    </LevelShell>
  )
}

export default LineOperations3
