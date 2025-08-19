import Link from "next/link"
import { ExternalLink, BookOpen } from "lucide-react"

interface SidebarProps {
  topicData: {
    branch: string
    level: string
    topic: string
    title: string
    refUrl?: string | null
    refText?: string | null
    description?: string | null
  }
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

export function Sidebar({ topicData, testsByType, currentTest }: SidebarProps) {
  const { branch, level, topic, refUrl, refText, description } = topicData

  return (
    <div className="bg-white rounded-lg shadow-sm border p-6">
      <div className="space-y-6">
        {(() => {
          if (refUrl) {
            return (
              <div>
                <h3 className={`font-semibold text-gray-900 flex items-center gap-2 ${testsByType.length > 0 ? 'mb-3' : ''}`}>
                  {!refText && <BookOpen className="w-4 h-4" />}
                  <a
                    href={refUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-blue-600 hover:text-blue-800 transition-colors flex items-center gap-1 bg-blue-50 hover:bg-blue-100 px-3 py-1 rounded border border-blue-200"
                  >
                    {refText || "Read Explanation"}
                    <ExternalLink className="w-3 h-3" />
                  </a>
                </h3>
              </div>
            )
          } else if (description) {
            return (
              <div>
                <h3 className={`font-semibold text-gray-900 flex items-center gap-2 ${testsByType.length > 0 ? 'mb-3' : ''}`}>
                  <BookOpen className="w-4 h-4" />
                  <Link
                    href={`/${branch}/${level}/${topic}`}
                    className="text-blue-600 hover:text-blue-800 transition-colors flex items-center gap-1 bg-blue-50 hover:bg-blue-100 px-3 py-1 rounded border border-blue-200"
                  >
                    Read Explanation
                  </Link>
                </h3>
              </div>
            )
          }
          return null
        })()}

        {testsByType.length > 0 && (
          <div>
            <h3 className="font-semibold text-gray-900 mb-3">Practice Tests</h3>
            <div className="space-y-4">
              {testsByType.map(({ testType, tests }) => (
                <div key={testType.title}>
                  <h4 className="font-medium text-gray-700 text-sm mb-2">{testType.title}</h4>
                  <ul className="space-y-1 ml-2">
                    {tests.map((test) => {
                      const isCurrentTest =
                        currentTest && testType.slug === currentTest.type && test.themeSlug === currentTest.theme

                      return (
                        <li key={test.id}>
                          <Link
                            href={`/${branch}/${level}/${topic}/${testType.slug}/${test.themeSlug}/`}
                            className={`text-sm block py-1 transition-colors ${
                              isCurrentTest
                                ? "text-blue-600 font-medium bg-blue-50 px-2 py-1 rounded"
                                : "text-gray-600 hover:text-blue-600"
                            }`}
                          >
                            {test.title}
                          </Link>
                        </li>
                      )
                    })}
                  </ul>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
