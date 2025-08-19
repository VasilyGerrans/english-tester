import { Pool } from 'pg'

// Database configuration
const pool = new Pool({
  user: process.env.DB_USER || 'postgres',
  host: process.env.DB_HOST || 'localhost',
  database: process.env.DB_NAME || 'english_tester',
  password: process.env.DB_PASSWORD || 'password',
  port: parseInt(process.env.DB_PORT || '5432'),
  // Disable SSL for local development and build process
  ssl: false,
})

// Test the connection
pool.on('error', (err) => {
  console.error('Unexpected error on idle client', err)
  // Don't exit the process during build, just log the error
  if (process.env.NODE_ENV !== 'production') {
    console.warn('Database connection error during build - continuing without database')
  }
})

export { pool } 