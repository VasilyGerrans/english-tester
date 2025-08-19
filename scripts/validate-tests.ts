const { db } = require('../lib/db/index.ts')

async function main() {
  console.log('Starting test validation and publishing status update...')
  
  try {
    const result = await db.switch_off_invalid_tests()
    
    console.log('\n=== Test Validation Results ===')
    console.log(`Valid tests: ${result.validTests}`)
    console.log(`Invalid tests: ${result.invalidTests}`)
    console.log(`Tests updated (published = false): ${result.updatedTests}`)
    
    if (result.details.length > 0) {
      console.log('\n=== Invalid Test Details ===')
      result.details.forEach((detail: { testId: number; invalidQuestions: number[] }) => {
        console.log(`Test ID ${detail.testId}: Invalid questions ${detail.invalidQuestions.join(', ')}`)
      })
    }
    
    console.log('\nValidation and publishing status update complete!')
  } catch (error) {
    console.error('Error during validation:', error)
  }
}

// Run the script if called directly
if (require.main === module) {
  main()
}

module.exports = { main } 