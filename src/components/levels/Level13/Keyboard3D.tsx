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
  // Key size constants for realistic layout
  const KEY_SIZE = 52 // Base key width/height in pixels
  const KEY_GAP = 6 // Gap between keys

  // Row stagger offsets (in pixels) for realistic keyboard stagger
  const ROW_STAGGER = {
    0: 0,      // Number row - no offset
    1: 0.25 * KEY_SIZE,  // QWERTY row - 0.25 key offset
    2: 0.45 * KEY_SIZE,  // Home row - 0.45 key offset
    3: 0.6 * KEY_SIZE,   // Bottom letter row - 0.6 key offset
    4: 0,      // Spacebar row - no offset
  }

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
            width: 'fit-content',
          }}
        >
          {/* Render keyboard with absolute positioning for stagger */}
          <div
            className="relative"
            style={{
              width: '900px',
              height: '320px'
            }}
          >
            {keyboardLayout.map((key) => {
              const isPressed = pressedKeys.has(key.key)
              const isHighlighted = highlightedKeys.has(key.key)
              const glowColor = getKeyColor ? getKeyColor(key.key) : 'emerald'

              const rowStagger = ROW_STAGGER[key.row as keyof typeof ROW_STAGGER] || 0
              const left = key.column * (KEY_SIZE + KEY_GAP) + rowStagger
              const top = key.row * (KEY_SIZE + KEY_GAP)
              const width = (key.width || 1) * KEY_SIZE + ((key.width || 1) - 1) * KEY_GAP

              return (
                <div
                  key={key.key}
                  style={{
                    position: 'absolute',
                    left: `${left}px`,
                    top: `${top}px`,
                    width: `${width}px`,
                  }}
                >
                  <Key3D
                    keyLabel={key.label}
                    displayLabel={key.displayLabel}
                    shiftLabel={key.shiftLabel}
                    width={key.width}
                    isPressed={isPressed}
                    isHighlighted={isHighlighted}
                    glowColor={glowColor}
                    isSpecial={key.isSpecial}
                    onClick={() => onKeyClick?.(key.key)}
                  />
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
