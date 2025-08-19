// Type definitions for our database schema
export type Branch = "grammar"
export type Level = "A1" | "A2" | "B1" | "B1+" | "B2"

export interface Topic {
  id: number
  branch: Branch
  level: Level
  topic: string
  title: string
  createdAt: Date
  updatedAt: Date
  ref_url?: string | null
  ref_text?: string | null
  description?: string | null
  metaDescription?: string | null
}

export interface RelatedTopic {
  sourceId: number
  relatedId: number
}

export interface TestType {
  id: number
  slug: string
  title: string
  schema?: string | null
}

export interface Theme {
  id: number
  name: string
  slug: string
}

export interface Test {
  id: number
  topic: number // references topic ID
  testTypeId: number
  themeId: number
  title: string
  createdAt: Date
  updatedAt: Date
  content: string
  description?: string | null
  metaDescription?: string | null
}

export interface MultipleChoice10 {
  id: number;
  test_id: number;
  correct_sentence: string;
  incorrect_sentences: string[];
  explanation: string;
}
