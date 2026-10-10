"""Set column values in a data CSV from a mapping CSV keyed by ID (adds missing columns).

Usage (standard library only, UTF-8):
  python approved-scripts/apply_columns.py data/words.csv _agent/research/classifiers.csv
      --cols classifier_type,classifier_word_id,classifier_confidence
      [--key word_id] [--after classifier_word_id]
      [--note-col classifier_note --note-prefix "Classifier: "] [--check]

  --cols         columns copied from the mapping into the target (same names in both files).
                 Missing target columns are inserted after --after (or appended).
  --note-col     a mapping column whose text is appended to the target's `notes` as
                 "<prefix><text>", separated by " | ". A previous "<prefix>..." segment is replaced,
                 so re-running is idempotent.
  Refuses (writes nothing) if: a mapping key is missing from the target or appears twice; a
  mapping row has more fields than its header. Target rows absent from the mapping keep their
  values (new columns stay empty for them). Writes atomically (temp file + replace).
"""
import argparse
import csv
import os
import sys


def read(path):
    with open(path, encoding="utf-8-sig", newline="") as f:
        r = csv.DictReader(f)
        rows = list(r)
        cols = list(r.fieldnames or [])
    bad = [i for i, row in enumerate(rows, 2) if None in row]
    if bad:
        sys.exit(f"{path}: rows with more fields than the header (unquoted comma?) at lines {bad[:10]}; nothing written")
    return rows, cols


def safe_path(path):
    full = os.path.abspath(path)
    root = os.path.abspath(os.getcwd())
    if os.path.commonpath([full, root]) != root:
        sys.exit(f"refusing to write outside the project folder: {path}")
    return full


def merge_note(notes, prefix, text):
    parts = [p.strip() for p in (notes or "").split(" | ") if p.strip()]
    parts = [p for p in parts if not p.startswith(prefix)]
    if text.strip():
        parts.append(prefix + text.strip())
    return " | ".join(parts)


def main():
    if hasattr(sys.stdout, "reconfigure"):
        sys.stdout.reconfigure(encoding="utf-8")
    p = argparse.ArgumentParser(description=__doc__, formatter_class=argparse.RawDescriptionHelpFormatter)
    p.add_argument("target")
    p.add_argument("mapping")
    p.add_argument("--cols", required=True)
    p.add_argument("--key", default="word_id")
    p.add_argument("--after", default="")
    p.add_argument("--note-col", default="")
    p.add_argument("--note-prefix", default="")
    p.add_argument("--check", action="store_true", help="report only; write nothing")
    a = p.parse_args()

    rows, cols = read(a.target)
    mrows, mcols = read(a.mapping)
    want = [c.strip() for c in a.cols.split(",") if c.strip()]
    for c in want + [a.key] + ([a.note_col] if a.note_col else []):
        if c not in mcols:
            sys.exit(f"{a.mapping}: missing column {c}")
    if a.key not in cols:
        sys.exit(f"{a.target}: missing key column {a.key}")
    if a.note_col and "notes" not in cols:
        sys.exit(f"{a.target}: has no notes column for --note-col")

    by_key = {r[a.key]: r for r in rows}
    seen, problems = set(), []
    for m in mrows:
        k = m[a.key].strip()
        if k in seen:
            problems.append(f"duplicate key {k} in mapping")
        seen.add(k)
        if k not in by_key:
            problems.append(f"key {k} not in {a.target}")
    for msg in problems[:30]:
        print("PROBLEM", msg, file=sys.stderr)
    if problems:
        sys.exit(f"{len(problems)} problem(s); nothing written")

    pos = cols.index(a.after) + 1 if a.after in cols else len(cols)
    for c in want:
        if c not in cols:
            cols.insert(pos, c)
            pos += 1
    changed = 0
    for m in mrows:
        r = by_key[m[a.key].strip()]
        before = dict(r)
        for c in want:
            r[c] = m[c].strip()
        if a.note_col:
            r["notes"] = merge_note(r.get("notes", ""), a.note_prefix, m[a.note_col])
        changed += any(before.get(c, "") != r.get(c, "") for c in want + ["notes"])
    print(f"{a.target}: {len(mrows)} mapped row(s), {changed} changed; columns now {len(cols)}", file=sys.stderr)
    if a.check:
        return
    target = safe_path(a.target)
    with open(target + ".tmp", "w", encoding="utf-8", newline="") as f:
        w = csv.DictWriter(f, fieldnames=cols, lineterminator="\n")
        w.writeheader()
        w.writerows({c: r.get(c, "") for c in cols} for r in rows)
    os.replace(target + ".tmp", target)


if __name__ == "__main__":
    main()
