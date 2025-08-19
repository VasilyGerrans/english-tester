import random
from collections import defaultdict
from db import conn
from psycopg2.extras import RealDictCursor

def get_all_topics():
    """Get all topics from the database"""
    cur = conn.cursor(cursor_factory=RealDictCursor)
    cur.execute("SELECT id, level FROM topics ORDER BY level, id")
    return cur.fetchall()

def get_existing_relations():
    """Get existing relations to avoid duplicates"""
    cur = conn.cursor(cursor_factory=RealDictCursor)
    cur.execute("SELECT source_id, related_id FROM related_topics")
    return cur.fetchall()

def clear_existing_relations():
    """Clear all existing relations"""
    cur = conn.cursor()
    cur.execute("DELETE FROM related_topics")
    conn.commit()
    print("Cleared existing relations")

def insert_relation(source_id, related_id):
    """Insert a single relation"""
    cur = conn.cursor()
    cur.execute("INSERT INTO related_topics (source_id, related_id) VALUES (%s, %s)", (source_id, related_id))
    conn.commit()

def build_relations():
    """Build relations between topics according to the specified rules"""
    
    # Get all topics
    topics = get_all_topics()
    print(f"Found {len(topics)} topics")
    
    # Group topics by level
    topics_by_level = defaultdict(list)
    for topic in topics:
        topics_by_level[topic['level']].append(topic['id'])
    
    print("Topics by level:")
    for level, topic_ids in topics_by_level.items():
        print(f"  {level}: {len(topic_ids)} topics")
    
    # Clear existing relations
    clear_existing_relations()
    
    # Track which topics have been used as related_ids
    used_as_related = set()
    
    # For each level, build relations
    for level, topic_ids in topics_by_level.items():
        print(f"\nProcessing level: {level}")
        
        if len(topic_ids) < 4:
            print(f"  Warning: Only {len(topic_ids)} topics in level {level}. Need at least 4 for proper relations.")
            continue
        
        # Create a copy of topic_ids for this level
        available_topics = topic_ids.copy()
        random.shuffle(available_topics)
        
        # For each topic, assign exactly three related topics
        for i, source_id in enumerate(topic_ids):
            # Get available topics for this source (excluding itself)
            candidates = [tid for tid in available_topics if tid != source_id]
            
            if len(candidates) < 3:
                print(f"  Warning: Not enough candidates for topic {source_id}")
                continue
            
            # Select three related topics
            related_ids = []
            for _ in range(3):
                # Prefer topics that haven't been used as related_ids yet
                unused_candidates = [tid for tid in candidates if tid not in used_as_related]
                
                if unused_candidates:
                    # Choose from unused candidates
                    chosen = random.choice(unused_candidates)
                    candidates.remove(chosen)
                    related_ids.append(chosen)
                    used_as_related.add(chosen)
                else:
                    # If all candidates have been used, choose any available
                    chosen = random.choice(candidates)
                    candidates.remove(chosen)
                    related_ids.append(chosen)
            
            # Insert the relations
            for related_id in related_ids:
                insert_relation(source_id, related_id)
                print(f"  {source_id} -> {related_id}")
    
    # Verify that every topic appears as a related_id at least once
    print("\nVerifying coverage...")
    cur = conn.cursor(cursor_factory=RealDictCursor)
    cur.execute("""
        SELECT t.id, t.level, 
               CASE WHEN rt.related_id IS NOT NULL THEN 'Yes' ELSE 'No' END as is_related
        FROM topics t
        LEFT JOIN related_topics rt ON t.id = rt.related_id
        ORDER BY t.level, t.id
    """)
    
    verification_results = cur.fetchall()
    uncovered_topics = [r for r in verification_results if r['is_related'] == 'No']
    
    if uncovered_topics:
        print(f"Warning: {len(uncovered_topics)} topics are not used as related_ids:")
        for topic in uncovered_topics:
            print(f"  Topic {topic['id']} (Level {topic['level']})")
        
        # Try to fix uncovered topics by reassigning some relations
        print("\nAttempting to fix uncovered topics...")
        fix_uncovered_topics(uncovered_topics, topics_by_level)
    else:
        print("✓ All topics are used as related_ids at least once")
    
    # Print final statistics
    print("\nFinal statistics:")
    cur.execute("SELECT COUNT(*) as total_relations FROM related_topics")
    total_relations = cur.fetchone()['total_relations']
    print(f"Total relations: {total_relations}")
    
    cur.execute("SELECT COUNT(DISTINCT source_id) as unique_sources FROM related_topics")
    unique_sources = cur.fetchone()['unique_sources']
    print(f"Topics with relations: {unique_sources}")
    
    cur.execute("SELECT COUNT(DISTINCT related_id) as unique_related FROM related_topics")
    unique_related = cur.fetchone()['unique_related']
    print(f"Topics used as related: {unique_related}")

def fix_uncovered_topics(uncovered_topics, topics_by_level):
    """Try to fix uncovered topics by reassigning some relations"""
    
    for uncovered_topic in uncovered_topics:
        level = uncovered_topic['level']
        topic_id = uncovered_topic['id']
        
        # Find topics in the same level that have more than 3 relations
        cur = conn.cursor(cursor_factory=RealDictCursor)
        cur.execute("""
            SELECT source_id, COUNT(*) as relation_count
            FROM related_topics rt
            JOIN topics t ON rt.source_id = t.id
            WHERE t.level = %s
            GROUP BY source_id
            HAVING COUNT(*) > 3
        """, (level,))
        
        overloaded_sources = cur.fetchall()
        
        if overloaded_sources:
            # Choose a random overloaded source and replace one of its relations
            source_to_fix = random.choice(overloaded_sources)
            
            # Get current relations for this source
            cur.execute("SELECT related_id FROM related_topics WHERE source_id = %s", (source_to_fix['source_id'],))
            current_relations = [r['related_id'] for r in cur.fetchall()]
            
            # Replace one relation with the uncovered topic
            relation_to_replace = random.choice(current_relations)
            
            # Update the relation
            cur.execute("""
                UPDATE related_topics 
                SET related_id = %s 
                WHERE source_id = %s AND related_id = %s
            """, (topic_id, source_to_fix['source_id'], relation_to_replace))
            conn.commit()
            
            print(f"  Fixed: {source_to_fix['source_id']} -> {topic_id} (replaced {relation_to_replace})")
        else:
            print(f"  Could not fix topic {topic_id} - no overloaded sources available")

if __name__ == "__main__":
    build_relations()
    conn.close()
