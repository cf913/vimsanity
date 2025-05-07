import React from 'react'
import { ArrowLeft, Monitor, Keyboard } from 'lucide-react'
import { motion } from 'framer-motion'

interface MobileWarningProps {
  onReturnToLanding: () => void
}

const MobileWarning: React.FC<MobileWarningProps> = ({ onReturnToLanding }) => {
  return (
    <div className="min-h-screen w-full flex flex-col items-center justify-center bg-gradient-to-b from-zinc-900 to-zinc-800 text-zinc-100 px-4 py-6 overflow-hidden">
      <div className="max-w-md w-full mx-auto bg-zinc-800/80 backdrop-blur-sm rounded-xl shadow-lg p-6 border border-zinc-700/50">
        <motion.div
          className="text-center"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
        >
          <div className="flex justify-center mb-6">
            <div className="p-3 rounded-full bg-amber-500/20 text-amber-400">
              <Monitor size={40} />
            </div>
          </div>

          <h1 className="text-2xl font-bold text-zinc-100 mb-2">
            Desktop Experience Recommended
          </h1>

          <p className="text-zinc-300 text-sm mb-4">
            The VimSanity experience is designed for desktop with a keyboard.
            Using keyboard shortcuts and precise movements that aren't possible
            on a touch screen.
          </p>
          <p className="text-zinc-400 text-sm mb-4">
            Well.... technically you could learn the keys, and memorize
            everything, but the whole point here is to develop muscle memory
            using the keyboard.
          </p>
          <p className="text-zinc-500 text-xs italic leading-snug mb-8">
            Okay, sure... we'll work on a mobile version if you reaaaaally want
            it.
          </p>

          <div className="bg-zinc-700/50 rounded-lg p-4 mb-6">
            <div className="flex items-center justify-center mb-3">
              <Keyboard className="text-emerald-400 mr-2" size={20} />
              <span className="text-emerald-400 font-medium">
                For the best experience:
              </span>
            </div>
            <ul className="text-zinc-300 text-sm text-left space-y-2">
              <li className="flex items-start">
                <span className="text-zinc-500 mr-2">•</span>
                <span>Visit VimSanity on a desktop or laptop computer</span>
              </li>
              <li className="flex items-start">
                <span className="text-zinc-500 mr-2">•</span>
                <span>Use a physical keyboard for Vim motions</span>
              </li>
              <li className="flex items-start">
                <span className="text-zinc-500 mr-2">•</span>
                <span>Enjoy the full interactive learning experience</span>
              </li>
            </ul>
          </div>

          <motion.button
            onClick={onReturnToLanding}
            className="inline-flex items-center px-5 py-3 border border-transparent text-base font-medium rounded-full text-zinc-900 bg-gradient-to-r from-amber-400 to-amber-500 hover:from-amber-500 hover:to-amber-600 shadow-md"
            whileHover={{ scale: 1.03 }}
            whileTap={{ scale: 0.97 }}
          >
            <ArrowLeft size={18} className="mr-2" />
            <span>Return to Landing Page</span>
          </motion.button>
        </motion.div>
      </div>
    </div>
  )
}

export default MobileWarning
