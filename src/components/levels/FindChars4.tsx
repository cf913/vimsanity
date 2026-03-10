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

const FindChars4: React.FC<LevelProps> = () => {
  const sampleTexts = [
    'Vim file navigations',
    'Open splits with :sp',
    '  Copy text with yan',
    '   Go to line number',
    '    Edit text easily',
    ' Awk is vim-friendly',
    'Try using less mouse',
    'Substitution rocks!!',
  ]

  const processedLines = sampleTexts.map((text) => processTextForVim(text))

  const linesOfSquares = processedLines.map((characters) =>
    characters.map((char, idx) => ({
      isSpace: char === ' ',
      idx,
      char,
    })),
  )

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
  const [lastKeyPressed, setLastKeyPressed] = useState<string>('')

  // States for f and t commands
  const [awaitingCharacter, setAwaitingCharacter] = useState<boolean>(false)
  const [pendingCommand, setPendingCommand] = useState<
    'f' | 'F' | 't' | 'T' | null
  >(null)
  const [targetChar, setTargetChar] = useState<string | null>(null)
  const [lastSearchChar, setLastSearchChar] = useState<string | null>(null)
  const [lastSearchCommand, setLastSearchCommand] = useState<
    'f' | 'F' | 't' | 'T' | null
  >(null)

  const level = useVimLevel({
    levelId: '4-find-chars',
    maxScore: 100,
    onReset: () => {
      setCursor(0)
      setCurrentLineIndex(0)
      setRevealedLetters(new Set())
      setAwaitingCharacter(false)
      setPendingCommand(null)
      setLastSearchChar(null)
      setLastSearchCommand(null)
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

  // Set a new target randomly
  const setNewTarget = () => {
    const randomLineIndex = Math.floor(Math.random() * linesOfSquares.length)

    const nonSpaceIndices = linesOfSquares[randomLineIndex]
      .map((square, idx) => (!square.isSpace ? idx : -1))
      .filter((idx) => idx !== -1)

    if (nonSpaceIndices.length === 0) {
      setNewTarget()
      return
    }

    const randomPos =
      nonSpaceIndices[Math.floor(Math.random() * nonSpaceIndices.length)]

    setTargetChar(linesOfSquares[randomLineIndex][randomPos].char)
    setTarget(randomPos)
    setTargetLineIndex(randomLineIndex)
  }

  useEffect(() => {
    setNewTarget()
  }, [])

  // Character find/till commands
  const handleFCommand = (char: string) => {
    level.activateTimer()
    const currentLine = linesOfSquares[currentLineIndex]
    for (let i = cursor + 1; i < currentLine.length; i++) {
      if (currentLine[i].char.toLowerCase() === char.toLowerCase()) {
        setCursor(i)
        checkTarget(i, currentLineIndex)
        return true
      }
    }
    return false
  }

  const handleFReverseCommand = (char: string) => {
    level.activateTimer()
    const currentLine = linesOfSquares[currentLineIndex]
    for (let i = cursor - 1; i >= 0; i--) {
      if (currentLine[i].char.toLowerCase() === char.toLowerCase()) {
        setCursor(i)
        checkTarget(i, currentLineIndex)
        return true
      }
    }
    return false
  }

  const handleTCommand = (char: string) => {
    level.activateTimer()
    const currentLine = linesOfSquares[currentLineIndex]
    for (let i = cursor + 1; i < currentLine.length; i++) {
      if (currentLine[i].char.toLowerCase() === char.toLowerCase()) {
        setCursor(i - 1)
        checkTarget(i - 1, currentLineIndex)
        return true
      }
    }
    return false
  }

  const handleTReverseCommand = (char: string) => {
    level.activateTimer()
    const currentLine = linesOfSquares[currentLineIndex]
    for (let i = cursor - 1; i >= 0; i--) {
      if (currentLine[i].char.toLowerCase() === char.toLowerCase()) {
        setCursor(i + 1)
        checkTarget(i + 1, currentLineIndex)
        return true
      }
    }
    return false
  }

  const handleCharacterInput = (char: string) => {
    if (!awaitingCharacter) return false

    setLastKeyPressed(pendingCommand + char)
    setAwaitingCharacter(false)

    setLastSearchChar(char)
    setLastSearchCommand(pendingCommand)

    let success = false
    if (pendingCommand === 'f') success = handleFCommand(char)
    else if (pendingCommand === 'F') success = handleFReverseCommand(char)
    else if (pendingCommand === 't') success = handleTCommand(char)
    else if (pendingCommand === 'T') success = handleTReverseCommand(char)

    setPendingCommand(null)
    return success
  }

  const repeatLastSearch = () => {
    level.activateTimer()
    if (!lastSearchChar || !lastSearchCommand) return false
    setLastKeyPressed(';')

    if (lastSearchCommand === 'f') return handleFCommand(lastSearchChar)
    if (lastSearchCommand === 'F') return handleFReverseCommand(lastSearchChar)
    if (lastSearchCommand === 't') return handleTCommand(lastSearchChar)
    if (lastSearchCommand === 'T') return handleTReverseCommand(lastSearchChar)
    return false
  }

  const repeatLastSearchReverse = () => {
    level.activateTimer()
    if (!lastSearchChar || !lastSearchCommand) return false
    setLastKeyPressed(',')

    if (lastSearchCommand === 'f') return handleFReverseCommand(lastSearchChar)
    if (lastSearchCommand === 'F') return handleFCommand(lastSearchChar)
    if (lastSearchCommand === 't') return handleTReverseCommand(lastSearchChar)
    if (lastSearchCommand === 'T') return handleTCommand(lastSearchChar)
    return false
  }

  // Key actions
  const keyActions: KeyActionMap = {
    f: () => {
      if (awaitingCharacter) return handleCharacterInput('f')
      setLastKeyPressed('f')
      setPendingCommand('f')
      setAwaitingCharacter(true)
      return true
    },
    F: () => {
      if (awaitingCharacter) return handleCharacterInput('F')
      setLastKeyPressed('F')
      setPendingCommand('F')
      setAwaitingCharacter(true)
      return true
    },
    t: () => {
      if (awaitingCharacter) return handleCharacterInput('t')
      setLastKeyPressed('t')
      setPendingCommand('t')
      setAwaitingCharacter(true)
      return true
    },
    T: () => {
      if (awaitingCharacter) return handleCharacterInput('T')
      setLastKeyPressed('T')
      setPendingCommand('T')
      setAwaitingCharacter(true)
      return true
    },
    Escape: () => {
      if (awaitingCharacter) {
        setLastKeyPressed('Escape')
        setAwaitingCharacter(false)
        setPendingCommand(null)
        return true
      }
      return false
    },
    ';': () => {
      if (awaitingCharacter) return handleCharacterInput(';')
      return repeatLastSearch()
    },
    ',': () => {
      if (awaitingCharacter) return handleCharacterInput(',')
      return repeatLastSearchReverse()
    },
    j: () => {
      if (awaitingCharacter) return handleCharacterInput('j')
      level.activateTimer()
      setLastKeyPressed('j')
      if (currentLineIndex < linesOfSquares.length - 1) {
        const nextLineIndex = currentLineIndex + 1
        const nextLineCursor = Math.min(
          cursor,
          linesOfSquares[nextLineIndex].length - 1,
        )
        setCurrentLineIndex(nextLineIndex)
        setCursor(nextLineCursor)
        checkTarget(nextLineCursor, nextLineIndex)
      }
      return true
    },
    k: () => {
      if (awaitingCharacter) return handleCharacterInput('k')
      level.activateTimer()
      setLastKeyPressed('k')
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
      return true
    },
  }

  // Add handlers for all possible character inputs
  const allChars =
    'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!@#$%^&*()-_=+[]{}\\|;:\'",.<>/?'
  for (const char of allChars) {
    if (keyActions[char]) continue
    keyActions[char] = () => {
      if (!awaitingCharacter) return false
      return handleCharacterInput(char)
    }
  }

  const { lastKeyPressed: keyboardLastKey } = useKeyboardHandler({
    keyActionMap: keyActions,
    dependencies: [
      cursor,
      currentLineIndex,
      linesOfSquares,
      awaitingCharacter,
      pendingCommand,
    ],
    disabled: level.levelCompleted,
  })

  useEffect(() => {
    if (keyboardLastKey && !awaitingCharacter) {
      setLastKeyPressed(keyboardLastKey)
    }
  }, [keyboardLastKey, awaitingCharacter])

  // Check if the player has reached the target
  const checkTarget = (newPos: number, lineIndex: number) => {
    if (newPos === target && lineIndex === targetLineIndex) {
      setExplosionIdx(newPos)
      setExplosionLineIdx(lineIndex)
      setShowExplosion(true)

      setRevealedLetters((prev) => {
        const newSet = new Set(prev)
        newSet.add(`${lineIndex}-${newPos}`)
        return newSet
      })

      level.incrementScore()

      setTimeout(() => {
        setShowExplosion(false)
        setExplosionIdx(null)
        setExplosionLineIdx(null)
        setNewTarget()
      }, 200)
    }
  }

  return (
    <LevelShell
      level={level}
      className="flex flex-col items-center justify-center bg-bg-primary text-white"
    >
      <div className="w-full max-w-4xl">
        <div className="flex flex-col items-center mb-2">
          <p className="text-text-muted text-center max-w-lg mb-4">
            Use <kbd className="px-2 py-1 bg-bg-secondary rounded">f</kbd>,{' '}
            <kbd className="px-2 py-1 bg-bg-secondary rounded">F</kbd>,{' '}
            <kbd className="px-2 py-1 bg-bg-secondary rounded">t</kbd> and{' '}
            <kbd className="px-2 py-1 bg-bg-secondary rounded">T</kbd> to quickly
            jump to a character occurence in the current line.
          </p>

          <div className="flex items-center gap-4 mb-2">
            <LevelHeader
              title=""
              score={level.score}
              maxScore={level.maxScore}
              onReset={level.resetLevel}
            />
            {targetChar && (
              <div className="bg-purple-600 px-4 py-2 rounded-lg text-white flex items-center gap-2 shadow-md">
                <span>Target: </span>
                <span className="font-mono font-bold">{targetChar}</span>
              </div>
            )}
            {awaitingCharacter && (
              <div className="bg-amber-600 px-4 py-2 rounded-lg text-white animate-pulse flex items-center gap-2 shadow-md">
                <span>
                  Type a character to{' '}
                  {pendingCommand === 'f'
                    ? 'find'
                    : pendingCommand === 'F'
                      ? 'find (reverse)'
                      : pendingCommand === 't'
                        ? 'move before'
                        : 'move after'}
                  ...
                </span>
              </div>
            )}
          </div>
        </div>
        <div className="relative flex  flex-col w-full max-w-4xl bg-bg-secondary p-6 py-8 rounded-lg mx-auto">
          {/* Container for all lines */}
          <div className="flex-1">
            <div className="flex flex-col max-w-[calc(100vw-5rem)] overflow-x-scroll py-4 overflow-y-visible">
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

                        const isTarget2 =
                          square.idx === target && lineIdx === targetLineIndex

                        const isRevealed = revealedLetters.has(
                          `${lineIdx}-${square.idx}`,
                        )

                        const isMatchingChar =
                          lineIdx === currentLineIndex &&
                          targetChar &&
                          square.char.toLowerCase() === targetChar.toLowerCase()

                        let base =
                          'inline-flex items-center justify-center mx-0.5 my-0.5 min-w-8 h-8 transition-all duration-150 rounded-md '

                        if (isPlayer)
                          base +=
                            'bg-emerald-500 text-white scale-110 shadow-lg shadow-emerald-500/50 '
                        else if (isTarget2)
                          base +=
                            'bg-purple-500 text-white scale-105 shadow-lg shadow-purple-500/60 animate-pulse '
                        else if (isMatchingChar)
                          base += 'bg-amber-500/30 text-amber-200 '
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
                            {isTarget2 && (
                              <span className="absolute inset-0 rounded-md animate-ping bg-purple-500 opacity-30 z-0"></span>
                            )}

                            {(isRevealed || isMatchingChar) &&
                              square.char !== ' ' && (
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
          <div className="text-xs text-text-subtle mt-4 max-w-xl">
            <span className="font-semibold">NOTE:</span> While this level is
            case insensitive for learning purposes, Vim's line search is indeed
            case sensitive.
          </div>
          <div className="text-xs text-text-subtle mt-4 max-w-xl">
            <span className="text-emerald-400 font-semibold">PRO TIP:</span>{' '}
            After using any character search command (f, F, t, T), press{' '}
            <kbd className="px-1 py-0.5 bg-bg-tertiary rounded text-text-secondary">
              ;
            </kbd>{' '}
            to repeat the search in the same direction or{' '}
            <kbd className="px-1 py-0.5 bg-bg-tertiary rounded text-text-secondary">
              ,
            </kbd>{' '}
            to repeat in the opposite direction. This lets you quickly navigate
            through multiple occurrences of the same character. It even works
            after moving to a different line!
          </div>
        </div>
        <KeysAllowed
          keys={['f', 'F', 't', 'T', ';', ',', 'j', 'k']}
          lastKeyPressed={lastKeyPressed}
        >
          {pendingCommand && (
            <div className="flex items-center">
              <span className="mx-2">+</span>
              <kbd className="px-3 py-1 bg-amber-600 text-white rounded-lg animate-pulse">
                ?
              </kbd>
            </div>
          )}
          {lastKeyPressed.length > 1 && (
            <div className="flex items-center">
              <span className="text-emerald-400 font-mono px-3 py-1 bg-bg-secondary rounded-lg">
                {lastKeyPressed}
              </span>
            </div>
          )}
        </KeysAllowed>
      </div>

      <style>
        {`
          @keyframes marquee {
            0% { transform: translateX(50%); }
            100% { transform: translateX(-50%); }
          }
        `}
      </style>
    </LevelShell>
  )
}

export default FindChars4
