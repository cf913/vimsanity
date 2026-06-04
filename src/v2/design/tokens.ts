// Phosphor CRT design tokens for VimSanity 2.0.
// Single source of truth for the palette. Mirrored as CSS custom properties in
// crt.css (scoped under .vs-crt-root) and exposed to Tailwind via theme.css.
// Import these in TS when a raw hex is needed (e.g. GSAP color tweens, SVG).

export const tokens = {
  bg: '#050905',
  bgPanel: '#0a120c',
  bgPanel2: '#0e1812',
  grid: '#0f2418',
  line: '#1c3a26',
  line2: '#2a5840',
  dim: '#3a7d4f',
  text: '#9af0b8',
  bright: '#10ffa0',
  hot: '#5fffb8',
  emerald: '#10b981',
  amber: '#ffb547',
  red: '#ff5a5f',
  purple: '#c084fc',
  cyan: '#7ee9ff',
  white: '#eafff2',
} as const

export type TokenName = keyof typeof tokens

export type VimMode = 'normal' | 'insert' | 'visual'

// The cursor sprite + status bar are mode-colored.
export const modeColor: Record<VimMode, string> = {
  normal: tokens.bright,
  insert: tokens.amber,
  visual: tokens.purple,
}

export const modeGlow: Record<VimMode, string> = {
  normal: 'rgba(16,255,160,.6)',
  insert: 'rgba(255,181,71,.6)',
  visual: 'rgba(192,132,252,.6)',
}

export const fontMono =
  '"JetBrains Mono", "IBM Plex Mono", ui-monospace, SFMono-Regular, Menlo, monospace'
