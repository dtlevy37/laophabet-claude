"""Rebuild the derived curriculum tables and report the reading-load progression.

Usage (standard library only, UTF-8):
  python scripts/build_order.py            # rebuild data/ in place, print report
  python scripts/build_order.py --check    # report only, write nothing
  python scripts/build_order.py --data data --max-new 3

Hand-maintained inputs:  words.csv (lao, syllables, intro_order, ...), sentences.csv
  (lao, lao_spaced, optional word_overrides "2=W0031;4=W0005"), templates.csv
  (requires_word_ids), letters.csv, vowels.csv.
Generated (overwritten):
  words.new_letter_ids / new_vowel_ids        letters.intro_word_id / vowels.intro_word_id
  sentences.target_word_id, ipa, respelling (only where empty; joined from the words)
  sentence_words.csv   learning_order.csv   word_units.csv
Each syllable is parsed into initial consonant (or ຫ-cluster / kw-cluster), vowel pattern
(matched against vowels.csv), final consonant and tone mark. learning_order interleaves:
new letters/vowels of a word -> the word -> templates whose required words are known ->
sentences whose words are all known. Exit code 1 if any word or sentence cannot be resolved.

Revision 3 (2026-10-10): kw cluster after a leading vowel (ແຂວງ) and ຫ + ◌ວ◌ (ຫ່ວງ) parse
correctly; same ວ rule as tone_derive rev 4. The cancellation mark ◌໌ is handled: the
silenced consonant is skipped and ◌໌ (letters.csv S3) counts as the symbol introduced.
Revision 4: ວ after ໄ/ໃ belongs to the initial (ໄຫວ້); loanword ລ/ຣ clusters before a vowel
sign (ຄລີນິກ) are parsed. Same rules as tone_derive rev 5.
Revision 5: also writes curriculum/vocab.csv (word_id, lao, pos, gloss_en, topic,
classifier_word_id, sentence_uses): a compact vocabulary for drafters, not app data.
Revision 6 (2026-11-10, PLAN S7c): also writes data/word_units.csv (word_id, syl_index,
position, unit_id, source, confidence, notes): every word of words.csv as role-units in spoken
order within each syllable (initial, cluster, vowel, final, tone mark, symbol), confidence
derived. Unit ids are those of lesson_tool.py (role_units below is shared with it): initial =
letter_id (C01), cluster = letter_id + "c", final = letter_id + "f" (C13f), vowel = vowel_id,
tone mark T1..T4, symbol S1/S3. A word whose spelling does not parse gets no rows (WARN).
"""
import argparse
import csv
import os
import sys

PH = "◌"
CONS = set("ກຂຄງຈຊຍດຕຖທນບປຜຝພຟມຢຣລວສຫອຮໜໝ")
LEAD = set("ເແໂໃໄ")
TONE = {"່": "T1", "້": "T2", "໊": "T3", "໋": "T4"}
SUB_L = "ຼ"
CANCEL = "໌"
REPEAT = "ໆ"
HO_SECOND = set("ງຍນມລວຣ")
KW_INITIAL = set("ກຂຄ")
VOWEL_SIGNS = set("ະັາຳິີຶືຸູົຽໍ")
PUNCT = set("?!.,;:()«»\"'…")
ALIASES = {"ຫນ": "ໜ", "ຫມ": "ໝ", "ຫລ": "ຫຼ"}
CHECKPOINTS = (30, 100, 300, 600)


def read(path):
    with open(path, encoding="utf-8-sig", newline="") as f:
        r = csv.DictReader(f)
        rows = list(r)
        bad = [i for i, row in enumerate(rows, 2) if None in row]
        if bad:
            sys.exit(f"{path}: rows with more fields than the header (unquoted comma?) at lines {bad[:10]}; nothing written")
        return rows, list(r.fieldnames or [])


def write(path, cols, rows):
    """Write to a temporary file, then replace, so a failure never truncates the data."""
    tmp = path + ".tmp"
    with open(tmp, "w", encoding="utf-8", newline="") as f:
        w = csv.DictWriter(f, fieldnames=cols, extrasaction="ignore", lineterminator="\n")
        w.writeheader()
        for r in rows:
            w.writerow({c: r.get(c, "") for c in cols})
    os.replace(tmp, path)


def ensure_col(cols, name, after=None):
    if name not in cols:
        if after and after in cols:
            cols.insert(cols.index(after) + 1, name)
        else:
            cols.append(name)


def parse_syllable(syl, letter_id, vowel_id, vowel_form, problems, ctx):
    """Return ordered list of (kind, id) symbols used by one written syllable."""
    items = []
    s = syl.strip()
    has_repeat = REPEAT in s
    s = s.replace(REPEAT, "")
    has_cancel = CANCEL in s
    if has_cancel:
        # Drop the silenced consonant (plus any sign between it and ◌໌), as tone_derive does;
        # the mark itself is taught as symbol ◌໌ (e.g. ເວັບໄຊຕ໌).
        idx = s.index(CANCEL)
        k = idx - 1
        while k >= 0 and s[k] not in CONS:
            k -= 1
        s = s[:k] + s[idx + 1:] if k >= 0 else s.replace(CANCEL, "")
    marks = [TONE[c] for c in s if c in TONE]
    s = "".join(c for c in s if c not in TONE)
    i, lead = 0, ""
    while i < len(s) and s[i] in LEAD:
        lead += s[i]
        i += 1
    if i >= len(s) or s[i] not in CONS:
        problems.append(f"{ctx}: no initial consonant in '{syl}'")
        return items
    c0, j = s[i], i + 1
    initial, extra_w, extra_l = c0, False, ""
    # ວ after the initial is a cluster letter only when a vowel sign follows it (ຂວາ, ຫວ່າງ) or a
    # leading vowel carries the vowel (ແຂວງ); before a bare final it is the vowel ◌ວ◌ (ສວນ, ຫ່ວງ).
    w_next = j < len(s) and s[j] == "ວ" and (
        (j + 1 < len(s) and (s[j + 1] in VOWEL_SIGNS or (bool(lead) and s[j + 1] in CONS)))
        or (j + 1 == len(s) and lead in ("ໄ", "ໃ")))  # ໄຫວ້: ໄ/ໃ take no final
    loan_l = j + 1 < len(s) and s[j] in ("ລ", "ຣ") and s[j + 1] in VOWEL_SIGNS and c0 != "ຫ"
    if c0 == "ຫ" and j < len(s) and s[j] == SUB_L:
        initial, j = "ຫຼ", j + 1
    elif c0 == "ຫ" and j < len(s) and s[j] in HO_SECOND and (s[j] != "ວ" or w_next):
        initial, j = ALIASES.get(c0 + s[j], c0 + s[j]), j + 1
    elif c0 in KW_INITIAL and w_next:
        extra_w, j = True, j + 1
    elif loan_l:  # loanword cluster such as ຄລີນິກ
        extra_l, j = s[j], j + 1
    if initial not in letter_id:
        problems.append(f"{ctx}: initial '{initial}' not in letters.csv ('{syl}')")
    else:
        items.append(("letter", letter_id[initial]))
    if extra_w:
        items.append(("letter", letter_id["ວ"]))
    if extra_l:
        items.append(("letter", letter_id[extra_l]))
    rest = s[j:]
    open_sk = lead + PH + rest
    vid, final = None, None
    if rest and rest[-1] in CONS and open_sk in vowel_id:
        vid = vowel_id[open_sk]  # vowel pattern that itself ends in a consonant letter (◌ົວ, ເ◌ຍ, ເ◌ືອ...)
    elif rest and rest[-1] in CONS:
        closed = lead + PH + rest[:-1] + PH
        if closed in vowel_id:
            vid = vowel_id[closed]
        elif closed[:-1] in vowel_id and vowel_form[closed[:-1]] == "both":
            vid = vowel_id[closed[:-1]]
        final = rest[-1] if vid else None
    elif open_sk in vowel_id and vowel_form[open_sk] in ("open", "both", "special"):
        vid = vowel_id[open_sk]
    if vid is None:
        problems.append(f"{ctx}: vowel pattern not recognised in '{syl}' (skeleton {open_sk})")
    else:
        items.append(("vowel", vid))
    if final:
        items.append(("letter", letter_id[final]))
    for m in marks:
        items.append(("letter", m))
    if has_cancel:
        items.append(("letter", letter_id.get(PH + CANCEL, "S3")))
    if has_repeat:
        items.append(("letter", letter_id.get(REPEAT, "S1")))
    return items


def role_units(items):
    """Role-unit ids of one parsed syllable (parse_syllable output), in the same order.

    Letters before the vowel are the initial (first) and a cluster letter (second, + "c"); letters after
    it are the final (+ "f"); tone marks (T*) and symbols (S*) keep their id. Shared with lesson_tool.py.
    """
    out, seen_vowel, n_before = [], False, 0
    for kind, uid in items:
        if kind == "vowel":
            seen_vowel = True
            out.append(uid)
        elif uid.startswith(("T", "S")):
            out.append(uid)
        elif not seen_vowel:
            out.append(uid if n_before == 0 else uid + "c")
            n_before += 1
        else:
            out.append(uid + "f")
    return out


def word_unit_rows(words, letter_id, vowel_id, vowel_form):
    """data/word_units.csv rows for every word, and the ids of words skipped because a syllable did not parse."""
    rows, skipped = [], []
    for w in words:
        syls = [x for x in (w.get("syllables") or "").split("|") if x.strip()]
        probs, mine = [], []
        for k, syl in enumerate(syls, 1):
            units = role_units(parse_syllable(syl, letter_id, vowel_id, vowel_form, probs, f"{w['word_id']} syl {k}"))
            mine += [{"word_id": w["word_id"], "syl_index": k, "position": n, "unit_id": u,
                      "source": "SRC-AGENT:parse_syllable", "confidence": "derived", "notes": ""}
                     for n, u in enumerate(units, 1)]
        if probs or not syls:
            skipped.append(w["word_id"])
        else:
            rows += mine
    return rows, skipped


def main():
    if hasattr(sys.stdout, "reconfigure"):
        sys.stdout.reconfigure(encoding="utf-8")
    ap = argparse.ArgumentParser(description=__doc__, formatter_class=argparse.RawDescriptionHelpFormatter)
    ap.add_argument("--data", default="data")
    ap.add_argument("--check", action="store_true", help="report only; do not write files")
    ap.add_argument("--max-new", type=int, default=3, help="flag words introducing more than this many new symbols")
    ap.add_argument("--verbose", action="store_true", help="print the per-word table and every homograph choice")
    a = ap.parse_args()
    root = os.path.abspath(os.getcwd())
    d = os.path.abspath(a.data)
    if os.path.commonpath([d, root]) != root:
        sys.exit("data folder must be inside the project")
    p = lambda n: os.path.join(d, n + ".csv")

    letters, lcols = read(p("letters"))
    vowels, vcols = read(p("vowels"))
    words, wcols = read(p("words"))
    sentences, scols = read(p("sentences"))
    templates, tcols = read(p("templates")) if os.path.exists(p("templates")) else ([], [])
    problems, warnings = [], []

    letter_id = {r["lao"]: r["letter_id"] for r in letters}
    letter_lao = {r["letter_id"]: r["lao"] for r in letters}
    vowel_id = {r["lao_pattern"]: r["vowel_id"] for r in vowels}
    vowel_form = {r["lao_pattern"]: r["form"] for r in vowels}
    vowel_lao = {r["vowel_id"]: r["lao_pattern"] for r in vowels}
    sym_lao = lambda kind, i: letter_lao.get(i, i) if kind == "letter" else vowel_lao.get(i, i)

    ordered = sorted([w for w in words if (w.get("intro_order") or "").strip()], key=lambda w: int(w["intro_order"]))
    orders = [w["intro_order"] for w in ordered]
    if len(orders) != len(set(orders)):
        problems.append("duplicate intro_order values in words.csv")

    # Lao digits are introduced right after the number word whose spelling equals the digit's name_lao.
    digit_by_name = {r.get("name_lao", ""): r["letter_id"] for r in letters if r.get("kind") == "digit"}
    known, intro_of, new_items, post_items = set(), {}, {}, {}
    for w in ordered:
        seq = []
        syls = [x for x in (w.get("syllables") or "").split("|") if x.strip()]
        if "".join(syls) != w.get("lao", ""):
            problems.append(f"{w['word_id']}: syllables '{w.get('syllables')}' do not join to '{w.get('lao')}'")
        for k, syl in enumerate(syls, 1):
            seq += parse_syllable(syl, letter_id, vowel_id, vowel_form, problems, f"{w['word_id']} syl {k}")
        new = []
        for it in seq:
            if it not in known and it not in new:
                new.append(it)
        known.update(new)
        for it in new:
            intro_of[it] = w["word_id"]
        new_items[w["word_id"]] = new
        post = []
        dig = digit_by_name.get(w.get("lao", ""))
        if dig and ("letter", dig) not in known:
            post.append(("letter", dig))
            known.add(("letter", dig))
            intro_of[("letter", dig)] = w["word_id"]
        post_items[w["word_id"]] = post
        w["new_letter_ids"] = "|".join([i for k, i in new if k == "letter"] + [i for k, i in post])
        w["new_vowel_ids"] = "|".join(i for k, i in new if k == "vowel")
    for w in words:
        if w not in ordered:
            w["new_letter_ids"], w["new_vowel_ids"] = "", ""
    for r in letters:
        r["intro_word_id"] = intro_of.get(("letter", r["letter_id"]), "")
    for r in vowels:
        r["intro_word_id"] = intro_of.get(("vowel", r["vowel_id"]), "")

    # Sentences -> word ids
    by_lao = {}
    rank = {w["word_id"]: int(w["intro_order"]) for w in ordered}
    for w in words:
        by_lao.setdefault(w["lao"], []).append(w["word_id"])
    for k in by_lao:
        by_lao[k].sort(key=lambda i: rank.get(i, 10 ** 9))
    sent_ids, sw_rows, homograph_defaults = {}, [], {}
    word_by_id = {w["word_id"]: w for w in words}
    for s in sentences:
        sid = s["sentence_id"]
        spaced = "".join(c for c in s.get("lao_spaced", "") if c not in PUNCT)
        plain = "".join(c for c in s.get("lao", "") if c not in PUNCT)
        toks = spaced.split()
        if "".join(toks) != plain.replace(" ", ""):
            problems.append(f"{sid}: lao_spaced does not match lao")
        over = {}
        for part in (s.get("word_overrides") or "").split(";"):
            if "=" in part:
                pos, wid = part.split("=", 1)
                over[int(pos.strip())] = wid.strip()
        ids = []
        for n, t in enumerate(toks, 1):
            wid = over.get(n) or (by_lao.get(t) or [None])[0]
            if not wid:
                problems.append(f"{sid}: token '{t}' is not a word in words.csv")
                continue
            if len(by_lao.get(t, [])) > 1 and n not in over:
                homograph_defaults[t] = homograph_defaults.get(t, 0) + 1
                if a.verbose:
                    warnings.append(f"{sid}: '{t}' matches {by_lao[t]}; chose {wid} (add word_overrides to change)")
            ids.append(wid)
            sw_rows.append({"sentence_id": sid, "position": n, "word_id": wid,
                            "source": "SRC-AGENT:segmentation", "confidence": "derived", "notes": ""})
        sent_ids[sid] = ids
        if not (s.get("target_word_id") or "").strip() and ids:
            s["target_word_id"] = max(ids, key=lambda i: rank.get(i, -1))
        # Citation-form IPA / respelling joined from the words, only where empty.
        if ids and len(ids) == len(toks):
            end = "".join(c for c in s.get("lao", "")[-1:] if c in "?!.")
            if not (s.get("ipa") or "").strip():
                s["ipa"] = " ".join(word_by_id[i].get("ipa", "") for i in ids)
            if not (s.get("respelling") or "").strip():
                s["respelling"] = " ".join(word_by_id[i].get("respelling", "") for i in ids) + end

    # Learning order
    steps, known_words, done_s, done_t = [], set(), set(), set()
    tpl_sorted = sorted(templates, key=lambda r: int(r.get("intro_order") or 0))
    s_sorted = sorted(sentences, key=lambda r: r["sentence_id"])
    gloss = {w["word_id"]: w.get("gloss_en", "") for w in words}
    for w in ordered:
        wid = w["word_id"]
        for kind, i in new_items[wid]:
            steps.append((kind, i, f"{sym_lao(kind, i)}: new in {w['lao']}"))
        n_new = len(new_items[wid])
        steps.append(("word", wid, f"{w['lao']} {gloss[wid]} (word {w['intro_order']}; {n_new} new symbol{'s' if n_new != 1 else ''})"))
        for kind, i in post_items[wid]:
            steps.append((kind, i, f"{sym_lao(kind, i)}: Lao digit for {w['lao']}"))
        known_words.add(wid)
        for t in tpl_sorted:
            req = [x for x in (t.get("requires_word_ids") or "").split("|") if x]
            if t["template_id"] not in done_t and req and all(x in known_words for x in req):
                done_t.add(t["template_id"])
                steps.append(("template", t["template_id"], f"{t['lao_pattern']} {t['english_pattern']}"))
        for s in s_sorted:
            ids = sent_ids.get(s["sentence_id"], [])
            if s["sentence_id"] not in done_s and ids and all(x in known_words for x in ids):
                done_s.add(s["sentence_id"])
                steps.append(("sentence", s["sentence_id"], f"{s['lao']} {s.get('english', '')}"))
    for s in sentences:
        if s["sentence_id"] not in done_s:
            warnings.append(f"{s['sentence_id']} never placed (uses a word with no intro_order)")
    for t in templates:
        if t["template_id"] not in done_t:
            warnings.append(f"{t['template_id']} never placed (requires_word_ids missing or not introduced)")

    # Word units (S7c): every word, not only ordered ones; parse problems of ordered words are ERRORs above.
    wu_rows, wu_skipped = word_unit_rows(words, letter_id, vowel_id, vowel_form)
    if wu_skipped:
        warnings.append(f"{len(wu_skipped)} word(s) get no word_units rows (spelling does not parse): "
                        + " ".join(wu_skipped[:10]) + (" ..." if len(wu_skipped) > 10 else ""))

    # Report
    print("== Reading load per word ==" + ("" if a.verbose else " (only words with new symbols; --verbose for all)"))
    heavy = 0
    for w in ordered:
        new = new_items[w["word_id"]] + post_items[w["word_id"]]
        flag = ""
        if len(new_items[w["word_id"]]) > a.max_new and w is not ordered[0]:
            flag = "  <-- HEAVY"
            heavy += 1
        if a.verbose or new:
            print(f"{w['intro_order']:>4} {w['word_id']} {w['lao']:<12} new={len(new)} {' '.join(sym_lao(k, i) for k, i in new)}{flag}")
    if homograph_defaults:
        print("homographs resolved to the earliest word (add word_overrides where wrong):",
              ", ".join(f"{t}×{n}" for t, n in sorted(homograph_defaults.items())))
    req_l = [r for r in letters if r.get("coverage_required") == "yes"]
    req_v = [r for r in vowels if r.get("coverage_required") == "yes"]
    pos = {w["word_id"]: int(w["intro_order"]) for w in ordered}
    print("\n== Coverage at checkpoints (required=yes) ==")
    for cp in CHECKPOINTS:
        nl = sum(1 for r in req_l if r["intro_word_id"] and pos[r["intro_word_id"]] <= cp)
        nv = sum(1 for r in req_v if r["intro_word_id"] and pos[r["intro_word_id"]] <= cp)
        print(f"by word {cp:>3}: letters {nl}/{len(req_l)}  vowels {nv}/{len(req_v)}")
    print("not yet introduced (required=yes):",
          " ".join(r["lao"] for r in req_l if not r["intro_word_id"]), "|",
          " ".join(r["lao_pattern"] for r in req_v if not r["intro_word_id"]))
    print(f"\nwords ordered: {len(ordered)} | heavy words (> {a.max_new} new): {heavy} | sentences placed: {len(done_s)}/{len(sentences)} | steps: {len(steps)}")
    for x in warnings:
        print("WARN ", x)
    for x in problems:
        print("ERROR", x)

    if not a.check:
        ensure_col(wcols, "new_letter_ids")
        ensure_col(wcols, "new_vowel_ids", "new_letter_ids")
        write(p("words"), wcols, words)
        write(p("letters"), lcols, letters)
        write(p("vowels"), vcols, vowels)
        write(p("sentences"), scols, sentences)
        write(p("sentence_words"), ["sentence_id", "position", "word_id", "source", "confidence", "notes"], sw_rows)
        lo = [{"step": n, "item_type": k, "item_id": i, "why": why, "source": "SRC-AGENT:sequencing",
               "confidence": "derived", "notes": ""} for n, (k, i, why) in enumerate(steps, 1)]
        write(p("learning_order"), ["step", "item_type", "item_id", "why", "source", "confidence", "notes"], lo)
        write(p("word_units"), ["word_id", "syl_index", "position", "unit_id", "source", "confidence", "notes"], wu_rows)
        vcount = {}
        for r in sw_rows:
            vcount[r["word_id"]] = vcount.get(r["word_id"], 0) + 1
        vocab = [{"word_id": w["word_id"], "lao": w["lao"], "pos": w.get("pos", ""),
                  "gloss_en": w.get("gloss_en", ""), "topic": w.get("topic", ""),
                  "classifier_word_id": w.get("classifier_word_id", ""), "sentence_uses": vcount.get(w["word_id"], 0)}
                 for w in words]
        write(os.path.join(root, "curriculum", "vocab.csv"),
              ["word_id", "lao", "pos", "gloss_en", "topic", "classifier_word_id", "sentence_uses"], vocab)
        print(f"written: words, letters, vowels, sentences, sentence_words, learning_order, "
              f"word_units ({len(wu_rows)} rows), curriculum/vocab.csv")
    sys.exit(1 if problems else 0)


if __name__ == "__main__":
    main()
