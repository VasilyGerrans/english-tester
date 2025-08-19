import { LayoutOne } from "@/components/layouts/layout-one"
import fs from 'fs'
import path from 'path'
import ReactMarkdown from 'react-markdown'
import Link from "next/link"

export default function PrivacyPolicyPage() {
  const siteName = process.env.NEXT_PUBLIC_SITE_NAME || "English Tester"

  // Read and process the markdown content
  const markdownPath = path.join(process.cwd(), 'content', 'privacy.md')
  let markdownContent = fs.readFileSync(markdownPath, 'utf8')
  
  // Replace template variables
  markdownContent = markdownContent
    .replace(/\{\{siteName\}\}/g, siteName)

  return (
    <LayoutOne>
      <div className="prose prose-lg max-w-none animate-in fade-in duration-500 slide-in-from-bottom-2">
        <ReactMarkdown
          components={{
            a: ({ href, children, ...props }) => {
              if (href && href.startsWith('/')) {
                return (
                  <Link href={href} className="text-blue-600 hover:text-blue-800 underline">
                    {children}
                  </Link>
                )
              }
              return (
                <a href={href} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:text-blue-800 underline" {...props}>
                  {children}
                </a>
              )
            }
          }}
        >
          {markdownContent}
        </ReactMarkdown>
      </div>
    </LayoutOne>
  )
}

export const metadata = {
  title: `Privacy Policy - ${process.env.NEXT_PUBLIC_SITE_NAME || "English Tester"}`,
  description: "Privacy Policy for our English grammar learning platform.",
}
