// GSAP integration for VimSanity 2.0 game-feel.
// Wraps gsap.context() scoped to a ref so every tween is auto-reverted on
// unmount (and on React 19 StrictMode double-invoke). Exposes prefers-
// reduced-motion so timelines can snap to their end state instead of looping.

import { useEffect, useRef } from 'react'
import gsap from 'gsap'

export function prefersReducedMotion(): boolean {
  if (typeof window === 'undefined' || !window.matchMedia) return false
  return window.matchMedia('(prefers-reduced-motion: reduce)').matches
}

export interface GsapContext {
  gsap: typeof gsap
  /** The scoped root element the effect ref is attached to. */
  root: HTMLElement
  /** True when the user asked for reduced motion — no-op or snap to end. */
  reducedMotion: boolean
}

/**
 * Run a GSAP setup callback against a scoped root element.
 *
 * @param setup  receives { gsap, root, reducedMotion }. Create tweens/timelines
 *               here; they are automatically cleaned up via ctx.revert().
 * @param deps   re-runs the setup (and reverts the prior context) when changed.
 * @returns      a ref to attach to the scope root element.
 */
export function useGsap<T extends HTMLElement = HTMLDivElement>(
  setup: (ctx: GsapContext) => void,
  deps: React.DependencyList = [],
) {
  const ref = useRef<T>(null)

  useEffect(() => {
    const root = ref.current
    if (!root) return
    const reducedMotion = prefersReducedMotion()
    const ctx = gsap.context(() => {
      setup({ gsap, root, reducedMotion })
    }, root)
    return () => ctx.revert()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, deps)

  return ref
}
