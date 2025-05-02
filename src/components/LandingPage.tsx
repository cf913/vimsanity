import React from "react"
import { ArrowRight } from "lucide-react"

interface LandingPageProps {
  onGetStarted: () => void
}

const LandingPage: React.FC<LandingPageProps> = ({ onGetStarted }) => {
  return (
    <div className="min-h-screen w-full flex flex-col items-center justify-center bg-zinc-900 text-zinc-100 px-4 sm:px-6 lg:px-8">
      <div className="max-w-3xl w-full text-center space-y-8">
        <h1 className="text-4xl sm:text-5xl md:text-6xl font-extrabold tracking-tight">
          <span className="block">Welcome to</span>
          <span className="block text-emerald-400 mt-2">VimSanity</span>
        </h1>

        <p className="text-xl sm:text-2xl text-zinc-300 mt-6 max-w-2xl mx-auto">
          Master Vim motions through interactive gameplay and become a text
          editing ninja.
        </p>

        <div className="mt-8 space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-left">
            <div className="bg-zinc-800 p-5 rounded-lg">
              <h3 className="text-lg font-medium text-emerald-400">
                Learn by Doing
              </h3>
              <p className="mt-2 text-zinc-400">
                Practice Vim motions in a fun, interactive environment
              </p>
            </div>
            <div className="bg-zinc-800 p-5 rounded-lg">
              <h3 className="text-lg font-medium text-emerald-400">
                Progressive Challenges
              </h3>
              <p className="mt-2 text-zinc-400">
                Start with basics and advance to complex movement patterns
              </p>
            </div>
            <div className="bg-zinc-800 p-5 rounded-lg">
              <h3 className="text-lg font-medium text-emerald-400">
                Instant Feedback
              </h3>
              <p className="mt-2 text-zinc-400">
                See your progress and improve with each session
              </p>
            </div>
          </div>
        </div>

        <div className="mt-10">
          <button
            onClick={onGetStarted}
            className="inline-flex items-center px-8 py-4 border border-transparent text-base font-medium rounded-md text-black bg-emerald-400 hover:bg-emerald-500 transition-colors duration-300"
            aria-label="Get started with VimSanity"
          >
            Get Started <ArrowRight className="ml-2" size={20} />
          </button>
        </div>
      </div>

      {/* SEO-friendly footer with additional info */}
      <footer className="fixed bottom-0 left-0 right-0 py-6 w-full">
        <div className="text-center text-zinc-500 text-sm">
          <p>VimSanity - The interactive way to master Vim motions</p>
          <p className="mt-1">
            Improve your productivity with keyboard-driven text editing
          </p>
        </div>
      </footer>
    </div>
  )
}

export default LandingPage
