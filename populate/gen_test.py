import psycopg2
from psycopg2.extras import RealDictCursor
import gen_test_prompt
import json 
from prompt_toolkit import prompt
import pyperclip
import unicodedata
from openai import OpenAI

mode = 'chatgpt'

client = OpenAI(api_key=)

conn = psycopg2.connect(
    dbname="mydb",
    user="myuser",
    password="mypassword",
    host="localhost",
    port="5432"
)

def clean_text(text):
    """Convert Unicode characters to ASCII equivalents"""
    replacements = {
        '\u2019': "'",  # right single quotation mark
        '\u2018': "'",  # left single quotation mark  
        '\u201C': '"',  # left double quotation mark
        '\u201D': '"',  # right double quotation mark
        '\u2013': '-',  # en dash
        '\u2014': '--', # em dash
        '\u2026': '...', # horizontal ellipsis
    }
    
    for unicode_char, ascii_char in replacements.items():
        text = text.replace(unicode_char, ascii_char)
    
    return text

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
            max_tokens=2000,
            top_p=1,
            frequency_penalty=0,
            presence_penalty=0
        )
        print(result.choices[0].message.content)
        return result.choices[0].message.content

cur = conn.cursor(cursor_factory=RealDictCursor)

cur.execute(f"""
    SELECT tests.id as id, tests.prompt as prompt, t.level as level FROM tests
    LEFT JOIN topics as t ON tests.topic_id = t.id
    WHERE prompt is not null AND content is null AND t.level = 'A1'
""")
rows = cur.fetchall()

i = 0
retries = 0

print(f"Found {len(rows)} tests to generate")

while i < len(rows):
    row = rows[i]

    initial_content = get_info(row['prompt'])

    json_start = initial_content.find('{')
    json_end = initial_content.rfind('}') + 1
    
    if json_start == -1 or json_end == 0:
        raise ValueError("No JSON object found in the input")

    json_string = initial_content[json_start:json_end]
    json_string = clean_text(json_string)
    json_string = unicodedata.normalize('NFKD', json_string)

    json_content = json.loads(json_string)
    
    correct = []
    incorrect = []

    if len(json_content['content']) != 10:
        raise ValueError(f"Test length invalid! ({len(json_content['content'])})")

    for _, test in enumerate(json_content['content']):
        sentence = unicodedata.normalize('NFKC', test["sentence"])
        explanation = unicodedata.normalize('NFKC', test["explanation"])
        options = [unicodedata.normalize('NFKC', option) for option in test["options"]]

        correct.append({
            "sentence": sentence.replace("[1]", options[test["correct_answer"]]),
            "explanation": explanation
        })

        for j, option in enumerate(options):
            if j != test["correct_answer"]:
                incorrect.append(sentence.replace("[1]", option))

    content = json.dumps({ "correct": correct, "incorrect": incorrect })
    
    prompt_text = gen_test_prompt.prompt_template(content)
    valid = get_info(prompt_text)

    if valid == "True" or valid == "true":
        print('awesome!')
        cur.execute("""
            UPDATE tests SET content = %s WHERE id = %s
        """, (json_string, row['id']))
        conn.commit()
        i += 1
        retries = 0
    else:
        retries += 1
        if retries > 1:
            print('Too many retries!')
            retries = 0
            i += 1
        print('try again!')
    

cur.close()
conn.close()