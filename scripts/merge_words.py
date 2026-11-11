"""Merge drafted word batches into data/words.csv: drop duplicates, remap references, renumber.

Usage (standard library only, UTF-8):
  python scripts/merge_words.py BATCH.csv [BATCH.csv ...]
      [--drop W0819,W0914] [--remap W0934=W0601,W0936=W0705]
      [--allow-homograph ສ້ອມ,ຮາກ] [--words data/words.csv] [--map-out tmp/merge_map.csv]
      [--check]

Steps:
  1. Read words.csv and the batches (all must have the words.csv header; rows with extra
     fields are refused).
  2. Drop the --drop IDs. --remap old=new rewrites references (classifier_word_id,
     component_word_ids) from a dropped row to the row that is kept.
  3. Renumber the remaining batch rows in file order from the next free number after
     words.csv: word_id W####, intro_order and freq_rank = that number. References inside
     the batches are rewritten to the new IDs.
  4. Refuse (write nothing) if: the total exceeds HARD_CAP (3000); a Lao spelling occurs
     twice and is not listed in --allow-homograph; a reference points to an unknown ID; a
     row points to itself (except classifier_word_id on a classifier_type=self noun).
  5. Unless --check: append to words.csv atomically (temp file + replace) and write the
     old->new ID map to --map-out.
  Optional companions (appended in the same run, each checked first):
     --sentences F.csv ...  appended to data/sentences.csv (same header). Sentence IDs are
                            renumbered from the next free S#########, and batch word IDs in
                            target_word_id and word_overrides ("4=W000058") are remapped, so
                            drafts may use any placeholder IDs.
     --templates F.csv ...  appended to data/templates.csv (same header, no duplicate template_id)
     --fillers F.csv ...    appended to data/template_fillers.csv; word_id values written as
                            LAO:<spelling> are resolved to the merged word_id (refused if the
                            spelling is unknown or a homograph), old batch IDs are remapped.

Revision 2 (2026-10-10): classifier_type=self rows may (and must) point classifier_word_id at
themselves. An empty value on a self row is filled with the row's own (renumbered) ID.
Revision 3 (2026-10-10): wide IDs (words W + 6 digits, sentences S + 9 digits); sentences are
renumbered and their word references remapped (see --sentences).
"""
import argparse
import csv
import os
import re
import sys

HARD_CAP = 3000  # user decision 2026-10-10 (CLAUDE.md "Targets")
REF_COLS = ("classifier_word_id", "component_word_ids")


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


def split_ids(text):
    return [x.strip() for x in (text or "").split("|") if x.strip()]


def parse_list(text):
    return [x.strip() for x in (text or "").split(",") if x.strip()]


def main():
    if hasattr(sys.stdout, "reconfigure"):
        sys.stdout.reconfigure(encoding="utf-8")
    p = argparse.ArgumentParser(description=__doc__, formatter_class=argparse.RawDescriptionHelpFormatter)
    p.add_argument("batches", nargs="+")
    p.add_argument("--words", default=os.path.join("data", "words.csv"))
    p.add_argument("--drop", default="")
    p.add_argument("--remap", default="")
    p.add_argument("--allow-homograph", default="")
    p.add_argument("--map-out", default=os.path.join("tmp", "merge_map.csv"))
    p.add_argument("--check", action="store_true", help="report only; write nothing")
    p.add_argument("--sentences", nargs="*", default=[])
    p.add_argument("--templates", nargs="*", default=[])
    p.add_argument("--fillers", nargs="*", default=[])
    a = p.parse_args()

    words, cols = read(a.words)
    drop = set(parse_list(a.drop))
    remap = {}
    for pair in parse_list(a.remap):
        old, _, new = pair.partition("=")
        if not new:
            sys.exit(f"--remap entry {pair!r} must be old=new")
        remap[old.strip()] = new.strip()
    homographs = set(parse_list(a.allow_homograph))

    batch_rows = []
    for path in a.batches:
        rows, bcols = read(path)
        if bcols != cols:
            sys.exit(f"{path}: header differs from {a.words}")
        batch_rows.extend(rows)
    ids_seen = [r["word_id"] for r in batch_rows]
    dup_ids = sorted({i for i in ids_seen if ids_seen.count(i) > 1})
    if dup_ids:
        sys.exit(f"duplicate word_id inside the batches: {dup_ids}")
    unknown_drop = drop - set(ids_seen)
    if unknown_drop:
        sys.exit(f"--drop IDs not found in the batches: {sorted(unknown_drop)}")
    for old in remap:
        if old not in drop:
            sys.exit(f"--remap source {old} is not dropped; remap only dropped rows")

    kept = [r for r in batch_rows if r["word_id"] not in drop]
    nums = [int(m.group(1)) for r in words for m in [re.fullmatch(r"W(\d+)", r["word_id"])] if m]
    nxt = max(nums) + 1 if nums else 1
    total = len(words) + len(kept)
    if total > HARD_CAP:
        sys.exit(f"total {total} words would exceed the hard cap of {HARD_CAP}; nothing written")

    new_id = dict(remap)
    for k, r in enumerate(kept):
        new_id[r["word_id"]] = f"W{nxt + k:06d}"
    known = {r["word_id"] for r in words} | {new_id[r["word_id"]] for r in kept}

    problems = []
    for r in kept:
        old = r["word_id"]
        n = int(new_id[old][1:])
        r["word_id"], r["intro_order"], r["freq_rank"] = new_id[old], str(n), str(n)
        is_self = (r.get("classifier_type") or "").strip() == "self"
        if is_self and not (r.get("classifier_word_id") or "").strip():
            r["classifier_word_id"] = old  # self: the noun is its own classifier (rewritten below)
        for c in REF_COLS:
            refs = [new_id.get(x, x) for x in split_ids(r.get(c))]
            for x in refs:
                if x not in known:
                    problems.append(f"{r['word_id']} (was {old}): {c} points to unknown {x}")
                elif x == r["word_id"] and not (c == "classifier_word_id" and is_self):
                    problems.append(f"{r['word_id']} (was {old}): {c} points to itself")
            r[c] = "|".join(refs)
        if is_self and r["classifier_word_id"] != r["word_id"]:
            problems.append(f"{r['word_id']} (was {old}): classifier_type self but classifier_word_id "
                            f"is {r['classifier_word_id']}")

    spellings = {}
    for r in words + kept:
        spellings.setdefault(r["lao"], []).append(r["word_id"])
    for lao, ids in spellings.items():
        if len(ids) > 1 and lao not in homographs and any(i in {x["word_id"] for x in kept} for i in ids):
            problems.append(f"spelling {lao} occurs {len(ids)} times ({','.join(ids)}); drop one or list it in --allow-homograph")

    # Companion tables. Each entry: (data path, header, existing rows, new rows).
    data_dir = os.path.dirname(a.words) or "."
    by_spelling = {}
    for r in words + kept:
        by_spelling.setdefault(r["lao"], []).append(r["word_id"])
    companions = []
    for files, name, id_col in ((a.sentences, "sentences", "sentence_id"),
                                (a.templates, "templates", "template_id"),
                                (a.fillers, "template_fillers", None)):
        if not files:
            continue
        path = os.path.join(data_dir, name + ".csv")
        existing, ecols = read(path)
        new = []
        for fpath in files:
            rows, fcols = read(fpath)
            if fcols != ecols:
                problems.append(f"{fpath}: header differs from {path}")
                continue
            new.extend(rows)
        if name == "sentences":
            snums = [int(m.group(1)) for r in existing for m in [re.fullmatch(r"S(\d+)", r["sentence_id"])] if m]
            snext = max(snums) + 1 if snums else 1
            for k, r in enumerate(new):
                r["sentence_id"] = f"S{snext + k:09d}"
                if r.get("target_word_id"):
                    r["target_word_id"] = new_id.get(r["target_word_id"].strip(), r["target_word_id"].strip())
                    if r["target_word_id"] not in known:
                        problems.append(f"{r['sentence_id']}: target_word_id {r['target_word_id']} unknown")
                ovs = []
                for ov in [x.strip() for x in (r.get("word_overrides") or "").split(";") if x.strip()]:
                    pos_, _, wid = ov.partition("=")
                    wid = new_id.get(wid.strip(), wid.strip())
                    if wid not in known:
                        problems.append(f"{r['sentence_id']}: word_overrides {ov} points to unknown {wid}")
                    ovs.append(f"{pos_.strip()}={wid}")
                if "word_overrides" in r:
                    r["word_overrides"] = ";".join(ovs)
        if id_col:
            ids = [r[id_col] for r in existing + new]
            dups = sorted({i for i in ids if ids.count(i) > 1})
            if dups:
                problems.append(f"{name}: duplicate {id_col} {dups[:10]}")
        if name == "template_fillers":
            for r in new:
                wid = r["word_id"].strip()
                if wid.startswith("LAO:"):
                    hits = by_spelling.get(wid[4:], [])
                    if len(hits) != 1:
                        problems.append(f"filler {r['template_id']}/{wid}: spelling matches {len(hits)} words")
                    else:
                        r["word_id"] = hits[0]
                else:
                    r["word_id"] = new_id.get(wid, wid)
                    if r["word_id"] not in known:
                        problems.append(f"filler {r['template_id']}: unknown word_id {wid}")
        companions.append((path, ecols, existing, new))

    for msg in problems:
        print("PROBLEM", msg, file=sys.stderr)
    print(f"words.csv {len(words)} + kept {len(kept)} (dropped {len(drop)}) = {total}; "
          f"new IDs W{nxt:06d}-W{nxt + len(kept) - 1:06d}; "
          + "".join(f"{os.path.basename(c[0])} +{len(c[3])}; " for c in companions)
          + f"problems: {len(problems)}", file=sys.stderr)
    if problems:
        sys.exit(1)
    if a.check:
        return

    for path, ccols, existing, new in [(a.words, cols, words, kept)] + companions:
        target = safe_path(path)
        with open(target + ".tmp", "w", encoding="utf-8", newline="") as f:
            w = csv.DictWriter(f, fieldnames=ccols, lineterminator="\n")
            w.writeheader()
            w.writerows(existing + new)
        os.replace(target + ".tmp", target)
    with open(safe_path(a.map_out), "w", encoding="utf-8", newline="") as f:
        w = csv.writer(f, lineterminator="\n")
        w.writerow(["old_id", "new_id", "lao", "action"])
        for old, r in zip(ids_seen, batch_rows):
            if old in drop:
                w.writerow([old, remap.get(old, ""), r["lao"], "dropped"])
            else:
                w.writerow([old, r["word_id"], r["lao"], "kept"])
    print(f"appended {len(kept)} rows to {a.words}; ID map in {a.map_out}", file=sys.stderr)


if __name__ == "__main__":
    main()
