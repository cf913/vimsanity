import React, { useState } from "react";
import { Menu, X } from "lucide-react";
import Sidebar from "./components/Sidebar";
import GameArea from "./components/GameArea";
import LandingPage from "./components/LandingPage";
import { Analytics } from "@vercel/analytics/react";
import { motion, AnimatePresence } from "framer-motion";

function App() {
  const [showLandingPage, setShowLandingPage] = useState(true);
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [currentLevel, setCurrentLevel] = useState(0);
  const [isMuted, setIsMuted] = useState(false);

  const onCloseSidebar = () => {
    setIsSidebarOpen(false);
  };

  const onToggleSidebar = () => {
    setIsSidebarOpen(!isSidebarOpen);
  };

  const handleGetStarted = () => {
    setShowLandingPage(false);
  };

  const handleReturnToLanding = () => {
    setShowLandingPage(true);
  };

  // If showing landing page, render only that
  if (showLandingPage) {
    return (
      <>
        <LandingPage onGetStarted={handleGetStarted} />
        <Analytics />
      </>
    );
  }

  // Otherwise render the game interface
  return (
    <div className="min-h-screen bg-zinc-900 text-zinc-100 flex overflow-hidden">
      {/* Sidebar with AnimatePresence for smooth transitions */}
      <AnimatePresence mode="wait">
        {isSidebarOpen && (
          <motion.div
            className="fixed h-full bg-zinc-800 z-50 w-64 shadow-xl"
            initial={{ x: -320 }}
            animate={{ x: 0 }}
            exit={{ x: -320 }}
            transition={{ 
              type: "spring", 
              stiffness: 300, 
              damping: 30,
              duration: 0.3
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

      {/* Backdrop overlay when sidebar is open on mobile */}
      <AnimatePresence>
        {isSidebarOpen && (
          <motion.div 
            className="md:hidden fixed inset-0 bg-black/50 z-40"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            onClick={onCloseSidebar}
          />
        )}
      </AnimatePresence>

      {/* Main Content with smooth transition */}
      <motion.div
        className="flex-1"
        initial={false}
        animate={{ 
          marginLeft: isSidebarOpen ? "16rem" : "0" 
        }}
        transition={{ 
          type: "spring", 
          stiffness: 300, 
          damping: 30,
          duration: 0.3
        }}
      >
        <motion.button
          onClick={onToggleSidebar}
          className="fixed top-4 left-4 z-50 p-2 bg-zinc-700 rounded-md hover:bg-zinc-600 shadow-md"
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          initial={false}
          animate={{ 
            x: isSidebarOpen ? -100 : 0,
            opacity: isSidebarOpen ? 0 : 1,
            rotate: isSidebarOpen ? -90 : 0
          }}
          transition={{ 
            type: "spring", 
            stiffness: 400, 
            damping: 25 
          }}
        >
          {isSidebarOpen ? <X size={24} /> : <Menu size={24} />}
        </motion.button>

        <main className="container mx-auto px-4 py-8 transition-all duration-300">
          <GameArea level={currentLevel} isMuted={isMuted} />
        </main>
      </motion.div>
      <Analytics />
    </div>
  );
}

export default App;
