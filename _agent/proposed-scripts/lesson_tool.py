"""Plan, check and merge lessons one at a time (Phase 9; see _agent/LESSON_PLAN.md).

Usage (standard library only, UTF-8, run from the project root):
  python approved-scripts/lesson_tool.py status
  python approved-scripts/lesson_tool.py brief [--out _agent/lessons/next-brief.md] [--top 12]
  python approved-scripts/lesson_tool.py check [_agent/lessons/drafts/next]
  python approved-scripts/lesson_tool.py merge [_agent/lessons/drafts/next]
  python approved-scripts/lesson_tool.py lookup ລາວ W000059 ...      # known? introduced where? readable now?
  python approved-scripts/lesson_tool.py can-read "ເຈົ້າ ໄປ ໃສ"        # status of each word in a sentence
Budget options (check/merge): --max-units 2 --max-words 3 --max-weight 5.5 --min-recycle 3

Units are role-units, derived from build_order.parse_syllable:
  initial consonant = letter_id (C23), final consonant = letter_id + "f" (C24f),
  second letter of a cluster (ຂວາ, ຄລີ) = letter_id + "c", vowel pattern = vowel_id (V03),
  tone mark = T1/T2..., symbol = S1/S3.
Rule R01 (dead syllables) is required by any word with a dead syllable (words.tone_derivation).
Other rules (R02...) are free-form: introduced by a lesson, not enforced on words.

Data tables written by merge (all in data/):
  lessons.csv       lesson_id, lesson_order, title_en, kind, summary_en, source, confidence, notes
  lesson_items.csv  lesson_id, position, item_type, item_id, role, notes
  units.csv         unit_id, kind, role, base_id, lao, teach_en, intro_lesson_id, source, confidence, notes
  rules.csv         rule_id, name_en, teach_en, intro_lesson_id, source, confidence, notes
Draft folder (default _agent/lessons/drafts/next/):
  lesson.csv  one row: title_en, kind (letters|rule|words|sentences), summary_en, notes
  items.csv   position, item_type (unit|rule|word|sentence), item_id, role (new|recycle|example), notes
  units.csv   unit_id, teach_en, notes            (one row per new unit; required)
  rules.csv   rule_id, name_en, teach_en, notes   (one row per new rule; required)

status: counts so far. brief: state plus candidates for the next lesson (markdown, for the runner); its size
does not grow with the number of lessons (lists are capped by --top; the full state stays in data/).
lookup / can-read: answer single questions about the taught state without reading the tables.
check: validates the draft; exit 1 on any error. merge: check, validate data/ against the DB spec
(db_sql.load), append to data/, assign the next lesson_id (L + 4 digits), write the lesson migration
app/backend/supabase/migrations/<stamp>_lesson_<id>.sql (db_sql.lesson_migration, from the CSVs just
written; listed in _agent/PENDING_MIGRATIONS.md for the owner to apply) and move the draft folder to
_agent/lessons/merged/<lesson_id>/. Nothing here connects to the DB.
Words in a lesson must have a data/words.csv row (word_id); sentences must be in data/sentences.csv.
"""
import argparse
import csv
import os
import sys
import unicodedata

import db_sql
from build_order import parse_syllable

DEAD_RULE = "R01"
FIRST_WORD = "ກິນ"
FIRST_UNITS = {"C01", "V04", "C13f"}
ITEM_TYPES = {"unit", "rule", "word", "sentence"}
ROLES = {"new", "recycle", "example"}
KINDS = {"letters", "rule", "words", "sentences"}
CAT_WEIGHT = {"function": 3, "pronouns": 3, "questions": 3, "basics": 3, "verbs": 3, "greetings": 3,
              "describing": 2, "people": 2, "time": 2, "numbers": 2, "feelings": 2, "home": 2, "food": 2,
              "places": 2, "directions": 2, "requests": 2, "language": 2}
COLS = {
    "lessons": ["lesson_id", "lesson_order", "title_en", "kind", "summary_en", "source", "confidence", "notes"],
    "lesson_items": ["lesson_id", "position", "item_type", "item_id", "role", "notes"],
    "units": ["unit_id", "kind", "role", "base_id", "lao", "teach_en", "intro_lesson_id", "source", "confidence", "notes"],
    "rules": ["rule_id", "name_en", "teach_en", "intro_lesson_id", "source", "confidence", "notes"],
}
DRAFT_COLS = {
    "lesson.csv": ["title_en", "kind", "summary_en", "notes"],
    "items.csv": ["position", "item_type", "item_id", "role", "notes"],
    "units.csv": ["unit_id", "teach_en", "notes"],
    "rules.csv": ["rule_id", "name_en", "teach_en", "notes"],
}


def read(path, required=True):
    if not os.path.exists(path):
        if required:
            sys.exit(f"{path}: not found")
        return []
    with open(path, encoding="utf-8-sig", newline="") as f:
        rows = list(csv.DictReader(f))
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


def nfc(s):
    return unicodedata.normalize("NFC", s or "")


class World:
    """Everything loaded once: inventory, words, sentences, lessons so far."""

    def __init__(self, data, common_path):
        self.data = data
        letters = read(os.path.join(data, "letters.csv"))
        vowels = read(os.path.join(data, "vowels.csv"))
        self.letter_id = {r["lao"]: r["letter_id"] for r in letters}
        self.vowel_id = {r["lao_pattern"]: r["vowel_id"] for r in vowels}
        self.vowel_form = {r["lao_pattern"]: r["form"] for r in vowels}
        self.letter = {r["letter_id"]: r for r in letters}
        self.vowel = {r["vowel_id"]: r for r in vowels}
        self.words = {r["word_id"]: r for r in read(os.path.join(data, "words.csv"))}
        self.sentences = {r["sentence_id"]: r for r in read(os.path.join(data, "sentences.csv"))}
        self.sent_words = {}
        for r in read(os.path.join(data, "sentence_words.csv")):
            self.sent_words.setdefault(r["sentence_id"], []).append(r["word_id"])
        self.common = read(common_path, required=False)
        self.lessons = read(os.path.join(data, "lessons.csv"), required=False)
        self.items = read(os.path.join(data, "lesson_items.csv"), required=False)
        self.units = read(os.path.join(data, "units.csv"), required=False)
        self.rules = read(os.path.join(data, "rules.csv"), required=False)
        self.sig_cache = {}
        # known state
        self.known_units = {r["unit_id"] for r in self.units}
        self.known_rules = {r["rule_id"] for r in self.rules}
        order = {r["lesson_id"]: int(r["lesson_order"]) for r in self.lessons}
        self.known_words, self.used_sents, self.last_shown, self.times_shown = set(), set(), {}, {}
        for it in self.items:
            n = order.get(it["lesson_id"], 0)
            if it["item_type"] == "word":
                if it["role"] == "new":
                    self.known_words.add(it["item_id"])
                self.last_shown[it["item_id"]] = max(n, self.last_shown.get(it["item_id"], 0))
                self.times_shown[it["item_id"]] = self.times_shown.get(it["item_id"], 0) + 1
            elif it["item_type"] == "sentence":
                self.used_sents.add(it["item_id"])
        self.n_lessons = len(self.lessons)
        last = max(self.lessons, key=lambda r: int(r["lesson_order"]))["lesson_id"] if self.lessons else None
        self.prev_new = {(it["item_type"], it["item_id"]) for it in self.items
                         if it["lesson_id"] == last and it["role"] == "new" and it["item_type"] in ("unit", "rule")}

    # --- units -------------------------------------------------------------
    def syl_units(self, syl, probs, ctx):
        out, seen_vowel, n_before = [], False, 0
        for kind, uid in parse_syllable(syl, self.letter_id, self.vowel_id, self.vowel_form, probs, ctx):
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

    def word_sig(self, wid):
        """(frozenset of units and rules needed, problem or '')."""
        if wid in self.sig_cache:
            return self.sig_cache[wid]
        w = self.words.get(wid)
        if not w:
            res = (frozenset(), "not in words.csv")
        else:
            syls = [x for x in (w.get("syllables") or "").split("|") if x.strip()]
            probs, units = [], []
            for k, syl in enumerate(syls, 1):
                units += self.syl_units(syl, probs, f"{wid} syl {k}")
            if "/dead/" in (w.get("tone_derivation") or ""):
                units.append(DEAD_RULE)
            res = (frozenset(units), "; ".join(probs))
        self.sig_cache[wid] = res
        return res

    def unit_info(self, uid):
        """(kind, role, base_id, lao display) or None if not a valid unit id."""
        if uid in self.vowel:
            return ("vowel", "vowel", uid, self.vowel[uid]["lao_pattern"])
        base, role = uid, "initial"
        if uid.endswith("f"):
            base, role = uid[:-1], "final"
        elif uid.endswith("c"):
            base, role = uid[:-1], "cluster"
        r = self.letter.get(base)
        if not r:
            return None
        kind = r.get("kind", "")
        if kind == "tone-mark":
            return ("tone-mark", "mark", base, r["lao"]) if role == "initial" else None
        if kind == "other":
            return ("symbol", "mark", base, r["lao"]) if role == "initial" else None
        if kind.startswith("consonant"):
            lao = r["lao"] if role == "initial" else ("◌" + r["lao"] if role == "final" else "◌" + r["lao"] + " (cluster)")
            return ("consonant", role, base, lao)
        return None

    def weight(self, uid):
        if uid.startswith("R"):
            return 2.0
        info = self.unit_info(uid)
        if not info:
            return 1.0
        return {"vowel": 1.5, "tone-mark": 2.0}.get(info[0], 1.0)

    def show(self, uid):
        if uid.startswith("R"):
            name = next((r["name_en"] for r in self.rules if r["rule_id"] == uid), "dead syllables" if uid == DEAD_RULE else "")
            return f"{uid} ({name})"
        info = self.unit_info(uid)
        return f"{uid} {info[3]}" if info else uid

    def readable(self, wid, have):
        sig, prob = self.word_sig(wid)
        return not prob and bool(sig) and sig <= have

    def sent_readable(self, sid, words):
        ws = self.sent_words.get(sid)
        return bool(ws) and all(w in words for w in ws)


# --- common-word pool ------------------------------------------------------
def pool(world):
    """Common words with a usefulness weight. Returns list of dicts (one per spelling+meaning)."""
    out, seen = [], set()
    for c in world.common:
        wid = c.get("word_id", "")
        key = wid or nfc(c["lao"])
        if key in seen:
            continue
        seen.add(key)
        out.append({"cw_id": c["cw_id"], "lao": nfc(c["lao"]), "gloss": c.get("gloss_en", ""), "word_id": wid,
                    "cat": c.get("category", ""), "w": CAT_WEIGHT.get(c.get("category", ""), 1)})
    return out


def cw_sig(world, row):
    """Signature for a common word without a words.csv row: parse its spelling (dead rule not detected)."""
    if row["word_id"]:
        return world.word_sig(row["word_id"])
    syls = [x for x in (next((c["syllables"] for c in world.common if c["cw_id"] == row["cw_id"]), "")).split("|") if x]
    probs, units = [], []
    for k, s in enumerate(syls, 1):
        units += world.syl_units(s, probs, row["cw_id"])
    return frozenset(units), "; ".join(probs)


# --- brief -----------------------------------------------------------------
def brief(world, top):
    L = []
    have = world.known_units | world.known_rules
    nxt = world.n_lessons + 1
    L.append(f"# Brief for lesson {nxt} (L{nxt:04d})\n")
    L.append("Generated by lesson_tool.py brief. Rules: _agent/LESSON_PLAN.md. Draft formats at the end.\n")
    if world.n_lessons == 0:
        ids = [w for w, r in world.words.items() if nfc(r["lao"]) == FIRST_WORD]
        L.append("## Lesson 1 is fixed (user decision)\n")
        L.append(f"Teach {FIRST_WORD}: units {' '.join(sorted(FIRST_UNITS))} "
                 f"({', '.join(world.show(u) for u in sorted(FIRST_UNITS))}); word rows: "
                 + ", ".join(f"{w} '{world.words[w]['gloss_en']}'" for w in ids)
                 + ". If several rows share the spelling, teach only the meaning given first. No recycling yet.\n")
    # The brief stays about the same size however many lessons exist: the full state lives in data/
    # (lessons.csv, lesson_items.csv, units.csv, rules.csv); look things up with `lookup` / `can-read`.
    L.append("## State\n")
    L.append(f"- Lessons: {world.n_lessons} | units: {len(world.known_units)} | rules: {len(world.known_rules)} | "
             f"words: {len(world.known_words)} | sentences used: {len(world.used_sents)}")
    for r in sorted(world.lessons, key=lambda r: int(r["lesson_order"]))[-3:]:
        new = [f"{world.show(it['item_id']) if it['item_type'] in ('unit', 'rule') else world.words.get(it['item_id'], {}).get('lao', it['item_id'])}"
               for it in world.items if it["lesson_id"] == r["lesson_id"] and it["role"] == "new"]
        L.append(f"  - {r['lesson_id']}: {r['title_en']} ({r['kind']}); new: {', '.join(new)}")
    L.append(f"- Known units: " + (" ".join(world.show(u) for u in sorted(world.known_units)) or "none"))
    L.append(f"- Known rules: " + (" ".join(world.show(r) for r in sorted(world.known_rules)) or "none"))
    L.append(f"- New in the previous lesson: " + (" ".join(world.show(i) for _, i in sorted(world.prev_new)) or "none"))
    L.append("- Look-ups (do not read the data tables whole):\n"
             "  - `python approved-scripts/lesson_tool.py lookup <lao or word_id> ...`: known? which lesson? readable now? missing units\n"
             "  - `python approved-scripts/lesson_tool.py can-read \"<sentence with spaces between words>\"`: status of every word\n")

    # candidates: single units and pairs
    P = [(r, *cw_sig(world, r)) for r in pool(world)]
    P = [(r, s) for r, s, prob in P if not prob and s and not (r["word_id"] and r["word_id"] in world.known_words)]
    untaught = set()
    for _, s in P:
        untaught |= set(s - have)

    def gain(extra):
        h = have | extra
        return [r for r, s in P if s <= h and not s <= have]

    single = []
    for u in untaught:
        g = gain({u})
        if g:
            single.append((sum(r["w"] for r in g), u, g))
    single.sort(key=lambda x: (-x[0], x[1]))
    L.append(f"## Candidates: one new unit or rule (top {top} by usefulness of newly readable words)\n")
    L.append("Score = sum of category weights (function/pronoun/verb/question/basics 3; everyday nouns and describing 2; else 1). "
             "Words marked * have no words.csv row yet (draft one first, or choose another word).\n")
    for sc, u, g in single[:top]:
        g = sorted(g, key=lambda r: (-r["w"], r["lao"]))
        L.append(f"- **{world.show(u)}** (weight {world.weight(u)}), score {sc}: " +
                 ", ".join(f"{r['lao']} '{r['gloss']}'{'' if r['word_id'] else '*'}" for r in g[:10]) +
                 (f" … +{len(g) - 10}" if len(g) > 10 else ""))
    # pairs among the best single candidates plus units that need a partner
    base = [u for _, u, _ in single[:top]]
    partners = sorted(untaught, key=lambda u: -sum(1 for _, s in P if u in s))[:3 * top]
    pairs = {}
    for a in base:
        for b in partners:
            if a == b:
                continue
            k = tuple(sorted((a, b)))
            if k in pairs:
                continue
            g = gain(set(k))
            solo = {id(r) for r in gain({a})} | {id(r) for r in gain({b})}
            joint = [r for r in g if id(r) not in solo]
            if g:
                pairs[k] = (sum(r["w"] for r in g), g, joint)
    L.append(f"\n## Candidates: two new units (top {top})\n")
    for k, (sc, g, joint) in sorted(pairs.items(), key=lambda x: -x[1][0])[:top]:
        g = sorted(g, key=lambda r: (-r["w"], r["lao"]))
        L.append(f"- **{' + '.join(world.show(u) for u in k)}** (weight {sum(world.weight(u) for u in k)}), score {sc}"
                 f" ({len(joint)} need both): " +
                 ", ".join(f"{r['lao']} '{r['gloss']}'{'' if r['word_id'] else '*'}" for r in g[:10]) +
                 (f" … +{len(g) - 10}" if len(g) > 10 else ""))
    if not single:
        L.append("- No single unit unlocks a common word. Consider a rule lesson or a two-unit step.")

    # sentences
    rs = [s for s in world.sentences if s not in world.used_sents and world.sent_readable(s, world.known_words)]
    L.append(f"\n## Existing sentences readable with known words only ({len(rs)}; unused so far)\n")
    for s in rs[:top]:
        r = world.sentences[s]
        L.append(f"- {s} {r['lao_spaced']} = {r['english']} [{r['confidence']}]")
    L.append("\nSentences that become readable with this lesson's new words are accepted by check; "
             "find them with grep on data/sentence_words.csv.\n")

    # recycle
    L.append("## Recycle candidates (least recently shown first)\n")
    rec = sorted(world.known_words, key=lambda w: (world.last_shown.get(w, 0), world.times_shown.get(w, 0)))
    for w in rec[:top]:
        r = world.words.get(w, {})
        L.append(f"- {w} {r.get('lao', '')} '{r.get('gloss_en', '')}' (last shown L{world.last_shown.get(w, 0):04d}, "
                 f"shown {world.times_shown.get(w, 0)}x)")
    L.append("\n## Draft formats (folder _agent/lessons/drafts/next/)\n")
    for f, cols in DRAFT_COLS.items():
        L.append(f"- {f}: {','.join(cols)}")
    L.append(f"- Rule {DEAD_RULE} = dead syllables; any word with a dead syllable needs it. New rules: next free R## id.")
    return "\n".join(L) + "\n"


# --- check -----------------------------------------------------------------
def load_draft(path):
    d = {}
    for f, cols in DRAFT_COLS.items():
        rows = read(os.path.join(path, f), required=f in ("lesson.csv", "items.csv"))
        if rows:
            missing = [c for c in cols if c not in rows[0]]
            if missing:
                sys.exit(f"{f}: missing columns {missing}")
        d[f] = rows
    return d


def check(world, draft, a):
    err, warn = [], []
    first = world.n_lessons == 0
    les = draft["lesson.csv"]
    if len(les) != 1:
        err.append("lesson.csv must have exactly one row")
    elif not les[0]["title_en"].strip() or les[0]["kind"] not in KINDS:
        err.append(f"lesson.csv: title_en required; kind must be one of {sorted(KINDS)}")
    items = draft["items.csv"]
    teach_u = {r["unit_id"]: r for r in draft["units.csv"]}
    teach_r = {r["rule_id"]: r for r in draft["rules.csv"]}
    new_units, new_rules, new_words, recycle_words, sents, seen = set(), set(), [], [], [], set()
    for i, it in enumerate(items, 2):
        t, iid, role = it["item_type"], it["item_id"].strip(), it["role"]
        ctx = f"items.csv line {i} ({t} {iid})"
        if not (it["position"] or "").strip().isdigit():
            err.append(f"{ctx}: position must be a number")
            continue
        if t not in ITEM_TYPES or role not in ROLES:
            err.append(f"{ctx}: item_type must be {sorted(ITEM_TYPES)}, role {sorted(ROLES)}")
            continue
        if (t, iid, role) in seen:
            err.append(f"{ctx}: duplicate")
        seen.add((t, iid, role))
        if t == "unit":
            if not world.unit_info(iid):
                err.append(f"{ctx}: not a valid unit id")
            elif role == "new":
                if iid in world.known_units:
                    err.append(f"{ctx}: already introduced")
                new_units.add(iid)
            elif iid not in world.known_units:
                err.append(f"{ctx}: recycle/example of a unit not yet introduced")
        elif t == "rule":
            if role == "new":
                if iid in world.known_rules:
                    err.append(f"{ctx}: already introduced")
                new_rules.add(iid)
            elif iid not in world.known_rules:
                err.append(f"{ctx}: rule not yet introduced")
        elif t == "word":
            if iid not in world.words:
                err.append(f"{ctx}: no words.csv row (draft and merge the word first)")
                continue
            sig, prob = world.word_sig(iid)
            if prob:
                err.append(f"{ctx}: parse problem: {prob}")
            if role == "new":
                if iid in world.known_words:
                    err.append(f"{ctx}: already introduced")
                new_words.append(iid)
            elif iid not in world.known_words:
                err.append(f"{ctx}: recycle/example of a word not yet introduced")
            else:
                recycle_words.append(iid)
            if world.words[iid].get("confidence") == "unverified":
                warn.append(f"{ctx}: word is unverified")
        elif t == "sentence":
            if iid not in world.sentences:
                err.append(f"{ctx}: not in sentences.csv")
            else:
                sents.append((ctx, iid))
                if world.sentences[iid].get("confidence") == "unverified":
                    warn.append(f"{ctx}: sentence is unverified (needs native review)")
    for u in new_units:
        if not (teach_u.get(u) or {}).get("teach_en", "").strip():
            err.append(f"units.csv: teach_en required for new unit {u}")
    for u in teach_u:
        if u not in new_units:
            err.append(f"units.csv: {u} is not a new unit in items.csv")
    for r in new_rules:
        tr = teach_r.get(r) or {}
        if not tr.get("name_en", "").strip() or not tr.get("teach_en", "").strip():
            err.append(f"rules.csv: name_en and teach_en required for new rule {r}")
        if not (len(r) == 3 and r[0] == "R" and r[1:].isdigit()):
            err.append(f"rules.csv: rule id {r} must be R + 2 digits")
    have = world.known_units | world.known_rules | new_units | new_rules
    words_now = world.known_words | set(new_words)
    for w in new_words + recycle_words:
        sig, _ = world.word_sig(w)
        miss = sig - have
        if miss:
            err.append(f"word {w} {world.words[w]['lao']}: not readable yet, needs {' '.join(world.show(u) for u in sorted(miss))}")
    fresh = {u for u in new_units | new_rules} | {i for _, i in world.prev_new}
    if fresh:
        for w in new_words:
            if not (world.word_sig(w)[0] & fresh):
                err.append(f"word {w} {world.words[w]['lao']}: uses no unit or rule from this or the previous lesson")
    for ctx, s in sents:
        missing = [w for w in world.sent_words.get(s, []) if w not in words_now]
        if missing:
            err.append(f"{ctx}: words not yet taught: " + " ".join(f"{w} {world.words.get(w, {}).get('lao', '')}" for w in missing))
    # budget
    if first:
        lao_new = {nfc(world.words[w]["lao"]) for w in new_words}
        if new_units != FIRST_UNITS or lao_new != {FIRST_WORD}:
            err.append(f"lesson 1 is fixed: new units {sorted(FIRST_UNITS)} and the word {FIRST_WORD} only")
    else:
        if len(new_units) > a.max_units:
            err.append(f"{len(new_units)} new units (max {a.max_units})")
        lao_new = {nfc(world.words[w]["lao"]) for w in new_words}
        if len(lao_new) > a.max_words:
            err.append(f"{len(lao_new)} new word spellings (max {a.max_words})")
        if not new_words and not new_units and not new_rules:
            err.append("lesson introduces nothing new")
        wt = sum(world.weight(u) for u in new_units | new_rules) + len(lao_new)
        if wt > a.max_weight:
            err.append(f"new-item weight {wt} (max {a.max_weight})")
        need = min(a.min_recycle, len(world.known_words))
        if len(set(recycle_words)) < need:
            err.append(f"{len(set(recycle_words))} recycled words (need {need})")
    return err, warn, new_units, new_rules, new_words


def report(err, warn):
    for w in warn:
        print("warning:", w)
    for e in err:
        print("ERROR:", e)
    print(f"{len(err)} errors, {len(warn)} warnings")


def merge(world, draft, path, root, new_units, new_rules):
    data = world.data
    _, problems = db_sql.load(data)
    if problems:
        print("data/ does not match the DB spec (db_sql.py check); nothing merged:")
        for p in problems[:20]:
            print("  -", p)
        sys.exit(1)
    nxt = world.n_lessons + 1
    lid = f"L{nxt:04d}"
    les = draft["lesson.csv"][0]
    world.lessons.append({"lesson_id": lid, "lesson_order": str(nxt), "title_en": les["title_en"].strip(),
                          "kind": les["kind"], "summary_en": les.get("summary_en", "").strip(),
                          "source": "SRC-AGENT:lesson", "confidence": "unverified", "notes": les.get("notes", "")})
    for k, it in enumerate(sorted(draft["items.csv"], key=lambda r: int(r["position"] or 0)), 1):
        world.items.append({"lesson_id": lid, "position": str(k), "item_type": it["item_type"],
                            "item_id": it["item_id"].strip(), "role": it["role"], "notes": it.get("notes", "")})
    teach_u = {r["unit_id"]: r for r in draft["units.csv"]}
    for u in sorted(new_units):
        kind, role, base, lao = world.unit_info(u)
        world.units.append({"unit_id": u, "kind": kind, "role": role, "base_id": base, "lao": lao,
                            "teach_en": teach_u[u]["teach_en"].strip(), "intro_lesson_id": lid,
                            "source": "SRC-AGENT:lesson", "confidence": "unverified", "notes": teach_u[u].get("notes", "")})
    teach_r = {r["rule_id"]: r for r in draft["rules.csv"]}
    for r in sorted(new_rules):
        world.rules.append({"rule_id": r, "name_en": teach_r[r]["name_en"].strip(), "teach_en": teach_r[r]["teach_en"].strip(),
                            "intro_lesson_id": lid, "source": "SRC-AGENT:lesson", "confidence": "unverified",
                            "notes": teach_r[r].get("notes", "")})
    write(os.path.join(data, "lessons.csv"), COLS["lessons"], world.lessons)
    write(os.path.join(data, "lesson_items.csv"), COLS["lesson_items"], world.items)
    write(os.path.join(data, "units.csv"), COLS["units"], world.units)
    write(os.path.join(data, "rules.csv"), COLS["rules"], world.rules)
    mig = db_sql.lesson_migration(root, data, inside(db_sql.MIGRATIONS, root), lid)
    print(f"migration for owner review: {os.path.relpath(mig, root)}")
    dest = inside(os.path.join("_agent", "lessons", "merged", lid), root)
    os.makedirs(os.path.dirname(dest), exist_ok=True)
    os.replace(path, dest)
    print(f"merged {lid}: {les['title_en'].strip()} (draft moved to {os.path.relpath(dest, root)})")


def intro_lesson(world, wid):
    return next((it["lesson_id"] for it in world.items
                 if it["item_type"] == "word" and it["item_id"] == wid and it["role"] == "new"), "")


def word_status(world, wid, have):
    sig, prob = world.word_sig(wid)
    w = world.words[wid]
    head = f"{wid} {w['lao']} '{w['gloss_en']}'"
    if prob:
        return f"{head}: parse problem: {prob}"
    if wid in world.known_words:
        return f"{head}: known (introduced {intro_lesson(world, wid)})"
    miss = sig - have
    if not miss:
        return f"{head}: not taught yet, readable now"
    return f"{head}: not taught yet, needs {' '.join(world.show(u) for u in sorted(miss))}"


def lookup(world, terms):
    have = world.known_units | world.known_rules
    by_lao = {}
    for wid, w in world.words.items():
        by_lao.setdefault(nfc(w["lao"]), []).append(wid)
    for t in terms:
        t = nfc(t.strip())
        ids = [t] if t in world.words else by_lao.get(t, [])
        if not ids:
            cw = [c for c in world.common if nfc(c["lao"]) == t]
            print(f"{t}: no words.csv row" + (f" (common list {cw[0]['cw_id']} '{cw[0]['gloss_en']}')" if cw else ""))
        for wid in ids:
            print(word_status(world, wid, have))


def can_read(world, text):
    """Each space-separated token of a sentence: known / readable / needs units / unknown word."""
    have = world.known_units | world.known_rules
    by_lao = {}
    for wid, w in world.words.items():
        by_lao.setdefault(nfc(w["lao"]), []).append(wid)
    ok = True
    for tok in nfc(text).replace("?", " ").replace(".", " ").split():
        ids = by_lao.get(tok, [])
        if not ids:
            print(f"{tok}: not in words.csv (draft it, or split it into known words)")
            ok = False
            continue
        known = [w for w in ids if w in world.known_words]
        if known:
            print(f"{tok}: known ({', '.join(known)})")
        else:
            print(f"{tok}: " + "; ".join(word_status(world, w, have) for w in ids))
            ok = False
    print("readable with taught words only" if ok else "not yet readable with taught words only")


def main():
    if hasattr(sys.stdout, "reconfigure"):
        sys.stdout.reconfigure(encoding="utf-8")
    ap = argparse.ArgumentParser(description=__doc__, formatter_class=argparse.RawDescriptionHelpFormatter)
    ap.add_argument("mode", choices=["status", "brief", "check", "merge", "lookup", "can-read"])
    ap.add_argument("draft", nargs="*", help="check/merge: draft folder (default _agent/lessons/drafts/next); "
                    "lookup: lao spellings or word_ids; can-read: the sentence, words separated by spaces")
    ap.add_argument("--data", default="data")
    ap.add_argument("--common", default="_agent/letter_map/common_words.csv")
    ap.add_argument("--out", default="_agent/lessons/next-brief.md")
    ap.add_argument("--top", type=int, default=12)
    ap.add_argument("--max-units", type=int, default=2)
    ap.add_argument("--max-words", type=int, default=3)
    ap.add_argument("--max-weight", type=float, default=5.5)
    ap.add_argument("--min-recycle", type=int, default=3)
    a = ap.parse_args()
    root = os.path.abspath(os.getcwd())
    world = World(inside(a.data, root), inside(a.common, root))

    if a.mode == "status":
        print(f"lessons: {world.n_lessons} | units: {len(world.known_units)} | rules: {len(world.known_rules)} | "
              f"words: {len(world.known_words)} | sentences used: {len(world.used_sents)}")
        return
    if a.mode == "brief":
        out = inside(a.out, root)
        os.makedirs(os.path.dirname(out), exist_ok=True)
        with open(out, "w", encoding="utf-8", newline="\n") as f:
            f.write(brief(world, a.top))
        print(f"wrote {os.path.relpath(out, root)} (next lesson L{world.n_lessons + 1:04d})")
        return
    if a.mode == "lookup":
        lookup(world, a.draft)
        return
    if a.mode == "can-read":
        can_read(world, " ".join(a.draft))
        return
    path = inside(a.draft[0] if a.draft else "_agent/lessons/drafts/next", root)
    draft = load_draft(path)
    err, warn, nu, nr, nw = check(world, draft, a)
    report(err, warn)
    if err:
        sys.exit(1)
    if a.mode == "merge":
        merge(world, draft, path, root, nu, nr)


if __name__ == "__main__":
    main()
