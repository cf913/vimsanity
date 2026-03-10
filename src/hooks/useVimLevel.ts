import { useState, useEffect, useCallback } from 'react'
import { VimMode, VIM_MODES } from '../utils/constants'
import { useVimMotionsV2 } from './useVimMotionsV2'
import { useHistory, UseHistoryReturn } from './useHistory'
import { VimMotion } from './motions/types'
import { KeyActionMap } from './useKeyboardHandler'

// --- Config ---

export interface UseVimLevelConfig {
  levelId: string
  maxScore: number
  // Optional V2 integration (text-based levels)
  enabledMotions?: string[]
  customMotions?: VimMotion[]
  initialText?: string
  enableHistory?: boolean
  // Callbacks
  onReset?: () => void
}

// --- Vim sub-state (only present when enabledMotions/initialText provided) ---

export interface VimState {
  cursorIndex: number
  setCursorIndex: (n: number) => void
  virtualColumn: number
  setVirtualColumn: (n: number) => void
  mode: VimMode
  setMode: (m: VimMode) => void
  text: string
  setText: (t: string) => void
  keyActionMap: KeyActionMap
  availableKeys: string[]
  history: UseHistoryReturn | null
}

// --- Return type ---

export interface UseVimLevelReturn {
  // Core state
  score: number
  maxScore: number
  levelCompleted: boolean
  showConfetti: boolean
  isActive: boolean
  levelId: string

  // Actions
  incrementScore: () => void
  setScore: React.Dispatch<React.SetStateAction<number>>
  completeLevel: () => void
  resetLevel: () => void
  activateTimer: () => void

  // V2 motion output (null when no enabledMotions/initialText)
  vim: VimState | null
}

// --- Hook ---

export function useVimLevel(config: UseVimLevelConfig): UseVimLevelReturn {
  const {
    levelId,
    maxScore,
    enabledMotions,
    customMotions,
    initialText,
    enableHistory = false,
    onReset,
  } = config

  // ---- Core state ----
  const [score, setScore] = useState(0)
  const [levelCompleted, setLevelCompleted] = useState(false)
  const [showConfetti, setShowConfetti] = useState(false)
  const [isActive, setIsActive] = useState(false)

  // ---- Optional V2 vim state ----
  const useVim = !!(enabledMotions || initialText)

  const [cursorIndex, setCursorIndex] = useState(0)
  const [virtualColumn, setVirtualColumn] = useState(0)
  const [mode, setMode] = useState<VimMode>(VIM_MODES.NORMAL)
  const [text, setText] = useState(initialText ?? '')

  // History (only when requested)
  const history = useHistory({ text: initialText ?? '', cursorIndex: 0 })
  const activeHistory = enableHistory ? history : undefined

  // V2 motions (only when enabledMotions is provided)
  const v2 = useVimMotionsV2({
    setCursorIndex,
    cursorIndex,
    setVirtualColumn,
    virtualColumn,
    setMode,
    mode,
    text,
    setText,
    customMotions,
    enabledMotions,
    history: activeHistory,
  })

  // ---- Actions ----

  const activateTimer = useCallback(() => {
    setIsActive((prev) => {
      if (!prev && !levelCompleted) return true
      return prev
    })
  }, [levelCompleted])

  const completeLevel = useCallback(() => {
    setScore(maxScore)
    setLevelCompleted(true)
    setShowConfetti(true)
    setIsActive(false)
    setTimeout(() => setShowConfetti(false), 3000)
  }, [maxScore])

  const incrementScore = useCallback(() => {
    setScore((prev) => {
      const next = prev + 1
      if (next >= maxScore) {
        setTimeout(() => completeLevel(), 0)
      }
      return next
    })
  }, [maxScore, completeLevel])

  const resetLevel = useCallback(() => {
    setScore(0)
    setLevelCompleted(false)
    setShowConfetti(false)
    setIsActive(false)

    // Reset vim state if applicable
    if (useVim) {
      setCursorIndex(0)
      setVirtualColumn(0)
      setMode(VIM_MODES.NORMAL)
      setText(initialText ?? '')
      if (enableHistory) {
        history.clearHistory()
      }
    }

    onReset?.()
  }, [useVim, initialText, enableHistory, history, onReset])

  // ---- ESC-to-restart (auto-registered when levelCompleted) ----

  useEffect(() => {
    if (!levelCompleted) return
    const handler = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        resetLevel()
      }
    }
    window.addEventListener('keydown', handler)
    return () => window.removeEventListener('keydown', handler)
  }, [levelCompleted, resetLevel])

  // ---- Confetti auto-dismiss ----
  // (handled inline in completeLevel via setTimeout)

  // ---- Build vim sub-state ----

  const vim: VimState | null = useVim
    ? {
        cursorIndex,
        setCursorIndex,
        virtualColumn,
        setVirtualColumn,
        mode,
        setMode,
        text,
        setText,
        keyActionMap: v2.keyActionMap,
        availableKeys: v2.availableKeys,
        history: activeHistory ?? null,
      }
    : null

  return {
    score,
    maxScore,
    levelCompleted,
    showConfetti,
    isActive,
    levelId,
    incrementScore,
    setScore,
    completeLevel,
    resetLevel,
    activateTimer,
    vim,
  }
}
