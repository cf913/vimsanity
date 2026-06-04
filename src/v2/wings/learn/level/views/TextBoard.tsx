import { tokens, fontMono } from '../../../../design/tokens'

interface TextBoardProps {
  text: string
  cursorIndex: number
  /** Char indices to highlight as the current target (inclusive range or set). */
  isTarget?: (index: number) => boolean
  caption?: string
}

/** CRT-styled single-buffer text view with a phosphor block cursor + target highlight. */
export function TextBoard({ text, cursorIndex, isTarget, caption }: TextBoardProps) {
  const out: React.ReactNode[] = []
  for (let i = 0; i < text.length; i++) {
    const ch = text[i]
    const isCursor = cursorIndex === i
    const target = isTarget?.(i) ?? false
    out.push(
      <span
        key={i}
        style={{
          background: isCursor ? tokens.bright : target ? 'rgba(255,181,71,.22)' : 'transparent',
          color: isCursor ? tokens.bg : target ? tokens.amber : tokens.text,
          boxShadow: isCursor ? `0 0 10px ${tokens.bright}` : undefined,
          fontWeight: isCursor || target ? 700 : 400,
        }}
      >
        {ch === '\n' ? '\n' : ch}
      </span>,
    )
  }
  return (
    <div
      className="vs-frame"
      style={{
        maxWidth: '52rem',
        padding: 24,
        background: tokens.bg,
        whiteSpace: 'pre-wrap',
        fontFamily: fontMono,
        fontSize: 18,
        lineHeight: 1.8,
        color: tokens.text,
      }}
    >
      {out}
      {caption && (
        <div style={{ marginTop: 16, fontSize: 12, color: tokens.dim, letterSpacing: '.08em' }}>{caption}</div>
      )}
    </div>
  )
}
