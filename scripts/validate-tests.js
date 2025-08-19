const { Pool } = require('pg');
const { extractDifferencesMultiLCS } = require('../lib/sentence-utils.js');

// Database configuration
const pool = new Pool({
  connectionString: process.env.DATABASE_URL || 'postgresql://myuser:mypassword@localhost:5432/mydb'
});

async function getAllTests() {
  const query = `
    SELECT t.id, t.topic_id, t.test_type_id, t.description, t.meta_description, tt.title as "testTypeTitle", tt.slug as "testTypeSlug", th.title as "themeTitle", th.slug as "themeSlug"
    FROM tests t
    LEFT JOIN test_types tt ON t.test_type_id = tt.id
    LEFT JOIN themes th ON t.theme = th.slug
    WHERE tt.slug = 'multiple-choice-10-sentences'
    ORDER BY t.id ASC
  `;

  try {
    const result = await pool.query(query);
    return result.rows;
  } catch (error) {
    console.error('Error getting all tests:', error);
    return [];
  }
}

async function getMultipleChoice10ByTestId(testId) {
  const query = `
    SELECT id, test_id, correct_sentence, incorrect_sentences, explanation
    FROM multiple_choice_10
    WHERE test_id = $1
    ORDER BY id ASC
  `;

  try {
    const result = await pool.query(query, [testId]);
    return result.rows.map((row) => ({
      ...row,
      incorrect_sentences: typeof row.incorrect_sentences === 'string' ? JSON.parse(row.incorrect_sentences) : row.incorrect_sentences,
    }));
  } catch (error) {
    console.error('Error getting multiple_choice_10 by test ID:', error);
    return [];
  }
}

async function updateTestPublishedStatus(testId, published) {
  const query = `
    UPDATE tests 
    SET published = $2, updated_at = NOW()
    WHERE id = $1
  `;

  try {
    await pool.query(query, [testId, published]);
    console.log(`Updated test ${testId} published status to ${published}`);
  } catch (error) {
    console.error(`Error updating test ${testId} published status:`, error);
    throw error;
  }
}

async function switch_off_invalid_tests() {
  const allTests = await getAllTests();
  const validTests = [];
  const invalidTests = [];
  const updatedTests = [];
  const details = [];

  for (const test of allTests) {
    const questions = await getMultipleChoice10ByTestId(test.id);
    const invalidQuestions = [];

    for (let i = 0; i < questions.length; i++) {
      const question = questions[i];
      
      // Create array of 4 sentences (correct + 3 incorrect)
      const sentences = [
        question.correct_sentence,
        ...question.incorrect_sentences
      ];

      try {
        // Use extractDifferencesMultiLCS to analyze the sentences
        const result = extractDifferencesMultiLCS(sentences);
        
        // Count slashes in each answer
        const slashCounts = result.answers.map(answer => {
          return (answer.match(/\//g) || []).length;
        });

        // Check if any answer has more than 2 slashes
        const hasTooManySlashes = slashCounts.some(count => count > 2);

        if (hasTooManySlashes) {
          invalidQuestions.push(i + 1); // +1 for 1-based question numbering
        }
      } catch (error) {
        console.error(`Error processing test ${test.id}, question ${i + 1}:`, error);
        invalidQuestions.push(i + 1);
      }
    }

    if (invalidQuestions.length > 0) {
      invalidTests.push(test.id);
      details.push({
        testId: test.id,
        invalidQuestions
      });
      
      // Update the test's published status to false
      try {
        await updateTestPublishedStatus(test.id, false);
        updatedTests.push(test.id);
      } catch (error) {
        console.error(`Failed to update published status for test ${test.id}:`, error);
      }
    } else {
      validTests.push(test.id);
    }
  }

  return {
    validTests: validTests.length,
    invalidTests: invalidTests.length,
    updatedTests: updatedTests.length,
    details
  };
}

async function main() {
  console.log('Starting test validation and publishing status update...');
  
  try {
    const result = await switch_off_invalid_tests();
    
    console.log('\n=== Test Validation Results ===');
    console.log(`Valid tests: ${result.validTests}`);
    console.log(`Invalid tests: ${result.invalidTests}`);
    console.log(`Tests updated (published = false): ${result.updatedTests}`);
    
    if (result.details.length > 0) {
      console.log('\n=== Invalid Test Details ===');
      result.details.forEach(detail => {
        console.log(`Test ID ${detail.testId}: Invalid questions ${detail.invalidQuestions.join(', ')}`);
      });
    }
    
    console.log('\nValidation and publishing status update complete!');
  } catch (error) {
    console.error('Error during validation:', error);
  } finally {
    await pool.end();
  }
}

// Run the script if called directly
if (require.main === module) {
  main();
}

module.exports = { main, switch_off_invalid_tests }; 