/**
 * Utility function to detect if the current device is a mobile device
 * This checks both screen size and user agent to determine if the user is on a mobile device
 */
export const isMobile = (): boolean => {
  // Check if window is available (for SSR compatibility)
  if (typeof window === 'undefined') {
    return false
  }

  // Check screen width - common mobile breakpoint
  const isMobileWidth = window.innerWidth < 768

  // Check user agent for mobile devices
  const isMobileUserAgent = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(
    navigator.userAgent
  )

  // Return true if either condition is met
  return isMobileWidth || isMobileUserAgent
}
