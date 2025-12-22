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
      <label className="text-sm font-medium text-text-muted">
        Proficiency Level
      </label>
      <div className="flex gap-2 p-2 bg-bg-primary/50 rounded-xl border border-border-primary/50 backdrop-blur-sm">
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
                    : 'bg-bg-secondary border-border-primary text-text-muted hover:border-border-secondary'
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
      <p className="text-xs text-text-subtle mt-1">
        {proficiencyPresets.find((p) => p.level === currentLevel)?.description}
      </p>
    </div>
  )
}

export default ProficiencySelector
