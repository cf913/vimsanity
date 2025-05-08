import React, { useState, useRef, useEffect } from 'react'
import {
  useKeyboardHandler,
  KeyActionMap,
} from '../../hooks/useKeyboardHandler'
import { processTextForVim } from '../../utils/textUtils'
import ExplosionEffect from './ExplosionEffect'
import ConfettiBurst from './ConfettiBurst'
import { RefreshCw, Zap, AlertTriangle, X } from 'lucide-react'
import WarningSplash from '../common/WarningSplash'

interface LevelProps {
  isMuted: boolean
}

const FindChars4: React.FC<LevelProps> = ({ isMuted }) => {
  // Array of 5 different lines of text
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
    // Choose a random line
    const randomLineIndex = Math.floor(Math.random() * linesOfSquares.length)

    // Find a non-space character to use as the target
    const nonSpaceIndices = linesOfSquares[randomLineIndex]
      .map((square, idx) => (!square.isSpace ? idx : -1))
      .filter((idx) => idx !== -1)

    if (nonSpaceIndices.length === 0) {
      // If no non-space characters, try another line
      setNewTarget()
      return
    }

    // Choose a random non-space character
    const randomPos =
      nonSpaceIndices[Math.floor(Math.random() * nonSpaceIndices.length)]

    // Set the target character for display
    setTargetChar(linesOfSquares[randomLineIndex][randomPos].char)
    setTarget(randomPos)
    setTargetLineIndex(randomLineIndex)
  }

  // Initialize the game with a random target
  useEffect(() => {
    setNewTarget()
  }, [])

  // Function to handle 'f' command
  const handleFCommand = (char: string) => {
    // Find the next occurrence of the character on the current line
    const currentLine = linesOfSquares[currentLineIndex]
    for (let i = cursor + 1; i < currentLine.length; i++) {
      if (currentLine[i].char.toLowerCase() === char.toLowerCase()) {
        setCursor(i)
        checkTarget(i, currentLineIndex)
        return true
      }
    }
    return false // Character not found
  }

  // Function to handle 'F' command (reverse search)
  const handleFReverseCommand = (char: string) => {
    // Find the previous occurrence of the character on the current line
    const currentLine = linesOfSquares[currentLineIndex]
    for (let i = cursor - 1; i >= 0; i--) {
      if (currentLine[i].char.toLowerCase() === char.toLowerCase()) {
        setCursor(i)
        checkTarget(i, currentLineIndex)
        return true
      }
    }
    return false // Character not found
  }

  // Function to handle 't' command
  const handleTCommand = (char: string) => {
    // Move to just before the next occurrence of the character
    const currentLine = linesOfSquares[currentLineIndex]
    for (let i = cursor + 1; i < currentLine.length; i++) {
      if (currentLine[i].char.toLowerCase() === char.toLowerCase()) {
        setCursor(i - 1)
        checkTarget(i - 1, currentLineIndex)
        return true
      }
    }
    return false // Character not found
  }

  // Function to handle 'T' command (reverse search)
  const handleTReverseCommand = (char: string) => {
    // Move to just after the previous occurrence of the character
    const currentLine = linesOfSquares[currentLineIndex]
    for (let i = cursor - 1; i >= 0; i--) {
      if (currentLine[i].char.toLowerCase() === char.toLowerCase()) {
        setCursor(i + 1)
        checkTarget(i + 1, currentLineIndex)
        return true
      }
    }
    return false // Character not found
  }

  // Handle character input after f or t command
  const handleCharacterInput = (char: string) => {
    if (!awaitingCharacter) return false

    setLastKeyPressed(pendingCommand + char)
    setAwaitingCharacter(false)

    // Save the last search character and command for ; and , keys
    setLastSearchChar(char)
    setLastSearchCommand(pendingCommand)

    let success = false
    if (pendingCommand === 'f') {
      success = handleFCommand(char)
    } else if (pendingCommand === 'F') {
      success = handleFReverseCommand(char)
    } else if (pendingCommand === 't') {
      success = handleTCommand(char)
    } else if (pendingCommand === 'T') {
      success = handleTReverseCommand(char)
    }

    setPendingCommand(null)
    return success
  }

  // Repeat last search in same direction (;)
  const repeatLastSearch = () => {
    if (!lastSearchChar || !lastSearchCommand) return false

    setLastKeyPressed(';')

    let success = false
    if (lastSearchCommand === 'f') {
      success = handleFCommand(lastSearchChar)
    } else if (lastSearchCommand === 'F') {
      success = handleFReverseCommand(lastSearchChar)
    } else if (lastSearchCommand === 't') {
      success = handleTCommand(lastSearchChar)
    } else if (lastSearchCommand === 'T') {
      success = handleTReverseCommand(lastSearchChar)
    }

    return success
  }

  // Repeat last search in opposite direction (,)
  const repeatLastSearchReverse = () => {
    if (!lastSearchChar || !lastSearchCommand) return false

    setLastKeyPressed(',')

    let success = false
    // Use the opposite command
    if (lastSearchCommand === 'f') {
      success = handleFReverseCommand(lastSearchChar)
    } else if (lastSearchCommand === 'F') {
      success = handleFCommand(lastSearchChar)
    } else if (lastSearchCommand === 't') {
      success = handleTReverseCommand(lastSearchChar)
    } else if (lastSearchCommand === 'T') {
      success = handleTCommand(lastSearchChar)
    }

    return success
  }

  // Key actions for movement
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

      setLastKeyPressed('j')
      if (currentLineIndex < linesOfSquares.length - 1) {
        // Move to next line
        const nextLineIndex = currentLineIndex + 1
        // Ensure cursor doesn't go beyond the end of the next line
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

      setLastKeyPressed('k')
      if (currentLineIndex > 0) {
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

  // Register keyboard handler
  const { lastKeyPressed: keyboardLastKey } = useKeyboardHandler({
    keyActionMap: keyActions,
    dependencies: [
      cursor,
      currentLineIndex,
      linesOfSquares,
      awaitingCharacter,
      pendingCommand,
    ],
  })

  // Update lastKeyPressed state when keyboard events happen
  useEffect(() => {
    if (keyboardLastKey && !awaitingCharacter) {
      setLastKeyPressed(keyboardLastKey)
    }
  }, [keyboardLastKey, awaitingCharacter])

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

        // Check if level is completed (100 targets hit)
        if (score + 1 >= 100) {
          setLevelCompleted(true)
          setShowConfetti(true)
          setTimeout(() => {
            setShowConfetti(false)
          }, 3000)
        }
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
    setAwaitingCharacter(false)
    setPendingCommand(null)
    setLastSearchChar(null)
    setLastSearchCommand(null)
    setNewTarget()
  }

  return (
    <div className="flex flex-col items-center justify-center bg-zinc-900 text-white">
      <div className="w-full max-w-4xl">
        <div className="flex flex-col items-center mb-2">
          <p className="text-zinc-400 text-center max-w-lg mb-4">
            Use <kbd className="px-2 py-1 bg-zinc-800 rounded">f</kbd>,{' '}
            <kbd className="px-2 py-1 bg-zinc-800 rounded">F</kbd>,{' '}
            <kbd className="px-2 py-1 bg-zinc-800 rounded">t</kbd> and{' '}
            <kbd className="px-2 py-1 bg-zinc-800 rounded">T</kbd> to quickly
            jump to a character occurence in the current line.
          </p>

          <div className="flex items-center gap-4 mb-2">
            <div className="bg-zinc-800 px-4 py-2 rounded-lg">
              <span className="text-zinc-400 mr-2">Score:</span>
              <span className="text-emerald-400 font-bold">{score}</span>
              <span className="text-zinc-600 ml-1">/100</span>
            </div>
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
        <div className="relative flex  flex-col w-full max-w-4xl bg-zinc-800 p-6 py-8 rounded-lg mx-auto">
          {/* Global Confetti Burst over the game area */}
          {showConfetti && <ConfettiBurst />}

          {/* Container for all lines */}
          <div className="flex-1">
            <div className="flex flex-col max-w-[calc(100vw-5rem)] overflow-x-scroll py-4 overflow-y-visible">
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

                        // Highlight characters that match the target character on the current line
                        const isMatchingChar =
                          lineIdx === currentLineIndex &&
                          targetChar &&
                          square.char.toLowerCase() === targetChar.toLowerCase()
                        {
                          /* square.idx > cursor */
                        }

                        let base =
                          'inline-flex items-center justify-center mx-0.5 my-0.5 min-w-8 h-8 transition-all duration-150 rounded-md '

                        if (isPlayer)
                          base +=
                            'bg-emerald-500 text-white scale-110 shadow-lg shadow-emerald-500/50 '
                        else if (isTarget)
                          base +=
                            'bg-purple-500 text-white scale-105 shadow-lg shadow-purple-500/60 animate-pulse '
                        else if (isMatchingChar)
                          base += 'bg-amber-500/30 text-amber-200 '
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

                            {/* Show the character if it's been revealed or is a matching character */}
                            {(isRevealed || isMatchingChar) &&
                              square.char !== ' ' && (
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
          <div className="text-xs text-zinc-500 mt-4 max-w-xl">
            <span className="font-semibold">NOTE:</span> While this level is
            case insensitive for learning purposes, Vim's line search is indeed
            case sensitive.
          </div>
          <div className="text-xs text-zinc-500 mt-4 max-w-xl">
            <span className="text-emerald-400 font-semibold">PRO TIP:</span>{' '}
            After using any character search command (f, F, t, T), press{' '}
            <kbd className="px-1 py-0.5 bg-zinc-700 rounded text-zinc-300">
              ;
            </kbd>{' '}
            to repeat the search in the same direction or{' '}
            <kbd className="px-1 py-0.5 bg-zinc-700 rounded text-zinc-300">
              ,
            </kbd>{' '}
            to repeat in the opposite direction. This lets you quickly navigate
            through multiple occurrences of the same character. It even works
            after moving to a different line!
          </div>
        </div>
        <div className="flex gap-4 text-zinc-400 mt-4 justify-center">
          {['f', 'F', 't', 'T', ';', ',', 'j', 'k'].map((k) => (
            <kbd
              key={k}
              className={`px-3 py-1 bg-zinc-800 rounded-lg transition-all duration-150 ${
                lastKeyPressed === k
                  ? 'bg-emerald-500 text-white shadow-lg shadow-emerald-500/50 scale-110'
                  : ''
              }`}
            >
              {k}
            </kbd>
          ))}
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
              <span className="text-emerald-400 font-mono px-3 py-1 bg-zinc-800 rounded-lg">
                {lastKeyPressed}
              </span>
            </div>
          )}
        </div>
      </div>
      {/* Rolling banner at the bottom */}
      <style>
        {`
          @keyframes marquee {
            0% { transform: translateX(50%); }
            100% { transform: translateX(-50%); }
          }
        `}
      </style>
    </div>
  )
}

export default FindChars4
