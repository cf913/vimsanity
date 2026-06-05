import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import AppRouter from './AppRouter.tsx'
import './index.css'
import { PostHogErrorBoundary, PostHogProvider } from 'posthog-js/react'

// Only wire PostHog when a key is configured — otherwise it logs an
// "initialized without a token" error on every load. Components read it through
// the optional usePostHog() hook, so they stay safe without the provider.
const posthogKey = import.meta.env.VITE_PUBLIC_POSTHOG_KEY

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    {posthogKey ? (
      <PostHogProvider
        apiKey={posthogKey}
        options={{
          api_host: import.meta.env.VITE_PUBLIC_POSTHOG_HOST,
          ui_host: import.meta.env.VITE_PUBLIC_POSTHOG_UI_HOST,
          debug: import.meta.env.MODE === 'development',
        }}
      >
        <PostHogErrorBoundary>
          <AppRouter />
        </PostHogErrorBoundary>
      </PostHogProvider>
    ) : (
      <AppRouter />
    )}
  </StrictMode>,
)
