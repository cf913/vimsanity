import React, { useState, useEffect, useCallback } from 'react'
import { VimMode, VIM_MODES } from '../../utils/constants'
import { ProficiencyLevel, VimCommand } from './Level13/types'
import Keyboard3D from './Level13/Keyboard3D'
import ModeSwitcher from './Level13/ModeSwitcher'
import ProficiencySelector from './Level13/ProficiencySelector'
import CommandInfoPopup from './Level13/CommandInfoPopup'
import { getCommandForKey, proficiencyPresets } from './Level13/vimCommandsData'
import { normalizeKeyName } from './Level13/keyboardLayout'

interface KeyboardVisualizerLevel13Props {
  isMuted?: boolean
}

const KeyboardVisualizerLevel13: React.FC<
  KeyboardVisualizerLevel13Props
> = () => {
  const [currentMode, setCurrentMode] = useState<VimMode>(VIM_MODES.NORMAL)
  const [proficiencyLevel, setProficiencyLevel] =
    useState<ProficiencyLevel>('beginner')
  const [pressedKeys, setPressedKeys] = useState<Set<string>>(new Set())
  const [selectedCommand, setSelectedCommand] = useState<VimCommand | null>(
    null,
  )

  // Get highlighted keys based on proficiency level
  const highlightedKeys = React.useMemo(() => {
    const preset = proficiencyPresets.find((p) => p.level === proficiencyLevel)
    return new Set(preset?.highlightedKeys || [])
  }, [proficiencyLevel])

  // Handle keyboard events
  const handleKeyDown = useCallback(
    (e: KeyboardEvent) => {
      // If ESC is pressed and popup is open, close it and don't process further
      if (e.key === 'Escape' && selectedCommand) {
        e.preventDefault()
        setSelectedCommand(null)
        return
      }

      // Prevent default for vim keys
      const vimKeys = [
        'h',
        'j',
        'k',
        'l',
        'w',
        'b',
        'e',
        'i',
        'a',
        'o',
        'x',
        'd',
        'c',
        'u',
        '/',
        '?',
        'n',
      ]
      if (vimKeys.includes(e.key.toLowerCase())) {
        e.preventDefault()
      }

      const normalizedKey = normalizeKeyName(e.key)
      setPressedKeys((prev) => new Set(prev).add(normalizedKey))

      // Look up command for this key in current mode
      const command = getCommandForKey(normalizedKey, currentMode)
      if (command) {
        setSelectedCommand(command)
      }
    },
    [currentMode, selectedCommand],
  )

  const handleKeyUp = useCallback((e: KeyboardEvent) => {
    const normalizedKey = normalizeKeyName(e.key)
    setPressedKeys((prev) => {
      const newSet = new Set(prev)
      newSet.delete(normalizedKey)
      return newSet
    })
  }, [])

  // Setup keyboard listeners
  useEffect(() => {
    window.addEventListener('keydown', handleKeyDown)
    window.addEventListener('keyup', handleKeyUp)

    return () => {
      window.removeEventListener('keydown', handleKeyDown)
      window.removeEventListener('keyup', handleKeyUp)
    }
  }, [handleKeyDown, handleKeyUp])

  // Get color for a key based on the command category
  const getKeyColor = useCallback(
    (key: string): string => {
      const command = getCommandForKey(key, currentMode)
      return command?.colorClass || 'emerald'
    },
    [currentMode],
  )

  return (
    <div className="min-h-screen w-full flex flex-col items-center relative overflow-hidden">
      {/* Background gradient */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background: `
            radial-gradient(
              ellipse 80% 50% at 50% 50%,
              rgba(16, 185, 129, 0.08),
              transparent
            )
          `,
        }}
      />

      {/* Header */}
      <div className="w-full max-w-6xl mx-auto px-8 pt-8 pb-4 relative z-10">
        <div className="text-center mb-6">
          <h2 className="text-4xl font-bold mb-3 bg-gradient-to-r from-emerald-400 to-emerald-600 bg-clip-text text-transparent">
            Vim Command Explorer
          </h2>
          <p className="text-zinc-400 text-lg">
            Press any key to discover what it does in Vim
          </p>
        </div>

        {/* Controls */}
        <div className="flex justify-between items-start gap-4 mb-8">
          {/* <ModeSwitcher */}
          {/*   currentMode={currentMode} */}
          {/*   onModeChange={setCurrentMode} */}
          {/* /> */}
          <ProficiencySelector
            currentLevel={proficiencyLevel}
            onLevelChange={setProficiencyLevel}
          />
        </div>

        {/* Info text */}
        <div className="bg-zinc-900/50 rounded-xl border border-zinc-700/50 p-4 mb-8 backdrop-blur-sm">
          <div className="grid md:grid-cols-2 gap-4 text-sm">
            <div>
              <span className="text-emerald-400 font-semibold">
                💡 How it works:
              </span>
              <p className="text-zinc-400 mt-1">
                Press any key on your keyboard to see what it does in the
                selected Vim mode. Highlighted keys show commands available at
                your proficiency level.
              </p>
            </div>
            <div>
              <span className="text-blue-400 font-semibold">
                🎯 Current mode:
              </span>
              <p className="text-zinc-400 mt-1">
                {currentMode.toUpperCase()} - Switch modes above to see
                different command sets
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Keyboard */}
      <div className="w-full max-w-6xl mx-auto relative z-10">
        <Keyboard3D
          pressedKeys={pressedKeys}
          highlightedKeys={highlightedKeys}
          onKeyClick={(key) => {
            const command = getCommandForKey(key, currentMode)
            if (command) {
              setSelectedCommand(command)
            }
          }}
          getKeyColor={getKeyColor}
        />
      </div>

      {/* Command Info Popup */}
      <CommandInfoPopup
        command={selectedCommand}
        onClose={() => setSelectedCommand(null)}
      />

      {/* Legend */}
      <div className="w-full max-w-6xl mx-auto px-8 py-8 relative z-10">
        <div className="bg-zinc-900/50 rounded-xl border border-zinc-700/50 p-4 backdrop-blur-sm">
          <h3 className="text-sm font-semibold text-zinc-400 mb-3">
            Color Legend:
          </h3>
          <div className="grid grid-cols-2 md:grid-cols-5 gap-3 text-xs">
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 rounded bg-emerald-500/30 border border-emerald-500"></div>
              <span className="text-zinc-400">Movement</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 rounded bg-blue-500/30 border border-blue-500"></div>
              <span className="text-zinc-400">Mode Change</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 rounded bg-red-500/30 border border-red-500"></div>
              <span className="text-zinc-400">Delete/Edit</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 rounded bg-purple-500/30 border border-purple-500"></div>
              <span className="text-zinc-400">Search</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 rounded bg-amber-500/30 border border-amber-500"></div>
              <span className="text-zinc-400">History</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default KeyboardVisualizerLevel13
