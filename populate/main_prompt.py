def prompt_template(grammar_topic, cefr_level, theme, schema_type):
    return f"""<identity>You are a highly skilled CEFR English grammar test writer.</identity>

<grammar_topic>{grammar_topic}</grammar_topic>

<grammar_level>{cefr_level}</grammar_level>

<task>
Generate a high-quality, level-appropriate English grammar test based on the grammatical explanation. It is a ten-sentence multiple-choice quiz. Each sentence has one blank with four possible options, with **only one grammatically and contextually correct answer**.

Follow these critical constraints:
- Only one option must be correct — all other options must be clearly ungrammatical or logically incoherent in context.
- Time expressions (e.g., "this week", "these days", "right now") must unambiguously signal the tense required. Avoid sentences where more than one tense could plausibly work depending on interpretation.
- Each correct answer must illustrate a specific nuance or rule from the grammatical explanation (e.g., habits vs. actions in progress).
- Each incorrect answer must violate a rule relevant to the grammatical topic (e.g., verb agreement, tense usage, word order, or stative vs. dynamic verb misuse).
- Avoid edge cases and subtle semantic ambiguity. Aim for clarity, precision, and confidence in the grammatical distinction being tested.
- Avoid emphatic, literary, or stylistically marked forms unless the grammatical explanation specifically discusses them.
- Correct options must be idiomatic, natural-sounding, and appropriate for a neutral or typical conversational context unless explicitly instructed otherwise.
- Correct options must include sentences outside of the specific grammar topic but closely related to it.
</task>

<theme>Make the test loosely focused on the theme **{theme}**.</theme>

<output>
You must output your answer in the following valid **JSON format**:

{schema_type}

Do not include any introduction or commentary in your answer. Make sure that various questions have various correct_answer values.
</output>"""
