import React from 'react'
import { motion } from 'framer-motion'
import { VimMode } from '../../../utils/constants'

interface ModeSwitcherProps {
  currentMode: VimMode
  onModeChange: (mode: VimMode) => void
}

const ModeSwitcher: React.FC<ModeSwitcherProps> = ({
  currentMode,
  onModeChange,
}) => {
  const modes: { mode: VimMode; label: string; color: string }[] = [
    { mode: 'normal', label: 'Normal', color: 'emerald' },
    { mode: 'insert', label: 'Insert', color: 'blue' },
    { mode: 'visual', label: 'Visual', color: 'purple' },
  ]

  const getColorClasses = (color: string, isActive: boolean) => {
    const colorMap: Record<string, { bg: string; border: string; text: string }> = {
      emerald: {
        bg: isActive ? 'bg-emerald-500/20' : 'bg-bg-secondary',
        border: isActive ? 'border-emerald-500' : 'border-border-primary',
        text: isActive ? 'text-emerald-400' : 'text-text-muted',
      },
      blue: {
        bg: isActive ? 'bg-blue-500/20' : 'bg-bg-secondary',
        border: isActive ? 'border-blue-500' : 'border-border-primary',
        text: isActive ? 'text-blue-400' : 'text-text-muted',
      },
      purple: {
        bg: isActive ? 'bg-purple-500/20' : 'bg-bg-secondary',
        border: isActive ? 'border-purple-500' : 'border-border-primary',
        text: isActive ? 'text-purple-400' : 'text-text-muted',
      },
    }
    return colorMap[color] || colorMap.emerald
  }

  return (
    <div className="flex gap-2 p-2 bg-bg-primary/50 rounded-xl border border-border-primary/50 backdrop-blur-sm">
      {modes.map((mode) => {
        const isActive = currentMode === mode.mode
        const colors = getColorClasses(mode.color, isActive)

        return (
          <motion.button
            key={mode.mode}
            onClick={() => onModeChange(mode.mode)}
            className={`
              px-4 py-2 rounded-lg font-medium text-sm
              border-2 transition-colors
              ${colors.bg} ${colors.border} ${colors.text}
            `}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            animate={{
              boxShadow: isActive
                ? `0 0 20px ${getGlowColor(mode.color)}`
                : '0 0 0px rgba(0,0,0,0)',
            }}
            transition={{
              type: 'spring',
              stiffness: 400,
              damping: 25,
            }}
          >
            {mode.label}
          </motion.button>
        )
      })}
    </div>
  )
}

function getGlowColor(color: string): string {
  const colorMap: Record<string, string> = {
    emerald: 'rgba(16, 185, 129, 0.3)',
    blue: 'rgba(59, 130, 246, 0.3)',
    purple: 'rgba(168, 85, 247, 0.3)',
  }
  return colorMap[color] || colorMap.emerald
}

export default ModeSwitcher
