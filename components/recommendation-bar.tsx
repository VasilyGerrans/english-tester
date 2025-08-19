import Link from "next/link"
import { ArrowRight } from "lucide-react"
import { kebabToTitle } from "@/lib/utils"

interface RecommendationBarProps {
  relatedTopics: Array<{
    related_id: number
    title: string
    branch: string
    level: string
    href: string
  }>
}

export function RecommendationBar({ relatedTopics }: RecommendationBarProps) {
  if (relatedTopics.length === 0) {
    return null
  }

  return (
    <div className="bg-white rounded-lg shadow-sm border p-6">
      <h3 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
        <ArrowRight className="w-4 h-4" />
        Related Topics
      </h3>
      <ul className="space-y-3">
        {relatedTopics.map((relatedTopic) => (
          <li key={`${relatedTopic.branch}-${relatedTopic.level.toUpperCase()}-${relatedTopic.title}`}>
            <Link
              href={`/${relatedTopic.href}/`}
              className="block p-3 rounded-md border border-gray-100 hover:border-blue-200 hover:bg-blue-50 transition-colors"
            >
              <div className="font-medium text-gray-900 text-sm">{relatedTopic.title}</div>
              <div className="text-xs text-gray-500 mt-1">
                {kebabToTitle(relatedTopic.branch)} • {relatedTopic.level.toUpperCase()}
              </div>
            </Link>
          </li>
        ))}
      </ul>
    </div>
  )
}
