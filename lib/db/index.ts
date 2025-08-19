import type { Topic } from "./schema"
import { pool } from "./config"
import type { MultipleChoice10 } from "./schema"

async function getRelatedTopicsByTopicId(topicId: number): Promise<Array<{
  related_id: number,
  title: string,
  branch: string,
  level: string,
}>> {
  const query = `
    SELECT related_id, t.title, t.branch, LOWER(t.level) as level
    FROM related_topics rt
    LEFT JOIN topics t ON rt.related_id = t.id
    WHERE rt.source_id = $1
    ORDER BY t.branch, t.level, t.topic ASC
  `

  try {
    const result = await pool.query(query, [topicId])
    return result.rows
  } catch (error) {
    console.error('Error getting related topics:', error)
    return []
  }
}

export interface Test {
  id: number
  topic_id: number
  test_type_id: number
  description?: string | null
  meta_description?: string | null
  testTypeSlug: string,
  testTypeTitle: string,
  themeTitle: string,
  themeSlug: string
  question_count?: number | null
}

async function getTestsByTopicId(topicId: number): Promise<Array<Test>> {
  const query = `
    SELECT t.id, t.topic_id, t.test_type_id, t.description, t.meta_description, tt.title as "testTypeTitle", tt.slug as "testTypeSlug", th.title as "themeTitle", th.slug as "themeSlug"
    FROM tests t
    LEFT JOIN test_types tt ON t.test_type_id = tt.id
    LEFT JOIN themes th ON t.theme = th.slug
    WHERE t.topic_id = $1 AND t.published = true
    ORDER BY t.id ASC
  `

  try {
    const result = await pool.query(query, [topicId])
    return result.rows
  } catch (error) {
    console.error('Error getting tests by topic ID:', error)
    return []
  }
}

async function getTestsByTopicIdWithQuestionCount(topicId: number): Promise<Array<Test>> {
  const query = `
    SELECT t.id, t.topic_id, t.test_type_id, t.description, t.meta_description, tt.title as "testTypeTitle", tt.slug as "testTypeSlug", th.title as "themeTitle", th.slug as "themeSlug",
           CASE 
             WHEN tt.slug = 'multiple-choice-10-sentences' THEN (
               SELECT COUNT(*) 
               FROM multiple_choice_10 
               WHERE test_id = t.id
             )
             ELSE NULL
           END as question_count
    FROM tests t
    LEFT JOIN test_types tt ON t.test_type_id = tt.id
    LEFT JOIN themes th ON t.theme = th.slug
    WHERE t.topic_id = $1 AND t.published = true
    ORDER BY th.title ASC
  `

  try {
    const result = await pool.query(query, [topicId])
    return result.rows.map((row: any) => ({
      ...row,
      question_count: row.question_count ? parseInt(row.question_count, 10) : null,
    }))
  } catch (error) {
    console.error('Error getting tests by topic ID with question count:', error)
    return []
  }
}

async function getTopicByPath(branch: string, level: string, topic: string): Promise<Topic | undefined> {
  const query = `
    SELECT 
      id, branch, LOWER(level) as level, topic, title, created_at as "createdAt", updated_at as "updatedAt",
      ref_url, ref_text, description, meta_description as "metaDescription", published
    FROM topics 
    WHERE branch = $1 AND LOWER(level) = LOWER($2) AND topic = $3
    LIMIT 1
  `

  try {
    const result = await pool.query(query, [branch, level, topic])
    return result.rows[0] || undefined
  } catch (error) {
    console.error('Error getting topic by path:', error)
    return undefined
  }
}

async function getTestByPath(topicId: number, type: string, theme: string): Promise<Test | undefined> {
  const query = `
    SELECT t.id, t.topic_id, t.test_type_id, t.description, t.meta_description, tt.title as "testTypeTitle", tt.slug as "testTypeSlug", th.title as "themeTitle", th.slug as "themeSlug",
           CASE 
             WHEN tt.slug = 'multiple-choice-10-sentences' THEN (
               SELECT COUNT(*) 
               FROM multiple_choice_10 
               WHERE test_id = t.id
             )
             ELSE NULL
           END as question_count
    FROM tests t
    LEFT JOIN test_types tt ON t.test_type_id = tt.id
    LEFT JOIN themes th ON t.theme = th.slug
    WHERE t.topic_id = $1 AND tt.slug = $2 AND th.slug = $3 AND t.published = true
    LIMIT 1
  `

  try {
    const result = await pool.query(query, [topicId, type, theme])
    if (result.rows[0]) {
      return {
        ...result.rows[0],
        question_count: result.rows[0].question_count ? parseInt(result.rows[0].question_count, 10) : null,
      }
    }
    return undefined
  } catch (error) {
    console.error('Error getting test by path:', error)
    return undefined
  }
}

async function getAllPublishedTopics(): Promise<Topic[]> {
  const query = `
    SELECT 
      id, branch, LOWER(level) as level, topic, title, created_at as "createdAt", updated_at as "updatedAt",
      ref_url, ref_text, description, meta_description as "metaDescription"
    FROM topics
    WHERE published = true
    ORDER BY branch, level, topic ASC
  `

  try {
    const result = await pool.query(query)
    return result.rows
  } catch (error) {
    console.error('Error getting all topics:', error)
    // During build, if database is not available, return empty array
    if (process.env.NODE_ENV === 'production' || process.env.NODE_ENV === 'development') {
      console.warn('Database not available during build - returning empty topics list')
    }
    return []
  }
}

export interface TopicMap {
  [branch: string]: {
    [level: string]: Array<{
      href: string;
      topic: Topic;
      tests: Array<Test>;
      relatedTopics: Array<{
        related_id: number
        title: string
        branch: string
        level: string
        href: string
      }>;
    }>;
  };
}

async function getTopicMap(): Promise<TopicMap> {
  try {
    const topics = await getAllPublishedTopics()
    const topicMap: TopicMap = {};

    for (const topic of topics) {
      if (!topicMap[topic.branch]) {
        topicMap[topic.branch] = {}
      }
      if (!topicMap[topic.branch][topic.level]) {
        topicMap[topic.branch][topic.level] = []
      }
    }

    for (const topic of topics) {
      const tests = await getTestsByTopicIdWithQuestionCount(topic.id)

      const readyTests = []
      for (const test of tests) {
        if (test.testTypeSlug === 'multiple-choice-10-sentences') {
          if (test.question_count === 10) {
            readyTests.push(test)
          }
        } else {
          if (test.description) {
            readyTests.push(test)
          }
        }
      }

      if (topic.ref_url) {
        if (readyTests.length > 0) {
          const href = `${topic.branch}/${topic.level}/${topic.topic}/${readyTests[0].testTypeSlug}/${readyTests[0].themeSlug}`;
          topicMap[topic.branch][topic.level].push({
            topic,
            tests: readyTests,
            href,
            relatedTopics: []
          })
        }
      } else if (topic.description) {
        const href = `${topic.branch}/${topic.level}/${topic.topic}/`;
        topicMap[topic.branch][topic.level].push({
          topic,
          tests: readyTests,
          href,
          relatedTopics: []
        })
      } else if (readyTests.length > 0) {
        const href = `${topic.branch}/${topic.level}/${topic.topic}/${readyTests[0].testTypeSlug}/${readyTests[0].themeSlug}`;
        topicMap[topic.branch][topic.level].push({
          topic,
          tests: readyTests,
          href,
          relatedTopics: []
        })
      }
    }

    for (const topic of topics) {
      const relatedTopics = await getRelatedTopicsByTopicId(topic.id)
      for (const relatedTopic of relatedTopics) {
        const relatedTopicEntry = topicMap[relatedTopic.branch][relatedTopic.level].find(t => t.topic.id === relatedTopic.related_id)
        if (relatedTopicEntry) {
          const relatedTopicHref = relatedTopicEntry.href
          topicMap[topic.branch][topic.level].find(t => t.topic.id === topic.id)?.relatedTopics.push({
            ...relatedTopic,
            href: relatedTopicHref,
          })
        }
      }
    }

    for (const topic of topics) {
      if (topicMap[topic.branch][topic.level].length === 0) {
        delete topicMap[topic.branch][topic.level]
      }

      if (Object.keys(topicMap[topic.branch]).length === 0) {
        delete topicMap[topic.branch]
      }
    }

    return topicMap;
  } catch (error) {
    console.error('Error getting topic map:', error)
    return {}
  }
}

async function getMultipleChoice10ByTestId(testId: number): Promise<MultipleChoice10[]> {
  const query = `
    SELECT id, test_id, correct_sentence, incorrect_sentences, explanation
    FROM multiple_choice_10
    WHERE test_id = $1
    ORDER BY id ASC
  `

  try {
    const result = await pool.query(query, [testId])
    return result.rows.map((row: any) => ({
      ...row,
      incorrect_sentences: typeof row.incorrect_sentences === 'string' ? JSON.parse(row.incorrect_sentences) : row.incorrect_sentences,
    }))
  } catch (error) {
    console.error('Error getting multiple_choice_10 by test ID:', error)
    return []
  }
}

export const db = {
  getAllPublishedTopics,
  getTopicByPath,
  getTestByPath,
  getRelatedTopicsByTopicId,
  getTestsByTopicId,
  getTestsByTopicIdWithQuestionCount,
  getTopicMap,
  getMultipleChoice10ByTestId,
}
