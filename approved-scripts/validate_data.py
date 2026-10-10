"""Validate the curriculum CSVs in data/ against _agent/SCHEMA.md and report coverage.

Usage (standard library only):
  python approved-scripts/validate_data.py [data_dir]      (default: data)

Checks: required columns; unique IDs; confidence values; Lao-only text fields;
foreign keys; syllables join back to the word; tone names and counts; spaced
sentences match unspaced ones and their sentence_words; 2+ sentences per word;
the 1000-word hard cap; letter/vowel coverage by word 600.
Missing tables are reported and skipped. Exit code 1 if any ERROR.
"""
import csv
import os
import re
import sys

COMMON = ["source", "confidence", "notes"]
TABLES = {
    "letters": ("letter_id", ["letter_id", "lao", "kind", "consonant_class", "respelling", "coverage_required", "intro_word_id"]),
    "vowels": ("vowel_id", ["vowel_id", "lao_pattern", "length", "ipa", "respelling", "coverage_required", "intro_word_id"]),
    "words": ("word_id", ["word_id", "lao", "ipa", "respelling", "syllables", "tone_by_syllable", "tone_derivation",
                          "pos", "classifier_word_id", "component_word_ids", "gloss_en", "freq_rank", "tier",
                          "intro_order", "new_letter_ids", "new_vowel_ids", "pron_tip"]),
    "sentences": ("sentence_id", ["sentence_id", "lao", "lao_spaced", "ipa", "respelling", "english", "target_word_id", "template_id"]),
    "sentence_words": (None, ["sentence_id", "position", "word_id"]),
    "templates": ("template_id", ["template_id", "lao_pattern", "english_pattern", "slot_names", "intro_order"]),
    "template_fillers": (None, ["template_id", "slot_name", "word_id"]),
    "learning_order": ("step", ["step", "item_type", "item_id", "why"]),
}
CONFIDENCE = {"verified", "derived", "unverified"}
TONES = {"low-rising", "high-rising", "mid", "low-falling", "high-falling"}
TIERS = {"30", "100", "300", "600", "extra"}
LAO_RE = re.compile(r"^[຀-໿\s|?!.,()«»\"'\-◌_…]*$")
PUNCT_RE = re.compile(r"[?!.,()«»\"'…]")
HARD_CAP, TARGET = 1000, 600

errors, warnings = [], []


def err(msg):
    errors.append(msg)


def warn(msg):
    warnings.append(msg)


def load(data_dir, name):
    path = os.path.join(data_dir, name + ".csv")
    if not os.path.exists(path):
        warn(f"{name}.csv missing (skipped)")
        return None
    with open(path, encoding="utf-8-sig", newline="") as f:
        reader = csv.DictReader(f)
        rows = list(reader)
        cols = reader.fieldnames or []
    id_col, required = TABLES[name]
    for c in required + COMMON:
        if c not in cols:
            err(f"{name}.csv: missing column '{c}'")
    if id_col:
        seen = set()
        for i, r in enumerate(rows, 2):
            v = r.get(id_col, "")
            if not v:
                err(f"{name}.csv line {i}: empty {id_col}")
            elif v in seen:
                err(f"{name}.csv line {i}: duplicate {id_col} {v}")
            seen.add(v)
    for i, r in enumerate(rows, 2):
        if r.get("confidence", "") not in CONFIDENCE:
            err(f"{name}.csv line {i}: confidence '{r.get('confidence', '')}' not in {sorted(CONFIDENCE)}")
        if not r.get("source", "") and r.get("confidence") != "unverified":
            err(f"{name}.csv line {i}: no source but confidence is {r.get('confidence')}")
    return rows


def ids(rows, col):
    return {r[col] for r in rows} if rows else set()


def split_ids(v):
    return [x.strip() for x in (v or "").split("|") if x.strip()]


def check_lao(name, rows, cols):
    for i, r in enumerate(rows or [], 2):
        for c in cols:
            v = r.get(c, "")
            if v and not LAO_RE.match(v):
                bad = sorted({ch for ch in v if not LAO_RE.match(ch)})
                err(f"{name}.csv line {i}: {c} has non-Lao characters {bad}")


def main():
    if hasattr(sys.stdout, "reconfigure"):
        sys.stdout.reconfigure(encoding="utf-8")
    data_dir = sys.argv[1] if len(sys.argv) > 1 else "data"
    t = {n: load(data_dir, n) for n in TABLES}
    letters, vowels, words = t["letters"], t["vowels"], t["words"]
    sentences, sw, templates, tf = t["sentences"], t["sentence_words"], t["templates"], t["template_fillers"]
    word_ids = ids(words, "word_id")
    letter_ids = ids(letters, "letter_id")
    vowel_ids = ids(vowels, "vowel_id")
    sentence_ids = ids(sentences, "sentence_id")
    template_ids = ids(templates, "template_id")

    check_lao("letters", letters, ["lao", "name_lao"])
    check_lao("vowels", vowels, ["lao_pattern"])
    check_lao("words", words, ["lao", "syllables"])
    check_lao("sentences", sentences, ["lao", "lao_spaced"])

    words_by_id = {r["word_id"]: r for r in words or []}
    if words is not None:
        if len(words) > HARD_CAP:
            err(f"words.csv: {len(words)} words exceeds the hard cap of {HARD_CAP}")
        for i, r in enumerate(words, 2):
            wid = r["word_id"]
            syl = split_ids(r.get("syllables"))
            if "".join(syl) != r.get("lao", ""):
                err(f"words {wid}: syllables '{r.get('syllables')}' do not join to '{r.get('lao')}'")
            tones = split_ids(r.get("tone_by_syllable"))
            if tones:
                if len(tones) != len(syl):
                    err(f"words {wid}: {len(tones)} tones for {len(syl)} syllables")
                for tn in tones:
                    if tn not in TONES:
                        err(f"words {wid}: unknown tone '{tn}'")
            else:
                warn(f"words {wid}: no tone_by_syllable")
            if r.get("tier") and r["tier"] not in TIERS:
                err(f"words {wid}: tier '{r['tier']}' not in {sorted(TIERS)}")
            if r.get("classifier_word_id") and r["classifier_word_id"] not in word_ids:
                err(f"words {wid}: classifier_word_id {r['classifier_word_id']} not in words")
            for c in split_ids(r.get("component_word_ids")):
                if c not in word_ids:
                    err(f"words {wid}: component {c} not in words")
                elif int(words_by_id[c].get("intro_order") or 0) > int(r.get("intro_order") or 0):
                    warn(f"words {wid}: component {c} is introduced after the compound")
            for c in split_ids(r.get("new_letter_ids")):
                if c not in letter_ids:
                    err(f"words {wid}: new_letter_id {c} not in letters")
            for c in split_ids(r.get("new_vowel_ids")):
                if c not in vowel_ids:
                    err(f"words {wid}: new_vowel_id {c} not in vowels")
            if (r.get("pos") or "").startswith("noun") and not r.get("classifier_word_id"):
                warn(f"words {wid}: noun without classifier_word_id")
        orders = [r.get("intro_order") for r in words if r.get("intro_order")]
        if len(orders) != len(set(orders)):
            err("words.csv: duplicate intro_order values")

    if sentences is not None:
        sw_by_sentence = {}
        for r in sw or []:
            sw_by_sentence.setdefault(r["sentence_id"], []).append(r)
        for r in sentences:
            sid = r["sentence_id"]
            if r.get("target_word_id") and r["target_word_id"] not in word_ids:
                err(f"sentences {sid}: target_word_id {r['target_word_id']} not in words")
            if r.get("template_id") and r["template_id"] not in template_ids:
                err(f"sentences {sid}: template_id {r['template_id']} not in templates")
            spaced = PUNCT_RE.sub("", r.get("lao_spaced", ""))
            plain = PUNCT_RE.sub("", r.get("lao", ""))
            if spaced.replace(" ", "") != plain.replace(" ", ""):
                err(f"sentences {sid}: lao_spaced does not match lao")
            toks = spaced.split()
            parts = sorted(sw_by_sentence.get(sid, []), key=lambda x: int(x["position"] or 0))
            if sw is not None:
                lao_parts = [words_by_id.get(p["word_id"], {}).get("lao", "?") for p in parts]
                if lao_parts != toks:
                    err(f"sentences {sid}: sentence_words {lao_parts} != lao_spaced tokens {toks}")
    for r in sw or []:
        if r["sentence_id"] not in sentence_ids:
            err(f"sentence_words: sentence {r['sentence_id']} not in sentences")
        if r["word_id"] not in word_ids:
            err(f"sentence_words: word {r['word_id']} not in words")
    for r in tf or []:
        if r["template_id"] not in template_ids:
            err(f"template_fillers: template {r['template_id']} not in templates")
        if r["word_id"] not in word_ids:
            err(f"template_fillers: word {r['word_id']} not in words")

    if words is not None and sw is not None:
        uses = {}
        for r in sw:
            uses.setdefault(r["word_id"], set()).add(r["sentence_id"])
        thin = [w for w in word_ids if len(uses.get(w, ())) < 2]
        if thin:
            warn(f"{len(thin)} words appear in fewer than 2 sentences: {sorted(thin)[:20]}{' ...' if len(thin) > 20 else ''}")

    # Coverage
    def intro_ok(row, table, pattern_col):
        wid = row.get("intro_word_id")
        if not wid:
            return "not introduced"
        w = words_by_id.get(wid)
        if not w:
            return f"intro_word_id {wid} not in words"
        if int(w.get("intro_order") or 0) > TARGET:
            return f"introduced at word {w.get('intro_order')} (> {TARGET})"
        needed = [ch for ch in row[pattern_col] if ch != "◌"]
        if any(ch not in w.get("lao", "") for ch in needed):
            return f"intro word {wid} {w.get('lao')} does not contain {row[pattern_col]}"
        return ""

    for name, rows, col, idc in (("letters", letters, "lao", "letter_id"), ("vowels", vowels, "lao_pattern", "vowel_id")):
        if rows is None:
            continue
        for r in rows:
            req = r.get("coverage_required")
            if req in ("yes", "reading-only"):
                problem = intro_ok(r, name, col)
                if problem and words is not None and len(words) >= TARGET and req == "yes":
                    err(f"{name} {r[idc]} {r[col]}: {problem}")
                elif problem and "does not contain" in problem:
                    err(f"{name} {r[idc]} {r[col]}: {problem}")

    print("== Counts ==")
    if letters is not None:
        kinds = {}
        for r in letters:
            kinds[r["kind"]] = kinds.get(r["kind"], 0) + 1
        print("letters by kind:", kinds)
    if vowels is not None:
        print("vowel written forms:", len(vowels), "| sound groups:", len({r.get('sound_group') for r in vowels}))
    for name in ("letters", "vowels"):
        rows = t[name]
        if rows is not None:
            need = [r for r in rows if r.get("coverage_required") == "yes"]
            done = [r for r in need if r.get("intro_word_id")]
            print(f"{name} coverage (required=yes): {len(done)}/{len(need)} introduced")
    if words is not None:
        conf, tiers = {}, {}
        for r in words:
            conf[r["confidence"]] = conf.get(r["confidence"], 0) + 1
            tiers[r.get("tier", "")] = tiers.get(r.get("tier", ""), 0) + 1
        print(f"words: {len(words)} (cap {HARD_CAP}) | confidence {conf} | tiers {tiers}")
    if sentences is not None:
        conf = {}
        for r in sentences:
            conf[r["confidence"]] = conf.get(r["confidence"], 0) + 1
        print(f"sentences: {len(sentences)} | confidence {conf}")
    print(f"\n== {len(errors)} ERROR(S) ==")
    for e in errors:
        print("ERROR", e)
    print(f"\n== {len(warnings)} WARNING(S) ==")
    for w in warnings:
        print("WARN ", w)
    sys.exit(1 if errors else 0)


if __name__ == "__main__":
    main()
