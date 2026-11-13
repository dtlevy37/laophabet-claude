# Laophabet app

One app for two kinds of user, chosen at sign-up and stored in `profiles.role`:
- **Learners** (English UI): lessons, practice and reviews. Today only a placeholder home; see `docs/PLAN.md`.
- **Native speakers** (Lao UI): are handed one Lao sentence at a time and report errors, naturalness, casual/neutral/formal, and an optional voice recording.

```
app/
  backend/    Supabase: migrations, generated seeds (generator: scripts/db_sql.py)
  frontend/   plain HTML + CSS + ES modules (Netlify)
```

## Backend (`backend/`)

| File | Purpose |
|---|---|
| `supabase/migrations/..0000_curriculum_tables.sql` | Mirror of `data/*.csv` (templates, words, letters, vowels, sentences, sentence_words, template_fillers, tone_exceptions, learning_order). Locked down: no direct access for app users. |
| `supabase/migrations/..0100_feedback_tables.sql` | `profiles`, `reviewer_trust` (yours, private), `sentence_claims`, `sentence_reviews`, `sentence_recordings`. |
| `supabase/migrations/..0300_profile_demographics.sql` | Adds gender, age range, Lao locale and self-reported English level to `profiles`. |
| `supabase/migrations/..0200_review_functions.sql` | RPCs `claim_next_sentence`, `submit_review`, `skip_sentence`; RLS policies; private `recordings` storage bucket. |
| `supabase/migrations/..0700_lesson_tables.sql` | `lessons`, `units`, `rules`, `lesson_items`; `updated_at` + `retired_at` on every content table; `lesson_locked` view + `is_lesson_locked()`; RPC `get_lesson(lesson_id)`. |
| `supabase/migrations/..0800_list_lessons.sql` | RPC `list_lessons()` for the learner lesson list. |
| `supabase/migrations/20261025040000_progress_tables.sql` | Learner progress (S5): `learner_sessions`, `lesson_progress`, `learner_items` (level 0–4), append-only `review_log`; RPCs `start_lesson`, `record_answers`, `complete_lesson`. Own-row select only; writes only through the RPCs. |
| `tests/s5_progress_test.sql` | Paste-in SQL check for S5 (throwaway users, rolled back; prints check / got / expected). |
| `supabase/migrations/20261110120000_played_lesson.sql` | S6a: `review_log.first_try`; replaces `session_summary`, `record_answers`, `list_lessons` and `get_lesson` (per-learner lesson state, levels, pool unit sounds). |
| `supabase/migrations/20261111010000_list_lessons_covers.sql` | S7a extra: `list_lessons` adds `covers` (a done lesson's new items). |
| `supabase/migrations/20261112211502_s7h_untaught_options.sql` | S7h: replaces `get_lesson` (adds `distractors.untaught`). |
| `supabase/migrations/20261111020000_activity_data_bonus.sql` | S7c + S7f: tables `word_units`, `word_categories`, `sentence_slots` (locked down like the other content tables); `lesson_items.role` allows `bonus`; internal helper `word_cats(word_id)` (category union over the word's spelling, verb safety rule; not callable by app users); replaces `get_lesson` and `list_lessons` (additive changes, below). |
| `supabase/migrations/20261113040000_a5_word_notes.sql` | A5: content table `word_notes` (word_id, usage_note, culture bool, source, confidence, notes; locked down like the other content tables; rows from `db_sql.py` only); `word_json` adds `usage_note`, `culture`, `note_confidence`. Test: `tests/a5_word_notes_test.sql`. |
| `supabase/migrations/20261113060000_a3_stats_capture.sql` | A3 stats capture (_shelf/docs/A3_STATS_DESIGN.md): `review_log` gains `attempt`, `question_id`, `role`, `known_options`, `detail`; `learner_sessions` gains `tz`, `utc_offset_min`, `app_version`, `settings`; replaces `record_answers` (same signature, old payloads still accepted); new `set_session_client`; internal helpers `review_id_list_ok`, `review_detail_ok`, `review_known_options` (not callable by app users). Test: `tests/a3_stats_capture_test.sql`. |
| `tests/s6a_played_lesson_test.sql` | Paste-in SQL check for S6a (one throwaway user; prints check / got / expected). |
| `supabase/migrations/<stamp>_lesson_<id>.sql`, `<stamp>_<change>.sql` | Content migrations written by `scripts/db_sql.py` (never by hand). |
| `supabase/seeds/` | Initial import of the pool tables, written by `db_sql.py seed` (2,810 sentences, 1,424 words at time of writing). |

### The DB is the source of truth for content (Phase 2)
- Every content change is a migration file you review and apply (`supabase db push`). Scripts never connect to the DB. The hosted project is the master; a local Supabase (`supabase db reset`) is hosted + pending migrations, for testing them.
- `data/*.csv` is the agent's working copy (hosted + pending migrations), so the repo can always rebuild the content.
- `python scripts/db_sql.py` modes (run from the project root):
  - `check`: the CSVs match the DB spec (run as step 4 of `pipeline.sh`).
  - `seed`: initial import, `on conflict do nothing`, so re-running never overwrites a row.
  - `lesson L0001`: everything one lesson uses, upserted. `lesson_tool.py merge` writes it automatically.
  - `change --name <name> <ids>`: upsert named rows (hand fixes, feedback decisions), lesson rows included.
  - `refresh`: bulk pool refresh; upserts changed rows, retires rows missing from the CSVs, and never touches a row a lesson uses (left out of the file and guarded by `is_lesson_locked()`).
- Rows are retired (`retired_at`), never deleted; readers filter `retired_at is null`. `updated_at` is set by trigger.
- On `supabase db reset` migrations run before seeds, so lesson migrations are self-contained (they upsert every row they reference) and the seed's `do nothing` leaves them alone.

### `get_lesson(lesson_id)` (signed-in users)
Returns `{lesson, items, distractors}` or null. `items` are in teaching order, each `{position, item_type, item_id, role, detail}`; `detail` is a unit (teach text + letter/vowel IPA, respelling, pron tip, class), rule, word (gloss, respelling, IPA, syllables, tones, pron tip, classifier) or sentence (lao, lao_spaced, english, words with positions). `distractors` = units and words introduced up to lesson `max(order, 5)` (DESIGN). The client never reads the content tables.

Since S6a the bundle is `{lesson, items, distractors, levels}`. Pool units carry their sound as `letter {ipa, respelling}` or `vowel {ipa, respelling}` (the same shape as an item's unit detail, so one function labels both). `levels` is `[{item_type, item_id, level}]` for the caller over the lesson's items and the pool; an item that is not listed is at level 0.

Since `20261111020000_activity_data_bonus.sql`: a word detail has `units: [{syl_index, position, unit_id}]` (empty
when unparsed); a sentence detail has `slots: [{position, accepts, exclude}]`; each pool word has `cats` (the
category union over every live word with the same spelling, or null when untagged); the pool includes `bonus` words.
An item's `role` can be `bonus`.

Since `..._s7h_untaught_options.sql` (S7h): `distractors.untaught` is `[{word_id, lao, gloss_en, respelling, pos,
cats}]`: every other live word with a word_categories row (no `function` in its cats, no pool word's spelling).
Fill in the blank draws wrong options from it at random only when the pool's safe distractors run short.

Since `20261113040000_a5_word_notes.sql` (A5): an item's word detail (not the pool's word objects) has `usage_note` (English
with Lao words in it, or null), `culture` (true/false, null without a note) and `note_confidence`. The teach card
shows the note under the meaning, with a "Culture" badge when `culture` is true.

### `list_lessons()` (signed-in users)
Returns `[{lesson_id, lesson_order, title_en, kind, summary_en, new_items, state, completed_at, last_accuracy}]` by lesson order. `state` follows the `start_lesson` rule: `done` (the caller completed it), `open` (lesson 1, a lesson the caller has started, or the one after a completed lesson), else `locked`. `completed_at` is the first completion; `last_accuracy` is the first-try accuracy (0–100, or null) of the caller's latest completed session of that lesson. Since `20261111010000_list_lessons_covers.sql` each row also has `covers`: for a done lesson, its new items in teaching order `[{item_type, lao, en}]` (unit: lao; word: lao + gloss; sentence: lao + English; rule: name), else null. The lesson list shows them so a learner can pick a lesson to review. Since `20261111020000_activity_data_bonus.sql` each row also has `bonus`: for a done lesson, its bonus words in teaching order (`[]` when none), else null; `covers` and `new_items` count core items only.

### Learner progress (S5)
- `start_lesson(lesson_id, local_day)` → `{session_id}`. `local_day` is the learner's calendar date (within 14 h of UTC). Lesson 1 is always open; a later lesson needs the previous one completed (or this learner started it before).
- `record_answers(session_id, answers)` → `{saved, levels}`. Up to 200 answers per call, each `{answer_id (client uuid), item_type, item_id, activity, direction show|recognition|recall, correct, latency_ms, lao_word_ids}`. Teach cards are sent as `show` with no `correct`. Replayed `answer_id`s are skipped, so the client can resend a batch after a dropped connection. Levels never go down: show → 1, recognition right → 2, recall right → 3 (one step at a time from below). Optional `first_try` (default true): send `false` when a missed question is asked again. Such answers still count for levels and words read, but not for the summary's `answers`, `correct` and `accuracy`. It is trusted client input and affects only the learner's own accuracy.
- Since A3 (`20261113060000_a3_stats_capture.sql`) each answer may also carry `attempt` (0 first ask, n = nth replay), `question_id` (one uuid for the rows of one question), `role` (`primary` | `pair` | `part` | `context`) and `detail` (an object of at most 2 KB: options shown, chosen, build-the-word pieces and mode, audio plays, info opens; id lists of at most 20; unknown keys kept). All optional; a bad shape is rejected with 22023. The server stores `known_options`: the wrong options shown that the learner had at level ≥ 1 (0 = weak evidence; logged only, levels unchanged).
- `set_session_client(session_id, client)` → `{saved}`: `{tz, utc_offset_min, app_version, settings}` for the session, written once (a second call returns `saved: false`). The client calls it after `start_lesson` and ignores a failure.
- `complete_lesson(session_id)` → summary `{answers, correct, accuracy, words_read, new_items, level_ups, streak, ...}`, computed from `review_log` (DESIGN "Session summary"). Calling it again returns the same summary.
- Streak = consecutive `local_day`s with a completed session, ending at that session's day.

### How work is handed out
`claim_next_sentence()` returns the user's open claim if they have one (survives page refresh). Otherwise it claims the sentence with the fewest submitted reviews plus live claims, that this user has not reviewed or skipped, until a sentence has 3 reviews (`p_target`). Ties break by `sentence_id`, so the earliest curriculum sentences go first. Claims expire after 30 minutes. The RPC returns only `sentence_id, lao, lao_spaced, english`, so reviewers never see IPA, confidence, source or notes (avoids anchoring them).

### Set up
```bash
cd backend
supabase link --project-ref <ref>       # this project: nerttltntbwhpvticuwe
supabase db push --linked              # applies the migrations
```
Load the data (either):
```bash
supabase db push --include-seed        # uses [db.seed] in config.toml
# or
for f in supabase/seeds/*.sql; do psql "$DB_URL" -f "$f"; done
```
Local dev: `supabase start && supabase db reset` applies migrations and seeds.

Seeds are for the first import only (`python scripts/db_sql.py seed`; re-applying never overwrites rows). Later pool changes go through `db_sql.py refresh` or `change` migrations. The script aborts without writing if the CSV headers or keys no longer match its `TABLES` spec; update `TABLES` and add a migration together when you add a column.

### Auth settings (Supabase dashboard)
- Email confirmations are on in `config.toml`; for hosted projects set it under Authentication > Providers > Email.
- Add your Netlify URL under Authentication > URL Configuration (Site URL and redirect URLs).

### Ranking trust later
`reviewer_trust(user_id, trust_score, notes)` is unreadable to app users. Useful signals already captured: `profiles.is_native_speaker`/`region`, `sentence_reviews.time_to_submit_ms` (server-measured), and per-sentence agreement across reviewers (`sentence_reviews` grouped by `sentence_id`). `lao_snapshot` keeps the exact text reviewed if the curriculum changes later. Recordings are in the private bucket `recordings` at `{user_id}/{sentence_id}/{timestamp}.ext`; listen via the dashboard or signed URLs from a service-role script.

### Recording mode (S10r, migration `20261113000000_s10r_recording_mode.sql`)
Natives (`profiles.role = 'native'`) open `#/record`. Once: `set_voice_consent(p_credit)` sets `profiles.voice_consent_at` and `voice_credit` (name learners may see; null = anonymous). Then `next_recording_item()` → `{item_type word|sentence, item_id, lao, english, lesson_order (null for pool items), lesson_left, recorded}` or null when nothing is left. Order: lessons by `lesson_order`, then teaching position, with a sentence's words just before it; then pool words by `intro_order`, then pool sentences. Items the caller recorded or skipped are left out, and so are words whose spelling the caller already did (same sound). Before recording the native answers "is this natural?"; when not, they type their own wording and record that. The client uploads to the private bucket `recordings` at `{uid}/{item_type}/{item_id}/{ms}.{ext}` and calls `save_recording(item_type, item_id, storage_path, mime_type, duration_ms, is_natural, spoken_lao, could_be_name)` → `{saved}` (a replayed path saves nothing; the file must exist), or `skip_recording_item(item_type, item_id, reason)`. Rows are in `item_recordings` (append-only, own-row select; a later take of the same item is a new row, latest wins; `lao_snapshot` keeps the text shown). Takes are raw: the browser's echo cancelling, noise suppression and automatic gain are turned off. The owner's view `recording_feedback` adds the speaker's credit, gender, dialect and `verified_native`.

### Lesson audio and learner reports (A1, migration `20261113020000_a1_lesson_audio.sql`)
`item_audio(item_type word|sentence, item_id, storage_path, recording_id, speaker_credit, duration_ms, approved_at, retired_at)`: the takes learners hear, one active row per item. Files live in the public bucket `audio`. Rows and files come only from `scripts/audio_publish.py` (`fetch` → `process` → `upload --linked|--local` → `migration`). It picks each item's newest natural take from verified natives (`reviewer_trust.native_verified_at`) with voice consent, trims the silence, applies a linear gain toward −18 LUFS (true peak ≤ −1.5 dB, at most +33 dB, with no compressor) and writes MP3 96 kb/s. RLS is on with no policies. Read through `get_item_audio(p_word_ids text[], p_sentence_ids text[])` → `[{item_type, item_id, audio_id, path, credit, duration_ms}]`; `bundle.js` sets `audio_url`, `audio_id` and `audio_credit` on every matching detail of a lesson bundle. `learner_reports` (own-row select) is filled by `report_content(p_item_type, p_item_id, p_kind audio_quality|audio_wrong|audio_other|content_wrong|other, p_note, p_audio_id)` → `{id, updated}`. There is one open report per learner, item and kind (a repeat updates it), and at most 50 a day. The owner reads the table and sets `resolved_at`/`resolution` by hand. Test: `backend/tests/a1_audio_test.sql`.

### Latest changes (migration `..0400`)
Birth date replaces age range; every question is optional (the all-answered check is dropped, so a review row can be empty); register gains `vulgar`; reviews gain `is_slang`, `multiple_meanings`, `meanings_notes`; `submit_review` has a new signature. The accent question already offers free text when the person is not from Vientiane (stored in `profiles.region`).

### Roles (migration `..0500`)
`profiles.role` is `learner` or `native`. The sign-up form sends it as user metadata and `handle_new_user` copies it; accounts without one are asked after login. Profiles from before roles became `native`. The role is self-declared (users can update their own profile), so anything privileged needs its own table. Natives can switch to the learner view from the top bar (remembered per browser; the role does not change).

### Native verification (migration `..0600`)
Feedback is unverified until you confirm the reviewer is a native speaker. Run in the SQL editor:
```sql
insert into public.reviewer_trust (user_id, native_verified_at, notes)
values ('<user uuid>', now(), 'how I checked')
on conflict (user_id) do update set native_verified_at = now(), notes = excluded.notes, updated_at = now();
```
The view `sentence_feedback` (not visible to app users) lists every review with `verified_native`.

## Interface languages
Every on-screen string lives in `frontend/js/strings.json` as `{lo, en}`. Natives see `lo`, learners see `en`; the login screen has a ພາສາລາວ / English toggle, and the sign-up role cards are labelled in both. Strings with no `lo` are learner-only. **The Lao is AI-invented and unreviewed.** Run `python frontend/scripts/export_lao_review.py` to produce `frontend/LAO_UI_REVIEW.md`, a table to hand to a native reviewer; apply corrections in `strings.json`. Technical errors are logged to the browser console and shown to users only as a generic message.

Reviewers focus on the Lao itself. The English meaning is hidden unless the person said at onboarding that they understand some English, and then only behind a "show English" link. The "English meaning is very different" error option appears only while the English is shown.

## Frontend (`frontend/`)
Plain HTML + CSS + ES-module JavaScript. No framework, no npm, no build step. `@supabase/supabase-js` loads from a CDN.

```
frontend/
  index.html  styles.css  netlify.toml
  config.example.js      -> copy to config.js (gitignored) with your project URL + anon key
  js/app.js              boot, session + profile, decides which view to show
  js/auth.js             login, sign-up (role first), role choice
  js/onboarding.js       native profile questions
  js/review.js           native: the review screen
  js/recorder.js         microphone recording (raw takes)
  js/record.js           native: recording mode (#/record); app.js has the native home (#/, #/record, #/review)
  js/learn.js            learner routes: #/ home (home.js: Continue card, section tiles), #/lessons (lessons.js:
                         the compact path), #/read/L0001 read-only cards, #/settings (settings.js showSettings), #/write
  js/session.js          #/lesson/L0001: planner + runner of a lesson session; same-day resume
                         (localStorage record); #/try/L0001 dry run (nothing recorded)
  js/summary.js          the session's end screens (summary, dry-run end, failures)
  js/audio.js            audioButton(detail): the play chip (null without audio_url); audioExtras(detail): voice
                         credit + report link for a card's "More" (ⓘ sheet); autoplay(detail) once on new
                         word/sentence cards (setting `autoplay`); stopAudio(); one shared player
  js/activities/         index.js (registry), teach_card.js (cards, also used by the viewer and the info dialog),
                         multiple_choice.js (unit and word questions)
                         build_sentence.js (word tiles in order; sentence items, recall)
                         fill_blank.js (one gap, one logical choice; recycled sentences, recall)
                         build_word.js (pieces in spoken order; recycled words, new tone marks)
  js/bundle.js           get_lesson cache
  js/settings.js  translit.js  tone.js    learner settings (page #/settings, theme), respelling styles, tone pictures
  js/howto.js            first-time how-to lines on build the word / build the sentence (L1; per browser)
  js/dom.js  i18n.js  supabase.js  strings.json (all UI text, lo + en)
```

### A lesson session (S6c; the questions are untested until the browser gate passes)
`#/lesson/L0001` fetches a fresh bundle, calls `start_lesson`, and steps through the plan under a progress bar: a
teach card per new item (the intro card first in lesson 1), a multiple-choice check after each new unit or word,
one question per recycled word, then a closing mixed block. A question answered wrong is queued again at the end
(at most twice, sent with `first_try: false`). Each finished step queues its answers (a teach
card reports every item on it as `show`) and sends the queue to `record_answers`; a failed batch stays queued and is
sent again with the next step, and the server skips `answer_id`s it already has. At the end everything unsent is
flushed, `complete_lesson` runs, and the summary screen shows what it returned. If saving fails the learner gets a
retry; nothing is lost while the page stays open. A running session is kept in memory, so a settings change or a
visit to the lesson list does not start a second one; a page reload does (resume comes in S7b).
Stats capture (A3): `advance()` in session.js stamps each step's answers with `question_id`, `attempt`, `role` and a
`detail` (the activity's own: options, chosen, tiles, pieces, mode; plus the audio and info taps the runner counts on
the step), and fills a teach card's `latency_ms` with its time on screen. After `start_lesson` it sends
`set_session_client` (time zone, `js/version.js` `APP_VERSION`, display settings) and only logs a failure.
Local: copy `config.example.js` to `config.js`, fill it in, then open `frontend/index.html` with VS Code Live Server (serve the `frontend` folder as root).

Netlify: set **Base directory** to `app/frontend`, leave the publish directory as set in `netlify.toml`, and add env vars `SUPABASE_URL` and `SUPABASE_ANON_KEY`. The build command only writes `config.js` from them.

Lao-text review: `python frontend/scripts/export_lao_review.py`, edit `js/strings.json`.

## Not yet tested
Nothing here has been run against a live Supabase project. The seed generator was run against the real CSVs; the SQL and front end have not been executed, so run `supabase db reset` locally and try the page in a browser first.
