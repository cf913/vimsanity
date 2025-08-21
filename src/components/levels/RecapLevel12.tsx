import React from 'react'
import { KBD } from '../common/KBD'

export default function RecapLevel12() {
  const motionCategories = [
    {
      title: 'Navigate',
      color: 'emerald',
      motions: [
        {
          command: 'h',
          description: 'Move cursor left',
          before: 'he|llo',
          after: 'h|ello',
        },
        {
          command: 'j',
          description: 'Move cursor down',
          before: 'line 1\n|line 2',
          after: 'line 1\nline 2|',
        },
        {
          command: 'k',
          description: 'Move cursor up',
          before: 'line 1\nline 2|',
          after: 'line 1|\nline 2',
        },
        {
          command: 'l',
          description: 'Move cursor right',
          before: 'h|ello',
          after: 'he|llo',
        },
        {
          command: 'w',
          description: 'Move to next word',
          before: 'hello |world vim',
          after: 'hello world |vim',
        },
        {
          command: 'b',
          description: 'Move to previous word',
          before: 'hello world |vim',
          after: 'hello |world vim',
        },
        {
          command: 'e',
          description: 'Move to end of word',
          before: 'hel|lo world',
          after: 'hell|o world',
        },
        {
          command: '0',
          description: 'Move to start of line',
          before: '  hello wo|rld',
          after: '|  hello world',
        },
        {
          command: '^',
          description: 'Move to first non-blank',
          before: '  hello wo|rld',
          after: '  |hello world',
        },
        {
          command: '$',
          description: 'Move to end of line',
          before: 'hello |world',
          after: 'hello worl|d',
        },
        {
          command: 'f{char}',
          description: 'Find character forward',
          before: 'hello w|orld',
          after: 'hello wor|ld (fo)',
        },
        {
          command: 't{char}',
          description: 'Till character forward',
          before: 'hello w|orld',
          after: 'hello wo|rld (to)',
        },
        {
          command: 'F{char}',
          description: 'Find character backward',
          before: 'hello wor|ld',
          after: 'he|llo world (Fl)',
        },
        {
          command: 'T{char}',
          description: 'Till character backward',
          before: 'hello wor|ld',
          after: 'hel|lo world (Tl)',
        },
        {
          command: '/{pattern}',
          description: 'Search forward',
          before: 'vim is |awesome vim',
          after: 'vim is awesome |vim',
        },
        {
          command: '?{pattern}',
          description: 'Search backward',
          before: 'vim is awesome |vim',
          after: '|vim is awesome vim',
        },
        {
          command: 'n',
          description: 'Next match',
          before: '|vim text vim more',
          after: 'vim text |vim more',
        },
        {
          command: 'N',
          description: 'Previous match',
          before: 'vim text |vim more',
          after: '|vim text vim more',
        },
      ],
    },
    {
      title: 'Insert',
      color: 'blue',
      motions: [
        {
          command: 'i',
          description: 'Insert before cursor',
          before: 'hel|lo (NORMAL)',
          after: 'hel|lo (INSERT)',
        },
        {
          command: 'a',
          description: 'Insert after cursor',
          before: 'hel|lo (NORMAL)',
          after: 'hell|o (INSERT)',
        },
        {
          command: 'I',
          description: 'Insert at line start',
          before: '  hel|lo (NORMAL)',
          after: '  |hello (INSERT)',
        },
        {
          command: 'A',
          description: 'Insert at line end',
          before: 'hel|lo (NORMAL)',
          after: 'hello| (INSERT)',
        },
        {
          command: 'o',
          description: 'Insert new line below',
          before: 'text|',
          after: 'text\n| (INSERT)',
        },
        {
          command: 'O',
          description: 'Insert new line above',
          before: 'text|',
          after: '| (INSERT)\ntext',
        },
        {
          command: 'Esc',
          description: 'Return to normal mode',
          before: 'hel|lo (INSERT)',
          after: 'he|llo (NORMAL)',
        },
      ],
    },
    {
      title: 'History',
      color: 'amber',
      motions: [
        {
          command: 'u',
          description: 'Undo last change',
          before: 'hello world',
          after: 'hello (undid "world")',
        },
        {
          command: 'Ctrl+r',
          description: 'Redo last change',
          before: 'hello (undid "world")',
          after: 'hello world',
        },
      ],
    },
    {
      title: 'Delete',
      color: 'red',
      motions: [
        {
          command: 'x',
          description: 'Delete character',
          before: 'hel|lo',
          after: 'he|lo',
        },
        {
          command: 'D',
          description: 'Delete to end of line',
          before: 'hello |world vim',
          after: 'hello |',
        },
        {
          command: 'C',
          description: 'Change to end of line',
          before: 'hello |world vim',
          after: 'hello | (INSERT)',
        },
        {
          command: 'S',
          description: 'Change entire line',
          before: 'hello |world vim',
          after: '| (INSERT)',
        },
        {
          command: 'dd',
          description: 'Delete entire line',
          before: 'line 1\nhel|lo\nline 3',
          after: 'line 1\n|line 3',
        },
        {
          command: 'dw',
          description: 'Delete word',
          before: 'hello |world vim',
          after: 'hello |vim',
        },
        {
          command: 'dh',
          description: 'Delete char left',
          before: 'hel|lo',
          after: 'he|lo',
        },
        {
          command: 'dl',
          description: 'Delete char right',
          before: 'hel|lo',
          after: 'hel|o',
        },
      ],
    },
  ]

  const renderTextWithCursor = (text: string) => {
    const cursorIndex = text.indexOf('|')
    if (cursorIndex === -1) return text

    const beforeCursor = text.substring(0, cursorIndex)
    const afterCursor = text.substring(cursorIndex + 1)
    const charAtCursor = afterCursor[0] || ' '
    const restAfterCursor = afterCursor.substring(1)

    const isInsertMode = text.includes('(INSERT)')

    return (
      <>
        {beforeCursor}
        {isInsertMode ? (
          <span className="bg-emerald-400 w-0.5 h-4 inline-block relative">
            <span className="absolute left-0 text-zinc-300">
              {charAtCursor}
            </span>
          </span>
        ) : (
          <span className="bg-emerald-400 text-zinc-900 px-0.5">
            {charAtCursor}
          </span>
        )}
        {restAfterCursor}
      </>
    )
  }

  const getColorClasses = (color: string) => {
    const colorMap = {
      emerald: {
        header: 'text-emerald-400',
        accent: 'bg-emerald-500/10 border-emerald-500/20',
        command: 'text-emerald-300',
      },
      blue: {
        header: 'text-blue-400',
        accent: 'bg-blue-500/10 border-blue-500/20',
        command: 'text-blue-300',
      },
      amber: {
        header: 'text-amber-400',
        accent: 'bg-amber-500/10 border-amber-500/20',
        command: 'text-amber-300',
      },
      red: {
        header: 'text-red-400',
        accent: 'bg-red-500/10 border-red-500/20',
        command: 'text-red-300',
      },
    }
    return colorMap[color as keyof typeof colorMap] || colorMap.emerald
  }

  return (
    <div className="max-w-7xl mx-auto p-6">
      <div className="text-center mb-8">
        <h2 className="text-3xl font-bold mb-3 text-emerald-400">
          🎯 Vim Motions Recap
        </h2>
        <p className="text-zinc-400 text-lg">
          Master reference for all vim motions you've learned
        </p>
      </div>

      <div className="space-y-12">
        {motionCategories.map((category) => {
          const colors = getColorClasses(category.color)

          return (
            <div key={category.title} className="space-y-4">
              <div className="flex items-center gap-3 mb-6">
                <h3 className={`text-2xl font-bold ${colors.header}`}>
                  {category.title}
                </h3>
                <div className="h-px bg-gradient-to-r from-zinc-600 to-transparent flex-1" />
              </div>

              <div className="grid gap-3">
                {category.motions.map((motion, idx) => (
                  <div
                    key={idx}
                    className={`${colors.accent} border rounded-lg p-4 grid grid-cols-12 gap-4 items-center hover:bg-opacity-20 transition-all`}
                  >
                    <div className="col-span-3 flex gap-2 items-center">
                      <KBD>{motion.command}</KBD>
                      <span className="text-sm text-zinc-400">
                        {motion.description}
                      </span>
                    </div>

                    <div className="col-span-4">
                      <div className="text-xs text-zinc-500 mb-1">Before:</div>
                      <pre className="text-sm text-zinc-300 bg-zinc-800/50 px-2 py-1 rounded font-mono whitespace-pre-wrap">
                        {renderTextWithCursor(motion.before)}
                      </pre>
                    </div>

                    <div className="col-span-1 flex justify-center">
                      <span className="text-zinc-600">→</span>
                    </div>

                    <div className="col-span-4">
                      <div className="text-xs text-zinc-500 mb-1">After:</div>
                      <pre className="text-sm text-zinc-300 bg-zinc-800/50 px-2 py-1 rounded font-mono whitespace-pre-wrap">
                        {renderTextWithCursor(motion.after)}
                      </pre>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )
        })}
      </div>

      <div className="mt-12 p-6 bg-zinc-800/50 rounded-lg border border-zinc-700">
        <h4 className="text-lg font-semibold text-emerald-400 mb-3">
          💡 Pro Tips
        </h4>
        <div className="grid md:grid-cols-2 gap-4 text-sm text-zinc-300">
          <div>
            <strong className="text-emerald-400">Cursor notation:</strong> The{' '}
            <code>|</code> symbol shows cursor position
          </div>
          <div>
            <strong className="text-blue-400">Modes:</strong> Commands work in
            NORMAL mode unless noted as INSERT
          </div>
          <div>
            <strong className="text-amber-400">Combinations:</strong> Many
            commands can be combined (e.g., <code>d + w</code> = delete word)
          </div>
          <div>
            <strong className="text-red-400">Practice:</strong> Use the
            playground (Level 0) to practice any combination!
          </div>
        </div>
      </div>
    </div>
  )
}

