import { Sun, Moon } from 'lucide-react'
import { motion } from 'framer-motion'

interface ThemeToggleProps {
  theme: 'dark' | 'light'
  onToggle: () => void
  size?: 'sm' | 'md'
}

const ThemeToggle = ({ theme, onToggle, size = 'md' }: ThemeToggleProps) => {
  const iconSize = size === 'sm' ? 16 : 20
  const padding = size === 'sm' ? 'p-1.5' : 'p-2'

  return (
    <motion.button
      onClick={onToggle}
      className={`${padding} bg-bg-tertiary rounded-lg hover:bg-bg-hover transition-colors cursor-pointer`}
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.95 }}
      aria-label={`Switch to ${theme === 'dark' ? 'light' : 'dark'} mode`}
      title={`Switch to ${theme === 'dark' ? 'light' : 'dark'} mode`}
    >
      <motion.div
        initial={false}
        animate={{ rotate: theme === 'dark' ? 0 : 180 }}
        transition={{ type: 'spring', stiffness: 200, damping: 15 }}
      >
        {theme === 'dark' ? (
          <Moon size={iconSize} className="text-text-muted" />
        ) : (
          <Sun size={iconSize} className="text-text-muted" />
        )}
      </motion.div>
    </motion.button>
  )
}

export default ThemeToggle
