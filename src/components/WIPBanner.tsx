import React, { useState, useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { X } from "lucide-react"

interface WIPBannerProps {
  position?: "top" | "bottom" | "corner"
}

const WIPBanner: React.FC<WIPBannerProps> = ({ position = "corner" }) => {
  const [isVisible, setIsVisible] = useState(true)
  const [isHovered, setIsHovered] = useState(false)

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
      case "top":
        return "top-0 left-1/2 -translate-x-1/2"
      case "bottom":
        return "bottom-4 right-4"
      case "corner":
      default:
        return "top-4 right-4"
    }
  }

  // Animation variants
  const bannerVariants = {
    hidden: {
      opacity: 0,
      y: position === "bottom" ? 20 : -20,
      scale: 0.95,
    },
    visible: {
      opacity: 1,
      y: 0,
      scale: 1,
      transition: {
        type: "spring",
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
      boxShadow: "0px 5px 15px rgba(16, 185, 129, 0.4)",
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
        right: "1rem",
        bottom: "1rem",
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
                    <motion.p
                      className="text-xs text-zinc-300 mt-1"
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: "auto" }}
                    >
                      This project is being improved weekly!
                    </motion.p>
                  )}
                </div>
                <motion.button
                  className="text-zinc-400 hover:text-zinc-200 p-1 rounded-full"
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
