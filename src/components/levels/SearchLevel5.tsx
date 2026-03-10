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

  const level = useVimLevel({
    levelId: '5-search-level',
    maxScore: 10,
    onReset: () => {
      setCursor(0)
      setCurrentLineIndex(0)
      setRevealedLetters(new Set())
      clearSearch()
      setSearchHistory([])
      setHistoryIndex(-1)
      setShowExplosion(false)
      setExplosionIdx(null)
      setExplosionLineIdx(null)
      setNewTarget()
    },
  })

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
    const targetPatterns = [
      'search',
      'vim',
      'tools',
      'next',
      'move',
      'to',
      'find',
      'the',
      'next',
      'match',
    ]
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
            charIdx: startIdx + Math.floor(pattern.length / 2),
            pattern,
          })
          startIdx = lineText.indexOf(pattern, startIdx + 1)
        }
      })
    })

    if (potentialTargets.length === 0) {
      const randomLineIndex = Math.floor(Math.random() * linesOfSquares.length)
      const randomPos = Math.floor(
        Math.random() * linesOfSquares[randomLineIndex].length,
      )
      setTarget(randomPos)
      setTargetLineIndex(randomLineIndex)
    } else {
      const randomTarget =
        potentialTargets[Math.floor(Math.random() * potentialTargets.length)]
      setTarget(randomTarget.charIdx)
      setTargetLineIndex(randomTarget.lineIdx)
    }
  }

  useEffect(() => {
    setNewTarget()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  // Perform search across all lines
  const performSearch = (term: string) => {
    level.activateTimer()
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

    if (matches.length > 0) {
      if (searchDirection === 'forward') {
        const nextMatch = matches.findIndex(
          (match) =>
            match.lineIdx > currentLineIndex ||
            (match.lineIdx === currentLineIndex && match.startIdx > cursor),
        )
        setCurrentMatchIndex(nextMatch !== -1 ? nextMatch : 0)
      } else {
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

  const navigateToNextMatch = () => {
    level.activateTimer()
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

  const navigateToPrevMatch = () => {
    level.activateTimer()
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

  const clearSearch = () => {
    setIsSearching(false)
    setSearchTerm('')
    setHistoryIndex(-1)
    document.body.classList.remove('searching')

    if (containerRef.current) {
      setTimeout(() => {
        containerRef.current?.focus()
      }, 10)
    }
  }

  const startSearch = (direction: 'forward' | 'backward') => {
    level.activateTimer()
    setIsSearching(true)
    setSearchDirection(direction)
    setSearchTerm('')
    setSearchMatches([])
    setCurrentMatchIndex(-1)

    document.body.classList.add('searching')

    setTimeout(() => {
      if (searchInputRef.current) {
        try {
          searchInputRef.current.focus()
          searchInputRef.current.click()

          const event = new Event('input', { bubbles: true })
          searchInputRef.current.dispatchEvent(event)

          const length = searchInputRef.current.value.length
          searchInputRef.current.setSelectionRange(length, length)
        } catch (e) {
          console.error('Failed to focus search input:', e)
        }
      }
    }, 100)
  }

  const handleSearchInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    level.activateTimer()
    e.stopPropagation()
    const value = e.target.value
    setSearchTerm(value)
    if (value.length >= 1) {
      performSearch(value)
    } else if (value.length === 0) {
      setSearchMatches([])
      setCurrentMatchIndex(-1)
    }
  }

  const handleSearchSubmit = (e: React.FormEvent) => {
    level.activateTimer()
    e.preventDefault()
    e.stopPropagation()

    if (searchTerm) {
      performSearch(searchTerm)

      if (searchMatches.length > 0 && currentMatchIndex !== -1) {
        const match = searchMatches[currentMatchIndex]
        setCurrentLineIndex(match.lineIdx)
        setCursor(match.startIdx)
        checkTarget(match.startIdx, match.lineIdx)
      }

      setSearchHistory((prev) => {
        if (prev.length === 0 || prev[0] !== searchTerm) {
          return [searchTerm, ...prev]
        }
        return prev
      })
      setHistoryIndex(-1)
    }

    clearSearch()
  }

  // Key actions map
  const keyActions: KeyActionMap = {
    n: () => {
      level.activateTimer()
      if (searchMatches.length > 0) {
        navigateToNextMatch()
        setLastKeyPressed('n')
      }
    },
    N: () => {
      level.activateTimer()
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
      level.activateTimer()
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
      level.activateTimer()
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
      level.activateTimer()
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
      level.activateTimer()
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

  // Setup global event handler for search keys
  useEffect(() => {
    const handleGlobalKeyDown = (e: KeyboardEvent) => {
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

      if (!isSearching && !level.levelCompleted) {
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
  }, [isSearching, level.levelCompleted])

  const { lastKeyPressed: keyboardLastKey } = useKeyboardHandler({
    keyActionMap: keyActions,
    dependencies: [
      cursor,
      currentLineIndex,
      linesOfSquares,
      searchMatches,
      currentMatchIndex,
    ],
    disabled: isSearching || level.levelCompleted,
    onAnyKey: () => {
      if (
        isSearching &&
        searchInputRef.current &&
        document.activeElement !== searchInputRef.current
      ) {
        searchInputRef.current.focus()
      }
    },
  })

  useEffect(() => {
    if (keyboardLastKey) {
      setLastKeyPressed(keyboardLastKey)
    }
  }, [keyboardLastKey])

  // Global click handler for search dismissal
  useEffect(() => {
    const handleGlobalClick = (e: MouseEvent) => {
      if (isSearching) {
        const clickTarget = e.target as HTMLElement
        const searchForm = document.querySelector('form')
        if (searchForm && !searchForm.contains(clickTarget)) {
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

  const isInSearchMatch = (lineIdx: number, charIdx: number) => {
    if (searchMatches.length === 0) return false
    return searchMatches.some(
      (match) =>
        match.lineIdx === lineIdx &&
        charIdx >= match.startIdx &&
        charIdx <= match.endIdx,
    )
  }

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
    <LevelShell
      level={level}
      className={`flex flex-col items-center justify-center bg-bg-primary text-white ${isSearching ? 'searching' : ''}`}
    >
      <div className="w-full max-w-6xl px-4">
        <div className="flex flex-col items-center mb-2">
          <p className="text-text-muted text-center max-w-lg mb-4">
            Use <kbd className="px-2 py-1 bg-bg-secondary rounded">/</kbd> to search
            forward,
            <kbd className="px-2 py-1 bg-bg-secondary rounded">?</kbd> to search
            backward,
            <kbd className="px-2 py-1 bg-bg-secondary rounded">n</kbd> for next
            match, and <kbd className="px-2 py-1 bg-bg-secondary rounded">N</kbd>{' '}
            for previous match.
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
        <div
          className="relative w-full max-w-6xl bg-bg-secondary p-6 py-8 rounded-lg mx-auto overflow-y-scroll"
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
                  className="bg-bg-tertiary text-white px-2 py-1 rounded flex-grow focus:outline-none focus:ring-2 focus:ring-emerald-400 font-mono"
                  autoFocus
                  autoComplete="off"
                  spellCheck="false"
                  placeholder="Type to search..."
                  onBlur={(e) => e.stopPropagation()}
                />
              </form>
            </div>
          )}

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

                      const isTarget2 =
                        square.idx === target && lineIdx === targetLineIndex

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
                        'inline-flex items-center justify-center mx-0.5 my-0.5 min-w-5 h-8 transition-all duration-150 rounded-md '

                      if (isPlayer)
                        base +=
                          'bg-emerald-500 text-white scale-110 shadow-lg shadow-emerald-500/50 '
                      else if (isTarget2)
                        base +=
                          'bg-purple-500 text-white scale-105 shadow-lg shadow-purple-500/60 animate-pulse '
                      else if (isCurrentMatchHighlight)
                        base +=
                          'bg-amber-500 text-white scale-105 shadow-lg shadow-amber-500/50 '
                      else if (isSearchHighlight)
                        base += 'bg-amber-500/30 text-amber-200 '
                      else base += 'bg-bg-tertiary text-text-secondary '

                      if (square.isSpace) {
                        let baseSpace =
                          'inline-block mx-0.5 my-0.5 w-5 h-8 transition-all duration-150 rounded-md '
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

                          <span className="z-10 text-lg font-medium font-mono">
                            {square.char}
                          </span>

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
            <div className="text-xs text-text-subtle mt-4 max-w-xl">
              <span className="font-semibold">NOTE:</span> While this level is
              case insensitive for learning purposes, Vim's{' '}
              <kbd className="px-1 py-1 bg-bg-tertiary rounded text-white font-mono">
                /
              </kbd>{' '}
              search is usually case sensitive by default.
            </div>
          </div>
        </div>
        <KeysAllowed
          keys={['/', '?', 'n', 'N', 'h', 'j', 'k', 'l']}
          lastKeyPressed={lastKeyPressed}
        />
      </div>
    </LevelShell>
  )
}

export default SearchLevel5
