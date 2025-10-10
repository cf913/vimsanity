import React from 'react'
import { motion } from 'framer-motion'
import Key3D from './Key3D'
import { keyboardLayout } from './keyboardLayout'

interface Keyboard3DProps {
  pressedKeys: Set<string>
  highlightedKeys: Set<string>
  onKeyClick?: (key: string) => void
  getKeyColor?: (key: string) => string
}

const Keyboard3D: React.FC<Keyboard3DProps> = ({
  pressedKeys,
  highlightedKeys,
  onKeyClick,
  getKeyColor,
}) => {
  // Group keys by row for layout
  const keysByRow = keyboardLayout.reduce(
    (acc, key) => {
      if (!acc[key.row]) {
        acc[key.row] = []
      }
      acc[key.row].push(key)
      return acc
    },
    {} as Record<number, typeof keyboardLayout>
  )

  return (
    <div
      className="flex items-center justify-center w-full py-12"
      style={{
        perspective: '1200px',
      }}
    >
      <motion.div
        className="relative"
        style={{
          transformStyle: 'preserve-3d',
          willChange: 'transform',
        }}
        animate={{
          rotateX: [0, 2, 0, -2, 0],
          rotateY: [0, -3, 0, 3, 0],
          translateY: [0, -5, 0, 5, 0],
        }}
        transition={{
          repeat: Infinity,
          duration: 8,
          ease: 'easeInOut',
        }}
      >
        {/* Keyboard container with shadow */}
        <div
          className="relative bg-zinc-900 rounded-2xl p-6 border border-zinc-700/50"
          style={{
            transformStyle: 'preserve-3d',
            boxShadow: `
              0 20px 40px rgba(0, 0, 0, 0.5),
              0 10px 20px rgba(0, 0, 0, 0.4),
              0 5px 10px rgba(0, 0, 0, 0.3),
              inset 0 1px 0 rgba(255, 255, 255, 0.05)
            `,
          }}
        >
          {/* Render keyboard rows */}
          <div className="space-y-2">
            {Object.keys(keysByRow)
              .sort((a, b) => Number(a) - Number(b))
              .map((rowNum) => {
                const row = keysByRow[Number(rowNum)]
                return (
                  <div
                    key={rowNum}
                    className="grid gap-2"
                    style={{
                      gridTemplateColumns: `repeat(16, minmax(0, 1fr))`,
                    }}
                  >
                    {row.map((key) => {
                      const isPressed = pressedKeys.has(key.key)
                      const isHighlighted = highlightedKeys.has(key.key)
                      const glowColor = getKeyColor ? getKeyColor(key.key) : 'emerald'

                      return (
                        <Key3D
                          key={key.key}
                          keyLabel={key.label}
                          displayLabel={key.displayLabel}
                          width={key.width}
                          isPressed={isPressed}
                          isHighlighted={isHighlighted}
                          glowColor={glowColor}
                          isSpecial={key.isSpecial}
                          onClick={() => onKeyClick?.(key.key)}
                        />
                      )
                    })}
                  </div>
                )
              })}
          </div>

          {/* Ambient light effect overlay */}
          <div
            className="absolute inset-0 rounded-2xl pointer-events-none"
            style={{
              background: `
                radial-gradient(
                  ellipse 80% 50% at 50% 0%,
                  rgba(255, 255, 255, 0.03),
                  transparent
                )
              `,
            }}
          />
        </div>

        {/* Reflection effect below keyboard */}
        <div
          className="absolute top-full left-0 right-0 h-32 pointer-events-none"
          style={{
            background: `
              linear-gradient(
                to bottom,
                rgba(16, 185, 129, 0.05),
                transparent
              )
            `,
            transform: 'translateY(-10px)',
            filter: 'blur(20px)',
            opacity: 0.3,
          }}
        />
      </motion.div>
    </div>
  )
}

export default Keyboard3D
