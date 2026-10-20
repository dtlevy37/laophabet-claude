# Laophabet app

One app for two kinds of user, chosen at sign-up and stored in `profiles.role`:
- **Learners** (English UI): lessons, practice and reviews. Today only a placeholder home; see `_agent/APP_PLAN.md`.
- **Native speakers** (Lao UI): are handed one Lao sentence at a time and report errors, naturalness, casual/neutral/formal, and an optional voice recording.

```
app/
  backend/    Supabase: migrations, generated seeds, seed generator
  frontend/   plain HTML + CSS + ES modules (Netlify)
```

## Backend (`backend/`)

| File | Purpose |
|---|---|
| `supabase/migrations/..0000_curriculum_tables.sql` | Mirror of `data/*.csv` (templates, words, letters, vowels, sentences, sentence_words, template_fillers, tone_exceptions, learning_order). Locked down: no direct access for app users. |
| `supabase/migrations/..0100_feedback_tables.sql` | `profiles`, `reviewer_trust` (yours, private), `sentence_claims`, `sentence_reviews`, `sentence_recordings`. |
| `supabase/migrations/..0300_profile_demographics.sql` | Adds gender, age range, Lao locale and self-reported English level to `profiles`. |
| `supabase/migrations/..0200_review_functions.sql` | RPCs `claim_next_sentence`, `submit_review`, `skip_sentence`; RLS policies; private `recordings` storage bucket. |
| `scripts/generate_seed.py` | Validates the CSVs (headers, keys, types, foreign keys) and writes `supabase/seeds/NN_<table>.sql` as idempotent upserts. |
| `supabase/seeds/` | Generated output (2,810 sentences, 1,424 words at time of writing). |

### How work is handed out
`claim_next_sentence()` returns the user's open claim if they have one (survives page refresh). Otherwise it claims the sentence with the fewest submitted reviews plus live claims, that this user has not reviewed or skipped, until a sentence has 3 reviews (`p_target`). Ties break by `sentence_id`, so the earliest curriculum sentences go first. Claims expire after 30 minutes. The RPC returns only `sentence_id, lao, lao_spaced, english`, so reviewers never see IPA, confidence, source or notes (avoids anchoring them).

### Set up
```bash
cd backend
supabase link --project-ref <ref>
supabase db push                       # applies the 3 migrations
```
Load the data (either):
```bash
supabase db push --include-seed        # uses [db.seed] in config.toml
# or
for f in supabase/seeds/*.sql; do psql "$DB_URL" -f "$f"; done
```
Local dev: `supabase start && supabase db reset` applies migrations and seeds.

Regenerate seeds after the CSVs change (safe to re-apply; reviews are untouched):
```bash
python backend/scripts/generate_seed.py      # from native/, or any cwd
```
It aborts without writing if the CSV headers or keys no longer match the script's `TABLES` spec; update `TABLES` and the migration together when you add a column.

### Auth settings (Supabase dashboard)
- Email confirmations are on in `config.toml`; for hosted projects set it under Authentication > Providers > Email.
- Add your Netlify URL under Authentication > URL Configuration (Site URL and redirect URLs).

### Ranking trust later
`reviewer_trust(user_id, trust_score, notes)` is unreadable to app users. Useful signals already captured: `profiles.is_native_speaker`/`region`, `sentence_reviews.time_to_submit_ms` (server-measured), and per-sentence agreement across reviewers (`sentence_reviews` grouped by `sentence_id`). `lao_snapshot` keeps the exact text reviewed if the curriculum changes later. Recordings are in the private bucket `recordings` at `{user_id}/{sentence_id}/{timestamp}.ext`; listen via the dashboard or signed URLs from a service-role script.

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
  js/recorder.js         microphone recording
  js/learn.js            learner home (placeholder)
  js/dom.js  i18n.js  supabase.js  strings.json (all UI text, lo + en)
```
Local: copy `config.example.js` to `config.js`, fill it in, then open `frontend/index.html` with VS Code Live Server (serve the `frontend` folder as root).

Netlify: set **Base directory** to `app/frontend`, leave the publish directory as set in `netlify.toml`, and add env vars `SUPABASE_URL` and `SUPABASE_ANON_KEY`. The build command only writes `config.js` from them.

Lao-text review: `python frontend/scripts/export_lao_review.py`, edit `js/strings.json`.

## Not yet tested
Nothing here has been run against a live Supabase project. The seed generator was run against the real CSVs; the SQL and front end have not been executed, so run `supabase db reset` locally and try the page in a browser first.
