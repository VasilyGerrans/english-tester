import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"
import { Test } from "./db"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function getTestsByType(topicTestData: Array<Test>) {
  const filteredTests = topicTestData.filter(test => {
    if (test.testTypeSlug === 'multiple-choice-10-sentences') {
      return test.question_count === 10
    }
    return test.description
  })

  const testsByType: Array<{
    testType: {
      slug: string
      title: string
    }
    tests: Array<{
      id: number
      title: string
      themeSlug: string
    }>
  }> = []
  
  for (const test of filteredTests) {
    if (testsByType.find(t => t.testType.slug === test.testTypeSlug) === undefined) {
      testsByType.push({
        testType: {
          slug: test.testTypeSlug,
          title: test.testTypeTitle,
        },
        tests: [],
      })
    }
  }

  for (const test of filteredTests) {
    for (const testType of testsByType) {
      if (test.testTypeSlug === testType.testType.slug) {
        testType.tests.push({
          id: test.id,
          title: test.themeTitle,
          themeSlug: test.themeSlug,
        })
      }
    }
  }

  return testsByType
}

export function kebabToTitle(kebab: string): string {
  return kebab
    .split('-')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
    .join(' ')
}