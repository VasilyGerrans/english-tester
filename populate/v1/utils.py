from openai import OpenAI
import pyperclip
from prompt_toolkit import prompt
from db import conn
from psycopg2.extras import RealDictCursor

client = OpenAI(api_key=)

def get_info(text: str, mode: str = 'chatgpt', conversation_history: list = None):
    if mode == 'manual':
        print(text)
        pyperclip.copy(text)
        content = prompt(multiline=True)
        return content
    elif mode == 'chatgpt':
        print(text)
        
        messages = conversation_history.copy() if conversation_history else []

        messages.append({"role": "user", "content": text})
        
        result = client.chat.completions.create(
            model="gpt-4o",
            messages=messages,
            temperature=0.7,
            max_tokens=2000,
            top_p=1,
            frequency_penalty=0,
            presence_penalty=0
        )
        
        assistant_response = result.choices[0].message.content

        messages.append({"role": "assistant", "content": assistant_response})
        
        return assistant_response, messages

def get_initial_topic(cefr: str, topic_slug: str):
    cur = conn.cursor(cursor_factory=RealDictCursor)
    cur.execute("""
        SELECT * FROM topics WHERE branch = %s AND level = %s AND topic = %s
    """, ('grammar', cefr, topic_slug))
    return cur.fetchone()

def get_unfilled_existing_tests(topic_id: int):
    cur = conn.cursor(cursor_factory=RealDictCursor)
    cur.execute("""
        SELECT tests.id as id, t.title as theme FROM tests
        LEFT JOIN themes as t 
        ON tests.theme = t.slug
        WHERE topic_id = %s
        AND (
            SELECT COUNT(*) FROM multiple_choice_10 
            WHERE test_id = tests.id
        ) < 10
    """, (topic_id,))
    return cur.fetchall()

def get_existing_test_sentences(test_id: int):
    cur = conn.cursor(cursor_factory=RealDictCursor)
    cur.execute("""
        SELECT * FROM multiple_choice_10 WHERE test_id = %s
    """, (test_id,))
    db_result = cur.fetchall()

    return [row['correct_sentence'] for row in db_result]

def insert_new_test_sentence(test_id: int, correct_sentence: str, incorrect_sentences: list[str], explanation: str):
    cur = conn.cursor(cursor_factory=RealDictCursor)
    cur.execute("""
        INSERT INTO multiple_choice_10 (test_id, correct_sentence, incorrect_sentences, explanation) VALUES (%s, %s, %s, %s)
    """, (test_id, correct_sentence, incorrect_sentences, explanation))
    conn.commit()

def get_test_count_for_topic(topic_id: int):
    cur = conn.cursor(cursor_factory=RealDictCursor)
    cur.execute("""
        SELECT COUNT(*) as count FROM tests WHERE topic_id = %s
    """, (topic_id,))
    result = cur.fetchone()
    return result['count'] if result else 0