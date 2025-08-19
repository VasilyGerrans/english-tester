"use client"

import { createContext, useContext, useEffect, useState } from "react"
import { disableGoogleAnalytics } from "@/lib/cookie-utils"

export type CookieConsent = {
  essential: boolean
  analytics: boolean
  advertising: boolean
}

export type CookieConsentStatus = "pending" | "accepted" | "declined"

interface CookieConsentContextType {
  consent: CookieConsent
  status: CookieConsentStatus
  updateConsent: (newConsent: Partial<CookieConsent>) => void
  acceptAll: () => void
  declineAll: () => void
  resetConsent: () => void
  hasConsent: (category: keyof CookieConsent) => boolean
}

const CookieConsentContext = createContext<CookieConsentContextType | undefined>(undefined)

const COOKIE_CONSENT_KEY = "cookie-consent"
const COOKIE_CONSENT_STATUS_KEY = "cookie-consent-status"

const defaultConsent: CookieConsent = {
  essential: true,
  analytics: false,
  advertising: false,
}

export function CookieConsentProvider({ children }: { children: React.ReactNode }) {
  const [consent, setConsent] = useState<CookieConsent>(defaultConsent)
  const [status, setStatus] = useState<CookieConsentStatus>("pending")
  const [isInitialized, setIsInitialized] = useState(false)
  const [previousAnalyticsConsent, setPreviousAnalyticsConsent] = useState<boolean | null>(null)

  useEffect(() => {
    if (typeof window === "undefined") return

    try {
      const savedConsent = localStorage.getItem(COOKIE_CONSENT_KEY)
      const savedStatus = localStorage.getItem(COOKIE_CONSENT_STATUS_KEY)

      if (savedConsent) {
        const parsedConsent = { ...defaultConsent, ...JSON.parse(savedConsent) }
        setConsent(parsedConsent)
        setPreviousAnalyticsConsent(parsedConsent.analytics)
      }

      if (savedStatus) {
        setStatus(savedStatus as CookieConsentStatus)
      }

      setIsInitialized(true)
    } catch (error) {
      console.error("Failed to load cookie consent:", error)
      setIsInitialized(true)
    }
  }, [])

  useEffect(() => {
    if (!isInitialized || typeof window === "undefined") return

    try {
      localStorage.setItem(COOKIE_CONSENT_KEY, JSON.stringify(consent))
      localStorage.setItem(COOKIE_CONSENT_STATUS_KEY, status)
    } catch (error) {
      console.error("Failed to save cookie consent:", error)
    }
  }, [consent, status, isInitialized])

  useEffect(() => {
    if (!isInitialized || typeof window === "undefined" || previousAnalyticsConsent === null) return

    if (previousAnalyticsConsent && !consent.analytics) {
      disableGoogleAnalytics()
    }
    
    setPreviousAnalyticsConsent(consent.analytics)
  }, [consent.analytics, isInitialized, previousAnalyticsConsent])

  const updateConsent = (newConsent: Partial<CookieConsent>) => {
    setConsent(prev => ({ ...prev, ...newConsent }))
    setStatus("accepted")
  }

  const acceptAll = () => {
    setConsent({
      essential: true,
      analytics: true,
      advertising: true,
    })
    setStatus("accepted")
  }

  const declineAll = () => {
    setConsent({
      essential: true,
      analytics: false,
      advertising: false,
    })
    setStatus("declined")
  }

  const resetConsent = () => {
    setConsent(defaultConsent)
    setStatus("pending")
  }

  const hasConsent = (category: keyof CookieConsent): boolean => {
    return consent[category] || false
  }

  return (
    <CookieConsentContext.Provider
      value={{
        consent,
        status,
        updateConsent,
        acceptAll,
        declineAll,
        resetConsent,
        hasConsent,
      }}
    >
      {children}
    </CookieConsentContext.Provider>
  )
}

export function useCookieConsent() {
  const context = useContext(CookieConsentContext)
  if (context === undefined) {
    throw new Error("useCookieConsent must be used within a CookieConsentProvider")
  }
  return context
} 