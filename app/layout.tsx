import type React from "react"
import type { Metadata } from "next"
import { Inter } from "next/font/google"
import { CookieConsentProvider } from "@/hooks/use-cookie-consent"
import { CookieConsentBanner } from "@/components/cookie-consent-banner"
import { CookieSettings } from "@/components/cookie-settings"
import { ConditionalGoogleAnalytics } from "@/components/conditional-google-analytics"
import "./globals.css"

const inter = Inter({ subsets: ["latin"] })

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000";
const imageUrl = `${siteUrl}/logo_og.jpg`;
const siteDescription = "The Open-Access Library of Free English Grammar Tests"

export const metadata: Metadata = {
  title: "English Tester",
  description: siteDescription,
  generator: 'v0.dev',
  icons: {
    icon: '/logo.svg',
    shortcut: '/logo.svg',
    apple: '/logo.svg',
  },
  openGraph: {
    title: "English Tester",
    description: siteDescription,
    images: [
      {
        url: imageUrl,
        width: 1200,
        height: 630,
        alt: 'English Tester Logo',
        type: 'image/jpeg',
      },
    ],
  },
  twitter: {
    card: 'summary',
    title: "English Tester",
    description: siteDescription,
    images: [imageUrl],
  },
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <head>
        <meta property="og:image" content={imageUrl} />
        <meta property="og:image:width" content="1200" />
        <meta property="og:image:height" content="630" />
        <meta property="og:type" content="website" />
        <meta property="og:url" content="https://english-tester.com" />
      </head>
      <body className={inter.className}>
        <CookieConsentProvider>
          {children}
          <CookieConsentBanner />
          <CookieSettings />
          <ConditionalGoogleAnalytics />
        </CookieConsentProvider>
      </body>
    </html>
  )
}
