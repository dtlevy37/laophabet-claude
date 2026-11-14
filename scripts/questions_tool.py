"""Seed the native open questions (N1) from data/open_questions.csv into a Supabase migration.

Usage (standard library only, UTF-8, run from the project root):
  python scripts/questions_tool.py check                       # validate the CSV, write nothing
  python scripts/questions_tool.py migration [--name n1_questions_seed] [--stamp YYYYMMDDhhmmss]
                                                               # write app/backend/supabase/migrations/<stamp>_<name>.sql
Options: --csv data/open_questions.csv  --migrations app/backend/supabase/migrations

CSV columns: id (Q0001 ...), topic (sounds_spelling|word|sentence|ui_lao|other), question, context_json (object:
lao, respelling, english, item_type, item_id ...), options_json (array of {key, label, label_lao?}),
allow_free_text (true|false), notes (agent-only, never sent to the DB).

The migration is an idempotent upsert: insert ... on conflict (id) do update of topic, question, context,
options and allow_free_text (status, decision, retired_at and answers are never touched). Rows are never deleted:
a CSV row whose id is missing from a later file stays in the DB. To withdraw a question put "retire:" before its id
(retire:Q0004); to bring a retired one back use "reopen:" (reopen:Q0004). Plain rows never change retired_at.
`check` also fails when a question that exists in the committed CSV (git HEAD) loses an option key, because
answers store keys (skipped when the file is not in git yet). The script never connects to a DB.
"""
import argparse, csv, datetime, io, json, re, subprocess, sys
from pathlib import Path

TOPICS = {"sounds_spelling", "word", "sentence", "ui_lao", "other"}


def load(path, text=None):
    rows, problems, seen = [], [], set()
    with (io.StringIO(text, newline="") if text is not None else open(path, encoding="utf-8", newline="")) as f:
        r = csv.DictReader(f)
        need = ["id", "topic", "question", "context_json", "options_json", "allow_free_text", "notes"]
        if r.fieldnames != need:
            sys.exit(f"{path}: header must be {need}, got {r.fieldnames}")
        for n, row in enumerate(r, start=2):
            rid = row["id"].strip()
            retire = rid.startswith("retire:")
            reopen = rid.startswith("reopen:")
            qid = rid[7:] if retire or reopen else rid
            where = f"line {n} ({rid})"
            if not re.fullmatch(r"Q\d{4,}", qid):
                problems.append(f"{where}: id must look like Q0001")
            if retire:
                rows.append({"id": qid, "retire": True})
                continue
            if reopen:
                rid = qid
            if qid in seen:
                problems.append(f"{where}: duplicate id")
            seen.add(qid)
            if row["topic"] not in TOPICS:
                problems.append(f"{where}: bad topic {row['topic']!r}")
            if not row["question"].strip():
                problems.append(f"{where}: empty question")
            try:
                ctx = json.loads(row["context_json"] or "{}")
                opts = json.loads(row["options_json"] or "[]")
            except json.JSONDecodeError as e:
                problems.append(f"{where}: bad JSON ({e})")
                continue
            if not isinstance(ctx, dict):
                problems.append(f"{where}: context_json must be an object")
            if not isinstance(opts, list):
                problems.append(f"{where}: options_json must be an array")
                continue
            keys = [o.get("key") for o in opts if isinstance(o, dict)]
            if len(keys) != len(opts) or any(not k or not o.get("label") for k, o in zip(keys, opts)):
                problems.append(f"{where}: every option needs key and label")
            if len(set(keys)) != len(keys):
                problems.append(f"{where}: duplicate option key")
            ft = row["allow_free_text"].strip().lower()
            if ft not in ("true", "false"):
                problems.append(f"{where}: allow_free_text must be true or false")
            if not opts and ft != "true":
                problems.append(f"{where}: no options and no free text")
            rows.append({"id": qid, "topic": row["topic"], "question": row["question"].strip(), "context": ctx,
                         "options": opts, "ft": ft == "true", "reopen": reopen})
    return rows, problems


def lit(s):
    return "'" + s.replace("'", "''") + "'"


def jlit(o):
    return lit(json.dumps(o, ensure_ascii=False)) + "::jsonb"


def build(rows, name):
    out = [f"-- {name}: open questions seeded from data/open_questions.csv by scripts/questions_tool.py (idempotent upsert;",
           "-- answers, status and decisions are never touched; rows are retired, never deleted).", ""]
    live = [r for r in rows if not r.get("retire")]
    if live:
        out.append("insert into public.open_questions (id, topic, question, context, options, allow_free_text) values")
        out.append(",\n".join(
            f"  ({lit(r['id'])}, {lit(r['topic'])}, {lit(r['question'])}, {jlit(r['context'])}, {jlit(r['options'])}, "
            f"{'true' if r['ft'] else 'false'})" for r in live))
        out.append("on conflict (id) do update set topic = excluded.topic, question = excluded.question,")
        out.append("  context = excluded.context, options = excluded.options, allow_free_text = excluded.allow_free_text;")
    reopened = [r["id"] for r in live if r.get("reopen")]
    if reopened:
        out.append("update public.open_questions set retired_at = null where id in ("
                   + ", ".join(lit(i) for i in reopened) + ");")
    for r in rows:
        if r.get("retire"):
            out.append(f"update public.open_questions set retired_at = coalesce(retired_at, now()) where id = {lit(r['id'])};")
    return "\n".join(out) + "\n"


def lost_keys(rows, path):
    """Option keys present in the committed CSV (git HEAD) but gone now; [] when HEAD has no such file."""
    try:
        head = subprocess.run(["git", "show", "HEAD:" + str(path).replace("\\", "/")], capture_output=True,
                              check=True).stdout.decode("utf-8")
    except (subprocess.CalledProcessError, OSError):
        return []
    old, _ = load(path, head)
    now = {r["id"]: {o["key"] for o in r["options"]} for r in rows if not r.get("retire")}
    out = []
    for r in old:
        if r.get("retire") or r["id"] not in now:
            continue
        gone = {o["key"] for o in r["options"]} - now[r["id"]]
        if gone:
            out.append(f"{r['id']}: option key(s) removed since HEAD: {sorted(gone)} (answers store keys; keep them)")
    return out


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("mode", choices=["check", "migration"])
    ap.add_argument("--csv", default="data/open_questions.csv")
    ap.add_argument("--migrations", default="app/backend/supabase/migrations")
    ap.add_argument("--name", default="n1_questions_seed")
    ap.add_argument("--stamp", default=None)
    a = ap.parse_args()
    rows, problems = load(a.csv)
    problems += lost_keys(rows, a.csv)
    if problems:
        print("\n".join(problems))
        sys.exit(1)
    print(f"{len(rows)} question rows ok")
    if a.mode == "migration":
        stamp = a.stamp or datetime.datetime.now(datetime.timezone.utc).strftime("%Y%m%d%H%M%S")
        path = Path(a.migrations) / f"{stamp}_{a.name}.sql"
        path.write_text(build(rows, a.name), encoding="utf-8", newline="\n")
        print(f"wrote {path}")


if __name__ == "__main__":
    main()
