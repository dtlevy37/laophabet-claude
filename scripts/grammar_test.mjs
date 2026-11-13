// Tests the word-order rule notes (app/frontend/js/grammar.js, A2) in node.
// Usage (from the project root): node scripts/grammar_test.mjs
// The sentences and word data below are copied from lesson 7's bundle (get_lesson); when tmp/bundles/L0007.json is
// present the test also checks that they still match it.
import { existsSync, readFileSync } from 'node:fs'
import { join, resolve } from 'node:path'
import { pathToFileURL } from 'node:url'

const root = resolve(import.meta.dirname, '..')
const { ruleNotes, noteParams, wordInfo } = await import(pathToFileURL(join(root, 'app/frontend/js/grammar.js')).href)

let failures = 0
const check = (name, ok, got) => {
  if (ok) console.log(`ok   ${name}`)
  else {
    failures++
    console.log(`FAIL ${name}: ${JSON.stringify(got)}`)
  }
}

const W = {
  W000002: { lao: 'ດີ', pos: 'adjective', cats: ['quality'], respelling: 'dii', gloss_en: 'good' },
  W000003: { lao: 'ບໍ່', pos: 'particle', cats: ['function'], respelling: 'baw', gloss_en: 'no; not; yes/no question marker' },
  W000009: { lao: 'ຂໍ', pos: 'verb', cats: ['action', 'consume', 'motion', 'object', 'quality'], respelling: 'kaw', gloss_en: 'ask for, request; may I have' },
  W000011: { lao: 'ນ້ຳ', pos: 'noun', cats: ['drink'], respelling: 'nam', gloss_en: 'water; liquid' },
  W000016: { lao: 'ນີ້', pos: 'pronoun; adverb', cats: ['function'], respelling: 'nii', gloss_en: 'this; here' },
  W000020: { lao: 'ແລ້ວ', pos: 'auxiliary; adverb; verb', cats: ['function'], respelling: 'laew', gloss_en: 'already, done; then' },
  W001426: { lao: 'ແນ່', pos: 'particle', cats: ['function'], respelling: 'nae', gloss_en: 'please (softens a request)' },
}
const bundle = { distractors: { words: Object.entries(W).map(([word_id, w]) => ({ word_id, ...w })) }, items: [] }
const info = wordInfo(bundle)
const sentence = (...ids) => ids.map((id, n) => ({ lao: W[id].lao, word_id: id, gloss_en: W[id].gloss_en, position: n + 1 }))
const laos = (...ids) => ids.map((id) => (W[id] ? W[id].lao : id))
const keys = (notes) => notes.map((n) => n.key)
const same = (a, b) => JSON.stringify(a) === JSON.stringify(b)

// S000002884 ຂໍນ້ຳນີ້ແນ່ (kaw nam nii nae) "May I have this water, please?"
const water = sentence('W000009', 'W000011', 'W000016', 'W001426')
let notes = ruleNotes(water, laos('W000009', 'W000016', 'W000011', 'W001426'), info)
check('ຂໍ ນີ້ ນ້ຳ ແນ່ -> describer note', same(keys(notes), ['rule_describer_after']), notes)
const p = notes[0] && noteParams(notes[0], info)
check('describer note example', p && p.ex === 'ນ້ຳນີ້ (nam nii)' && p.gloss === 'water this', p)
check('ຂໍ ນ້ຳ ນີ້ ແນ່ (right) -> no note', ruleNotes(water, laos('W000009', 'W000011', 'W000016', 'W001426'), info).length === 0)
notes = ruleNotes(water, laos('W000009', 'W000011', 'W001426', 'W000016'), info)
check('ແນ່ not last -> softener note', same(keys(notes), ['rule_softener_end']), notes)
notes = ruleNotes(water, laos('W000009', 'W000016'), info)
check('short answer without ນ້ຳ -> no describer note', notes.length === 0, notes)
notes = ruleNotes(water, laos('W000009', 'W000016', 'W000011', 'W001426', 'ດາວ'), info)
check('extra tile at the end -> describer note only', same(keys(notes), ['rule_describer_after']), notes)

// S000000004 ບໍ່ດີ (baw dii) "(It's) not good."
const notGood = sentence('W000003', 'W000002')
notes = ruleNotes(notGood, laos('W000002', 'W000003'), info)
check('ດີ ບໍ່ for "not good" -> not-before note', same(keys(notes), ['rule_not_before']), notes)
check('ບໍ່ ດີ (right) -> no note', ruleNotes(notGood, laos('W000003', 'W000002'), info).length === 0)

// S000000002 ດີບໍ່? (dii baw?) "Is it good?"
const isGood = sentence('W000002', 'W000003')
notes = ruleNotes(isGood, laos('W000003', 'W000002'), info)
check('ບໍ່ ດີ for "is it good?" -> question note', same(keys(notes), ['rule_question_end']), notes)
check('ດີ ບໍ່ (right) -> no note', ruleNotes(isGood, laos('W000002', 'W000003'), info).length === 0)

// S000002882 ດີແລ້ວ (dii laew) "That's fine."
const fine = sentence('W000002', 'W000020')
notes = ruleNotes(fine, laos('W000020', 'W000002'), info)
check('ແລ້ວ ດີ -> already note', same(keys(notes), ['rule_already_after']), notes)

// S000002883 ນ້ຳນີ້ດີ (nam nii dii) "This water is good." Fully reversed: one describer note, not two.
const goodWater = sentence('W000011', 'W000016', 'W000002')
notes = ruleNotes(goodWater, laos('W000002', 'W000016', 'W000011'), info)
check('ດີ ນີ້ ນ້ຳ -> one describer note', same(keys(notes), ['rule_describer_after']), notes)
// ນີ້ is a pronoun there, so ດີ after it is a predicate, not a describer of a thing (A2 review).
notes = ruleNotes(goodWater, laos('W000011', 'W000002', 'W000016'), info)
check('ນ້ຳ ດີ ນີ້ -> no describer note (pronoun ນີ້)', !keys(notes).includes('rule_describer_after'), notes)
check('no info -> no describer note', ruleNotes(water, laos('W000009', 'W000016', 'W000011', 'W001426')).length === 0)

// The data above still matches lesson 7's bundle (when one has been saved).
const saved = join(root, 'tmp/bundles/L0007.json')
if (existsSync(saved)) {
  const b = JSON.parse(readFileSync(saved, 'utf8'))
  const real = wordInfo(b)
  for (const [id, w] of Object.entries(W)) {
    const r = real.get(id)
    check(`bundle ${id}`, r && r.lao === w.lao && r.pos === w.pos && same(r.cats, w.cats), r)
  }
  const s = b.items.find((i) => i.item_id === 'S000002884')?.detail
  check('bundle S000002884 words', s && same(s.words.map((w) => w.word_id), water.map((w) => w.word_id)), s?.words)
  notes = s ? ruleNotes(s.words, laos('W000009', 'W000016', 'W000011', 'W001426'), real) : []
  check('bundle S000002884 -> describer note', same(keys(notes), ['rule_describer_after']), notes)
} else console.log('skip bundle checks (no tmp/bundles/L0007.json)')

if (failures) {
  console.log(`${failures} failed`)
  process.exit(1)
}
console.log('all passed')
