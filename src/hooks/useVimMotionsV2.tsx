import { useMemo } from 'react'
import { VimMode } from '../utils/constants'
import { MotionContext, VimMotion } from './motions/types'
import { UseHistoryReturn } from './useHistory'
import {
  createMotionRegistry,
  executeMotion,
  getAvailableKeys,
} from './motions/motionRegistry'

interface UseVimMotionsV2Props {
  setCursorIndex: (position: number) => void
  cursorIndex: number
  setVirtualColumn: (column: number) => void
  virtualColumn: number
  setMode: (mode: VimMode) => void
  mode: VimMode
  text: string
  setText: (text: string) => void
  customMotions?: VimMotion[] // Allow custom motions to be added
  enabledMotions?: string[] // Allow filtering of enabled motions
  history?: UseHistoryReturn // Optional history for undo/redo
}

export const useVimMotionsV2 = ({
  setCursorIndex,
  cursorIndex,
  setVirtualColumn,
  virtualColumn,
  setMode,
  mode,
  text,
  setText,
  customMotions = [],
  enabledMotions,
  history,
}: UseVimMotionsV2Props) => {
  // Create motion context
  const context: MotionContext = useMemo(() => ({
    setCursorIndex,
    cursorIndex,
    setVirtualColumn,
    virtualColumn,
    setMode,
    mode,
    text,
    setText,
    history,
  }), [setCursorIndex, cursorIndex, setVirtualColumn, virtualColumn, setMode, mode, text, setText, history])

  // Create motion registry with custom motions
  const motionRegistry = useMemo(() => {
    const registry = createMotionRegistry()

    // Add custom motions
    customMotions.forEach((motion) => {
      registry[motion.key] = motion
    })

    return registry
  }, [customMotions])

  // Filter motions if enabledMotions is provided
  const activeRegistry = useMemo(() => {
    if (!enabledMotions) return motionRegistry

    const filtered: Record<string, VimMotion> = {}
    enabledMotions.forEach((key) => {
      if (motionRegistry[key]) {
        filtered[key] = motionRegistry[key]
      }
    })
    return filtered
  }, [motionRegistry, enabledMotions])

  // Create key action map compatible with existing keyboard handler
  const keyActionMap = useMemo(() => {
    const actionMap: Record<string, (args?: unknown) => void> = {}

    Object.keys(activeRegistry).forEach((key) => {
      actionMap[key] = (args?: unknown) => {
        executeMotion(key, context, activeRegistry, args)
      }
    })

    return actionMap
  }, [activeRegistry, context])

  // Get available keys for current context
  const availableKeys = useMemo(() => {
    return getAvailableKeys(context, activeRegistry)
  }, [context, activeRegistry])

  return {
    keyActionMap,
    availableKeys,
    motionRegistry: activeRegistry,
    context,
    executeMotion: (key: string, args?: unknown) =>
      executeMotion(key, context, activeRegistry, args),
  }
}
