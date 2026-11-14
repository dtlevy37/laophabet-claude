import { register } from 'node:module'
import { readFileSync, readdirSync } from 'node:fs'
import { join, resolve } from 'node:path'
import { pathToFileURL } from 'node:url'
register('data:text/javascript,' + encodeURIComponent(`export async function resolve(spec, ctx, next) {
  if (spec.startsWith('https:')) return { url: 'data:text/javascript,export const createClient = () => null', shortCircuit: true }
  return next(spec, ctx) }`))
globalThis.document = { documentElement: { style: { setProperty() {} } } }
globalThis.localStorage = { getItem: () => null, setItem() {}, removeItem() {} }
const root = resolve(import.meta.dirname, '..')
const js = (p) => pathToFileURL(join(root, 'app/frontend/js', p)).href
const { buildPlan, dryLevels, effort } = await import(js('session.js'))
const dir = process.argv[2] ? resolve(process.argv[2]) : join(root, 'tmp/bundles')
const files = readdirSync(dir).filter((f) => /^L\d+\.json$/.test(f)).sort()
// Usage: node scripts/measure_lessons.mjs [bundles dir]   (bundles as for session_test.mjs)
// Prints steps and effort points per lesson (worst of 5 seeds), Spelling practice off and on.
const rows = []
for (const f of files) {
  const b = JSON.parse(readFileSync(join(dir, f), 'utf8'))
  const lv = dryLevels(b)
  const cells = []
  for (const spelling of [false, true]) {
    b.spelling = spelling
    const runs = [1, 2, 3, 4, 5].map((seed) => buildPlan(b, lv, seed, []).steps)
    const pts = runs.map((r) => r.reduce((n, x) => n + effort(x), 0))
    const builds = runs[0].filter((x) => x.activity === 'build_word').length
    cells.push(`${Math.min(...runs.map((r) => r.length))}-${Math.max(...runs.map((r) => r.length))} steps ${Math.max(...pts).toFixed(1)} pts ${builds} builds`)
  }
  rows.push(`${f.replace('.json', '')}  off: ${cells[0].padEnd(34)} on: ${cells[1]}`)
}
console.log(rows.join('\n'))
