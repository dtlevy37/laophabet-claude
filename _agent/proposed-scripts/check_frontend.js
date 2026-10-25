// check_frontend.js: static checks for app/frontend (the agent cannot run the app or node --check directly).
//
// Usage (from the project root):
//   node approved-scripts/check_frontend.js [--root app/frontend] [--unused]
//
// Checks, for every .js file under <root>/js (recursively):
//   1. Syntax: copies the file to _agent/tmp/jscheck/<name>.mjs and runs `node --check` on the copy
//      (.mjs so ES module syntax is always accepted). Nothing in the copy is executed.
//   2. Relative imports: the target file exists, and every named import { a, b as c } is exported by it
//      (export function/const/let/class/async function, export { x, y as z }). `export *` and default
//      imports are not checked.
//   3. Strings: strings.json parses; every t('key') / tIn(lang, 'key') key exists; every entry has `en`.
//      --unused also lists keys that no file references literally (some may be built dynamically).
// Exit code 0 when no errors, 1 otherwise. Warnings never fail the run.
'use strict'
const fs = require('node:fs')
const path = require('node:path')
const { spawnSync } = require('node:child_process')

const args = process.argv.slice(2)
const rootArg = args.includes('--root') ? args[args.indexOf('--root') + 1] : path.join('app', 'frontend')
const showUnused = args.includes('--unused')
const root = path.resolve(rootArg)
const jsDir = path.join(root, 'js')
const tmpDir = path.resolve('_agent', 'tmp', 'jscheck')

const errors = []
const warnings = []
const rel = (p) => path.relative(process.cwd(), p).split(path.sep).join('/')

function listJs(dir) {
  const out = []
  for (const e of fs.readdirSync(dir, { withFileTypes: true })) {
    const p = path.join(dir, e.name)
    if (e.isDirectory()) out.push(...listJs(p))
    else if (e.name.endsWith('.js')) out.push(p)
  }
  return out
}

// Comments removed so commented-out imports and t() calls are ignored. Crude but enough for this codebase:
// it does not try to handle '//' inside strings except URLs written as '://'.
function stripComments(src) {
  return src.replace(/\/\*[\s\S]*?\*\//g, '').replace(/(^|[^:'"`])\/\/.*$/gm, '$1')
}

function exportsOf(src) {
  const names = new Set()
  for (const m of src.matchAll(/export\s+(?:async\s+)?(?:function\*?|const|let|var|class)\s+([A-Za-z_$][\w$]*)/g)) names.add(m[1])
  for (const m of src.matchAll(/export\s*\{([^}]*)\}/g)) {
    for (const part of m[1].split(',')) {
      const name = part.trim().split(/\s+as\s+/).pop().trim()
      if (name) names.add(name)
    }
  }
  if (/export\s+default\b/.test(src)) names.add('default')
  return names
}

if (!fs.existsSync(jsDir)) {
  console.error(`No js folder at ${rel(jsDir)}`)
  process.exit(1)
}
const files = listJs(jsDir)
fs.mkdirSync(tmpDir, { recursive: true })

// 1. syntax
for (const f of files) {
  const copy = path.join(tmpDir, rel(f).replace(/[\\/]/g, '__') + '.mjs')
  fs.copyFileSync(f, copy)
  const r = spawnSync(process.execPath, ['--check', copy], { encoding: 'utf8' })
  if (r.status !== 0) {
    const msg = (r.stderr || '').split('\n').filter((l) => l.trim()).slice(0, 6).join('\n    ')
    errors.push(`${rel(f)}: syntax error\n    ${msg.split(copy).join(rel(f))}`)
  }
}

// 2. imports
const sources = new Map(files.map((f) => [f, stripComments(fs.readFileSync(f, 'utf8'))]))
for (const [f, src] of sources) {
  for (const m of src.matchAll(/import\s+([\s\S]*?)\s+from\s+['"](\.{1,2}\/[^'"]+)['"]/g)) {
    const target = path.resolve(path.dirname(f), m[2])
    if (!fs.existsSync(target)) {
      errors.push(`${rel(f)}: import target not found: ${m[2]}`)
      continue
    }
    if (!target.endsWith('.js')) continue
    const named = m[1].match(/\{([^}]*)\}/)
    if (!named) continue
    const available = exportsOf(sources.get(target) ?? stripComments(fs.readFileSync(target, 'utf8')))
    for (const part of named[1].split(',')) {
      const name = part.trim().split(/\s+as\s+/)[0].trim()
      if (name && !available.has(name)) errors.push(`${rel(f)}: '${name}' is not exported by ${m[2]}`)
    }
  }
}

// 3. strings
const stringsPath = path.join(jsDir, 'strings.json')
let strings = null
try {
  strings = JSON.parse(fs.readFileSync(stringsPath, 'utf8'))
} catch (e) {
  errors.push(`${rel(stringsPath)}: ${e.message}`)
}
if (strings) {
  for (const [k, v] of Object.entries(strings)) {
    if (!v || typeof v !== 'object' || typeof v.en !== 'string' || !v.en.trim()) errors.push(`strings.json: '${k}' has no en text`)
  }
  const used = new Set()
  for (const [f, src] of sources) {
    for (const m of src.matchAll(/\bt(?:In)?\(\s*(?:[^,()'"`]+,\s*)?['"]([A-Za-z0-9_.-]+)['"]/g)) {
      used.add(m[1])
      if (!(m[1] in strings)) errors.push(`${rel(f)}: string key '${m[1]}' missing from strings.json`)
    }
  }
  if (showUnused) {
    const all = [...sources.values()].join('\n')
    for (const k of Object.keys(strings)) {
      if (!used.has(k) && !all.includes(`'${k}'`) && !all.includes(`"${k}"`)) warnings.push(`strings.json: '${k}' not referenced literally`)
    }
  }
}

for (const w of warnings) console.log(`warning: ${w}`)
for (const e of errors) console.log(`error: ${e}`)
console.log(`check_frontend: ${files.length} modules, ${errors.length} errors, ${warnings.length} warnings`)
process.exit(errors.length ? 1 : 0)
