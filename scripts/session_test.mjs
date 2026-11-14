// Plans lessons from real get_lesson bundles and checks the planner and the S7b/S7d/S7e activities without a
// browser. Usage:
//   1. dump bundles (local Supabase running), one JSON file per lesson, e.g. tmp/bundles/L0004.json:
//      echo "begin; set local role authenticated; select public.get_lesson('L0004') from (select set_config(
//        'request.jwt.claims','{\"sub\":\"<user uuid>\",\"role\":\"authenticated\"}',true)) x; rollback;" |
//        docker exec -i supabase_db_laophabet-native psql -U postgres -At -q > tmp/bundles/L0004.json
//   2. node scripts/session_test.mjs [tmp/bundles]
// Checks: the same seed, levels and missed list rebuild the same plan (resume); lessons 3 and 4 ask a fill in the
// blank on a recycled sentence; a gap after ກິນ never offers ນ້ຳ; every lesson word can be built; build-the-word
// wrong tiles never share a letter with the word; a new tone mark gets a build the word in its lesson.
// S7h: every fill in the blank option is a data/words.csv word with that spelling; lesson 5 can blank ແລ້ວ in
// ລາວກິນເຂົ້າ __ (S000002877) with untaught real words among the options.
// L1: no sound question (unit_sound, unit_letter) offers two options with the same sound, and no build the word
// offers a wrong tile with the sound of one of the word's pieces (◌ໍ / ◌ອ◌ "aw", ◌ວ / ເ◌ົາ "ao"). Sounds are compared on
// the stored respelling (unitSoundRaw), not on the label in the learner's style.
// L2: with the recorded audio applied (tmp/bundles/audio.json, get_item_audio's rows for every recorded id; dump:
//   ids=$(echo "select string_agg(case when item_type='word' then item_id end, ',') || '|' || string_agg(case when
//     item_type='sentence' then item_id end, ',') from public.item_audio" | docker exec -i supabase_db_laophabet-native
//     psql -U postgres -At -q); w=${ids%|*}; s=${ids#*|}; echo "begin; set local role authenticated; select
//     public.get_item_audio(string_to_array('$w', ','), string_to_array('$s', ',')) from (select set_config(
//     'request.jwt.claims','{\"sub\":\"<any uuid>\",\"role\":\"authenticated\"}',true)) x; rollback;" |
//     docker exec -i supabase_db_laophabet-native psql -U postgres -At -q > tmp/bundles/audio.json
// ), a lesson with a recorded new word plans at least one listen and pick for every seed; its item is recorded, the
// answer is among the options, every option is a data/words.csv word, and no two options sound alike (same
// respelling: a same-sound twin cannot be told apart by ear).
// L1c: every build the word in a plan is right in the end after a wrong tap (the slip and every tap stay in detail),
// a found piece goes to its own slot, and Check before complete is a wrong, early answer; in lesson 9 ສະບາຍດີບໍ່? is
// also right for ເຈົ້າສະບາຍດີບໍ່? (S000000007, needs bundles dumped after the l1c_sentence_alternates migration) while
// ເຈົ້າຫິວເຂົ້າບໍ່? and ລາວຫິວເຂົ້າ need their pronoun; "Your answer" / "Right answer" alignment cases.
// L1e: a word's first build is in the lesson that teaches it (a recycled word is built only when its own lesson
// builds it for every seed), and a new long word (3+ syllables) gets find the missing piece before its full build;
// find the missing piece is one pick (right completes the word, wrong ends it), logged as recognition, and its
// options are real units, of the missing piece's kind where the pool allows; every new unit keeps its sound -> letter
// and a shared card its other meaning; piecesFirst puts a missing piece before its build.
// Plans use the dry-run levels (a learner who has done the lessons before), as #/try/<id> does.
import { register } from 'node:module'
import { existsSync, readdirSync, readFileSync } from 'node:fs'
import { join, resolve } from 'node:path'
import { pathToFileURL } from 'node:url'

// The browser modules import supabase-js from a CDN: stub every https import.
register(
  'data:text/javascript,' +
    encodeURIComponent(`export async function resolve(spec, ctx, next) {
      if (spec.startsWith('https:')) return { url: 'data:text/javascript,export const createClient = () => null', shortCircuit: true }
      return next(spec, ctx)
    }`),
)

// settings.js applies the Lao font when it loads; planning never touches the DOM otherwise.
globalThis.document = { documentElement: { style: { setProperty() {} } } }
globalThis.localStorage = { getItem: () => null, setItem() {}, removeItem() {} }

const root = resolve(import.meta.dirname, '..')
const js = (p) => pathToFileURL(join(root, 'app/frontend/js', p)).href
const { buildPlan, dryLevels } = await import(js('session.js'))
const { activities } = await import(js('activities/index.js'))
const { unitSoundRaw } = await import(js('activities/teach_card.js'))
const { wordSoundKey } = await import(js('activities/listen_pick.js'))
const { applyAudio } = await import(js('bundle.js'))
const { fitDetail, piecesFirst } = await import(js('session.js'))
const {
  newState: bwNewState,
  tapTile: bwTap,
  checkEarly: bwCheck,
  answersFor: bwAnswers,
} = await import(js('activities/build_word.js'))
const { judge: bsJudge, leftOut: bsLeftOut } = await import(js('activities/build_sentence.js'))
const { align: cmpAlign, kindOf: cmpKind, pairNotes } = await import(js('activities/compare.js'))

// data/words.csv: word_id -> lao (the first two columns; no quoted fields there)
const wordsCsv = new Map(
  readFileSync(join(root, 'data/words.csv'), 'utf8')
    .split(/\r?\n/)
    .slice(1)
    .filter(Boolean)
    .map((l) => l.split(',').slice(0, 2)),
)

const dir = resolve(process.argv[2] || join(root, 'tmp/bundles'))
const bundles = readdirSync(dir)
  .filter((f) => /^L\d{4}\.json$/.test(f))
  .sort()
  .map((f) => JSON.parse(readFileSync(join(dir, f), 'utf8')))
if (!bundles.length) throw new Error(`no bundles in ${dir}`)
const audioFile = join(dir, 'audio.json')
const audioRows = existsSync(audioFile) ? JSON.parse(readFileSync(audioFile, 'utf8')) : null
if (!audioRows) console.log('  (no audio.json: listen and pick is not checked)')
for (const b of bundles) applyAudio(b, audioRows || [], (path) => `audio/${path}`)
for (const b of bundles) b.spelling = true // the build the word checks below are for learners with Spelling practice on (H3); the H2/H3 block turns it off

let errors = 0
const failed = new Set() // a failure found with many seeds is reported once
const fail = (msg) => {
  if (failed.has(msg)) return
  failed.add(msg)
  errors++
  console.log(`  FAIL ${msg}`)
}
const SEEDS = 200
const strip = (spec) => JSON.stringify(spec, (k, v) => (k === 'item' ? v.item_id : v))
const lao = (spec) => spec.item.detail?.lao || spec.item.item_id

for (const b of bundles) {
  const id = b.lesson.lesson_id
  const levels = dryLevels(b)
  console.log(`== ${id} ${b.lesson.title_en}`)

  // resume: same inputs, same plan, including replays queued for missed steps
  const one = buildPlan(b, levels, 12345, [])
  const missed = one.steps.map((s, i) => (activities[s.activity].again ? i : -1)).filter((i) => i >= 0).slice(0, 3)
  const a = buildPlan(b, levels, 777, missed)
  const c = buildPlan(b, levels, 777, missed)
  if (!a || strip(a.steps) !== strip(c.steps)) fail('the same seed and missed list gave different plans')
  if (a && a.steps.length !== buildPlan(b, levels, 777, []).steps.length + missed.length) fail('replays not appended')

  console.log('  ' + one.steps.map((s) => `${s.activity}${s.form ? ':' + s.form : ''}${Number.isInteger(s.missing) ? ':missing' : ''}(${lao(s)})`).join(' · '))

  // L1: the same-sound rule, over many seeds. unit id -> stored sound, from the pool and the lesson's own units.
  const sounds = new Map()
  for (const u of [...(b.distractors.units || []), ...b.items.filter((x) => x.item_type === 'unit').map((x) => x.detail)]) {
    if (u?.unit_id) sounds.set(u.unit_id, unitSoundRaw(u).toLowerCase().replace(/[^a-z]/g, ''))
  }
  let soundQs = 0
  for (let seed = 1; seed <= SEEDS; seed++) {
    for (const s of buildPlan(b, levels, seed, []).steps) {
      if (s.activity === 'multiple_choice' && s.item.item_type === 'unit') {
        soundQs++
        const heard = s.options.map((o) => sounds.get(o.id))
        if (heard.some((x) => !x)) fail(`${lao(s)}: an option with no known sound`)
        if (new Set(heard).size !== heard.length) fail(`${lao(s)} ${s.form}: two options sound the same: ${s.options.map((o) => `${o.lao}=${sounds.get(o.id)}`).join(' ')}`)
      }
      if (s.activity === 'build_word') {
        const own = new Set(s.pieces.map((p) => sounds.get(p.unit_id)).filter(Boolean))
        const extra = s.tiles.filter((tl) => !s.pieces.some((p) => p.lao === tl.lao))
        for (const tl of extra) if (own.has(sounds.get(tl.unit_id))) fail(`${lao(s)}: wrong tile ${tl.lao} sounds like a piece of the word`)
      }
    }
  }
  if (b.items.some((x) => x.item_type === 'unit' && x.role === 'new' && sounds.get(x.item_id)) && !soundQs) fail('a new unit but no sound question')

  // L2: listen and pick
  if (audioRows) {
    const recorded = b.items.some((x) => x.item_type === 'word' && x.role === 'new' && x.detail?.audio_url)
    let none = 0
    let example = null
    for (let seed = 1; seed <= SEEDS; seed++) {
      const lps = buildPlan(b, levels, seed, []).steps.filter((s) => s.activity === 'listen_pick')
      if (!lps.length) none++
      for (const s of lps) {
        example ||= s
        if (!s.item.detail?.audio_url) fail(`${lao(s)}: listen and pick on a word with no recording`)
        if (!s.options.some((o) => o.id === s.answer)) fail(`${lao(s)}: listen and pick answer not among the options`)
        if (s.options.length < 3 || s.options.length > 4) fail(`${lao(s)}: listen and pick with ${s.options.length} options`)
        const keys = s.options.map((o) => wordSoundKey(o))
        if (keys.some((k) => !k) || new Set(keys).size !== keys.length) fail(`${lao(s)}: listen and pick options sound alike: ${s.options.map((o) => `${o.lao}=${o.sound}`).join(' ')}`)
        if (new Set(s.options.map((o) => o.lao)).size !== s.options.length) fail(`${lao(s)}: listen and pick: two options with the same Lao`)
        for (const o of s.options) if (wordsCsv.get(o.id) !== o.lao) fail(`${lao(s)}: listen and pick option ${o.id} ${o.lao} is not a words.csv word`)
      }
    }
    if (recorded && none) fail(`a recorded new word but no listen and pick (${none} of ${SEEDS} seeds)`)
    if (example) console.log(`  listen_pick ${lao(example)}: ${example.options.map((o) => `${o.lao} ${o.sound}`).join(', ')}`)
  }

  // S7e
  const recycledSentences = b.items.filter((it) => it.item_type === 'sentence' && it.role === 'recycle')
  let blanks = 0
  for (let seed = 1; seed <= SEEDS; seed++) {
    for (const s of buildPlan(b, levels, seed, []).steps) {
      if (s.activity !== 'fill_blank') continue
      blanks++
      const words = s.item.detail.words
      const before = words.find((w) => w.position === s.position - 1)
      if (before?.lao === 'ກິນ' && s.answer.lao !== 'ນ້ຳ' && s.options.some((o) => o.lao === 'ນ້ຳ')) fail(`${lao(s)}: ນ້ຳ offered after ກິນ`)
      if (new Set(s.options.map((o) => o.lao)).size !== s.options.length) fail(`${lao(s)}: two options with the same Lao`)
      if (s.options.length < 3) fail(`${lao(s)}: fewer than 3 options`)
      for (const o of s.options) if (wordsCsv.get(o.id) !== o.lao) fail(`${lao(s)}: option ${o.id} ${o.lao} is not a words.csv word`)
    }
  }
  if (recycledSentences.length && !blanks) fail('a recycled sentence but no fill in the blank')
  if (recycledSentences.length) {
    const s = buildPlan(b, levels, 5, []).steps.find((x) => x.activity === 'fill_blank')
    if (s) console.log(`  fill_blank ${lao(s)} gap at ${s.position}: ${s.options.map((o) => o.lao).join(' ')} (answer ${s.answer.lao})`)
  }

  // S7h: lesson 5 blanks ແລ້ວ (level 2) in S000002877 with untaught real words among the options
  if (id === 'L0005') {
    const it = b.items.find((x) => x.item_id === 'S000002877')
    const item = { ...it, shown: [{ item_type: 'sentence', item_id: it.item_id }] }
    const untaught = new Set((b.distractors.untaught || []).map((w) => w.word_id))
    let x = 7
    const spec = activities.fill_blank.build(item, b.distractors, () => ((x = (x * 16807) % 2147483647) / 2147483647), {
      levels: new Map([['word:W000020', 2]]),
    })
    if (!spec || spec.answer.lao !== 'ແລ້ວ') fail('S000002877: no fill in the blank on ແລ້ວ')
    else {
      const wrong = spec.options.filter((o) => o.id !== spec.answer.id)
      if (!wrong.some((o) => untaught.has(o.id))) fail('S000002877: no untaught option')
      for (const o of spec.options) if (wordsCsv.get(o.id) !== o.lao) fail(`S000002877: option ${o.id} is not a words.csv word`)
      console.log(`  S7h ${lao(spec)} gap at ${spec.position}: ${spec.options.map((o) => `${o.lao} '${o.gloss}'${untaught.has(o.id) ? ' (untaught)' : ''}`).join(', ')}`)
    }
  }

  // S7d
  const bw = activities.build_word
  for (const it of b.items.filter((x) => x.item_type === 'word')) {
    const item = { ...it, shown: [{ item_type: 'word', item_id: it.item_id }] }
    for (let seed = 1; seed <= 20; seed++) {
      let x = seed
      const spec = bw.build(item, b.distractors, () => ((x = (x * 16807) % 2147483647) / 2147483647))
      if (!spec) {
        fail(`${it.detail.lao}: cannot be built`)
        break
      }
      const letters = new Set(spec.pieces.map((p) => p.lao.replace(/◌/g, '')))
      const extras = spec.tiles.length - spec.pieces.length
      const wrong = spec.tiles.filter((tl) => !spec.pieces.some((p) => p.lao === tl.lao))
      if (wrong.length !== extras || wrong.some((tl) => letters.has(tl.lao.replace(/◌/g, '')))) fail(`${it.detail.lao}: a wrong tile shares a letter`)
    }
  }
  const newMark = b.items.some((it) => it.item_type === 'unit' && it.role === 'new' && it.detail?.kind === 'tone-mark')
  if (newMark && !one.steps.some((s) => s.activity === 'build_word')) fail('a new tone mark but no build the word')

  // L1c (a, b, e) on every build the word of the lesson's plan: a wrong tap then every piece is right in the end,
  // with the slip and every tap in detail; a found piece goes to its own slot; Check before complete is wrong.
  for (const spec of one.steps.filter((s) => s.activity === 'build_word' && !Number.isInteger(s.missing))) {
    const w = lao(spec)
    const pieceTile = (st, n) =>
      spec.tiles.findIndex((tl, ti) => tl.lao === spec.pieces[n].lao && !st.placed.includes(ti))
    const wrongTile = spec.tiles.findIndex((tl) => !spec.pieces.some((p) => p.lao === tl.lao))
    for (const strict of [false, true]) {
      const st = bwNewState(strict)
      if (wrongTile >= 0 && bwTap(spec, st, wrongTile) !== 'slip') fail(`${w}: a wrong tile was not a slip`)
      const last = spec.pieces.length - 1
      if (!strict && spec.pieces.filter((p) => p.lao === spec.pieces[last].lao).length === 1) {
        bwTap(spec, st, pieceTile(st, last))
        if (st.pieceOf[0] !== last) fail(`${w}: the last piece did not go to the last slot`)
      }
      for (let n = 0; n < spec.pieces.length; n++) if (!st.pieceOf.includes(n)) bwTap(spec, st, pieceTile(st, n))
      const [ans, ...parts] = bwAnswers(spec, st)
      if (ans.correct !== true) fail(`${w} (${strict ? 'strict' : 'any'}): right in the end but not correct`)
      const slips = strict ? (ans.detail.pieces[0].wrong || []) : ans.detail.stray
      if (wrongTile >= 0 && !slips.includes(spec.tiles[wrongTile].unit_id)) fail(`${w}: the slip is not in detail`)
      if (ans.detail.taps.length !== spec.pieces.length + (wrongTile >= 0 ? 1 : 0)) fail(`${w}: detail.taps does not list every tap`)
      if (parts.some((p) => p.role !== 'part')) fail(`${w}: a tone mark answer is not a part`)
      if (!fitDetail(ans.detail).taps) fail(`${w}: fitDetail drops taps`)
    }
    if (spec.pieces.length > 1) {
      const st = bwNewState(false)
      bwTap(spec, st, pieceTile(st, 0))
      if (!bwCheck(spec, st)) fail(`${w}: Check refused with one piece placed`)
      const [ans] = bwAnswers(spec, st)
      if (ans.correct !== false || !ans.detail.early || ans.detail.pieces.filter((p) => p.found).length !== 1) fail(`${w}: Check before complete is not a wrong, early answer`)
      if (bwTap(spec, st, pieceTile(st, 1)) !== null) fail(`${w}: a tap after Check was taken`)
    }
  }

  // L1e: find the missing piece, on every one in the lesson's plans
  for (let seed = 1; seed <= 20; seed++) {
    for (const spec of buildPlan(b, levels, seed, []).steps.filter((s) => Number.isInteger(s.missing))) {
      const w = lao(spec)
      const want = spec.pieces[spec.missing]
      const right = spec.tiles.findIndex((tl) => tl.lao === want.lao)
      const wrong = spec.tiles.findIndex((tl) => tl.lao !== want.lao)
      if (right < 0 || spec.tiles.length < 3) fail(`${w}: missing piece not among ${spec.tiles.length} tiles`)
      if (new Set(spec.tiles.map((tl) => tl.lao)).size !== spec.tiles.length) fail(`${w}: missing piece: two tiles with the same Lao`)
      const letters = new Set(spec.pieces.map((p) => p.lao.replace(/◌/g, '')))
      if (spec.tiles.some((tl) => tl.lao !== want.lao && letters.has(tl.lao.replace(/◌/g, '')))) fail(`${w}: missing piece: a wrong tile shares a letter with the word`)
      const units = new Set([...(b.distractors.units || []).map((u) => u.unit_id), ...spec.pieces.map((p) => p.unit_id)])
      if (spec.tiles.some((tl) => !units.has(tl.unit_id))) fail(`${w}: missing piece: a tile that is not a pool unit`)
      let st = bwNewState(false)
      if (bwTap(spec, st, right) !== 'placed') fail(`${w}: the missing piece was not placed`)
      let [ans] = bwAnswers(spec, st)
      if (ans.direction !== 'recognition') fail(`${w}: find the missing piece is not logged as recognition`)
      const kinds = spec.tiles.map((tl) => tl.kind)
      const sameKind = (b.distractors.units || []).filter((u) => u.kind && u.kind === want.kind && !spec.pieces.some((p) => p.lao.replace(/◌/g, '') === u.lao.replace(/◌/g, ''))).length
      if (want.kind && sameKind >= 4 && kinds.some((k) => k !== want.kind)) fail(`${w}: missing ${want.lao} (${want.kind}): a wrong tile of another kind although the pool has enough of its kind`)
      if (ans.correct !== true || ans.detail.mode !== 'missing' || ans.detail.pieces.length !== 1 || !ans.detail.pieces[0].found
        || ans.detail.given.length !== spec.pieces.length - 1) fail(`${w}: missing piece right: ${JSON.stringify(ans.detail)}`)
      st = bwNewState(false)
      if (bwCheck(spec, st)) fail(`${w}: Check taken in find the missing piece`)
      if (wrong >= 0) {
        bwTap(spec, st, wrong)
        ;[ans] = bwAnswers(spec, st)
        if (ans.correct !== false || ans.detail.pieces[0].found || !ans.detail.pieces[0].wrong.includes(spec.tiles[wrong].unit_id)) fail(`${w}: a wrong pick is not a wrong answer`)
        if (bwTap(spec, st, right) !== null) fail(`${w}: a tap after a wrong pick was taken`)
      }
      if (!fitDetail(ans.detail).given) fail(`${w}: fitDetail drops given`)
    }
  }

  // L1c (d): an equally right answer, from sentence_json.alternates (server: same English, only pronouns left out)
  if (id === 'L0009') {
    const sentenceSpec = (sid) => {
      const it = b.items.find((x) => x.item_id === sid)
      if (!it) return fail(`L0009: no ${sid}`)
      return activities.build_sentence.build({ ...it, shown: [{ item_type: 'sentence', item_id: sid }] }, b.distractors, () => 0.3)
    }
    const how = sentenceSpec('S000000007') // ເຈົ້າສະບາຍດີບໍ່? "How are you?"
    if (how) {
      const v = bsJudge(how, ['ສະບາຍດີ', 'ບໍ່'])
      if (!v.right || v.alt?.id !== 'S000000003') fail('S000000007: ສະບາຍດີບໍ່? is not accepted as also right')
      else if (bsLeftOut(how, v.alt).map((x) => x.lao).join() !== 'ເຈົ້າ') fail('S000000007: the note does not name ເຈົ້າ')
      if (!bsJudge(how, ['ເຈົ້າ', 'ສະບາຍດີ', 'ບໍ່']).right || bsJudge(how, ['ເຈົ້າ', 'ສະບາຍດີ', 'ບໍ່']).alt) fail('S000000007: the sentence itself')
      if (bsJudge(how, ['ສະບາຍດີ']).right || bsJudge(how, ['ບໍ່', 'ສະບາຍດີ']).right) fail('S000000007: a wrong answer accepted')
      else console.log(`  L1c ${lao(how)}: ສະບາຍດີບໍ່? also right (${how.alts.map((a) => a.id).join(', ')})`)
    }
    // ເຈົ້າ cannot be dropped here: no sentence without it says "Are you hungry?" with these words
    const hungry = sentenceSpec('S000002887') // ເຈົ້າຫິວເຂົ້າບໍ່?
    if (hungry && bsJudge(hungry, ['ຫິວ', 'ເຂົ້າ', 'ບໍ່']).right) fail('S000002887: ຫິວເຂົ້າບໍ່? accepted without ເຈົ້າ')
    const he = sentenceSpec('S000002886') // ລາວຫິວເຂົ້າ.
    if (he && bsJudge(he, ['ຫິວ', 'ເຂົ້າ']).right) fail('S000002886: ຫິວເຂົ້າ accepted without ລາວ')
  }
}

// L1c (c): "Your answer" over "Right answer" lines up word by word
{
  const cols = (y, r) => cmpAlign(y, r).map((c) => `${c.you ?? '_'}/${c.right ?? '_'}`).join(' ')
  const cases = [
    [['ກິນ', 'ເຂົ້າ'], ['ລາວ', 'ກິນ', 'ເຂົ້າ'], '_/ລາວ ກິນ/ກິນ ເຂົ້າ/ເຂົ້າ'],
    [['ລາວ', 'ນ້ຳ', 'ເຂົ້າ'], ['ລາວ', 'ກິນ', 'ເຂົ້າ'], 'ລາວ/ລາວ ນ້ຳ/ກິນ ເຂົ້າ/ເຂົ້າ'],
    [['ເຂົ້າ', 'ລາວ', 'ກິນ'], ['ລາວ', 'ກິນ', 'ເຂົ້າ'], 'ເຂົ້າ/_ ລາວ/ລາວ ກິນ/ກິນ _/ເຂົ້າ'],
    [['ລາວ', 'ກິນ', 'ເຂົ້າ', 'ແລ້ວ'], ['ລາວ', 'ກິນ', 'ເຂົ້າ'], 'ລາວ/ລາວ ກິນ/ກິນ ເຂົ້າ/ເຂົ້າ ແລ້ວ/_'],
  ]
  for (const [y, r, want] of cases) if (cols(y, r) !== want) fail(`align ${y.join(' ')}: ${cols(y, r)}, want ${want}`)
  if (cmpKind({ you: null, right: 'ກ' }) !== 'missing' || cmpKind({ you: 'ກ', right: 'ຂ' }) !== 'swap') fail('compare kinds')
}

// L1d (c): missed ເຂົ້າ after ຫິວ (W000072 then W000019 in the answer) gets the "hungry needs ເຂົ້າ" note
{
  const w = (lao, word_id, position) => ({ lao, word_id, position })
  const heHungry = [w('ລາວ', 'W000031', 1), w('ຫິວ', 'W000072', 2), w('ເຂົ້າ', 'W000019', 3)]
  const info = new Map([['W000072', { respelling: 'hiw' }], ['W000019', { respelling: 'kao' }]])
  const keys = (placed, words = heHungry) => pairNotes(words, placed, info).map((n) => n.key).join(',')
  const n = pairNotes(heHungry, ['ລາວ', 'ຫິວ'], info)[0]
  if (!n || n.key !== 'cmp_pair_hiw_kao' || n.pair.lao !== 'ຫິວເຂົ້າ' || n.pair.sound !== 'hiw kao' || n.next.lao !== 'ເຂົ້າ')
    fail(`pair note for ລາວ ຫິວ: ${JSON.stringify(n)}`)
  if (keys(['ລາວ', 'ຫິວ', 'ນ້ຳ']) !== 'cmp_pair_hiw_kao') fail('pair note: ຫິວ ນ້ຳ for ຫິວເຂົ້າ')
  if (keys(['ລາວ', 'ເຂົ້າ', 'ຫິວ']) !== 'cmp_pair_hiw_kao') fail('pair note: ເຂົ້າ before ຫິວ')
  if (keys(['ຫິວ', 'ເຂົ້າ', 'ລາວ'])) fail('pair note shown although ເຂົ້າ follows ຫິວ')
  if (keys(['ລາວ', 'ເຂົ້າ'])) fail('pair note shown without ຫິວ in the answer')
  const thirsty = [w('ລາວ', 'W000031', 1), w('ຫິວ', 'W000072', 2), w('ນ້ຳ', 'W000011', 3)]
  if (keys(['ລາວ', 'ຫິວ'], thirsty)) fail('pair note shown for ຫິວນ້ຳ (the answer has no ເຂົ້າ after ຫິວ)')
}

// L1e: a word's first build is in the lesson that teaches it; long words get find the missing piece first.
{
  const intro = new Map() // word id -> the bundle that teaches it (role new or bonus)
  for (const b of bundles) for (const it of b.items) if (it.item_type === 'word' && it.role !== 'recycle') intro.set(it.item_id, b)
  const fullBuild = (s) => s.activity === 'build_word' && !Number.isInteger(s.missing)
  // a card can stand for two words (ລາວ he/she and Lao): a step on it counts for each
  const shows = (s, id) => s.item.item_id === id || (s.item.shown || []).some((x) => x.item_id === id)
  const builtInOwn = new Map() // word id -> built in its own lesson for every seed
  const ownBuilds = (id) => {
    if (builtInOwn.has(id)) return builtInOwn.get(id)
    const b = intro.get(id)
    let ok = !!b
    for (let seed = 1; ok && seed <= 50; seed++) ok = buildPlan(b, dryLevels(b), seed, []).steps.some((s) => fullBuild(s) && shows(s, id))
    builtInOwn.set(id, ok)
    return ok
  }
  let longWords = 0
  for (const b of bundles) {
    const levels = dryLevels(b)
    for (let seed = 1; seed <= 50; seed++) {
      const steps = buildPlan(b, levels, seed, []).steps
      for (const s of steps.filter(fullBuild)) {
        const it = b.items.find((x) => x.item_type === 'word' && x.item_id === s.item.item_id)
        if (it?.role === 'recycle' && !ownBuilds(it.item_id)) fail(`L1e: ${lao(s)} first built in ${b.lesson.lesson_id}, not in its own lesson ${intro.get(it.item_id)?.lesson.lesson_id ?? '(no bundle)'}`)
      }
      for (const it of b.items.filter((x) => x.item_type === 'word' && x.role === 'new')) {
        const build = steps.findIndex((s) => fullBuild(s) && shows(s, it.item_id))
        if (build < 0 && activities.build_word.build({ ...it, shown: [] }, b.distractors, () => 0.5)) fail(`L1e: new word ${it.detail.lao} is not built in ${b.lesson.lesson_id}`)
        if ((it.detail?.syllables || []).length < 3) continue
        if (seed === 1) longWords++
        const miss = steps.findIndex((s) => Number.isInteger(s.missing) && shows(s, it.item_id))
        if (miss < 0 || build < 0 || miss > build) fail(`L1e: long word ${it.detail.lao} in ${b.lesson.lesson_id}: missing piece at ${miss}, full build at ${build}`)
      }
    }
  }
  if (!longWords) fail('L1e: no long new word in the bundles (expected ສະບາຍດີ in L0008)')

  // The kept builds never push out a new unit's second form (sound -> letter) or a shared card's other meaning.
  for (const b of bundles) {
    const units = b.items.filter((x) => x.item_type === 'unit' && x.role === 'new' && activities.multiple_choice.build(
      { ...x, shown: [{ item_type: 'unit', item_id: x.item_id }] }, b.distractors, () => 0.5, { form: 'unit_letter' }))
    for (let seed = 1; seed <= 50; seed++) {
      const steps = buildPlan(b, dryLevels(b), seed, []).steps
      for (const u of units) {
        if (!steps.some((s) => s.form === 'unit_letter' && shows(s, u.item_id))) fail(`L1e: new unit ${u.detail?.lao ?? u.item_id} has no sound -> letter in ${b.lesson.lesson_id}`)
      }
      for (const s of steps.filter((x) => x.activity === 'teach_card' && x.item?.item_type === 'word' && (x.item.shown || []).length > 1 && x.item.role === 'new')) {
        // its check plus one Lao -> meaning per other meaning
        const asked = steps.filter((y) => y.form === 'word_meaning' && y.item === s.item).length
        if (asked < s.item.shown.length) fail(`L1e: ${lao(s)}: ${asked} Lao -> meaning for ${s.item.shown.length} meanings in ${b.lesson.lesson_id}`)
      }
    }
  }

  // piecesFirst: a build planned before its missing piece swaps with it, whatever lies between
  const X = { item_id: 'W1' }
  const Y = { item_id: 'W2' }
  const order = piecesFirst([
    { activity: 'build_word', item: X, tag: 'build' },
    { activity: 'listen_pick', item: Y, tag: 'listen' },
    { activity: 'build_word', item: X, missing: 2, tag: 'missing' },
  ]).map((x) => x.tag).join(' ')
  if (order !== 'missing listen build') fail(`piecesFirst: ${order}`)
  const kept = piecesFirst([
    { activity: 'build_word', item: X, missing: 0, tag: 'missing' },
    { activity: 'build_word', item: X, tag: 'build' },
  ]).map((x) => x.tag).join(' ')
  if (kept !== 'missing build') fail(`piecesFirst moved a right order: ${kept}`)
}

// A7 steps 3-4 review: the summary's next lesson is the lowest order above this one that is not locked (orders may
// have gaps); home's Continue picks a usable resume record, a lesson not done before a done one replayed, then newest.
{
  const { pickNextLesson, resumableLesson } = await import(js('session.js'))
  const { APP_VERSION } = await import(js('version.js'))
  const rows = [
    { lesson_id: 'A', lesson_order: 1, state: 'done' },
    { lesson_id: 'C', lesson_order: 4, state: 'open' },
    { lesson_id: 'B', lesson_order: 3, state: 'locked' },
    { lesson_id: 'D', lesson_order: 6, state: 'open' },
  ]
  const nextOf = (o) => pickNextLesson(rows, o)?.lesson_id ?? null
  if (nextOf(1) !== 'C' || nextOf(4) !== 'D' || nextOf(6) !== null) fail(`pickNextLesson: ${nextOf(1)} ${nextOf(4)} ${nextOf(6)}`)

  const d = new Date()
  const p2 = (n) => String(n).padStart(2, '0')
  const today = `${d.getFullYear()}-${p2(d.getMonth() + 1)}-${p2(d.getDate())}`
  const rec = (at, extra = {}) => ({ v: 1, app: APP_VERSION, at, day: today, sessionId: 'x', seed: 1, planned: 3, levels: [], step: 1, missed: [], pending: [], ...extra })
  const store = new Map()
  const saved = globalThis.localStorage
  globalThis.localStorage = { getItem: (k) => store.get(k) ?? null, setItem: (k, v) => store.set(k, v), removeItem: (k) => store.delete(k) }
  const put = (id, r) => store.set(`laophabet.resume.u.${id}`, JSON.stringify(r))
  const pick = () => resumableLesson('u', [
    { lesson_id: 'L1', state: 'done' },
    { lesson_id: 'L2', state: 'done' },
    { lesson_id: 'L4', state: 'open' },
    { lesson_id: 'L5', state: 'open' },
  ])
  put('L1', rec(100)) // replayed done L1 and left, then started L4 and left
  put('L4', rec(200))
  if (pick() !== 'L4') fail(`resumableLesson: replayed done L1 beat L4: ${pick()}`)
  put('L1', rec(300)) // a done lesson is still second to one not done, even when newer
  if (pick() !== 'L4') fail('resumableLesson: a newer done lesson beat an open one')
  put('L5', rec(250)) // two not done: the newer
  if (pick() !== 'L5') fail('resumableLesson: not the newest open lesson')
  put('L5', rec(400, { day: '2000-01-01' })) // yesterday's record does not count
  put('L4', rec(500, { pending: [{}] })) // nor one resume() would throw away
  if (pick() !== 'L1') fail(`resumableLesson: a stale or broken record counted: ${pick()}`)
  store.clear()
  put('L1', rec(undefined)) // a record from before `at` counts as oldest
  put('L2', rec(10))
  if (pick() !== 'L2') fail(`resumableLesson: a record without at: ${pick()}`)
  globalThis.localStorage = saved
}

// ------------------------------------------------------------------ S8b practice plans
// A practice bundle in start_practice's shape is built from the lesson bundles: a learner who has done lessons
// 1..n has reached every unit, word and sentence of those lessons (no rules; tone marks are never sent), at a random
// level 1-3, in a random practice order; the pool is lesson n's (start_practice uses the furthest completed lesson's
// get_lesson distractors). Checks over many seeds: no teach card; never one item twice in a row; a level-1 unit or
// word gets recognition only; a word at level >= 2 starts with recall where meaning -> Lao can be built; at most 12
// items, at most 3 questions per item and 20 answers, at least 15 once 8 items can be asked about; no item below
// level 1; the same seed gives the same plan. noRepeat moves or drops a step that would repeat its item.
{
  const { planPractice, noRepeat } = await import(js('session.js'))
  console.log('== practice (S8b)')
  const KEY = (x) => `${x.item_type}:${x.item_id}`
  const lcg = (seed) => {
    let a = seed >>> 0
    return () => ((a = (Math.imul(a, 1664525) + 1013904223) >>> 0) / 4294967296)
  }
  const lengths = []
  for (const b of bundles) {
    const order = b.lesson.lesson_order
    const reached = new Map()
    for (const o of bundles.filter((x) => x.lesson.lesson_order <= order)) {
      for (const it of o.items) {
        if (it.item_type === 'rule' || (it.item_type === 'unit' && it.detail?.kind === 'tone-mark')) continue
        if (!reached.has(KEY(it))) reached.set(KEY(it), it)
      }
    }
    const lens = []
    for (let seed = 1; seed <= SEEDS; seed++) {
      const r = lcg(seed * 7919 + order)
      const all = [...reached.values()].map((it) => ({ it, k: r() })).sort((x, y) => x.k - y.k)
      const items = all.slice(0, 12).map(({ it }, n) => ({ position: n + 1, item_type: it.item_type, item_id: it.item_id, role: 'review', detail: it.detail }))
      const levels = all.map(({ it }) => ({ item_type: it.item_type, item_id: it.item_id, level: 1 + Math.floor(r() * 3) }))
      const pb = { lesson: { kind: 'practice' }, items, distractors: b.distractors, levels }
      const lv = new Map(levels.map((l) => [`${l.item_type}:${l.item_id}`, l.level]))
      const plan = buildPlan(pb, levels, seed, [], planPractice)
      const again = buildPlan(pb, levels, seed, [], planPractice)
      if (strip(plan.steps) !== strip(again.steps)) fail(`practice ${order}: the same seed gave different plans`)
      const steps = plan.steps
      lens.push(steps.length)
      const ids = steps.map((s) => KEY(s.item))
      const distinct = new Set(ids)
      if (steps.some((s) => s.activity === 'teach_card')) fail(`practice ${order}: a teach card`)
      if (distinct.size > 12) fail(`practice ${order}: ${distinct.size} items (max 12)`)
      if (steps.length > 20) fail(`practice ${order}: ${steps.length} answers (max 20)`)
      if (distinct.size >= 8 && steps.length < 15) fail(`practice ${order}: only ${steps.length} answers from 8 items`)
      for (const k of distinct) if (ids.filter((x) => x === k).length > 3) fail(`practice ${order}: ${k} asked more than 3 times`)
      if (distinct.size > 1) ids.forEach((k, i) => i && k === ids[i - 1] && fail(`practice ${order}: ${k} twice in a row`))
      for (const s of steps) {
        const level = lv.get(KEY(s.item)) || 0
        if (level < 1) fail(`practice ${order}: ${KEY(s.item)} at level 0`)
        if (level === 1 && s.item.item_type !== 'sentence' && s.direction !== 'recognition') {
          fail(`practice ${order}: level-1 ${KEY(s.item)} got ${s.activity} (${s.direction})`)
        }
      }
      for (const k of distinct) {
        const first = steps.find((s) => KEY(s.item) === k)
        if (first.item.item_type !== 'word' || (lv.get(k) || 0) < 2 || first.direction === 'recall') continue
        if (activities.multiple_choice.build(first.item, b.distractors, () => 0.5, { form: 'word_lao' })) {
          fail(`practice ${order}: level-${lv.get(k)} ${k} starts with ${first.activity}:${first.form || ''} (recognition)`)
        }
      }
    }
    lengths.push(`${order}: ${Math.min(...lens)}-${Math.max(...lens)}`)
  }
  console.log(`  answers per plan (lessons done: min-max) ${lengths.join(' · ')}`)
  const st = (id) => ({ item: { item_type: 'word', item_id: id } })
  const order = (list) => noRepeat(list).map((s) => s.item.item_id).join('')
  if (order([st('A'), st('A'), st('B')]) !== 'ABA') fail(`noRepeat AAB -> ${order([st('A'), st('A'), st('B')])}`)
  if (order([st('A'), st('B'), st('B')]) !== 'AB') fail(`noRepeat ABB -> ${order([st('A'), st('B'), st('B')])} (no place after B's first: dropped)`)
  if (order([st('A'), st('B'), st('C'), st('C')]) !== 'ABC') fail(`noRepeat ABCC -> ${order([st('A'), st('B'), st('C'), st('C')])}`)
  if (order([st('B'), st('A'), st('C'), st('B'), st('B')]) !== 'BABCB') fail(`noRepeat BACBB -> ${order([st('B'), st('A'), st('C'), st('B'), st('B')])}`)
  if (order([st('A'), st('A')]) !== 'A') fail('noRepeat AA should drop the second A')
}

// H2/H3: Spelling practice off plans no build the word or find the missing piece (a recycled word never gets one);
// on, only a new word is built in a lesson; with it off every lesson stays within the effort budget.
{
  const { effort, BUDGET } = await import(js('session.js'))
  console.log('== H2/H3 spelling and effort budget')
  for (const b of bundles) {
    for (let seed = 1; seed <= 50; seed++) {
      b.spelling = false
      const off = buildPlan(b, dryLevels(b), seed, []).steps
      if (off.some((s) => s.activity === 'build_word')) fail(`H3: ${b.lesson.lesson_id} plans a build with Spelling practice off`)
      const points = off.reduce((n, s) => n + effort(s), 0)
      if (points > BUDGET) fail(`H2: ${b.lesson.lesson_id} is ${points} points (seed ${seed}), over ${BUDGET}`)
      b.spelling = true
      for (const s of buildPlan(b, dryLevels(b), seed, []).steps.filter((x) => x.activity === 'build_word')) {
        const it = b.items.find((x) => x.item_type === 'word' && x.item_id === s.item.item_id)
        if (it?.role === 'recycle') fail(`H3: ${b.lesson.lesson_id} builds the recycled word ${lao(s)}`)
      }
    }
    b.spelling = true
  }
}
// H4: a checkpoint plans one hardest-form question per item, none with a hint, within the effort budget; with
// Spelling practice off none is a build the word. Items stand in for start_checkpoint's: every item of lessons 1-10.
{
  const { planCheckpoint, CHECKPOINT_BUDGET, effort } = await import(js('session.js'))
  console.log('== H4 checkpoint plan')
  const sec = bundles.filter((b) => Number(b.lesson.lesson_order) <= 10)
  const last = sec[sec.length - 1]
  const seen = new Set()
  const items = []
  for (const b of sec) for (const it of b.items) {
    const k = `${it.item_type}:${it.item_id}`
    if (!['unit', 'word', 'sentence'].includes(it.item_type) || seen.has(k) || !it.detail) continue
    seen.add(k)
    items.push({ ...it, role: 'review' })
  }
  const levels = dryLevels({ ...last, items })
  for (const spelling of [false, true]) {
    for (let seed = 1; seed <= 30; seed++) {
      const cp = { lesson: { kind: 'checkpoint' }, items, distractors: last.distractors, levels, spelling }
      const steps = buildPlan(cp, levels, seed, [], planCheckpoint).steps
      if (steps.length < 15) fail(`H4: only ${steps.length} questions (spelling ${spelling}, seed ${seed})`)
      if (steps.some((s) => !s.noHint)) fail('H4: a checkpoint question allows a hint')
      if (!spelling && steps.some((s) => s.activity === 'build_word')) fail('H4: a build with Spelling practice off')
      if (steps.reduce((n, s) => n + effort(s), 0) > CHECKPOINT_BUDGET + 2) fail('H4: over the checkpoint budget')
    }
  }
}
// A12: active time counts the gaps between taps, each capped at a minute; only the unsent part is reported.
{
  const { newClock, tick, unsent } = await import(js('active_time.js'))
  const c = newClock(0)
  tick(c, 5000) // 5 s
  tick(c, 5000 + 3 * 60000) // a 3 minute pause counts as 60 s
  if (c.ms !== 65000) fail(`A12: active ms ${c.ms}, expected 65000`)
  c.sent = 40000
  if (unsent(c) !== 25000) fail(`A12: unsent ${unsent(c)}, expected 25000`)
}
console.log(errors ?`\n${errors} failure(s)` : '\nall checks passed')
process.exit(errors ? 1 : 0)
