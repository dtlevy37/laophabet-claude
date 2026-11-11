#!/usr/bin/env bash
# Rebuild and check the curriculum data in one step (run from the project root):
#   bash scripts/pipeline.sh
# 1. tone_derive --fill : tone_derivation for every word, tone_by_syllable where empty;
#                         stops here on any tone mismatch or parse error.
# 2. build_order        : derived tables (sentence_words, learning_order, intro IDs, ...).
# 3. validate_data      : schema/consistency checks, warnings grouped (--quiet).
# 4. db_sql check       : the CSVs still match the DB spec (headers, keys, foreign keys, lesson items).
# Stops at the first failing step (exit code non-zero).
set -euo pipefail
cd "$(dirname "$0")/.."

echo "== 1/4 tone_derive --fill =="
python scripts/tone_derive.py data/words.csv --fill
echo "== 2/4 build_order =="
python scripts/build_order.py
echo "== 3/4 validate_data =="
python scripts/validate_data.py --quiet
echo "== 4/4 db_sql check =="
python scripts/db_sql.py check
echo "== pipeline OK =="
