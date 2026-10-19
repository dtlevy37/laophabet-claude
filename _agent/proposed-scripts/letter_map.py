"""Map learned unit sets to the common words they can spell; find the best first sets.

Usage (standard library only, UTF-8):
  python approved-scripts/letter_map.py                       # k = 2..5, top 20, write reports
  python approved-scripts/letter_map.py --max-k 5 --top 20 --beam 50
  python approved-scripts/letter_map.py --one-class           # consonants of one class only
  python approved-scripts/letter_map.py --no-shared-glyphs    # no two vowel patterns share a glyph
  python approved-scripts/letter_map.py --check               # report only, write nothing

Input:  _agent/letter_map/common_words.csv (cw_id, lao, syllables, gloss_en, ...),
        data/letters.csv, data/vowels.csv.
Output (in --out, default _agent/letter_map/):
  signatures.csv  every common word: units needed to read it, size, excluded reason
  best_sets.csv   k, rank, size, unit_ids, units_lao, word_count, words (top N sets of at most k units)
  chain.csv       best nested path of at most 2 ⊂ 3 ⊂ ... ⊂ max-k units, with the new words at each step

A unit is a consonant letter (or cluster/ligature row of letters.csv), a vowel pattern of
vowels.csv, or the tone marks ◌່ ◌້. Syllables are parsed with build_order.parse_syllable, so
signatures match the curriculum's own reading-load analysis. A word is readable from set S
iff its signature ⊆ S.

Excluded units (one sound, one rule for the first set; user 2026-10-19), derived and printed:
  - consonants whose final sound differs from the initial (ipa_final ≠ ipa_initial, ignoring
    the unreleased mark ̚): ດ ບ ຍ ຣ
  - glyphs with a second role: ອ (carrier / vowel part), ວ (consonant / vowel part),
    ຫ (h / silent tone leader), and every letters.csv row that contains one of them (ຫງ ຫຍ ຫວ ຫຼ)
  - vowel patterns that contain ອ, ວ or ຍ (◌ັອ◌ ◌ອ◌ ເ◌ັຍ ເ◌ຍ ເ◌ຶອ ເ◌ືອ ◌ົວະ ◌ົວ ◌ວ◌)
  - ◌໊ ◌໋, ໆ ຯ ◌໌ and digits are never in scope
Words that need an excluded unit stay in signatures.csv with the reason and are not searched.

Search (exact): words are bucketed by signature. Every best set is a union of signatures
(an unused unit adds no words), so candidates are the closure of signature unions of size
≤ max-k, built bottom-up. count(S) = sum of bucket sizes over the subsets of S (≤ 2^5).
"""
import argparse
import csv
import os
import sys
import unicodedata
from itertools import combinations

from build_order import parse_syllable

SECOND_ROLE = set("ອວຫ")
VOWEL_BLOCK = set("ອວຍ")
TONE_OK = {"T1", "T2"}
PH = "◌"


def read(path):
    with open(path, encoding="utf-8-sig", newline="") as f:
        r = csv.DictReader(f)
        rows = list(r)
        bad = [i for i, row in enumerate(rows, 2) if None in row]
        if bad:
            sys.exit(f"{path}: rows with more fields than the header (unquoted comma?) at lines {bad[:10]}")
        return rows


def write(path, cols, rows):
    tmp = path + ".tmp"
    with open(tmp, "w", encoding="utf-8", newline="") as f:
        w = csv.DictWriter(f, fieldnames=cols, extrasaction="ignore", lineterminator="\n")
        w.writeheader()
        for r in rows:
            w.writerow({c: r.get(c, "") for c in cols})
    os.replace(tmp, path)


def inside(path, root):
    p = os.path.abspath(path)
    if os.path.commonpath([p, root]) != root:
        sys.exit(f"{path}: must be inside the project")
    return p


def excluded_units(letters, vowels):
    """Return {unit_id: reason}."""
    out = {}
    for r in letters:
        uid, lao, kind = r["letter_id"], r["lao"], r.get("kind", "")
        if kind in ("digit", "other"):
            out[uid] = "not in scope"
        elif kind == "tone-mark" and uid not in TONE_OK:
            out[uid] = "rare tone mark"
        elif kind.startswith("consonant"):
            ini = (r.get("ipa_initial") or "").replace("̚", "")
            fin = (r.get("ipa_final") or "").replace("̚", "")
            if fin and fin != ini:
                out[uid] = f"final sound differs ({ini} / {fin})"
            elif set(lao) & SECOND_ROLE:
                out[uid] = "glyph with a second role"
    for r in vowels:
        if set(r["lao_pattern"]) & VOWEL_BLOCK:
            out[r["vowel_id"]] = "vowel pattern contains ອ, ວ or ຍ"
    return out


def count(s, buckets):
    s = tuple(sorted(s))
    return sum(len(buckets.get(frozenset(sub), ())) for n in range(1, len(s) + 1) for sub in combinations(s, n))


def words_in(s, buckets):
    s = tuple(sorted(s))
    found = []
    for n in range(1, len(s) + 1):
        for sub in combinations(s, n):
            found += buckets.get(frozenset(sub), [])
    return found


def main():
    if hasattr(sys.stdout, "reconfigure"):
        sys.stdout.reconfigure(encoding="utf-8")
    ap = argparse.ArgumentParser(description=__doc__, formatter_class=argparse.RawDescriptionHelpFormatter)
    ap.add_argument("--data", default="data")
    ap.add_argument("--common", default="_agent/letter_map/common_words.csv")
    ap.add_argument("--out", default="_agent/letter_map")
    ap.add_argument("--max-k", type=int, default=5)
    ap.add_argument("--top", type=int, default=20)
    ap.add_argument("--beam", type=int, default=50)
    ap.add_argument("--one-class", action="store_true", help="all consonants in a set share one class")
    ap.add_argument("--no-shared-glyphs", action="store_true", help="no two vowel patterns in a set share a glyph")
    ap.add_argument("--check", action="store_true", help="report only; write nothing")
    a = ap.parse_args()
    root = os.path.abspath(os.getcwd())
    d, out = inside(a.data, root), inside(a.out, root)

    letters = read(os.path.join(d, "letters.csv"))
    vowels = read(os.path.join(d, "vowels.csv"))
    common = read(inside(a.common, root))
    letter_id = {r["lao"]: r["letter_id"] for r in letters}
    vowel_id = {r["lao_pattern"]: r["vowel_id"] for r in vowels}
    vowel_form = {r["lao_pattern"]: r["form"] for r in vowels}
    lao_of = {r["letter_id"]: r["lao"] for r in letters} | {r["vowel_id"]: r["lao_pattern"] for r in vowels}
    cls = {r["letter_id"]: r.get("consonant_class", "") for r in letters if r.get("kind", "").startswith("consonant")}
    glyphs = {r["vowel_id"]: set(r["lao_pattern"]) - {PH} for r in vowels}
    excl = excluded_units(letters, vowels)

    print("== Excluded units ==")
    by_reason = {}
    for uid, why in excl.items():
        if why != "not in scope":
            by_reason.setdefault(why, []).append(lao_of.get(uid, uid))
    for why, units in by_reason.items():
        print(f"{why}: {' '.join(units)}")

    def allowed(s):
        if a.one_class and len({cls[u] for u in s if u in cls}) > 1:
            return False
        if a.no_shared_glyphs:
            vs = [u for u in s if u in glyphs]
            if any(glyphs[x] & glyphs[y] for x, y in combinations(vs, 2)):
                return False
        return True

    # Signatures
    # A spelling counts once: homographs (ຄຳ "word" / "gold") read the same.
    sig_rows, buckets, problems, first_of = [], {}, [], {}
    for w in common:
        lao = unicodedata.normalize("NFC", w["lao"])
        syls = [x for x in (w.get("syllables") or "").split("|") if x.strip()]
        reason, units = "", []
        if lao in first_of:
            reason = f"same spelling as {first_of[lao]} (counted once)"
        first_of.setdefault(lao, w["cw_id"])
        if reason:
            pass
        elif "".join(syls) != lao:
            reason = "syllables do not join to lao"
        else:
            probs = []
            for k, syl in enumerate(syls, 1):
                units += [i for _, i in parse_syllable(syl, letter_id, vowel_id, vowel_form, probs, f"{w['cw_id']} syl {k}")]
            if probs:
                problems += probs
                reason = "parse problem"
        sig = frozenset(units)
        if not reason:
            bad = sorted(u for u in sig if u in excl)
            if bad:
                reason = "excluded: " + " ".join(lao_of.get(u, u) for u in bad)
            elif len(sig) > a.max_k:
                reason = f"needs {len(sig)} units"
            elif not allowed(sig):
                reason = "toggle constraint"
        if not reason:
            buckets.setdefault(sig, []).append(w["cw_id"])
        sig_rows.append({"cw_id": w["cw_id"], "lao": lao, "gloss_en": w.get("gloss_en", ""),
                         "unit_ids": "|".join(sorted(sig)), "units_lao": " ".join(lao_of.get(u, u) for u in sorted(sig)),
                         "n_units": len(sig), "searched": "no" if reason else "yes", "excluded_reason": reason})
    word_lao = {w["cw_id"]: unicodedata.normalize("NFC", w["lao"]) for w in common}
    n_in = sum(len(v) for v in buckets.values())
    print(f"\ncommon words: {len(common)} | searched (≤ {a.max_k} units, no excluded unit): {n_in} | distinct signatures: {len(buckets)}")

    # Closure of signature unions with size ≤ max-k
    sigs = list(buckets)
    closure, frontier = set(sigs), list(sigs)
    while frontier:
        nxt = []
        for s in frontier:
            for b in sigs:
                u = s | b
                if len(u) <= a.max_k and u not in closure and allowed(u):
                    closure.add(u)
                    nxt.append(u)
        frontier = nxt
    scored = {s: count(s, buckets) for s in closure}
    print(f"candidate sets: {len(closure)}")

    fmt = lambda s: " ".join(lao_of.get(u, u) for u in sorted(s))
    best_rows = []
    print("\n== Best sets of at most k units ==")
    for k in range(2, a.max_k + 1):
        ranked = sorted((s for s in closure if len(s) <= k), key=lambda s: (-scored[s], len(s), sorted(s)))[:a.top]
        for rank, s in enumerate(ranked, 1):
            ws = words_in(s, buckets)
            best_rows.append({"k": k, "rank": rank, "size": len(s), "unit_ids": "|".join(sorted(s)), "units_lao": fmt(s),
                              "word_count": scored[s], "words": " ".join(word_lao[i] for i in ws), "cw_ids": "|".join(ws)})
        if ranked:
            print(f"k={k}: {scored[ranked[0]]:>4} words  {fmt(ranked[0])}")

    # Nested chain by beam search; score = sum of counts along the chain (rewards early payoff)
    beams = [((s,), scored[s]) for s in closure if len(s) <= 2] or [((frozenset(),), 0)]
    beams = sorted(beams, key=lambda b: -b[1])[:a.beam]
    for k in range(3, a.max_k + 1):
        nxt = {}
        for chain, total in beams:
            last = chain[-1]
            succ = [s for s in closure if len(s) <= k and last <= s] or [last]
            for s in succ:
                key = chain + (s,)
                nxt[key] = total + scored.get(s, 0)
        beams = sorted(nxt.items(), key=lambda b: -b[1])[:a.beam]
    chain_rows = []
    if beams:
        chain, total = beams[0]
        print(f"\n== Best nested chain (score {total}) ==")
        prev = frozenset()
        for k, s in enumerate(chain, 2):
            new_ws = [i for i in words_in(s, buckets) if i not in set(words_in(prev, buckets))]
            chain_rows.append({"k": k, "added": fmt(s - prev), "unit_ids": "|".join(sorted(s)), "units_lao": fmt(s),
                               "word_count": scored.get(s, 0), "new_words": " ".join(word_lao[i] for i in new_ws)})
            print(f"k={k}: +{fmt(s - prev):<10} {scored.get(s, 0):>4} words  new: {' '.join(word_lao[i] for i in new_ws)}")
            prev = s
    for p in problems:
        print("ERROR", p)

    if not a.check:
        os.makedirs(out, exist_ok=True)
        write(os.path.join(out, "signatures.csv"),
              ["cw_id", "lao", "gloss_en", "unit_ids", "units_lao", "n_units", "searched", "excluded_reason"], sig_rows)
        write(os.path.join(out, "best_sets.csv"),
              ["k", "rank", "size", "unit_ids", "units_lao", "word_count", "words", "cw_ids"], best_rows)
        write(os.path.join(out, "chain.csv"), ["k", "added", "unit_ids", "units_lao", "word_count", "new_words"], chain_rows)
        print(f"\nwritten: signatures.csv, best_sets.csv, chain.csv in {os.path.relpath(out, root)}")
    sys.exit(1 if problems else 0)


if __name__ == "__main__":
    main()
