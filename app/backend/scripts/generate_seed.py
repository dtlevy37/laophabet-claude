#!/usr/bin/env python3
"""Generate Supabase seed SQL from the curriculum CSVs.

Usage:
    python backend/scripts/generate_seed.py [--data-dir DIR] [--out-dir DIR]

Defaults: data dir = <repo>/data, out dir = backend/supabase/seeds.

Output: one numbered .sql file per table (dependency order), each wrapped in a
transaction and written as batched INSERT ... ON CONFLICT DO UPDATE, so it is
safe to re-run after the CSVs change (e.g. as the word count grows) without
touching reviews or recordings.

Before writing anything it checks: CSV header == expected columns, primary
keys present and unique, int/bool values parse, and foreign keys resolve.
Any problem aborts with a list of errors and no files are written.
"""
import argparse
import csv
import sys
from pathlib import Path

BATCH = 500

# name -> (primary key columns, {column: type}); types: text (default), int, bool.
# Order = load order (dependencies first). Column order MUST match the CSV header.
def spec(cols, ints=(), bools=()):
    return {c: ("int" if c in ints else "bool" if c in bools else "text") for c in cols}

TABLES = {
    "templates": (["template_id"], spec(
        "template_id,lao_pattern,english_pattern,slot_names,intro_order,requires_word_ids,source,confidence,notes".split(","),
        ints=["intro_order"])),
    "words": (["word_id"], spec(
        "word_id,lao,ipa,respelling,syllables,tone_by_syllable,tone_derivation,pos,classifier_word_id,classifier_type,"
        "classifier_confidence,component_word_ids,gloss_en,freq_rank,topic,tier,intro_order,new_letter_ids,new_vowel_ids,"
        "pron_tip,source,confidence,notes".split(","),
        ints=["freq_rank", "intro_order"])),
    "letters": (["letter_id"], spec(
        "letter_id,lao,unicode,kind,name_lao,name_gloss_en,ipa_initial,ipa_final,consonant_class,romanization_bgn,"
        "respelling,pron_tip,coverage_required,intro_word_id,source,confidence,notes".split(","))),
    "vowels": (["vowel_id"], spec(
        "vowel_id,lao_pattern,form,length,sound_group,ipa,romanization_bgn,respelling,pron_tip,coverage_required,"
        "intro_word_id,source,confidence,notes".split(","))),
    "sentences": (["sentence_id"], spec(
        "sentence_id,lao,lao_spaced,ipa,respelling,english,target_word_id,template_id,source,confidence,notes,word_overrides".split(","))),
    "sentence_words": (["sentence_id", "position"], spec(
        "sentence_id,position,word_id,source,confidence,notes".split(","), ints=["position"])),
    "template_fillers": (["template_id", "slot_name", "word_id"], spec(
        "template_id,slot_name,word_id,source,confidence,notes".split(","))),
    "tone_exceptions": (["word_id", "syl_index"], spec(
        "word_id,syl_index,tone,source,note".split(","), ints=["syl_index"])),
    "learning_order": (["step"], spec(
        "step,item_type,item_id,why,source,confidence,notes".split(","), ints=["step"])),
}

# (table, column, referenced table, referenced column)
FOREIGN_KEYS = [
    ("sentences", "target_word_id", "words", "word_id"),
    ("sentences", "template_id", "templates", "template_id"),
    ("sentence_words", "sentence_id", "sentences", "sentence_id"),
    ("sentence_words", "word_id", "words", "word_id"),
    ("template_fillers", "template_id", "templates", "template_id"),
    ("template_fillers", "word_id", "words", "word_id"),
    ("tone_exceptions", "word_id", "words", "word_id"),
]
NOT_NULL = {"words": ["lao"], "letters": ["lao"], "vowels": ["lao_pattern"], "sentences": ["lao"],
            "learning_order": ["item_type", "item_id"]}


def convert(value, typ, where, errors):
    value = value.strip() if typ != "text" else value
    if value == "":
        return None
    if typ == "text":
        return value
    if typ == "int":
        try:
            return int(value)
        except ValueError:
            errors.append(f"{where}: not an integer: {value!r}")
            return None
    if typ == "bool":
        if value.lower() in ("yes", "true", "1"):
            return True
        if value.lower() in ("no", "false", "0"):
            return False
        errors.append(f"{where}: not yes/no: {value!r}")
    return None


def load(data_dir, errors):
    tables = {}
    for name, (pk, cols) in TABLES.items():
        path = data_dir / f"{name}.csv"
        if not path.exists():
            errors.append(f"missing file {path}")
            continue
        with path.open(encoding="utf-8-sig", newline="") as f:
            reader = csv.reader(f)
            header = next(reader, None)
            if header != list(cols):
                errors.append(f"{name}.csv header mismatch.\n  expected {list(cols)}\n  found    {header}")
                continue
            rows, seen = [], set()
            for lineno, raw in enumerate(reader, start=2):
                if not any(c.strip() for c in raw):
                    continue  # blank line
                if len(raw) != len(cols):
                    errors.append(f"{name}.csv:{lineno}: {len(raw)} fields, expected {len(cols)}")
                    continue
                row = {c: convert(v, t, f"{name}.csv:{lineno} {c}", errors)
                       for (c, t), v in zip(cols.items(), raw)}
                key = tuple(row[k] for k in pk)
                if any(k is None for k in key):
                    errors.append(f"{name}.csv:{lineno}: empty primary key {pk}")
                elif key in seen:
                    errors.append(f"{name}.csv:{lineno}: duplicate primary key {key}")
                seen.add(key)
                for c in NOT_NULL.get(name, []):
                    if row[c] is None:
                        errors.append(f"{name}.csv:{lineno}: {c} is empty")
                rows.append(row)
            tables[name] = rows
    for t, col, rt, rcol in FOREIGN_KEYS:
        if t in tables and rt in tables:
            valid = {r[rcol] for r in tables[rt]}
            bad = [r[col] for r in tables[t] if r[col] is not None and r[col] not in valid]
            if bad:
                errors.append(f"{t}.{col} -> {rt}.{rcol}: {len(bad)} unresolved, e.g. {sorted(set(bad))[:5]}")
    return tables


def lit(v):
    if v is None:
        return "null"
    if isinstance(v, bool):
        return "true" if v else "false"
    if isinstance(v, int):
        return str(v)
    return "'" + v.replace("'", "''") + "'"


def write_table(out_dir, index, name, rows):
    pk, cols = TABLES[name]
    names = list(cols)
    non_pk = [c for c in names if c not in pk]
    conflict = (f"on conflict ({', '.join(pk)}) do update set "
                + ", ".join(f"{c} = excluded.{c}" for c in non_pk)) if non_pk else \
               f"on conflict ({', '.join(pk)}) do nothing"
    lines = [f"-- Generated by backend/scripts/generate_seed.py from data/{name}.csv. Do not edit.",
             f"-- {len(rows)} rows.", "begin;"]
    for i in range(0, len(rows), BATCH):
        chunk = rows[i:i + BATCH]
        values = ",\n".join("  (" + ", ".join(lit(r[c]) for c in names) + ")" for r in chunk)
        lines.append(f"insert into public.{name} ({', '.join(names)}) values\n{values}\n{conflict};")
    lines.append("commit;\n")
    path = out_dir / f"{index:02d}_{name}.sql"
    path.write_text("\n".join(lines), encoding="utf-8", newline="\n")
    return path


def main():
    here = Path(__file__).resolve()
    ap = argparse.ArgumentParser(description=__doc__, formatter_class=argparse.RawDescriptionHelpFormatter)
    ap.add_argument("--data-dir", type=Path, default=here.parents[3] / "data")
    ap.add_argument("--out-dir", type=Path, default=here.parents[1] / "supabase" / "seeds")
    args = ap.parse_args()

    errors = []
    tables = load(args.data_dir, errors)
    if errors:
        print(f"{len(errors)} problem(s); nothing written:", file=sys.stderr)
        for e in errors[:50]:
            print("  -", e, file=sys.stderr)
        if len(errors) > 50:
            print(f"  ... and {len(errors) - 50} more", file=sys.stderr)
        return 1

    args.out_dir.mkdir(parents=True, exist_ok=True)
    for old in args.out_dir.glob("[0-9][0-9]_*.sql"):
        old.unlink()
    for i, name in enumerate(TABLES, start=1):
        p = write_table(args.out_dir, i, name, tables[name])
        print(f"{p.name}: {len(tables[name])} rows")
    return 0


if __name__ == "__main__":
    sys.exit(main())
