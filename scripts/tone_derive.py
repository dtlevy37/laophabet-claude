"""Derive Vientiane Lao tones per syllable and cross-check recorded data.

Rules: the 15-cell matrix in docs/SCHEMA.md ("Tone convention"), sourced from
SEAsite tonechart.htm, Wiktionary Lao entry guidelines / Module:lo-pron and
Wikipedia "Lao language" 7.1.1 (see _shelf/research/lao-tones-wiktionary-fsi-kerr.md).

Usage (standard library only, reads/writes UTF-8):
  python scripts/tone_derive.py --selftest
  python scripts/tone_derive.py --syl "ສະ|ບາຍ|ດີ"
  python scripts/tone_derive.py data/words.csv [--out tmp/tone_check.csv]
      [--id-col word_id] [--syl-col syllables] [--tone-col tone_by_syllable] [--ipa-col ipa]
  python scripts/tone_derive.py data/words.csv --fill
      writes tone_derivation for every row, and tone_by_syllable where it is empty,
      back into the same CSV (existing tones are never overwritten; mismatches are reported)

Input CSV: syllables pipe-separated (ສະ|ບາຍ|ດີ). Optional columns to cross-check:
  tone_by_syllable  pipe-separated tone names (low-rising|...)
  ipa               syllables separated by space or '.', each ending in Chao tone letters
Output: one row per syllable with the full derivation; exit code 1 on any mismatch,
parse warning that blocks derivation, or self-test failure.

Revision 2: ◌ອ◌ and ◌ວ◌ count as written vowels (no false "no-written-vowel" warning);
--fill mode added.
Revision 3: --fill writes atomically and refuses rows with more fields than the header.
Revision 4:
  - ◌ົວ (open ua, e.g. ຕົວ ຫົວ) is a long vowel; rev 3 reported it as short.
  - Consonant + ວ clusters (ຂວາ ກວ່າ ຄວາມ ແຂວງ) report the initial as the cluster
    (flag w-cluster). ວ followed directly by a final with no other vowel stays the
    vowel ◌ວ◌ (ສວນ ຂວດ ຫ່ວງ), and so does ຫວ + final. Tones are unchanged (class
    comes from the first consonant).
  - Lexical tone exceptions (loanwords such as ຄອມພິວເຕີ): --exceptions CSV with
    word_id,syl_index,tone,source,note (default data/tone_exceptions.csv when present).
    A listed syllable gets status LEXICAL instead of MISMATCH when the recorded tone and
    IPA agree with the listed tone; --fill writes the listed tone and marks the
    derivation "→cell!lexical".
  - --quiet prints only rows that are not ok, so large CSVs don't flood the console.
Revision 5: ວ after ໄ/ໃ is part of the initial (ໄຫວ້); loanword ລ/ຣ clusters before a
  vowel sign (ຄລີນິກ) are part of the initial. Tones are unchanged.
"""
import argparse
import csv
import os
import sys

HIGH = set("ຂສຖຜຝຫໜໝ")
MID = set("ກຈດຕບປຢອ")
LOW = set("ຄຊທພຟຮງຍນມຣລວ")
CONSONANTS = HIGH | MID | LOW
LEADING_VOWELS = set("ເແໂໃໄ")
TONE_MARKS = {"່": "mai_ek", "້": "mai_tho", "໊": "mai_ti", "໋": "mai_catawa"}
SHORT_SIGNS = set("ະັິຶຸົ")  # ະ ັ ິ ຶ ຸ ົ
VOWEL_SIGNS = set("ະັາຳິີຶືຸູົຽໍ")
SUBSCRIPT_L = "ຼ"
CANCEL = "໌"
STOP_FINALS = set("ກດບ")
SONORANTS = set("ງຍນມວລຣ")
HO_CLUSTER_SECOND = set("ງຍນມລວຣ")

CHAO = {
    "low-rising": "˩˧",
    "high-rising": "˧˥",
    "mid": "˧",
    "low-falling": "˧˩",
    "high-falling": "˥˨",
}

# (class, case) -> (tone, matrix cell number). case: live | mai_ek | mai_tho | dead_long | dead_short
MATRIX = {
    ("high", "live"): ("low-rising", 1),
    ("mid", "live"): ("low-rising", 2),
    ("low", "live"): ("high-rising", 3),
    ("high", "mai_ek"): ("mid", 4),
    ("mid", "mai_ek"): ("mid", 5),
    ("low", "mai_ek"): ("mid", 6),
    ("high", "mai_tho"): ("low-falling", 7),
    ("mid", "mai_tho"): ("high-falling", 8),
    ("low", "mai_tho"): ("high-falling", 9),
    ("high", "dead_long"): ("low-falling", 10),
    ("mid", "dead_long"): ("low-falling", 11),
    ("low", "dead_long"): ("high-falling", 12),
    ("high", "dead_short"): ("high-rising", 13),
    ("mid", "dead_short"): ("high-rising", 14),
    ("low", "dead_short"): ("mid", 15),
}
# Rare marks: only machine-readable assignment seen is Wiktionary Module:lo-pron (uncited).
RARE_MARK_TONES = {"mai_ti": "high-rising", "mai_catawa": "low-rising"}


def consonant_class(ch):
    if ch in HIGH:
        return "high"
    if ch in MID:
        return "mid"
    if ch in LOW:
        return "low"
    return None


def w_is_cluster(s, w_idx, leading):
    """ວ right after the initial (no tone mark between) belongs to a kw-type cluster when
    a vowel sign follows it (ຂວາ ກວ່າ) or a leading vowel carries the vowel (ແຂວງ).
    Followed directly by a final consonant with no leading vowel, it is the vowel ◌ວ◌."""
    rest = [c for c in s[w_idx + 1:] if c not in TONE_MARKS]
    if not rest:
        # ວ is the last letter: a final (ແກ້ວ), except after ໄ/ໃ, which take no final (ໄຫວ້)
        return leading in ("ໄ", "ໃ")
    if rest[0] in VOWEL_SIGNS:
        return True
    return bool(leading) and rest[0] in CONSONANTS


def analyse(syl):
    """Return a dict describing one written syllable's tone derivation."""
    flags = []
    s = syl.strip()
    if "ໆ" in s:
        s = s.replace("ໆ", "")
        flags.append("repetition-mark-stripped")
    # Drop a consonant silenced by the cancellation mark (consonant + optional vowel sign + ໌).
    if CANCEL in s:
        idx = s.index(CANCEL)
        j = idx - 1
        while j >= 0 and s[j] not in CONSONANTS:
            j -= 1
        if j >= 0:
            s = s[:j] + s[idx + 1:]
        else:
            s = s.replace(CANCEL, "")
        flags.append("cancelled-letter-removed")
    res = {"syllable": syl, "initial": "", "class": "", "tone_mark": "none", "final": "",
           "vowel_length": "", "case": "", "tone": "", "chao": "", "cell": "", "flags": flags}
    if not s:
        flags.append("ERROR:empty")
        return res

    i = 0
    leading = ""
    while i < len(s) and s[i] in LEADING_VOWELS:
        leading += s[i]
        i += 1
    if i >= len(s) or s[i] not in CONSONANTS:
        flags.append("ERROR:no-initial-consonant")
        return res
    c0 = s[i]
    init_end = i + 1
    nxt = s[init_end] if init_end < len(s) else ""
    if nxt == "ວ" and not w_is_cluster(s, init_end, leading):
        pass  # ວ is the vowel ◌ວ◌ (ສວນ, ຫວ + final), not part of the initial
    elif c0 == "ຫ" and nxt in HO_CLUSTER_SECOND:
        init_end += 1
        flags.append("ho-cluster")
    elif nxt == SUBSCRIPT_L:
        init_end += 1
        flags.append("subscript-lo-cluster")
    elif nxt == "ວ":
        init_end += 1
        flags.append("w-cluster")
    elif nxt in ("ລ", "ຣ") and init_end + 1 < len(s) and s[init_end + 1] in VOWEL_SIGNS:
        # Loanword cluster (ຄລີນິກ): a vowel sign straight after ລ/ຣ means it is not a final.
        init_end += 1
        flags.append("l-cluster(loan)")
    res["initial"] = s[i:init_end]
    cls = consonant_class(c0)
    res["class"] = cls

    marks = [TONE_MARKS[c] for c in s if c in TONE_MARKS]
    if len(marks) > 1:
        flags.append("ERROR:multiple-tone-marks")
        return res
    mark = marks[0] if marks else "none"
    res["tone_mark"] = mark

    body = s[init_end:]
    base = [c for c in body if c not in TONE_MARKS]
    # ອ inside the body is a vowel carrier (◌ອ◌, ເ◌ືອ); ວ before another letter is the vowel ◌ວ◌ / ◌ົວ.
    has_vowel = bool(leading) or any(c in VOWEL_SIGNS for c in base) or "ອ" in base or "ວ" in base[:-1]
    # ◌ົວ is long ua; only a following ະ (◌ົວະ) makes it short.
    unmarked = "".join(c for c in s if c not in TONE_MARKS)
    short = any(c in SHORT_SIGNS and not (c == "ົ" and unmarked[k + 1:k + 2] == "ວ")
                for k, c in enumerate(unmarked))
    last = base[-1] if base else ""

    special = ("ຳ" in s) or leading in ("ໄ", "ໃ") or (
        leading == "ເ" and "ົ" in s and last == "າ")
    case = None
    if special:
        case = "live"
        res["vowel_length"] = "special"
        flags.append("special-vowel(am/ai/ao)")
    elif last in STOP_FINALS:
        res["final"] = last
        case = "dead_short" if short else "dead_long"
        res["vowel_length"] = "short" if short else "long"
    elif last in SONORANTS or last == "ອ":
        if leading == "ເ" and "ັ" in s and last == "ຍ":
            case = "dead_short"
            res["vowel_length"] = "short"
            flags.append("short-open-ia(rare-pattern-check)")
        else:
            case = "live"
            res["final"] = last if last in SONORANTS else ""
            res["vowel_length"] = "short" if short else "long"
    elif last in CONSONANTS:
        res["final"] = last
        case = "dead_short" if short else "dead_long"
        res["vowel_length"] = "short" if short else "long"
        flags.append("nonstandard-final(treated-as-stop)")
    else:
        # Open syllable: no final consonant.
        if short:
            case = "dead_short"
            res["vowel_length"] = "short"
            flags.append("open-short(glottal)")
        else:
            case = "live"
            res["vowel_length"] = "long"
    if not has_vowel:
        flags.append("WARN:no-written-vowel(check-inherent-vowel)")

    if mark in ("mai_ek", "mai_tho"):
        tone, cell = MATRIX[(cls, mark)]
        res["case"] = mark
    elif mark in RARE_MARK_TONES:
        tone, cell = RARE_MARK_TONES[mark], ""
        res["case"] = mark
        flags.append("WARN:rare-mark(tone-unverified)")
    else:
        tone, cell = MATRIX[(cls, case)]
        res["case"] = case
    res["syllable_type"] = "dead" if case and case.startswith("dead") else "live"
    res["tone"] = tone
    res["chao"] = CHAO[tone]
    res["cell"] = str(cell)
    return res


def derivation_text(r):
    """class/type/length/mark→cell, the format documented in SCHEMA.md."""
    return f"{r['class']}/{r.get('syllable_type', '')}/{r['vowel_length']}/{r['tone_mark']}→{r['cell']}"


def chao_to_tone(chunk):
    letters = "".join(c for c in chunk if c in "˥˦˧˨˩")
    if not letters:
        return None
    for name, val in CHAO.items():
        if letters == val:
            return name
    alias = {"˩": "low-rising", "˦˥": "high-rising", "˥˧": "high-falling", "˨˩": "low-falling", "˧˧": "mid"}
    return alias.get(letters, "?" + letters)


def split_ipa(ipa):
    for sep in (".", "-"):
        ipa = ipa.replace(sep, " ")
    return [c for c in ipa.split() if c]


SELFTEST = [
    # (syllable, expected tone, matrix cell, source of the example)
    ("ຂາ", "low-rising", 1, "WP 5.3 / SEAsite"),
    ("ກາ", "low-rising", 2, "WP 5.3 / SEAsite"),
    ("ຄາ", "high-rising", 3, "WP 5.3"),
    ("ມາ", "high-rising", 3, "SEAsite"),
    ("ຂ່າ", "mid", 4, "WP 5.3"),
    ("ບໍ່", "mid", 5, "SEAsite"),
    ("ຄ່າ", "mid", 6, "WP 5.3"),
    ("ຂ້າ", "low-falling", 7, "WP 5.3"),
    ("ເຈົ້າ", "high-falling", 8, "SEAsite"),
    ("ຄ້າ", "high-falling", 9, "WP 5.3"),
    ("ຫາກ", "low-falling", 10, "WP 5.3 / SEAsite"),
    ("ປາກ", "low-falling", 11, "SEAsite"),
    ("ຮາກ", "high-falling", 12, "WP 5.3"),
    ("ຫັກ", "high-rising", 13, "WP 5.3"),
    ("ຫົກ", "high-rising", 13, "SEAsite"),
    ("ຈະ", "high-rising", 14, "SEAsite (short open)"),
    ("ພັກ", "mid", 15, "SEAsite"),
    ("ເຮັດ", "mid", 15, "SEAsite"),
    ("ໄປ", "low-rising", 2, "SEAsite"),
    ("ເຮືອນ", "high-rising", 3, "SEAsite"),
    ("ຂ້ອຍ", "low-falling", 7, "SEAsite"),
    ("ແມ່ນ", "mid", 6, "SEAsite"),
    ("ແລ້ວ", "high-falling", 9, "SEAsite"),
    ("ພວກ", "high-falling", 12, "SEAsite (◌ວ◌ closed ua)"),
]


# Parser checks (rev 4): (syllable, expected initial, expected vowel length, expected tone).
# Orthography per _shelf/research/lao-script-wikipedia-unicode.md (◌ົວ / ◌ວ◌ vowels, kw clusters).
PARSE_TESTS = [
    ("ຕົວ", "ຕ", "long", "low-rising"),
    ("ຫົວ", "ຫ", "long", "low-rising"),
    ("ງົວ", "ງ", "long", "high-rising"),
    ("ຂວາ", "ຂວ", "long", "low-rising"),
    ("ກວ່າ", "ກວ", "long", "mid"),
    ("ຄວາມ", "ຄວ", "long", "high-rising"),
    ("ແຂວງ", "ຂວ", "long", "low-rising"),
    ("ຫວ່າງ", "ຫວ", "long", "mid"),
    ("ຫ່ວງ", "ຫ", "long", "mid"),
    ("ສວນ", "ສ", "long", "low-rising"),
    ("ຂວດ", "ຂ", "long", "low-falling"),
    ("ຊ່ວຍ", "ຊ", "long", "mid"),
    ("ແກ້ວ", "ກ", "long", "high-falling"),
    ("ເງິນ", "ງ", "short", "high-rising"),
    ("ໄຫວ້", "ຫວ", "special", "low-falling"),
    ("ໄຫວ", "ຫວ", "special", "low-rising"),
    ("ຄລີ", "ຄລ", "long", "high-rising"),
]


def run_selftest():
    fails = 0
    for syl, exp, cell, src in SELFTEST:
        r = analyse(syl)
        ok = r["tone"] == exp and r["cell"] == str(cell) and not any(f.startswith("WARN") for f in r["flags"])
        fails += not ok
        print(f"{'ok  ' if ok else 'FAIL'} {syl}\texpected {exp} (cell {cell}, {src})\tgot {r['tone']} (cell {r['cell']}) {';'.join(r['flags'])}")
    for syl, init, length, tone in PARSE_TESTS:
        r = analyse(syl)
        ok = (r["initial"], r["vowel_length"], r["tone"]) == (init, length, tone) and not any(
            f.startswith(("WARN", "ERROR")) for f in r["flags"])
        fails += not ok
        print(f"{'ok  ' if ok else 'FAIL'} {syl}\texpected {init}/{length}/{tone}\t"
              f"got {r['initial']}/{r['vowel_length']}/{r['tone']} {';'.join(r['flags'])}")
    total = len(SELFTEST) + len(PARSE_TESTS)
    print(f"{total - fails}/{total} passed")
    return 0 if fails == 0 else 1


def load_exceptions(path):
    """{(word_id, syl_index): tone} from a CSV with word_id,syl_index,tone[,source,note]."""
    if not path or not os.path.exists(path):
        return {}
    with open(path, encoding="utf-8-sig", newline="") as f:
        rows = list(csv.DictReader(f))
    exc = {}
    for row in rows:
        tone = (row.get("tone") or "").strip()
        if tone not in CHAO:
            sys.exit(f"{path}: unknown tone {tone!r} for {row.get('word_id')}; use one of {list(CHAO)}")
        exc[(row["word_id"].strip(), int(row["syl_index"]))] = tone
    return exc


OUT_FIELDS = ["word_id", "syl_index", "syllable", "initial", "class", "tone_mark", "final",
              "vowel_length", "syllable_type", "case", "cell", "tone", "chao",
              "expected_tone", "ipa_tone", "status", "flags"]


def check_rows(rows, args):
    out, problems = [], 0
    for row in rows:
        wid = row.get(args.id_col, "")
        sylls = [x for x in (row.get(args.syl_col) or "").split("|") if x.strip()]
        expected = [x.strip() for x in (row.get(args.tone_col) or "").split("|")] if row.get(args.tone_col) else []
        ipa_tones = [chao_to_tone(c) for c in split_ipa(row.get(args.ipa_col) or "")] if row.get(args.ipa_col) else []
        if not sylls:
            out.append({"word_id": wid, "status": "ERROR", "flags": "no-syllables"})
            problems += 1
            continue
        if expected and len(expected) != len(sylls):
            problems += 1
            out.append({"word_id": wid, "status": "ERROR", "flags": "tone-count!=syllable-count"})
        if ipa_tones and len(ipa_tones) != len(sylls):
            problems += 1
            out.append({"word_id": wid, "status": "ERROR", "flags": "ipa-syllable-count!=syllable-count"})
        for k, syl in enumerate(sylls):
            r = analyse(syl)
            exp = expected[k] if k < len(expected) else ""
            ipt = ipa_tones[k] if k < len(ipa_tones) else ""
            lexical = args.exc.get((wid, k + 1))
            status = "ok"
            if any(f.startswith("ERROR") for f in r["flags"]):
                status = "ERROR"
            elif lexical:
                # Listed exception: the recorded tone and IPA must agree with the listed tone.
                status = "MISMATCH" if (exp and exp != lexical) or (ipt and ipt != lexical) else "LEXICAL"
                r["flags"].append(f"lexical-exception(rule={r['tone']},listed={lexical})")
            elif (exp and exp != r["tone"]) or (ipt and ipt != r["tone"]):
                status = "MISMATCH"
            elif any(f.startswith("WARN") for f in r["flags"]):
                status = "WARN"
            if status in ("ERROR", "MISMATCH"):
                problems += 1
            out.append({"word_id": wid, "syl_index": k + 1, "syllable": syl, "initial": r["initial"],
                        "class": r["class"], "tone_mark": r["tone_mark"], "final": r["final"],
                        "vowel_length": r["vowel_length"], "syllable_type": r.get("syllable_type", ""),
                        "case": r["case"], "cell": r["cell"], "tone": r["tone"], "chao": r["chao"],
                        "expected_tone": exp, "ipa_tone": ipt or "", "status": status,
                        "flags": ";".join(r["flags"])})
    return out, problems


def fill_rows(rows, args):
    """Write derivations (always) and tones (only where empty) into the rows."""
    filled = 0
    for row in rows:
        sylls = [x for x in (row.get(args.syl_col) or "").split("|") if x.strip()]
        if not sylls:
            continue
        rs = [analyse(s) for s in sylls]
        if any(any(f.startswith("ERROR") for f in r["flags"]) for r in rs):
            continue
        wid = row.get(args.id_col, "")
        lex = [args.exc.get((wid, k + 1)) for k in range(len(rs))]
        row["tone_derivation"] = "|".join(
            derivation_text(r) + ("!lexical" if lx else "") for r, lx in zip(rs, lex))
        if not (row.get(args.tone_col) or "").strip():
            row[args.tone_col] = "|".join(lx or r["tone"] for r, lx in zip(rs, lex))
            filled += 1
    return filled


def safe_out_path(path):
    full = os.path.abspath(path)
    root = os.path.abspath(os.getcwd())
    if os.path.commonpath([full, root]) != root:
        sys.exit(f"refusing to write outside the project folder: {path}")
    return full


def main():
    if hasattr(sys.stdout, "reconfigure"):
        sys.stdout.reconfigure(encoding="utf-8")
    p = argparse.ArgumentParser(description=__doc__, formatter_class=argparse.RawDescriptionHelpFormatter)
    p.add_argument("csv", nargs="?")
    p.add_argument("--selftest", action="store_true")
    p.add_argument("--syl", help="pipe-separated syllables to analyse ad hoc")
    p.add_argument("--out")
    p.add_argument("--fill", action="store_true", help="write tone_derivation / empty tone_by_syllable back into the CSV")
    p.add_argument("--id-col", default="word_id")
    p.add_argument("--syl-col", default="syllables")
    p.add_argument("--tone-col", default="tone_by_syllable")
    p.add_argument("--ipa-col", default="ipa")
    p.add_argument("--exceptions", default=os.path.join("data", "tone_exceptions.csv"),
                   help="CSV of lexical tone exceptions (word_id,syl_index,tone,source,note)")
    p.add_argument("--quiet", action="store_true", help="print only rows that are not ok")
    args = p.parse_args()

    if args.selftest:
        sys.exit(run_selftest())
    args.exc = load_exceptions(args.exceptions)
    cols = []
    if args.syl:
        rows = [{args.id_col: "adhoc", args.syl_col: args.syl}]
    elif args.csv:
        with open(args.csv, encoding="utf-8-sig", newline="") as f:
            reader = csv.DictReader(f)
            rows = list(reader)
            cols = list(reader.fieldnames or [])
        bad = [i for i, row in enumerate(rows, 2) if None in row]
        if bad:
            sys.exit(f"{args.csv}: rows with more fields than the header (unquoted comma?) at lines {bad[:10]}; nothing written")
    else:
        p.error("give a CSV path, --syl or --selftest")

    if args.fill:
        if not args.csv:
            p.error("--fill needs a CSV path")
        filled = fill_rows(rows, args)
        for c in (args.tone_col, "tone_derivation"):
            if c not in cols:
                cols.append(c)
        target = safe_out_path(args.csv)
        with open(target + ".tmp", "w", encoding="utf-8", newline="") as f:
            w = csv.DictWriter(f, fieldnames=cols, lineterminator="\n")
            w.writeheader()
            w.writerows(rows)
        os.replace(target + ".tmp", target)  # atomic: a failure never truncates the CSV
        print(f"filled tones for {filled} row(s); derivations written for all parsable rows", file=sys.stderr)

    out, problems = check_rows(rows, args)
    if args.out:
        with open(safe_out_path(args.out), "w", encoding="utf-8", newline="") as f:
            w = csv.DictWriter(f, fieldnames=OUT_FIELDS)
            w.writeheader()
            w.writerows(out)
    elif not args.fill:
        w = csv.DictWriter(sys.stdout, fieldnames=OUT_FIELDS)
        w.writeheader()
        w.writerows(r for r in out if not args.quiet or r.get("status") != "ok")
    counts = {}
    for r in out:
        counts[r.get("status", "")] = counts.get(r.get("status", ""), 0) + 1
    for r in out:
        if r.get("status") in ("ERROR", "MISMATCH"):
            print(f"{r.get('status')} {r.get('word_id')} {r.get('syllable', '')} derived={r.get('tone', '')} "
                  f"recorded={r.get('expected_tone', '')} ipa={r.get('ipa_tone', '')} {r.get('flags', '')}", file=sys.stderr)
    print(f"syllable rows: {len(out)}; status counts: {counts}; problems: {problems}", file=sys.stderr)
    sys.exit(1 if problems else 0)


if __name__ == "__main__":
    main()
