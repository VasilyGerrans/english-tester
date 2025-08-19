"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Switch } from "@/components/ui/switch"
import { Label } from "@/components/ui/label"
import { Separator } from "@/components/ui/separator"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { useCookieConsent } from "@/hooks/use-cookie-consent"

export function CookieSettings() {
  const { consent, updateConsent, acceptAll, declineAll, resetConsent } = useCookieConsent()
  const [open, setOpen] = useState(false)
  const [tempConsent, setTempConsent] = useState(consent)

  useEffect(() => {
    const handleOpenCookieSettings = () => {
      setOpen(true)
      setTempConsent(consent)
    }

    document.addEventListener('openCookieSettings', handleOpenCookieSettings)
    return () => {
      document.removeEventListener('openCookieSettings', handleOpenCookieSettings)
    }
  }, [consent])

  const handleSave = () => {
    updateConsent(tempConsent)
    setOpen(false)
  }

  const handleReset = () => {
    resetConsent()
    setOpen(false)
  }

  const handleOpenChange = (newOpen: boolean) => {
    setOpen(newOpen)
    if (newOpen) {
      setTempConsent(consent)
    }
  }

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Cookie Preferences</DialogTitle>
        </DialogHeader>
        
        <div className="space-y-4">
          <p className="text-sm text-gray-600">
            Manage your cookie preferences. You can change these settings at any time.
          </p>

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

          <Separator />

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

          <Separator />

          <div className="flex gap-2">
            <Button onClick={handleSave} className="flex-1">
              Save Preferences
            </Button>
            <Button onClick={handleReset} variant="outline" size="sm">
              Reset
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
} 