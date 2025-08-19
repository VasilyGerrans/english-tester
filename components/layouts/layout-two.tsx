import type { ReactNode } from "react"
import { Header } from "../header"
import { Footer } from "../footer"
import { Sidebar } from "../sidebar"
import { RecommendationBar } from "../recommendation-bar"
import { AdSenseBlock } from "../adsense-block"

interface LayoutTwoProps {
  children: ReactNode
  topicData: {
    branch: string
    level: string
    topic: string
    title: string
    refUrl?: string | null
    refText?: string | null
    description?: string | null
  }
  relatedTopics: Array<{
    related_id: number
    title: string
    branch: string
    level: string
    href: string
  }>
  testsByType: Array<{
    testType: {
      slug: string
      title: string
    }
    tests: Array<{
      id: number
      title: string
      themeSlug: string
    }>
  }>
  currentTest?: {
    type: string
    theme: string
  }
}

export function LayoutTwo({ children, topicData, relatedTopics, testsByType, currentTest }: LayoutTwoProps) {
  const hasRelatedTopics = relatedTopics.length > 0
  const hasAdsense = !!process.env.NEXT_PUBLIC_ADSENSE_ID

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <Header />
      <main className="container mx-auto px-4 py-8 flex-1">
        <div className="grid gap-8 grid-cols-1 lg:grid-cols-4">
          <div className="lg:col-span-1">
            <Sidebar topicData={topicData} testsByType={testsByType} currentTest={currentTest} />
          </div>

          <div className="lg:col-span-2">
            <div className="bg-white rounded-lg shadow-sm border p-8">{children}</div>
            {hasAdsense && (
              <div className="mt-8">
                <AdSenseBlock />
              </div>
            )}
          </div>

          <div className="lg:col-span-1">
            {hasRelatedTopics && (
              <>
                <RecommendationBar relatedTopics={relatedTopics} />
                {hasAdsense && (
                  <div className="mt-8">
                    <AdSenseBlock />
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      </main>
      <Footer />
    </div>
  )
}
