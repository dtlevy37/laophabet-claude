// U1 fit check (text only, no screenshots): walks dry runs (#/try/<lesson>) at phone sizes and reports, per step kind,
// how often the stage has to scroll (idle and answered), by how many px at most, horizontal overflow, and whether the
// prompt moved when the answer came in. Answers alternate wrong / right so both feedback states are measured.
// Setup: playwright in tmp/tools/pw, app/frontend served on :5500, local Supabase, scripts/local_test_user.sh.
// Run: NODE_PATH=tmp/tools/pw/node_modules node scripts/browser/u1_fit.js a1smoke@test.local smoke-test-pass-1 L0002 L0011 practice
// Env: SIZES="360x640,320x568" (default), FLOOR=1 sets the "Smallest text" floor to its lowest step first.
const { chromium } = require('playwright')
const [email, password, ...lessons] = process.argv.slice(2)
const BASE = process.env.BASE || 'http://127.0.0.1:5500/'
const SIZES = (process.env.SIZES || '360x640,320x568').split(',').map((s) => s.split('x').map(Number))

const measure = (page) =>
  page.evaluate(() => {
    const stage = document.querySelector('.stage')
    if (!stage) return null
    const sec = stage.firstElementChild
    const q = stage.querySelector('.mc-question')
    const teach = stage.querySelector('.teach')
    let kind = 'other'
    if (q) kind = q.textContent.trim().slice(0, 34)
    else if (teach) kind = 'card:' + (teach.querySelector('h2')?.textContent.trim().slice(0, 20) || teach.querySelector('.badge')?.textContent.trim() || 'teach')
    if (stage.querySelector('.dialogue:not(.dlg-context)')) kind = 'card:conversation'
    const over = sec ? sec.scrollHeight - sec.clientHeight : 0
    const doc = document.scrollingElement
    const prompt = stage.querySelector('.mc-prompt, .fb-sentence, .bs-prompt, .lp-prompt')
    return {
      kind,
      over,
      docOver: doc.scrollHeight - window.innerHeight,
      wide: Math.max(0, doc.scrollWidth - window.innerWidth),
      promptTop: prompt ? Math.round(prompt.getBoundingClientRect().top) : null,
      more: !!stage.querySelector('details.more, button.more-btn'),
    }
  })

;(async () => {
  const browser = await chromium.launch()
  const fails = []
  for (const [w, hgt] of SIZES) {
    const page = await browser.newPage({ viewport: { width: w, height: hgt }, hasTouch: true, isMobile: true })
    const errors = []
    page.on('pageerror', (e) => errors.push(String(e)))
    page.on('console', (m) => m.type() === 'error' && errors.push(m.text()))
    await page.goto(BASE)
    await page.fill('input[type=email]', email)
    await page.fill('input[type=password]', password)
    await page.locator('form button[type=submit], form button.primary').first().click()
    await page.waitForTimeout(2000)
    if (process.env.FLOOR) {
      await page.evaluate(() => {
        const k = 'laophabet.settings'
        localStorage.setItem(k, JSON.stringify({ ...JSON.parse(localStorage.getItem(k) || '{}'), textFloor: 'small' }))
      })
      await page.reload() // settings are read once at start
      await page.waitForTimeout(1500)
    }
    for (const lesson of lessons) {
      // 'practice' walks a 5-minute review (not '#/practice': Git Bash rewrites a leading '/' into a Windows path)
      await page.goto(lesson === 'practice' ? `${BASE}#/practice` : `${BASE}#/try/${lesson}`)
      if (lesson === 'practice') await page.getByText('5 minutes').click({ timeout: 10000 })
      await page.waitForSelector('.stage')
      const kinds = new Map()
      let wrong = true
      const learned = {}
      let promptKey = ''
      for (let n = 0; n < 400; n++) {
        if (!(await page.locator('.stage').count())) break
        await page.waitForTimeout(120)
        const idle = await measure(page)
        if (!idle) break
        const k = kinds.get(idle.kind) || { n: 0, idleOver: 0, idleMax: 0, ansOver: 0, ansMax: 0, wide: 0, moved: 0, movedMax: 0, more: 0 }
        kinds.set(idle.kind, k)
        k.n++
        if (idle.over > 1) k.idleOver++, (k.idleMax = Math.max(k.idleMax, idle.over))
        if (idle.wide > 1 || idle.docOver > 1) k.wide++
        if (idle.more) k.more++
        const opts = page.locator('.stage button.mc-option:not([disabled])')
        const tiles = page.locator('.stage .bs-bank > button:not([disabled])')
        let answered = false
        if (await opts.count()) {
          const c = await opts.count()
          // The options do not say which is right: after a wrong pick the "Answer" card does, so remember it per prompt
          // (the question comes back) and pick the option whose text the card contains.
          const right = await page.evaluate((known) => {
            const key = document.querySelector('.stage .mc-question')?.parentElement?.textContent.slice(0, 200) || ''
            const ans = known[key]
            if (!ans) return -1
            return [...document.querySelectorAll('.stage button.mc-option')].findIndex((b) => {
              const txt = b.textContent.replace(/^\d+/, '').trim()
              return txt && ans.includes(txt)
            })
          }, learned)
          promptKey = await page.evaluate(() => document.querySelector('.stage .mc-question')?.parentElement?.textContent.slice(0, 200) || '')
          await opts.nth(wrong || right < 0 ? (right === 0 ? 1 : 0) : right).click()
          if (await page.locator('.stage .actions button.primary:not([disabled])').count() && !(await page.locator('.stage .feedback').count())) {
            await page.locator('.stage .actions button.primary').click() // Choose-then-Check on
          }
          answered = true
        } else if (await tiles.count()) {
          for (let t = 0; t < 12 && (await tiles.count()); t++) await tiles.first().click()
          await page.locator('.stage .actions button.primary').click()
          answered = true
        }
        if (answered) {
          wrong = !wrong
          await page.waitForTimeout(200)
          const ans = await measure(page)
          const card = await page.evaluate(() => document.querySelector('.stage .rc-answer')?.textContent || '')
          if (promptKey && card) learned[promptKey] = card
          if (ans) {
            if (ans.over > 1) k.ansOver++, (k.ansMax = Math.max(k.ansMax, ans.over))
            if (ans.wide > 1 || ans.docOver > 1) k.wide++
            if (idle.promptTop != null && ans.promptTop != null && Math.abs(idle.promptTop - ans.promptTop) > 1) k.moved++, (k.movedMax = Math.max(k.movedMax, Math.abs(idle.promptTop - ans.promptTop)))
          }
        }
        const next = page.locator('.stage .actions button.primary:not([disabled])')
        if (await next.count()) await next.click()
        else await page.keyboard.press('Enter')
      }
      console.log(`\n${lesson} @ ${w}x${hgt}`)
      for (const [kind, k] of kinds) {
        const bad = k.idleOver || k.ansOver || k.wide || k.moved
        console.log(`${bad ? '!' : ' '} ${kind.padEnd(36)} n=${k.n} scroll idle ${k.idleOver} (max ${k.idleMax}px) answered ${k.ansOver} (max ${k.ansMax}px) overflow ${k.wide} moved ${k.moved}${k.moved ? ` (max ${k.movedMax}px)` : ''}${k.more ? ` more ${k.more}` : ''}`)
        if (bad) fails.push(`${lesson} ${w}x${hgt} ${kind}`)
      }
    }
    if (errors.length) console.log('console errors:', [...new Set(errors)].join(' | ')), fails.push(`${w}x${hgt} console errors`)
    await page.close()
  }
  await browser.close()
  console.log(fails.length ? `\n${fails.length} kinds with scroll / overflow / movement` : '\nall steps fit')
  process.exit(fails.length ? 1 : 0)
})().catch((e) => {
  console.error(e)
  process.exit(1)
})
