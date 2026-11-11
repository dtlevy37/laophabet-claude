"""Map learned unit sets to the common words they can spell; find the best first sets.

Usage (standard library only, UTF-8):
  python approved-scripts/letter_map.py                       # k = 2..7, top 20, write reports
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

Revision 2 (2026-10-19): faster search for larger k.
  - Signatures are bitmasks (one bit per unit); "readable" is sig & ~S == 0.
  - Best sets: depth-first search adding units in a fixed order (most-used first). Each node
    carries its "live" signatures (not yet readable but still reachable with the units left), so
    adding a unit only touches those; a unit that is in no live signature is skipped (it would
    only pad the set). Branch and bound: a branch stops when even reading every live signature
    that fits in the remaining slots cannot reach the current top N for any k. Exact up to ties
    at the cut-off rank. Only sets in which every unit is used by a readable word are reported.
  - Chain: beam search over sets, each step keeps the set or adds one or two units; new words are
    counted from a unit → signature index. Score = sum of counts along the chain.
"""
import argparse
import csv
import os
import sys
import time
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


def popcount(x):
    return bin(x).count("1")


def main():
    if hasattr(sys.stdout, "reconfigure"):
        sys.stdout.reconfigure(encoding="utf-8")
    ap = argparse.ArgumentParser(description=__doc__, formatter_class=argparse.RawDescriptionHelpFormatter)
    ap.add_argument("--data", default="data")
    ap.add_argument("--common", default="_agent/letter_map/common_words.csv")
    ap.add_argument("--out", default="_agent/letter_map")
    ap.add_argument("--max-k", type=int, default=7)
    ap.add_argument("--top", type=int, default=20)
    ap.add_argument("--beam", type=int, default=50)
    ap.add_argument("--one-class", action="store_true", help="all consonants in a set share one class")
    ap.add_argument("--no-shared-glyphs", action="store_true", help="no two vowel patterns in a set share a glyph")
    ap.add_argument("--check", action="store_true", help="report only; write nothing")
    a = ap.parse_args()
    root = os.path.abspath(os.getcwd())
    d, out = inside(a.data, root), inside(a.out, root)
    K = a.max_k
    t0 = time.time()

    letters = read(os.path.join(d, "letters.csv"))
    vowels = read(os.path.join(d, "vowels.csv"))
    common = read(inside(a.common, root))
    letter_id = {r["lao"]: r["letter_id"] for r in letters}
    vowel_id = {r["lao_pattern"]: r["vowel_id"] for r in vowels}
    vowel_form = {r["lao_pattern"]: r["form"] for r in vowels}
    lao_of = {r["letter_id"]: r["lao"] for r in letters} | {r["vowel_id"]: r["lao_pattern"] for r in vowels}
    cls = {r["letter_id"]: r.get("consonant_class", "") for r in letters if r.get("kind", "").startswith("consonant")}
    glyphs = {r["vowel_id"]: frozenset(set(r["lao_pattern"]) - {PH}) for r in vowels}
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
            elif len(sig) > K:
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
    print(f"\ncommon words: {len(common)} | searched (≤ {K} units, no excluded unit): {n_in} | distinct signatures: {len(buckets)}")

    # Bitmasks: units ordered by how many signatures use them (most first) for early good bounds.
    use = {}
    for s in buckets:
        for u in s:
            use[u] = use.get(u, 0) + 1
    units = sorted(use, key=lambda u: (-use[u], u))
    bit = {u: 1 << i for i, u in enumerate(units)}
    to_mask = lambda s: sum(bit[u] for u in s)
    to_ids = lambda m: sorted(u for u in units if m & bit[u])
    sigs = [(to_mask(s), len(ids), ids) for s, ids in buckets.items()]
    by_unit = {i: [j for j, (m, _, _) in enumerate(sigs) if m & (1 << i)] for i in range(len(units))}
    future = [0] * (len(units) + 1)
    for i in range(len(units) - 1, -1, -1):
        future[i] = future[i + 1] | (1 << i)
    u_cls = [cls.get(u) for u in units]
    u_gly = [glyphs.get(u, frozenset()) for u in units]

    def ok_add(i, cls_now, gly_now):
        if a.one_class and u_cls[i] and cls_now and u_cls[i] != cls_now:
            return False
        if a.no_shared_glyphs and u_gly[i] & gly_now:
            return False
        return True

    # Best sets: branch and bound
    cap = max(a.top, a.beam)
    rec = {k: [] for k in range(1, K + 1)}
    thr = {k: -1 for k in rec}
    rank_key = lambda e: (-e[0], e[1], to_ids(e[2]))

    def trim(k, n):
        rec[k].sort(key=rank_key)
        del rec[k][n:]
        if len(rec[k]) >= cap:
            thr[k] = rec[k][-1][0]

    def record(cnt, size, S):
        for k in range(size, K + 1):
            if len(rec[k]) < cap or cnt > thr[k]:
                rec[k].append((cnt, size, S))
                if len(rec[k]) > 4 * cap:
                    trim(k, cap)

    nodes = 0

    def dfs(S, size, cnt, used, live, start, cls_now, gly_now):
        nonlocal nodes
        nodes += 1
        if size and used == S:
            record(cnt, size, S)
        if size == K or not live:
            return
        hist = [0] * (K + 1)
        cand = 0
        for m, n, miss in live:
            hist[popcount(miss)] += n
            cand |= miss
        acc, bound = cnt, {}
        for r in range(1, K - size + 1):
            acc += hist[r]
            bound[size + r] = acc
        if all(len(rec[k]) >= cap and bound[k] <= thr[k] for k in bound):
            return
        for i in range(start, len(units)):
            b = 1 << i
            if not cand & b or not ok_add(i, cls_now, gly_now):
                continue
            S2, room, fut = S | b, K - size - 1, future[i + 1]
            cnt2, used2, live2 = cnt, used, []
            for m, n, miss in live:
                if miss & b:
                    miss = miss & ~b
                    if not miss:
                        cnt2 += n
                        used2 |= m
                        continue
                if miss & ~fut == 0 and popcount(miss) <= room:
                    live2.append((m, n, miss))
            dfs(S2, size + 1, cnt2, used2, live2, i + 1,
                cls_now or u_cls[i], gly_now | u_gly[i])

    dfs(0, 0, 0, 0, [(m, n, m) for m, n, _ in sigs], 0, None, frozenset())
    for k in rec:
        trim(k, cap)
    print(f"search nodes: {nodes} | {time.time() - t0:.1f}s")

    fmt = lambda m: " ".join(lao_of.get(u, u) for u in to_ids(m))
    words_of = lambda S: [i for m, _, ids in sigs if m & ~S == 0 for i in ids]
    best_rows = []
    print("\n== Best sets of at most k units ==")
    for k in range(2, K + 1):
        for rank, (cnt, size, S) in enumerate(rec[k][:a.top], 1):
            ws = words_of(S)
            best_rows.append({"k": k, "rank": rank, "size": size, "unit_ids": "|".join(to_ids(S)), "units_lao": fmt(S),
                              "word_count": cnt, "words": " ".join(word_lao[i] for i in ws), "cw_ids": "|".join(ws)})
        if rec[k]:
            print(f"k={k}: {rec[k][0][0]:>4} words  {fmt(rec[k][0][2])}")

    # Nested chain: beam over sets; each step keeps the set or adds one or two units.
    def gain(S2, added):
        seen, g = set(), 0
        for i in added:
            for j in by_unit[i]:
                if j not in seen and sigs[j][0] & ~S2 == 0:
                    seen.add(j)
                    g += sigs[j][1]
        return g

    def ok_set(S):
        ids = to_ids(S)
        return allowed(set(ids))

    beams = {S: (cnt, cnt, (S,)) for cnt, size, S in rec[2] if size <= 2} or {0: (0, 0, (0,))}
    beams = dict(sorted(beams.items(), key=lambda b: -b[1][0])[:a.beam])
    for k in range(3, K + 1):
        nxt = {}
        for S, (score, cnt, chain) in beams.items():
            size = popcount(S)
            free = [i for i in range(len(units)) if not S & (1 << i)]
            opts = [((), S)]
            if size + 1 <= k:
                opts += [((i,), S | (1 << i)) for i in free]
            if size + 2 <= k:
                opts += [((i, j), S | (1 << i) | (1 << j)) for i, j in combinations(free, 2)]
            for added, S2 in opts:
                if added and (a.one_class or a.no_shared_glyphs) and not ok_set(S2):
                    continue
                c2 = cnt + gain(S2, added)
                s2 = score + c2
                if S2 not in nxt or s2 > nxt[S2][0]:
                    nxt[S2] = (s2, c2, chain + (S2,))
        beams = dict(sorted(nxt.items(), key=lambda b: (-b[1][0], -b[1][1]))[:a.beam])
    chain_rows = []
    if beams:
        total, _, chain = max(beams.values(), key=lambda v: (v[0], v[1]))
        print(f"\n== Best nested chain (score {total}) ==")
        prev = 0
        for k, S in enumerate(chain, 2):
            before = set(words_of(prev))
            new_ws = [i for i in words_of(S) if i not in before]
            cnt = sum(n for m, n, _ in sigs if m & ~S == 0)
            chain_rows.append({"k": k, "added": fmt(S & ~prev), "unit_ids": "|".join(to_ids(S)), "units_lao": fmt(S),
                               "word_count": cnt, "new_words": " ".join(word_lao[i] for i in new_ws)})
            print(f"k={k}: +{fmt(S & ~prev):<10} {cnt:>4} words  new: {' '.join(word_lao[i] for i in new_ws)}")
            prev = S
    print(f"total time: {time.time() - t0:.1f}s")
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
