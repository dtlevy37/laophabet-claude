"""Plan, check and merge lessons one at a time (Phase 9; see docs/LESSON_RULES.md).

Usage (standard library only, UTF-8, run from the project root):
  python scripts/lesson_tool.py status
  python scripts/lesson_tool.py brief [--out curriculum/lessons/next-brief.md] [--top 12]
  python scripts/lesson_tool.py check [curriculum/lessons/drafts/next]
  python scripts/lesson_tool.py check --merged                # option rule etc. over every merged lesson
  python scripts/lesson_tool.py merge [curriculum/lessons/drafts/next]
  python scripts/lesson_tool.py lookup ລາວ W000059 ...      # core / bonus? introduced where? readable now?
  python scripts/lesson_tool.py can-read "ເຈົ້າ ໄປ ໃສ"        # status of each word in a sentence
Budget options (check/merge): --max-units 2 --max-words 3 --max-weight 5.5 --min-recycle 3
  The budget is a guideline (LESSON_RULES decision 26): going over it (or under min-recycle) is a WARNING and
  does not block merge. The flags move the warning thresholds.

Units are role-units, derived from build_order.parse_syllable (build_order.role_units):
  initial consonant = letter_id (C23), final consonant = letter_id + "f" (C24f),
  second letter of a cluster (ຂວາ, ຄລີ) = letter_id + "c", vowel pattern = vowel_id (V03),
  tone mark = T1/T2..., symbol = S1/S3.
Same-sound letters (ງ ນ ມ: ipa_initial = ipa_final and no "(final ...)" in the respelling) are taught at the
start and the end together: their initial and final units are new in the same lesson and count as one unit
(budget and weight). The app shows the pair as one card.
Rule R01 (dead syllables) is required by any word with a dead syllable (words.tone_derivation).
Other rules (R02...) are free-form: introduced by a lesson, not enforced on words.

Item roles: new | recycle | example | bonus.
  bonus (LESSON_RULES decision 21; PLAN S7f): words only. A bonus word must be readable; it is exempt from
  "every new word uses a unit or rule from this or the previous lesson"; it may not appear in any sentence of
  its lesson or of a later lesson until a lesson lists it with role `new` (it is then core; that lesson is
  also exempt from the "uses something new" rule for it). A bonus word can be recycled like a core word.
  Core words = words ever listed as `new`.

Activity data (PLAN S7c; DESIGN "Fill in the blank: one logical choice"): check needs
data/categories.csv; every new or bonus word needs a data/word_categories.csv row and every sentence of the
lesson a data/sentence_slots.csv row. check runs the option rule for each slot against the lesson's pool
(get_lesson: words listed new or bonus in lessons up to max(lesson order, 5), this draft included) and prints
the options, so a second valid answer can be spotted. Option rule: a pool word is a safe distractor when it
has a word_categories row; the union of categories over every word with its spelling contains no `function`
and nothing in the slot's accepts; it is not in exclude_word_ids; its Lao differs from the answer and from
the other options. Verb safety: a union with `action` but no verb class (a category that some word lists
together with `action`) counts as having every verb class. Same rule as get_lesson's `cats`.
Untaught options (PLAN S7h): when a slot has fewer than 3 safe pool words, check tops the options up with the
real words the lesson has not taught (get_lesson's distractors.untaught: every other word with a
word_categories row), under the same option rule, as fill_blank.js does; the app picks among them at random, so
check lists every one that qualifies. `function` words are never options (pool or untaught) but may be blanked: a particle's slot lists `function` in accepts, plus every category that could sit there.

Data tables written by merge (all in data/):
  lessons.csv       lesson_id, lesson_order, title_en, kind, summary_en, source, confidence, notes
  lesson_items.csv  lesson_id, position, item_type, item_id, role, notes
  units.csv         unit_id, kind, role, base_id, lao, teach_en, intro_lesson_id, source, confidence, notes
  rules.csv         rule_id, name_en, teach_en, intro_lesson_id, source, confidence, notes
Draft folder (default curriculum/lessons/drafts/next/):
  lesson.csv  one row: title_en, kind (letters|rule|words|sentences), summary_en, notes
  items.csv   position, item_type (unit|rule|word|sentence), item_id, role (new|recycle|example|bonus), notes
  units.csv   unit_id, teach_en, notes            (one row per new unit; required)
  rules.csv   rule_id, name_en, teach_en, notes   (one row per new rule; required)
Hand-tagged before check (data/, real ids; run pipeline.sh after editing):
  word_categories.csv  word_id, categories (pipe list), source, confidence, notes
  sentence_slots.csv   sentence_id, position, accepts (pipe list), exclude_word_ids (pipe list), source,
                       confidence, notes

status: counts so far. brief: state plus candidates for the next lesson (markdown, for the runner); its size
does not grow with the number of lessons (lists are capped by --top; the full state stays in data/).
lookup / can-read: answer single questions about the taught state without reading the tables.
check: validates the draft; exit 1 on any error. check --merged: the activity-data checks (option rule,
categories, slots) and the bonus-in-sentence rule over every merged lesson; exit 1 on any error.
merge: check, validate data/ against the DB spec (db_sql.load), append to data/, assign the next lesson_id
(L + 4 digits), write the lesson migration app/backend/supabase/migrations/<stamp>_lesson_<id>.sql
(db_sql.lesson_migration, from the CSVs just written; it carries the lesson's word_units, word_categories and
sentence_slots rows) and move the draft folder
to curriculum/lessons/merged/<lesson_id>/. Nothing here connects to the DB.
Words in a lesson must have a data/words.csv row (word_id); sentences must be in data/sentences.csv.

Revision 2 (2026-11-10, PLAN S7c + S7f): role bonus; budget as warnings; activity-data checks and the
blank-option listing; check --merged; brief lists bonus candidates and earlier bonus words.
"""
import argparse
import csv
import os
import sys
import unicodedata

import db_sql
from build_order import parse_syllable, role_units

DEAD_RULE = "R01"
FIRST_WORD = "ກິນ"
FIRST_UNITS = {"C01", "V04", "C13", "C13f"}
ITEM_TYPES = {"unit", "rule", "word", "sentence"}
ROLES = {"new", "recycle", "example", "bonus"}
POOL_ROLES = ("new", "bonus")    # words that enter the distractor pool (get_lesson)
POOL_THROUGH = 5                 # lessons 1-5 share one pool (get_lesson: greatest(lesson_order, 5))
MAX_BONUS = 2                    # decision 21: one or two per lesson (warning above)
FUNCTION, ACTION = "function", "action"
# twin_key: drop tone marks (U+0EC8-0ECB); fold ◌ີ ◌ື ◌ູ to ◌ິ ◌ຶ ◌ຸ
TWIN_FOLD = {0x0EC8: None, 0x0EC9: None, 0x0ECA: None, 0x0ECB: None, 0x0EB5: 0x0EB4, 0x0EB7: 0x0EB6, 0x0EB9: 0x0EB8}
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


def split(v):
    return [x.strip() for x in (v or "").split("|") if x.strip()]


class World:
    """Everything loaded once: inventory, words, sentences, lessons so far, activity data."""

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
        for r in sorted(read(os.path.join(data, "sentence_words.csv")), key=lambda r: int(r["position"] or 0)):
            self.sent_words.setdefault(r["sentence_id"], []).append(r["word_id"])
        self.common = read(common_path, required=False)
        self.lessons = read(os.path.join(data, "lessons.csv"), required=False)
        self.items = read(os.path.join(data, "lesson_items.csv"), required=False)
        self.units = read(os.path.join(data, "units.csv"), required=False)
        self.rules = read(os.path.join(data, "rules.csv"), required=False)
        self.sig_cache = {}
        self.by_lao = {}
        for wid, w in self.words.items():
            self.by_lao.setdefault(nfc(w["lao"]), []).append(wid)
        # known state
        self.known_units = {r["unit_id"] for r in self.units}
        self.known_rules = {r["rule_id"] for r in self.rules}
        self.order = {r["lesson_id"]: int(r["lesson_order"]) for r in self.lessons}
        self.known_words, self.used_sents, self.last_shown, self.times_shown = set(), set(), {}, {}
        self.bonus_lesson = {}   # word_id -> first lesson that listed it as bonus
        for it in sorted(self.items, key=lambda it: self.order.get(it["lesson_id"], 0)):
            n = self.order.get(it["lesson_id"], 0)
            if it["item_type"] == "word":
                if it["role"] == "new":
                    self.known_words.add(it["item_id"])
                elif it["role"] == "bonus":
                    self.bonus_lesson.setdefault(it["item_id"], it["lesson_id"])
                self.last_shown[it["item_id"]] = max(n, self.last_shown.get(it["item_id"], 0))
                self.times_shown[it["item_id"]] = self.times_shown.get(it["item_id"], 0) + 1
            elif it["item_type"] == "sentence":
                self.used_sents.add(it["item_id"])
        # bonus words that no lesson has made core yet
        self.bonus_words = set(self.bonus_lesson) - self.known_words
        self.n_lessons = len(self.lessons)
        last = max(self.lessons, key=lambda r: int(r["lesson_order"]))["lesson_id"] if self.lessons else None
        self.prev_new = {(it["item_type"], it["item_id"]) for it in self.items
                         if it["lesson_id"] == last and it["role"] == "new" and it["item_type"] in ("unit", "rule")}
        # activity data (S7c); optional files
        cat_path = os.path.join(data, "categories.csv")
        self.categories = ({(r.get("category") or "").strip() for r in read(cat_path)} - {""}
                           if os.path.exists(cat_path) else None)
        self.word_cats = {r["word_id"]: set(split(r.get("categories")))
                          for r in read(os.path.join(data, "word_categories.csv"), required=False)}
        self.slots = {}
        for r in read(os.path.join(data, "sentence_slots.csv"), required=False):
            self.slots.setdefault(r["sentence_id"], []).append(r)
        for rows in self.slots.values():
            rows.sort(key=lambda r: int(r["position"]) if (r.get("position") or "").strip().isdigit() else 0)
        self.verb_classes = set()
        for cs in self.word_cats.values():
            if ACTION in cs:
                self.verb_classes |= cs
        self.verb_classes -= {ACTION, FUNCTION}

    # --- units -------------------------------------------------------------
    def syl_units(self, syl, probs, ctx):
        return role_units(parse_syllable(syl, self.letter_id, self.vowel_id, self.vowel_form, probs, ctx))

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

    def same_sound(self, base):
        """True for a consonant that sounds the same at the start and the end of a syllable (ງ ນ ມ)."""
        r = self.letter.get(base) or {}
        return (r.get("kind", "").startswith("consonant") and bool(r.get("ipa_final"))
                and r.get("ipa_initial") == r.get("ipa_final") and "(final" not in (r.get("respelling") or ""))

    def partner(self, uid):
        """The other unit of a same-sound pair (C13 <-> C13f), or None."""
        info = self.unit_info(uid)
        if not info or info[0] != "consonant" or info[1] not in ("initial", "final") or not self.same_sound(info[2]):
            return None
        return info[2] + "f" if info[1] == "initial" else info[2]

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

    def lao(self, wid):
        return self.words.get(wid, {}).get("lao", "?")

    # --- activity data (S7c) -------------------------------------------------
    def cats(self, wid):
        """Categories for the option rule: None when the word has no row; else the union over every word with the
        same spelling, plus every verb class when the union has `action` but no verb class (verb safety rule)."""
        if wid not in self.word_cats:
            return None
        u = set()
        for w in self.by_lao.get(nfc(self.lao(wid)), [wid]):
            u |= self.word_cats.get(w, set())
        if ACTION in u and not (u & self.verb_classes):
            u |= self.verb_classes
        return u

    def pool_words(self, lesson_order, extra=()):
        """Distractor pool of a lesson (get_lesson): words listed new or bonus in lessons up to
        max(lesson_order, 5), in lesson order, plus `extra` (a draft's own new and bonus words)."""
        through = max(lesson_order, POOL_THROUGH)
        out, seen = [], set()
        rows = sorted((it for it in self.items if it["item_type"] == "word" and it["role"] in POOL_ROLES
                       and self.order.get(it["lesson_id"], 0) <= through),
                      key=lambda it: (self.order.get(it["lesson_id"], 0), it["item_id"]))
        for wid in [it["item_id"] for it in rows] + list(extra):
            if wid not in seen and wid in self.words:
                seen.add(wid)
                out.append(wid)
        return out

    def first_pos(self, wid):
        return (self.words.get(wid, {}).get("pos") or "").split(";")[0].strip()

    def untaught(self, pool):
        """Untaught options (get_lesson distractors.untaught, S7h): every word with its own word_categories row
        that is not in the pool and has no pool word's spelling, by word_id. No ranking: the app shuffles them."""
        spell = {nfc(self.lao(w)) for w in pool}
        return sorted(w for w in self.word_cats if w in self.words and w not in pool and nfc(self.lao(w)) not in spell)

    def twin_key(self, w):
        """Spelling with tone marks dropped and long upper/lower vowels folded to short (owner 2026-11-12): an
        untaught option may not differ from a word the learner sees only by such a mark (ເຂົ່າ knee vs ເຂົ້າ rice).
        Same as fill_blank.js twinKey."""
        return nfc(self.lao(w)).translate(TWIN_FOLD)

    def safe_option(self, w, acc, excl, seen_lao):
        c = self.cats(w)
        # same as fill_blank.js ok(): a word with no gloss is never offered
        return not (c is None or not c or not (self.words.get(w, {}).get("gloss_en") or "").strip() or FUNCTION in c or c & acc or w in excl or nfc(self.lao(w)) in seen_lao)

    def slot_options(self, sid, slot, pool, untaught=()):
        """(answer word id or None, safe pool distractors with the answer's part of speech first, untaught
        options that qualify (used only when the pool has fewer than 3), errors, warnings)."""
        errs, warns = [], []
        ws = self.sent_words.get(sid, [])
        p = (slot.get("position") or "").strip()
        if not p.isdigit() or not 1 <= int(p) <= len(ws):
            errs.append(f"{sid}: slot position {p!r} is not a word position of the sentence (1-{len(ws)})")
            return None, [], [], errs, warns
        pos = int(p)
        ans = ws[pos - 1]
        acc = set(split(slot.get("accepts")))
        excl = set(split(slot.get("exclude_word_ids")))
        ctx = f"{sid} slot {pos} ({self.lao(ans)})"
        if not acc:
            errs.append(f"{ctx}: accepts is empty")
        if self.categories is not None and acc - self.categories:
            errs.append(f"{ctx}: accepts {sorted(acc - self.categories)} not in categories.csv")
        own = self.word_cats.get(ans)
        if own is None:
            errs.append(f"{ctx}: answer word {ans} has no word_categories row")
        elif acc and not own & acc:
            errs.append(f"{ctx}: answer word {ans} ({'|'.join(sorted(own))}) fits none of accepts {'|'.join(sorted(acc))}")
        for x in excl:
            if x not in self.words:
                errs.append(f"{ctx}: exclude_word_ids {x} not in words.csv")
        seen_lao, safe = {nfc(self.lao(ans))}, []
        for w in pool:
            if not self.safe_option(w, acc, excl, seen_lao):
                continue
            seen_lao.add(nfc(self.lao(w)))
            safe.append(w)
        ans_pos = self.first_pos(ans)
        safe.sort(key=lambda w: self.first_pos(w) != ans_pos)   # stable: pool order otherwise
        extra = []
        twins = {self.twin_key(x) for x in list(pool) + list(ws)}
        for w in (untaught if len(safe) < 3 else []):
            if w in self.words and self.twin_key(w) not in twins and self.safe_option(w, acc, excl, seen_lao):
                seen_lao.add(nfc(self.lao(w)))
                extra.append(w)
        homo = [f"{k}:{self.lao(w)}" for k, w in enumerate(ws, 1)
                if k != pos and len(self.by_lao.get(nfc(self.lao(w)), [])) > 1]
        if homo:
            warns.append(f"{ctx}: other word(s) with a homograph ({', '.join(homo)}): re-check accepts against "
                         "their other senses")
        if len(safe) + len(extra) < 2:
            warns.append(f"{ctx}: {len(safe) + len(extra)} safe option(s) with untaught words; the app "
                         "skips this blank")
        return ans, safe, extra, errs, warns


def blank_report(world, label, sentences, pool, untaught=()):
    """Option rule over a lesson's sentences [(sentence_id, role)], topped up from `untaught` (S7h).
    Returns (errors, warnings, printed lines)."""
    err, warn = [], []
    lines = [f"== Fill in the blank: {label} (pool {len(pool)} words) =="]
    recycled_ok = False
    for sid, role in sentences:
        s = world.sentences.get(sid, {})
        ws = world.sent_words.get(sid, [])
        lines.append(f"- {sid} ({role}) {s.get('lao_spaced', '')} = {s.get('english', '')}   ["
                     + " ".join(f"{k}:{world.lao(w)} {w}" for k, w in enumerate(ws, 1)) + "]")
        slots = world.slots.get(sid, [])
        if not slots:
            err.append(f"{label} {sid}: no sentence_slots row (tag at least the target word's slot)")
            lines.append("    no slot")
            continue
        for slot in slots:
            ans, safe, extra, e, w = world.slot_options(sid, slot, pool, untaught)
            err += [f"{label} {x}" for x in e]
            warn += [f"{label} {x}" for x in w]
            if ans is None:
                continue
            pos = int(slot["position"])
            gap = " ".join("__" if k == pos else world.lao(x) for k, x in enumerate(ws, 1))
            n = min(3, len(safe) + len(extra))
            n_opt = 4 if n >= 3 else 3 if n == 2 else 0
            if n_opt and role == "recycle":
                recycled_ok = True
            shown = ", ".join(f"{world.lao(x)} '{world.words[x].get('gloss_en', '')}'" for x in safe)
            more = ", ".join(f"{world.lao(x)} '{world.words[x].get('gloss_en', '')}' {x}" for x in extra)
            lines.append(f"    {gap}   accepts {slot.get('accepts', '')}"
                         + (f", exclude {slot['exclude_word_ids']}" if (slot.get("exclude_word_ids") or "").strip() else "")
                         + f": answer {world.lao(ans)}; safe distractors ({len(safe)}): {shown or 'none'}"
                         + (f"; untaught, the app picks {min(3 - len(safe), len(extra))} at random ({len(extra)}): {more}" if extra else "")
                         + (f" -> {n_opt} options" if n_opt else " -> skipped (fewer than 2)"))
    if any(r == "recycle" for _, r in sentences) and not recycled_ok:
        warn.append(f"{label}: no recycled sentence can be a fill in the blank")
    return err, warn, lines


def word_cat_errors(world, label, wids):
    """New and bonus words need a word_categories row with known categories."""
    err = []
    for w in wids:
        cs = world.word_cats.get(w)
        if cs is None:
            err.append(f"{label} word {w} {world.lao(w)}: no data/word_categories.csv row")
        elif world.categories is not None and cs - world.categories:
            err.append(f"{label} word {w} {world.lao(w)}: categories {sorted(cs - world.categories)} not in categories.csv")
    return err


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
    L.append("Generated by lesson_tool.py brief. Rules: docs/LESSON_RULES.md. Draft formats at the end.\n")
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
             f"core words: {len(world.known_words)} | bonus words not yet core: {len(world.bonus_words)} | "
             f"sentences used: {len(world.used_sents)}")
    for r in sorted(world.lessons, key=lambda r: int(r["lesson_order"]))[-3:]:
        new = [f"{world.show(it['item_id']) if it['item_type'] in ('unit', 'rule') else world.words.get(it['item_id'], {}).get('lao', it['item_id'])}"
               for it in world.items if it["lesson_id"] == r["lesson_id"] and it["role"] == "new"]
        bon = [world.lao(it["item_id"]) for it in world.items if it["lesson_id"] == r["lesson_id"] and it["role"] == "bonus"]
        L.append(f"  - {r['lesson_id']}: {r['title_en']} ({r['kind']}); new: {', '.join(new)}"
                 + (f"; bonus: {', '.join(bon)}" if bon else ""))
    L.append(f"- Known units: " + (" ".join(world.show(u) for u in sorted(world.known_units)) or "none"))
    L.append(f"- Known rules: " + (" ".join(world.show(r) for r in sorted(world.known_rules)) or "none"))
    L.append(f"- New in the previous lesson: " + (" ".join(world.show(i) for _, i in sorted(world.prev_new)) or "none"))
    L.append("- Look-ups (do not read the data tables whole):\n"
             "  - `python scripts/lesson_tool.py lookup <lao or word_id> ...`: core or bonus? which lesson? readable now? missing units\n"
             "  - `python scripts/lesson_tool.py can-read \"<sentence with spaces between words>\"`: status of every word\n")

    # candidates: single units and pairs
    P = [(r, *cw_sig(world, r)) for r in pool(world)]
    P = [(r, s) for r, s, prob in P if not prob and s and not (r["word_id"] and r["word_id"] in world.known_words)]
    untaught = set()
    for _, s in P:
        untaught |= set(s - have)

    def gain(extra):
        # a same-sound unit always comes with its partner (ງ ນ ມ at the start and the end)
        h = have | extra | {p for p in map(world.partner, extra) if p}
        return [r for r, s in P if s <= h and not s <= have]

    single = []
    for u in untaught:
        g = gain({u})
        if g:
            single.append((sum(r["w"] for r in g), u, g))
    single.sort(key=lambda x: (-x[0], x[1]))
    L.append(f"## Candidates: one new unit or rule (top {top} by usefulness of newly readable words)\n")
    L.append("Score = sum of category weights (function/pronoun/verb/question/basics 3; everyday nouns and describing 2; else 1). "
             "Words marked * have no words.csv row yet (draft one first, or choose another word). "
             "A same-sound letter (ງ ນ ມ) is taught at the start and the end together: list both units as new "
             "(they count as one).\n")
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

    # bonus words (decision 21)
    L.append("\n## Bonus words (role `bonus`; LESSON_RULES decision 21)\n")
    L.append("A bonus word is readable with what is taught, common, shown under a 'bonus' label (one or two per "
             "lesson), and never used in a sentence until a later lesson lists it as `new` (core). Bonus words, and "
             "bonus words turning core, are exempt from 'every new word uses something new'.\n")
    earlier = sorted(world.bonus_words, key=lambda w: (world.bonus_lesson.get(w, ""), w))
    L.append("- Earlier bonus words, not yet core (list one as `new` to use it in sentences): "
             + (", ".join(f"{w} {world.lao(w)} '{world.words.get(w, {}).get('gloss_en', '')}' "
                          f"({world.bonus_lesson[w]})" for w in earlier) or "none"))
    shown = world.known_words | set(world.bonus_lesson)
    cand = [r for r, s in ((r, cw_sig(world, r)) for r in pool(world))
            if not s[1] and s[0] and s[0] <= have and not (r["word_id"] and r["word_id"] in shown)]
    cand.sort(key=lambda r: (-r["w"], r["lao"]))
    L.append(f"- Readable now with known units only (top {top}; words that need this lesson's new units are in the "
             "candidate lists above): "
             + (", ".join(f"{r['lao']} '{r['gloss']}'{'' if r['word_id'] else '*'}" for r in cand[:top]) or "none"))

    # sentences
    rs = [s for s in world.sentences if s not in world.used_sents and world.sent_readable(s, world.known_words)]
    L.append(f"\n## Existing sentences readable with core words only ({len(rs)}; unused so far)\n")
    for s in rs[:top]:
        r = world.sentences[s]
        L.append(f"- {s} {r['lao_spaced']} = {r['english']} [{r['confidence']}]")
    L.append("\nSentences that become readable with this lesson's new words are accepted by check; "
             "find them with grep on data/sentence_words.csv. A sentence may not use a bonus word that is not core.\n")

    # recycle
    L.append("## Recycle candidates (least recently shown first)\n")
    rec = sorted(world.known_words, key=lambda w: (world.last_shown.get(w, 0), world.times_shown.get(w, 0)))
    for w in rec[:top]:
        r = world.words.get(w, {})
        L.append(f"- {w} {r.get('lao', '')} '{r.get('gloss_en', '')}' (last shown L{world.last_shown.get(w, 0):04d}, "
                 f"shown {world.times_shown.get(w, 0)}x)")
    L.append("\n## Draft formats (folder curriculum/lessons/drafts/next/)\n")
    for f, cols in DRAFT_COLS.items():
        L.append(f"- {f}: {','.join(cols)}")
    L.append("- items.csv role: new | recycle | example | bonus (bonus: words only; never in a sentence).")
    L.append(f"- Rule {DEAD_RULE} = dead syllables; any word with a dead syllable needs it. New rules: next free R## id.")
    L.append("- Activity data (DESIGN 'Fill in the blank: one logical choice'), in data/ with real ids, before "
             "check: every new or bonus word needs a data/word_categories.csv row (word_id,categories,source,"
             "confidence,notes); every sentence of the lesson a data/sentence_slots.csv row for at least its target "
             "word (sentence_id,position,accepts,exclude_word_ids,source,confidence,notes). Agent tags are "
             "`unverified`. Run pipeline.sh after editing.")
    L.append("- Categories (data/categories.csv): " + (", ".join(sorted(world.categories)) if world.categories is not None
                                                     else "file missing"))
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
    """Returns (errors, warnings, new_units, new_rules, new_words, printed lines)."""
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
    new_units, new_rules, new_words, recycle_words, bonus_words, promoted = set(), set(), [], [], [], []
    sents, seen = [], set()
    for i, it in enumerate(items, 2):
        t, iid, role = it["item_type"], it["item_id"].strip(), it["role"]
        ctx = f"items.csv line {i} ({t} {iid})"
        if not (it["position"] or "").strip().isdigit():
            err.append(f"{ctx}: position must be a number")
            continue
        if t not in ITEM_TYPES or role not in ROLES:
            err.append(f"{ctx}: item_type must be {sorted(ITEM_TYPES)}, role {sorted(ROLES)}")
            continue
        if role == "bonus" and t != "word":
            err.append(f"{ctx}: role bonus is for words only")
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
            if role == "bonus":
                if iid in world.known_words:
                    err.append(f"{ctx}: already a core word (list it as recycle instead)")
                elif iid in world.bonus_words:
                    err.append(f"{ctx}: already a bonus word since {world.bonus_lesson[iid]} "
                               "(recycle it to show it again, or list it as new to make it core)")
                bonus_words.append(iid)
            elif role == "new":
                if iid in world.known_words:
                    err.append(f"{ctx}: already introduced")
                elif iid in world.bonus_words:
                    promoted.append(iid)
                new_words.append(iid)
            elif iid not in world.known_words and iid not in world.bonus_words:
                err.append(f"{ctx}: recycle/example of a word not yet introduced")
            else:
                recycle_words.append(iid)
            if world.words[iid].get("confidence") == "unverified":
                warn.append(f"{ctx}: word is unverified")
        elif t == "sentence":
            if iid not in world.sentences:
                err.append(f"{ctx}: not in sentences.csv")
            else:
                sents.append((ctx, iid, role))
                if world.sentences[iid].get("confidence") == "unverified":
                    warn.append(f"{ctx}: sentence is unverified (needs native review)")
    for w in sorted(set(bonus_words) & (set(new_words) | set(recycle_words))):
        err.append(f"word {w} {world.lao(w)}: listed as bonus and as another role in the same lesson")
    for u in new_units:
        if not (teach_u.get(u) or {}).get("teach_en", "").strip():
            err.append(f"units.csv: teach_en required for new unit {u}")
    # same-sound pairs (ງ ນ ມ) are taught together; the pair counts as one unit
    paired = set()
    for u in sorted(new_units):
        p = world.partner(u)
        if not p or p in world.known_units:
            continue
        if p not in new_units:
            err.append(f"unit {world.show(u)}: same sound at the start and the end, so add {world.show(p)} as new too")
        elif u.endswith("f"):
            paired.add(u)
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
    words_now = world.known_words | set(new_words)          # core words after this lesson
    bonus_now = (world.bonus_words | set(bonus_words)) - words_now
    for w in new_words + recycle_words + bonus_words:
        sig, _ = world.word_sig(w)
        miss = sig - have
        if miss:
            err.append(f"word {w} {world.lao(w)}: not readable yet, needs {' '.join(world.show(u) for u in sorted(miss))}")
    fresh = {u for u in new_units | new_rules} | {i for _, i in world.prev_new}
    if a.no_new_letters and (new_units or new_rules):
        err.append("--no-new-letters: the draft lists new units or rules")
    if fresh and not a.no_new_letters:
        for w in new_words:
            if w not in promoted and not (world.word_sig(w)[0] & fresh):
                err.append(f"word {w} {world.lao(w)}: uses no unit or rule from this or the previous lesson")
    for ctx, s, _ in sents:
        ws = world.sent_words.get(s, [])
        bon = [w for w in ws if w in bonus_now]
        if bon:
            err.append(f"{ctx}: bonus word(s) " + " ".join(f"{w} {world.lao(w)}" for w in bon)
                       + " in a sentence; a bonus word stays out of sentences until a lesson lists it as new (core)")
        missing = [w for w in ws if w not in words_now and w not in bon]
        if missing:
            err.append(f"{ctx}: words not yet taught: " + " ".join(f"{w} {world.lao(w)}" for w in missing))
    # budget: a guideline (decision 26), so warnings only; the fixed lesson 1 stays an error
    if first:
        lao_new = {nfc(world.words[w]["lao"]) for w in new_words}
        if new_units != FIRST_UNITS or lao_new != {FIRST_WORD}:
            err.append(f"lesson 1 is fixed: new units {sorted(FIRST_UNITS)} and the word {FIRST_WORD} only")
    else:
        n_units = len(new_units - paired)
        if n_units > a.max_units:
            warn.append(f"budget: {n_units} new units (guideline max {a.max_units}; a same-sound pair counts once)")
        lao_new = {nfc(world.words[w]["lao"]) for w in new_words}
        if len(lao_new) > a.max_words:
            warn.append(f"budget: {len(lao_new)} new word spellings (guideline max {a.max_words})")
        if not new_words and not new_units and not new_rules:
            err.append("lesson introduces nothing new (bonus words do not count)")
        wt = sum(world.weight(u) for u in (new_units - paired) | new_rules) + len(lao_new)
        if wt > a.max_weight:
            warn.append(f"budget: new-item weight {wt} (guideline max {a.max_weight})")
        need = min(a.min_recycle, len(world.known_words | world.bonus_words))
        if len(set(recycle_words)) < need:
            warn.append(f"budget: {len(set(recycle_words))} recycled words (guideline at least {need})")
    if len(bonus_words) > MAX_BONUS:
        warn.append(f"{len(bonus_words)} bonus words (decision 21: one or two per lesson)")
    # activity data (S7c)
    lines = []
    if world.categories is None:
        err.append("data/categories.csv is missing (PLAN S7c): create it before checking a lesson")
    else:
        label = f"L{world.n_lessons + 1:04d} (draft)"
        err += word_cat_errors(world, label, new_words + bonus_words)
        pool_ids = world.pool_words(world.n_lessons + 1, new_words + bonus_words)
        untaught = world.untaught(pool_ids)
        e, w, lines = blank_report(world, label, [(s, r) for _, s, r in sents], pool_ids, untaught)
        err += e
        warn += w
    return err, warn, new_units, new_rules, new_words, lines


def check_merged(world):
    """Activity data and the bonus rule over every merged lesson. Returns (errors, warnings, lines)."""
    err, warn, lines = [], [], []
    if world.categories is None:
        return ["data/categories.csv is missing (PLAN S7c)"], [], []
    core, bonus = set(), set()
    for les in sorted(world.lessons, key=lambda r: int(r["lesson_order"])):
        lid, n = les["lesson_id"], int(les["lesson_order"])
        its = sorted((it for it in world.items if it["lesson_id"] == lid), key=lambda it: int(it["position"] or 0))
        words = [(it["item_id"], it["role"]) for it in its if it["item_type"] == "word"]
        core |= {w for w, r in words if r == "new"}
        bonus |= {w for w, r in words if r == "bonus"}
        sents = [(it["item_id"], it["role"]) for it in its if it["item_type"] == "sentence"]
        for sid, _ in sents:
            bad = [w for w in world.sent_words.get(sid, []) if w in bonus - core]
            if bad:
                err.append(f"{lid} {sid}: bonus word(s) {' '.join(f'{w} {world.lao(w)}' for w in bad)} in a sentence "
                           "before a lesson made them core")
        err += word_cat_errors(world, lid, [w for w, r in words if r in POOL_ROLES])
        e, w, ls = blank_report(world, lid, sents, world.pool_words(n), world.untaught(world.pool_words(n)))
        err += e
        warn += w
        lines += ls
    return err, warn, lines


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
    dest = inside(os.path.join("curriculum", "lessons", "merged", lid), root)
    os.makedirs(os.path.dirname(dest), exist_ok=True)
    os.replace(path, dest)
    print(f"merged {lid}: {les['title_en'].strip()} (draft moved to {os.path.relpath(dest, root)})")


def intro_lesson(world, wid):
    return next((it["lesson_id"] for it in sorted(world.items, key=lambda it: world.order.get(it["lesson_id"], 0))
                 if it["item_type"] == "word" and it["item_id"] == wid and it["role"] == "new"), "")


def word_status(world, wid, have):
    sig, prob = world.word_sig(wid)
    w = world.words[wid]
    head = f"{wid} {w['lao']} '{w['gloss_en']}'"
    if prob:
        return f"{head}: parse problem: {prob}"
    if wid in world.known_words:
        was = f"; bonus first in {world.bonus_lesson[wid]}" if wid in world.bonus_lesson else ""
        return f"{head}: known, core (introduced {intro_lesson(world, wid)}{was})"
    if wid in world.bonus_words:
        return (f"{head}: bonus word (shown in {world.bonus_lesson[wid]}), not yet core: keep it out of sentences, "
                "or list it as new to make it core")
    miss = sig - have
    if not miss:
        return f"{head}: not taught yet, readable now"
    return f"{head}: not taught yet, needs {' '.join(world.show(u) for u in sorted(miss))}"


def lookup(world, terms):
    have = world.known_units | world.known_rules
    for t in terms:
        t = nfc(t.strip())
        ids = [t] if t in world.words else world.by_lao.get(t, [])
        if not ids:
            cw = [c for c in world.common if nfc(c["lao"]) == t]
            print(f"{t}: no words.csv row" + (f" (common list {cw[0]['cw_id']} '{cw[0]['gloss_en']}')" if cw else ""))
        for wid in ids:
            print(word_status(world, wid, have))


def can_read(world, text):
    """Each space-separated token of a sentence: core / bonus / readable / needs units / unknown word."""
    have = world.known_units | world.known_rules
    ok = True
    for tok in nfc(text).replace("?", " ").replace(".", " ").split():
        ids = world.by_lao.get(tok, [])
        if not ids:
            print(f"{tok}: not in words.csv (draft it, or split it into known words)")
            ok = False
            continue
        known = [w for w in ids if w in world.known_words]
        if known:
            print(f"{tok}: known, core ({', '.join(known)})")
        else:
            print(f"{tok}: " + "; ".join(word_status(world, w, have) for w in ids))
            ok = False
    print("readable with core words only" if ok else "not yet readable with core words only (bonus words do not count)")


def main():
    if hasattr(sys.stdout, "reconfigure"):
        sys.stdout.reconfigure(encoding="utf-8")
    ap = argparse.ArgumentParser(description=__doc__, formatter_class=argparse.RawDescriptionHelpFormatter)
    ap.add_argument("mode", choices=["status", "brief", "check", "merge", "lookup", "can-read"])
    ap.add_argument("draft", nargs="*", help="check/merge: draft folder (default curriculum/lessons/drafts/next); "
                    "lookup: lao spellings or word_ids; can-read: the sentence, words separated by spaces")
    ap.add_argument("--data", default="data")
    ap.add_argument("--common", default="curriculum/common_words.csv")
    ap.add_argument("--out", default="curriculum/lessons/next-brief.md")
    ap.add_argument("--top", type=int, default=12)
    ap.add_argument("--max-units", type=int, default=2)
    ap.add_argument("--max-words", type=int, default=3)
    ap.add_argument("--max-weight", type=float, default=5.5)
    ap.add_argument("--min-recycle", type=int, default=3)
    ap.add_argument("--no-new-letters", action="store_true",
                    help="check/merge: a lesson with no new units or rules (CURRICULUM_PATH lesson 11): its new words "
                         "need not use a unit or rule from this or the previous lesson")
    ap.add_argument("--merged", action="store_true", help="check: every merged lesson instead of a draft")
    a = ap.parse_args()
    root = os.path.abspath(os.getcwd())
    world = World(inside(a.data, root), inside(a.common, root))

    if a.mode == "status":
        print(f"lessons: {world.n_lessons} | units: {len(world.known_units)} | rules: {len(world.known_rules)} | "
              f"core words: {len(world.known_words)} | bonus words not yet core: {len(world.bonus_words)} | "
              f"sentences used: {len(world.used_sents)}")
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
    if a.mode == "check" and a.merged:
        err, warn, lines = check_merged(world)
        print("\n".join(lines))
        report(err, warn)
        if err:
            sys.exit(1)
        return
    path = inside(a.draft[0] if a.draft else "curriculum/lessons/drafts/next", root)
    draft = load_draft(path)
    err, warn, nu, nr, nw, lines = check(world, draft, a)
    if lines:
        print("\n".join(lines))
    report(err, warn)
    if err:
        sys.exit(1)
    if a.mode == "merge":
        merge(world, draft, path, root, nu, nr)


if __name__ == "__main__":
    main()
