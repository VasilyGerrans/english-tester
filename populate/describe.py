import psycopg2
import json 
from prompt_toolkit import prompt
import pyperclip
import unicodedata

from describe_prompt import describe_template
from openai import OpenAI

conn = psycopg2.connect(
    dbname="mydb",
    user="myuser",
    password="mypassword",
    host="localhost",
    port="5432"
)
cur = conn.cursor()

mode = 'chatgpt'

client = OpenAI(api_key=)

def get_info(text: str):
    if mode == 'manual':
        print(text)
        pyperclip.copy(text)
        content = prompt(multiline=True)
        return content
    elif mode == 'chatgpt':
        print(text)
        result = client.chat.completions.create(
            model="gpt-4o",
            messages=[{"role": "user", "content": text}],
            temperature=0.7,
            max_tokens=1000,
            top_p=1,
            frequency_penalty=0,
            presence_penalty=0
        )
        print(result.choices[0].message.content)
        return result.choices[0].message.content

with open('main.json', 'r') as file:
    data = json.load(file)
    
for item in data:
    if ('topic' in item):
        topic = item['topic']
        level = item['level']
        title = item['title']
        
        cur.execute("SELECT * FROM topics WHERE branch = 'grammar' AND level = %s AND topic = %s", (level.upper(), topic.lower()))
        existing_topic = cur.fetchone()
        if (existing_topic):
            print(f"Topic {topic} already exists")
            continue

        prompt_text = describe_template(title, level)
        text = get_info(prompt_text)
        text = unicodedata.normalize('NFKC', text)
        
        cur.execute("""
            INSERT INTO topics (branch, level, topic, title, description, published) 
            VALUES (%s, %s, %s, %s, %s, %s) 
            ON CONFLICT (branch, level, topic) 
            DO UPDATE SET title = %s, description = %s, published = %s
        """, ('grammar', level.upper(), topic.lower(), title, text, True, title, text, True))
        conn.commit()
        
