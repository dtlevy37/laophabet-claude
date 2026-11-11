"""Check drafted batch files against data/ (and each other) before merge_words.py.

Usage (standard library only, UTF-8):
  python scripts/check_drafts.py [--data data]
      [--words F.csv ...] [--sentences F.csv ...] [--templates F.csv ...] [--fillers F.csv ...]
      [--min-uses 2] [--allow-homograph ສ້ອມ,ຮາກ]

Words: header equals data/words.csv; required fields; confidence/source; Lao-only lao and
  syllables; syllables join to lao; IPA syllable count; tone names; duplicate spellings against
  data/ and across drafts (homographs must be listed in --allow-homograph); duplicate IDs;
  classifier rules (SCHEMA "Classifiers"); classifier/component references resolve.
Sentences: header; required fields; lao_spaced matches lao; every token is a known word (data
  or draft); a token whose spelling has several words defaults to the first (as build_order
  does) and is summarised as a warning per spelling unless word_overrides "N=ID" picks one;
  overrides must point to a word with that spelling; template_id exists; repeated sentences (warning).
Coverage: every draft word is used in at least --min-uses distinct sentences (data + drafts),
  resolving tokens as build_order does (first word with that spelling, unless overridden).
Templates/fillers: header; filler word_id resolves (ID, or LAO:<spelling> matching one word).
All cells: no invisible characters (zero-width space/joiners, BOM, no-break space).
Prints PROBLEM (blocks merge) and WARN lines; exit code 1 if any PROBLEM. Writes nothing.
"""
import argparse
import csv
import os
import re
import sys

LAO_RE = re.compile(r"^[຀-໿\s|?!.,()«»\"'\-◌_…]*$")
PUNCT = set("?!.,;:()«»\"'…")
INVISIBLE = {"​": "ZWSP", "‌": "ZWNJ", "‍": "ZWJ", "﻿": "BOM", " ": "NBSP"}
CONFIDENCE = {"verified", "derived", "unverified"}
TONES = {"low-rising", "high-rising", "mid", "low-falling", "high-falling"}
CLASSIFIER_TYPES = {"specific", "self", "measure", "none"}
WORD_REQUIRED = ["word_id", "lao", "ipa", "respelling", "syllables", "pos", "gloss_en", "pron_tip", "confidence"]
SENT_REQUIRED = ["sentence_id", "lao", "lao_spaced", "english", "confidence"]

problems, warnings = [], []


def problem(msg):
    problems.append(msg)


def warn(msg):
    warnings.append(msg)


def read(path):
    with open(path, encoding="utf-8-sig", newline="") as f:
        r = csv.DictReader(f)
        rows = list(r)
        cols = list(r.fieldnames or [])
    for i, row in enumerate(rows, 2):
        if None in row:
            problem(f"{path} line {i}: more fields than the header (unquoted comma?)")
            row.pop(None)
    return rows, cols


def read_many(paths, data_cols, label):
    out = []
    for p in paths:
        rows, cols = read(p)
        if cols != data_cols:
            problem(f"{p}: header differs from data/{label}.csv")
        for i, r in enumerate(rows, 2):
            r["_where"] = f"{os.path.basename(p)}:{i}"
            for c, v in r.items():
                if c.startswith("_") or not isinstance(v, str):
                    continue
                bad = [name for ch, name in INVISIBLE.items() if ch in v]
                if bad:
                    problem(f"{r['_where']}: invisible character(s) {bad} in {c}")
        out.extend(rows)
    return out


def split_pipe(v):
    return [x.strip() for x in (v or "").split("|") if x.strip()]


def is_noun(r):
    return any(p.strip().startswith("noun") or p.strip() == "proper noun" for p in (r.get("pos") or "").split(";"))


def ipa_count(ipa):
    for sep in (".", "-"):
        ipa = ipa.replace(sep, " ")
    return len([c for c in ipa.split() if c])


def tokens(spaced):
    return ["".join(ch for ch in t if ch not in PUNCT) for t in spaced.split() if "".join(ch for ch in t if ch not in PUNCT)]


def main():
    if hasattr(sys.stdout, "reconfigure"):
        sys.stdout.reconfigure(encoding="utf-8")
    p = argparse.ArgumentParser(description=__doc__, formatter_class=argparse.RawDescriptionHelpFormatter)
    p.add_argument("--data", default="data")
    p.add_argument("--words", nargs="*", default=[])
    p.add_argument("--sentences", nargs="*", default=[])
    p.add_argument("--templates", nargs="*", default=[])
    p.add_argument("--fillers", nargs="*", default=[])
    p.add_argument("--min-uses", type=int, default=2)
    p.add_argument("--allow-homograph", default="")
    a = p.parse_args()
    homographs = {x.strip() for x in a.allow_homograph.split(",") if x.strip()}
    dp = lambda n: os.path.join(a.data, n + ".csv")

    dwords, wcols = read(dp("words"))
    dsent, scols = read(dp("sentences"))
    dtpl, tcols = read(dp("templates"))
    _, fcols = read(dp("template_fillers"))
    words = read_many(a.words, wcols, "words")
    sents = read_many(a.sentences, scols, "sentences")
    tpls = read_many(a.templates, tcols, "templates")
    fills = read_many(a.fillers, fcols, "template_fillers")

    # ---- words
    all_words = dwords + words
    by_id = {}
    for r in all_words:
        if r["word_id"] in by_id:
            problem(f"{r.get('_where', 'data/words.csv')}: duplicate word_id {r['word_id']}")
        by_id[r["word_id"]] = r
    by_spelling = {}
    for r in all_words:
        by_spelling.setdefault(r["lao"], []).append(r["word_id"])
    draft_ids = {r["word_id"] for r in words}
    for r in words:
        w, wid = r["_where"], r["word_id"]
        for c in WORD_REQUIRED:
            if not (r.get(c) or "").strip():
                problem(f"{w} {wid}: empty {c}")
        if r.get("confidence") and r["confidence"] not in CONFIDENCE:
            problem(f"{w} {wid}: confidence '{r['confidence']}'")
        if r.get("confidence") in ("verified", "derived") and not r.get("source"):
            problem(f"{w} {wid}: confidence {r['confidence']} without a source")
        for c in ("lao", "syllables"):
            if r.get(c) and not LAO_RE.match(r[c]):
                problem(f"{w} {wid}: non-Lao characters in {c}")
        syl = split_pipe(r.get("syllables"))
        if "".join(syl) != r.get("lao", ""):
            problem(f"{w} {wid}: syllables '{r.get('syllables')}' do not join to '{r.get('lao')}'")
        if r.get("ipa") and ipa_count(r["ipa"]) != len(syl):
            problem(f"{w} {wid}: IPA has {ipa_count(r['ipa'])} syllables, spelling has {len(syl)}")
        tones = split_pipe(r.get("tone_by_syllable"))
        if tones and (len(tones) != len(syl) or any(t not in TONES for t in tones)):
            problem(f"{w} {wid}: bad tone_by_syllable '{r.get('tone_by_syllable')}'")
        ids = by_spelling.get(r["lao"], [])
        if len(ids) > 1 and r["lao"] not in homographs:
            problem(f"{w} {wid}: spelling {r['lao']} also used by {[i for i in ids if i != wid]} "
                    f"(duplicate, or list it in --allow-homograph)")
        for c in split_pipe(r.get("component_word_ids")):
            if c not in by_id:
                problem(f"{w} {wid}: component {c} unknown")
        cw, ct, cc = (r.get("classifier_word_id") or "").strip(), (r.get("classifier_type") or "").strip(), \
            (r.get("classifier_confidence") or "").strip()
        if cw and cw not in by_id:
            problem(f"{w} {wid}: classifier_word_id {cw} unknown")
        if is_noun(r):
            if ct not in CLASSIFIER_TYPES:
                problem(f"{w} {wid}: noun needs classifier_type in {sorted(CLASSIFIER_TYPES)} (got '{ct}')")
            elif cc not in CONFIDENCE:
                problem(f"{w} {wid}: classifier_confidence '{cc}'")
            elif ct == "self" and cw not in ("", wid):
                problem(f"{w} {wid}: self classifier must point to itself (got {cw})")
            elif ct == "none" and cw:
                problem(f"{w} {wid}: classifier_type none but classifier_word_id {cw}")
            elif ct == "specific" and not cw:
                warn(f"{w} {wid}: specific classifier not yet a word")
        elif ct or cc:
            problem(f"{w} {wid}: classifier fields set on a non-noun (pos '{r.get('pos')}')")

    # ---- templates
    tpl_ids = {r["template_id"] for r in dtpl}
    for r in tpls:
        if r["template_id"] in tpl_ids:
            problem(f"{r['_where']}: template_id {r['template_id']} already exists")
        tpl_ids.add(r["template_id"])
    for r in fills:
        wid = (r.get("word_id") or "").strip()
        if r["template_id"] not in tpl_ids:
            problem(f"{r['_where']}: template {r['template_id']} unknown")
        if wid.startswith("LAO:"):
            if len(by_spelling.get(wid[4:], [])) != 1:
                problem(f"{r['_where']}: {wid} matches {len(by_spelling.get(wid[4:], []))} words")
        elif wid not in by_id:
            problem(f"{r['_where']}: filler word_id {wid} unknown")

    # ---- sentences
    seen_lao = {r["lao"] for r in dsent}
    uses, ambiguous = {}, {}
    for r in dsent:  # existing sentences count toward coverage of draft homographs too
        for k, t in enumerate(tokens(r.get("lao_spaced", "")), 1):
            hit = by_spelling.get(t, [None])[0]
            if hit:
                uses.setdefault(hit, set()).add(r["sentence_id"])
    for r in sents:
        w, sid = r["_where"], r.get("sentence_id", "")
        for c in SENT_REQUIRED:
            if not (r.get(c) or "").strip():
                problem(f"{w} {sid}: empty {c}")
        if r.get("confidence") and r["confidence"] not in CONFIDENCE:
            problem(f"{w} {sid}: confidence '{r['confidence']}'")
        plain = "".join(ch for ch in r.get("lao", "") if ch not in PUNCT and not ch.isspace())
        spaced = "".join(ch for ch in r.get("lao_spaced", "") if ch not in PUNCT and not ch.isspace())
        if plain != spaced:
            problem(f"{w} {sid}: lao_spaced does not match lao")
        if r["lao"] in seen_lao:
            warn(f"{w} {sid}: same sentence already exists ({r['lao']})")
        seen_lao.add(r["lao"])
        if r.get("template_id") and r["template_id"] not in tpl_ids:
            problem(f"{w} {sid}: template_id {r['template_id']} unknown")
        overrides = {}
        for ov in [x.strip() for x in (r.get("word_overrides") or "").split(";") if x.strip()]:
            pos_, _, oid = ov.partition("=")
            if not pos_.strip().isdigit():
                problem(f"{w} {sid}: bad word_overrides entry '{ov}'")
                continue
            overrides[int(pos_)] = oid.strip()
        toks = tokens(r.get("lao_spaced", ""))
        for k, t in enumerate(toks, 1):
            ids = by_spelling.get(t, [])
            if not ids:
                problem(f"{w} {sid}: token {k} '{t}' is not a known word")
                continue
            if k in overrides:
                oid = overrides[k]
                if oid not in ids:
                    problem(f"{w} {sid}: override {k}={oid} but token is '{t}' ({ids})")
                hit = oid
            else:
                if len(ids) > 1:
                    ambiguous.setdefault(t, []).append(sid or w)
                hit = ids[0]
            uses.setdefault(hit, set()).add(sid or w)
        for k in overrides:
            if k < 1 or k > len(toks):
                problem(f"{w} {sid}: override position {k} outside 1..{len(toks)}")

    for t, where in ambiguous.items():
        ids = by_spelling[t]
        warn(f"'{t}' has meanings {ids}; {len(where)} draft sentence(s) without word_overrides default to "
             f"{ids[0]} ({by_id[ids[0]].get('gloss_en', '')[:40]}), e.g. {where[:3]}")
    for wid in sorted(draft_ids):
        n = len(uses.get(wid, ()))
        if n < a.min_uses:
            problem(f"{by_id[wid]['_where']} {wid} {by_id[wid]['lao']}: used in {n} sentence(s), need {a.min_uses}")

    for m in problems:
        print("PROBLEM", m)
    for m in warnings:
        print("WARN   ", m)
    print(f"drafts: {len(words)} words, {len(sents)} sentences, {len(tpls)} templates, {len(fills)} fillers | "
          f"problems: {len(problems)} | warnings: {len(warnings)}", file=sys.stderr)
    sys.exit(1 if problems else 0)


if __name__ == "__main__":
    main()
