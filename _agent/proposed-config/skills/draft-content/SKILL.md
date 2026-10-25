---
name: draft-content
description: Draft the words and sentences a lesson (or practice content) needs with the drafter agent, then check_drafts, merge_words, pipeline, and commit. Use whenever new rows must be added to data/words.csv or data/sentences.csv.
---

# Drafting new content

Content is drafted only when a lesson or the app needs it. Hard cap: 3000 rows in `data/words.csv`.

## 1. Decide the list (main agent, cheap)
- The exact words (Lao + gloss) and the sentences wanted (which target words, which lesson). Grep
  `_agent/vocab.csv` first so you never re-draft an existing spelling+meaning.
- For lesson sentences, get the readable words at that lesson: `lesson_tool.py can-read` on candidates, or the
  brief's lists. Prefer existing sentences (`lesson_tool.py` brief, grep sentences.csv) over new ones.
- Keep a run to 10–15 words. More words means more runs, one after another.

## 2. Brief the drafter
Paste into the prompt, so it reads nothing big:
- batch tag (`L0007`, `L0007b`, ...) and the two file names: `_agent/drafts/<tag>-words.csv`, `<tag>-sentences.csv`;
- the word list, or for sentences: target words, the lesson, and the list of words it may use;
- the header lines of `data/words.csv` and `data/sentences.csv` and one example row of each (grep them);
- homographs it must disambiguate, if known.

## 3. Check and merge
```
python approved-scripts/check_drafts.py --words _agent/drafts/<tag>-words.csv --sentences _agent/drafts/<tag>-sentences.csv
python approved-scripts/merge_words.py _agent/drafts/<tag>-words.csv --sentences _agent/drafts/<tag>-sentences.csv --check
python approved-scripts/merge_words.py _agent/drafts/<tag>-words.csv --sentences _agent/drafts/<tag>-sentences.csv
bash approved-scripts/pipeline.sh
```
- check_drafts must report 0 problems; fix by hand or send back to the drafter. A deliberate homograph needs
  `--allow-homograph <lao>` on both scripts.
- Read the drafter's "least sure" list. Doubtful readings or tones go in `_agent/NEEDS_HUMAN.md`.
- Move the drafts to `_agent/drafts/merged/`. CHANGELOG entry; commit with the lesson or as
  `checkpoint: content <tag>`.

## 4. Getting it into the DB
Merged rows that a lesson uses reach the DB through that lesson's migration (`lesson_tool.py merge`). Rows changed
after their lesson was merged need `python approved-scripts/db_sql.py change --name <name> <ids>`. Never write
content SQL by hand.
