---
name: draft-content
description: Draft the words and sentences a lesson (or practice content) needs with the drafter agent, with their word categories and sentence slots, then check_drafts, merge_words, tag files, pipeline, and commit. Use whenever new rows must be added to data/words.csv or data/sentences.csv.
---

# Drafting new content

Content is drafted only when a lesson or the app needs it. Hard cap: 3000 rows in `data/words.csv`.

## 1. Decide the list (main agent, cheap)
- The exact words (Lao + gloss) and the sentences wanted (which target words, which lesson). Grep
  `_agent/vocab.csv` first so you never re-draft an existing spelling+meaning.
- For lesson sentences, get the readable words at that lesson: `lesson_tool.py can-read` on candidates, or the
  brief's lists. Prefer existing sentences (`lesson_tool.py` brief, grep sentences.csv) over new ones. A sentence
  may use only core words: a bonus word (role `bonus`, not yet listed as `new`) never appears in a sentence.
- Keep a run to 10–15 words. More words means more runs, one after another.
- Activity data (APP_PLAN S7c; APP_DESIGN "Fill in the blank: one logical choice"): every word a lesson lists as
  `new` or `bonus` needs a `data/word_categories.csv` row, and every sentence a lesson uses needs a
  `data/sentence_slots.csv` row for at least its target word. List the existing words and sentences the lesson
  uses that have none yet (grep the two files) so the drafter tags them too.

## 2. Brief the drafter
Paste into the prompt, so it reads nothing big:
- batch tag (`L0007`, `L0007b`, ...) and the four file names: `_agent/drafts/<tag>-words.csv`,
  `<tag>-sentences.csv`, `<tag>-word_categories.csv`, `<tag>-sentence_slots.csv`;
- the word list, or for sentences: target words, the lesson, and the list of words it may use (core words only);
- the header lines of `data/words.csv` and `data/sentences.csv` and one example row of each (grep them);
- the headers of the two tag files (below), the whole of `data/categories.csv` (it is small), and the existing
  words / sentences that still need a tag (id, Lao, gloss or English; for sentences also the `lao_spaced` text);
- homographs it must disambiguate, if known.

Tag file formats (same headers as the data files; placeholder ids allowed):
```
word_id,categories,source,confidence,notes
L0007-W001,food,,unverified,Tagged by the agent
W000018,action|consume,,unverified,Tagged by the agent
sentence_id,position,accepts,exclude_word_ids,source,confidence,notes
L0007-S001,2,food|drink,,,unverified,Tagged by the agent
```
`position` is the 1-based token position in `lao_spaced` (the same as `data/sentence_words.csv`).

## 3. Check and merge
```
python approved-scripts/check_drafts.py --words _agent/drafts/<tag>-words.csv --sentences _agent/drafts/<tag>-sentences.csv
python approved-scripts/merge_words.py _agent/drafts/<tag>-words.csv --sentences _agent/drafts/<tag>-sentences.csv --check
python approved-scripts/merge_words.py _agent/drafts/<tag>-words.csv --sentences _agent/drafts/<tag>-sentences.csv
bash approved-scripts/pipeline.sh
```
- check_drafts must report 0 problems; fix by hand or send back to the drafter. A deliberate homograph needs
  `--allow-homograph <lao>` on both scripts. A sentences-only merge needs a header-only words file as the
  positional argument.
- Read the drafter's "least sure" list. Doubtful readings or tones go in `_agent/NEEDS_HUMAN.md`.
- **Tags:** replace the placeholder ids in the two tag files with the real ones (words: `_agent/tmp/merge_map.csv`;
  sentences: the merge numbers them in file order from the next free S id; check with grep on
  `data/sentences.csv`), confirm each slot position against `data/sentence_words.csv`, then append the rows to
  `data/word_categories.csv` and `data/sentence_slots.csv` (append; never a replace-all over line ends; rewrite a
  small file whole if needed) and run `bash approved-scripts/pipeline.sh` again. validate_data checks the
  categories against `data/categories.csv`, the slot positions and that each slot's answer fits its `accepts`.
- A new category is added to `data/categories.csv` only when a sentence needs it (category, definition, examples).
  Verbs keep `action` and add verb classes (`consume`, `motion`, ...); a verb with only `action` is never a
  distractor in a verb gap.
- `lesson_tool.py check` then prints each lesson sentence's blank options: scan them for a second valid answer
  and widen `accepts` (or use `exclude_word_ids`) where one appears.
- Move the drafts (all four files) to `_agent/drafts/merged/`. CHANGELOG entry; commit with the lesson or as
  `checkpoint: content <tag>`.

## 4. Getting it into the DB
Merged rows that a lesson uses reach the DB through that lesson's migration (`lesson_tool.py merge`); it carries
the lesson's word_units, word_categories (also of homographs of its words) and sentence_slots. Rows changed after
their lesson was merged need `python approved-scripts/db_sql.py change --name <name> <ids>`: a word id also
carries its word_units and word_categories, a sentence id its sentence_words and sentence_slots. Never write
content SQL by hand.
