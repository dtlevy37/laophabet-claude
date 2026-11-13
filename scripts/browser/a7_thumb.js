// A7 step 9 thumb-zone check: plays a dry run (#/try/<lesson>) by clicking the first option, at 375x667, 375x812
// and 1280x800, light and dark. On every option question (multiple choice, listen and pick, fill in the blank) it
// measures the idle state (options centred in the free space under the prompt: gap above vs gap below) and the
// answered state (does the step scroll? did the options move?), and shoots the first idle / right / wrong of each
// activity. Also checks the key hints: hidden at 375 (touch-sized), shown at 1280.
// Setup: as a3_play_lesson.js (playwright in tmp/tools/pw, app/frontend served on :5500, scripts/local_test_user.sh).
// Run: NODE_PATH=tmp/tools/pw/node_modules node scripts/browser/a7_thumb.js a1smoke@test.local smoke-test-pass-1 L0009
// Shots: tmp/shots/a7/thumb_<activity>_<idle|right|wrong>_<w>x<h>_<light|dark>.png
const { chromium } = require('playwright')
const path = require('path')
const [email, password, lesson = 'L0009'] = process.argv.slice(2)
const OUT = path.join(__dirname, '../../tmp/shots/a7')
require('fs').mkdirSync(OUT, { recursive: true })
const BASE = 'http://127.0.0.1:5500/'
const fails = []

const measure = (page) =>
  page.evaluate(() => {
    const sec = document.querySelector('.stage > section.mc')
    const opts = sec?.querySelector('.mc-options')
    if (!sec || !opts) return null
    const s = sec.getBoundingClientRect()
    const btns = [...opts.querySelectorAll('.mc-option')].map((b) => b.getBoundingClientRect())
    const top = Math.min(...btns.map((r) => r.top))
    const bottom = Math.max(...btns.map((r) => r.bottom))
    const prev = opts.previousElementSibling?.getBoundingClientRect()
    return {
      kind: sec.classList.contains('lp') ? 'listen_pick' : sec.querySelector('.fb-sentence') ? 'fill_blank' : 'multiple_choice',
      above: Math.round(top - (prev ? prev.bottom + parseFloat(getComputedStyle(opts.previousElementSibling).marginBottom) : s.top)),
      below: Math.round(s.bottom - bottom),
      top: Math.round(top),
      minH: Math.round(Math.min(...btns.map((r) => r.height))),
      scrolls: sec.scrollHeight > sec.clientHeight + 1,
      hint: (() => { const k = document.querySelector('.kbd-hint'); return !!k && getComputedStyle(k).display !== 'none' })(),
    }
  })

;(async () => {
  const browser = await chromium.launch()
  for (const [w, hgt] of process.env.DEBUG ? [[375, 667]] : [[375, 667], [375, 812], [1280, 800]]) {
    for (const mode of process.env.DEBUG ? ['light'] : ['light', 'dark']) {
      const page = await browser.newPage({ viewport: { width: w, height: hgt }, colorScheme: mode })
      const errors = []
      page.on('pageerror', (e) => errors.push(String(e)))
      await page.goto(BASE)
      await page.fill('input[type=email]', email)
      await page.fill('input[type=password]', password)
      await page.locator('form button[type=submit], form button.primary').first().click()
      await page.waitForTimeout(2000)
      await page.evaluate(() => {
        const k = 'laophabet.settings'
        localStorage.setItem(k, JSON.stringify({ ...JSON.parse(localStorage.getItem(k) || '{}'), theme: 'system' }))
      })
      await page.goto(`${BASE}#/try/${lesson}`)
      await page.waitForSelector('.stage')
      const shot = new Set()
      const stats = { questions: 0, scrolled: 0, moved: 0, offCentre: 0, hintWrong: 0 }
      for (let n = 0; n < 400; n++) {
        if (!(await page.locator('.stage').count())) break
        const opts = page.locator('.stage button.mc-option:not([disabled])')
        if (await opts.count()) {
          await page.waitForTimeout(150)
          const idle = await measure(page)
          if (idle) {
            stats.questions++
            if (!idle.scrolls && Math.abs(idle.above - idle.below) > 12) stats.offCentre++, process.env.DEBUG && console.log('off', JSON.stringify(idle))
            if (idle.hint !== (w >= 1280)) stats.hintWrong++
            const key = `${idle.kind}_idle`
            if (!shot.has(key)) shot.add(key) && (await page.screenshot({ path: `${OUT}/thumb_${key}_${w}x${hgt}_${mode}.png` }))
          }
          await opts.first().click()
          await page.waitForTimeout(250)
          const ans = await measure(page)
          if (idle && ans) {
            const ok = (await page.locator('.feedback.ok').count()) > 0
            if (process.env.BASE_CSS && ans.scrolls) {
              // compare with the old stylesheet on the same screen: did it scroll before step 9 too?
              const before = await page.evaluate(async (href) => {
                const link = document.querySelector('link[href*="styles.css"]')
                const old = link.getAttribute('href')
                await new Promise((r) => { link.onload = r; link.setAttribute('href', href) })
                const sec = document.querySelector('.stage > section.mc')
                const res = sec.scrollHeight > sec.clientHeight + 1
                await new Promise((r) => { link.onload = r; link.setAttribute('href', old) })
                return res
              }, process.env.BASE_CSS)
              if (!before) stats.newScroll = (stats.newScroll || 0) + 1, console.log('new scroll', ans.kind)
            }
            if (ans.scrolls) stats.scrolled++, (stats[`scrolled_${ans.kind}`] = (stats[`scrolled_${ans.kind}`] || 0) + 1)
            if (ans.top !== idle.top) stats.moved++, process.env.DEBUG && console.log('moved', idle.kind, idle.top, ans.top, ans.scrolls)
            const key = `${ans.kind}_${ok ? 'right' : 'wrong'}`
            if (!shot.has(key)) shot.add(key) && (await page.screenshot({ path: `${OUT}/thumb_${key}_${w}x${hgt}_${mode}.png` }))
          }
          await page.locator('.stage .actions button.primary').click()
        } else {
          const tiles = page.locator('.stage .bs-bank > button:not([disabled]):not(.wrong)')
          const c = await tiles.count()
          if (c) await tiles.nth(Math.floor(Math.random() * c)).click() // random: a wrong tile stays tappable
          else await page.keyboard.press('Enter')
        }
        await page.waitForTimeout(60)
      }
      console.log(`${w}x${hgt} ${mode}: ${JSON.stringify(stats)}`)
      if (stats.newScroll) fails.push(`${w}x${hgt} ${mode}: ${stats.newScroll} answered steps scroll that did not before`)
      if (stats.hintWrong) fails.push(`${w}x${hgt} ${mode}: key hint shown/hidden wrongly ${stats.hintWrong}x`)
      if (stats.offCentre) fails.push(`${w}x${hgt} ${mode}: ${stats.offCentre} idle questions not centred`)
      if (errors.length) fails.push(`${w}x${hgt} ${mode}: ${errors.join(' | ')}`)
      await page.close()
    }
  }
  await browser.close()
  console.log(fails.length ? fails.map((f) => 'FAIL ' + f).join('\n') : 'all thumb checks passed')
  process.exit(fails.length ? 1 : 0)
})().catch((e) => {
  console.error(e)
  process.exit(1)
})
