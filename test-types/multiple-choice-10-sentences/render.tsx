"use client"

import { useState, useEffect, useRef } from "react"
import { usePathname } from "next/navigation"
import { Button } from "@/components/ui/button"
import { CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { CheckCircle, XCircle } from "lucide-react"
import { TestLoading } from "@/components/loading"
import { kebabToTitle } from "@/lib/utils"
import ReactMarkdown from "react-markdown"
import type { MultipleChoice10 } from "@/lib/db/schema"
import { extractDifferencesMultiLCS } from "@/lib/sentence-utils"

interface MultipleChoice10SentencesProps {
  questions: MultipleChoice10[]
  title: string
  description?: string
  branch: string
  level: string
  testTitle: string
}

import { hasCookieConsent } from "@/lib/cookie-utils"

function trackEvent(action: string, category: string, label?: string, value?: number) {
  if (typeof window !== "undefined" && window.gtag && hasCookieConsent("analytics")) {
    window.gtag("event", action, {
      event_category: category,
      event_label: label,
      value: value,
    })
  }
}

function isFibonacci(num: number): boolean {
  const isPerfectSquare = (x: number) => {
    const s = Math.floor(Math.sqrt(x))
    return s * s === x
  }
  return isPerfectSquare(5 * num * num + 4) || isPerfectSquare(5 * num * num - 4)
}

export function MultipleChoice10Sentences({ questions, title, description, branch, level, testTitle }: MultipleChoice10SentencesProps) {
  const [selectedAnswers, setSelectedAnswers] = useState<{ [key: number]: number }>({})
  const [showResults, setShowResults] = useState(false)
  const pathname = usePathname()
  const resultsRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    setSelectedAnswers({})
    setShowResults(false)
  }, [pathname])

  if (!questions || questions.length === 0) {
    return (
      <div className="animate-in fade-in duration-300">
        <TestLoading />
      </div>
    )
  }

  const getCorrectAnswerIndex = (id: number) => {
    if (isFibonacci(id)) return (id + 1) % 4
    if (id % 2 === 0) return id % 4
    return (id * 1337) % 4
  }

  const buildOptions = (q: MultipleChoice10) => {
    const correctIdx = getCorrectAnswerIndex(q.id)
    const allSentences = [q.correct_sentence, ...q.incorrect_sentences]
    const { common, answers } = extractDifferencesMultiLCS(allSentences)
    
    const reorderedAnswers = [...answers]
    const correctAnswer = reorderedAnswers[0]
    reorderedAnswers.splice(0, 1)
    reorderedAnswers.splice(correctIdx, 0, correctAnswer)
    
    return { options: reorderedAnswers, correctIdx, common }
  }

  const handleAnswerSelect = (questionIndex: number, optionIndex: number) => {
    if (showResults) return
    setSelectedAnswers((prev) => ({
      ...prev,
      [questionIndex]: optionIndex,
    }))
    trackEvent("answer_selected", "test_interaction", `question_${questionIndex + 1}`)
  }

  const handleSubmit = () => {
    setShowResults(true)
    const score = calculateScore()
    const totalQuestions = questions.length
    const percentage = Math.round((score / totalQuestions) * 100)
    trackEvent("test_completed", "engagement", title, percentage)
    trackEvent("test_score", "performance", title, score)
    setTimeout(() => {
      resultsRef.current?.scrollIntoView({ 
        behavior: 'smooth', 
        block: 'center' 
      })
    }, 100)
  }

  const handleReset = () => {
    setSelectedAnswers({})
    setShowResults(false)
    trackEvent("test_reset", "engagement", title)
  }

  const calculateScore = () => {
    let correct_answer = 0
    questions.forEach((q, index) => {
      const { correctIdx } = buildOptions(q)
      const selectedAnswer = selectedAnswers[index]
      if (selectedAnswer === correctIdx) {
        correct_answer++
      }
    })
    return correct_answer
  }

  const score = showResults ? calculateScore() : 0
  const totalQuestions = questions.length

  return (
    <div className="space-y-6 animate-in fade-in duration-500 slide-in-from-bottom-2">
      <CardHeader>
        <div>
            <CardTitle className="text-3xl font-bold text-gray-900 mb-2">{title}</CardTitle>
            <div className="text-sm text-gray-500">
              {kebabToTitle(branch)} • {level.toUpperCase()} • {testTitle}
            </div>
            {description && <p className="text-gray-600">{description}</p>} 
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-8">
          {questions.map((q, questionIndex) => {
            const { options, correctIdx, common } = buildOptions(q)
            return (
              <div key={q.id} className="space-y-3">
                <h3 className="font-medium text-gray-900">
                  {questionIndex + 1}. {common}
                </h3>
                <div className="grid gap-2">
                  {options.map((option, optionIndex) => {
                    const isSelected = selectedAnswers[questionIndex] === optionIndex
                    const isCorrect = optionIndex === correctIdx
                    const isWrong = showResults && isSelected && !isCorrect
                    const showCorrectAnswer = showResults && isCorrect
                    const showWrongAnswer = showResults && isWrong
                    return (
                      <button
                        key={optionIndex}
                        onClick={() => handleAnswerSelect(questionIndex, optionIndex)}
                        disabled={showResults}
                        className={`
                          p-3 text-left border rounded-lg transition-all flex items-center justify-between
                          ${!showResults && isSelected ? "border-blue-500 bg-blue-50" : "border-gray-200"}
                          ${!showResults && !isSelected ? "hover:border-gray-300 hover:bg-gray-50" : ""}
                          ${showCorrectAnswer ? "border-green-500 bg-green-50" : ""}
                          ${showWrongAnswer ? "border-red-500 bg-red-50" : ""}
                          ${showResults ? "cursor-default" : "cursor-pointer"}
                        `}
                      >
                        <span>{option}</span>
                        {showCorrectAnswer && <CheckCircle className="w-5 h-5 text-green-600" />}
                        {showWrongAnswer && <XCircle className="w-5 h-5 text-red-600" />}
                      </button>
                    )
                  })}
                </div>
                {showResults && q.explanation && (
                  <div className="mt-4 p-4 bg-gray-50 border border-gray-200 rounded-lg animate-in fade-in duration-500 slide-in-from-bottom-2">
                    <h4 className="font-medium text-gray-900 mb-2">Explanation:</h4>
                    <div className="prose prose-sm max-w-none text-gray-700">
                      <ReactMarkdown>{q.explanation}</ReactMarkdown>
                    </div>
                  </div>
                )}
              </div>
            )
          })}
        </div>
        {showResults && (
          <div 
            ref={resultsRef} 
            className="mt-8 p-4 bg-blue-50 border border-blue-200 rounded-lg animate-in fade-in duration-500 slide-in-from-bottom-2"
          >
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-600">
                {score}/{totalQuestions}
              </div>
              <div className="text-sm text-gray-600">{Math.round((score / totalQuestions) * 100)}% correct</div>
            </div>
          </div>
        )}
        <div className="mt-8 flex gap-4 justify-center">
          {!showResults ? (
            <Button
              onClick={handleSubmit}
              className="px-8"
            >
              Submit Test
            </Button>
          ) : (
            <Button onClick={handleReset} variant="outline" className="px-8 bg-transparent">
              Try Again
            </Button>
          )}
        </div>
      </CardContent>
    </div>
  )
}
