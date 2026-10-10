"""Widen word and sentence IDs across every data table (one-off migration, idempotent).

Usage (standard library only, UTF-8):
  python approved-scripts/rekey_ids.py [--data data] [--check]

Rewrites, in every cell of every CSV in --data:
  W + exactly 4 digits  ->  W + 6 digits   (W0058 -> W000058; word IDs up to W999999)
  S + exactly 4 digits  ->  S + 9 digits   (S1250 -> S000001250; sentence IDs up to S999999999)
Covers IDs inside other columns too (classifier_word_id, component_word_ids, word_overrides
"4=W0058", intro_word_id, target_word_id, learning_order item_id, template requires/fillers,
tone_exceptions, and IDs mentioned in notes). Letter IDs such as S1/S3 (fewer than 4 digits)
and already-widened IDs are untouched, so re-running changes nothing.
Writes each file atomically (temp file + replace). --check reports counts only.
"""
import argparse
import csv
import os
import re
import sys

WORD_RE = re.compile(r"(?<![A-Za-z0-9])W(\d{4})(?![0-9])")
SENT_RE = re.compile(r"(?<![A-Za-z0-9])S(\d{4})(?![0-9])")


def widen(text):
    text, nw = WORD_RE.subn(lambda m: f"W{int(m.group(1)):06d}", text)
    text, ns = SENT_RE.subn(lambda m: f"S{int(m.group(1)):09d}", text)
    return text, nw, ns


def main():
    if hasattr(sys.stdout, "reconfigure"):
        sys.stdout.reconfigure(encoding="utf-8")
    p = argparse.ArgumentParser(description=__doc__, formatter_class=argparse.RawDescriptionHelpFormatter)
    p.add_argument("--data", default="data")
    p.add_argument("--check", action="store_true", help="report only; write nothing")
    a = p.parse_args()
    root = os.path.abspath(os.getcwd())
    d = os.path.abspath(a.data)
    if os.path.commonpath([d, root]) != root:
        sys.exit("data folder must be inside the project")

    total_w = total_s = 0
    for name in sorted(os.listdir(d)):
        if not name.endswith(".csv"):
            continue
        path = os.path.join(d, name)
        with open(path, encoding="utf-8-sig", newline="") as f:
            rows = list(csv.reader(f))
        nw = ns = 0
        out = []
        for row in rows:
            new_row = []
            for cell in row:
                cell, w, s = widen(cell)
                nw, ns = nw + w, ns + s
                new_row.append(cell)
            out.append(new_row)
        total_w, total_s = total_w + nw, total_s + ns
        print(f"{name}: {nw} word IDs, {ns} sentence IDs widened", file=sys.stderr)
        if a.check or (nw == 0 and ns == 0):
            continue
        with open(path + ".tmp", "w", encoding="utf-8", newline="") as f:
            csv.writer(f, lineterminator="\n").writerows(out)
        os.replace(path + ".tmp", path)
    print(f"total: {total_w} word IDs, {total_s} sentence IDs{' (check only)' if a.check else ''}", file=sys.stderr)


if __name__ == "__main__":
    main()
