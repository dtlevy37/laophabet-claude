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
const { fitDetail } = await import(js('session.js'))
const {
  newState: bwNewState,
  tapTile: bwTap,
  checkEarly: bwCheck,
  answersFor: bwAnswers,
} = await import(js('activities/build_word.js'))
const { judge: bsJudge, leftOut: bsLeftOut } = await import(js('activities/build_sentence.js'))
const { align: cmpAlign, kindOf: cmpKind } = await import(js('activities/compare.js'))

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

  console.log('  ' + one.steps.map((s) => `${s.activity}${s.form ? ':' + s.form : ''}(${lao(s)})`).join(' · '))

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
  for (const spec of one.steps.filter((s) => s.activity === 'build_word')) {
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

console.log(errors ? `\n${errors} failure(s)` : '\nall checks passed')
process.exit(errors ? 1 : 0)
