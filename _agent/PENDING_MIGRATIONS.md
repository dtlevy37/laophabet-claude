# Pending migrations

Written by approved-scripts/db_sql.py. The owner reviews each file, applies it with `supabase db push`, then ticks it here.

- [ ] 20261024000800_list_lessons.sql: list_lessons() RPC for the learner lesson list (S4; written by the agent, not db_sql)
- [ ] 20261025013136_lesson_l0001.sql: lesson L0001 "Your first word: ກິນ (eat)"
- [ ] 20261025032517_l0001_short_teach_text.sql: change 'l0001_short_teach_text' (1 lessons, 3 units, 4 lesson_items)
- [ ] 20261025033501_l0001_teach_hints.sql: change 'l0001_teach_hints' (1 lessons, 3 units, 4 lesson_items)
- [ ] 20261025040000_progress_tables.sql: learner_sessions, lesson_progress, learner_items, review_log; start_lesson, record_answers, complete_lesson (S5; written by the agent, not db_sql)
- [ ] 20261025034328_l0001_initial_na.sql: change 'l0001_initial_na' (1 lessons, 1 units, 5 lesson_items)
- [ ] 20261110025408_lesson_l0002.sql: lesson L0002 "A second word and a first phrase"
- [ ] 20261110032940_l0001_k_cue.sql: change 'l0001_k_cue' (1 units)
- [ ] 20261110034745_lesson_l0003.sql: lesson L0003 "A new word and a first sentence"
- [ ] 20261110034746_l0002_phrase_english.sql: change 'l0002_phrase_english' (1 sentences, 2 sentence_words)
- [ ] 20261110040845_lesson_l0004.sql: lesson L0004 "More words, more sentences"
- [ ] 20261110041529_l0004_recap_rows.sql: change 'l0004_recap_rows' (1 rules)
- [ ] 20261110120000_played_lesson.sql: review_log.first_try; list_lessons state/completed_at/last_accuracy; get_lesson levels + pool unit sounds; record_answers accepts first_try (S6a; written by the agent, not db_sql)
- [ ] 20261111003745_gloss_rice_food.sql: change 'gloss_rice_food' (1 words)
- [ ] 20261111010000_list_lessons_covers.sql: list_lessons adds `covers` for done lessons (S7a extra; written by the agent, not db_sql)
