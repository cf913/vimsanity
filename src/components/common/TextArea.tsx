import { VimMode } from '../../utils/constants'

interface TextAreaProps {
  lines: string[]
  text: string
  cursorIndex: number
  mode: VimMode
}

export function TextArea({ lines, text, cursorIndex, mode }: TextAreaProps) {
  const isInsertMode = mode === 'insert'
  const isNormalMode = mode === 'normal'
  return (
    <div className="text-2xl font-mono">
      {lines.map((line, lineIdx) => {
        // Calculate line start position in the entire text
        const lineStartPosition =
          text.split('\n').slice(0, lineIdx).join('\n').length +
          (lineIdx > 0 ? 1 : 0)

        // Calculate if cursor is on this line
        const isCursorOnThisLine =
          cursorIndex >= lineStartPosition &&
          (lineIdx === lines.length - 1 ||
            cursorIndex < lineStartPosition + line.length + 1)

        return (
          <div key={lineIdx}>
            {line.split('').map((char, charIdx) => {
              const absoluteIdx = lineStartPosition + charIdx
              const isCursorPosition = absoluteIdx === cursorIndex
              const isCursorOnLastChar = absoluteIdx + 1 === cursorIndex
              const isCursorOnLastCharInInsertMode =
                isInsertMode &&
                isCursorOnLastChar &&
                charIdx === line.length - 1
              return (
                <>
                  <span
                    key={charIdx}
                    className={`${
                      isCursorPosition
                        ? isInsertMode
                          ? 'bg-orange-400 text-white rounded'
                          : 'bg-emerald-400 text-white rounded'
                        : ''
                    }`}
                  >
                    {char === ' ' ? '\u00A0' : char}
                  </span>
                  {isCursorOnLastCharInInsertMode && (
                    <span className="bg-amber-500 text-white rounded">
                      {'\u00A0'}
                    </span>
                  )}
                </>
              )
            })}
            {/* Show cursor if content is empty */}
            {line.length === 0 &&
              (isCursorOnThisLine ? (
                <span
                  className={
                    isNormalMode
                      ? 'bg-emerald-500 text-white rounded'
                      : 'bg-amber-500 text-white rounded'
                  }
                >
                  {'\u00A0'}
                </span>
              ) : (
                <span className="">{'\u00A0'}</span>
              ))}
          </div>
        )
      })}
    </div>
  )
}
