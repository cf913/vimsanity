import React from 'react'
import { motion } from 'framer-motion'
import { ProficiencyLevel } from './types'
import { proficiencyPresets } from './vimCommandsData'

interface ProficiencySelectorProps {
  currentLevel: ProficiencyLevel
  onLevelChange: (level: ProficiencyLevel) => void
}

const ProficiencySelector: React.FC<ProficiencySelectorProps> = ({
  currentLevel,
  onLevelChange,
}) => {
  return (
    <div className="flex flex-col gap-2">
      <label className="text-sm font-medium text-zinc-400">
        Proficiency Level
      </label>
      <div className="flex gap-2 p-2 bg-zinc-900/50 rounded-xl border border-zinc-700/50 backdrop-blur-sm">
        {proficiencyPresets.map((preset) => {
          const isActive = currentLevel === preset.level

          return (
            <motion.button
              key={preset.level}
              onClick={() => onLevelChange(preset.level)}
              className={`
                px-4 py-2 rounded-lg font-medium text-sm
                border-2 transition-colors
                ${
                  isActive
                    ? 'bg-emerald-500/20 border-emerald-500 text-emerald-400'
                    : 'bg-zinc-800 border-zinc-700 text-zinc-400 hover:border-zinc-600'
                }
              `}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              title={preset.description}
            >
              {preset.title}
            </motion.button>
          )
        })}
      </div>
      <p className="text-xs text-zinc-500 mt-1">
        {proficiencyPresets.find((p) => p.level === currentLevel)?.description}
      </p>
    </div>
  )
}

export default ProficiencySelector
