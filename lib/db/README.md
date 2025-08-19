# Database Setup

This directory contains the PostgreSQL database implementation for the English Tester application.

## Files

- `config.ts` - Database connection configuration
- `index.ts` - Main database interface with PostgreSQL queries
- `schema.ts` - TypeScript type definitions
- `migrations/001_initial_schema.sql` - Initial database schema and sample data

## Setup Instructions

### 1. Install PostgreSQL

Make sure you have PostgreSQL installed on your system.

### 2. Create Database

```sql
CREATE DATABASE english_tester;
```

### 3. Set Environment Variables

Create a `.env.local` file in your project root with the following variables:

```env
DB_USER=postgres
DB_HOST=localhost
DB_NAME=english_tester
DB_PASSWORD=your_password
DB_PORT=5432
```

### 4. Run Migration

Connect to your database and run the migration:

```bash
psql -d english_tester -f lib/db/migrations/001_initial_schema.sql
```

Or if you're using a different PostgreSQL client:

```bash
psql -h localhost -U postgres -d english_tester -f lib/db/migrations/001_initial_schema.sql
```

### 5. Verify Installation

The migration will create:
- All necessary tables (topics, tests, themes, test_types, related_topics)
- Sample data including 5 grammar topics and 15 tests
- Proper indexes for performance

## Database Schema

### Tables

1. **topics** - Grammar topics organized by branch, level, and topic name
2. **test_types** - Types of tests (e.g., multiple choice)
3. **themes** - Test themes (daily life, business, academic)
4. **tests** - Individual tests with content and metadata
5. **related_topics** - Relationships between topics

### Sample Data

The migration includes sample data for:
- 5 grammar topics (Present Simple, Articles, Past Perfect, Conditionals, Passive Voice)
- 3 themes (Daily Life, Business English, Academic Writing)
- 15 tests (3 tests per topic, one for each theme)
- Related topic relationships

## Usage

The database interface remains the same as before. All methods are now async and query the PostgreSQL database:

```typescript
import { db } from '@/lib/db'

// Get all topics
const topics = await db.getAllTopics()

// Find topic by path
const topic = await db.findTopicByPath('grammar', 'A1', 'present-simple')

// Get tests for a topic
const tests = await db.getTestsByTopicId(1)
```

## Troubleshooting

1. **Connection Issues**: Check your environment variables and ensure PostgreSQL is running
2. **Migration Errors**: Make sure you have the correct permissions to create tables and enums
3. **Type Errors**: Ensure all TypeScript types match the database schema 