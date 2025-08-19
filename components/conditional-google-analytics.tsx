"use client"

import { useEffect, useState, useRef } from "react"
import { GoogleAnalytics } from "@next/third-parties/google"
import { useCookieConsent } from "@/hooks/use-cookie-consent"
import { disableGoogleAnalytics, enableGoogleAnalytics } from "@/lib/cookie-utils"

export function ConditionalGoogleAnalytics() {
  const gaId = process.env.NEXT_PUBLIC_GA_ID
  const { hasConsent, status } = useCookieConsent()
  const [shouldLoad, setShouldLoad] = useState(false)
  const [hasLoaded, setHasLoaded] = useState(false)
  const [wasDisabled, setWasDisabled] = useState(false)
  const [key, setKey] = useState(0) // Force re-render when needed
  const previousConsent = useRef<boolean | null>(null)

  // Handle consent changes
  useEffect(() => {
    if (status === "pending") {
      // Don't load analytics until user makes a choice
      setShouldLoad(false)
      return
    }

    const currentConsent = hasConsent("analytics")
    
    if (currentConsent) {
      // If analytics was previously disabled, re-enable it
      if (wasDisabled) {
        enableGoogleAnalytics()
        setWasDisabled(false)
        // Force re-render to reload Google Analytics
        setKey(prev => prev + 1)
      }
      setShouldLoad(true)
    } else {
      // Only disable if analytics was previously loaded
      if (hasLoaded) {
        disableGoogleAnalytics()
        setWasDisabled(true)
      }
      setShouldLoad(false)
    }

    previousConsent.current = currentConsent
  }, [hasConsent, status, hasLoaded, wasDisabled])

  // Track if analytics has been loaded
  useEffect(() => {
    if (shouldLoad && !hasLoaded) {
      setHasLoaded(true)
    }
  }, [shouldLoad, hasLoaded])

  // Only load Google Analytics if user has consented to analytics cookies
  if (!gaId || !shouldLoad) {
    return null
  }

  return <GoogleAnalytics key={key} gaId={gaId} />
} 