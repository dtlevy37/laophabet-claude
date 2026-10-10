# Requests for the human

<!-- Agent adds: scripts to approve (path + purpose), domains/URLs to allow, decisions needed. Human clears handled items. -->

## Decisions (resolved in chat 2026-10-09)
- Respelling: English-friendly scheme, written in SCHEMA.md. The chat preview wrote ຂ as "kh"; the scheme uses "k", as in the option's description.
- Rare items (ຣ, ເ◌ັຍ ເ◌ຶອ ◌ົວະ, ແ◌ັ◌ ◌ັອ◌): reading-only.

## Awaiting approval
- `_agent/proposed-scripts/tone_derive.py`: derives tones per syllable and cross-checks against recorded tones and IPA. Run with `--selftest` first.

## Source disagreements on tone rules (2026-10-09)
Details: `_agent/research/lao-tones-wiktionary-fsi-kerr.md` §7. The matrix in SCHEMA.md follows the majority.
- **D1, cell 11 (mid class, dead, long vowel):** low-falling per SEAsite, Wiktionary (table and module) and Wikipedia 7.1.1. The Hartmann 2002 table as transcribed on Wikipedia 3.1 says high-falling, which contradicts its own cited SEAsite chart. Majority used: low-falling. Affects e.g. ຢາກ, ປາກ.
- **D3, cell 15 (low class, dead, short vowel):** mid per SEAsite (ພັກ, ເຮັດ), Wiktionary and Wikipedia 3.1/7.1.1. Wikipedia 5.3 (generic Lao, not labelled Vientiane) gives ຮັກ "love" as low. Majority used: mid. A native speaker's check of ຮັກ would settle it.
- **D2, cells 13–14:** Hartmann calls these "mid-rising" where everyone else says high(-rising). Probably the rise starts lower; same category. Possibly worth a pron_tip note.
- **D5/D6:** exact Chao values differ slightly between sources (e.g. 31 vs 21), and some sources count 6 tones instead of 5 (Kerr, FSI, Levy 1982). Five were chosen, per Wiktionary/Osatananda.
