import { db } from "@/lib/db"
import { LayoutOne } from "@/components/layouts/layout-one"
import { TopicList } from "@/components/topic-list"
import { Suspense } from "react"

export default async function HomePage() {
  const siteName = process.env.NEXT_PUBLIC_SITE_NAME || "English Tester"

  return (
    <LayoutOne>
      <div className="space-y-8">
        <div className="text-center space-y-6">
          <h1 className="text-4xl font-bold text-gray-900">Welcome to {siteName}</h1>
          <p className="text-base font-medium text-gray-500 max-w-2xl mx-auto leading-relaxed">
            The Open-Access Library of Free English Grammar Tests
          </p>
        </div>
        <Suspense fallback={<TopicList topicMap={null} />}>
          <TopicListWrapper />
        </Suspense>
      </div>
    </LayoutOne>
  )
}

async function TopicListWrapper() {
  const topicMap = await db.getTopicMap()
  return <TopicList topicMap={topicMap} />
}

export const metadata = {
  title: process.env.NEXT_PUBLIC_SITE_NAME || "English Tester",
  description: "The Open-Access Library of Free English Grammar Tests",
}
