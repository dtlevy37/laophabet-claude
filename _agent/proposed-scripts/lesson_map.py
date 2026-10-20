"""Best unit sets under the lesson rules: which k items (role-units + rules) make the most common words readable.

Usage (standard library only, UTF-8, run from the project root; meant for long unattended runs):
  python approved-scripts/lesson_map.py                          # chain to 30 items, exhaustive k = 4..10, top 20
  python approved-scripts/lesson_map.py --max-k 12 --hours 9     # stop cleanly after 9 hours
  python approved-scripts/lesson_map.py --weighted               # score = category usefulness, not word count
Options: --out _agent/letter_map/lesson_rules  --chain-k 30  --beam 40  --top 20  --checkpoint 10 (minutes)

Rules are the lesson rules (_agent/LESSON_PLAN.md), taken from lesson_tool.py so the two cannot drift:
  - Units are role-units (lesson_tool.World.syl_units): C23 initial, C24f final, C10c cluster, V03 vowel,
    T2 tone mark, S1 symbol. No glyph is excluded; each role is its own unit.
  - Rule R01 (dead syllables) is one more item, needed by any word with a dead syllable: from
    words.tone_derivation when the common word has a words.csv row, otherwise from the spelling
    (final ກ/ດ/ບ, i.e. a stop final, or a short vowel with no final).
  - Every set starts from lesson 1, ລາວ (lesson_tool.FIRST_UNITS); k counts those 3 units.
  - A spelling counts once (homographs read the same). Score = number of readable common words, or with
    --weighted the sum of lesson_tool.CAT_WEIGHT by category.

Phases, each written to --out as soon as it is done (safe to stop at any time with Ctrl+C):
  signatures.csv  every common word: items needed, count, searched or why not
  chain.csv       nested path from ລາວ, each step adds 1 or 2 items (beam search; minutes). Rewritten per step.
  best_k<k>.csv   exhaustive best sets of at most k items (branch and bound), k = 4, 5, ... --max-k.
                  While k is running, best_k<k>.partial.csv is rewritten every --checkpoint minutes with the
                  best found so far (a lower bound, not final). On completion the .partial file is
                  overwritten with "done" and the final best_k<k>.csv is written.
  summary.txt     one line per finished phase / k; run.log: progress every minute (nodes, best, elapsed)
"""
import argparse
import csv
import os
import sys
import time
import unicodedata
from itertools import combinations

from lesson_tool import CAT_WEIGHT, DEAD_RULE, FIRST_UNITS, World

STOPS = {"k", "t", "p"}


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


def popcount(x):
    return bin(x).count("1")


class Log:
    def __init__(self, out):
        self.run = os.path.join(out, "run.log")
        self.summary = os.path.join(out, "summary.txt")
        self.t0 = time.time()

    def stamp(self):
        return f"{time.strftime('%Y-%m-%d %H:%M:%S')} +{(time.time() - self.t0) / 60:.1f}min"

    def line(self, msg, summary=False):
        text = f"{self.stamp()} {msg}"
        print(text, flush=True)
        for path in [self.run] + ([self.summary] if summary else []):
            with open(path, "a", encoding="utf-8", newline="\n") as f:
                f.write(text + "\n")


def signature(world, row):
    """(set of items, problem) for one common-word row under the lesson rules."""
    wid = row.get("word_id", "")
    if wid and wid in world.words:
        return world.word_sig(wid)
    syls = [x for x in (row.get("syllables") or "").split("|") if x.strip()]
    if "".join(syls) != unicodedata.normalize("NFC", row["lao"]):
        return frozenset(), "syllables do not join to lao"
    probs, units, dead = [], [], False
    for k, syl in enumerate(syls, 1):
        us = world.syl_units(syl, probs, f"{row['cw_id']} syl {k}")
        units += us
        finals = [u for u in us if u.endswith("f")]
        vowels = [u for u in us if u in world.vowel]
        if any((world.letter[u[:-1]].get("ipa_final") or "").replace("̚", "") in STOPS for u in finals):
            dead = True
        elif not finals and any(world.vowel[v].get("length") == "short" for v in vowels):
            dead = True
    if dead:
        units.append(DEAD_RULE)
    return frozenset(units), "; ".join(probs)


def main():
    if hasattr(sys.stdout, "reconfigure"):
        sys.stdout.reconfigure(encoding="utf-8")
    ap = argparse.ArgumentParser(description=__doc__, formatter_class=argparse.RawDescriptionHelpFormatter)
    ap.add_argument("--data", default="data")
    ap.add_argument("--common", default="_agent/letter_map/common_words.csv")
    ap.add_argument("--out", default="_agent/letter_map/lesson_rules")
    ap.add_argument("--max-k", type=int, default=10)
    ap.add_argument("--chain-k", type=int, default=30)
    ap.add_argument("--beam", type=int, default=40)
    ap.add_argument("--top", type=int, default=20)
    ap.add_argument("--hours", type=float, default=0, help="stop cleanly after this many hours (0 = no limit)")
    ap.add_argument("--checkpoint", type=float, default=10, help="minutes between partial writes")
    ap.add_argument("--weighted", action="store_true", help="score by category usefulness instead of word count")
    a = ap.parse_args()
    root = os.path.abspath(os.getcwd())
    out = inside(a.out, root)
    os.makedirs(out, exist_ok=True)
    log = Log(out)
    deadline = log.t0 + a.hours * 3600 if a.hours else None
    world = World(inside(a.data, root), inside(a.common, root))
    log.line(f"start: max-k {a.max_k}, chain-k {a.chain_k}, beam {a.beam}, top {a.top}, "
             f"hours {a.hours or 'no limit'}, score {'weighted' if a.weighted else 'word count'}", summary=True)

    def disp(u):
        if u.startswith("R"):
            return f"{u}(dead syllables)" if u == DEAD_RULE else u
        info = world.unit_info(u)
        return info[3] if info else u

    # --- signatures ----------------------------------------------------------
    sig_rows, buckets, seen = [], {}, {}
    big = max(a.max_k, a.chain_k)
    for r in world.common:
        lao = unicodedata.normalize("NFC", r["lao"])
        sig, prob = signature(world, r)
        reason = ""
        if lao in seen:
            reason = f"same spelling as {seen[lao]} (counted once)"
        elif prob:
            reason = f"parse problem: {prob}"
        elif not sig:
            reason = "no units"
        elif len(sig | FIRST_UNITS) > big:
            reason = f"needs {len(sig | FIRST_UNITS)} items with ລາວ"
        seen.setdefault(lao, r["cw_id"])
        w = CAT_WEIGHT.get(r.get("category", ""), 1) if a.weighted else 1
        if not reason:
            b = buckets.setdefault(sig, [0, []])
            b[0] += w
            b[1].append(r["cw_id"])
        sig_rows.append({"cw_id": r["cw_id"], "lao": lao, "gloss_en": r.get("gloss_en", ""),
                         "category": r.get("category", ""), "items": "|".join(sorted(sig)),
                         "items_lao": " ".join(disp(u) for u in sorted(sig)), "n_items": len(sig),
                         "searched": "no" if reason else "yes", "reason": reason})
    write(os.path.join(out, "signatures.csv"),
          ["cw_id", "lao", "gloss_en", "category", "items", "items_lao", "n_items", "searched", "reason"], sig_rows)
    word_lao = {r["cw_id"]: unicodedata.normalize("NFC", r["lao"]) for r in world.common}
    n_in = sum(len(v[1]) for v in buckets.values())
    log.line(f"signatures: {len(world.common)} common words, {n_in} searchable (≤ {big} items with ລາວ), "
             f"{len(buckets)} distinct", summary=True)

    # bitmasks: base units first, then by how many signatures use them
    use = {}
    for s in buckets:
        for u in s:
            use[u] = use.get(u, 0) + 1
    rest = sorted((u for u in use if u not in FIRST_UNITS), key=lambda u: (-use[u], u))
    units = sorted(FIRST_UNITS) + rest
    bit = {u: 1 << i for i, u in enumerate(units)}
    to_mask = lambda s: sum(bit[u] for u in s)
    to_ids = lambda m: [u for u in units if m & bit[u]]
    base = to_mask(FIRST_UNITS)
    nb = len(FIRST_UNITS)
    sigs = [(to_mask(s), n, ids) for s, (n, ids) in buckets.items()]
    by_unit = {i: [j for j, (m, _, _) in enumerate(sigs) if m & (1 << i)] for i in range(len(units))}
    fmt = lambda m: " ".join(disp(u) for u in to_ids(m))
    score_of = lambda S: sum(n for m, n, _ in sigs if m & ~S == 0)
    words_of = lambda S: [i for m, _, ids in sigs if m & ~S == 0 for i in ids]
    log.line(f"items in use: {len(units)} | readable from ລາວ alone: {' '.join(word_lao[i] for i in words_of(base))}")

    def set_row(k, rank, S, extra=None):
        ws = words_of(S)
        row = {"k": k, "rank": rank, "size": popcount(S), "added_after_lao": fmt(S & ~base), "items": "|".join(to_ids(S)),
               "score": score_of(S), "word_count": len(ws), "words": " ".join(word_lao[i] for i in ws)}
        row.update(extra or {})
        return row

    SET_COLS = ["k", "rank", "size", "added_after_lao", "items", "score", "word_count", "words"]

    # --- phase 1: chain (beam, +1 or +2 items per step) ----------------------
    def gain(S2, added):
        done, g = set(), 0
        for i in added:
            for j in by_unit[i]:
                if j not in done and sigs[j][0] & ~S2 == 0:
                    done.add(j)
                    g += sigs[j][1]
        return g

    chain_best = {}
    beams = {base: (score_of(base), score_of(base), (base,))}
    chain_rows = []
    try:
        for k in range(nb + 1, a.chain_k + 1):
            nxt = {}
            for S, (total, cnt, chain) in beams.items():
                size = popcount(S)
                free = [i for i in range(len(units)) if not S & (1 << i)]
                singles = sorted(((gain(S | (1 << i), (i,)), i) for i in free), reverse=True)
                opts = [((), S)] + [((i,), S | (1 << i)) for _, i in singles]
                if size + 2 <= k:
                    top_i = [i for _, i in singles[:25]]
                    opts += [((i, j), S | (1 << i) | (1 << j)) for i, j in combinations(top_i, 2)]
                for added, S2 in opts:
                    c2 = cnt + (gain(S2, added) if added else 0)
                    t2 = total + c2
                    if S2 not in nxt or t2 > nxt[S2][0]:
                        nxt[S2] = (t2, c2, chain + (S2,))
            beams = dict(sorted(nxt.items(), key=lambda b: (-b[1][0], -b[1][1]))[:a.beam])
            for S, (t, c, _) in beams.items():
                if popcount(S) <= k and c > chain_best.get(k, (0, 0))[0]:
                    chain_best[k] = (c, S)
            total, cnt, chain = max(beams.values(), key=lambda v: (v[0], v[1]))
            chain_rows, prev = [], 0
            for kk, S in enumerate(chain, nb):
                before = set(words_of(prev))
                chain_rows.append({"k": kk, "added": fmt(S & ~prev), "items": "|".join(to_ids(S)), "score": score_of(S),
                                   "word_count": len(words_of(S)),
                                   "new_words": " ".join(word_lao[i] for i in words_of(S) if i not in before)})
                prev = S
            write(os.path.join(out, "chain.csv"), ["k", "added", "items", "score", "word_count", "new_words"], chain_rows)
            best_c, best_S = chain_best.get(k, (0, base))
            log.line(f"chain k={k}: best set at this size {best_c} ({fmt(best_S & ~base)}); "
                     f"leading chain total {total}")
            if deadline and time.time() > deadline:
                log.line("time limit reached during chain", summary=True)
                return
    except KeyboardInterrupt:
        log.line("stopped by user during chain (chain.csv has the last finished step)", summary=True)
        return
    log.line("chain done: " + " → ".join(f"+{r['added']}" for r in chain_rows[1:]), summary=True)
    for r in chain_rows:
        log.line(f"  k={r['k']}: {r['word_count']} words (score {r['score']})", summary=True)

    # --- phase 2: exhaustive best sets per k (branch and bound) --------------
    cap = a.top

    for K in range(nb + 1, a.max_k + 1):
        top = []          # (score, S)
        thr = [-1]
        seeded = chain_best.get(K)
        if seeded:
            top.append(seeded)
        nodes = [0]
        last_log = [time.time()]
        last_cp = [time.time()]
        part = os.path.join(out, f"best_k{K}.partial.csv")

        def write_top(path, rows_top, final):
            rows = [set_row(K, n, S, {"status": "final" if final else "provisional"})
                    for n, (_, S) in enumerate(sorted(rows_top, key=lambda e: (-e[0], to_ids(e[1])))[:cap], 1)]
            write(path, SET_COLS + ["status"], rows)

        def record(sc, S):
            if len(top) < cap or sc > thr[0]:
                if any(S == x for _, x in top):
                    return
                top.append((sc, S))
                if len(top) > 4 * cap:
                    top.sort(key=lambda e: -e[0])
                    del top[cap:]
                if len(top) >= cap:
                    thr[0] = sorted((e[0] for e in top), reverse=True)[cap - 1]

        def tick():
            now = time.time()
            if now - last_log[0] >= 60:
                last_log[0] = now
                best = max(top, key=lambda e: e[0]) if top else (0, base)
                log.line(f"k={K}: {nodes[0]:,} nodes, best {best[0]} ({fmt(best[1] & ~base)}), cut-off {thr[0]}")
            if now - last_cp[0] >= a.checkpoint * 60:
                last_cp[0] = now
                write_top(part, top, False)
            if deadline and now > deadline:
                raise TimeoutError

        def dfs(S, size, sc, live, start):
            nodes[0] += 1
            if nodes[0] % 20000 == 0:
                tick()
            if size > nb:
                record(sc, S)
            if size == K or not live:
                return
            room = K - size
            hist = [0] * (room + 1)
            cand = 0
            for m, n, miss in live:
                hist[popcount(miss)] += n
                cand |= miss
            if len(top) >= cap and sc + sum(hist) <= thr[0]:
                return
            for i in range(start, len(units)):
                b = 1 << i
                if not cand & b:
                    continue
                fut = ~((1 << (i + 1)) - 1)
                sc2, live2 = sc, []
                for m, n, miss in live:
                    if miss & b:
                        miss &= ~b
                        if not miss:
                            sc2 += n
                            continue
                    if miss & ~fut == 0 and popcount(miss) <= room - 1:
                        live2.append((m, n, miss))
                dfs(S | b, size + 1, sc2, live2, i + 1)

        sc0 = score_of(base)
        live0 = [(m, n, m & ~base) for m, n, _ in sigs if m & ~base and popcount(m & ~base) <= K - nb]
        log.line(f"k={K}: exhaustive search started ({len(live0)} reachable signatures; seeded with chain "
                 f"{seeded[0] if seeded else 'none'})", summary=True)
        try:
            dfs(base, nb, sc0, live0, nb)
        except (TimeoutError, KeyboardInterrupt) as e:
            write_top(part, top, False)
            why = "time limit" if isinstance(e, TimeoutError) else "stopped by user"
            best = max(top, key=lambda x: x[0]) if top else (0, base)
            log.line(f"k={K}: {why} after {nodes[0]:,} nodes; best so far {best[0]} ({fmt(best[1] & ~base)}), "
                     f"provisional in {os.path.basename(part)}", summary=True)
            return
        write_top(os.path.join(out, f"best_k{K}.csv"), top, True)
        with open(part, "w", encoding="utf-8") as f:
            f.write("done: see the final file\n")
        best = max(top, key=lambda x: x[0])
        log.line(f"k={K}: DONE, {nodes[0]:,} nodes; best {best[0]} = ລາວ + {fmt(best[1] & ~base)}", summary=True)
    log.line("all done", summary=True)


if __name__ == "__main__":
    main()
