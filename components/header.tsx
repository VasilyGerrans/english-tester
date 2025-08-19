"use client"

import Link from "next/link"

export function Header() {
  const siteName = "English Tester"

  return (
    <header className="bg-white border-b border-gray-200">
      <div className="container mx-auto px-4 py-4">
        <Link href="/" className="flex items-center gap-2 text-xl font-semibold text-gray-900 transition-colors">
          <img 
            src="/logo.svg"
            alt="English Tester Logo" 
            width={32} 
            height={32} 
            className="w-8 h-8"
          />
          {siteName}
        </Link>
      </div>
    </header>
  )
}
