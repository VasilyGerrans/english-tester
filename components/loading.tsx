import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"

export function TestLoading() {
  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      <CardHeader>
        <Skeleton className="h-8 w-64 mb-2" />
        <Skeleton className="h-4 w-96" />
      </CardHeader>
      <CardContent>
        <div className="space-y-8">
          {Array.from({ length: 10 }).map((_, index) => (
            <div key={index} className="space-y-3">
              <Skeleton className="h-6 w-full" />
              <div className="grid gap-2">
                {Array.from({ length: 4 }).map((_, optionIndex) => (
                  <Skeleton key={optionIndex} className="h-12 w-full rounded-lg" />
                ))}
              </div>
            </div>
          ))}
        </div>
        
        <div className="mt-8 flex gap-4 justify-center">
          <Skeleton className="h-10 w-32 rounded-md" />
        </div>
      </CardContent>
    </div>
  )
}

export function TopicListLoading() {
  return (
    <div className="space-y-8 animate-in fade-in duration-300">
      {Array.from({ length: 3 }).map((_, branchIndex) => (
        <div key={branchIndex} className="space-y-4">
          {/* Branch/Level Header */}
          <div className="flex items-center gap-2">
            <Skeleton className="w-5 h-5 rounded" />
            <Skeleton className="h-6 w-48" />
          </div>
          
          {/* Topic Cards Grid */}
          <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-3">
            {Array.from({ length: 6 }).map((_, cardIndex) => (
              <div key={cardIndex} className="p-4 bg-white border border-gray-200 rounded-lg">
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <Skeleton className="h-5 w-32 mb-2" />
                    <Skeleton className="h-4 w-24" />
                  </div>
                  <Skeleton className="w-4 h-4 rounded" />
                </div>
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  )
} 