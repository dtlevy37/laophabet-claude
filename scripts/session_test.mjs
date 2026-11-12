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
// Plans use the dry-run levels (a learner who has done the lessons before), as #/try/<id> does.
import { register } from 'node:module'
import { readdirSync, readFileSync } from 'node:fs'
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

const dir = resolve(process.argv[2] || join(root, 'tmp/bundles'))
const bundles = readdirSync(dir)
  .filter((f) => /^L\d{4}\.json$/.test(f))
  .sort()
  .map((f) => JSON.parse(readFileSync(join(dir, f), 'utf8')))
if (!bundles.length) throw new Error(`no bundles in ${dir}`)

let errors = 0
const fail = (msg) => {
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

  // S7e
  const recycledSentences = b.items.filter((it) => it.item_type === 'sentence' && it.role === 'recycle')
  let blanks = 0
  for (let seed = 1; seed <= SEEDS; seed++) {
    for (const s of buildPlan(b, levels, seed, []).steps) {
      if (s.activity !== 'fill_blank') continue
      blanks++
      const words = s.item.detail.words
      const before = words.find((w) => w.position === s.position - 1)
      if (before?.lao === 'ກິນ' && s.options.some((o) => o.lao === 'ນ້ຳ')) fail(`${lao(s)}: ນ້ຳ offered after ກິນ`)
      if (new Set(s.options.map((o) => o.lao)).size !== s.options.length) fail(`${lao(s)}: two options with the same Lao`)
      if (s.options.length < 3) fail(`${lao(s)}: fewer than 3 options`)
    }
  }
  if (recycledSentences.length && !blanks) fail('a recycled sentence but no fill in the blank')
  if (recycledSentences.length) {
    const s = buildPlan(b, levels, 5, []).steps.find((x) => x.activity === 'fill_blank')
    if (s) console.log(`  fill_blank ${lao(s)} gap at ${s.position}: ${s.options.map((o) => o.lao).join(' ')} (answer ${s.answer.lao})`)
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
}

console.log(errors ? `\n${errors} failure(s)` : '\nall checks passed')
process.exit(errors ? 1 : 0)
