from db import conn
from psycopg2.extras import RealDictCursor

def clear_stale_tests():
    cur = conn.cursor(cursor_factory=RealDictCursor)
    
    cur.execute("""
        DELETE FROM tests WHERE id NOT IN (
            SELECT DISTINCT test_id FROM multiple_choice_10
        )
    """)
    
    conn.commit()

clear_stale_tests()