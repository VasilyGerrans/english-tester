"use client"

import { useEffect } from "react"
import { usePathname, useSearchParams } from "next/navigation"
import { useCookieConsent } from "@/hooks/use-cookie-consent"

declare global {
  interface Window {
    gtag: (command: string, targetId: string, config?: any) => void
  }
}

export function Analytics() {
  const pathname = usePathname()
  const searchParams = useSearchParams()
  const gaId = process.env.NEXT_PUBLIC_GA_ID
  const { hasConsent } = useCookieConsent()

  useEffect(() => {
    if (!gaId || typeof window.gtag === "undefined" || !hasConsent("analytics")) return

    const url = pathname + searchParams.toString()

    // Track page view
    window.gtag("config", gaId, {
      page_path: url,
    })
  }, [pathname, searchParams, gaId, hasConsent])

  return null
}
