import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { applyTextKey, textMotionRegistry } from '../../../engine/text-motions'
import { moveToNextWordBoundary, moveToWordEnd } from '../../../engine/text-utils'
import type { TextState } from '../../../engine/text-types'
import type { ATextDrillDef } from '../units/types'

interface Props {
  def: ATextDrillDef
  onCompleted: () => void
}

interface TargetRange {
  start: number
  end: number
}

function pickTargetRange(
  text: string,
  reachable: Set<number>,
  exclude?: TargetRange,
  excludeIndex?: number,
): TargetRange {
  const candidates: TargetRange[] = []
  let i = 0
  while (i < text.length) {
    if (!/\s/.test(text[i])) {
      const start = i
      const end = moveToWordEnd(text, i)
      candidates.push({ start, end })
      i = moveToNextWordBoundary(text, i)
      if (i === start) break
    } else {
      i++
    }
  }
  const reachableCandidates = candidates.filter((r) =>
    rangeContainsReachableIndex(r, reachable),
  )
  // Words that are reachable AND not the previous target / cursor-overlap.
  const filtered = reachableCandidates.filter(
    (r) =>
      (!exclude || r.start !== exclude.start) &&
      (excludeIndex === undefined || !isCursorInRange(excludeIndex, r)),
  )
  // Fallback chain: prefer "filtered" → "reachableCandidates" → "candidates".
  // The last fallback only matters if the unit author wrote text with zero
  // reachable words — a bug surface worth a console warning.
  let pool = filtered
  if (pool.length === 0) pool = reachableCandidates
  if (pool.length === 0) {
    if (typeof console !== 'undefined') {
      console.warn(
        '[ADrillStageText] no reachable target words for the allowed keys — falling back to any word',
      )
    }
    pool = candidates
  }
  return pool[Math.floor(Math.random() * pool.length)]
}

function rangeContainsReachableIndex(
  range: TargetRange,
  reachable: Set<number>,
): boolean {
  for (let i = range.start; i <= range.end; i++) {
    if (reachable.has(i)) return true
  }
  return false
}

// BFS through the allowed keys from the starting cursor index, recording
// every cursor position the player can land on. Assumes allowedKeys are
// motion-only (no text-mutating ops); text-mutating keys would explode the
// state space.
function computeReachableIndices(
  text: string,
  startIndex: number,
  allowedKeys: readonly string[],
): Set<number> {
  const visited = new Set<number>()
  visited.add(startIndex)
  const queue: number[] = [startIndex]
  while (queue.length > 0) {
    const idx = queue.shift()!
    for (const key of allowedKeys) {
      const { state: next } = applyTextKey(
        { text, cursorIndex: idx, keystrokes: 0 },
        { key },
        textMotionRegistry,
      )
      if (!visited.has(next.cursorIndex)) {
        visited.add(next.cursorIndex)
        queue.push(next.cursorIndex)
      }
    }
  }
  return visited
}

function isCursorInRange(index: number, range: TargetRange): boolean {
  return index >= range.start && index <= range.end
}

export default function ADrillStageText({ def, onCompleted }: Props) {
  const reachable = useMemo(
    () => computeReachableIndices(def.text, def.startCursorIndex, def.allowedKeys),
    [def.text, def.startCursorIndex, def.allowedKeys],
  )
  const [state, setState] = useState<TextState>({
    text: def.text,
    cursorIndex: def.startCursorIndex,
    keystrokes: 0,
  })
  const [target, setTarget] = useState<TargetRange>(() =>
    pickTargetRange(def.text, reachable, undefined, def.startCursorIndex),
  )
  const [hits, setHits] = useState(0)
  const completedRef = useRef(false)

  const handleKeyDown = useCallback(
    (e: KeyboardEvent) => {
      if (completedRef.current) return
      if (!def.allowedKeys.includes(e.key)) return
      e.preventDefault()
      const { state: next } = applyTextKey(state, { key: e.key }, textMotionRegistry)
      setState(next)
      if (isCursorInRange(next.cursorIndex, target)) {
        const nextHits = hits + 1
        setHits(nextHits)
        if (nextHits >= def.targetCount) {
          completedRef.current = true
          queueMicrotask(onCompleted)
        } else {
          setTarget(pickTargetRange(def.text, reachable, target))
        }
      }
    },
    [def.allowedKeys, def.text, def.targetCount, state, hits, target, reachable, onCompleted],
  )

  useEffect(() => {
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [handleKeyDown])

  const rendered = useMemo(() => {
    const out: React.ReactNode[] = []
    for (let i = 0; i < def.text.length; i++) {
      const ch = def.text[i]
      const isCursor = state.cursorIndex === i
      const isTargetChar = isCursorInRange(i, target)
      out.push(
        <span
          key={i}
          className={
            isCursor
              ? 'bg-orange-500 text-black'
              : isTargetChar
              ? 'bg-green-500/40 text-gray-100'
              : 'text-gray-300'
          }
        >
          {ch === '\n' ? <br /> : ch === ' ' ? ' ' : ch}
        </span>,
      )
    }
    return out
  }, [def.text, state.cursorIndex, target])

  return (
    <div className="flex flex-col items-center gap-6 p-8">
      <div className="text-sm text-gray-400">
        Drill · Land your cursor on the{' '}
        <span className="text-green-400">highlighted word</span> using{' '}
        <span className="font-mono text-orange-300">{def.allowedKeys.join(' ')}</span>
      </div>
      <div className="max-w-3xl whitespace-pre-wrap font-mono text-base leading-relaxed">
        {rendered}
      </div>
      <div className="text-sm text-gray-300">
        <span className="font-mono">{hits}</span> / {def.targetCount} targets
      </div>
    </div>
  )
}
