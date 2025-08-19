"""
Populate JSON Topics Script

This script queries the PostgreSQL database to find all topics and their fully filled themes,
then generates a themes.json file with the same structure as fill_targets in main.py.

The script includes all topics for all levels, but only populates the arrays with themes
for topics that have exactly 5 valid themes with 10 questions filled in. Topics with fewer
than 5 themes will have empty arrays.

A theme is considered 'fully filled' if:
- For multiple-choice-10-sentences tests: has exactly 10 questions
- For other test types: exists in the database

Usage:
    python populate_json_topics.py
"""

import json
import os
from typing import Dict, List, Any
from psycopg2.extras import RealDictCursor
from db import conn

def get_fully_filled_themes() -> Dict[str, Dict[str, List[str]]]:
    """
    Query the database to find all topics and their fully filled themes.
    Includes all topics for all levels, but only populates arrays for topics
    that have exactly 5 themes with 10 questions filled in.
    """
    cursor = conn.cursor(cursor_factory=RealDictCursor)
    
    try:
        # First, get all topics to include them all
        all_topics_query = """
        SELECT DISTINCT t.level, t.topic
        FROM topics t
        WHERE t.branch = 'grammar'
        ORDER BY t.level, t.topic
        """
        
        cursor.execute(all_topics_query)
        all_topics = cursor.fetchall()
        
        # Query to get topics with their fully filled themes
        themes_query = """
        SELECT 
            t.level,
            t.topic,
            th.slug as theme_slug,
            tt.slug as test_type_slug,
            CASE 
                WHEN tt.slug = 'multiple-choice-10-sentences' THEN (
                    SELECT COUNT(*) 
                    FROM multiple_choice_10 
                    WHERE test_id = tests.id
                )
                ELSE NULL
            END as question_count
        FROM topics t
        JOIN tests ON t.id = tests.topic_id
        JOIN themes th ON tests.theme = th.slug
        JOIN test_types tt ON tests.test_type_id = tt.id
        WHERE t.branch = 'grammar'
        ORDER BY t.level, t.topic, th.slug
        """
        
        cursor.execute(themes_query)
        themes_results = cursor.fetchall()
        
        # Group by level and topic
        themes_by_level: Dict[str, Dict[str, List[str]]] = {}
        
        # Initialize all topics with empty arrays
        for row in all_topics:
            level = row['level']
            topic = row['topic']
            
            if level not in themes_by_level:
                themes_by_level[level] = {}
            
            themes_by_level[level][topic] = []
        
        # Process themes and populate arrays
        for row in themes_results:
            level = row['level']
            topic = row['topic']
            theme_slug = row['theme_slug']
            test_type_slug = row['test_type_slug']
            question_count = row['question_count']
            
            # Check if the test is fully filled
            is_fully_filled = False
            if test_type_slug == 'multiple-choice-10-sentences':
                is_fully_filled = question_count == 10
            else:
                # For other test types, consider them filled if they exist
                is_fully_filled = True
            
            if is_fully_filled:
                # Add theme if not already in the list
                if theme_slug not in themes_by_level[level][topic]:
                    themes_by_level[level][topic].append(theme_slug)
        
        # Include all topics, but only populate arrays for topics with exactly 5 themes
        for level, topics in themes_by_level.items():
            for topic, themes in topics.items():
                if len(themes) != 5:
                    # Keep the topic but with empty array
                    themes_by_level[level][topic] = []
        
        return themes_by_level
        
    except Exception as e:
        print(f"Error querying database: {e}")
        return {}
    finally:
        cursor.close()

def write_themes_json(themes_data: Dict[str, Dict[str, List[str]]], output_path: str = "themes.json"):
    """Write the themes data to a JSON file"""
    try:
        with open(output_path, 'w', encoding='utf-8') as f:
            json.dump(themes_data, f, indent=2, ensure_ascii=False)
        print(f"Successfully wrote themes data to {output_path}")
        print(f"Found {len(themes_data)} levels with fully filled themes")
        for level, topics in themes_data.items():
            print(f"  {level}: {len(topics)} topics")
            for topic, themes in topics.items():
                print(f"    {topic}: {len(themes)} themes")
    except Exception as e:
        print(f"Error writing themes.json: {e}")

def generate_themes_json(output_path: str = "themes.json") -> Dict[str, Dict[str, List[str]]]:
    """
    Generate themes.json file with fully filled themes from database.
    Returns the themes data dictionary.
    """
    print("Querying database for fully filled themes...")
    themes_data = get_fully_filled_themes()
    
    if themes_data:
        write_themes_json(themes_data, output_path)
        return themes_data
    else:
        print("No fully filled themes found in the database")
        return {}

def main():
    """Main function to generate themes.json"""
    generate_themes_json()

if __name__ == "__main__":
    main()
