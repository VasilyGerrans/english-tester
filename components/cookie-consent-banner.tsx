"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Switch } from "@/components/ui/switch"
import { Label } from "@/components/ui/label"
import { Separator } from "@/components/ui/separator"
import { useCookieConsent } from "@/hooks/use-cookie-consent"

export function CookieConsentBanner() {
  const { consent, status, updateConsent, acceptAll, declineAll } = useCookieConsent()
  const [showDetails, setShowDetails] = useState(false)
  const [tempConsent, setTempConsent] = useState(consent)

  // Update tempConsent when consent changes
  useEffect(() => {
    setTempConsent(consent)
  }, [consent])

  // Don't show if user has already made a choice
  if (status !== "pending") {
    return null
  }

  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 bg-white border-t border-gray-200 shadow-lg">
      <div className="container mx-auto px-4 py-6">
        <div className="max-w-4xl mx-auto">
          {/* Main banner */}
          <div className="flex flex-col gap-4">
            <div className="flex items-start justify-between gap-4">
              <div className="flex-1">
                <h3 className="text-lg font-semibold text-gray-900 mb-2">
                  We use cookies to enhance your experience
                </h3>
                <p className="text-sm text-gray-600">
                  We use cookies to help our website function properly, analyze site usage, and provide personalized content. 
                  You can choose which types of cookies to allow below.
                </p>
              </div>
            </div>

            {/* Quick actions */}
            <div className="flex flex-wrap gap-3">
              <Button onClick={acceptAll} size="sm">
                Accept All
              </Button>
              <Button onClick={declineAll} variant="outline" size="sm">
                Decline All
              </Button>
              <Button 
                onClick={() => setShowDetails(!showDetails)} 
                variant="ghost" 
                size="sm"
              >
                {showDetails ? "Hide Details" : "Customize"}
              </Button>
            </div>

            {/* Detailed options */}
            {showDetails && (
              <div className="mt-4 p-4 bg-gray-50 rounded-lg">
                <div className="space-y-4">
                  {/* Essential cookies - always enabled */}
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <Label className="text-sm font-medium">Essential Cookies</Label>
                      <p className="text-xs text-gray-500 mt-1">
                        Required for the website to function properly. These cannot be disabled.
                      </p>
                    </div>
                    <Switch checked={true} disabled />
                  </div>

                  <Separator />

                  {/* Analytics cookies */}
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <Label className="text-sm font-medium">Analytics Cookies</Label>
                      <p className="text-xs text-gray-500 mt-1">
                        Help us understand how visitors interact with our website using Google Analytics.
                      </p>
                    </div>
                    <Switch 
                      checked={tempConsent.analytics}
                      onCheckedChange={(checked) => setTempConsent(prev => ({ ...prev, analytics: checked }))}
                    />
                  </div>

                  

                  {/* Advertising cookies */}
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <Label className="text-sm font-medium">Advertising Cookies</Label>
                      <p className="text-xs text-gray-500 mt-1">
                        Used to deliver relevant advertisements through Google AdSense.
                      </p>
                    </div>
                    <Switch 
                      checked={tempConsent.advertising}
                      onCheckedChange={(checked) => setTempConsent(prev => ({ ...prev, advertising: checked }))}
                    />
                  </div>
                </div>

                <div className="mt-4 pt-4 border-t border-gray-200">
                  <div className="flex flex-wrap gap-3">
                    <Button 
                      onClick={() => updateConsent(tempConsent)} 
                      variant="default" 
                      size="sm"
                    >
                      Save Preferences
                    </Button>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
} 