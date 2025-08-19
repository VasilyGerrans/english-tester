from db import conn
from psycopg2.extras import RealDictCursor

def kebabToTitle(kebab: str):
    return ' '.join(word.capitalize() for word in kebab.split('-'))

def insert_test(cefr: str, topic_slug: str, theme: str):
    cur = conn.cursor(cursor_factory=RealDictCursor)
    
    cur.execute("""
        SELECT id FROM topics WHERE branch = %s AND level = %s AND topic = %s
    """, ('grammar', cefr, topic_slug))

    topic = cur.fetchone()
    
    if (topic is None):
        print(f"Topic {topic_slug} not found")
        return

    cur.execute("""INSERT INTO themes (slug, title) VALUES (%s, %s) on conflict (slug) do nothing""", (theme, kebabToTitle(theme)))
    
    cur.execute("""SELECT id FROM test_types WHERE slug = 'multiple-choice-10-sentences'""")
    test_type = cur.fetchone()
    
    if (test_type is None):
        print(f"Test type 'multiple-choice-10-sentences' not found")
        return

    cur.execute("""
        SELECT id FROM tests WHERE topic_id = %s AND theme = %s
    """, (topic['id'], theme))

    test = cur.fetchone()
    
    if (test is not None):
        print(f"Test {theme} already exists")
        return
    
    cur.execute("""
        INSERT INTO tests (topic_id, test_type_id, theme) VALUES (%s, %s, %s)
    """, (topic['id'], test_type['id'], theme))
    
    conn.commit()
