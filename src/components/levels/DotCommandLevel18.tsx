import { motion } from 'framer-motion'
import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { useHistory } from '../../hooks/useHistory'
import {
  KeyActionMap,
  useKeyboardHandler,
} from '../../hooks/useKeyboardHandler'
import { useVimLevel } from '../../hooks/useVimLevel'
import { VimMode, VIM_MODES } from '../../utils/constants'
import { KBD } from '../common/KBD'
import {
  LevelShell,
  LevelHeader,
  LevelCompletion,
  CommandBuffer,
} from '../level-blocks'
import {
  findLineStart,
  findLineEnd,
  moveToNextWordBoundary,
  moveToPrevWordBoundary,
  moveToWordEnd,
  moveToNextLine,
  moveToPrevLine,
} from '../../utils/textUtils'

// --- Types ---

type LastChange =
  | { type: 'x' }
  | { type: 'dw' }
  | { type: 'dd' }
  | {
      type: 'insertSession'
      entryCommand: 'i' | 'a' | 'A' | 'cw'
      typedKeys: string[]
    }

interface Challenge {
  id: number
  title: string
  description: string
  instructions: string[]
  initialText: string
  expectedText: string
  startCursorPos: number
  requiredDots: number
}

// --- Challenges ---

const challenges: Challenge[] = [
  {
    id: 1,
    title: 'Delete the Extras',
    description: 'Remove the extra letters using x and the dot command.',
    instructions: [
      'Move to an extra "l" and press x to delete it',
      'Move to the next extra "l" and press . to repeat',
      'Keep using . until the text is correct',
    ],
    initialText: 'Hellllo World',
    expectedText: 'Hello World',
    startCursorPos: 2,
    requiredDots: 2,
  },
  {
    id: 2,
    title: 'Remove Duplicate Words',
    description: 'Delete duplicate words with dw and repeat with dot.',
    instructions: [
      'Move to the duplicate "the " and press dw',
      'Move to the duplicate "brown " and press . to repeat',
    ],
    initialText: 'the the quick brown brown fox',
    expectedText: 'the quick brown fox',
    startCursorPos: 0,
    requiredDots: 1,
  },
  {
    id: 3,
    title: 'Add Semicolons',
    description: 'Append semicolons to each line using A and dot.',
    instructions: [
      'Press A to go to end of line, type ; then Escape',
      'Move down with j and press . to repeat on each line',
    ],
    initialText: 'let x = 1\nlet y = 2\nlet z = 3',
    expectedText: 'let x = 1;\nlet y = 2;\nlet z = 3;',
    startCursorPos: 0,
    requiredDots: 2,
  },
  {
    id: 4,
    title: 'Fix Variable Declarations',
    description: 'Change var to const using cw and dot.',
    instructions: [
      'Move to "var" and press cw, type const, then Escape',
      'Move to the next "var" and press . to repeat',
    ],
    initialText: 'var name = "Alice"\nvar age = 30\nvar city = "NYC"',
    expectedText: 'const name = "Alice"\nconst age = 30\nconst city = "NYC"',
    startCursorPos: 0,
    requiredDots: 2,
  },
  {
    id: 5,
    title: 'The Full Combo',
    description: 'Use multiple dot techniques to clean up this code.',
    instructions: [
      'Fix the extra characters, missing semicolons, or wrong keywords',
      'Use . to repeat each type of change',
      'You need at least 3 dot uses total',
    ],
    initialText: 'var count = 0\nvar total = 0\nvar result = 0',
    expectedText: 'let count = 0;\nlet total = 0;\nlet result = 0;',
    startCursorPos: 0,
    requiredDots: 3,
  },
]

// --- Helper functions ---

function deleteCharAt(text: string, index: number): string {
  if (index < 0 || index >= text.length) return text
  return text.slice(0, index) + text.slice(index + 1)
}

function deleteWordAt(text: string, index: number): string {
  const chars = text.split('')
  const nextBoundary = moveToNextWordBoundary(chars, index)
  if (nextBoundary === index) {
    // At end — delete to end of line
    const lineEnd = findLineEnd(text, index)
    return text.slice(0, index) + text.slice(lineEnd + 1)
  }
  return text.slice(0, index) + text.slice(nextBoundary)
}

function deleteLineAt(text: string, index: number): string {
  const lineStart = findLineStart(text, index)
  let lineEnd = text.indexOf('\n', index)
  if (lineEnd === -1) {
    // Last line
    if (lineStart > 0) {
      // Remove preceding newline too
      return text.slice(0, lineStart - 1)
    }
    return ''
  }
  // Remove line including the trailing newline
  return text.slice(0, lineStart) + text.slice(lineEnd + 1)
}

function changeWordAt(
  text: string,
  index: number,
): { newText: string; cursorPos: number } {
  const chars = text.split('')
  const nextBoundary = moveToNextWordBoundary(chars, index)
  // Delete from cursor to word boundary, but strip trailing space
  let deleteEnd = nextBoundary
  if (deleteEnd > index && text[deleteEnd - 1] === ' ') {
    deleteEnd--
  }
  if (deleteEnd === index) {
    // Edge case: delete to end of word
    const wordEnd = moveToWordEnd(chars, index)
    deleteEnd = wordEnd + 1
  }
  const newText = text.slice(0, index) + text.slice(deleteEnd)
  return { newText, cursorPos: index }
}

// --- Component ---

export default function DotCommandLevel18() {
  const [currentChallenge, setCurrentChallenge] = useState(0)
  const [text, setText] = useState(challenges[0].initialText)
  const [cursorIndex, setCursorIndex] = useState(challenges[0].startCursorPos)
  const [mode, setMode] = useState<VimMode>(VIM_MODES.NORMAL)
  const [lastChange, setLastChange] = useState<LastChange | null>(null)
  const [pendingCommand, setPendingCommand] = useState('')
  const [insertBuffer, setInsertBuffer] = useState<string[]>([])
  const [insertEntryCommand, setInsertEntryCommand] = useState<string>('')
  const [dotCount, setDotCount] = useState(0)
  const [challengeCompleted, setChallengeCompleted] = useState(false)

  const history = useHistory({ text: challenges[0].initialText, cursorIndex: challenges[0].startCursorPos })

  const insertBufferRef = useRef<string[]>([])
  const modeRef = useRef<VimMode>(VIM_MODES.NORMAL)
  const textRef = useRef(text)
  const cursorRef = useRef(cursorIndex)
  const insertEntryRef = useRef('')

  // Keep refs in sync
  useEffect(() => {
    modeRef.current = mode
  }, [mode])
  useEffect(() => {
    textRef.current = text
  }, [text])
  useEffect(() => {
    cursorRef.current = cursorIndex
  }, [cursorIndex])

  const challenge = challenges[currentChallenge]

  const level = useVimLevel({
    levelId: '18-dot-command',
    maxScore: challenges.length,
    onReset: () => {
      setCurrentChallenge(0)
      setText(challenges[0].initialText)
      setCursorIndex(challenges[0].startCursorPos)
      setMode(VIM_MODES.NORMAL)
      setLastChange(null)
      setPendingCommand('')
      setInsertBuffer([])
      setInsertEntryCommand('')
      setDotCount(0)
      setChallengeCompleted(false)
      history.resetHistory({ text: challenges[0].initialText, cursorIndex: challenges[0].startCursorPos })
    },
  })

  const { incrementScore } = level

  // Advance challenge
  const advanceChallenge = useCallback(() => {
    const next = currentChallenge + 1
    if (next < challenges.length) {
      setCurrentChallenge(next)
      setText(challenges[next].initialText)
      setCursorIndex(challenges[next].startCursorPos)
      setMode(VIM_MODES.NORMAL)
      setLastChange(null)
      setPendingCommand('')
      setDotCount(0)
      setChallengeCompleted(false)
      history.resetHistory({ text: challenges[next].initialText, cursorIndex: challenges[next].startCursorPos })
    }
  }, [currentChallenge, history])

  // Check challenge completion
  const checkCompletion = useCallback(
    (currentText: string, currentDotCount: number) => {
      if (
        currentText === challenge.expectedText &&
        currentDotCount >= challenge.requiredDots
      ) {
        setChallengeCompleted(true)
        setTimeout(() => {
          incrementScore()
          advanceChallenge()
        }, 800)
      }
    },
    [challenge, incrementScore, advanceChallenge],
  )

  // --- Execute a change (used by both direct keys and dot replay) ---

  const executeChange = useCallback(
    (
      change: LastChange,
      currentText: string,
      currentCursor: number,
    ): { newText: string; newCursor: number } => {
      switch (change.type) {
        case 'x': {
          if (currentCursor >= currentText.length) return { newText: currentText, newCursor: currentCursor }
          const newText = deleteCharAt(currentText, currentCursor)
          const newCursor = Math.min(
            currentCursor,
            Math.max(0, newText.length - 1),
          )
          return { newText, newCursor }
        }
        case 'dw': {
          const newText = deleteWordAt(currentText, currentCursor)
          const newCursor = Math.min(
            currentCursor,
            Math.max(0, newText.length - 1),
          )
          return { newText, newCursor }
        }
        case 'dd': {
          const newText = deleteLineAt(currentText, currentCursor)
          if (newText.length === 0) return { newText: '', newCursor: 0 }
          const ls = findLineStart(
            newText,
            Math.min(currentCursor, newText.length - 1),
          )
          return { newText, newCursor: ls }
        }
        case 'insertSession': {
          // Replay insert session
          let t = currentText
          let c = currentCursor

          // Position based on entry command
          switch (change.entryCommand) {
            case 'i':
              break
            case 'a':
              c = Math.min(c + 1, t.length)
              break
            case 'A':
              c = findLineEnd(t, c) + 1
              break
            case 'cw': {
              const result = changeWordAt(t, c)
              t = result.newText
              c = result.cursorPos
              break
            }
          }

          // Type all buffered keys
          for (const key of change.typedKeys) {
            if (key === 'Backspace') {
              if (c > 0) {
                t = t.slice(0, c - 1) + t.slice(c)
                c--
              }
            } else {
              t = t.slice(0, c) + key + t.slice(c)
              c++
            }
          }

          // Return to normal mode position (back one if possible)
          const newCursor = Math.max(0, c - 1)
          return { newText: t, newCursor }
        }
      }
    },
    [],
  )

  // --- Enter insert mode ---

  const enterInsertMode = useCallback(
    (entryCmd: 'i' | 'a' | 'A' | 'cw') => {
      level.activateTimer()
      history.pushToHistory({ text, cursorIndex })
      setInsertEntryCommand(entryCmd)
      insertEntryRef.current = entryCmd
      setInsertBuffer([])
      insertBufferRef.current = []

      let newText = text
      let newCursor = cursorIndex

      switch (entryCmd) {
        case 'i':
          break
        case 'a':
          newCursor = Math.min(cursorIndex + 1, text.length)
          break
        case 'A':
          newCursor = findLineEnd(text, cursorIndex) + 1
          break
        case 'cw': {
          const result = changeWordAt(text, cursorIndex)
          newText = result.newText
          newCursor = result.cursorPos
          break
        }
      }

      setText(newText)
      setCursorIndex(newCursor)
      setMode(VIM_MODES.INSERT)
    },
    [text, cursorIndex, level],
  )

  // --- Insert mode keyboard handler ---

  useEffect(() => {
    if (mode !== VIM_MODES.INSERT) return

    const handler = (e: KeyboardEvent) => {
      if (
        e.target instanceof HTMLInputElement ||
        e.target instanceof HTMLTextAreaElement
      )
        return

      e.preventDefault()

      if (e.key === 'Escape') {
        // Exit insert mode
        const typedKeys = [...insertBufferRef.current]
        const entry = insertEntryRef.current as
          | 'i'
          | 'a'
          | 'A'
          | 'cw'
        setLastChange({
          type: 'insertSession',
          entryCommand: entry,
          typedKeys,
        })
        setMode(VIM_MODES.NORMAL)
        setCursorIndex((prev) => Math.max(0, prev - 1))

        // Check completion after exiting insert
        setTimeout(() => {
          checkCompletion(textRef.current, dotCount)
        }, 50)
        return
      }

      if (e.key === 'Backspace') {
        insertBufferRef.current.push('Backspace')
        setInsertBuffer([...insertBufferRef.current])
        setText((prev) => {
          const c = cursorRef.current
          if (c <= 0) return prev
          const newText = prev.slice(0, c - 1) + prev.slice(c)
          textRef.current = newText
          return newText
        })
        setCursorIndex((prev) => Math.max(0, prev - 1))
        return
      }

      // Only handle printable characters
      if (e.key.length === 1 && !e.ctrlKey && !e.metaKey) {
        insertBufferRef.current.push(e.key)
        setInsertBuffer([...insertBufferRef.current])
        setText((prev) => {
          const c = cursorRef.current
          const newText = prev.slice(0, c) + e.key + prev.slice(c)
          textRef.current = newText
          return newText
        })
        setCursorIndex((prev) => prev + 1)
      }
    }

    window.addEventListener('keydown', handler)
    return () => window.removeEventListener('keydown', handler)
  }, [mode, dotCount, checkCompletion])

  // --- Normal mode key action map ---

  const keyActionMap: KeyActionMap = useMemo(() => {
    if (mode !== VIM_MODES.NORMAL || level.levelCompleted || challengeCompleted)
      return {}

    const map: KeyActionMap = {}

    // Movement
    map.h = () => {
      level.activateTimer()
      const lineStart = findLineStart(text, cursorIndex)
      if (cursorIndex > lineStart) setCursorIndex(cursorIndex - 1)
    }
    map.l = () => {
      level.activateTimer()
      const lineEnd = findLineEnd(text, cursorIndex)
      if (cursorIndex < lineEnd) setCursorIndex(cursorIndex + 1)
    }
    map.j = () => {
      level.activateTimer()
      const newPos = moveToNextLine(text, cursorIndex)
      setCursorIndex(newPos)
    }
    map.k = () => {
      level.activateTimer()
      const newPos = moveToPrevLine(text, cursorIndex)
      setCursorIndex(newPos)
    }
    map.w = () => {
      level.activateTimer()
      const chars = text.split('')
      setCursorIndex(moveToNextWordBoundary(chars, cursorIndex))
    }
    map.b = () => {
      level.activateTimer()
      const chars = text.split('')
      setCursorIndex(moveToPrevWordBoundary(chars, cursorIndex))
    }
    map.e = () => {
      level.activateTimer()
      const chars = text.split('')
      setCursorIndex(moveToWordEnd(chars, cursorIndex))
    }
    map['0'] = () => {
      level.activateTimer()
      setCursorIndex(findLineStart(text, cursorIndex))
    }
    map['$'] = () => {
      level.activateTimer()
      setCursorIndex(findLineEnd(text, cursorIndex))
    }

    // Delete char
    map.x = () => {
      level.activateTimer()
      history.pushToHistory({ text, cursorIndex })
      const change: LastChange = { type: 'x' }
      const { newText, newCursor } = executeChange(change, text, cursorIndex)
      setText(newText)
      setCursorIndex(newCursor)
      setLastChange(change)
      setPendingCommand('')
    }

    // Pending d
    map.d = () => {
      level.activateTimer()
      if (pendingCommand === 'd') {
        // dd
        history.pushToHistory({ text, cursorIndex })
        const change: LastChange = { type: 'dd' }
        const { newText, newCursor } = executeChange(change, text, cursorIndex)
        setText(newText)
        setCursorIndex(newCursor)
        setLastChange(change)
        setPendingCommand('')
      } else {
        setPendingCommand('d')
      }
    }

    // Pending c
    map.c = () => {
      level.activateTimer()
      setPendingCommand('c')
    }

    // w after d or c
    if (pendingCommand === 'd') {
      map.w = () => {
        level.activateTimer()
        history.pushToHistory({ text, cursorIndex })
        const change: LastChange = { type: 'dw' }
        const { newText, newCursor } = executeChange(change, text, cursorIndex)
        setText(newText)
        setCursorIndex(newCursor)
        setLastChange(change)
        setPendingCommand('')
      }
    }
    if (pendingCommand === 'c') {
      map.w = () => {
        level.activateTimer()
        enterInsertMode('cw')
        setPendingCommand('')
      }
    }

    // Insert mode entries
    map.i = () => {
      if (pendingCommand) {
        setPendingCommand('')
        return
      }
      enterInsertMode('i')
    }
    map.a = () => {
      if (pendingCommand) {
        setPendingCommand('')
        return
      }
      enterInsertMode('a')
    }
    map.A = () => {
      if (pendingCommand) {
        setPendingCommand('')
        return
      }
      enterInsertMode('A')
    }

    // Dot command
    map['.'] = () => {
      level.activateTimer()
      if (!lastChange) return
      history.pushToHistory({ text, cursorIndex })

      if (lastChange.type === 'insertSession') {
        // Replay insert session directly without entering insert mode
        const { newText, newCursor } = executeChange(
          lastChange,
          text,
          cursorIndex,
        )
        setText(newText)
        setCursorIndex(newCursor)
        const newDotCount = dotCount + 1
        setDotCount(newDotCount)
        setTimeout(() => {
          checkCompletion(newText, newDotCount)
        }, 50)
      } else {
        const { newText, newCursor } = executeChange(
          lastChange,
          text,
          cursorIndex,
        )
        setText(newText)
        setCursorIndex(newCursor)
        const newDotCount = dotCount + 1
        setDotCount(newDotCount)
        setTimeout(() => {
          checkCompletion(newText, newDotCount)
        }, 50)
      }
      setPendingCommand('')
    }

    // Undo
    map.u = () => {
      const prev = history.undo()
      if (prev) {
        setText(prev.text)
        setCursorIndex(prev.cursorIndex)
      }
    }

    // Redo
    map['ctrl+r'] = () => {
      const next = history.redo()
      if (next) {
        setText(next.text)
        setCursorIndex(next.cursorIndex)
      }
    }

    // Escape
    map.Escape = () => {
      if (pendingCommand) {
        setPendingCommand('')
        return
      }
      checkCompletion(text, dotCount)
    }

    return map
  }, [
    mode,
    text,
    cursorIndex,
    pendingCommand,
    lastChange,
    dotCount,
    level,
    challengeCompleted,
    executeChange,
    enterInsertMode,
    checkCompletion,
    history,
  ])

  const { lastKeyPressed } = useKeyboardHandler({
    keyActionMap,
    dependencies: [
      mode,
      text,
      cursorIndex,
      pendingCommand,
      lastChange,
      dotCount,
      challengeCompleted,
    ],
    disabled: mode === VIM_MODES.INSERT || level.levelCompleted,
  })

  // --- Render text with cursor ---

  const renderedLines = useMemo(() => {
    const lines = text.split('\n')
    let charOffset = 0
    return lines.map((line, lineIdx) => {
      const lineStart = charOffset
      charOffset += line.length + 1 // +1 for newline
      return { text: line, startIndex: lineStart, lineNum: lineIdx + 1 }
    })
  }, [text])

  // --- Last change display ---

  const lastChangeLabel = useMemo(() => {
    if (!lastChange) return null
    switch (lastChange.type) {
      case 'x':
        return 'x (delete character)'
      case 'dw':
        return 'dw (delete word)'
      case 'dd':
        return 'dd (delete line)'
      case 'insertSession': {
        const typed = lastChange.typedKeys.join('')
        const cmdLabel =
          lastChange.entryCommand === 'A'
            ? 'A'
            : lastChange.entryCommand === 'cw'
              ? 'cw'
              : lastChange.entryCommand
        return `${cmdLabel} → "${typed}"`
      }
    }
  }, [lastChange])

  // Available keys for display
  const normalKeys = ['h', 'j', 'k', 'l', 'w', 'b', 'e', '0', '$']
  const editKeys = ['x', 'dw', 'dd', 'cw', 'i', 'a', 'A', '.', 'u', 'Ctrl+r']

  return (
    <LevelShell
      level={level}
      completionContent={
        <LevelCompletion
          levelId={level.levelId}
          subtitle="You've mastered the dot command!"
        />
      }
    >
      <LevelHeader
        title="The Dot Command"
        titleColor="text-orange-400"
        description={
          <>
            Repeat your last change with <KBD>.</KBD> — the most powerful
            command in Vim
          </>
        }
        score={level.score}
        maxScore={level.maxScore}
        onReset={level.resetLevel}
        mode={mode}
      />

      {/* Challenge card */}
      <motion.div
        key={currentChallenge}
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-bg-secondary rounded-lg p-5 border border-orange-500/30 max-w-2xl w-full"
      >
        <div className="flex items-center justify-between mb-2">
          <h3 className="text-lg font-semibold text-orange-300">
            Challenge {currentChallenge + 1}: {challenge.title}
          </h3>
          <span className="text-sm text-text-muted">
            {currentChallenge + 1} / {challenges.length}
          </span>
        </div>
        <p className="text-text-secondary text-sm mb-3">
          {challenge.description}
        </p>
        <ul className="text-sm text-text-muted space-y-1">
          {challenge.instructions.map((inst, i) => (
            <li key={i} className="flex items-start gap-2">
              <span className="text-orange-400 mt-0.5">›</span>
              <span>{inst}</span>
            </li>
          ))}
        </ul>

        {/* Dot usage indicator */}
        <div className="mt-3 flex items-center gap-2">
          <span className="text-sm text-text-muted">Dot uses:</span>
          <div className="flex gap-1">
            {Array.from({ length: challenge.requiredDots }).map((_, i) => (
              <div
                key={i}
                className={`w-3 h-3 rounded-full border-2 transition-all ${
                  i < dotCount
                    ? 'bg-orange-400 border-orange-400'
                    : 'border-orange-400/40'
                }`}
              />
            ))}
            {dotCount > challenge.requiredDots &&
              Array.from({ length: dotCount - challenge.requiredDots }).map(
                (_, i) => (
                  <div
                    key={`extra-${i}`}
                    className="w-3 h-3 rounded-full bg-orange-400 border-2 border-orange-400"
                  />
                ),
              )}
          </div>
          <span className="text-xs text-text-muted">
            ({dotCount}/{challenge.requiredDots} required)
          </span>
        </div>
      </motion.div>

      {/* Pending command + command buffer */}
      <CommandBuffer buffer={pendingCommand} color="orange" />

      {/* Text editor area */}
      <div className="bg-bg-primary rounded-lg border border-border-secondary w-full max-w-2xl overflow-hidden">
        <div className="font-mono text-sm">
          {renderedLines.map((line, lineIdx) => {
            const isCursorLine =
              cursorIndex >= line.startIndex &&
              cursorIndex < line.startIndex + line.text.length + 1

            return (
              <div
                key={lineIdx}
                className={`flex ${isCursorLine ? 'bg-orange-500/10' : ''}`}
              >
                {/* Line number */}
                <div className="w-10 text-right pr-3 py-1 select-none border-r border-border-secondary text-text-muted text-xs">
                  {line.lineNum}
                </div>
                {/* Line content */}
                <div className="flex-1 px-3 py-1 whitespace-pre">
                  {line.text.length === 0 ? (
                    // Empty line — show cursor if on this line
                    isCursorLine ? (
                      <span className="bg-orange-400 text-bg-primary">
                        {' '}
                      </span>
                    ) : (
                      <span> </span>
                    )
                  ) : (
                    line.text.split('').map((char, charIdx) => {
                      const globalIdx = line.startIndex + charIdx
                      const isCursor = globalIdx === cursorIndex
                      return (
                        <span
                          key={charIdx}
                          className={
                            isCursor
                              ? mode === VIM_MODES.INSERT
                                ? 'border-l-2 border-orange-400'
                                : 'bg-orange-400 text-bg-primary'
                              : 'text-text-secondary'
                          }
                        >
                          {char}
                        </span>
                      )
                    })
                  )}
                  {/* Show cursor at end of line in insert mode */}
                  {mode === VIM_MODES.INSERT &&
                    cursorIndex === line.startIndex + line.text.length && (
                      <span className="border-l-2 border-orange-400"> </span>
                    )}
                </div>
              </div>
            )
          })}
        </div>
      </div>

      {/* Expected text preview */}
      <div className="max-w-2xl w-full">
        <div className="text-xs text-text-muted mb-1">Goal:</div>
        <div className="bg-bg-secondary rounded px-3 py-2 font-mono text-sm text-emerald-400/70 whitespace-pre">
          {challenge.expectedText}
        </div>
      </div>

      {/* Last change indicator */}
      {lastChangeLabel && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="flex items-center gap-2 text-sm"
        >
          <span className="text-text-muted">Last change:</span>
          <span className="font-mono text-orange-300 bg-orange-500/10 px-2 py-0.5 rounded">
            {lastChangeLabel}
          </span>
          <span className="text-text-muted/50">
            (press <KBD>.</KBD> to repeat)
          </span>
        </motion.div>
      )}

      {/* Challenge success flash */}
      {challengeCompleted && (
        <motion.div
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          className="text-emerald-400 font-bold text-lg"
        >
          Challenge complete!
        </motion.div>
      )}

      {/* Keys allowed */}
      <div className="flex flex-col items-center gap-2 mt-2">
        <div className="flex gap-2 text-text-muted justify-center flex-wrap">
          {normalKeys.map((k) => (
            <kbd
              key={k}
              className={`px-3 py-1 bg-bg-secondary rounded-lg transition-all duration-150 text-sm ${
                lastKeyPressed === k
                  ? 'bg-orange-500 text-white shadow-lg shadow-orange-500/50 scale-110'
                  : ''
              }`}
            >
              {k}
            </kbd>
          ))}
        </div>
        <div className="flex gap-2 text-text-muted justify-center flex-wrap">
          {editKeys.map((k) => (
            <kbd
              key={k}
              className={`px-3 py-1 bg-bg-secondary rounded-lg transition-all duration-150 text-sm font-bold ${
                lastKeyPressed === k ||
                (k === '.' && lastKeyPressed === '.')
                  ? 'bg-orange-500 text-white shadow-lg shadow-orange-500/50 scale-110'
                  : 'text-orange-300'
              }`}
            >
              {k}
            </kbd>
          ))}
        </div>
      </div>

      {/* Tip */}
      <div className="bg-bg-secondary/50 rounded-lg p-4 max-w-lg text-center">
        <p className="text-sm text-text-muted">
          The <KBD>.</KBD> command repeats your last change — deletions, insertions, and replacements.
          It's the fastest way to make repetitive edits in Vim.
        </p>
      </div>
    </LevelShell>
  )
}
