import { redirect } from "next/navigation"
import { db } from "@/lib/db"
import { LayoutTwo } from "@/components/layouts/layout-two"
import ReactMarkdown from "react-markdown"
import { getTestsByType, kebabToTitle } from "@/lib/utils"

interface TopicPageProps {
    params: Promise<{
        branch: string
        level: string
        topic: string
    }>
}

export default async function TopicPage({ params }: TopicPageProps) {
    const { branch, level, topic } = await params

    const topicMap = await db.getTopicMap();

    const targetHref = topicMap[branch][level].find(t => t.topic.topic === topic)?.href;

    if (!targetHref) {
        redirect('/')
    }

    if (targetHref !== `${branch}/${level}/${topic}/`) {
        redirect(`/${targetHref}`)
    }

    const topicData = await db.getTopicByPath(branch, level, topic)

    if (!topicData) {
        redirect('/')
    }

    const topicTestData = await db.getTestsByTopicIdWithQuestionCount(topicData.id)

    const testsByType = getTestsByType(topicTestData)

    const relatedTopics = topicMap[branch][level].find(t => t.topic.id === topicData.id)?.relatedTopics;

    if (!relatedTopics) throw Error("Error!")

    return (
        <LayoutTwo
            topicData={{
                branch,
                level,
                topic,
                title: topicData.title,
                description: topicData.description,
                refUrl: topicData.ref_url,
                refText: topicData.ref_text,
            }}
            relatedTopics={relatedTopics}
            testsByType={testsByType}
        >
            <div className="space-y-6">
                <div>
                    <h1 className="text-5xl font-bold text-gray-900 mb-2">{topicData.title}</h1>
                    <div className="text-sm text-gray-500">
                        {kebabToTitle(branch)} • {level}
                    </div>
                </div>

                {topicData.description && (
                    <div className="prose prose-lg max-w-none">
                        <ReactMarkdown>{topicData.description}</ReactMarkdown>
                    </div>
                )}

                {!topicData.description && (
                    <div className="text-center py-8 text-gray-500">
                        <p>No description available for this topic.</p>
                        <p className="text-sm mt-2">Check the sidebar for practice tests.</p>
                    </div>
                )}
            </div>
        </LayoutTwo>
    )
}

export async function generateStaticParams() {
    const topicMap = await db.getTopicMap()
    const params = []

    for (const [branch, levels] of Object.entries(topicMap)) {
        for (const level of Object.keys(levels)) {
            for (const topic of levels[level]) {
                params.push({
                    branch,
                    level,
                    topic: topic.topic.topic,
                })
            }
        }
    }

    return params
}

export async function generateMetadata({ params }: TopicPageProps) {
    const { branch, level, topic } = await params

    const topicData = await db.getTopicByPath(branch, level, topic)

    if (!topicData) {
        return {
            title: "Topic Not Found",
        }
    }

    const siteName = process.env.NEXT_PUBLIC_SITE_NAME || "English Tester"

    return {
        title: `${topicData.title} - ${siteName}`,
        description:
            topicData.metaDescription || `Learn ${topicData.title} with interactive exercises and explanations.`,
    }
}
