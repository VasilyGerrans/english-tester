def prompt_1(cefr_level: str, topic_title: str, theme: str, examples: list[str] = []):
    prompt = f"""Generate one sentence in English that illustrates the CEFR {cefr_level} grammar topic "{topic_title}". It can be positive, negative, or a question. The theme of the sentence must be "{theme}"."""
    
    if examples and len(examples) > 0:
        prompt += "\n\nAvoid sentences similar to:"
        for example in examples:
            prompt += f"\n- {example}"
    
    prompt += "\n\nOnly output the sentence. Do not include introduction or comments. Do not put the sentence in quotation marks."
        
    return prompt

def prompt_2(topic_title: str):
    return f"""Write three additional sentences that are almost identical to this one, but are grammatically incorrect IN ALL ENGLISH GRAMMAR CONTEXTS and highlight the "{topic_title}" topic. Only output these incorrect sentences, each one on a separate line, without commentary and without quotation marks."""
    
def prompt_3():
    return f"""Write a short explanation for why the correct sentence is correct, but the incorrect sentences are not. Only output the explanation in markdown, without introduction, titles, or commentary. Do not refer to sentences as "first", "second", etc. Only briefly identify sentences by their content, split up by new lines, following this format:

**Correct sentence ("...")**
...

**Incorrect sentence ("...")**
...

**Incorrect sentence ("...")**
...

**Incorrect sentence ("...")**
..."""

def prompt_verification(topic_title: str):
    return f"""Look at your correct sentence, incorrect sentences, and explanations one more time. Are you more than 90% sure that you have given good answers and that they are properly related to the grammar topic "{topic_title}"? Output "True" if you are sure and "False" if not."""