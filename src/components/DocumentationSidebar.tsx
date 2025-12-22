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
                  <kbd className="px-1 bg-bg-tertiary rounded">h j k l</kbd> -
                  Basic movement
                </li>
                <li>
                  <kbd className="px-1 bg-bg-tertiary rounded">w b e</kbd> - Word
                  movement
                </li>
                <li>
                  <kbd className="px-1 bg-bg-tertiary rounded">0 $</kbd> - Line
                  operations
                </li>
                <li>
                  <kbd className="px-1 bg-bg-tertiary rounded">f t</kbd> - Find
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
                  <kbd className="px-2 py-1 bg-bg-tertiary rounded">h</kbd> - Move
                  left
                </p>
                <p className="text-xs text-text-muted ml-1">
                  Like the left arrow key
                </p>
              </div>
              <div>
                <p className="text-sm font-medium">
                  <kbd className="px-2 py-1 bg-bg-tertiary rounded">j</kbd> - Move
                  down
                </p>
                <p className="text-xs text-text-muted ml-1">
                  Like the down arrow key
                </p>
              </div>
              <div>
                <p className="text-sm font-medium">
                  <kbd className="px-2 py-1 bg-bg-tertiary rounded">k</kbd> - Move
                  up
                </p>
                <p className="text-xs text-text-muted ml-1">
                  Like the up arrow key
                </p>
              </div>
              <div>
                <p className="text-sm font-medium">
                  <kbd className="px-2 py-1 bg-bg-tertiary rounded">l</kbd> - Move
                  right
                </p>
                <p className="text-xs text-text-muted ml-1">
                  Like the right arrow key
                </p>
              </div>
            </div>
            <div className="mt-4 text-xs text-text-muted">
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
                  <kbd className="px-2 py-1 bg-bg-tertiary rounded">w</kbd> - Move
                  to next word start
                </p>
                <p className="text-xs text-text-muted ml-1">
                  Jump to the beginning of the next word
                </p>
                <p className="text-xs text-text-muted ml-1">W as in "Word"</p>
              </div>
              <div>
                <p className="text-sm font-medium">
                  <kbd className="px-2 py-1 bg-bg-tertiary rounded">b</kbd> - Move
                  to previous word start
                </p>
                <p className="text-xs text-text-muted ml-1">
                  B as in "Back" or "Beginning"
                </p>
              </div>
              <div>
                <p className="text-sm font-medium">
                  <kbd className="px-2 py-1 bg-bg-tertiary rounded">e</kbd> - Move
                  to word end
                </p>
                <p className="text-xs text-text-muted ml-1">
                  Jump to the end of the current word
                </p>
                <p className="text-xs text-text-muted ml-1">E as in "End"</p>
              </div>
            </div>
            <div className="mt-4 text-xs text-text-muted">
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
                  <kbd className="px-2 py-1 bg-bg-tertiary rounded">0</kbd> - Move
                  to start of line
                </p>
                <p className="text-xs text-text-muted ml-1">
                  Jump to the first character of the line
                </p>
              </div>
              <div>
                <p className="text-sm font-medium">
                  <kbd className="px-2 py-1 bg-bg-tertiary rounded">_</kbd> - Move
                  to the first non-blank character
                </p>
                <p className="text-xs text-text-muted ml-1">
                  Useful for skipping leading whitespace/indentation
                </p>
              </div>
              <div>
                <p className="text-sm font-medium">
                  <kbd className="px-2 py-1 bg-bg-tertiary rounded">$</kbd> - Move
                  to end of line
                </p>
                <p className="text-xs text-text-muted ml-1">
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
                  <kbd className="px-2 py-1 bg-bg-tertiary rounded">f + char</kbd>{' '}
                  - Find character forward
                </p>
                <p className="text-xs text-text-muted ml-1">
                  Move to the next occurrence of {'{char}'} on the current line
                </p>
              </div>
              <div>
                <p className="text-sm font-medium">
                  <kbd className="px-2 py-1 bg-bg-tertiary rounded">F + char</kbd>{' '}
                  - Find character backward
                </p>
                <p className="text-xs text-text-muted ml-1">
                  Move to the previous occurrence of {'{char}'} on the current
                  line
                </p>
              </div>
              <div>
                <p className="text-sm font-medium">
                  <kbd className="px-2 py-1 bg-bg-tertiary rounded">t + char</kbd>{' '}
                  - Till character forward
                </p>
                <p className="text-xs text-text-muted ml-1">
                  Move to just before the next occurrence of {'{char}'} on the
                  current line
                </p>
              </div>
              <div>
                <p className="text-sm font-medium">
                  <kbd className="px-2 py-1 bg-bg-tertiary rounded">T + char</kbd>{' '}
                  - Till character backward
                </p>
                <p className="text-xs text-text-muted ml-1">
                  Move to just after the previous occurrence of {'{char}'} on
                  the current line
                </p>
              </div>
              <div>
                <p className="text-sm font-medium">
                  <kbd className="px-2 py-1 bg-bg-tertiary rounded">j</kbd> - Move
                  down
                </p>
                <p className="text-xs text-text-muted ml-1">Move down one line</p>
              </div>
              <div>
                <p className="text-sm font-medium">
                  <kbd className="px-2 py-1 bg-bg-tertiary rounded">k</kbd> - Move
                  up
                </p>
                <p className="text-xs text-text-muted ml-1">Move up one line</p>
              </div>
            </div>
            <div className="mt-4 text-xs text-text-muted">
              <p className="italic">
                Tip: After pressing 'f', 'F', 't', or 'T', you need to type the
                character you want to find. The cursor will move to (or just
                before/after) the next or previous occurrence of that character
                depending on the command used.
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
                  <kbd className="px-2 py-1 bg-bg-tertiary rounded">/</kbd> -
                  Search forward
                </p>
                <p className="text-xs text-text-muted ml-1">
                  Search for a pattern going forward from your current position
                </p>
                <p className="text-xs text-text-muted ml-1">
                  Type your search pattern and press Enter to confirm
                </p>
              </div>
              <div>
                <p className="text-sm font-medium">
                  <kbd className="px-2 py-1 bg-bg-tertiary rounded">?</kbd> -
                  Search backward
                </p>
                <p className="text-xs text-text-muted ml-1">
                  Search for a pattern going backward from your current position
                </p>
                <p className="text-xs text-text-muted ml-1">
                  Type your search pattern and press Enter to confirm
                </p>
              </div>
              <div>
                <p className="text-sm font-medium">
                  <kbd className="px-2 py-1 bg-bg-tertiary rounded">n</kbd> - Next
                  match
                </p>
                <p className="text-xs text-text-muted ml-1">
                  Jump to the next occurrence of your search pattern
                </p>
                <p className="text-xs text-text-muted ml-1">
                  Continues in the direction of your original search
                </p>
              </div>
              <div>
                <p className="text-sm font-medium">
                  <kbd className="px-2 py-1 bg-bg-tertiary rounded">N</kbd> -
                  Previous match
                </p>
                <p className="text-xs text-text-muted ml-1">
                  Jump to the previous occurrence of your search pattern
                </p>
                <p className="text-xs text-text-muted ml-1">
                  Moves opposite to the direction of your original search
                </p>
              </div>
            </div>
            <div className="mt-4 text-xs text-text-muted">
              <p className="italic">
                Tip: Search is one of Vim's most powerful navigation tools. You
                can use it to quickly jump to specific words, variables, or
                patterns in your text.
              </p>
            </div>
          </>
        )
      case 6:
        return (
          <>
            <h3 className="text-lg font-semibold mb-2">Basic Insert Mode</h3>
            <p className="text-sm mb-3">
              Insert mode allows you to add and edit text in Vim. These commands
              enter insert mode:
            </p>
            <div className="space-y-3">
              <div>
                <p className="text-sm font-medium">
                  <kbd className="px-2 py-1 bg-bg-tertiary rounded">i</kbd> -
                  Insert before cursor
                </p>
                <p className="text-xs text-text-muted ml-1">
                  Begin inserting text at the current cursor position
                </p>
              </div>
              <div>
                <p className="text-sm font-medium">
                  <kbd className="px-2 py-1 bg-bg-tertiary rounded">a</kbd> -
                  Append after cursor
                </p>
                <p className="text-xs text-text-muted ml-1">
                  Begin inserting text after the current cursor position
                </p>
              </div>
              <div>
                <p className="text-sm font-medium">
                  <kbd className="px-2 py-1 bg-bg-tertiary rounded">Escape</kbd> -
                  Exit insert mode
                </p>
                <p className="text-xs text-text-muted ml-1">
                  Return to normal mode after making text changes
                </p>
              </div>
            </div>
            <div className="mt-4 text-xs text-text-muted">
              <p className="italic">
                Tip: Always remember to press Escape to return to normal mode
                after making changes. This is one of the most common mistakes
                for new Vim users!
              </p>
            </div>
          </>
        )
      case 7:
        return (
          <>
            <h3 className="text-lg font-semibold mb-2">Line Insert Commands</h3>
            <p className="text-sm mb-3">
              These commands let you insert text at specific line positions or
              create new lines:
            </p>
            <div className="space-y-3">
              <div>
                <p className="text-sm font-medium">
                  <kbd className="px-2 py-1 bg-bg-tertiary rounded">I</kbd> -
                  Insert at line beginning
                </p>
                <p className="text-xs text-text-muted ml-1">
                  Move to the start of the line and enter insert mode
                </p>
              </div>
              <div>
                <p className="text-sm font-medium">
                  <kbd className="px-2 py-1 bg-bg-tertiary rounded">A</kbd> -
                  Append at line end
                </p>
                <p className="text-xs text-text-muted ml-1">
                  Move to the end of the line and enter insert mode
                </p>
              </div>
              <div>
                <p className="text-sm font-medium">
                  <kbd className="px-2 py-1 bg-bg-tertiary rounded">o</kbd> - Open
                  line below
                </p>
                <p className="text-xs text-text-muted ml-1">
                  Create a new line below the current line and enter insert mode
                </p>
              </div>
              <div>
                <p className="text-sm font-medium">
                  <kbd className="px-2 py-1 bg-bg-tertiary rounded">O</kbd> - Open
                  line above
                </p>
                <p className="text-xs text-text-muted ml-1">
                  Create a new line above the current line and enter insert mode
                </p>
              </div>
            </div>
            <div className="mt-4 text-xs text-text-muted">
              <p className="italic">
                Tip: These commands combine movement and insert mode in one
                keystroke, making them very efficient for common editing tasks.
              </p>
            </div>
          </>
        )
      case 9:
        return (
          <>
            <h3 className="text-lg font-semibold mb-2">Undo and Redo</h3>
            <p className="text-sm mb-3">
              Navigate through your editing history to undo mistakes and redo
              changes:
            </p>
            <div className="space-y-3">
              <div>
                <p className="text-sm font-medium">
                  <kbd className="px-2 py-1 bg-bg-tertiary rounded">u</kbd> - Undo
                  last change
                </p>
                <p className="text-xs text-text-muted ml-1">
                  Reverses the most recent edit operation
                </p>
                <p className="text-xs text-text-muted ml-1">
                  Can be used multiple times to undo several changes
                </p>
              </div>
              <div>
                <p className="text-sm font-medium">
                  <kbd className="px-2 py-1 bg-bg-tertiary rounded">Ctrl+r</kbd> -
                  Redo change
                </p>
                <p className="text-xs text-text-muted ml-1">
                  Restores a change that was previously undone
                </p>
                <p className="text-xs text-text-muted ml-1">
                  Only works after using undo (u)
                </p>
              </div>
            </div>
            <div className="mt-4 space-y-2">
              <div className="text-xs text-text-muted">
                <p className="font-medium text-text-secondary mb-1">
                  How Vim History Works:
                </p>
                <ul className="space-y-1 pl-2">
                  <li>• Each edit creates a new point in history</li>
                  <li>• Insert mode sessions count as one edit</li>
                  <li>• Individual deletions (x) are separate edits</li>
                  <li>• You can undo/redo through multiple changes</li>
                </ul>
              </div>
              <div className="text-xs text-text-muted">
                <p className="italic">
                  Tip: Think of undo/redo as time travel through your editing
                  session. You can safely experiment knowing you can always go
                  back!
                </p>
              </div>
            </div>
          </>
        )
      case 10:
        return (
          <>
            <h3 className="text-lg font-semibold mb-2">
              Basic Delete Operations
            </h3>
            <p className="text-sm mb-3">
              Master the essential single-key delete commands in Vim:
            </p>
            <div className="space-y-3">
              <div>
                <p className="text-sm font-medium">
                  <kbd className="px-2 py-1 bg-bg-tertiary rounded">x</kbd> -
                  Delete character
                </p>
                <p className="text-xs text-text-muted ml-1">
                  Delete the character under the cursor
                </p>
                <p className="text-xs text-text-muted ml-1">
                  Most basic deletion command
                </p>
              </div>
              <div>
                <p className="text-sm font-medium">
                  <kbd className="px-2 py-1 bg-bg-tertiary rounded">D</kbd> -
                  Delete to end of line
                </p>
                <p className="text-xs text-text-muted ml-1">
                  Delete from cursor position to end of line
                </p>
                <p className="text-xs text-text-muted ml-1">
                  Equivalent to d$ but faster to type
                </p>
              </div>
              <div>
                <p className="text-sm font-medium">
                  <kbd className="px-2 py-1 bg-bg-tertiary rounded">C</kbd> -
                  Change to end of line
                </p>
                <p className="text-xs text-text-muted ml-1">
                  Delete from cursor position to end of line and enter INSERT
                  mode
                </p>
                <p className="text-xs text-text-muted ml-1">
                  Combines deletion with immediate editing
                </p>
              </div>
              <div>
                <p className="text-sm font-medium">
                  <kbd className="px-2 py-1 bg-bg-tertiary rounded">S</kbd> -
                  Substitute line
                </p>
                <p className="text-xs text-text-muted ml-1">
                  Delete entire line and enter insert mode
                </p>
                <p className="text-xs text-text-muted ml-1">
                  Like x followed by i, but in one command
                </p>
              </div>
            </div>
            <div className="mt-4 space-y-2 border-t border-border-primary pt-4 ">
              <p className="text-sm mb-3">Command variants:</p>
              <div>
                <p className="text-sm font-medium">
                  <kbd className="px-2 py-1 bg-bg-tertiary rounded">X</kbd> -
                  Delete character
                </p>
                <p className="text-xs text-text-muted ml-1">
                  Delete the character before the cursor
                </p>
              </div>
              <div>
                <p className="text-sm font-medium">
                  <kbd className="px-2 py-1 bg-bg-tertiary rounded">s</kbd> -
                  Substitute char
                </p>
                <p className="text-xs text-text-muted ml-1">
                  Delete char under cursor and enter insert mode
                </p>
                <p className="text-xs text-text-muted ml-1">
                  Like x followed by i, but in one command
                </p>
              </div>
            </div>
            <div className="mt-4 space-y-2">
              <div className="text-xs text-text-muted">
                <p className="font-medium text-text-secondary mb-1">Command Types:</p>
                <ul className="space-y-1 pl-2">
                  <li>
                    • <strong>Delete:</strong> x, D (remove text)
                  </li>
                  <li>
                    • <strong>Change:</strong> C, S (delete + insert mode)
                  </li>
                  <li>
                    • <strong>Single key:</strong> Fast and efficient
                  </li>
                </ul>
              </div>
              <div className="text-xs text-text-muted">
                <p className="italic">
                  Tip: These single-key commands are the foundation of Vim
                  editing. Master them for lightning-fast text manipulation!
                </p>
              </div>
            </div>
          </>
        )
      case 11:
        return (
          <>
            <h3 className="text-lg font-semibold mb-2">
              Advanced Delete Operations
            </h3>
            <p className="text-sm mb-3">
              Master combined delete commands for efficient text removal:
            </p>
            <div className="space-y-3">
              <div>
                <p className="text-sm font-medium">
                  <kbd className="px-2 py-1 bg-bg-tertiary rounded">dw</kbd> -
                  Delete word
                </p>
                <p className="text-xs text-text-muted ml-1">
                  Delete from cursor to the end of the current word
                </p>
                <p className="text-xs text-text-muted ml-1">
                  Includes trailing space after the word
                </p>
              </div>
              <div>
                <p className="text-sm font-medium">
                  <kbd className="px-2 py-1 bg-bg-tertiary rounded">dd</kbd> -
                  Delete entire line
                </p>
                <p className="text-xs text-text-muted ml-1">
                  Delete the entire current line
                </p>
                <p className="text-xs text-text-muted ml-1">
                  Most common line deletion command
                </p>
              </div>
              <div>
                <p className="text-sm font-medium">
                  <kbd className="px-2 py-1 bg-bg-tertiary rounded">D</kbd> -
                  Delete to end of line
                </p>
                <p className="text-xs text-text-muted ml-1">
                  Delete from cursor position to end of line
                </p>
                <p className="text-xs text-text-muted ml-1">
                  Same as the single-key D command from Level 10
                </p>
              </div>
              <div>
                <p className="text-sm font-medium">
                  <kbd className="px-2 py-1 bg-bg-tertiary rounded">dh</kbd> -
                  Delete character left
                </p>
                <p className="text-xs text-text-muted ml-1">
                  Delete the character to the left of cursor
                </p>
                <p className="text-xs text-text-muted ml-1">
                  Like pressing backspace
                </p>
              </div>
              <div>
                <p className="text-sm font-medium">
                  <kbd className="px-2 py-1 bg-bg-tertiary rounded">dl</kbd> -
                  Delete character under cursor
                </p>
                <p className="text-xs text-text-muted ml-1">
                  Delete the character under the cursor
                </p>
                <p className="text-xs text-text-muted ml-1">
                  Same as x command
                </p>
              </div>
              <div>
                <p className="text-sm font-medium">
                  <kbd className="px-2 py-1 bg-bg-tertiary rounded">u</kbd> -
                  Undo
                </p>
                <p className="text-xs text-text-muted ml-1">
                  Undo the last delete operation
                </p>
                <p className="text-xs text-text-muted ml-1">
                  Essential for correcting mistakes
                </p>
              </div>
            </div>
            <div className="mt-4 space-y-2">
              <div className="text-xs text-text-muted">
                <p className="font-medium text-text-secondary mb-1">Delete Command Pattern:</p>
                <ul className="space-y-1 pl-2">
                  <li>
                    • <strong>d</strong> = delete operator
                  </li>
                  <li>
                    • <strong>w</strong> = word motion (dw = delete word)
                  </li>
                  <li>
                    • <strong>h, l</strong> = character motions (dh, dl = delete chars)
                  </li>
                  <li>
                    • <strong>dd</strong> = delete operator applied to line
                  </li>
                  <li>
                    • <strong>D</strong> = shortcut for delete to end of line
                  </li>
                </ul>
              </div>
              <div className="text-xs text-text-muted">
                <p className="italic">
                  Tip: These commands combine the delete operator (d) with motions to create powerful deletion commands. Master these for efficient text editing!
                </p>
              </div>
            </div>
          </>
        )
      case 14:
        return (
          <>
            <h3 className="text-lg font-semibold mb-2">
              Text Objects
            </h3>
            <p className="text-sm mb-3">
              Text objects let you operate on semantic units like words, regardless of cursor position:
            </p>
            <div className="space-y-3">
              <div>
                <p className="text-sm font-medium">
                  <kbd className="px-2 py-1 bg-bg-tertiary rounded">diw</kbd> -
                  Delete inner word
                </p>
                <p className="text-xs text-text-muted ml-1">
                  Delete the word under cursor (not surrounding spaces)
                </p>
                <p className="text-xs text-text-muted ml-1">
                  Works from anywhere within the word
                </p>
              </div>
              <div>
                <p className="text-sm font-medium">
                  <kbd className="px-2 py-1 bg-bg-tertiary rounded">daw</kbd> -
                  Delete around word
                </p>
                <p className="text-xs text-text-muted ml-1">
                  Delete word AND surrounding whitespace
                </p>
                <p className="text-xs text-text-muted ml-1">
                  Cleaner deletion - no leftover spaces
                </p>
              </div>
              <div>
                <p className="text-sm font-medium">
                  <kbd className="px-2 py-1 bg-bg-tertiary rounded">ciw</kbd> -
                  Change inner word
                </p>
                <p className="text-xs text-text-muted ml-1">
                  Delete word and enter insert mode
                </p>
                <p className="text-xs text-text-muted ml-1">
                  Perfect for replacing a word
                </p>
              </div>
              <div>
                <p className="text-sm font-medium">
                  <kbd className="px-2 py-1 bg-bg-tertiary rounded">caw</kbd> -
                  Change around word
                </p>
                <p className="text-xs text-text-muted ml-1">
                  Delete word + whitespace, enter insert mode
                </p>
              </div>
            </div>
            <div className="mt-4 space-y-2">
              <div className="text-xs text-text-muted">
                <p className="font-medium text-text-secondary mb-1">Text Object Pattern:</p>
                <ul className="space-y-1 pl-2">
                  <li>
                    • <strong>operator</strong> + <strong>i/a</strong> + <strong>object</strong>
                  </li>
                  <li>
                    • <strong>i</strong> = "inner" (just the object)
                  </li>
                  <li>
                    • <strong>a</strong> = "around" (object + surroundings)
                  </li>
                  <li>
                    • <strong>w</strong> = word object
                  </li>
                </ul>
              </div>
              <div className="text-xs text-text-muted">
                <p className="font-medium text-text-secondary mb-1">Why Text Objects?</p>
                <ul className="space-y-1 pl-2">
                  <li>
                    • No need to position cursor at word start
                  </li>
                  <li>
                    • <strong>dw</strong> requires cursor at start
                  </li>
                  <li>
                    • <strong>diw</strong> works from anywhere in word
                  </li>
                </ul>
              </div>
              <div className="text-xs text-text-muted mt-2">
                <p className="italic">
                  Tip: Text objects are one of Vim's superpowers. Once learned, you'll use ciw and diw constantly!
                </p>
              </div>
            </div>
          </>
        )
      case 15:
        return (
          <>
            <h3 className="text-lg font-semibold mb-2">
              Yank & Put (Copy & Paste)
            </h3>
            <p className="text-sm mb-3">
              Vim's copy and paste system uses "yank" (copy) and "put" (paste):
            </p>
            <div className="space-y-3">
              <div>
                <p className="text-sm font-medium">
                  <kbd className="px-2 py-1 bg-bg-tertiary rounded">yy</kbd> -
                  Yank entire line
                </p>
                <p className="text-xs text-text-muted ml-1">
                  Copy the entire current line to the clipboard
                </p>
                <p className="text-xs text-text-muted ml-1">
                  Most common yank command
                </p>
              </div>
              <div>
                <p className="text-sm font-medium">
                  <kbd className="px-2 py-1 bg-bg-tertiary rounded">yw</kbd> -
                  Yank word
                </p>
                <p className="text-xs text-text-muted ml-1">
                  Copy from cursor to end of current word
                </p>
                <p className="text-xs text-text-muted ml-1">
                  Position cursor at word start for best results
                </p>
              </div>
              <div>
                <p className="text-sm font-medium">
                  <kbd className="px-2 py-1 bg-bg-tertiary rounded">p</kbd> -
                  Put (paste) after
                </p>
                <p className="text-xs text-text-muted ml-1">
                  Paste yanked text at cursor position
                </p>
                <p className="text-xs text-text-muted ml-1">
                  For lines: pastes on the line below
                </p>
              </div>
              <div>
                <p className="text-sm font-medium">
                  <kbd className="px-2 py-1 bg-bg-tertiary rounded">P</kbd> -
                  Put (paste) before
                </p>
                <p className="text-xs text-text-muted ml-1">
                  Paste yanked text before cursor position
                </p>
                <p className="text-xs text-text-muted ml-1">
                  For lines: pastes on the current line
                </p>
              </div>
            </div>
            <div className="mt-4 space-y-2">
              <div className="text-xs text-text-muted">
                <p className="font-medium text-text-secondary mb-1">Yank vs Delete:</p>
                <ul className="space-y-1 pl-2">
                  <li>
                    • <strong>y</strong> (yank) = copy text, leave original
                  </li>
                  <li>
                    • <strong>d</strong> (delete) = cut text, remove original
                  </li>
                  <li>
                    • Both save to clipboard for pasting with p/P
                  </li>
                </ul>
              </div>
              <div className="text-xs text-text-muted">
                <p className="font-medium text-text-secondary mb-1">Common Patterns:</p>
                <ul className="space-y-1 pl-2">
                  <li>
                    • <strong>yy → p</strong> = duplicate a line below
                  </li>
                  <li>
                    • <strong>yw → p</strong> = copy and paste a word
                  </li>
                  <li>
                    • <strong>yy → jjj → p</strong> = copy line, move, paste
                  </li>
                </ul>
              </div>
              <div className="text-xs text-text-muted mt-2">
                <p className="italic">
                  Tip: Unlike most editors, Vim's delete commands also copy to the clipboard. So dd followed by p effectively "moves" a line!
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
      className="w-72 h-full bg-bg-secondary p-5 overflow-y-auto scrollbar-thin scrollbar-thumb-bg-hover scrollbar-track-bg-secondary"
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
          className="p-2 hover:bg-bg-tertiary rounded-lg transition-colors"
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
        className="mt-8 pt-4 border-t border-border-primary"
        variants={itemVariants}
      >
        <a
          href="https://vimhelp.org/"
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center gap-2 px-3 py-2 w-full rounded-lg hover:bg-bg-tertiary/70 transition-colors text-sm text-text-secondary"
        >
          Official Vim Documentation
          <ExternalLink size={14} className="text-emerald-400" />
        </a>
      </motion.div>
    </motion.div>
  )
}

export default DocumentationSidebar
