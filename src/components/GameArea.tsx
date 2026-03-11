import React, { useEffect, useState } from 'react'
import { getLevelById } from '../levels/registry'

interface GameAreaProps {
  level: number
  isMuted: boolean
}

// Changelog version and message
const GAME_VERSION = '0.1.6'
const DATE_VERSION = '2026-01-03'

const CHANGELOG_MESSAGE = `
<b>What's New in ${GAME_VERSION} (${DATE_VERSION})</b><br/><br/>
- Fixed crash on level completion<br/><br/>
Thanks for playing!
`

// const CHANGELOG_MESSAGE = `
// <b>What's New in ${GAME_VERSION}</b><br/><br/>
// - Changelog <br/>
// - Session history for level 1 and 2<br/>
// and coming soon for level 3-7<br/>
// - Level 7 is now complete!<br/>
// - Bug fixes and polish<br/><br/>
// Thanks for playing!
// `

const CHANGELOG_LOCALSTORAGE_KEY = 'vimsanity_last_seen_version'

const GameArea: React.FC<GameAreaProps> = ({ level, isMuted }) => {
  // Changelog popup state
  const [showChangelog, setShowChangelog] = useState(false)

  useEffect(() => {
    const lastSeen = localStorage.getItem(CHANGELOG_LOCALSTORAGE_KEY)
    if (lastSeen !== GAME_VERSION) {
      setShowChangelog(true)
    }
  }, [])

  const dismissChangelog = () => {
    localStorage.setItem(CHANGELOG_LOCALSTORAGE_KEY, GAME_VERSION)
    setShowChangelog(false)
  }

  // Render the appropriate level component from the registry
  const renderLevel = () => {
    const entry = getLevelById(level) ?? getLevelById(0)
    if (!entry) return null
    const Component = entry.component
    return <Component isMuted={isMuted} />
  }

  return (
    <div className="flex flex-col items-center gap-8 relative">
      {/* Changelog Popup */}
      {showChangelog && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm animate-fade-in"
          role="dialog"
          aria-modal="true"
          tabIndex={-1}
          onKeyDown={(e) => {
            if (e.key === 'Escape') dismissChangelog()
          }}
        >
          {/* Sparkle animation */}
          {/* Only a single emerald star accent, no background sparkles */}
          <div className="relative z-10 bg-bg-primary bg-opacity-95 rounded-2xl shadow-2xl border-2 border-emerald-500 p-8 max-w-md w-full flex flex-col items-center animate-scale-in font-mono">
            <div
              className="text-text-secondary text-base mb-5 leading-relaxed w-full text-left"
              dangerouslySetInnerHTML={{ __html: CHANGELOG_MESSAGE }}
            />
            <button
              className="mt-4 px-6 py-2 bg-bg-secondary border-2 border-emerald-500 text-emerald-400 font-semibold rounded-xl shadow hover:bg-bg-tertiary hover:text-emerald-300 transition-all duration-200 text-lg focus:outline-none focus:ring-2 focus:ring-emerald-500/50 active:scale-95"
              onClick={dismissChangelog}
              autoFocus
            >
              Got it!
            </button>
          </div>
          <style>{`
      @keyframes fade-in {
        0% { opacity: 0; }
        100% { opacity: 1; }
      }
      .animate-fade-in {
        animation: fade-in 0.4s cubic-bezier(.4,0,.2,1);
      }
      @keyframes scale-in {
        0% { opacity: 0; transform: scale(0.92); }
        100% { opacity: 1; transform: scale(1); }
      }
      .animate-scale-in {
        animation: scale-in 0.35s cubic-bezier(.4,0,.2,1);
      }
      @keyframes sparkle {
        0%, 100% { opacity: 0.7; transform: scale(1) rotate(0deg); }
        50% { opacity: 1; transform: scale(1.15) rotate(10deg); }
      }
      .animate-sparkle { animation: sparkle 2.5s infinite ease-in-out; }
      @keyframes sparkle2 {
        0%, 100% { opacity: 0.5; transform: scale(1) rotate(0deg); }
        50% { opacity: 0.9; transform: scale(1.25) rotate(-10deg); }
      }
      .animate-sparkle2 { animation: sparkle2 3.2s infinite ease-in-out; }
    `}</style>
        </div>
      )}

      <div className="text-center">
        <h2 className="text-3xl font-bold mb-2">Level {level}</h2>
      </div>

      {/* Only render the level if the changelog is not open */}
      {!showChangelog && renderLevel()}
    </div>
  )
}

export default GameArea
