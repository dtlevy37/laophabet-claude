"""Build the common-word list used by letter_map.py.

Usage (standard library only, UTF-8):
  python approved-scripts/common_list.py seed  --ids _agent/letter_map/seed_ids.txt
  python approved-scripts/common_list.py merge _agent/letter_map/proposals/p01.csv [more.csv ...]
  python approved-scripts/common_list.py report
  add --check to report without writing; --list to use another list file.

List file (default _agent/letter_map/common_words.csv), one row per common word:
  cw_id, lao, syllables, gloss_en, category, word_id, confidence, source, notes
Commonness is the model's judgement (user, 2026-10-19): being in the list means accepted.
confidence is about the Lao spelling (verified | derived | unverified), as in data/.

seed:  --ids is a text file of word_ids (one per line, or separated by commas/spaces; '#' starts a
       comment). Copies lao, syllables, gloss_en, topic (as category), confidence and source from
       data/words.csv. Ids already in the list are skipped.
merge: proposal CSVs with columns lao, syllables, gloss_en, category, confidence, source, notes
       (syllables pipe-separated, like words.csv). Lao text is NFC-normalized; syllables must join
       to lao and every syllable must parse (build_order.parse_syllable). A row whose lao is already
       in the list is skipped unless --allow-homograph names it. word_id is linked when words.csv
       has the same spelling. Rejected rows are printed and nothing is written for them.
New rows get the next free cw_id (CW + 5 digits). Prints counts by category and confidence.
"""
import argparse
import csv
import os
import re
import sys
import unicodedata

from build_order import parse_syllable

COLS = ["cw_id", "lao", "syllables", "gloss_en", "category", "word_id", "confidence", "source", "notes"]
CONF = {"verified", "derived", "unverified"}


def read(path):
    with open(path, encoding="utf-8-sig", newline="") as f:
        r = csv.DictReader(f)
        rows = list(r)
        bad = [i for i, row in enumerate(rows, 2) if None in row]
        if bad:
            sys.exit(f"{path}: rows with more fields than the header (unquoted comma?) at lines {bad[:10]}; nothing written")
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


nfc = lambda t: unicodedata.normalize("NFC", (t or "").strip())


def report(rows):
    by_cat, by_conf = {}, {}
    for r in rows:
        by_cat[r["category"]] = by_cat.get(r["category"], 0) + 1
        by_conf[r["confidence"]] = by_conf.get(r["confidence"], 0) + 1
    print(f"common words: {len(rows)}")
    print("by confidence:", ", ".join(f"{k} {v}" for k, v in sorted(by_conf.items())))
    print("by category:", ", ".join(f"{k} {v}" for k, v in sorted(by_cat.items(), key=lambda x: -x[1])))


def main():
    if hasattr(sys.stdout, "reconfigure"):
        sys.stdout.reconfigure(encoding="utf-8")
    ap = argparse.ArgumentParser(description=__doc__, formatter_class=argparse.RawDescriptionHelpFormatter)
    ap.add_argument("mode", choices=["seed", "merge", "report"])
    ap.add_argument("files", nargs="*", help="proposal CSVs (merge)")
    ap.add_argument("--ids", help="word_id file (seed)")
    ap.add_argument("--data", default="data")
    ap.add_argument("--list", default="_agent/letter_map/common_words.csv")
    ap.add_argument("--allow-homograph", default="", help="comma-separated lao spellings allowed twice")
    ap.add_argument("--check", action="store_true", help="report only; write nothing")
    a = ap.parse_args()
    root = os.path.abspath(os.getcwd())
    d, lst = inside(a.data, root), inside(a.list, root)

    rows = read(lst) if os.path.exists(lst) else []
    words = read(os.path.join(d, "words.csv"))
    letters = read(os.path.join(d, "letters.csv"))
    vowels = read(os.path.join(d, "vowels.csv"))
    letter_id = {r["lao"]: r["letter_id"] for r in letters}
    vowel_id = {r["lao_pattern"]: r["vowel_id"] for r in vowels}
    vowel_form = {r["lao_pattern"]: r["form"] for r in vowels}
    word_by_id = {w["word_id"]: w for w in words}
    word_by_lao = {}
    for w in words:
        word_by_lao.setdefault(nfc(w["lao"]), w["word_id"])
    have_lao = {nfc(r["lao"]) for r in rows}
    have_wid = {r["word_id"] for r in rows if r.get("word_id")}
    allow = {nfc(x) for x in a.allow_homograph.split(",") if x.strip()}
    nums = [int(r["cw_id"][2:]) for r in rows if re.fullmatch(r"CW\d{5}", r.get("cw_id", ""))]
    next_n = max(nums, default=0) + 1
    added, rejected = [], []

    if a.mode == "seed":
        if not a.ids:
            sys.exit("seed needs --ids")
        with open(inside(a.ids, root), encoding="utf-8-sig") as f:
            text = "\n".join(line.split("#", 1)[0] for line in f)
        for wid in re.findall(r"W\d{6}", text):
            if wid in have_wid:
                continue
            w = word_by_id.get(wid)
            if not w:
                rejected.append(f"{wid}: not in words.csv")
                continue
            added.append({"lao": nfc(w["lao"]), "syllables": nfc(w.get("syllables")), "gloss_en": w.get("gloss_en", ""),
                          "category": w.get("topic", ""), "word_id": wid, "confidence": w.get("confidence", ""),
                          "source": w.get("source", ""), "notes": ""})
            have_wid.add(wid)
    elif a.mode == "merge":
        if not a.files:
            sys.exit("merge needs at least one proposal CSV")
        for path in a.files:
            for n, p in enumerate(read(inside(path, root)), 2):
                ctx = f"{os.path.basename(path)}:{n}"
                lao, syl = nfc(p.get("lao")), nfc(p.get("syllables"))
                syls = [x for x in syl.split("|") if x]
                if not lao or not (p.get("gloss_en") or "").strip():
                    rejected.append(f"{ctx}: lao and gloss_en are required")
                    continue
                if "".join(syls) != lao:
                    rejected.append(f"{ctx}: syllables '{syl}' do not join to '{lao}'")
                    continue
                probs = []
                for k, s in enumerate(syls, 1):
                    parse_syllable(s, letter_id, vowel_id, vowel_form, probs, f"{ctx} syl {k}")
                if probs:
                    rejected += probs
                    continue
                conf = (p.get("confidence") or "unverified").strip()
                if conf not in CONF:
                    rejected.append(f"{ctx}: confidence '{conf}' not one of {sorted(CONF)}")
                    continue
                if lao in have_lao and lao not in allow:
                    rejected.append(f"{ctx}: '{lao}' already in the list (use --allow-homograph)")
                    continue
                added.append({"lao": lao, "syllables": syl, "gloss_en": p["gloss_en"].strip(),
                              "category": (p.get("category") or "").strip(), "word_id": word_by_lao.get(lao, ""),
                              "confidence": conf, "source": (p.get("source") or "").strip(), "notes": (p.get("notes") or "").strip()})
                have_lao.add(lao)

    for r in added:
        r["cw_id"] = f"CW{next_n:05d}"
        next_n += 1
    rows += added
    for x in rejected:
        print("REJECT", x)
    print(f"added: {len(added)} | rejected: {len(rejected)}")
    report(rows)
    if added and not a.check:
        os.makedirs(os.path.dirname(lst), exist_ok=True)
        write(lst, COLS, rows)
        print(f"written: {os.path.relpath(lst, root)}")


if __name__ == "__main__":
    main()
