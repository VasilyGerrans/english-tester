import type { ReactNode } from "react"
import { Header } from "../header"
import { Footer } from "../footer"

interface LayoutOneProps {
  children: ReactNode
}

export function LayoutOne({ children }: LayoutOneProps) {
  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <Header />
      <main className="container mx-auto px-4 py-8 flex-1">
        <div className="max-w-4xl mx-auto">
          <div className="bg-white rounded-lg shadow-sm border p-8">{children}</div>
        </div>
      </main>
      <Footer />
    </div>
  )
}
