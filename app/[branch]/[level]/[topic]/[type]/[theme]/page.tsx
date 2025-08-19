import { redirect } from "next/navigation"
import { db } from "@/lib/db"
import { LayoutTwo } from "@/components/layouts/layout-two"
import { MultipleChoice10Sentences } from "@/test-types/multiple-choice-10-sentences/render"
import { getTestsByType } from "@/lib/utils"
import { MultipleChoice10 } from "@/lib/db/schema"

interface TestPageProps {
  params: Promise<{
    branch: string
    level: string
    topic: string
    type: string
    theme: string
  }>
}

export default async function TestPage({ params }: TestPageProps) {
  const { branch, level, topic, type, theme } = await params

  let TestComponent
  switch (type) {
    case "multiple-choice-10-sentences":
      TestComponent = MultipleChoice10Sentences
      break
    default:
      redirect('/')
  }

  const topicData = await db.getTopicByPath(branch, level, topic)

  if (!topicData) {
    redirect('/')
  }

  const testData = await db.getTestByPath(topicData.id, type, theme)

  const topicTestData = await db.getTestsByTopicIdWithQuestionCount(topicData.id)

  if (!testData) {
    redirect(`/${branch}/${level}/${topic}/`)
  }

  // Validate that multiple-choice-10-sentences tests have exactly 10 questions
  if (type === "multiple-choice-10-sentences" && testData.question_count !== 10) {
    redirect(`/${branch}/${level}/${topic}/`)
  }

  // Fetch multiple_choice_10 entries for this test
  let questions: MultipleChoice10[] = []
  if (type === "multiple-choice-10-sentences") {
    questions = await db.getMultipleChoice10ByTestId(testData.id)
  }

  const topicMap = await db.getTopicMap();

  const testsByType = getTestsByType(topicTestData)

  const relatedTopics = topicMap[branch][level].find(t => t.topic.id === topicData.id)?.relatedTopics;

  if (!relatedTopics) throw Error("Error!")

  return (
    <LayoutTwo
      topicData={{
        branch,
        level,
        topic,
        title: testData.themeTitle,
        description: topicData.description,
        refUrl: topicData.ref_url,
        refText: topicData.ref_text,
      }}
      relatedTopics={relatedTopics}
      testsByType={testsByType}
      currentTest={{ type, theme }}
    >
      <TestComponent
        questions={questions}
        title={topicData.title || ""}
        description={testData.description || ""}
        branch={branch}
        level={level}
        testTitle={testData.themeTitle}
      />
    </LayoutTwo>
  )
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
            theme: test.themeSlug,
          })
        }
      }
    }
  }

  return params
}

export async function generateMetadata({ params }: TestPageProps) {
  const { branch, level, topic } = await params

  const topicData = await db.getTopicByPath(branch, level, topic)

  if (!topicData) {
    redirect('/')
  }

  const siteName = process.env.NEXT_PUBLIC_SITE_NAME || "English Tester"

  return {
    title: `${topicData.title} - ${level.toUpperCase()} - ${siteName}`,
    description: `Practice ${topicData.title} with this interactive test.`,
  }
}
