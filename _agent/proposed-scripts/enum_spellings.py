"""List every legal one-syllable spelling that can be read from the allowed units.

Usage (standard library only, UTF-8):
  python approved-scripts/enum_spellings.py                          # all allowed units
  python approved-scripts/enum_spellings.py --units "ກ ປ ຕ ◌າ ◌ີ"   # only spellings inside this set
  python approved-scripts/enum_spellings.py --chunk 300              # also split new spellings into batch files
  python approved-scripts/enum_spellings.py --check                  # counts only, write nothing

Allowed units are those letter_map.py keeps (same exclusions, imported from it): initial =
consonant or ligature row of letters.csv; vowel = vowels.csv pattern; final = a consonant with an
ipa_final (after exclusions: ກ ງ ນ ມ); tone mark = none, ◌່ or ◌້.
Construction per vowels.csv form: open / special = no final; closed = the pattern's second ◌ is
the final; both = with and without a final. The tone mark goes after the initial and any vowel
sign written above or below it (ັ ິ ີ ຶ ື ຸ ູ ົ ໍ), then the text is NFC-normalized.
Every spelling is parsed back with build_order.parse_syllable and kept only if it yields exactly
the units it was built from, so the output matches what letter_map.py will count.

Output (default _agent/letter_map/enum.csv): lao, unit_ids, units_lao, n_units, cw_id (if the
spelling is already in common_words.csv). With --chunk N, spellings not yet in the list are also
written to _agent/letter_map/enum/enum-001.csv ... for judging. These are candidate spellings,
not words: most are not real words. A judge copies only real everyday words into a proposal file
(lao, syllables, gloss_en, category, confidence, source, notes) for common_list.py merge.
"""
import argparse
import csv
import os
import sys
import unicodedata

from build_order import parse_syllable
from letter_map import excluded_units, inside, read, write

PH = "◌"
ABOVE_BELOW = set("ັິີຶືຸູົໍ")
TONES = {"": None, "່": "T1", "້": "T2"}


def build(initial, pattern, final, tone):
    s = pattern.replace(PH, initial, 1)
    if PH in s:
        s = s.replace(PH, final, 1)
    elif final:
        s += final
    i = s.index(initial) + len(initial)
    while i < len(s) and s[i] in ABOVE_BELOW:
        i += 1
    return unicodedata.normalize("NFC", s[:i] + tone + s[i:])


def main():
    if hasattr(sys.stdout, "reconfigure"):
        sys.stdout.reconfigure(encoding="utf-8")
    ap = argparse.ArgumentParser(description=__doc__, formatter_class=argparse.RawDescriptionHelpFormatter)
    ap.add_argument("--data", default="data")
    ap.add_argument("--common", default="_agent/letter_map/common_words.csv")
    ap.add_argument("--out", default="_agent/letter_map/enum.csv")
    ap.add_argument("--units", default="", help="space-separated units (lao or ids); default all allowed")
    ap.add_argument("--chunk", type=int, default=0, help="also write new spellings in batches of N")
    ap.add_argument("--check", action="store_true", help="counts only; write nothing")
    a = ap.parse_args()
    root = os.path.abspath(os.getcwd())
    d, out = inside(a.data, root), inside(a.out, root)

    letters = read(os.path.join(d, "letters.csv"))
    vowels = read(os.path.join(d, "vowels.csv"))
    letter_id = {r["lao"]: r["letter_id"] for r in letters}
    vowel_id = {r["lao_pattern"]: r["vowel_id"] for r in vowels}
    vowel_form = {r["lao_pattern"]: r["form"] for r in vowels}
    lao_of = {r["letter_id"]: r["lao"] for r in letters} | {r["vowel_id"]: r["lao_pattern"] for r in vowels}
    id_of = {v: k for k, v in lao_of.items()}
    excl = excluded_units(letters, vowels)

    keep = None
    if a.units.strip():
        keep = set()
        for u in a.units.split():
            uid = u if u in lao_of else id_of.get(u) or id_of.get(PH + u)
            if not uid:
                sys.exit(f"unknown unit '{u}'")
            keep.add(uid)
    ok = lambda uid: uid not in excl and (keep is None or uid in keep)

    initials = [r for r in letters if r.get("kind") in ("consonant", "consonant-ligature") and ok(r["letter_id"])]
    finals = [r for r in letters if r.get("kind") == "consonant" and (r.get("ipa_final") or "").strip() and ok(r["letter_id"])]
    pats = [r for r in vowels if ok(r["vowel_id"])]
    tones = {m: t for m, t in TONES.items() if t is None or ok(t)}

    common = read(inside(a.common, root)) if os.path.exists(inside(a.common, root)) else []
    cw_of = {}
    for w in common:
        cw_of.setdefault(unicodedata.normalize("NFC", w["lao"]), w["cw_id"])

    rows, seen, mismatched = [], set(), 0
    for c in initials:
        for v in pats:
            form = v["form"]
            fin_opts = [None] if form in ("open", "special") else finals if form == "closed" else [None] + finals
            for f in fin_opts:
                for mark, tid in tones.items():
                    want = {c["letter_id"], v["vowel_id"]} | ({f["letter_id"]} if f else set()) | ({tid} if tid else set())
                    lao = build(c["lao"], v["lao_pattern"], f["lao"] if f else "", mark)
                    probs = []
                    got = {i for _, i in parse_syllable(lao, letter_id, vowel_id, vowel_form, probs, lao)}
                    if probs or got != want:
                        mismatched += 1
                        continue
                    if lao in seen:
                        continue
                    seen.add(lao)
                    ids = sorted(want)
                    rows.append({"lao": lao, "unit_ids": "|".join(ids), "units_lao": " ".join(lao_of[i] for i in ids),
                                 "n_units": len(ids), "cw_id": cw_of.get(lao, "")})
    new = [r for r in rows if not r["cw_id"]]
    print(f"initials {len(initials)} | vowel patterns {len(pats)} | finals {len(finals)} | tone options {len(tones)}")
    print(f"spellings: {len(rows)} | already in the common list: {len(rows) - len(new)} | new: {len(new)} | "
          f"dropped (did not parse back to the same units): {mismatched}")

    if not a.check:
        os.makedirs(os.path.dirname(out), exist_ok=True)
        cols = ["lao", "unit_ids", "units_lao", "n_units", "cw_id"]
        write(out, cols, rows)
        print(f"written: {os.path.relpath(out, root)}")
        if a.chunk > 0:
            cdir = os.path.join(os.path.dirname(out), "enum")
            os.makedirs(cdir, exist_ok=True)
            for n in range(0, len(new), a.chunk):
                write(os.path.join(cdir, f"enum-{n // a.chunk + 1:03d}.csv"), cols, new[n:n + a.chunk])
            print(f"written: {(len(new) + a.chunk - 1) // a.chunk} batch files in {os.path.relpath(cdir, root)}")


if __name__ == "__main__":
    main()
