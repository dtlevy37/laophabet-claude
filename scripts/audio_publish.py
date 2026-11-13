"""Turn natives' raw takes into lesson audio (PLAN A1). Run from the project root; standard library + ffmpeg.

Usage:
  python scripts/audio_publish.py fetch                 # hosted takes -> tmp/audio/manifest.json + tmp/audio/raw/
  python scripts/audio_publish.py process [--force]     # raw webm/mp4 -> tmp/audio/out/<type>/<id>-<rec8>.m4a
  python scripts/audio_publish.py upload --local|--linked   # out/ -> bucket 'audio' (skips files already there)
  python scripts/audio_publish.py migration [--name lesson_audio]   # item_audio rows -> a new migration file
  python scripts/audio_publish.py all --linked          # fetch, process, upload --linked and --local, migration

What it picks (fetch): per item, the newest non-skipped take marked natural (is_natural = true; a take of the
native's own wording waits for owner review), from users with role 'native', voice consent, and a
reviewer_trust.native_verified_at set by the owner (profiles.role alone is self-declared). Credit = their
voice_credit (null = anonymous). Every chosen take is approved (owner 2026-11-12: approve all, learners report
bad audio through report_content()).

Processing (owner: quiet takes, "boost slightly but not much distortion"): no compressor or limiter, only a
linear gain, so nothing is squashed. Steps: mono, 70 Hz high-pass (rumble), trim leading/trailing silence to a
short pad (threshold = the take's peak - 30 dB, never below -60 dBFS), short fades, then gain =
min(TARGET_LUFS - loudness, PEAK_CEILING - true peak). Quiet takes stop at the peak ceiling instead of clipping.
Gain is capped at MAX_GAIN (flagged); takes quieter than MIN_LUFS are skipped. Output MP3 96 kb/s mono (plays in
every browser; Chromium builds without AAC cannot play .m4a).

ffmpeg: FFMPEG env var, else tmp/tools/ffmpeg-*/bin/ffmpeg.exe, else ffmpeg on PATH. Supabase CLI on PATH,
run from app/backend (linked project). Nothing here writes the DB directly: rows go in through the migration.
"""
import argparse, glob, json, math, os, re, shutil, subprocess, sys
from datetime import datetime, timezone

ROOT = os.path.abspath(os.path.join(os.path.dirname(__file__), ".."))
BACKEND = os.path.join(ROOT, "app", "backend")
MIG_DIR = os.path.join(BACKEND, "supabase", "migrations")
WORK = os.path.join(ROOT, "tmp", "audio")
RAW, OUT = os.path.join(WORK, "raw"), os.path.join(WORK, "out")
MANIFEST = os.path.join(WORK, "manifest.json")

TARGET_LUFS = -18.0     # spoken-word web level
PEAK_CEILING = -1.5     # dBTP; gain never pushes the true peak above this
TRIM_BELOW_PEAK = 30.0  # dB under the take's peak counts as silence for trimming
PAD_START, PAD_END = 0.12, 0.25  # seconds of room kept around the speech
MAX_GAIN = 33.0         # dB; past this the take is mostly amplified room noise (flagged in the report)
MIN_LUFS = -55.0        # quieter than this (or no measurable speech): skipped, ask for a new take


def ffmpeg():
    env = os.environ.get("FFMPEG")
    if env:
        return env
    found = sorted(glob.glob(os.path.join(ROOT, "tmp", "tools", "ffmpeg-*", "bin", "ffmpeg*")))
    if found:
        return found[0]
    return shutil.which("ffmpeg") or sys.exit("ffmpeg not found (set FFMPEG or unpack a build in tmp/tools/)")


def supabase(*args, capture=True):
    exe = shutil.which("supabase") or sys.exit("supabase CLI not on PATH")
    r = subprocess.run([exe, *args], cwd=BACKEND, capture_output=capture, text=True, encoding="utf-8")
    # The CLI can print an error object and still exit 0.
    if r.returncode != 0 or '"_tag":"Error"' in (r.stdout or "") + (r.stderr or ""):
        sys.exit(f"supabase {' '.join(args)} failed:\n{r.stdout}\n{r.stderr}")
    return r.stdout


def cli_path(p):
    """The CLI reads 'Z:\\...' as a URL scheme: pass paths relative to app/backend, with forward slashes."""
    return os.path.relpath(p, BACKEND).replace("\\", "/")


def query_linked(sql):
    out = supabase("db", "query", "--linked", sql)
    data = json.loads(out[out.index("{"):])
    return data.get("rows", [])


# --- fetch ---------------------------------------------------------------------
PICK_SQL = """
select distinct on (r.item_type, r.item_id)
       r.id::text as recording_id, r.item_type, r.item_id, r.storage_path, r.mime_type, r.lao_snapshot,
       r.created_at::text as created_at, p.voice_credit as credit
from item_recordings r join profiles p on p.id = r.user_id
join reviewer_trust t on t.user_id = r.user_id and t.native_verified_at is not null
where not r.skipped and r.is_natural and r.storage_path is not null
  and p.role = 'native' and p.voice_consent_at is not null
order by r.item_type, r.item_id, r.created_at desc
"""


def cmd_fetch(_):
    rows = query_linked(PICK_SQL)
    for r in rows:  # untrusted DB text: ids and paths are checked before they reach a file name or SQL
        if (r["item_type"] not in ("word", "sentence") or not re.fullmatch(r"[WS]\d{6,9}", r["item_id"])
                or not re.fullmatch(r"[0-9a-f]{8}(-[0-9a-f]{4}){3}-[0-9a-f]{12}", r["recording_id"])
                or not re.fullmatch(r"[0-9a-f-]{36}/(word|sentence)/[WS]\d+/\d+\.\w+", r["storage_path"])):
            sys.exit(f"unexpected row: {r['item_id']} {r['storage_path']}")
    os.makedirs(RAW, exist_ok=True)
    for r in rows:
        dest = os.path.join(RAW, *r["storage_path"].split("/"))
        if not os.path.exists(dest):
            os.makedirs(os.path.dirname(dest), exist_ok=True)
            supabase("storage", "cp", f"ss:///recordings/{r['storage_path']}", cli_path(dest), "--linked", "--experimental")
        r["raw"] = os.path.relpath(dest, ROOT)
    with open(MANIFEST, "w", encoding="utf-8") as f:
        json.dump(rows, f, ensure_ascii=False, indent=1)
    print(f"{len(rows)} takes in {os.path.relpath(MANIFEST, ROOT)}")


# --- process -------------------------------------------------------------------
def run_ff(args):
    r = subprocess.run([ffmpeg(), "-hide_banner", "-nostats", *args], capture_output=True, text=True,
                       encoding="utf-8", errors="replace")
    if r.returncode != 0:
        sys.exit(f"ffmpeg failed: {' '.join(args)}\n{r.stderr[-2000:]}")
    return r.stderr


def measure(src, pre):
    """Loudness (LUFS), true peak (dBTP) and noise floor of src after the filter chain `pre`."""
    err = run_ff(["-i", src, "-af", f"{pre},loudnorm=print_format=json,astats=measure_overall=Noise_floor:measure_perchannel=none", "-f", "null", "-"])
    j = json.loads(err[err.rindex("{"):err.rindex("}") + 1])
    nf = re.findall(r"Noise floor dB: (-?[\d.]+|-inf)", err)
    noise = float(nf[-1]) if nf and nf[-1] != "-inf" else -120.0
    return float(j["input_i"]), float(j["input_tp"]), noise


def speech_bounds(src):
    """(start, end, duration) of the speech: first and last sound above the take's peak - TRIM_BELOW_PEAK."""
    err = run_ff(["-i", src, "-af", "aformat=channel_layouts=mono,volumedetect", "-f", "null", "-"])
    peak = float(re.findall(r"max_volume: (-?[\d.]+)", err)[-1])
    dur_m = re.findall(r"time=(\d+):(\d+):([\d.]+)", err) or re.findall(r"Duration: (\d+):(\d+):([\d.]+)", err)
    h, m, s = dur_m[-1]
    dur = int(h) * 3600 + int(m) * 60 + float(s)
    thr = max(peak - TRIM_BELOW_PEAK, -60.0)
    err = run_ff(["-i", src, "-af", f"aformat=channel_layouts=mono,silencedetect=n={thr}dB:d=0.08", "-f", "null", "-"])
    starts = [float(x) for x in re.findall(r"silence_start: (-?[\d.]+)", err)]
    ends = [float(x) for x in re.findall(r"silence_end: ([\d.]+)", err)]
    start = ends[0] if starts and starts[0] <= 0.01 and ends else 0.0
    end = starts[-1] if starts and (len(starts) > len(ends) or ends[-1] >= dur - 0.02) else dur
    if end <= start:  # nothing detected: keep it all
        start, end = 0.0, dur
    return max(0.0, start - PAD_START), min(dur, end + PAD_END), dur


def out_name(r):
    return f"{r['item_type']}/{r['item_id']}-{r['recording_id'][:8]}.mp3"


def probe_ms(path):
    err = run_ff(["-i", path, "-f", "null", "-"])
    h, m, s = re.findall(r"time=(\d+):(\d+):([\d.]+)", err)[-1]
    return int(round((int(h) * 3600 + int(m) * 60 + float(s)) * 1000))


def cmd_process(a):
    rows = json.load(open(MANIFEST, encoding="utf-8"))
    report = []
    for r in rows:
        src = os.path.join(ROOT, r["raw"])
        dest = os.path.join(OUT, *out_name(r).split("/"))
        if os.path.exists(dest) and not a.force:
            continue
        t0, t1, dur = speech_bounds(src)
        length = t1 - t0
        pre = (f"aformat=channel_layouts=mono,atrim={t0:.3f}:{t1:.3f},asetpts=PTS-STARTPTS,highpass=f=70,"
               f"afade=t=in:d=0.015,afade=t=out:st={max(0.0, length - 0.04):.3f}:d=0.04")
        lufs, tp, noise = measure(src, pre)
        if not math.isfinite(lufs) or lufs < MIN_LUFS:
            print(f"SKIP {r['item_id']}: too quiet to use ({lufs} LUFS); ask for a new take")
            continue
        gain = min(TARGET_LUFS - lufs, PEAK_CEILING - tp, MAX_GAIN)
        os.makedirs(os.path.dirname(dest), exist_ok=True)
        part = dest + ".part"
        run_ff(["-y", "-i", src, "-af", f"{pre},volume={gain:.2f}dB", "-ar", "44100", "-ac", "1",
                "-c:a", "libmp3lame", "-b:a", "96k", "-f", "mp3", part])
        os.replace(part, dest)  # a broken run never leaves a file that looks finished
        flag = " (gain capped)" if gain == MAX_GAIN else ""
        report.append((r["item_id"], dur, length, lufs, tp, gain, flag, lufs + gain))
    if report:
        print(f"{'item':<12}{'raw s':>6}{'kept s':>7}{'LUFS':>7}{'peak':>6}{'gain':>6}{'LUFS_out':>9}")
        for row in report:
            print(f"{row[0]:<12}{row[1]:>6.2f}{row[2]:>7.2f}{row[3]:>7.1f}{row[4]:>6.1f}{row[5]:>6.1f}{row[7]:>9.1f}{row[6]}")
    print(f"{len(report)} processed, {len(rows) - len(report)} already done -> {os.path.relpath(OUT, ROOT)}")


# --- upload ----------------------------------------------------------------------
def cmd_upload(a):
    target = "--linked" if a.linked else "--local"
    rows = json.load(open(MANIFEST, encoding="utf-8"))
    out = supabase("storage", "ls", "ss:///audio/", "-r", target, "--experimental")
    have = set(json.loads(out[out.index("{"):]).get("paths", []) if "{" in out else [])
    n = 0
    for r in rows:
        name = out_name(r)
        if f"/audio/{name}" in have:
            continue
        src = os.path.join(OUT, *name.split("/"))
        if not os.path.exists(src):
            sys.exit(f"missing {src}: run process first")
        supabase("storage", "cp", cli_path(src), f"ss:///audio/{name}", "--content-type", "audio/mpeg",
                 "--cache-control", "max-age=31536000", target, "--experimental")  # file names never change
        n += 1
    print(f"{n} uploaded to {target[2:]}, {len(rows) - n} already there")


# --- migration ---------------------------------------------------------------------
def q(v):
    return "null" if v is None else "'" + str(v).replace("'", "''") + "'"


def cmd_migration(a):
    rows = json.load(open(MANIFEST, encoding="utf-8"))
    rows = [r for r in rows if os.path.exists(os.path.join(OUT, *out_name(r).split("/")))]  # skipped takes stay out
    for r in rows:
        r["duration_ms"] = probe_ms(os.path.join(OUT, *out_name(r).split("/")))
    body = ["create temp table audio_in (item_type text, item_id text, storage_path text, recording_id uuid,",
            "  speaker_credit text, duration_ms integer) on commit drop;",
            "insert into audio_in values"]
    vals = [f"  ({q(r['item_type'])}, {q(r['item_id'])}, {q(out_name(r))}, {q(r['recording_id'])}::uuid, "
            f"{q(r.get('credit'))}, {r.get('duration_ms') or 'null'})" for r in rows]
    body.append(",\n".join(vals) + ";")
    body += ["",
             "-- An item's active audio is retired when a different file replaces it.",
             "update public.item_audio a set retired_at = now()",
             "from audio_in v where a.item_type = v.item_type and a.item_id = v.item_id",
             "  and a.retired_at is null and a.storage_path <> v.storage_path;",
             "",
             "insert into public.item_audio (item_type, item_id, storage_path, recording_id, speaker_credit, duration_ms)",
             "select item_type, item_id, storage_path, recording_id, speaker_credit, duration_ms from audio_in",
             "on conflict (storage_path) do update set retired_at = null;  -- switching back to an older file"]
    stamp = max(int(datetime.now(timezone.utc).strftime("%Y%m%d%H%M%S")),
                max(int(f[:14]) for f in os.listdir(MIG_DIR) if f[:14].isdigit()) + 1)
    path = os.path.join(MIG_DIR, f"{stamp}_{a.name}.sql")
    head = [f"-- Lesson audio (A1): {len(rows)} takes, written by scripts/audio_publish.py. Files are in bucket 'audio'",
            "-- (uploaded by the same script before this migration is pushed). Do not edit by hand.", ""]
    with open(path, "w", encoding="utf-8", newline="\n") as f:
        f.write("\n".join(head + body) + "\n")
    print(os.path.relpath(path, ROOT))


def main():
    ap = argparse.ArgumentParser(description=__doc__, formatter_class=argparse.RawDescriptionHelpFormatter)
    sub = ap.add_subparsers(dest="cmd", required=True)
    sub.add_parser("fetch")
    p = sub.add_parser("process"); p.add_argument("--force", action="store_true")
    for name in ("upload", "all"):
        p = sub.add_parser(name)
        g = p.add_mutually_exclusive_group(required=True)
        g.add_argument("--local", action="store_true"); g.add_argument("--linked", action="store_true")
    p = sub.add_parser("migration"); p.add_argument("--name", default="lesson_audio")
    a = ap.parse_args()
    if a.cmd == "all":
        cmd_fetch(a); cmd_process(argparse.Namespace(force=False))
        cmd_upload(argparse.Namespace(linked=True)); cmd_upload(argparse.Namespace(linked=False))
        cmd_migration(argparse.Namespace(name="lesson_audio"))
    else:
        {"fetch": cmd_fetch, "process": cmd_process, "upload": cmd_upload, "migration": cmd_migration}[a.cmd](a)


if __name__ == "__main__":
    main()
