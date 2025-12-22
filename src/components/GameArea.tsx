import React, { useEffect, useState } from 'react'
import KeyboardVisualizerLevel0 from './levels/KeyboardVisualizerLevel0'
import GridMovementLevel from './levels/GridMovementLevel'
import WordMovementLevel from './levels/WordMovementLevel'
import LineOperations3 from './levels/LineOperations3'
import FindChars4 from './levels/FindChars4'
import SearchLevel5 from './levels/SearchLevel5'
import BasicInsertLevel6 from './levels/BasicInsertLevel6'
import LineInsertLevel7 from './levels/LineInsertLevel7'
import Recap8 from './levels/Level8/Recap8'
import UndoRedoLevel9 from './levels/Level9/UndoRedoLevel9'
import BasicDeleteLevel10 from './levels/BasicDeleteLevel10'
import AdvancedDeleteLevel11 from './levels/AdvancedDeleteLevel11'
import RecapLevel12 from './levels/RecapLevel12'
import TextObjectLevel14 from './levels/TextObjectLevel14'
import YankPutLevel15 from './levels/YankPutLevel15'
import PlaygroundLevel from './levels/PlaygroundLevel'

interface GameAreaProps {
  level: number
  isMuted: boolean
}

// Changelog version and message
const GAME_VERSION = '0.1.4'
const DATE_VERSION = '2025-12-22'

const CHANGELOG_MESSAGE = `
<b>What's New in ${GAME_VERSION} (${DATE_VERSION})</b><br/><br/>
- Level 0 Keyboard Visualizer improvements:<br/>
  • Mode switching now works! Toggle between Normal, Insert, and Visual modes<br/>
  • Added 45+ Visual mode commands (selection, operations, text objects)<br/>
  • Enhanced key press effect with color flash animation<br/>
  • Keys now highlight based on which commands exist in the current mode<br/><br/>
Thanks for playing!
`

// const CHANGELOG_MESSAGE = `
// <b>What's New in ${GAME_VERSION}</b><br/><br/>
// - Changelog 🍾 <br/>
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

  // Render the appropriate level component based on the current level
  const renderLevel = () => {
    switch (level) {
      case 0:
        return <KeyboardVisualizerLevel0 isMuted={isMuted} />
      case 1:
        return <GridMovementLevel isMuted={isMuted} />
      case 2:
        return <WordMovementLevel isMuted={isMuted} />
      case 3:
        return <LineOperations3 isMuted={isMuted} />
      case 4:
        return <FindChars4 isMuted={isMuted} />
      case 5:
        return <SearchLevel5 isMuted={isMuted} />
      case 6:
        return <BasicInsertLevel6 isMuted={isMuted} />
      case 7:
        return <LineInsertLevel7 isMuted={isMuted} />
      case 8:
        return <Recap8 />
      case 9:
        return <UndoRedoLevel9 />
      case 10:
        return <BasicDeleteLevel10 />
      case 11:
        return <AdvancedDeleteLevel11 />
      case 12:
        return <RecapLevel12 />
      case 13:
        return <PlaygroundLevel isMuted={isMuted} />
      case 14:
        return <TextObjectLevel14 />
      case 15:
        return <YankPutLevel15 />
      default:
        return <KeyboardVisualizerLevel0 isMuted={isMuted} />
    }
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
      {/* <div> */}
      {/*   <LevelTimer levelId={level} isActive={true} /> */}
      {/* </div> */}
    </div>
  )
}

export default GameArea
