import { motion } from 'framer-motion'

type CursorMode = 'block' | 'line'

interface TextWithCursorProps {
  text: string
  cursorPosition: number
  cursorMode?: CursorMode
  highlightColor?: string // e.g., 'bg-purple-500/30'
  textColor?: string // e.g., 'text-purple-300'
  animated?: boolean
}

export function TextWithCursor({
  text,
  cursorPosition,
  cursorMode = 'block',
  highlightColor,
  textColor,
  animated = true,
}: TextWithCursorProps) {
  const before = text.slice(0, cursorPosition)
  const cursorChar = text[cursorPosition] || ' '
  const after = text.slice(cursorPosition + 1)

  const CursorWrapper = animated ? motion.span : 'span'
  const cursorAnimation = animated
    ? {
        animate: { opacity: [1, 0.5, 1] },
        transition: {
          duration: 1,
          repeat: Infinity,
          ease: 'easeInOut',
        },
      }
    : {}

  const displayChar = cursorChar === ' ' ? '\u00A0' : cursorChar

  return (
    <span className={highlightColor}>
      <span className={textColor || 'text-slate-200'}>{before}</span>
      <span className="relative inline-block">
        {cursorMode === 'block' ? (
          <CursorWrapper
            className={`${textColor || 'text-slate-200'} bg-emerald-400 px-[0px]`}
            {...cursorAnimation}
          >
            {displayChar}
          </CursorWrapper>
        ) : (
          <>
            <span className={textColor || 'text-slate-200'}>{cursorChar}</span>
            <CursorWrapper
              className="absolute bottom-0 left-0 w-[2px] h-[1em] bg-emerald-400"
              {...cursorAnimation}
            />
          </>
        )}
      </span>
      <span className={textColor || 'text-slate-200'}>{after}</span>
    </span>
  )
}
