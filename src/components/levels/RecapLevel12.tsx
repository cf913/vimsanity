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
          before: 'lin|e 1\nline 2',
          after: 'line 1\nlin|e 2',
        },
        {
          command: 'k',
          description: 'Move cursor up',
          before: 'line 1\nlin|e 2',
          after: 'lin|e 1\nline 2',
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
          description: 'Move to beginning of word',
          before: 'hello world |vim',
          after: 'hello |world vim',
        },
        {
          command: 'e',
          description: 'Move to end of word',
          before: 'hell|o world',
          after: 'hello worl|d',
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
          command: 'f{o}',
          description: 'Find o character forward',
          before: 'h|ello world',
          after: 'hell|o world',
        },
        {
          command: 't{o}',
          description: 'Till o character forward',
          before: '|hello world',
          after: 'hel|lo world',
        },
        {
          command: 'F{l}',
          description: 'Find l character backward',
          before: 'hello wor|ld',
          after: 'hel|lo world',
        },
        {
          command: 'T{l}',
          description: 'Till l character backward',
          before: 'hello wor|ld',
          after: 'hell|o world',
        },
        {
          command: '/vim',
          description: 'Search forward',
          before: 'vim i|s awesome vim',
          after: 'vim is awesome |vim',
        },
        {
          command: '?vim',
          description: 'Search backward',
          before: 'vim is aweso|me vim',
          after: '|vim is awesome vim',
        },
        {
          command: 'n',
          description: 'Next match after search',
          before: '|vim text vim more',
          after: 'vim text |vim more',
        },
        {
          command: 'N',
          description: 'Previous match after search',
          before: 'vim text |vim more',
          after: '|vim text vim more',
        },
      ],
    },
    {
      title: 'More good ones',
      color: 'emerald',
      motions: [
        {
          command: '{3}j',
          description: 'Move cursor down 3 lines',
          before: 'lin|e 1\nline 2\nline 3\nline 4',
          after: 'line 1\nline 2\nline 3\nlin|e 4',
        },
        {
          command: 'J',
          description: 'Append next line to current line',
          before: 'lin|e 1\nline2',
          after: 'line 1| line2',
        },
        {
          command: '{3}w',
          description: 'Move to next word, 3 times',
          before: 'he|llo world vim enabled',
          after: 'hello world vim |enabled',
        },
        {
          command: 'gg',
          description: 'Move to first line of file',
          before: 'this\nis\na\nlong\n\\\\...hundreds of lines...\nlo|ng\nfile',
          after: 'th|is\nis\na\nlong\n\\\\...hundreds of lines...long\nfile',
        },
        {
          command: 'G',
          description: 'Move to last line of file',
          before: 'this\ni|s\na\nlong\n\\\\...hundreds of lines...\nlong\nfile',
          after: 'this\nis\na\nlong\n\\\\...hundreds of lines...\nlong\nf|ile',
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
          before: 'hello worl|d',
          after: 'hello |',
        },
        {
          command: 'Ctrl+r',
          description: 'Redo last change',
          before: 'hello |',
          after: 'hello worl|d',
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
          after: 'hel|o',
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
          after: 'line 1\nlin|e 3',
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
    {
      title: 'More Delete goodness',
      color: 'red',
      motions: [
        {
          command: 'diw',
          description: 'Delete word from anywhere in the word',
          before: 'hello wor|ld',
          after: 'hello |',
        },
        {
          command: 'di[',
          description: 'Delete In [ (works with any brackets)',
          before: 'hello [wor|ld]',
          after: 'hello [|]',
        },
        {
          command: 'di"',
          description: 'Delete In " (and quotes too!!)',
          before: 'hello "wor|ld"',
          after: 'hello "|"',
        },
        {
          command: 'da"',
          description:
            'Delete Arround " (use a to also delete the quotes/brackets)',
          before: 'hello "wor|ld"',
          after: 'hello |',
        },
        {
          command: 'dit',
          description: 'Delete In <Tag>',
          before: '<div>\n\thel|lo world\n</div>',
          after: '<div>|</div>',
        },
        {
          command: 'dat',
          description: 'Delete Arround <Tag>',
          before: '<div>\n\thel|lo world\n</div>',
          after: '|',
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
          <>
            <span className="bg-orange-400 w-0.5 h-5 inline-block translate-y-1"></span>
            {charAtCursor}
          </>
        ) : (
          <span className="bg-emerald-400 text-zinc-900 inline-block w-[1ch] text-center">
            {charAtCursor === ' ' ? '\u00A0' : charAtCursor}
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
          Reference for all vim motions you've learned + variants and some nice
          ones i often use.
        </p>
      </div>

      <div className="mt-12 p-6 bg-zinc-800/50 rounded-lg border border-zinc-700 mb-8">
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
            NORMAL mode
          </div>
          <div>
            <strong className="text-amber-400">Combinations:</strong> Many
            commands can be combined (e.g., <KBD>dw</KBD> = delete word)
          </div>
          <div>
            <strong className="text-red-400">Bonus:</strong> Combine commands
            with numbers! <KBD>3j</KBD> moves down 3 lines
          </div>
        </div>
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
                      {/* <div className="text-xs text-zinc-500 mb-1">Before:</div> */}
                      <pre className="text-sm text-zinc-300 bg-zinc-800/50 px-2 py-1 rounded font-mono whitespace-pre-wrap">
                        {renderTextWithCursor(motion.before)}
                      </pre>
                    </div>

                    <div className="col-span-1 flex justify-center">
                      <span className="text-zinc-300">→</span>
                    </div>

                    <div className="col-span-4">
                      {/* <div className="text-xs text-zinc-500 mb-1">After:</div> */}
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
      <div>
        <strong className="text-emerald-400">Note:</strong> Use <KBD>c</KBD>
        instead of <KBD>d</KBD> when you're replacing something to save yourself
        an insert command.
      </div>
    </div>
  )
}
