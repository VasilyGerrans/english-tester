"use client"

import Link from "next/link"

export function Footer() {
  return (
    <footer className="bg-white border-t border-gray-200">
      <div className="container mx-auto px-4 py-8">
        <div className="flex flex-wrap justify-center gap-6 text-sm text-gray-600">
          <Link href="/about" className="hover:text-blue-600 transition-colors">
            About
          </Link>
          <Link href="/tos" className="hover:text-blue-600 transition-colors">
            Terms of Service
          </Link>
          <Link href="/privacy" className="hover:text-blue-600 transition-colors">
            Privacy Policy
          </Link>
          <Link href="/cookies" className="hover:text-blue-600 transition-colors">
            Cookie Policy
          </Link>
          <Link href="/contact" className="hover:text-blue-600 transition-colors">
            Contact
          </Link>
          <button 
            onClick={() => document.dispatchEvent(new CustomEvent('openCookieSettings'))}
            className="hover:text-blue-600 transition-colors"
          >
            Cookie Settings
          </button>
        </div>
      </div>
    </footer>
  )
}
