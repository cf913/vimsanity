import type { ReactNode } from 'react'
import { tokens } from '../tokens'

interface PromptProps {
  children: ReactNode
  color?: string
}

/** Tiny terminal prompt label (e.g. `~/`, `$`). */
export function Prompt({ children, color = tokens.dim }: PromptProps) {
  return <span style={{ color, fontWeight: 600, marginRight: 8 }}>{children}</span>
}
