import { VimMode } from '../../utils/constants'

export interface EditorProps {
  showLineNumbers?: boolean
  fontSize?: number
}

const DEFAULT_EDITOR_SETTINGS: EditorProps = {
  showLineNumbers: false,
  fontSize: 16,
}

interface TextAreaProps {
  lines: string[]
  text: string
  cursorIndex: number
  mode: VimMode
  editor: EditorProps
}

export function TextArea({
  lines,
  text,
  cursorIndex,
  mode,
  editor,
}: TextAreaProps) {
  const isInsertMode = mode === 'insert'
  const isNormalMode = mode === 'normal'

  const editorSettings = { ...DEFAULT_EDITOR_SETTINGS, ...editor }

  const { showLineNumbers, fontSize } = editorSettings
  return (
    <div className="flex relative">
      {/* Line number column - fixed position */}
      {showLineNumbers ? (
        <div className="pr-3 text-right text-zinc-500 select-none border-r border-zinc-700 mr-3 min-w-[2.5rem] sticky left-0 z-10 bg-zinc-800">
          {lines.map((_, lineIdx) => (
            <div key={lineIdx} className={`font-mono`} style={{ fontSize }}>
              {lineIdx + 1}
            </div>
          ))}
        </div>
      ) : null}
      <div className={`font-mono`} style={{ fontSize }}>
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
                            ? 'bg-orange-400 text-white rounded-xs'
                            : 'bg-emerald-400 text-white rounded-xs'
                          : ''
                      }`}
                    >
                      {char === ' ' ? '\u00A0' : char}
                    </span>
                    {isCursorOnLastCharInInsertMode && (
                      <span className="bg-amber-500 text-white rounded-xs">
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
                        ? 'bg-emerald-500 text-white rounded-xs'
                        : 'bg-amber-500 text-white rounded-xs'
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
    </div>
  )
}
