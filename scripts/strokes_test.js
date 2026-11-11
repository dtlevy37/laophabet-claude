// strokes_test.js: simulation test for the letter-writing scorer (app/frontend/js/writing/score.js).
//
// Usage (from the project root):  node scripts/strokes_test.js [--verbose]
//
// Draws every letter of app/frontend/data/strokes.json many times with simulated handwriting (skew, stretch, tilt,
// wobble, any size and position) and reports how often the scorer accepts the right letter and how often it accepts
// a drawing of a different letter. Also checks the tracer and the single-part judge. Exit code 1 when a hard
// expectation fails. Run it after changing TUNING in score.js or regenerating strokes.json.
'use strict'
const fs = require('node:fs')
const path = require('node:path')
const { pathToFileURL } = require('node:url')
const ROOT = path.resolve(__dirname, '..')
const verbose = process.argv.includes('--verbose')

function rngOf(seed) {
  return () => ((seed = (seed * 1664525 + 1013904223) >>> 0), seed / 4294967296)
}
// level 1 = ordinary careful handwriting, 2 = sloppy
function distort(strokes, rnd, level, free = true) {
  const r = (a) => (rnd() * 2 - 1) * a * level
  const sx = 1 + r(0.14), sy = 1 + r(0.14), sh = r(0.14), rot = r(0.12)
  const g = free ? 0.55 + rnd() * 0.5 : 1, tx = free ? (rnd() - 0.5) * 20 : 0, ty = free ? (rnd() - 0.5) * 20 : 0
  const f1 = 1 + rnd() * 2, f2 = 2 + rnd() * 3, p1 = rnd() * 6.28, p2 = rnd() * 6.28, amp = 2.2 * level
  const total = strokes.reduce((s, p) => s + p.length, 0)
  let k = 0
  return strokes.map((pts) => pts.map(([x, y]) => {
    const u = k++ / total
    let X = (x - 50) * sx + (y - 50) * sh, Y = (y - 50) * sy
    ;[X, Y] = [X * Math.cos(rot) - Y * Math.sin(rot), X * Math.sin(rot) + Y * Math.cos(rot)]
    X += amp * Math.sin(6.28 * f1 * u + p1) + (rnd() - 0.5) * 0.6
    Y += amp * Math.sin(6.28 * f2 * u + p2) + (rnd() - 0.5) * 0.6
    return [50 + X * g + tx, 50 + Y * g + ty]
  }))
}

async function main() {
  const tmp = path.join(ROOT, 'tmp', 'jscheck')
  fs.mkdirSync(tmp, { recursive: true })
  fs.copyFileSync(path.join(ROOT, 'app/frontend/js/writing/score.js'), path.join(tmp, 'score_test.mjs'))
  const S = await import(pathToFileURL(path.join(tmp, 'score_test.mjs')).href + '?' + Date.now())
  const data = JSON.parse(fs.readFileSync(path.join(ROOT, 'app/frontend/data/strokes.json'), 'utf8'))
  const chars = Object.keys(data.letters)
  const rnd = rngOf(12345)
  let bad = 0
  const expect = (ok, msg) => { if (!ok) { bad++; console.log('FAIL: ' + msg) } }

  // ---- whole letter
  const TRIALS = 12
  for (const level of [1, 2]) {
    let pass = 0, n = 0
    const misses = {}
    for (const ch of chars) for (let i = 0; i < TRIALS; i++) {
      const res = S.scoreLetter(data, ch, distort(data.letters[ch].strokes, rnd, level))
      n++
      if (res.ok) pass++
      else misses[ch] = (misses[ch] || '') + (res.reason === 'looks_like' ? res.lookedLike : '?')
    }
    console.log(`own letter, level ${level}: accepted ${pass}/${n} (${(100 * pass / n).toFixed(1)}%)`, verbose || level === 1 ? JSON.stringify(misses) : '')
    if (level === 1) expect(pass / n >= 0.93, 'careful handwriting should pass at least 93% of the time')
  }
  let wrongAccepted = 0, wn = 0
  const pairs = {}
  for (const drawn of chars) for (let i = 0; i < 3; i++) {
    const ink = distort(data.letters[drawn].strokes, rnd, 1)
    for (const asked of chars) {
      if (asked === drawn) continue
      wn++
      if (S.scoreLetter(data, asked, ink).ok) { wrongAccepted++; pairs[drawn + ' as ' + asked] = (pairs[drawn + ' as ' + asked] || 0) + 1 }
    }
  }
  console.log(`a different letter accepted: ${wrongAccepted}/${wn} (${(100 * wrongAccepted / wn).toFixed(2)}%)`, JSON.stringify(pairs))
  expect(wrongAccepted / wn <= 0.01, 'a drawing of another letter should almost never pass')

  const rev = S.scoreLetter(data, 'ຂ', [[...data.letters['ຂ'].strokes[0]].reverse()])
  expect(rev.ok && rev.reversed, 'a reversed drawing passes with reversed: true')
  const fwd = S.scoreLetter(data, 'ຂ', data.letters['ຂ'].strokes)
  expect(fwd.ok && !fwd.reversed, 'the exact letter passes')
  const line = [[...Array(40)].map((_, i) => [20 + i * 1.5, 30 + i])]
  const circle = [[...Array(60)].map((_, i) => [50 + 25 * Math.cos(i / 9.5), 50 + 25 * Math.sin(i / 9.5)])]
  const scribble = [[...Array(80)].map(() => [20 + rnd() * 60, 20 + rnd() * 60])]
  let junk = 0
  for (const ch of chars) for (const ink of [line, circle, scribble]) if (S.scoreLetter(data, ch, ink).ok) junk++, verbose && console.log('junk accepted for', ch)
  console.log(`junk (line, circle, scribble) accepted: ${junk}/${chars.length * 3}`)
  expect(junk <= 1, 'junk should not pass')
  expect(S.scoreLetter(data, 'ຂ', [data.letters['ຂ'].strokes[0].map(([x, y]) => [x / 6, y / 6])]).reason === 'too_small', 'tiny drawing is too_small')
  // pen lifted half way
  const st = data.letters['ດ'].strokes[0], half = st.length >> 1
  expect(S.scoreLetter(data, 'ດ', [st.slice(0, half + 1), st.slice(half)]).ok, 'a letter drawn in two pen strokes passes')
  if (verbose) for (const ch of chars) console.log(ch, S.rankLetters(data, data.letters[ch].strokes).slice(1, 4).map((r) => r.char + ' ' + r.d.toFixed(2)).join('  '))

  // ---- tracer
  let tOk = 0, tn = 0, tOff = 0, tRev = 0, tSkip = 0
  for (const ch of chars) {
    const strokes = data.letters[ch].strokes
    const run = (inkStrokes) => { const tr = S.createTracer(strokes); let d = false; for (const s of inkStrokes) { for (const p of s) d = tr.add(p[0], p[1]).done; tr.lift() } return { done: d, ...tr.result() } }
    tn++
    if (run(strokes.map((s) => s.map(([x, y]) => [x + (rnd() - 0.5) * 5, y + (rnd() - 0.5) * 5]))).ok) tOk++
    if (run(strokes.map((s) => s.map(([x, y]) => [x + 11, y + 6]))).ok) tOff++
    if (run(strokes.map((s) => [...s].reverse())).ok) tRev++
    if (run(strokes.map((s) => [s[0], s[s.length - 1]])).ok) tSkip++
  }
  console.log(`tracer: shaky trace ok ${tOk}/${tn}; shifted ${tOff}, reversed ${tRev}, shortcut ${tSkip} accepted (want 0)`)
  expect(tOk === tn && !tOff && !tRev && !tSkip, 'tracer')

  // ---- parts
  let pOk = 0, pn = 0, pWrong = 0, pwn = 0, pRev = 0
  for (const ch of chars) {
    const L = data.letters[ch]
    L.parts.forEach((_, i) => {
      for (let k = 0; k < 6; k++) {
        pn++
        if (S.scorePart(L, i, distort([S.partPoints(L, i)], rnd, 0.7, false).map((s) => s.map(([x, y]) => [x + (rnd() - 0.5) * 5, y + (rnd() - 0.5) * 5]))).ok) pOk++
      }
      const r = S.scorePart(L, i, [[...S.partPoints(L, i)].reverse()])
      if (r.ok && r.reversed) pRev++
      L.parts.forEach((_, j) => { if (j !== i) { pwn++; if (S.scorePart(L, i, [S.partPoints(L, j)]).ok) pWrong++ } })
    })
  }
  console.log(`parts: own part ok ${pOk}/${pn}; reversed flagged ${pRev}/${pn / 6}; another part accepted ${pWrong}/${pwn}`)
  expect(pOk / pn >= 0.93 && pWrong === 0, 'parts')
  console.log(bad ? `${bad} expectation(s) failed` : 'all expectations met')
  process.exit(bad ? 1 : 0)
}
main()
