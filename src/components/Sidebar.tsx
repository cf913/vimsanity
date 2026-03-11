import React from 'react'
import { BookOpen, X, ChevronRight, Construction } from 'lucide-react'
import { motion } from 'framer-motion'
import ThemeToggle from './common/ThemeToggle'
import { getLevelsByCategory, LevelEntry } from '../levels/registry'

interface SidebarProps {
  currentLevel: number
  setCurrentLevel: (level: number) => void
  isMuted: boolean
  setIsMuted: (muted: boolean) => void
  theme: 'dark' | 'light'
  onToggleTheme: () => void
  onClose: () => void
  onReturnToLanding: () => void
}

const levels = getLevelsByCategory()

const Sidebar: React.FC<SidebarProps> = ({
  currentLevel,
  setCurrentLevel,
  theme,
  onToggleTheme,
  onClose,
  onReturnToLanding,
}) => {
  // Animation variants
  const sidebarVariants = {
    hidden: { opacity: 0, x: -20 },
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
    hidden: { opacity: 0, x: -10 },
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

  const levelButtonVariants = {
    initial: (locked: boolean) => ({
      scale: 1,
      opacity: locked ? 0.7 : 1,
    }),
    hover: (locked: boolean) => ({
      scale: locked ? 1 : 1,
      y: locked ? 0 : 0,
      opacity: locked ? 0.8 : 1,
      transition: { duration: 0 },
    }),
    tap: (locked: boolean) => ({
      scale: locked ? 1 : 0.98,
      transition: { duration: 0 },
    }),
    active: {
      scale: 1.03,
      boxShadow: '0px 4px 8px rgba(16, 185, 129, 0.25)',
    },
  }

  const renderLevel = (level: LevelEntry) => {
    return (
      <motion.button
        key={level.id}
        custom={!!level.locked}
        initial="initial"
        whileHover="hover"
        whileTap="tap"
        animate={currentLevel === level.id ? 'active' : 'initial'}
        variants={levelButtonVariants}
        onClick={() => !level.locked && setCurrentLevel(level.id)}
        className={`w-full text-left p-3 rounded-lg border transition-all ${
          currentLevel === level.id
            ? 'bg-gradient-to-r from-emerald-500 to-emerald-600 text-white border-emerald-400'
            : level.locked
              ? 'bg-bg-tertiary/50 text-text-subtle cursor-not-allowed border-border-primary'
              : 'bg-bg-tertiary/80 hover:bg-bg-tertiary text-text-primary border-border-secondary hover:border-border-primary'
        }`}
      >
        <div className="flex items-center justify-between">
          <span className="font-medium text-sm">
            {level.id === 0 ? 'Intro' : `Level ${level.id}`}
          </span>
          {level.wip ? (
            <span className="text-amber-600 flex items-center gap-1 font-bold">
              <Construction size={16} className="text-amber-600" />
              WIP
            </span>
          ) : currentLevel === level.id ? (
            <motion.div
              animate={{ x: [0, 3, 0] }}
              transition={{
                repeat: Infinity,
                repeatDelay: 2,
                duration: 0.5,
              }}
            >
              <ChevronRight size={16} />
            </motion.div>
          ) : null}
        </div>
        <p className="text-sm mt-1 opacity-90">{level.title}</p>
        <p className="text-xs mt-1 text-text-muted line-clamp-1">
          {level.description}
        </p>
      </motion.button>
    )
  }

  return (
    <motion.div
      className="w-64 h-full bg-bg-secondary p-5 overflow-y-auto scrollbar-thin scrollbar-thumb-bg-hover scrollbar-track-bg-secondary"
      initial="hidden"
      animate="visible"
      variants={sidebarVariants}
    >
      <motion.div
        className="flex items-center justify-between mb-8"
        variants={itemVariants}
      >
        <motion.div
          className="flex items-center gap-2 cursor-pointer group"
          onClick={onReturnToLanding}
          whileHover={{ scale: 1.03 }}
          whileTap={{ scale: 0.97 }}
        >
          <motion.div
            animate={{ rotate: [0, 5, 0] }}
            transition={{ repeat: Infinity, repeatDelay: 5, duration: 0.5 }}
          >
            <BookOpen className="text-emerald-500 group-hover:text-emerald-400 transition-colors" />
          </motion.div>
          <h1 className="text-xl font-bold font-mono bg-clip-text text-transparent bg-gradient-to-r from-emerald-400 to-emerald-500">
            VimSanity
          </h1>
        </motion.div>

        <motion.button
          onClick={onClose}
          className="p-2 hover:bg-bg-tertiary rounded-lg transition-colors"
          whileHover={{ scale: 1.1, rotate: 90 }}
          whileTap={{ scale: 0.9 }}
          transition={{ duration: 0.2 }}
        >
          <X size={20} />
        </motion.button>
      </motion.div>

      <motion.div className="space-y-3" variants={itemVariants}>
        {Object.entries(levels).map(([k, v]) => {
          return (
            <>
              <motion.div className="mb-4 px-1" variants={itemVariants}>
                <h2 className="text-sm uppercase tracking-wider text-text-muted font-semibold mb-2">
                  {k}
                </h2>
                <div className="h-1 w-16 bg-gradient-to-r from-emerald-500 to-emerald-400 rounded-full" />
              </motion.div>
              {v.map(renderLevel)}
            </>
          )
        })}
      </motion.div>

      <motion.div
        className="mt-8 pt-4 border-t border-border-primary"
        variants={itemVariants}
      >
        <div className="flex items-center justify-between px-1">
          <span className="text-sm text-text-muted">Theme</span>
          <ThemeToggle theme={theme} onToggle={onToggleTheme} size="sm" />
        </div>
      </motion.div>
    </motion.div>
  )
}

export default Sidebar
