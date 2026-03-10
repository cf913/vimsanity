import { motion } from 'framer-motion'

interface CommandBufferProps {
  buffer: string
  /** Extra text appended after the buffer (e.g. pending "g" in gg sequence) */
  suffix?: string
  /** Border/text color class, e.g. "cyan" or "purple" */
  color?: 'cyan' | 'purple' | 'emerald' | 'orange'
}

const colorMap = {
  cyan: {
    bg: 'bg-cyan-500/20',
    border: 'border-cyan-500',
    text: 'text-cyan-400',
    pulse: 'text-cyan-400/50',
  },
  purple: {
    bg: 'bg-purple-500/20',
    border: 'border-purple-500',
    text: 'text-purple-400',
    pulse: 'text-purple-400/50',
  },
  emerald: {
    bg: 'bg-emerald-500/20',
    border: 'border-emerald-500',
    text: 'text-emerald-400',
    pulse: 'text-emerald-400/50',
  },
  orange: {
    bg: 'bg-orange-500/20',
    border: 'border-orange-500',
    text: 'text-orange-400',
    pulse: 'text-orange-400/50',
  },
}

export default function CommandBuffer({
  buffer,
  suffix,
  color = 'cyan',
}: CommandBufferProps) {
  const c = colorMap[color]
  const display = buffer + (suffix ?? '')

  if (!display) return <div className="h-12" />

  return (
    <div className="h-12 flex items-center justify-center">
      <motion.div
        initial={{ scale: 0.8, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        className={`${c.bg} border-2 ${c.border} rounded-lg px-6 py-2`}
      >
        <span className={`text-2xl font-mono font-bold ${c.text}`}>
          {display}
        </span>
        <span className={`${c.pulse} animate-pulse`}>_</span>
      </motion.div>
    </div>
  )
}
