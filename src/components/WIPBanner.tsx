import React, { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { X, MessageSquare } from 'lucide-react'
import { usePostHog } from 'posthog-js/react'

interface WIPBannerProps {
  position?: 'top' | 'bottom' | 'corner'
}

const WIPBanner: React.FC<WIPBannerProps> = ({ position = 'corner' }) => {
  const [isVisible, setIsVisible] = useState(true)
  const [isHovered, setIsHovered] = useState(false)
  const posthog = usePostHog()

  // Auto-hide the banner after 5 seconds, but keep it in DOM for user to show again
  useEffect(() => {
    const timer = setTimeout(() => {
      setIsVisible(false)
    }, 5000)

    return () => clearTimeout(timer)
  }, [])

  // Position styles based on the position prop
  const getPositionClasses = () => {
    switch (position) {
      case 'top':
        return 'top-0 left-1/2 -translate-x-1/2'
      case 'bottom':
        return 'bottom-4 right-4'
      case 'corner':
      default:
        return 'top-4 right-4'
    }
  }

  // Handle feedback button click
  const handleFeedbackClick = () => {
    // Trigger PostHog survey or capture custom event
    posthog?.capture('feedback_button_clicked', {
      source: 'wip_banner',
      timestamp: new Date().toISOString(),
    })

    // Option 1: If you have a PostHog survey configured, activate it
    // posthog?.getSurveys((surveys) => {
    //   const feedbackSurvey = surveys.find(s => s.name === 'Open Feedback')
    //   if (feedbackSurvey) {
    //     // PostHog will automatically show the survey
    //   }
    // })

    // Option 2: For now, open a simple feedback form (you can customize this)
    const feedbackUrl =
      'https://github.com/yourusername/vimsanity/issues/new/choose'
    window.open(feedbackUrl, '_blank', 'noopener,noreferrer')
  }

  // Animation variants
  const bannerVariants = {
    hidden: {
      opacity: 0,
      y: position === 'bottom' ? 20 : -20,
      scale: 0.95,
    },
    visible: {
      opacity: 1,
      y: 0,
      scale: 1,
      transition: {
        type: 'spring',
        stiffness: 300,
        damping: 25,
      },
    },
    exit: {
      opacity: 0,
      scale: 0.9,
      transition: { duration: 0.2 },
    },
    hover: {
      scale: 1.03,
      boxShadow: '0px 5px 15px rgba(16, 185, 129, 0.4)',
    },
  }

  // Pulse animation for the dot
  const dotVariants = {
    pulse: {
      scale: [1, 1.2, 1],
      opacity: [0.7, 1, 0.7],
      transition: {
        repeat: Infinity,
        duration: 2,
      },
    },
  }

  // Minimized state (just shows a small indicator)
  const MinimizedIndicator = () => (
    <motion.div
      className="fixed z-50 cursor-pointer"
      initial={{ opacity: 0, scale: 0.8 }}
      animate={{ opacity: 1, scale: 1 }}
      whileHover={{ scale: 1.1 }}
      onClick={() => setIsVisible(true)}
      style={{
        right: '1rem',
        bottom: '1rem',
      }}
    >
      <div className="bg-emerald-600 text-white p-2 rounded-full shadow-lg flex items-center justify-center">
        <motion.div
          className="w-3 h-3 bg-white rounded-full mr-1"
          variants={dotVariants}
          animate="pulse"
        />
        <span className="text-xs font-bold">WIP</span>
      </div>
    </motion.div>
  )

  return (
    <>
      <AnimatePresence>
        {isVisible && (
          <motion.div
            className={`fixed z-50 ${getPositionClasses()}`}
            variants={bannerVariants}
            initial="hidden"
            animate="visible"
            exit="exit"
            whileHover="hover"
            onMouseEnter={() => setIsHovered(true)}
            onMouseLeave={() => setIsHovered(false)}
          >
            <div className="bg-gradient-to-r from-zinc-800 to-zinc-900 p-3 rounded-lg shadow-lg border border-emerald-500/30 backdrop-blur-sm">
              <div className="flex items-center">
                <motion.div
                  className="w-3 h-3 bg-emerald-500 rounded-full mr-2"
                  variants={dotVariants}
                  animate="pulse"
                />
                <div className="text-zinc-100 font-medium mr-2">
                  <span className="text-emerald-400 font-bold">
                    Work in Progress
                  </span>
                  {isHovered && (
                    <motion.div
                      className="flex flex-col gap-1"
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: 'auto' }}
                    >
                      <p className="text-xs text-zinc-300 mt-1">
                        This project is being improved weekly!
                      </p>
                      <motion.button
                        className="flex items-center gap-1 text-xs text-emerald-400 hover:text-emerald-300 transition-colors"
                        onClick={handleFeedbackClick}
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                      >
                        <MessageSquare size={12} />
                        <span>Give Feedback</span>
                      </motion.button>
                    </motion.div>
                  )}
                </div>
                <motion.button
                  className="text-zinc-400 hover:text-zinc-200 p-1 rounded-full ml-auto"
                  whileHover={{ scale: 1.1, rotate: 90 }}
                  whileTap={{ scale: 0.9 }}
                  onClick={() => setIsVisible(false)}
                >
                  <X size={16} />
                </motion.button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {!isVisible && <MinimizedIndicator />}
    </>
  )
}

export default WIPBanner
