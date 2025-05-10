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
import WarningSplash from '../common/WarningSplash'

interface LevelProps {
  isMuted: boolean
}

const SearchLevel5: React.FC<LevelProps> = () => {
  // Array of text with words to search for
  const sampleTexts = [
    'Use search to navigate quickly.',
    'In Vim, press / to search forward.',
    'Press ? to search backward.',
    'Press n to find the next match.',
    'Press N to find the previous match.',
    'Search is not just for finding text.',
    'It can be the fastest way to move.',
    'Search commands are powerful tools.',
    'Try searching for "search" here.',
    'Or find the word "tools" to practice.',
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

  // Search functionality states
  const [isSearching, setIsSearching] = useState(false)
  const [searchDirection, setSearchDirection] = useState<
    'forward' | 'backward'
  >('forward')
  const [searchTerm, setSearchTerm] = useState('')
  const [searchMatches, setSearchMatches] = useState<
    Array<{ lineIdx: number; startIdx: number; endIdx: number }>
  >([])
  const [currentMatchIndex, setCurrentMatchIndex] = useState<number>(-1)
  const [searchHistory, setSearchHistory] = useState<string[]>([])
  const [historyIndex, setHistoryIndex] = useState<number>(-1)
  const [timerActive, setTimerActive] = useState<boolean>(false)

  // Refs for scrolling
  const containerRef = useRef<HTMLDivElement>(null)
  const playerRef = useRef<HTMLSpanElement>(null)
  const searchInputRef = useRef<HTMLInputElement>(null)

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
    // First, find all potential targets that have special patterns (like "search" or "tools")
    const targetPatterns = ['search', 'vim', 'tools', 'next', 'move']
    const potentialTargets: Array<{
      lineIdx: number
      charIdx: number
      pattern: string
    }> = []

    linesOfSquares.forEach((line, lineIdx) => {
      const lineText = line
        .map((square) => square.char)
        .join('')
        .toLowerCase()
      targetPatterns.forEach((pattern) => {
        let startIdx = lineText.indexOf(pattern)
        while (startIdx !== -1) {
          potentialTargets.push({
            lineIdx,
            charIdx: startIdx + Math.floor(pattern.length / 2), // Target middle of word
            pattern,
          })
          startIdx = lineText.indexOf(pattern, startIdx + 1)
        }
      })
    })

    if (potentialTargets.length === 0) {
      // Fallback to random position if no patterns found
      const randomLineIndex = Math.floor(Math.random() * linesOfSquares.length)
      const randomPos = Math.floor(
        Math.random() * linesOfSquares[randomLineIndex].length,
      )
      setTarget(randomPos)
      setTargetLineIndex(randomLineIndex)
    } else {
      // Choose a random target from the potential targets
      const randomTarget =
        potentialTargets[Math.floor(Math.random() * potentialTargets.length)]
      setTarget(randomTarget.charIdx)
      setTargetLineIndex(randomTarget.lineIdx)
    }
  }

  // Initialize the game with a random target
  useEffect(() => {
    setNewTarget()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  // Start timer on first interaction
  const activateTimer = () => {
    if (!timerActive) {
      setTimerActive(true)
    }
  }

  // Perform search across all lines
  const performSearch = (term: string) => {
    activateTimer()
    if (!term) {
      setSearchMatches([])
      setCurrentMatchIndex(-1)
      return
    }

    const matches: Array<{
      lineIdx: number
      startIdx: number
      endIdx: number
    }> = []
    const lowercaseTerm = term.toLowerCase()

    linesOfSquares.forEach((line, lineIdx) => {
      const lineText = line
        .map((square) => square.char)
        .join('')
        .toLowerCase()
      let startIdx = lineText.indexOf(lowercaseTerm)

      while (startIdx !== -1) {
        matches.push({
          lineIdx,
          startIdx,
          endIdx: startIdx + lowercaseTerm.length - 1,
        })
        startIdx = lineText.indexOf(lowercaseTerm, startIdx + 1)
      }
    })

    setSearchMatches(matches)

    // Set current match index based on search direction and current cursor position
    if (matches.length > 0) {
      if (searchDirection === 'forward') {
        // Find the next match after current position
        const nextMatch = matches.findIndex(
          (match) =>
            match.lineIdx > currentLineIndex ||
            (match.lineIdx === currentLineIndex && match.startIdx > cursor),
        )
        setCurrentMatchIndex(nextMatch !== -1 ? nextMatch : 0)
      } else {
        // Find the previous match before current position
        const prevMatchIndex = matches.findIndex(
          (match) =>
            match.lineIdx < currentLineIndex ||
            (match.lineIdx === currentLineIndex && match.startIdx < cursor),
        )
        setCurrentMatchIndex(
          prevMatchIndex !== -1 ? prevMatchIndex : matches.length - 1,
        )
      }
    } else {
      setCurrentMatchIndex(-1)
    }
  }

  // Navigate to the next search match
  const navigateToNextMatch = () => {
    activateTimer()
    if (searchMatches.length === 0) return

    let newMatchIndex
    if (searchDirection === 'forward') {
      newMatchIndex = (currentMatchIndex + 1) % searchMatches.length
    } else {
      newMatchIndex =
        (currentMatchIndex - 1 + searchMatches.length) % searchMatches.length
    }

    setCurrentMatchIndex(newMatchIndex)
    const match = searchMatches[newMatchIndex]
    setCurrentLineIndex(match.lineIdx)
    setCursor(match.startIdx)
    checkTarget(match.startIdx, match.lineIdx)
  }

  // Navigate to the previous search match
  const navigateToPrevMatch = () => {
    activateTimer()
    if (searchMatches.length === 0) return

    let newMatchIndex
    if (searchDirection === 'forward') {
      newMatchIndex =
        (currentMatchIndex - 1 + searchMatches.length) % searchMatches.length
    } else {
      newMatchIndex = (currentMatchIndex + 1) % searchMatches.length
    }

    setCurrentMatchIndex(newMatchIndex)
    const match = searchMatches[newMatchIndex]
    setCurrentLineIndex(match.lineIdx)
    setCursor(match.startIdx)
    checkTarget(match.startIdx, match.lineIdx)
  }

  // Clear search state
  const clearSearch = () => {
    setIsSearching(false)
    setSearchTerm('')
    setHistoryIndex(-1)
    // Keep search matches and currentMatchIndex to allow further navigation

    // Remove searching class from body
    document.body.classList.remove('searching')

    // Return focus to container
    if (containerRef.current) {
      setTimeout(() => {
        containerRef.current?.focus()
      }, 10)
    }
  }

  // Start searching
  const startSearch = (direction: 'forward' | 'backward') => {
    activateTimer()
    setIsSearching(true)
    setSearchDirection(direction)
    setSearchTerm('')
    setSearchMatches([])
    setCurrentMatchIndex(-1)

    // Immediately add a class to the body to help with styling/handling
    document.body.classList.add('searching')

    // We need to wait for the input to be rendered before focusing
    setTimeout(() => {
      if (searchInputRef.current) {
        try {
          // Try multiple focus methods
          searchInputRef.current.focus()
          searchInputRef.current.click()

          // Create a temporary input event to trigger browser focus behavior
          const event = new Event('input', { bubbles: true })
          searchInputRef.current.dispatchEvent(event)

          // Place cursor at end of text
          const length = searchInputRef.current.value.length
          searchInputRef.current.setSelectionRange(length, length)
        } catch (e) {
          console.error('Failed to focus search input:', e)
        }
      }
    }, 100)
  }

  // Handle search input change
  const handleSearchInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    activateTimer()
    e.stopPropagation() // Prevent event bubbling
    const value = e.target.value
    setSearchTerm(value)
    // Don't search on every keystroke to avoid performance issues
    if (value.length >= 1) {
      performSearch(value)
    } else if (value.length === 0) {
      setSearchMatches([])
      setCurrentMatchIndex(-1)
    }
  }

  // Handle search input submission
  const handleSearchSubmit = (e: React.FormEvent) => {
    activateTimer()
    e.preventDefault()
    e.stopPropagation()

    if (searchTerm) {
      // Ensure we have the most up-to-date search results
      performSearch(searchTerm)

      // If matches found, go to the first one
      if (searchMatches.length > 0 && currentMatchIndex !== -1) {
        const match = searchMatches[currentMatchIndex]
        setCurrentLineIndex(match.lineIdx)
        setCursor(match.startIdx)
        checkTarget(match.startIdx, match.lineIdx)
      }

      // Add to search history if not already the most recent entry
      setSearchHistory((prev) => {
        // Don't add duplicates in a row
        if (prev.length === 0 || prev[0] !== searchTerm) {
          return [searchTerm, ...prev]
        }
        return prev
      })
      setHistoryIndex(-1)
    }

    // End search mode
    clearSearch()
  }

  // Key actions map
  const keyActions: KeyActionMap = {
    // Search operations are now handled by the global event handler
    // to prevent conflicts with input field
    n: () => {
      activateTimer()
      if (searchMatches.length > 0) {
        navigateToNextMatch()
        setLastKeyPressed('n')
      }
    },
    N: () => {
      activateTimer()
      if (searchMatches.length > 0) {
        navigateToPrevMatch()
        setLastKeyPressed('N')
      }
    },
    Escape: () => {
      if (isSearching) {
        clearSearch()
      }
    },
    h: () => {
      activateTimer()
      if (!isSearching) {
        setLastKeyPressed('h')
        if (cursor > 0) {
          const newPos = cursor - 1
          setCursor(newPos)
          checkTarget(newPos, currentLineIndex)
        }
      }
    },
    l: () => {
      activateTimer()
      if (!isSearching) {
        setLastKeyPressed('l')
        if (cursor < linesOfSquares[currentLineIndex].length - 1) {
          const newPos = cursor + 1
          setCursor(newPos)
          checkTarget(newPos, currentLineIndex)
        }
      }
    },
    j: () => {
      activateTimer()
      if (!isSearching) {
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
      }
    },
    k: () => {
      activateTimer()
      if (!isSearching) {
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
      }
    },
  }

  // Setup global event handler for the search input
  useEffect(() => {
    // Create a global handler for keyboard events
    const handleGlobalKeyDown = (e: KeyboardEvent) => {
      // Don't interfere with input typing
      if (
        document.activeElement instanceof HTMLInputElement ||
        document.activeElement instanceof HTMLTextAreaElement
      ) {
        if (e.key === 'Escape') {
          e.preventDefault()
          clearSearch()
        }
        return
      }

      // Handle search keys when not in search mode
      if (!isSearching) {
        if (e.key === '/' || e.key === '?') {
          e.preventDefault()
          startSearch(e.key === '/' ? 'forward' : 'backward')
        }
      }
    }

    window.addEventListener('keydown', handleGlobalKeyDown)
    return () => {
      window.removeEventListener('keydown', handleGlobalKeyDown)
    }
  }, [isSearching])

  // Register keyboard handler
  const { lastKeyPressed: keyboardLastKey } = useKeyboardHandler({
    keyActionMap: keyActions,
    dependencies: [
      cursor,
      currentLineIndex,
      linesOfSquares,
      searchMatches,
      currentMatchIndex,
    ],
    disabled: isSearching,
    onAnyKey: () => {
      // Always check if we're searching and refocus the input if needed
      if (
        isSearching &&
        searchInputRef.current &&
        document.activeElement !== searchInputRef.current
      ) {
        searchInputRef.current.focus()
      }
    },
  })

  // Update lastKeyPressed state when keyboard events happen
  useEffect(() => {
    if (keyboardLastKey) {
      setLastKeyPressed(keyboardLastKey)
    }
  }, [keyboardLastKey])

  // Add a global click handler to help manage search state
  useEffect(() => {
    const handleGlobalClick = (e: MouseEvent) => {
      // If we're searching and click outside the search form, end search
      if (isSearching) {
        const target = e.target as HTMLElement
        const searchForm = document.querySelector('form')
        if (searchForm && !searchForm.contains(target)) {
          clearSearch()
        }
      }
    }

    window.addEventListener('click', handleGlobalClick)
    return () => {
      window.removeEventListener('click', handleGlobalClick)
    }
  }, [isSearching])

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

        // Check if level is completed (10 targets hit)
        if (score + 1 >= 10) {
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
    clearSearch()
    setSearchHistory([])
    setHistoryIndex(-1)
    setNewTarget()
  }

  // Determine if a character is part of a search match
  const isInSearchMatch = (lineIdx: number, charIdx: number) => {
    if (searchMatches.length === 0) return false

    return searchMatches.some(
      (match) =>
        match.lineIdx === lineIdx &&
        charIdx >= match.startIdx &&
        charIdx <= match.endIdx,
    )
  }

  // Determine if a character is part of the current search match
  const isInCurrentMatch = (lineIdx: number, charIdx: number) => {
    if (searchMatches.length === 0 || currentMatchIndex === -1) return false

    const currentMatch = searchMatches[currentMatchIndex]
    return (
      currentMatch.lineIdx === lineIdx &&
      charIdx >= currentMatch.startIdx &&
      charIdx <= currentMatch.endIdx
    )
  }

  return (
    <div
      className={`flex flex-col items-center justify-center bg-zinc-900 text-white ${isSearching ? 'searching' : ''}`}
      tabIndex={-1}
    >
      <div className="w-full max-w-6xl px-4">
        <div className="flex flex-col items-center mb-2">
          <p className="text-zinc-400 text-center max-w-lg mb-4">
            Use <kbd className="px-2 py-1 bg-zinc-800 rounded">/</kbd> to search
            forward,
            <kbd className="px-2 py-1 bg-zinc-800 rounded">?</kbd> to search
            backward,
            <kbd className="px-2 py-1 bg-zinc-800 rounded">n</kbd> for next
            match, and <kbd className="px-2 py-1 bg-zinc-800 rounded">N</kbd>{' '}
            for previous match.
          </p>

          <div className="flex items-center gap-4 mb-2">
            <div className="bg-zinc-800 px-4 py-2 rounded-lg">
              <span className="text-zinc-400 mr-2">Score:</span>
              <span className="text-emerald-400 font-bold">{score}</span>
              <span className="text-zinc-600 ml-1">/10</span>
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
          </div>
        </div>
        <div
          className="relative w-full max-w-6xl bg-zinc-800 p-6 py-8 rounded-lg mx-auto overflow-y-scroll"
          ref={containerRef}
          tabIndex={0}
          onClick={() => isSearching && clearSearch()}
        >
          {/* Search Input */}
          {isSearching && (
            <div className="absolute bottom-2 left-6 right-6 z-10">
              <form
                onSubmit={handleSearchSubmit}
                className="flex items-center"
                onClick={(e) => e.stopPropagation()}
              >
                <span className="text-emerald-400 mr-2 font-mono text-lg">
                  {searchDirection === 'forward' ? '/' : '?'}
                </span>
                <input
                  ref={searchInputRef}
                  type="text"
                  value={searchTerm}
                  onChange={handleSearchInputChange}
                  onClick={(e) => e.stopPropagation()}
                  onFocus={(e) => {
                    e.currentTarget.select()
                    e.stopPropagation()
                  }}
                  onKeyDown={(e) => {
                    // Prevent propagation to avoid triggering other keyboard handlers
                    e.stopPropagation()
                    if (e.key === 'Escape') {
                      e.preventDefault()
                      clearSearch()
                    } else if (e.key === 'Enter') {
                      e.preventDefault()
                      handleSearchSubmit(e)
                    } else if (e.key === 'ArrowUp') {
                      e.preventDefault()
                      if (searchHistory.length > 0) {
                        const newIndex =
                          historyIndex < searchHistory.length - 1
                            ? historyIndex + 1
                            : historyIndex
                        setHistoryIndex(newIndex)
                        const historyItem = searchHistory[newIndex]
                        setSearchTerm(historyItem)
                        performSearch(historyItem)
                      }
                    } else if (e.key === 'ArrowDown') {
                      e.preventDefault()
                      if (historyIndex > 0) {
                        const newIndex = historyIndex - 1
                        setHistoryIndex(newIndex)
                        const historyItem = searchHistory[newIndex]
                        setSearchTerm(historyItem)
                        performSearch(historyItem)
                      } else if (historyIndex === 0) {
                        setHistoryIndex(-1)
                        setSearchTerm('')
                      }
                    }
                  }}
                  className="bg-zinc-700 text-white px-2 py-1 rounded flex-grow focus:outline-none focus:ring-2 focus:ring-emerald-400 font-mono"
                  autoFocus
                  autoComplete="off"
                  spellCheck="false"
                  placeholder="Type to search..."
                  onBlur={(e) => e.stopPropagation()}
                />
              </form>
            </div>
          )}

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

                      // Track revealed letters for game state
                      revealedLetters.has(`${lineIdx}-${square.idx}`)

                      const isSearchHighlight = isInSearchMatch(
                        lineIdx,
                        square.idx,
                      )
                      const isCurrentMatchHighlight = isInCurrentMatch(
                        lineIdx,
                        square.idx,
                      )

                      let base =
                        'inline-flex items-center justify-center mx-0.5 my-0.5 min-w-6 h-8 transition-all duration-150 rounded-md '

                      if (isPlayer)
                        base +=
                          'bg-emerald-500 text-white scale-110 shadow-lg shadow-emerald-500/50 '
                      else if (isTarget)
                        base +=
                          'bg-purple-500 text-white scale-105 shadow-lg shadow-purple-500/60 animate-pulse '
                      else if (isCurrentMatchHighlight)
                        base +=
                          'bg-amber-500 text-white scale-105 shadow-lg shadow-amber-500/50 '
                      else if (isSearchHighlight)
                        base += 'bg-amber-500/30 text-amber-200 '
                      else base += 'bg-zinc-700 text-zinc-300 '

                      if (square.isSpace) {
                        let baseSpace =
                          'inline-block mx-0.5 my-0.5 w-6 h-8 transition-all duration-150 rounded-md '
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

                          {/* Show the character always */}
                          <span className="z-10 text-lg font-medium font-mono">
                            {square.char}
                          </span>

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
            <div className="text-xs text-zinc-500 mt-4 max-w-xl">
              <span className="font-semibold">NOTE:</span> While this level is
              case insensitive for learning purposes, Vim's{' '}
              <kbd className="px-1 py-1 bg-zinc-700 rounded text-white font-mono">
                /
              </kbd>{' '}
              search is usually case sensitive by default.
            </div>
          </div>
        </div>
        <div className="flex gap-4 text-zinc-400 mt-4 justify-center">
          {['/', '?', 'n', 'N', 'h', 'j', 'k', 'l'].map((k) => (
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
        </div>
      </div>

      {/* Level Timer */}
      <LevelTimer levelId="5-search-level" isActive={timerActive} />
      {/* <WarningSplash /> */}
    </div>
  )
}

export default SearchLevel5
