#!/usr/bin/env bash
# Rebuild and check the curriculum data in one step (run from the project root):
#   bash approved-scripts/pipeline.sh
# 1. tone_derive --fill : tone_derivation for every word, tone_by_syllable where empty;
#                         stops here on any tone mismatch or parse error.
# 2. build_order        : derived tables (sentence_words, learning_order, intro IDs, ...).
# 3. validate_data      : schema/consistency checks, warnings grouped (--quiet).
# Runs only other approved scripts; stops at the first failing step (exit code non-zero).
set -euo pipefail
cd "$(dirname "$0")/.."

echo "== 1/3 tone_derive --fill =="
python approved-scripts/tone_derive.py data/words.csv --fill
echo "== 2/3 build_order =="
python approved-scripts/build_order.py
echo "== 3/3 validate_data =="
python approved-scripts/validate_data.py --quiet
echo "== pipeline OK =="
