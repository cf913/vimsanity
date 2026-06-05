import { useCallback, useEffect, useState } from 'react'

export interface NavNode {
  id: string
  c: number
  r: number
  locked: boolean
}

interface Options {
  nodes: NavNode[]
  initialId: string
  /** Called when the player commits (Enter / l-into / o) on a non-locked node. */
  onEnter: (id: string) => void
  /** Optional: Esc backs out (e.g. to the hero). */
  onBack?: () => void
}

type Dir = 'h' | 'j' | 'k' | 'l'

/** Pick the nearest node in a direction from `from`, by spatial distance. */
function nearestInDirection(from: NavNode, dir: Dir, nodes: NavNode[]): NavNode | undefined {
  let best: NavNode | undefined
  let bestScore = Infinity
  for (const n of nodes) {
    if (n.id === from.id) continue
    const dc = n.c - from.c
    const dr = n.r - from.r
    // Must move primarily in the requested direction.
    const along = dir === 'l' ? dc : dir === 'h' ? -dc : dir === 'j' ? dr : -dr
    if (along <= 0) continue
    const perp = dir === 'l' || dir === 'h' ? Math.abs(dr) : Math.abs(dc)
    // Weight the perpendicular drift heavily so we prefer straight neighbours.
    const score = along + perp * 3
    if (score < bestScore) {
      bestScore = score
      best = n
    }
  }
  return best
}

/**
 * hjkl spatial navigation over world-map nodes. Owns a single window keydown
 * listener that lives only while the map is mounted (so it never collides with
 * in-level handlers, which live on a different route).
 */
export function useMapNavigation({ nodes, initialId, onEnter, onBack }: Options) {
  const [selectedId, setSelectedId] = useState(initialId)

  const move = useCallback(
    (dir: Dir) => {
      setSelectedId((cur) => {
        const from = nodes.find((n) => n.id === cur) ?? nodes[0]
        if (!from) return cur
        return nearestInDirection(from, dir, nodes)?.id ?? cur
      })
    },
    [nodes],
  )

  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      const tag = (e.target as HTMLElement)?.tagName
      if (tag === 'INPUT' || tag === 'TEXTAREA') return
      switch (e.key) {
        case 'h':
          e.preventDefault()
          move('h')
          break
        case 'j':
          e.preventDefault()
          move('j')
          break
        case 'k':
          e.preventDefault()
          move('k')
          break
        case 'l':
          e.preventDefault()
          move('l')
          break
        case 'Enter':
        case 'o': {
          e.preventDefault()
          const sel = nodes.find((n) => n.id === selectedId)
          if (sel && !sel.locked) onEnter(sel.id)
          break
        }
        case 'Escape':
          if (onBack) {
            e.preventDefault()
            onBack()
          }
          break
      }
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [move, nodes, selectedId, onEnter, onBack])

  return { selectedId, setSelectedId }
}
