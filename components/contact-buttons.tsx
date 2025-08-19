import { Mail, Linkedin, Calendar, Twitter } from "lucide-react"

export function ContactButtons() {
  return (
    <div className="flex flex-col sm:flex-row gap-6 mt-8 mb-8">
      <a
        href="https://www.linkedin.com/in/vasilygerrans/"
        target="_blank"
        rel="noopener noreferrer"
        className="flex items-center gap-3 px-6 py-4 bg-blue-600 hover:bg-blue-700 text-white rounded-xl transition-all duration-200 hover:shadow-lg"
      >
        <Linkedin className="w-6 h-6" />
        <span className="font-medium text-lg">LinkedIn</span>
      </a>
      
      <a
        href="https://x.com/vasilygerrans"
        target="_blank"
        rel="noopener noreferrer"
        className="flex items-center gap-3 px-6 py-4 bg-black hover:bg-gray-800 text-white rounded-xl transition-all duration-200 hover:shadow-lg"
      >
        <Twitter className="w-6 h-6" />
        <span className="font-medium text-lg">Twitter</span>
      </a>
    </div>
  )
} 