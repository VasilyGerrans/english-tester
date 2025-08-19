import json
from utils import (
    get_existing_test_sentences, 
    get_info, 
    get_initial_topic, 
    get_unfilled_existing_tests, 
    insert_new_test_sentence,
    get_test_count_for_topic,
)
from prompts import (
    prompt_1, 
    prompt_2, 
    prompt_3, 
    prompt_verification,
)
from insert_test import insert_test

# Load fill_targets from populate.json
with open('populate.json', 'r') as f:
    fill_targets = json.load(f)



def fill_topic(cefr: str, topic_slug: str):
    existing_topic = get_initial_topic(cefr, topic_slug)

    print(existing_topic)

    existing_tests = get_unfilled_existing_tests(existing_topic['id'])

    cefr_level = existing_topic['level']
    topic_title = existing_topic['title']

    for test in existing_tests:
        theme = test['theme']

        existing_test_sentences = get_existing_test_sentences(test['id'])
        failed_test_sentences = []
        
        if (len(existing_test_sentences) >= 10):
            continue
        else:
            while (len(existing_test_sentences) < 10):
                avoid_examples = existing_test_sentences + failed_test_sentences

                conversation_history = []

                prompt_1_result, conversation_history = get_info(
                    prompt_1(
                        cefr_level, 
                        topic_title, 
                        theme, 
                        avoid_examples,
                    ), 
                    conversation_history=conversation_history,
                )
                
                print(prompt_1_result, '\n')
                
                prompt_2_result, conversation_history = get_info(
                    prompt_2(
                        topic_title
                    ), 
                    conversation_history=conversation_history,
                )
                
                print(prompt_2_result, '\n')
                
                prompt_3_result, conversation_history = get_info(
                    prompt_3(), 
                    conversation_history=conversation_history,
                )
                
                print(prompt_3_result, '\n')

                prompt_verification_result, conversation_history = get_info(
                    prompt_verification(topic_title), 
                    conversation_history=conversation_history,
                )
                
                print(prompt_verification_result, '\n')
                
                if (prompt_verification_result == 'True'):
                    insert_new_test_sentence(
                        test['id'], 
                        prompt_1_result, 
                        [s.strip() for s in prompt_2_result.split('\n') if s.strip()], 
                        prompt_3_result,
                    )
                    existing_test_sentences = get_existing_test_sentences(test['id'])
                else:
                    failed_test_sentences.append(prompt_1_result)
                    print('Verification failed', '\n')
                    
def fill_till_five(cefr: str, topic_slug: str, themes: list[str]):
    existing_topic = get_initial_topic(cefr, topic_slug)
    if not existing_topic:
        print(f"Topic {topic_slug} not found for level {cefr}")
        return
        
    current_test_count = get_test_count_for_topic(existing_topic['id'])
    
    if current_test_count < 5:
        tests_needed = 5 - current_test_count
        
        for i, theme in enumerate(themes):
            if i >= tests_needed:
                break
            insert_test(cefr, topic_slug, theme)

    fill_topic(cefr, topic_slug)

for cefr, topics in fill_targets.items():
    for topic_slug, themes in topics.items():
        fill_till_five(cefr, topic_slug, themes)
