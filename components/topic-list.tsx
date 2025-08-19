import Link from "next/link"
import { ChevronRight, BookOpen } from "lucide-react"
import { TopicMap } from "@/lib/db"
import { kebabToTitle } from "@/lib/utils"
import { TopicListLoading } from "@/components/loading"

export function TopicList({ topicMap }: { topicMap: TopicMap | null }) {
  if (!topicMap) {
    return (
      <div className="animate-in fade-in duration-300">
        <TopicListLoading />
      </div>
    )
  }

  return (
    <div className="space-y-8 animate-in fade-in duration-500 slide-in-from-bottom-2">
      {Object.entries(topicMap).map(([branch, levels]) => (
        Object.entries(levels).map(([level, data]) => (
          <div key={`${branch || "default"}-${level}`} className="space-y-4">
            <h2 className="text-xl font-semibold text-gray-900 flex items-center gap-2">
              <BookOpen className="w-5 h-5 text-blue-600" />
              {branch && <span className="capitalize">{branch} • {level.toUpperCase()}</span>}
            </h2>
            <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-3">
              {data.map((topic) => (
                <Link
                  key={`${branch}-${level}-${topic.topic.topic}`}
                  href={`/${topic.href}`}
                  className="group block p-4 bg-white border border-gray-200 rounded-lg hover:border-blue-300 hover:shadow-md transition-all duration-200"
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="font-medium text-gray-900 group-hover:text-blue-600 transition-colors">
                        {topic.topic.title}
                      </h3>
                      <p className="text-sm text-gray-500 mt-1">{kebabToTitle(branch)} • {level.toUpperCase()}</p>
                    </div>
                    <ChevronRight className="w-4 h-4 text-gray-400 group-hover:text-blue-600 transition-colors" />
                  </div>
                </Link>
              ))}
            </div>
          </div>
        ))
      ))}
    </div>
  )
}
