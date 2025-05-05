import React from 'react'
import { X, ExternalLink } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'

interface DocumentationSidebarProps {
  currentLevel: number
  onClose: () => void
}

const DocumentationSidebar: React.FC<DocumentationSidebarProps> = ({
  currentLevel,
  onClose,
}) => {
  // Animation variants
  const sidebarVariants = {
    hidden: { opacity: 0, x: 20 },
    visible: {
      opacity: 1,
      x: 0,
      transition: {
        duration: 0.3,
        staggerChildren: 0.07,
        when: 'beforeChildren',
      },
    },
  }

  const itemVariants = {
    hidden: { opacity: 0, x: 10 },
    visible: {
      opacity: 1,
      x: 0,
      transition: {
        type: 'spring',
        stiffness: 300,
        damping: 24,
      },
    },
  }

  // Documentation content for each level
  const getLevelDocumentation = () => {
    switch (currentLevel) {
      case 0:
        return (
          <>
            <h3 className="text-lg font-semibold mb-2">Playground Mode</h3>
            <p className="text-sm mb-3">
              Practice all Vim motions in a free environment. Try out different
              key combinations and see how they work.
            </p>
            <div className="space-y-2">
              <p className="text-sm font-medium">Available motions:</p>
              <ul className="text-sm space-y-1 list-disc pl-4">
                <li>
                  <kbd className="px-1 bg-zinc-700 rounded">h j k l</kbd> -
                  Basic movement
                </li>
                <li>
                  <kbd className="px-1 bg-zinc-700 rounded">w b e</kbd> - Word
                  movement
                </li>
                <li>
                  <kbd className="px-1 bg-zinc-700 rounded">0 $</kbd> - Line
                  operations
                </li>
                <li>
                  <kbd className="px-1 bg-zinc-700 rounded">f t</kbd> - Find
                  characters
                </li>
              </ul>
            </div>
          </>
        )
      case 1:
        return (
          <>
            <h3 className="text-lg font-semibold mb-2">Basic Movement</h3>
            <p className="text-sm mb-3">
              The fundamental Vim directional keys that replace your arrow keys:
            </p>
            <div className="space-y-3">
              <div>
                <p className="text-sm font-medium">
                  <kbd className="px-2 py-1 bg-zinc-700 rounded">h</kbd> - Move
                  left
                </p>
                <p className="text-xs text-zinc-400 ml-1">
                  Like the left arrow key
                </p>
              </div>
              <div>
                <p className="text-sm font-medium">
                  <kbd className="px-2 py-1 bg-zinc-700 rounded">j</kbd> - Move
                  down
                </p>
                <p className="text-xs text-zinc-400 ml-1">
                  Like the down arrow key
                </p>
              </div>
              <div>
                <p className="text-sm font-medium">
                  <kbd className="px-2 py-1 bg-zinc-700 rounded">k</kbd> - Move
                  up
                </p>
                <p className="text-xs text-zinc-400 ml-1">
                  Like the up arrow key
                </p>
              </div>
              <div>
                <p className="text-sm font-medium">
                  <kbd className="px-2 py-1 bg-zinc-700 rounded">l</kbd> - Move
                  right
                </p>
                <p className="text-xs text-zinc-400 ml-1">
                  Like the right arrow key
                </p>
              </div>
            </div>
            <div className="mt-4 text-xs text-zinc-400">
              <p className="italic">
                Tip: Think of "j" as having a hook that goes down and "k" as
                having a stick that points up.
              </p>
            </div>
          </>
        )
      case 2:
        return (
          <>
            <h3 className="text-lg font-semibold mb-2">Word Movement</h3>
            <p className="text-sm mb-3">
              Navigate through text by words rather than individual characters:
            </p>
            <div className="space-y-3">
              <div>
                <p className="text-sm font-medium">
                  <kbd className="px-2 py-1 bg-zinc-700 rounded">w</kbd> - Move
                  to start of next word
                </p>
                <p className="text-xs text-zinc-400 ml-1">
                  Jump forward to the beginning of a word
                </p>
              </div>
              <div>
                <p className="text-sm font-medium">
                  <kbd className="px-2 py-1 bg-zinc-700 rounded">b</kbd> - Move
                  to start of previous word
                </p>
                <p className="text-xs text-zinc-400 ml-1">
                  Jump backward to the beginning of a word
                </p>
              </div>
              <div>
                <p className="text-sm font-medium">
                  <kbd className="px-2 py-1 bg-zinc-700 rounded">e</kbd> - Move
                  to end of current word
                </p>
                <p className="text-xs text-zinc-400 ml-1">
                  Jump to the end of a word
                </p>
              </div>
            </div>
          </>
        )
      case 3:
        return (
          <>
            <h3 className="text-lg font-semibold mb-2">Line Operations</h3>
            <p className="text-sm mb-3">
              Quickly navigate to the beginning or end of a line:
            </p>
            <div className="space-y-3">
              <div>
                <p className="text-sm font-medium">
                  <kbd className="px-2 py-1 bg-zinc-700 rounded">0</kbd> - Move
                  to start of line
                </p>
                <p className="text-xs text-zinc-400 ml-1">
                  Jump to the first character of the line
                </p>
              </div>
              <div>
                <p className="text-sm font-medium">
                  <kbd className="px-2 py-1 bg-zinc-700 rounded">_</kbd> - Move
                  to the first non-blank character
                </p>
                <p className="text-xs text-zinc-400 ml-1">
                  Useful for skipping leading whitespace/indentation
                </p>
              </div>
              <div>
                <p className="text-sm font-medium">
                  <kbd className="px-2 py-1 bg-zinc-700 rounded">$</kbd> - Move
                  to end of line
                </p>
                <p className="text-xs text-zinc-400 ml-1">
                  Jump to the last character of the line
                </p>
              </div>
            </div>
          </>
        )
      case 4:
        return (
          <>
            <h3 className="text-lg font-semibold mb-2">Find Characters</h3>
            <p className="text-sm mb-3">
              Jump to specific characters within the current line:
            </p>
            <div className="space-y-3">
              <div>
                <p className="text-sm font-medium">
                  <kbd className="px-2 py-1 bg-zinc-700 rounded">f{char}</kbd> -
                  Find character forward
                </p>
                <p className="text-xs text-zinc-400 ml-1">
                  Move to the next occurrence of {'{char}'}
                </p>
              </div>
              <div>
                <p className="text-sm font-medium">
                  <kbd className="px-2 py-1 bg-zinc-700 rounded">t{char}</kbd> -
                  Till character forward
                </p>
                <p className="text-xs text-zinc-400 ml-1">
                  Move to just before the next occurrence of {'{char}'}
                </p>
              </div>
            </div>
          </>
        )
      default:
        return (
          <p className="text-sm">Select a level to see its documentation.</p>
        )
    }
  }

  return (
    <motion.div
      className="w-64 h-full bg-zinc-800 p-5 overflow-y-auto scrollbar-thin scrollbar-thumb-zinc-600 scrollbar-track-zinc-800"
      initial="hidden"
      animate="visible"
      variants={sidebarVariants}
    >
      <motion.div
        className="flex items-center justify-between mb-6"
        variants={itemVariants}
      >
        <h2 className="text-lg font-semibold text-emerald-400">
          Documentation
        </h2>
        <motion.button
          onClick={onClose}
          className="p-2 hover:bg-zinc-700 rounded-lg transition-colors"
          whileHover={{ scale: 1.1, rotate: -90 }}
          whileTap={{ scale: 0.9 }}
          transition={{ duration: 0.2 }}
        >
          <X size={20} />
        </motion.button>
      </motion.div>

      <motion.div variants={itemVariants}>
        <div className="mb-4 px-1">
          <div className="h-1 w-16 bg-gradient-to-r from-emerald-500 to-emerald-400 rounded-full mb-4" />
          {getLevelDocumentation()}
        </div>
      </motion.div>

      <motion.div
        className="mt-8 pt-4 border-t border-zinc-700"
        variants={itemVariants}
      >
        <a
          href="https://vimhelp.org/"
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center gap-2 px-3 py-2 w-full rounded-lg hover:bg-zinc-700/70 transition-colors text-sm text-zinc-300"
        >
          Official Vim Documentation
          <ExternalLink size={14} className="text-emerald-400" />
        </a>
      </motion.div>
    </motion.div>
  )
}

export default DocumentationSidebar
