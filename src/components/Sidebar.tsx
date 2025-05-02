import React from "react"
import { BookOpen, Lock, Volume2, VolumeX, X, ChevronRight } from "lucide-react"
import { motion, AnimatePresence } from "framer-motion"

interface SidebarProps {
  currentLevel: number
  setCurrentLevel: (level: number) => void
  isMuted: boolean
  setIsMuted: (muted: boolean) => void
  onClose: () => void
  onReturnToLanding: () => void
}

const levels = [
  {
    id: 0,
    title: "Playground (All Motions)",
    description: "Practice all Vim motions in a free environment",
  },
  {
    id: 1,
    title: "Basic Movement (h, j, k, l)",
    description: "Learn the fundamental vim motions",
  },
  {
    id: 2,
    title: "Word Movement (w, b, e)",
    description: "Navigate through words efficiently",
  },
  {
    id: 3,
    title: "Line Operations (0, $)",
    description: "Move to start and end of lines",
    locked: true,
  },
  {
    id: 4,
    title: "Find Characters (f, t)",
    description: "Jump to specific characters",
    locked: true,
  },
]

const Sidebar: React.FC<SidebarProps> = ({
  currentLevel,
  setCurrentLevel,
  isMuted,
  setIsMuted,
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
        when: "beforeChildren",
      },
    },
  }

  const itemVariants = {
    hidden: { opacity: 0, x: -10 },
    visible: {
      opacity: 1,
      x: 0,
      transition: {
        type: "spring",
        stiffness: 300,
        damping: 24,
      },
    },
  }

  const buttonVariants = {
    initial: { scale: 1 },
    hover: {
      transition: { duration: 0.2 },
    },
    tap: { scale: 1 },
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
      boxShadow: "0px 4px 8px rgba(16, 185, 129, 0.25)",
    },
  }

  return (
    <motion.div
      className="w-64 h-full bg-zinc-800 p-5 overflow-y-auto scrollbar-thin scrollbar-thumb-zinc-600 scrollbar-track-zinc-800"
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
          className="p-2 hover:bg-zinc-700 rounded-lg transition-colors"
          whileHover={{ scale: 1.1, rotate: 90 }}
          whileTap={{ scale: 0.9 }}
          transition={{ duration: 0.2 }}
        >
          <X size={20} />
        </motion.button>
      </motion.div>

      <motion.div className="space-y-3" variants={itemVariants}>
        <motion.div className="mb-4 px-1" variants={itemVariants}>
          <h2 className="text-sm uppercase tracking-wider text-zinc-400 font-semibold mb-2">
            Levels
          </h2>
          <div className="h-1 w-16 bg-gradient-to-r from-emerald-500 to-emerald-400 rounded-full" />
        </motion.div>

        {levels.map((level, index) => (
          <motion.button
            key={level.id}
            custom={!!level.locked}
            initial="initial"
            whileHover="hover"
            whileTap="tap"
            animate={currentLevel === level.id ? "active" : "initial"}
            variants={levelButtonVariants}
            onClick={() => !level.locked && setCurrentLevel(level.id)}
            className={`w-full text-left p-3 rounded-lg border transition-all ${
              currentLevel === level.id
                ? "bg-gradient-to-r from-emerald-500 to-emerald-600 text-white border-emerald-400"
                : level.locked
                ? "bg-zinc-700/50 text-zinc-500 cursor-not-allowed border-zinc-700"
                : "bg-zinc-700/80 hover:bg-zinc-700 border-zinc-600 hover:border-zinc-500"
            }`}
          >
            <div className="flex items-center justify-between">
              <span className="font-medium">Level {level.id}</span>
              {level.locked ? (
                <Lock size={16} />
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
            <p className="text-xs mt-1 text-zinc-400 line-clamp-1">
              {level.description}
            </p>
          </motion.button>
        ))}
      </motion.div>

      <motion.div
        className="mt-8 pt-4 border-t border-zinc-700"
        variants={itemVariants}
      >
        <motion.button
          onClick={() => setIsMuted(!isMuted)}
          className="flex items-center gap-2 px-3 py-2 w-full rounded-lg hover:bg-zinc-700/70 transition-colors"
          whileHover={buttonVariants.hover}
          whileTap={buttonVariants.tap}
        >
          {isMuted ? (
            <>
              <VolumeX size={18} className="text-zinc-400" />
              <span className="text-sm text-zinc-400">Unmute Sounds</span>
            </>
          ) : (
            <>
              <Volume2 size={18} className="text-emerald-400" />
              <span className="text-sm text-zinc-300">Mute Sounds</span>
            </>
          )}
        </motion.button>
      </motion.div>
    </motion.div>
  )
}

export default Sidebar
