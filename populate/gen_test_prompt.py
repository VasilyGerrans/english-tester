def prompt_template(content):
    return f"""<context>{content}</context>

<task>
Return a single boolean value if and only if the following conditions are *all* true:

1. Every sentence in "correct" is grammatically correct and logically coherent.
2. Every explanation in "correct" is accurate and clearly justifies why the sentence is correct.
3. Every sentence in "incorrect" is *unambiguously incorrect* in grammar, usage, or logic — regardless of context.
   - If a sentence could be considered correct in *any plausible context*, it must not appear in the "incorrect" list.
   - Pay special attention to time expressions (e.g., "this week", "these days") and whether they support present simple, past simple, or present continuous.
4. Connector words (e.g., "but", "because", "although") must be used in grammatically and logically appropriate ways.
5. Sentences in the "correct" list must be idiomatic and natural in standard modern English when taken out of context.
   - Sentences that are grammatical but marked, overly emphatic, or rare in neutral conversation must be excluded unless context justifies their inclusion.
   - Assume default neutral context unless stated otherwise.

Be strict: if any item violates even one of these, return **False**.
</task>

<output>Output your answer as a single boolean value. Do not provide commentary or introduction.</output>"""