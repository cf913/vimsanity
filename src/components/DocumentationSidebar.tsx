import React from 'react'
import { X, ExternalLink } from 'lucide-react'
import { motion } from 'framer-motion'

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
              Navigate through text word by word more efficiently:
            </p>
            <div className="space-y-3">
              <div>
                <p className="text-sm font-medium">
                  <kbd className="px-2 py-1 bg-zinc-700 rounded">w</kbd> - Move
                  to next word start
                </p>
                <p className="text-xs text-zinc-400 ml-1">
                  Jump to the beginning of the next word
                </p>
                <p className="text-xs text-zinc-400 ml-1">W as in "Word"</p>
              </div>
              <div>
                <p className="text-sm font-medium">
                  <kbd className="px-2 py-1 bg-zinc-700 rounded">b</kbd> - Move
                  to previous word start
                </p>
                <p className="text-xs text-zinc-400 ml-1">
                  B as in "Back" or "Beginning"
                </p>
              </div>
              <div>
                <p className="text-sm font-medium">
                  <kbd className="px-2 py-1 bg-zinc-700 rounded">e</kbd> - Move
                  to word end
                </p>
                <p className="text-xs text-zinc-400 ml-1">
                  Jump to the end of the current word
                </p>
                <p className="text-xs text-zinc-400 ml-1">E as in "End"</p>
              </div>
            </div>
            <div className="mt-4 text-xs text-zinc-400">
              <p className="italic">
                Tip: These motions work across lines and consider punctuation as
                separate words.
              </p>
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
                  <kbd className="px-2 py-1 bg-zinc-700 rounded">f + char</kbd>{' '}
                  - Find character forward
                </p>
                <p className="text-xs text-zinc-400 ml-1">
                  Move to the next occurrence of {'{char}'} on the current line
                </p>
              </div>
              <div>
                <p className="text-sm font-medium">
                  <kbd className="px-2 py-1 bg-zinc-700 rounded">F + char</kbd>{' '}
                  - Find character backward
                </p>
                <p className="text-xs text-zinc-400 ml-1">
                  Move to the previous occurrence of {'{char}'} on the current line
                </p>
              </div>
              <div>
                <p className="text-sm font-medium">
                  <kbd className="px-2 py-1 bg-zinc-700 rounded">t + char</kbd>{' '}
                  - Till character forward
                </p>
                <p className="text-xs text-zinc-400 ml-1">
                  Move to just before the next occurrence of {'{char}'} on the
                  current line
                </p>
              </div>
              <div>
                <p className="text-sm font-medium">
                  <kbd className="px-2 py-1 bg-zinc-700 rounded">T + char</kbd>{' '}
                  - Till character backward
                </p>
                <p className="text-xs text-zinc-400 ml-1">
                  Move to just after the previous occurrence of {'{char}'} on the
                  current line
                </p>
              </div>
              <div>
                <p className="text-sm font-medium">
                  <kbd className="px-2 py-1 bg-zinc-700 rounded">j</kbd> - Move
                  down
                </p>
                <p className="text-xs text-zinc-400 ml-1">Move down one line</p>
              </div>
              <div>
                <p className="text-sm font-medium">
                  <kbd className="px-2 py-1 bg-zinc-700 rounded">k</kbd> - Move
                  up
                </p>
                <p className="text-xs text-zinc-400 ml-1">Move up one line</p>
              </div>
            </div>
            <div className="mt-4 text-xs text-zinc-400">
              <p className="italic">
                Tip: After pressing 'f', 'F', 't', or 'T', you need to type the character
                you want to find. The cursor will move to (or just before/after) the
                next or previous occurrence of that character depending on the command used.
              </p>
            </div>
          </>
        )
      case 5:
        return (
          <>
            <h3 className="text-lg font-semibold mb-2">Search Operations</h3>
            <p className="text-sm mb-3">
              Search for text patterns and navigate between matches:
            </p>
            <div className="space-y-3">
              <div>
                <p className="text-sm font-medium">
                  <kbd className="px-2 py-1 bg-zinc-700 rounded">/</kbd> - Search forward
                </p>
                <p className="text-xs text-zinc-400 ml-1">
                  Search for a pattern going forward from your current position
                </p>
                <p className="text-xs text-zinc-400 ml-1">
                  Type your search pattern and press Enter to confirm
                </p>
              </div>
              <div>
                <p className="text-sm font-medium">
                  <kbd className="px-2 py-1 bg-zinc-700 rounded">?</kbd> - Search backward
                </p>
                <p className="text-xs text-zinc-400 ml-1">
                  Search for a pattern going backward from your current position
                </p>
                <p className="text-xs text-zinc-400 ml-1">
                  Type your search pattern and press Enter to confirm
                </p>
              </div>
              <div>
                <p className="text-sm font-medium">
                  <kbd className="px-2 py-1 bg-zinc-700 rounded">n</kbd> - Next match
                </p>
                <p className="text-xs text-zinc-400 ml-1">
                  Jump to the next occurrence of your search pattern
                </p>
                <p className="text-xs text-zinc-400 ml-1">
                  Continues in the direction of your original search
                </p>
              </div>
              <div>
                <p className="text-sm font-medium">
                  <kbd className="px-2 py-1 bg-zinc-700 rounded">N</kbd> - Previous match
                </p>
                <p className="text-xs text-zinc-400 ml-1">
                  Jump to the previous occurrence of your search pattern
                </p>
                <p className="text-xs text-zinc-400 ml-1">
                  Moves opposite to the direction of your original search
                </p>
              </div>
            </div>
            <div className="mt-4 text-xs text-zinc-400">
              <p className="italic">
                Tip: Search is one of Vim's most powerful navigation tools. You can 
                use it to quickly jump to specific words, variables, or patterns in your text.
              </p>
            </div>
          </>
        )
      case 6:
        return (
          <>
            <h3 className="text-lg font-semibold mb-2">Basic Insert Mode</h3>
            <p className="text-sm mb-3">
              Insert mode allows you to add and edit text in Vim. These commands enter insert mode:
            </p>
            <div className="space-y-3">
              <div>
                <p className="text-sm font-medium">
                  <kbd className="px-2 py-1 bg-zinc-700 rounded">i</kbd> - Insert before cursor
                </p>
                <p className="text-xs text-zinc-400 ml-1">
                  Begin inserting text at the current cursor position
                </p>
              </div>
              <div>
                <p className="text-sm font-medium">
                  <kbd className="px-2 py-1 bg-zinc-700 rounded">a</kbd> - Append after cursor
                </p>
                <p className="text-xs text-zinc-400 ml-1">
                  Begin inserting text after the current cursor position
                </p>
              </div>
              <div>
                <p className="text-sm font-medium">
                  <kbd className="px-2 py-1 bg-zinc-700 rounded">Escape</kbd> - Exit insert mode
                </p>
                <p className="text-xs text-zinc-400 ml-1">
                  Return to normal mode after making text changes
                </p>
              </div>
            </div>
            <div className="mt-4 text-xs text-zinc-400">
              <p className="italic">
                Tip: Always remember to press Escape to return to normal mode after making changes.
                This is one of the most common mistakes for new Vim users!
              </p>
            </div>
          </>
        )
      case 7:
        return (
          <>
            <h3 className="text-lg font-semibold mb-2">Line Insert Commands</h3>
            <p className="text-sm mb-3">
              These commands let you insert text at specific line positions or create new lines:
            </p>
            <div className="space-y-3">
              <div>
                <p className="text-sm font-medium">
                  <kbd className="px-2 py-1 bg-zinc-700 rounded">I</kbd> - Insert at line beginning
                </p>
                <p className="text-xs text-zinc-400 ml-1">
                  Move to the start of the line and enter insert mode
                </p>
              </div>
              <div>
                <p className="text-sm font-medium">
                  <kbd className="px-2 py-1 bg-zinc-700 rounded">A</kbd> - Append at line end
                </p>
                <p className="text-xs text-zinc-400 ml-1">
                  Move to the end of the line and enter insert mode
                </p>
              </div>
              <div>
                <p className="text-sm font-medium">
                  <kbd className="px-2 py-1 bg-zinc-700 rounded">o</kbd> - Open line below
                </p>
                <p className="text-xs text-zinc-400 ml-1">
                  Create a new line below the current line and enter insert mode
                </p>
              </div>
              <div>
                <p className="text-sm font-medium">
                  <kbd className="px-2 py-1 bg-zinc-700 rounded">O</kbd> - Open line above
                </p>
                <p className="text-xs text-zinc-400 ml-1">
                  Create a new line above the current line and enter insert mode
                </p>
              </div>
            </div>
            <div className="mt-4 text-xs text-zinc-400">
              <p className="italic">
                Tip: These commands combine movement and insert mode in one keystroke,
                making them very efficient for common editing tasks.
              </p>
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
      className="w-72 h-full bg-zinc-800 p-5 overflow-y-auto scrollbar-thin scrollbar-thumb-zinc-600 scrollbar-track-zinc-800"
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
