import { LayoutOne } from "@/components/layouts/layout-one"
import fs from 'fs'
import path from 'path'
import ReactMarkdown from 'react-markdown'
import { ContactButtons } from '@/components/contact-buttons'

export default function AboutPage() {
  const siteName = process.env.NEXT_PUBLIC_SITE_NAME || "English Tester"

  // Read and process the markdown content
  const markdownPath = path.join(process.cwd(), 'content', 'about.md')
  let markdownContent = fs.readFileSync(markdownPath, 'utf8')
  
  // Replace template variables
  markdownContent = markdownContent
    .replace(/\{\{siteName\}\}/g, siteName)

  return (
    <LayoutOne>
      <div className="prose prose-lg max-w-none animate-in fade-in duration-500 slide-in-from-bottom-2">
        <ReactMarkdown
          components={{
            p: ({ children, ...props }) => {
              if (children === '{{contactButtons}}') {
                return <ContactButtons />
              }
              return <p {...props}>{children}</p>
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
  title: `About - ${process.env.NEXT_PUBLIC_SITE_NAME || "English Tester"}`,
  description: "Learn more about our English grammar learning platform and mission.",
}
