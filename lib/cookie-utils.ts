export type CookieConsent = {
  essential: boolean
  analytics: boolean
  advertising: boolean
}

const COOKIE_CONSENT_KEY = "cookie-consent"

export function getCookieConsent(): CookieConsent {
  if (typeof window === "undefined") {
    return {
      essential: true,
      analytics: false,
      advertising: false,
    }
  }

  try {
    const savedConsent = localStorage.getItem(COOKIE_CONSENT_KEY)
    if (savedConsent) {
      return { ...JSON.parse(savedConsent) }
    }
  } catch (error) {
    console.error("Failed to load cookie consent:", error)
  }

  return {
    essential: true,
    analytics: false,
    advertising: false,
  }
}

export function hasCookieConsent(category: keyof CookieConsent): boolean {
  const consent = getCookieConsent()
  return consent[category] || false
}

// Store original functions to restore them later
let originalGtag: any = null
let originalSendBeacon: any = null
let originalFetch: any = null
let isDisabled = false

export function disableGoogleAnalytics(): void {
  if (typeof window === "undefined" || isDisabled) return

  try {
    // Store original functions before overriding
    if (window.gtag && !originalGtag) {
      originalGtag = window.gtag
    }
    if (navigator.sendBeacon && !originalSendBeacon) {
      originalSendBeacon = navigator.sendBeacon
    }
    if (window.fetch && !originalFetch) {
      originalFetch = window.fetch
    }

    // Remove Google Analytics scripts from DOM
    const scripts = document.querySelectorAll('script')
    scripts.forEach(script => {
      const src = script.getAttribute('src') || ''
      const content = script.textContent || ''
      
      if (src.includes('google-analytics.com') || 
          src.includes('googletagmanager.com') ||
          content.includes('google-analytics.com') ||
          content.includes('googletagmanager.com') ||
          content.includes('gtag') ||
          content.includes('ga(')) {
        script.remove()
      }
    })

    // Clear Google Analytics cookies
    const cookiesToDelete = [
      '_ga',
      '_ga_*',
      '_gid',
      '_gat',
      'AMP_TOKEN',
      '_gac_*',
      '__utma',
      '__utmb',
      '__utmc',
      '__utmz',
      '__utmv',
      '__utmx',
      '__utmxx'
    ]

    // Delete cookies by setting them to expire in the past
    cookiesToDelete.forEach(cookieName => {
      if (cookieName.includes('*')) {
        // Handle wildcard cookies
        const allCookies = document.cookie.split(';')
        allCookies.forEach(cookie => {
          const [name] = cookie.split('=')
          if (name.trim().startsWith(cookieName.replace('*', ''))) {
            document.cookie = `${name.trim()}=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;`
          }
        })
      } else {
        document.cookie = `${cookieName}=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;`
        document.cookie = `${cookieName}=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/; domain=.${window.location.hostname};`
      }
    })

    if (window.gtag) {
      window.gtag = function() {
        // Do nothing - this prevents any Google Analytics calls
      }
    }

    if (navigator.sendBeacon) {
      navigator.sendBeacon = function(url: string | URL, data?: BodyInit): boolean {
        const urlString = url.toString()
        if (urlString.includes('google-analytics.com') || 
            urlString.includes('googletagmanager.com') || 
            urlString.includes('doubleclick.net') ||
            urlString.includes('googleadservices.com')) {
          return true
        }
        return originalSendBeacon ? originalSendBeacon(url, data) : true
      }
    }

    if (window.fetch) {
      window.fetch = function(input: RequestInfo | URL, init?: RequestInit): Promise<Response> {
        const url = typeof input === 'string' ? input : input.toString()
        
        if (url.includes('google-analytics.com') || 
            url.includes('googletagmanager.com') || 
            url.includes('doubleclick.net') ||
            url.includes('googleadservices.com')) {
          return Promise.resolve(new Response('', { status: 200 }))
        }
        
        return originalFetch ? originalFetch(input, init) : Promise.resolve(new Response('', { status: 200 }))
      }
    }

    // Clear localStorage items that might contain analytics data
    const localStorageKeysToDelete = [
      '_ga',
      '_gid',
      'ga_*'
    ]

    localStorageKeysToDelete.forEach(key => {
      if (key.includes('*')) {
        // Handle wildcard keys
        Object.keys(localStorage).forEach(storageKey => {
          if (storageKey.startsWith(key.replace('*', ''))) {
            localStorage.removeItem(storageKey)
          }
        })
      } else {
        localStorage.removeItem(key)
      }
    })

    isDisabled = true
  } catch (error) {
    console.error('Failed to disable Google Analytics:', error)
  }
}

export function enableGoogleAnalytics(): void {
  if (typeof window === "undefined" || !isDisabled) return

  try {
    if (originalGtag) {
      window.gtag = originalGtag
      originalGtag = null
    }
    if (originalSendBeacon) {
      navigator.sendBeacon = originalSendBeacon
      originalSendBeacon = null
    }
    if (originalFetch) {
      window.fetch = originalFetch
      originalFetch = null
    }

    isDisabled = false
  } catch (error) {
    console.error('Failed to enable Google Analytics:', error)
  }
} 