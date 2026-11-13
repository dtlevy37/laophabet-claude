# L5 Speaking practice: design note (2026-11-13, for the owner to agree)

Answers the owner's question (2026-11-13): how would the learner's voice be processed and judged, and what do we
need to buy or build? Web facts were checked on 2026-11-13; each carries its source, and anything not confirmed on
a primary source is marked **unverified**. Nothing here is built and no schema has changed.

## Recommendation
Build speaking in three steps and let the app judge nothing until a judge has passed a test on our own
recordings. **Phase 1 ("Say it")** is listen, record, play both back, self-grade: it runs entirely in the browser,
reuses `recorder.js`, costs nothing, sends no voice anywhere, and is the form of practice with the best evidence
for beginners (imitating a model and comparing). **Phase 2** adds a pitch picture: the learner's pitch line drawn
over the native speaker's, computed in the browser, shown as a picture to compare and never as a score. **Phase 3**
(the app says "I heard ໄກ" (gai, far) or "tone matched") is only built if a validation experiment passes; today no service
offers pronunciation scoring for Lao, and the Lao speech recognisers that exist are too inaccurate on single words
from beginners to be trusted without that test. We need **no third-party service for phases 1 and 2**, one small
MIT library (or about 100 lines of our own code) for pitch, and for phase 3 at most one cloud recogniser behind a
Supabase edge function. Phoneme-level scoring for Lao is a research project and is not planned.

## 1. What a beginner in a tonal language needs
| Practice | What it is | Evidence | Use here |
|---|---|---|---|
| Listen and repeat, record and compare | hear the native take, say it, hear both | Learners judge their own speech poorly without a model to compare against: the weakest learners overestimate most [E1] | Phase 1, the core |
| Shadowing | speak along with or just after the model | A 2024 systematic review (44 studies): helps comprehensibility, fluency and prosody; inconclusive for single sounds [E2] | Phase 1 for sentences (replay + speak) |
| Pitch picture | see your pitch line against the model's | Several small Mandarin studies found tone production improved with pitch displays; one found audio-only training did better; all are small [E3] | Phase 2, as a picture |
| Minimal pairs | two words that differ in one thing (tone, vowel length) | Standard for tone perception; perception comes before production | L3 teaches the pairs; speaking reuses them |
| Automatic judging | the app marks the attempt | ASR-based practice: medium effect overall (g = 0.69, 15 studies, English learners), large with explicit feedback, **small for prosody** (which is where tone sits) and small when practising alone [E4] | Phase 3, gated |

What this says for us: (1) perception first, so L2 (listen and pick) and L3 (tone) come before speaking counts for
anything; (2) the model voice plus the learner's own recording is the teaching tool, and a judge is an extra;
(3) a wrong automatic judgement costs more than no judgement, because a beginner cannot tell that the judge is
the one who is wrong.

## 2. Options
Cost assumes an active learner makes about 20 spoken attempts a day of about 3 seconds: about 30 minutes of audio
and 600 requests a month.

| | (a) Say it: record and compare | (b) Pitch overlay | (c) "Did it hear the right word" (ASR) | (d) Phoneme scoring (GOP) |
|---|---|---|---|---|
| How it works | play native take, record, play both, self-grade (again / close / good) | pitch track of both takes, trimmed, time-aligned, each normalised to its speaker's range, drawn on one chart | send the take to a Lao recogniser with the expected word as a hint; compare the transcript | acoustic model with Lao phones scores each sound against the expected one |
| Runs where | browser only | browser only | browser → edge function → cloud ASR | our own model server |
| Lao support | not needed | not needed (pitch is language-free) | exists but weak, see section 3 | none off the shelf; Azure covers 33 locales, Thai and Vietnamese but not Lao [S2] |
| Judges | learner | learner, with a picture | machine: word identity; tone only indirectly | machine: each sound and tone |
| Accuracy for beginners | n/a | pitch tracking is reliable on clean voiced speech; fails on whisper, creak, noise (then show no line) | unknown; best public Lao figures are 20–35% error on native read sentences [S4][S5]; single words are harder | unknown; needs labelled learner data nobody has |
| Latency | none | under 100 ms on a phone (estimate, **unverified**) | 1–3 s round trip (estimate) | 1–3 s |
| Cost per learner per month | 0 | 0 | about $0.20–0.50 [S6] | a server, $10+ a month flat |
| Voice leaves the device | no | no | yes: consent, a processor outside our control | yes, to our server |
| Effort | 1 slice | 1–2 slices after the experiment | experiment (1–2 days), then 2 slices | months, plus data collection |
| Verdict | **build** | **build if E1 passes** | **only if E2 passes** | **not planned** |

### (a) Say it
The row already in DESIGN "Activities". One card: Lao (main text), meaning, play button, record button, then two
play buttons (theirs, ours) and three self-grade buttons. `createRecorder()` gives the blob; the take lives in
memory and is dropped when the card leaves the page. For sentences the same card works as delayed shadowing.

### (b) Pitch overlay
- **Getting samples.** Decode the recorded blob with `AudioContext.decodeAudioData` (a browser can decode what it
  just recorded) and fetch + decode the native MP3 the same way. No live audio graph and no AudioWorklet needed.
  To check: the `audio` bucket must allow cross-origin `fetch` from the Netlify origin (**unverified**).
- **Pitch tracker.** McLeod or YIN, 30–40 ms windows every 10 ms, range 70–500 Hz, drop frames with low clarity.
  Run the *same* tracker on both takes so tracker quirks cancel out.

  | Library | Licence | Size | Fit |
  |---|---|---|---|
  | pitchy 4.1 (McLeod) | MIT [L1] | 33 kB unpacked, ESM only, one dependency | **first choice**; loads from a CDN or vendored, no build step |
  | own YIN | ours | about 100 lines | fallback if we want zero dependencies |
  | pitchfinder (YIN, McLeod, AMDF) | **unverified**; its YIN is credited to aubio, which is GPL [L2] | small | avoid until the licence is read |
  | aubio / aubiojs (WASM) | GPL [L2] | WASM binary | avoid: licence |
  | Essentia.js (WASM) | AGPL-3.0, commercial licence on request [L3] | WASM, size **unverified** | avoid: licence and weight |
  | Meyda | MIT [L2] | small | no pitch tracker that we could confirm; not needed |
- **Making two voices comparable.** Convert Hz to semitones and subtract the speaker's own median: the native
  speaker's from all her takes (fixed), the learner's from a running median of their takes (first take: that take's
  median). This removes the male/female octave gap; the picture then shows shape and relative height.
- **Time alignment.** Trim to the voiced span, then either stretch linearly (one syllable) or DTW on the
  normalised contour with a narrow band (words of 2+ syllables, short sentences). DTW can hide timing errors such
  as a short vowel said long, so vowel length is not judged from this picture.
- **What the learner sees.** Two lines on the 5-level frame `js/tone.js` already uses (native in the theme colour,
  learner dashed), a line of words under it ("Yours starts lower and does not rise"), only when the difference is
  large and the track is clean. No number, no pass or fail in phase 2. No line when under about 60% of frames are
  voiced: "Could not hear the pitch clearly. Try again somewhere quieter."
- **Limits.** Words are short (0.2–0.5 s of voicing); stops cut the line; the final glottal closure of some Lao
  tones looks like a pitch drop. Long sentences are out of scope for the overlay (declination and timing swamp the
  tones): words and phrases of up to about 4 syllables.

### (c) Recogniser check
Shape if it is ever built: `speech_check` edge function (JWT required, rate limit per learner, audio at most 10 s,
nothing stored) forwards the take and the expected text plus 3–5 real decoy words to the provider and returns the
transcript and confidence. The client shows "It heard: ໄກ (gai, far)" as information, never as "wrong". Two built-in
weaknesses: a recogniser is trained to guess the likely word, so with a hint list it tends to **accept a
mis-toned word** (false praise); and on a single syllable with no context it tends to return something else even
for a native (false blame). Experiment E2 measures both.
The browser's own speech recognition (Web Speech API) is not an option: Lao support on iPhone is **unverified**,
and it sends audio to Apple or Google outside our consent flow.

### (d) Phoneme-level scoring
Goodness of pronunciation needs a phone-level acoustic model for Lao, a pronunciation lexicon (we have IPA per
word, which helps) and learner recordings labelled by a native to set thresholds. Recent work scores with CTC
models without phone segmentation and without learner data [G1], but none of it has been shown on Lao, tone is
not a phone in those models, and the result must still be validated on labelled learner speech. Azure's ready-made
service would be the shortcut and does not cover Lao [S2]. Revisit only if a provider adds Lao.

## 3. Lao speech recognition: what exists (checked 2026-11-13)
| Service / model | Lao? | What we know | Source |
|---|---|---|---|
| Google Cloud Speech-to-Text V2 | **yes**, `lo-LA` on `chirp`, `chirp_2` (asia-southeast1, europe-west4) and `chirp_3` (eu; listed as **Preview** for Lao). Phrase hints (model adaptation) listed for `chirp_2` and `chirp_3`; word confidence for `chirp_2` | no published Lao accuracy | [S1] |
| Azure Speech | **yes** for speech to text (`lo-LA`: real-time and batch). **No** pronunciation assessment (33 locales; Thai and Vietnamese are in, Lao is not) | no published Lao accuracy | [S2] |
| OpenAI Whisper (open model, `whisper-1`) | in name only: language code `lo` exists | unusable zero-shot: about 100% error on FLEURS Lao | [S3][S4][S5] |
| OpenAI gpt-4o-transcribe | **unverified**: the current guide gives no language list | no Lao figure found; about $0.006/min (third-party) | [S7] |
| Meta MMS `mms-1b-all` | **yes** (`lao` adapter). Licence CC-BY-NC 4.0 (non-commercial). 1 B parameters: 1 GB even quantised, so not in a browser and not in an edge function (256 MB) | no trustworthy Lao figure found (one ONNX port reports CER 0.06 on a single sentence and says it is not a benchmark) | [S8] |
| BuzzASR/lao (Whisper large-v3 fine-tune, 2026, MIT) | **yes**, Lao-only | FLEURS: CER 21.8%, WER 86.6% (Lao has no spaces, so WER is harsh); Common Voice: CER 0.4% (tiny set, likely seen speakers) | [S4] |
| ElevenLabs Scribe | **yes** | vendor's own table: 35.4% WER on FLEURS Lao (Scribe v1), "moderate" tier; Gemini Flash 2 30.9%; $0.40 per audio hour | [S5] |
| Open Lao speech data | n/a | small: Common Voice Lao about 0.4 h, 16 speakers; FLEURS; the larger corpora (Babel, DataOcean) are licensed. Training our own recogniser is not realistic | [S9] |

Reading: Lao recognition exists at Google, Azure and ElevenLabs, but every public number is for native speakers
reading full sentences, and the best of them still gets one character in five wrong. Nobody publishes accuracy
for isolated words or for learners. Only our own test can tell us whether it is usable.

## 4. iPhone Safari constraints (they shape phases 1 and 2)
- `MediaRecorder` on iOS records `audio/mp4` (AAC) from iOS 14.5; WebM/Opus only from iOS 18.4 [B1].
  `recorder.js` already picks the type with `isTypeSupported`. Good as is.
- Microphone needs HTTPS and a tap; an `AudioContext` starts suspended and must be resumed inside a tap [B2].
- Opening the microphone can duck or reroute playback on iOS; WebKit suggests `echoCancellation: false` [B3],
  which `recorder.js` already asks for. It also stops the tracks when a take ends: keep that, and never play the
  model while the microphone is open (so true simultaneous shadowing is out; "listen, then speak" is in).
- The permission prompt returns per page load in some Safari setups (**unverified**): ask only when the learner
  taps record, and keep "Skip speaking for now" on every card.
- Play through the existing `<audio>` player (`audio.js`), not Web Audio: Web Audio is silenced by the ringer
  switch on iPhones (**unverified**, long-standing report). Web Audio is used only to decode, never to play.
- Decoding at 44.1 or 48 kHz is fine: the tracker works on whatever rate the context reports.

## 5. Privacy
- **Phases 1–2:** the take never leaves the phone and is not stored (memory only, dropped with the card). The
  card says so in one line. No consent screen needed beyond the browser's microphone prompt.
- **Phase 3:** voice goes to a processor. Requires: an opt-in screen that names the provider and says what is sent
  and that we keep nothing; a setting to turn it off; the edge function holds the API key and stores no audio; the
  provider's retention and training-use terms read and noted before launch (**not yet checked**).
- **Keeping learner takes** (for validation or to improve a judge) is a separate, explicit opt-in per learner,
  private bucket, deletable on request. Not in any phase below except the owner's own takes in the experiments.

## 6. Validating a judge with what we have
Material: about 67 processed native takes from one speaker (more coming); the owner as the learner; the owner's
wife as the labeller. Praat (parselmouth) is already in `tmp/tools/phon`, so both experiments run offline in
Python before any app code is written.

**Free negatives.** A native take of word A, judged as if the learner had been asked for word B, must be rejected.
Pairs that differ only by tone (L3's ໃກ້ gai "near", high-falling / ໄກ gai "far", low-rising; ເຂົ້າ kao "rice", low-falling / ເຂົ່າ kao "knee", mid) are the
ones that matter. This gives hundreds of known-wrong cases without recording anything.

**E1: is the pitch picture trustworthy? (gates phase 2)**
- Data: second takes of about 20 words from the native speaker (same word, two takes = "same"); pairs of different
  tone on similar syllables = "different"; 40 owner attempts, each labelled blind by the owner's wife: tone right / tone
  off / cannot say.
- Pass, all three: (1) a clean pitch line on at least 90% of native takes; (2) the normalised distance separates
  same-tone from different-tone native pairs with AUC ≥ 0.90; (3) on the owner's takes, the picture a neutral
  reader would call "off" agrees with the wife's label at least 80% of the time, and no take she called right is
  drawn as clearly off.
- Fail: phase 2 ships only the *native* pitch line on the card (a real contour next to the schematic one), with no
  learner line.

**E2: can a recogniser be trusted? (gates phase 3)**
- Run every native take through Google `chirp_2` and `chirp_3`, Azure `lo-LA` and one of ElevenLabs Scribe or
  BuzzASR/lao: once with no hint, once with the expected word plus four real decoys as hints. Then the cross-word
  negatives, then the owner's 40 labelled attempts.
- Pass, all four: (1) **false blame**: native takes rejected ≤ 3%; (2) **false praise**: wrong-word takes accepted
  ≤ 10%, and tone-only pairs accepted ≤ 20%; (3) on the owner's takes, of those the wife called good, ≤ 5% are
  rejected; (4) median round trip under 2.5 s from a phone.
- Sample size: with 67 takes, zero failures still only proves a rate under about 4.5% (rule of three). The 3% bar
  needs about 100 native takes and ideally a second native voice; until then a pass is provisional.
- Fail on (1) or (3): no recogniser feedback. Pass on (1) and (3) but fail on (2): it may be shown only as
  encouragement ("It understood you: ໄກ", gai, far) when it matches, and stays silent otherwise.

**Rules for any automatic feedback, whatever passes**
- A judge never says "wrong". It either confirms, or stays silent, or describes ("yours stays flat; hers rises").
- Automatic results never lower a level, never count against accuracy or the streak, and are never shown as a
  percentage.
- The learner's own grade stands; the app's view is a second opinion with a "this was wrong" chip that logs to
  `learner_reports`.
- Every judge has an off switch in settings, and a remote kill switch (a flag from the session RPC).

## 7. Fit with the ladder, logging and schema
- **Ladder.** Speaking is production, so it comes after the item is recognised: "Say it" may use words and
  sentences at **level ≥ 2 that have native audio**. In phases 1–2 it is a *show-type* activity like the teach card:
  it changes no level and no schedule. If a judge passes E2 later, a confirmed attempt may count as recall
  evidence; a failed or silent one never counts. Not in the first lessons: starts after L3 (tone) is taught, and
  earlier only as an optional "try saying it" on the teach card.
- **Where.** In lessons: at most 1–2 cards near the end, always skippable (no microphone, public place). In
  practice (S8b): a "Speaking" filter. The activity module is `{type: 'say_it', canUse, build, render}`;
  `canUse` = audio present and level ≥ 2 and recorder supported and speaking not switched off.
- **Logging (A3).** One `review_log` row per card: `activity = 'say_it'`, `role = 'primary'`, `detail = {v: 1,
  takes, plays_native, plays_own, grade: 'again'|'close'|'good'|null, skipped, ms_voiced, overlay: {shown, dist}}`.
  It fits the 2 KB limit; no audio and no pitch data in the DB. To settle when the slice is specified: how a row
  with no right/wrong is stored (as teach cards are today) and that `record_answers` leaves levels alone for it.
- **Schema.** Phase 1: none beyond accepting the new activity name. Phase 2: none (contours are computed in the
  browser from the published MP3). Phase 3: one edge function, an opt-in timestamp on `profiles` (like
  `voice_consent_at`), no audio table.
- **Strings.** All card text in `strings.json`; the self-grade labels need Lao only if natives see the card.

## 8. Phased plan
| Phase | Ships | Third parties | Gate | Done when |
|---|---|---|---|---|
| 0 | E1 and E2 run offline; results in this note | trial accounts for E2 only, owner's and wife's voices only | owner agrees this note; second takes of 20 words; 40 owner attempts labelled | both results written up with pass or fail per line |
| 1 | "Say it" card: listen, record, compare, self-grade; logged | none | L2 done (audio in lessons); does not wait for phase 0 | on an iPhone, a learner records a word from a lesson with audio, hears both takes, grades, and the row is in `review_log`; skipping works with the microphone refused |
| 2 | pitch picture on the Say it card for words and short phrases | none (pitchy or own code) | E1 pass; L3 merged (learner knows what the line means) | owner's takes on an iPhone draw within 1 s; unclear takes show the "could not hear" line, never a wrong picture |
| 3 | "It heard: …" second opinion, opt-in | one cloud recogniser via edge function | E2 pass; privacy terms read; owner agrees provider and cost | opted-in learner gets a result under 2.5 s; opted-out learner sends nothing (checked in the network panel) |
| 4 | phoneme-level scoring | — | a provider adds Lao pronunciation assessment, or a second validation with labelled learner data | not planned |

## 9. Risks
- **False blame demotivates** more than no feedback helps. Mitigation: the gates in section 6, describe-not-judge.
- **False praise** fixes a wrong tone in place. Mitigation: the recogniser never confirms tone; the native take is
  always one tap away; E2 measures tone-only pairs separately.
- **One native voice.** Every threshold is tuned to one speaker, and a male learner imitates a female model.
  Normalisation handles the picture, not the ear. A second (male) voice from L4 helps both.
- **iPhone audio quirks** (ducking, permission prompts, silent switch) can make phase 1 feel broken. Mitigation:
  test on the owner's iPhone before anything else is built on it; the fallback is play-only "say it aloud".
- **Noise and cheap microphones** break pitch tracking. Mitigation: show nothing rather than a bad line.
- **Speaking where the learner cannot speak** (bus, office). Mitigation: always skippable, a "not now" that mutes
  speaking cards for the session, never required to finish a lesson.
- **Provider drift** (Lao on `chirp_3` is Preview; prices and models change). Mitigation: one edge function, the
  provider behind it swappable; E2 kept as a script to re-run.
- **Scope creep** into building a recogniser. Out of scope; open Lao data is far too small [S9].

## 10. Questions for the owner
1. Is self-graded "Say it" (phase 1) worth shipping on its own, before any pitch picture? (Recommended: yes.)
2. Can your wife record second takes of about 20 words and label 40 of your attempts (tone right / off / cannot
   say)? That is all the experiments need.
3. Should speaking cards appear inside lessons (1–2, skippable) or only in practice at first?
4. Self-grade wording: three buttons (again / close / good), or just "I said it" with no grade?
5. For phase 3, would you accept learners' voices going to Google or Microsoft with opt-in, or is "voice never
   leaves the phone" a line you want to keep? If it is, phase 3 is dropped and nothing else changes.
6. May the app keep your own takes (only yours) in the private bucket to re-run the experiments as more native
   takes arrive?
7. A male voice for the model: is a second speaker likely before L4?

## 11. Owner answers (2026-11-13)
1. Phase 1 "Say it" first: yes.
2. More recordings: yes. The wife records second takes (normal pronunciation; nobody mispronounces on purpose:
   wrong-word negatives come from comparing her take of one word against another word) and labels the owner's
   attempts.
3. Speaking cards are part of lessons; learners can opt out and back in via Settings.
4. No self-grade: the point is hearing yourself next to the native audio. Log takes and plays only.
5. Voice must not leave our client/server for now (phase 3 off). Google/Microsoft only after the owner understands
   the architecture, services, libraries and costs (a later explainer).
6. Keeping the owner's own takes in the private bucket for the experiments: yes.
7. A male voice: not for 1–2 months (the wife's father and brother).

## Sources (all read 2026-11-13)
- [E1] Self-assessment: low-proficiency learners overestimate most; learners rate their own speech better than
  others' — https://pmc.ncbi.nlm.nih.gov/articles/PMC7006902 ; https://iastatedigitalpress.com/psllt/article/17581/galley/16238/view
  (search summaries; full texts not read).
- [E2] Shadowing systematic review (Oxford, 2024, 44 studies) — https://ora.ox.ac.uk/objects/uuid:3104cae1-3a6b-400a-b173-de44384238d2
- [E3] Pitch displays for Mandarin tones: https://iastatedigitalpress.com/psllt/article/id/15204 (2023, 4 beginners);
  Liu et al. 2011 https://www.lrdc.pitt.edu/perfettilab/pubpdfs/Liu_et_al-2011-Language_Learning.pdf ; contrary
  result (audio-only better), NTNU thesis 2010 https://etds.lib.ntnu.edu.tw/thesis/detail/de4c6fef8ec94772ed30b94dfc638b30
  (abstracts only).
- [E4] Ngo, Chen and Lai, ReCALL 2024, meta-analysis of ASR for pronunciation —
  https://www.cambridge.org/core/journals/recall/article/effectiveness-of-automatic-speech-recognition-in-eslefl-pronunciation-a-metaanalysis/A915444CF252B61D14961D2FE733822D
- [S1] Google supported languages (rows for `lo-LA`) — https://docs.cloud.google.com/speech-to-text/docs/speech-to-text-supported-languages ;
  Chirp 3 (Lao listed as Preview; adaptation up to 1,000 phrases) — https://docs.cloud.google.com/speech-to-text/docs/models/chirp-3 .
  The feature columns were read through a page summariser: confirm in the console before relying on them.
- [S2] Azure Speech language support (page updated 2026-11-12): `lo-LA` in the speech-to-text table; the
  pronunciation assessment table of 33 locales read in full, no Lao —
  https://learn.microsoft.com/en-us/azure/ai-services/speech-service/language-support?tabs=pronunciation-assessment
- [S3] Whisper language list has `"lo": "lao"` — https://github.com/openai/whisper/blob/main/whisper/tokenizer.py ;
  MMS paper table gives Whisper large-v2 about 101 on FLEURS Lao — https://arxiv.org/pdf/2305.13516 (via search summary).
- [S4] BuzzASR/lao model card (figures for the model and for zero-shot Whisper large-v3: CER 106 on FLEURS) —
  https://huggingface.co/BuzzASR/lao
- [S5] ElevenLabs Lao page (vendor's own benchmark; its headline "3.1%" contradicts its Lao table) —
  https://elevenlabs.io/speech-to-text/lao
- [S6] Prices: ElevenLabs $0.40/h [S5]; Google about $0.016/min from third-party pages, official page not readable
  (**unverified**) — https://cloud.google.com/speech-to-text/pricing ; Azure price not checked (**unverified**).
- [S7] OpenAI speech-to-text guide (no language list for gpt-4o-transcribe) —
  https://developers.openai.com/api/docs/guides/speech-to-text
- [S8] MMS — https://huggingface.co/facebook/mms-1b-all ; ONNX port sizes and its caveat —
  https://huggingface.co/OpenVoiceOS/mms-1b-all-onnx ; edge function memory 256 MB —
  https://supabase.com/docs/guides/functions/limits
- [S9] Common Voice Lao 24.0 datasheet — https://datacollective.mozillafoundation.org/datasets/cmj8u3pd500etnxxbzqdatlbn ;
  Babel Lao — https://catalog.ldc.upenn.edu/LDC2017S08
- [G1] Segmentation-free goodness of pronunciation (2025) — https://arxiv.org/pdf/2507.16838v3 ; mispronunciation
  detection without learner data, Finland Swedish — https://arxiv.deeppaper.ai/papers/2506.01156v1 (abstracts only).
- [L1] pitchy — https://npmjs.com/package/pitchy ; https://github.com/ianprime0509/pitchy
- [L2] pitchfinder — https://github.com/peterkhayes/pitchfinder ; aubio licence — https://aubio.org/ ;
  Meyda — https://npmjs.com/package/meyda
- [L3] Essentia licensing — https://essentia.upf.edu/licensing_information.html
- [B1] WebKit MediaRecorder — https://webkit.org/blog/11353/mediarecorder-api/ ; WebM/Opus from Safari 18.4 —
  https://www.buildwithmatija.com/blog/iphone-safari-mediarecorder-audio-recording-transcription
- [B2] AudioContext needs a user gesture on iOS — https://blog.openreplay.com/record-audio-browser-web-audio-api/
- [B3] getUserMedia and audio ducking, `echoCancellation: false` — https://bugs.webkit.org/show_bug.cgi?id=294623
  (bug number from a search summary; **unverified** that it is this report).
