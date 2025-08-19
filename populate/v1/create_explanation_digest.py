from db import conn
from psycopg2.extras import RealDictCursor

target = ['grammar', 'B2', 'modals-in-the-past']

def get_topic_info(target: list[str]):
    """Get the topic ID and title for the specified target"""
    cur = conn.cursor(cursor_factory=RealDictCursor)
    cur.execute("""
        SELECT id, title FROM topics WHERE branch = %s AND level = %s AND topic = %s
    """, (target[0], target[1], target[2]))
    topic = cur.fetchone()
    return topic if topic else None

def get_random_multiple_choice_10_sentences(topic_id: int, limit: int = 5):
    """Get random multiple_choice_10 sentences for a given topic"""
    cur = conn.cursor(cursor_factory=RealDictCursor)
    cur.execute("""
        SELECT mc.*, t.title as theme_title, tt.title as test_type_title
        FROM multiple_choice_10 mc
        JOIN tests tst ON mc.test_id = tst.id
        JOIN themes t ON tst.theme = t.slug
        JOIN test_types tt ON tst.test_type_id = tt.id
        WHERE tst.topic_id = %s
        ORDER BY RANDOM()
        LIMIT %s
    """, (topic_id, limit))
    return cur.fetchall()

def main():
    print(f"Target: {target}")
    print("=" * 50)
    
    # Get topic info
    topic_info = get_topic_info(target)
    if topic_info is None:
        print(f"Topic {target} not found")
        return
    
    topic_id = topic_info['id']
    topic_title = topic_info['title']
    
    print(f"Topic ID: {topic_id}")
    print(f"Topic Title: {topic_title}")
    print()
    
    # Get 5 random multiple_choice_10 sentences
    sentences = get_random_multiple_choice_10_sentences(topic_id, 5)
    
    if not sentences:
        print("No multiple_choice_10 sentences found for this topic")
        return
    
    print(f"Found {len(sentences)} random multiple_choice_10 sentences:")
    print("=" * 50)
    
    for i, sentence in enumerate(sentences, 1):
        print(f"\n📚 Theme: {sentence['theme_title']}, Topic: {topic_title}")
        print("-" * 30)
        
        print(f"\nCorrect Sentence:")
        print(f"\n{sentence['correct_sentence']}")
        
        print(f"\nIncorrect Sentences:\n")
        for j, incorrect in enumerate(sentence['incorrect_sentences'], 1):
            print(f"{incorrect}")
        
        print(f"\nExplanation:")
        print(f"{sentence['explanation']}")
        print()

if __name__ == "__main__":
    main()
