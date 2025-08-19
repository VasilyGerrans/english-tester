import { redirect } from "next/navigation"
import { db } from "@/lib/db"

interface TypeRedirectPageProps {
  params: {
    branch: string
    level: string
    topic: string
    type: string
  }
}

export default async function TypeRedirectPage({ params }: TypeRedirectPageProps) {
  const { branch, level, topic } = params

  const topicMap = await db.getTopicMap()

  const topicData = topicMap[branch][level].find(t => t.topic.topic === topic);

  if (!topicData) {
    redirect('/')
  }

  redirect(`/${topicData.href}/`)
}

export async function generateStaticParams() {
  const topicMap = await db.getTopicMap()
  const params = []

  for (const [branch, levels] of Object.entries(topicMap)) {
    for (const level of Object.keys(levels)) {
      for (const topic of levels[level]) {
        for (const test of topic.tests) {
          params.push({
            branch,
            level,
            topic: topic.topic.topic,
            type: test.testTypeSlug,
          })
        }
      }
    }
  }

  return params
}
