import React, { useState, useEffect } from 'react'
import { Menu, X, BookOpen } from 'lucide-react'
import Sidebar from './components/Sidebar'
import DocumentationSidebar from './components/DocumentationSidebar'
import GameArea from './components/GameArea'
import LandingPage from './components/LandingPage'
import MobileWarning from './components/MobileWarning'
import WIPBanner from './components/WIPBanner'
import { Analytics } from '@vercel/analytics/react'
import { motion, AnimatePresence } from 'framer-motion'
import { isMobile } from './utils/isMobile'

// Keys for localStorage
const STORAGE_KEYS = {
  SHOW_LANDING_PAGE: 'vimsanity-show-landing-page',
  SIDEBAR_OPEN: 'vimsanity-sidebar-open',
  DOC_SIDEBAR_OPEN: 'vimsanity-doc-sidebar-open',
  CURRENT_LEVEL: 'vimsanity-current-level',
  IS_MUTED: 'vimsanity-is-muted',
  SHOW_MOBILE_WARNING: 'vimsanity-show-mobile-warning',
}

function App() {
  // Initialize state from localStorage or use defaults
  const [showLandingPage, setShowLandingPage] = useState(() => {
    const savedValue = localStorage.getItem(STORAGE_KEYS.SHOW_LANDING_PAGE)
    return savedValue !== null ? savedValue === 'true' : true
  })

  const [showMobileWarning, setShowMobileWarning] = useState(() => {
    const savedValue = localStorage.getItem(STORAGE_KEYS.SHOW_MOBILE_WARNING)
    return savedValue !== null ? savedValue === 'true' : false
  })

  const [isSidebarOpen, setIsSidebarOpen] = useState(() => {
    const savedValue = localStorage.getItem(STORAGE_KEYS.SIDEBAR_OPEN)
    return savedValue !== null ? savedValue === 'true' : false
  })

  const [isDocSidebarOpen, setIsDocSidebarOpen] = useState(() => {
    const savedValue = localStorage.getItem(STORAGE_KEYS.DOC_SIDEBAR_OPEN)
    return savedValue !== null ? savedValue === 'true' : false
  })

  const [currentLevel, setCurrentLevel] = useState(() => {
    const savedValue = localStorage.getItem(STORAGE_KEYS.CURRENT_LEVEL)
    return savedValue !== null ? parseInt(savedValue, 10) : 0
  })

  const [isMuted, setIsMuted] = useState(() => {
    const savedValue = localStorage.getItem(STORAGE_KEYS.IS_MUTED)
    return savedValue !== null ? savedValue === 'true' : false
  })

  // Save state changes to localStorage
  useEffect(() => {
    localStorage.setItem(
      STORAGE_KEYS.SHOW_LANDING_PAGE,
      showLandingPage.toString(),
    )
  }, [showLandingPage])

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.SIDEBAR_OPEN, isSidebarOpen.toString())
  }, [isSidebarOpen])

  useEffect(() => {
    localStorage.setItem(
      STORAGE_KEYS.DOC_SIDEBAR_OPEN,
      isDocSidebarOpen.toString(),
    )
  }, [isDocSidebarOpen])

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.CURRENT_LEVEL, currentLevel.toString())
  }, [currentLevel])

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.IS_MUTED, isMuted.toString())
  }, [isMuted])

  useEffect(() => {
    localStorage.setItem(
      STORAGE_KEYS.SHOW_MOBILE_WARNING,
      showMobileWarning.toString(),
    )
  }, [showMobileWarning])

  // Custom state setters that update both state and localStorage
  const onCloseSidebar = () => {
    setIsSidebarOpen(false)
  }

  const onToggleSidebar = () => {
    setIsSidebarOpen(!isSidebarOpen)
  }

  const onCloseDocSidebar = () => {
    setIsDocSidebarOpen(false)
  }

  const onToggleDocSidebar = () => {
    setIsDocSidebarOpen(!isDocSidebarOpen)
  }

  const handleGetStarted = () => {
    // Check if user is on mobile device
    if (isMobile()) {
      setShowLandingPage(false)
      setShowMobileWarning(true)
    } else {
      setShowLandingPage(false)
      setShowMobileWarning(false)
    }
  }

  const handleReturnToLanding = () => {
    setShowLandingPage(true)
    setShowMobileWarning(false)
  }

  // If showing landing page, render only that
  if (showLandingPage) {
    return (
      <>
        <LandingPage onGetStarted={handleGetStarted} />
        <WIPBanner position="corner" />
        <Analytics />
      </>
    )
  }

  // If showing mobile warning, render that
  if (showMobileWarning) {
    return (
      <>
        <MobileWarning onReturnToLanding={handleReturnToLanding} />
        <Analytics />
      </>
    )
  }

  // Otherwise render the game interface
  return (
    <div className="min-h-screen bg-zinc-900 text-zinc-100 flex overflow-hidden">
      {/* Left Sidebar with AnimatePresence for smooth transitions */}
      <AnimatePresence mode="wait">
        {isSidebarOpen && (
          <motion.div
            className="fixed h-full bg-zinc-800 z-50 w-64 shadow-xl"
            initial={{ x: -320 }}
            animate={{ x: 0 }}
            exit={{ x: -320 }}
            transition={{
              type: 'spring',
              stiffness: 300,
              damping: 30,
              duration: 0.3,
            }}
          >
            <Sidebar
              currentLevel={currentLevel}
              setCurrentLevel={setCurrentLevel}
              isMuted={isMuted}
              setIsMuted={setIsMuted}
              onClose={onCloseSidebar}
              onReturnToLanding={handleReturnToLanding}
            />
          </motion.div>
        )}
      </AnimatePresence>

      {/* Right Documentation Sidebar */}
      <AnimatePresence mode="wait">
        {isDocSidebarOpen && (
          <motion.div
            className="fixed h-full bg-zinc-800 z-50 w-72 shadow-xl right-0"
            initial={{ x: 320 }}
            animate={{ x: 0 }}
            exit={{ x: 320 }}
            transition={{
              type: 'spring',
              stiffness: 300,
              damping: 30,
              duration: 0.3,
            }}
          >
            <DocumentationSidebar
              currentLevel={currentLevel}
              onClose={onCloseDocSidebar}
            />
          </motion.div>
        )}
      </AnimatePresence>

      {/* Backdrop overlay when sidebars are open on mobile */}
      <AnimatePresence>
        {(isSidebarOpen || isDocSidebarOpen) && (
          <motion.div
            className="md:hidden fixed inset-0 bg-black/50 z-40"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            onClick={() => {
              if (isSidebarOpen) onCloseSidebar()
              if (isDocSidebarOpen) onCloseDocSidebar()
            }}
          />
        )}
      </AnimatePresence>

      {/* Main Content with smooth transition */}
      <motion.div
        className="flex-1"
        initial={false}
        animate={{
          marginLeft: isSidebarOpen ? '16rem' : '0',
          marginRight: isDocSidebarOpen ? '18rem' : '0',
        }}
        transition={{
          type: 'spring',
          stiffness: 300,
          damping: 30,
          duration: 0.3,
        }}
      >
        <WIPBanner position="bottom" />
        {/* Left sidebar toggle button */}
        <motion.button
          onClick={onToggleSidebar}
          className="fixed top-4 left-4 z-50 p-2 bg-zinc-700 rounded-md hover:bg-zinc-600 shadow-md"
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          initial={false}
          animate={{
            x: isSidebarOpen ? -100 : 0,
            opacity: isSidebarOpen ? 0 : 1,
            rotate: isSidebarOpen ? -90 : 0,
          }}
          transition={{
            type: 'spring',
            stiffness: 400,
            damping: 25,
          }}
        >
          {isSidebarOpen ? <X size={24} /> : <Menu size={24} />}
        </motion.button>

        {/* Right documentation sidebar toggle button */}
        <motion.button
          onClick={onToggleDocSidebar}
          className="fixed top-4 right-4 z-50 p-2 bg-zinc-700 rounded-md hover:bg-zinc-600 shadow-md"
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          initial={false}
          animate={{
            x: isDocSidebarOpen ? 100 : 0,
            opacity: isDocSidebarOpen ? 0 : 1,
            rotate: isDocSidebarOpen ? 90 : 0,
          }}
          transition={{
            type: 'spring',
            stiffness: 400,
            damping: 25,
          }}
        >
          {isDocSidebarOpen ? <X size={24} /> : <BookOpen size={24} />}
        </motion.button>

        <main className="container mx-auto px-4 py-8 transition-all duration-300">
          <GameArea level={currentLevel} isMuted={isMuted} />
        </main>
      </motion.div>
      <Analytics />
    </div>
  )
}

export default App
