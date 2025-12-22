import React from 'react'
import { motion } from 'framer-motion'

interface Key3DProps {
  keyLabel: string
  displayLabel: string
  shiftLabel?: string
  width?: number
  isPressed: boolean
  isHighlighted: boolean
  glowColor?: string
  isSpecial?: boolean
  onClick?: () => void
}

const Key3D: React.FC<Key3DProps> = ({
  keyLabel,
  displayLabel,
  shiftLabel,
  width = 1,
  isPressed,
  isHighlighted,
  glowColor = 'emerald',
  isSpecial = false,
  onClick,
}) => {
  const colorClasses: Record<string, { glow: string; highlight: string }> = {
    emerald: {
      glow: 'shadow-emerald-500/60',
      highlight: 'bg-emerald-500/20 border-emerald-500/40',
    },
    blue: {
      glow: 'shadow-blue-500/60',
      highlight: 'bg-blue-500/20 border-blue-500/40',
    },
    red: {
      glow: 'shadow-red-500/60',
      highlight: 'bg-red-500/20 border-red-500/40',
    },
    purple: {
      glow: 'shadow-purple-500/60',
      highlight: 'bg-purple-500/20 border-purple-500/40',
    },
    amber: {
      glow: 'shadow-amber-500/60',
      highlight: 'bg-amber-500/20 border-amber-500/40',
    },
  }

  const colors = colorClasses[glowColor] || colorClasses.emerald

  return (
    <motion.div
      className="relative w-full h-full"
      initial={false}
      animate={{
        scale: isPressed ? 0.95 : 1,
        translateZ: isPressed ? -4 : 0,
      }}
      transition={{
        type: 'spring',
        stiffness: 500,
        damping: 30,
      }}
    >
      <motion.button
        onClick={onClick}
        className={`
          relative w-full h-12 rounded-lg font-mono text-sm
          border border-border-secondary/50
          transition-all duration-200
          ${isSpecial ? 'text-text-muted text-xs' : 'text-text-primary'}
          ${isHighlighted && !isPressed ? colors.highlight : 'bg-gradient-to-b from-bg-tertiary to-bg-secondary'}
        `}
        style={{
          transformStyle: 'preserve-3d',
          boxShadow: isPressed
            ? `
                0 2px 4px rgba(0, 0, 0, 0.4),
                0 1px 2px rgba(0, 0, 0, 0.3),
                inset 0 2px 4px rgba(0, 0, 0, 0.3)
              `
            : isHighlighted
              ? `
                  0 4px 8px rgba(0, 0, 0, 0.3),
                  0 2px 4px rgba(0, 0, 0, 0.2),
                  0 0 20px ${getGlowColor(glowColor, 0.3)},
                  inset 0 1px 0 rgba(255, 255, 255, 0.1)
                `
              : `
                  0 4px 8px rgba(0, 0, 0, 0.3),
                  0 2px 4px rgba(0, 0, 0, 0.2),
                  inset 0 1px 0 rgba(255, 255, 255, 0.1)
                `,
        }}
        animate={{
          boxShadow: isPressed
            ? [
                `0 2px 4px rgba(0, 0, 0, 0.4), 0 1px 2px rgba(0, 0, 0, 0.3), inset 0 2px 4px rgba(0, 0, 0, 0.3)`,
              ]
            : isHighlighted
              ? [
                  `0 4px 8px rgba(0, 0, 0, 0.3), 0 2px 4px rgba(0, 0, 0, 0.2), 0 0 20px ${getGlowColor(glowColor, 0.3)}, inset 0 1px 0 rgba(255, 255, 255, 0.1)`,
                  `0 4px 8px rgba(0, 0, 0, 0.3), 0 2px 4px rgba(0, 0, 0, 0.2), 0 0 30px ${getGlowColor(glowColor, 0.5)}, inset 0 1px 0 rgba(255, 255, 255, 0.1)`,
                  `0 4px 8px rgba(0, 0, 0, 0.3), 0 2px 4px rgba(0, 0, 0, 0.2), 0 0 20px ${getGlowColor(glowColor, 0.3)}, inset 0 1px 0 rgba(255, 255, 255, 0.1)`,
                ]
              : [
                  `0 4px 8px rgba(0, 0, 0, 0.3), 0 2px 4px rgba(0, 0, 0, 0.2), inset 0 1px 0 rgba(255, 255, 255, 0.1)`,
                ],
        }}
        transition={{
          boxShadow: {
            duration: isHighlighted ? 2 : 0.2,
            repeat: isHighlighted ? Infinity : 0,
            ease: 'easeInOut',
          },
        }}
      >
        {shiftLabel ? (
          // Key with shift character - show both
          <div className="flex flex-col items-center justify-center h-full px-1">
            <span className="select-none text-[10px] leading-none text-text-muted">{shiftLabel}</span>
            <span className="select-none text-sm leading-none mt-0.5">{displayLabel || keyLabel}</span>
          </div>
        ) : (
          // Regular key - show single character
          <div className="flex items-center justify-center h-full">
            <span className="select-none">{displayLabel || keyLabel}</span>
          </div>
        )}

        {/* Pressed flash effect - color pulse */}
        {isPressed && (
          <>
            {/* Background color flash */}
            <motion.div
              className="absolute inset-0 rounded-lg"
              initial={{ opacity: 0 }}
              animate={{
                opacity: [0, 0.6, 0],
                scale: [1, 1.02, 1],
              }}
              transition={{
                duration: 0.4,
                ease: 'easeOut',
                times: [0, 0.2, 1],
              }}
              style={{
                backgroundColor: getGlowColor(glowColor, 1),
              }}
            />
            {/* Outer glow ring */}
            <motion.div
              className="absolute inset-0 rounded-lg"
              initial={{ opacity: 0, scale: 1 }}
              animate={{
                opacity: [0, 1, 0],
                scale: [1, 1.15, 1.3],
              }}
              transition={{ duration: 0.5, ease: 'easeOut' }}
              style={{
                boxShadow: `0 0 30px ${getGlowColor(glowColor, 0.9)}, 0 0 60px ${getGlowColor(glowColor, 0.5)}`,
              }}
            />
          </>
        )}
      </motion.button>
    </motion.div>
  )
}

// Helper function to get glow color with opacity
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

export default Key3D
