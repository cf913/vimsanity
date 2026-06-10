import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import posthog from 'posthog-js'
import AppRouter from './AppRouter.tsx'
import './index.css'
import { PostHogErrorBoundary, PostHogProvider } from 'posthog-js/react'

// Only wire PostHog when a key is configured — otherwise it logs an
// "initialized without a token" error on every load. Components read it through
// the optional usePostHog() hook, so they stay safe without the provider.
// Init eagerly (not via PostHogProvider's apiKey prop, which defers init to a
// useEffect): child mount effects run before the provider's effect, so v2
// track() calls on first paint would otherwise fire before init and be lost.
const posthogKey = import.meta.env.VITE_PUBLIC_POSTHOG_KEY
if (posthogKey) {
  posthog.init(posthogKey, {
    api_host: import.meta.env.VITE_PUBLIC_POSTHOG_HOST,
    ui_host: import.meta.env.VITE_PUBLIC_POSTHOG_UI_HOST,
    debug: import.meta.env.MODE === 'development',
  })
}

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    {posthogKey ? (
      <PostHogProvider client={posthog}>
        <PostHogErrorBoundary>
          <AppRouter />
        </PostHogErrorBoundary>
      </PostHogProvider>
    ) : (
      <AppRouter />
    )}
  </StrictMode>,
)
