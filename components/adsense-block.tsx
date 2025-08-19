"use client"

import { useCookieConsent } from "@/hooks/use-cookie-consent"

export function AdSenseBlock() {
  const adsenseId = process.env.NEXT_PUBLIC_ADSENSE_ID
  const { hasConsent } = useCookieConsent()

  if (!adsenseId || !hasConsent("advertising")) {
    return null
  }

  return (
    <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
      <div className="text-center text-xs text-gray-400 mb-2">Advertisement</div>
      <div className="bg-white border border-gray-200 rounded p-8 text-center text-gray-400 text-sm">
        AdSense Block ({adsenseId})
      </div>
    </div>
  )
}
