def describe_template(grammar_topic, cefr_level):
    return f"""<identity>You are an experienced English teacher, specialising in CEFR.</identity>

<grammar_topic>{grammar_topic}</grammar_topic>

<grammar_level>{cefr_level}</grammar_level>

<task>

Generate a high-quality, informative, and level-appropriate grammar explanation of the grammar topic. 

Follow these critical constraints:
- The explanation must include appropriate mention of edge-cases and common errors.
- Include abundant examples of common expressions.
- The explanation must be written in a way that is easy to understand and follow.
- The explanation must only contain factual information.

</task>

<output>
You must write the explanation in valid Markdown format. It must not include a main title #, all subheadings must be ## or ###. First title must be: "What is ... ?" with topic specified. Use bullets-points to list various examples. Do not use tables. Exclude any introduction or commentary in your answer.</output>"""
