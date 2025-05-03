import React, { useEffect, useState } from "react"
import { ArrowRight } from "lucide-react"
import { motion, AnimatePresence } from "framer-motion"

interface LandingPageProps {
  onGetStarted: () => void
}

const LandingPage: React.FC<LandingPageProps> = ({ onGetStarted }) => {
  const [isLoaded, setIsLoaded] = useState(false)

  useEffect(() => {
    // Immediate loading for snappier experience
    setIsLoaded(true)
  }, [])

  const container = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1, // Faster staggering
        delayChildren: 0.1, // Reduced delay
        duration: 0.3, // Faster overall animation
      },
    },
  }

  const item = {
    hidden: { y: 10, opacity: 0 }, // Reduced distance for snappier feel
    show: {
      y: 0,
      opacity: 1,
      transition: {
        type: "spring",
        stiffness: 200, // Increased stiffness for snappier motion
        damping: 12, // Adjusted damping for quick but controlled motion
        duration: 0.3, // Faster duration
      },
    },
  }

  const buttonVariants = {
    initial: { scale: 1 },
    hover: {
      scale: 1.03, // Reduced scale for snappier feel
      boxShadow: "0px 5px 15px rgba(16, 185, 129, 0.4)",
      transition: { duration: 0.2 }, // Faster transition
    },
    tap: {
      scale: 0.97, // Less dramatic scale for quicker return
      transition: { duration: 0.1 }, // Very fast tap response
    },
  }

  const featureCardVariants = {
    hover: {
      y: -5, // Reduced movement for snappier feel
      boxShadow: "0px 8px 15px rgba(0, 0, 0, 0.3)",
      backgroundColor: "rgb(39, 39, 42)",
      transition: {
        type: "spring",
        stiffness: 400, // Higher stiffness for snappier motion
        damping: 15, // Adjusted damping
        duration: 0.2, // Faster duration
      },
    },
  }

  // Generate floating squares data
  const floatingSquares = Array.from({ length: 20 }, (_, i) => {
    const size = Math.floor(Math.random() * 60) + 20 // Random size between 20-80px
    const initialX = Math.random() * 100 // Random X position (0-100%)
    const initialY = Math.random() * 100 // Random Y position (0-100%)
    const duration = Math.random() * 30 + 50 // Random duration between 50-80s for slow movement
    const delay = Math.random() * -30 // Random delay for staggered animation start

    // Alternate between purple and green with some variation
    const isGreen = i % 2 === 0
    const colorIntensity = Math.random() * 0.2 + 0.1 // Random opacity between 0.1-0.3 for subtle effect

    return {
      id: i,
      size,
      initialX,
      initialY,
      duration,
      delay,
      isGreen,
      colorIntensity,
    }
  })

  return (
    <div className="min-h-screen w-full flex flex-col items-center justify-center bg-gradient-to-b from-zinc-900 to-zinc-800 text-zinc-100 px-4 sm:px-6 lg:px-8 py-6 sm:py-8 md:py-10 overflow-hidden">
      <div
        className="fixed inset-0 w-full h-full overflow-hidden z-0"
        style={{
          backgroundImage:
            "radial-gradient(circle at 25% 25%, rgba(16, 185, 129, 0.05) 0%, transparent 50%), radial-gradient(circle at 75% 75%, rgba(16, 185, 129, 0.05) 0%, transparent 50%)",
        }}
      >
        {/* Floating squares animation */}
        {floatingSquares.map((square) => (
          <motion.div
            key={square.id}
            className="absolute rounded-md aspect-square"
            style={{
              width: square.size,
              left: `${square.initialX}%`,
              top: `${square.initialY}%`,
              backgroundColor: square.isGreen
                ? `rgba(16, 185, 129, ${square.colorIntensity})`
                : `rgba(168, 85, 247, ${square.colorIntensity})`,
              filter: `blur(2px) drop-shadow(0 0 8px ${
                square.isGreen
                  ? `rgba(16, 185, 129, ${square.colorIntensity + 0.2})`
                  : `rgba(168, 85, 247, ${square.colorIntensity + 0.2})`
              })`,
              zIndex: 0,
            }}
            animate={{
              x: [
                0,
                Math.random() * 100 - 50, // Random movement between -50px and 50px
                Math.random() * 100 - 50,
                Math.random() * 100 - 50,
                0,
              ],
              y: [
                0,
                Math.random() * 100 - 50,
                Math.random() * 100 - 50,
                Math.random() * 100 - 50,
                0,
              ],
              rotate: [
                0,
                Math.random() * 40 - 20,
                0,
                Math.random() * 40 - 20,
                0,
              ],
              scale: [
                1,
                1 + Math.random() * 0.2, // Subtle scale change
                1,
                1 + Math.random() * 0.2,
                1,
              ],
              opacity: [
                square.colorIntensity,
                square.colorIntensity + 0.1,
                square.colorIntensity,
                square.colorIntensity + 0.1,
                square.colorIntensity,
              ],
            }}
            transition={{
              duration: square.duration,
              ease: "easeInOut",
              times: [0, 0.25, 0.5, 0.75, 1],
              repeat: Infinity,
              delay: square.delay,
            }}
          />
        ))}
      </div>

      <AnimatePresence>
        {isLoaded && (
          <motion.div
            className="max-w-3xl w-full text-center space-y-8 relative z-10 pb-20 sm:pb-24 md:pb-28 pt-20"
            initial="hidden"
            animate="show"
            variants={container}
          >
            <motion.div variants={item} layout>
              <motion.h1
                className="text-5xl sm:text-6xl md:text-7xl font-extrabold tracking-tight"
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, type: "spring", stiffness: 200 }}
              >
                <span className="block bg-clip-text text-transparent bg-gradient-to-r from-zinc-100 to-zinc-300">
                  Welcome to
                </span>
                <motion.span
                  className="block text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 to-emerald-600 mt-2"
                  whileHover={{ scale: 1.01 }}
                  transition={{ type: "spring", stiffness: 400, duration: 0.2 }}
                >
                  VimSanity
                </motion.span>
              </motion.h1>
            </motion.div>

            <motion.p
              className="text-xl sm:text-2xl text-zinc-300 mt-4 max-w-2xl mx-auto leading-relaxed"
              variants={item}
            >
              Master Vim motions through interactive gameplay and become a text
              editing ninja.
            </motion.p>

            <motion.div className="mt-8 space-y-6" variants={item}>
              <motion.div
                className="grid grid-cols-1 md:grid-cols-3 gap-4 text-left"
                variants={container}
              >
                {[
                  {
                    title: "Learn by Doing",
                    description:
                      "Practice Vim motions in a fun, interactive environment",
                  },
                  {
                    title: "Progressive Challenges",
                    description:
                      "Start with basics and advance to complex movement patterns",
                  },
                  {
                    title: "Make Coding Fun Again",
                    description:
                      "Transform text editing into an addictive game where every keystroke feels like a victory",
                  },
                ].map((feature, index) => (
                  <motion.div
                    key={index}
                    className="bg-zinc-800/80 backdrop-blur-sm p-5 rounded-xl border border-zinc-700/50 shadow-lg transform transition-all"
                    variants={item}
                    whileHover={featureCardVariants.hover}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{
                      delay: index * 0.05, // Very slight staggering
                      duration: 0.2,
                    }}
                  >
                    <h3 className="text-lg font-medium text-emerald-400 mb-2">
                      {feature.title}
                    </h3>
                    <p className="text-zinc-400">{feature.description}</p>
                  </motion.div>
                ))}
              </motion.div>
            </motion.div>

            {/* Pros and Cons Table Section */}
            <motion.div className="mt-12" variants={item}>
              <motion.h2
                className="text-2xl font-bold text-center mb-6"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3 }}
              >
                <span className="bg-clip-text text-transparent bg-gradient-to-r from-emerald-400 to-emerald-600">
                  Why Master Vim Motions?
                </span>
              </motion.h2>

              <motion.div
                className="bg-zinc-800/80 backdrop-blur-sm rounded-xl border border-zinc-700/50 shadow-lg overflow-hidden"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4 }}
                whileHover={{
                  boxShadow: "0px 8px 30px rgba(16, 185, 129, 0.2)",
                }}
              >
                <div className="grid grid-cols-1 md:grid-cols-2 divide-y md:divide-y-0 md:divide-x divide-zinc-700/50">
                  {/* Vim Motions Column */}
                  <div className="p-6">
                    <h3 className="text-xl font-semibold text-emerald-400 mb-4 flex items-center">
                      <span className="w-8 h-8 bg-emerald-500/20 rounded-full flex items-center justify-center mr-2">
                        ✓
                      </span>
                      Vim Motions
                    </h3>
                    <ul className="space-y-3 text-left">
                      <li className="flex items-start">
                        <span className="text-emerald-400 mr-2">•</span>
                        <span className="text-zinc-300">
                          Control code like a video game character
                        </span>
                      </li>
                      <li className="flex items-start">
                        <span className="text-emerald-400 mr-2">•</span>
                        <span className="text-zinc-300">
                          Execute powerful combo moves with keypresses
                        </span>
                      </li>
                      <li className="flex items-start">
                        <span className="text-emerald-400 mr-2">•</span>
                        <span className="text-zinc-300">
                          Feel like a coding ninja with every keystroke
                        </span>
                      </li>
                      <li className="flex items-start">
                        <span className="text-emerald-400 mr-2">•</span>
                        <span className="text-zinc-300">
                          Unlock new abilities as you level up
                        </span>
                      </li>
                      <li className="flex items-start">
                        <span className="text-emerald-400 mr-2">•</span>
                        <span className="text-zinc-300">
                          Turn mundane editing into an exciting challenge
                        </span>
                      </li>
                      <li className="flex items-start">
                        <span className="text-emerald-400 mr-2">•</span>
                        <span className="text-zinc-300">
                          Editor agnostic (works with most editors)
                        </span>
                      </li>
                    </ul>
                  </div>

                  {/* Regular Editing Column */}
                  <div className="p-6 text-left">
                    <h3 className="text-xl font-semibold text-zinc-400 mb-4 flex items-center">
                      <span className="w-8 h-8 bg-zinc-500/20 rounded-full flex items-center justify-center mr-2 text-center">
                        ✗
                      </span>
                      Regular Editing
                    </h3>
                    <ul className="space-y-3">
                      <li className="flex items-start">
                        <span className="text-zinc-500 mr-2">•</span>
                        <span className="text-zinc-400">
                          Boring point-and-click movements
                        </span>
                      </li>
                      <li className="flex items-start">
                        <span className="text-zinc-500 mr-2">•</span>
                        <span className="text-zinc-400">
                          Tedious arrow key mashing
                        </span>
                      </li>
                      <li className="flex items-start">
                        <span className="text-zinc-500 mr-2">•</span>
                        <span className="text-zinc-400">
                          Repetitive hand movements causing fatigue
                        </span>
                      </li>
                      <li className="flex items-start">
                        <span className="text-zinc-500 mr-2">•</span>
                        <span className="text-zinc-400">
                          No sense of progression or mastery
                        </span>
                      </li>
                      <li className="flex items-start">
                        <span className="text-zinc-500 mr-2">•</span>
                        <span className="text-zinc-400">
                          Having to switch between mouse and keyboard
                        </span>
                      </li>
                      <li className="flex items-start">
                        <span className="text-zinc-500 mr-2">•</span>
                        <span className="text-zinc-400">
                          Editor specific shortcuts
                        </span>
                      </li>
                    </ul>
                  </div>
                </div>

                <div className="bg-zinc-900/50 p-4 text-center">
                  <p className="text-emerald-300 font-medium">
                    VimSanity makes learning these powerful motions fun and
                    effective
                  </p>
                </div>
              </motion.div>
            </motion.div>

            <motion.div className="mt-8" variants={item}>
              <motion.div
                className="mb-4 max-w-lg mx-auto text-center p-3 rounded-lg bg-zinc-800/60 border border-zinc-700/50 backdrop-blur-sm"
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.2, duration: 0.3 }}
              >
                <p className="text-zinc-300 italic text-sm">
                  <span className="text-emerald-400 font-semibold">
                    ⚠️ Warning:
                  </span>{" "}
                  Starting VimSanity may result in ditching your mouse,
                  abandoning arrow keys, and 10x-ing your development speed.
                  <br />
                  <br />
                  We can't guarantee it'll make you a better developer, but it
                  will DEFINITELY make you a faster one.
                </p>
              </motion.div>

              <motion.button
                onClick={onGetStarted}
                className="inline-flex items-center px-8 py-4 border border-transparent text-base font-medium rounded-full text-black bg-gradient-to-r from-emerald-400 to-emerald-500 hover:from-emerald-500 hover:to-emerald-600 shadow-lg"
                aria-label="Get started with VimSanity"
                initial="initial"
                whileHover="hover"
                whileTap="tap"
                variants={buttonVariants}
              >
                <span>Get Started</span>
                <motion.div
                  className="ml-2"
                  animate={{ x: [0, 4, 0] }}
                  transition={{
                    repeat: Infinity,
                    repeatDelay: 1,
                    duration: 0.5,
                    ease: "easeInOut",
                  }}
                >
                  <ArrowRight size={20} />
                </motion.div>
              </motion.button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* SEO-friendly footer with additional info */}
      <motion.footer
        className="fixed bottom-0 left-0 right-0 py-3 sm:py-5 w-full backdrop-blur-sm bg-zinc-900/30"
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
      >
        <div className="text-center text-zinc-500 text-sm">
          <p>VimSanity - The interactive way to master Vim motions</p>
          <p className="mt-1">
            Improve your productivity with keyboard-driven text editing
          </p>
        </div>
      </motion.footer>

      {/* Custom animation keyframes */}
      <style>{`
        @keyframes glow-pulse {
          0% {
            box-shadow: 0 0 5px rgba(168, 85, 247, 0.3);
          }
          50% {
            box-shadow: 0 0 20px rgba(168, 85, 247, 0.6);
          }
          100% {
            box-shadow: 0 0 5px rgba(168, 85, 247, 0.3);
          }
        }

        @keyframes green-glow-pulse {
          0% {
            box-shadow: 0 0 5px rgba(16, 185, 129, 0.3);
          }
          50% {
            box-shadow: 0 0 20px rgba(16, 185, 129, 0.6);
          }
          100% {
            box-shadow: 0 0 5px rgba(16, 185, 129, 0.3);
          }
        }
      `}</style>
    </div>
  )
}

export default LandingPage
