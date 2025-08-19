"use client"

import React, { useState, useEffect, useRef } from "react"
import { usePathname } from "next/navigation"
import { Button } from "@/components/ui/button"
import { CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { CheckCircle, XCircle } from "lucide-react"
import { TestLoading } from "@/components/loading"
import { kebabToTitle } from "@/lib/utils"
import ReactMarkdown from "react-markdown"
import type { MultipleChoice10 } from "@/lib/db/schema"
import { extractDifferencesMultiLCS } from "@/lib/sentence-utils"
import { Select, SelectContent, SelectTrigger, SelectValue } from "@/components/ui/select"
import * as SelectPrimitive from "@radix-ui/react-select"
import { cn } from "@/lib/utils"

const CustomSelectItem = React.forwardRef<
  React.ElementRef<typeof SelectPrimitive.Item>,
  React.ComponentPropsWithoutRef<typeof SelectPrimitive.Item>
>(({ className, children, ...props }, ref) => (
  <SelectPrimitive.Item
    ref={ref}
    className={cn(
      "relative flex w-full cursor-default select-none items-center rounded-sm py-1.5 pl-2 pr-2 text-sm outline-none focus:bg-accent focus:text-accent-foreground data-[disabled]:pointer-events-none data-[disabled]:opacity-50",
      className
    )}
    {...props}
  >
    <SelectPrimitive.ItemText>{children}</SelectPrimitive.ItemText>
  </SelectPrimitive.Item>
))
CustomSelectItem.displayName = SelectPrimitive.Item.displayName

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
  const [selectedAnswers, setSelectedAnswers] = useState<{ [key: number]: { [gapIndex: number]: string } }>({})
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

  const parseSentenceWithGaps = (common: string) => {
    const parts = common.split('___')
    return parts
  }

  const handleDropdownChange = (questionIndex: number, gapIndex: number, value: string) => {
    if (showResults) return
    setSelectedAnswers((prev) => ({
      ...prev,
      [questionIndex]: {
        ...(prev[questionIndex] || {}),
        [gapIndex]: value,
      },
    }))
    trackEvent("answer_selected", "test_interaction", `question_${questionIndex + 1}_gap_${gapIndex + 1}`)
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
      const { options, correctIdx } = buildOptions(q)
      const selectedAnswersForQuestion = selectedAnswers[index] || {}
      const correctAnswer = options[correctIdx]
      
      // Check if all gaps are filled with the correct answer
      const gapCount = (options[0].match(/\//g) || []).length + 1
      let allCorrect = true
      
      for (let gapIndex = 0; gapIndex < gapCount; gapIndex++) {
        const selectedValue = selectedAnswersForQuestion[gapIndex]
        const correctParts = correctAnswer.split(' / ')
        const correctPart = correctParts[gapIndex] || ''
        
        if (selectedValue !== correctPart) {
          allCorrect = false
          break
        }
      }
      
      if (allCorrect) {
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
            const sentenceParts = parseSentenceWithGaps(common)
            const correctAnswer = options[correctIdx]
            const correctParts = correctAnswer.split(' / ')
            const selectedAnswersForQuestion = selectedAnswers[questionIndex] || {}
            
            return (
              <div key={q.id} className="space-y-3">
                <h3 className="font-medium text-gray-900">
                  {questionIndex + 1}.{" "}
                  {sentenceParts.map((part, partIndex) => (
                    <span key={partIndex}>
                      {part}
                      {partIndex < sentenceParts.length - 1 && (
                        <span className="inline-flex items-center mx-1">
                          <Select
                            value={selectedAnswersForQuestion[partIndex] || ""}
                            onValueChange={(value) => handleDropdownChange(questionIndex, partIndex, value)}
                            disabled={showResults}
                          >
                            <SelectTrigger className="min-w-0 px-2 py-1 h-auto text-sm border-none bg-transparent shadow-none focus:ring-0 focus:ring-offset-0 hover:bg-transparent">
                              <SelectValue placeholder="..." className="text-current" />
                            </SelectTrigger>
                            <SelectContent>
                              {(() => {
                                const optionParts = options.map(option => {
                                  const parts = option.split(' / ')
                                  return parts[partIndex] || ''
                                })
                                const uniqueOptions = [...new Set(optionParts)]
                                
                                return uniqueOptions.map((optionPart, optionIndex) => {
                                  const isCorrect = optionPart === correctParts[partIndex]
                                  const isSelected = selectedAnswersForQuestion[partIndex] === optionPart
                                  
                                  return (
                                    <CustomSelectItem 
                                      key={optionIndex} 
                                      value={optionPart}
                                      className="pl-2 pr-2"
                                    >
                                      <span>{optionPart}</span>
                                    </CustomSelectItem>
                                  )
                                })
                              })()}
                            </SelectContent>
                          </Select>
                          {showResults && (() => {
                            const selectedValue = selectedAnswersForQuestion[partIndex]
                            const correctValue = correctParts[partIndex]
                            const isCorrect = selectedValue === correctValue
                            
                            return (
                              <span className="ml-1">
                                {isCorrect ? (
                                  <CheckCircle className="w-4 h-4 text-green-600" />
                                ) : (
                                  <XCircle className="w-4 h-4 text-red-600" />
                                )}
                              </span>
                            )
                          })()}
                        </span>
                      )}
                    </span>
                  ))}
                </h3>
                {showResults && q.explanation && (() => {
                  const paragraphs = q.explanation.split('\n\n').filter(p => p.trim())
                  const firstParagraph = paragraphs[0] || q.explanation
                  
                  return (
                    <div className="mt-4 p-4 bg-gray-50 border border-gray-200 rounded-lg animate-in fade-in duration-500 slide-in-from-bottom-2">
                      <h4 className="font-medium text-gray-900 mb-2">Explanation:</h4>
                      <div className="prose prose-sm max-w-none text-gray-700">
                        <ReactMarkdown>{firstParagraph}</ReactMarkdown>
                      </div>
                    </div>
                  )
                })()}
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
