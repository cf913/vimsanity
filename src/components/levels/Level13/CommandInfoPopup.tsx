import React, { useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { X } from 'lucide-react'
import { VimCommand } from './types'
import { KBD } from '../../common/KBD'

interface CommandInfoPopupProps {
  command: VimCommand | null
  onClose: () => void
}

const CommandInfoPopup: React.FC<CommandInfoPopupProps> = ({
  command,
  onClose,
}) => {
  // Auto-dismiss after 5 seconds
  useEffect(() => {
    if (command) {
      const timer = setTimeout(() => {
        onClose()
      }, 5000)
      return () => clearTimeout(timer)
    }
  }, [command, onClose])

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
    const colorMap: Record<
      string,
      { bg: string; border: string; text: string; accent: string }
    > = {
      emerald: {
        bg: 'bg-emerald-500/10',
        border: 'border-emerald-500/50',
        text: 'text-emerald-400',
        accent: 'bg-emerald-500',
      },
      blue: {
        bg: 'bg-blue-500/10',
        border: 'border-blue-500/50',
        text: 'text-blue-400',
        accent: 'bg-blue-500',
      },
      red: {
        bg: 'bg-red-500/10',
        border: 'border-red-500/50',
        text: 'text-red-400',
        accent: 'bg-red-500',
      },
      purple: {
        bg: 'bg-purple-500/10',
        border: 'border-purple-500/50',
        text: 'text-purple-400',
        accent: 'bg-purple-500',
      },
      amber: {
        bg: 'bg-amber-500/10',
        border: 'border-amber-500/50',
        text: 'text-amber-400',
        accent: 'bg-amber-500',
      },
    }
    return colorMap[color] || colorMap.emerald
  }

  return (
    <AnimatePresence>
      {command && (
        <motion.div
          className="fixed bottom-8 left-1/2 transform -translate-x-1/2 z-50 max-w-2xl w-full px-4"
          initial={{ opacity: 0, y: 50 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 50 }}
          transition={{
            type: 'spring',
            stiffness: 400,
            damping: 30,
          }}
        >
          <div
            className={`
              relative rounded-2xl border-2 p-6
              bg-zinc-900/95 backdrop-blur-md
              ${getColorClasses(command.colorClass).bg}
              ${getColorClasses(command.colorClass).border}
            `}
            style={{
              boxShadow: `
                0 20px 40px rgba(0, 0, 0, 0.5),
                0 0 40px ${getGlowColor(command.colorClass, 0.2)}
              `,
            }}
          >
            {/* Close button */}
            <button
              onClick={onClose}
              className="absolute top-4 right-4 p-2 rounded-lg hover:bg-zinc-800 transition-colors group"
              title="Press ESC to close"
            >
              <X size={20} className="text-zinc-400 group-hover:text-zinc-200 transition-colors" />
            </button>

            {/* ESC hint */}
            <div className="absolute top-4 left-4 text-xs text-zinc-500">
              Press <KBD>ESC</KBD> to close
            </div>

            {/* Content */}
            <div className="space-y-4">
              {/* Header */}
              <div className="flex items-center gap-3">
                <KBD>{command.key}</KBD>
                <div>
                  <h3
                    className={`text-lg font-bold ${getColorClasses(command.colorClass).text}`}
                  >
                    {command.description}
                  </h3>
                  <div className="flex gap-2 mt-1">
                    {command.modes.map((mode) => (
                      <span
                        key={mode}
                        className="text-xs px-2 py-0.5 bg-zinc-800 rounded text-zinc-400"
                      >
                        {mode.toUpperCase()}
                      </span>
                    ))}
                  </div>
                </div>
              </div>

              {/* Category badge */}
              <div className="flex gap-2">
                <span
                  className={`
                    text-xs px-3 py-1 rounded-full font-medium
                    ${getColorClasses(command.colorClass).accent} text-white
                  `}
                >
                  {command.category}
                </span>
              </div>

              {/* Example */}
              <div className="grid grid-cols-[1fr,auto,1fr] gap-4 items-center">
                <div>
                  <div className="text-xs text-zinc-500 mb-1">Before:</div>
                  <pre className="text-sm text-zinc-300 bg-zinc-800/50 px-3 py-2 rounded font-mono whitespace-pre-wrap">
                    {renderTextWithCursor(command.example.before)}
                  </pre>
                </div>

                <div className="text-zinc-400 text-xl">→</div>

                <div>
                  <div className="text-xs text-zinc-500 mb-1">After:</div>
                  <pre className="text-sm text-zinc-300 bg-zinc-800/50 px-3 py-2 rounded font-mono whitespace-pre-wrap">
                    {renderTextWithCursor(command.example.after)}
                  </pre>
                </div>
              </div>
            </div>

            {/* Progress bar for auto-dismiss */}
            <motion.div
              className={`absolute bottom-0 left-0 h-1 ${getColorClasses(command.colorClass).accent} rounded-b-2xl`}
              initial={{ width: '100%' }}
              animate={{ width: '0%' }}
              transition={{ duration: 5, ease: 'linear' }}
            />
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}

function getGlowColor(color: string, opacity: number): string {
  const colorMap: Record<string, string> = {
    emerald: `rgba(16, 185, 129, ${opacity})`,
    blue: `rgba(59, 130, 246, ${opacity})`,
    red: `rgba(239, 68, 68, ${opacity})`,
    purple: `rgba(168, 85, 247, ${opacity})`,
    amber: `rgba(245, 158, 11, ${opacity})`,
  }
  return colorMap[color] || colorMap.emerald
}

export default CommandInfoPopup
