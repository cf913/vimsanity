import { motion } from 'framer-motion'
import { KBD } from '../common/KBD'
import SessionHistory from '../common/SessionHistory'

interface LevelCompletionProps {
  levelId: string
  title?: string
  subtitle?: string
  showHistory?: boolean
  children?: React.ReactNode
}

export default function LevelCompletion({
  levelId,
  title = 'Level Complete!',
  subtitle,
  showHistory = true,
  children,
}: LevelCompletionProps) {
  return (
    <motion.div
      initial={{ scale: 0.8, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      className="flex flex-col items-center gap-6 p-8 bg-bg-secondary rounded-2xl border-4 border-emerald-500"
    >
      <h2 className="text-4xl font-bold text-emerald-400">{title}</h2>
      {subtitle && (
        <p className="text-xl text-text-secondary">{subtitle}</p>
      )}
      {children}
      {showHistory && <SessionHistory levelId={levelId} />}
      <p className="text-text-muted">
        Press <KBD>Esc</KBD> to restart
      </p>
    </motion.div>
  )
}
