// App review capture (scripts/review/README.md): one shared screenshot set across devices for the review agents.
// Per device: sign-in and sign-up screens, intake, home and lessons as a new learner, lessons 1 and 2 played for
// real (summary included), the reader cards, dry runs of lessons 8, 9, 10 (conversations: before Reveal, one line
// revealed, all revealed) and 12, practice, then home, lessons, letters (+ a unit), words (+ a word), write,
// settings, about, feedback, the settings sheet, and dark mode on phone and desktop. Answers are tapped at random,
// so right and wrong feedback both appear. The phone shoots every step; other devices shoot the first of each kind.
// Run: NODE_PATH=tmp/tools/pw/node_modules node scripts/browser/review_capture.js [device ...]   (default: all;
//   one process per device runs them in parallel). Devices: see PROFILES.
// Needs: local Supabase, app/frontend served on :5500, fresh accounts review_<device>@test.local / review-pass-1
//   (bash scripts/review/accounts.sh).
// Out: tmp/review/shots/<device>/NNN_<name>.png and index.json (each shot's route and visible text).
const { chromium } = require('playwright')
const fs = require('fs')
const path = require('path')
const BASE = 'http://127.0.0.1:5500/'
const ROOT = path.join(__dirname, '../../tmp/review/shots')
const PASS = 'review-pass-1'

const PROFILES = {
  phone: { viewport: { width: 360, height: 760 }, deviceScaleFactor: 2, isMobile: true, hasTouch: true, full: true, dark: true },
  // "Desktop site" on a 360px phone: a 980px layout viewport drawn scaled down to 360 CSS px (everything ~37% size)
  phone_desksite: { viewport: { width: 980, height: 2069 }, deviceScaleFactor: 1, isMobile: false, hasTouch: true },
  tablet_p: { viewport: { width: 768, height: 1024 }, deviceScaleFactor: 1, isMobile: true, hasTouch: true },
  tablet_l: { viewport: { width: 1024, height: 768 }, deviceScaleFactor: 1, isMobile: true, hasTouch: true },
  desktop: { viewport: { width: 1440, height: 900 }, deviceScaleFactor: 1, dark: true },
  laptop: { viewport: { width: 1280, height: 720 }, deviceScaleFactor: 1 }, // short screens: height runs out first
  // 1440x900 at 200% browser zoom = a 720x450 CSS viewport at 2x
  desktop_zoom200: { viewport: { width: 720, height: 450 }, deviceScaleFactor: 2 },
}

const clean = (s) => (s || '').replace(/\s+/g, ' ').trim().slice(0, 600)

async function run(id) {
  const P = PROFILES[id]
  const OUT = path.join(ROOT, id)
  fs.mkdirSync(OUT, { recursive: true })
  const index = []
  const browser = await chromium.launch()
  const ctx = await browser.newContext({ ...P, colorScheme: 'light' })
  const page = await ctx.newPage()
  const errors = []
  page.on('pageerror', (e) => errors.push(String(e)))
  page.on('console', (m) => m.type() === 'error' && errors.push(m.text()))
  let n = 0
  const shot = async (name, opts = {}) => {
    n++
    const file = `${String(n).padStart(3, '0')}_${name}.png`
    await page.screenshot({ path: path.join(OUT, file), fullPage: !!opts.full })
    const text = await page.evaluate(() => (document.querySelector('dialog[open]') || document.querySelector('main') || document.body).innerText).catch(() => '')
    index.push({ file, route: await page.evaluate(() => location.hash), text: clean(text) })
  }
  const setPref = (prefs) =>
    page.evaluate((prefs) => {
      const k = 'laophabet.settings'
      localStorage.setItem(k, JSON.stringify({ ...JSON.parse(localStorage.getItem(k) || '{}'), ...prefs }))
    }, prefs)
  const go = async (hash, wait = 1500) => {
    await page.goto(BASE + hash)
    await page.waitForTimeout(wait)
  }

  // signed-out screens
  await go('')
  await shot('auth_login')
  const signup = page.locator('a, button').filter({ hasText: /create|sign up/i }).first()
  if (await signup.count()) {
    await signup.click()
    await page.waitForTimeout(400)
    await shot('auth_signup_role')
  }
  await go('')
  await page.fill('input[type=email]', `review_${id}@test.local`)
  await page.fill('input[type=password]', PASS)
  await page.locator('form button[type=submit], form button.primary').first().click()
  await page.waitForTimeout(2500)
  if (await page.locator('text=Skip for now').count()) {
    await shot('intake', { full: true })
    await page.locator('text=Skip for now').click()
    await page.waitForTimeout(1500)
  }
  await setPref({ translit: 'standard' })
  await go('#/')
  await shot('home_new')
  await go('#/lessons')
  await shot('lessons_new', { full: true })

  // play a lesson as a session; full = every step, else the first of each kind
  const kindOf = () =>
    page.evaluate(() => {
      const st = document.querySelector('.stage')
      if (!st) return document.querySelector('.stats, .summary') ? 'summary' : 'none'
      const c = st.firstElementChild?.className || ''
      if (st.querySelector('.bw-line')) return 'build_word'
      if (st.querySelector('.bs-bank')) return 'build_sentence'
      if (st.querySelector('.mc-option')) {
        const p = (st.querySelector('.prompt, h2, .q, p') || {}).innerText || ''
        return 'choice_' + p.replace(/[^A-Za-z ]/g, '').trim().split(' ').slice(0, 4).join('_').toLowerCase()
      }
      return 'card_' + c.split(' ')[0]
    })
  async function play(hash, tag, full) {
    await go(hash, 2500)
    const seen = new Set()
    let lastCounter = ''
    let infoDone = false
    let fbShot = '' // the step whose feedback was shot (an answer is shot once)
    for (let k = 0; k < 600; k++) {
      const kind = await kindOf()
      if (kind === 'summary') {
        await page.waitForTimeout(800)
        await shot(`${tag}_summary`, { full: true })
        return
      }
      const counter = (await page.locator('.session-counter').textContent().catch(() => '')) || ''
      const fbOn = (await page.locator('.stage .feedback').count()) > 0
      const newStep = counter !== lastCounter
      lastCounter = counter
      const want = full || !seen.has(kind)
      if (kind === 'none') {
        await shot(`${tag}_end`)
        return
      }
      const isDialogue = (await page.locator('.stage .dialogue').count()) > 0 && !(await page.locator('.stage .mc-option').count())
      const firstDialogue = isDialogue && !seen.has('conversation')
      if (newStep && !fbOn && (want || firstDialogue)) {
        await shot(`${tag}_${counter.replace(/\D+/g, '-')}_${isDialogue ? 'conversation' : kind}`)
        if (firstDialogue) {
          seen.add('conversation')
          const reveal = page.locator('.stage .dialogue button').filter({ hasText: /reveal/i })
          if (await reveal.count()) {
            await reveal.first().click()
            await page.waitForTimeout(300)
            await shot(`${tag}_conversation_one_revealed`)
            for (let r = 0; r < 20 && (await reveal.count()); r++) {
              await reveal.first().click()
              await page.waitForTimeout(120)
            }
            await shot(`${tag}_conversation_all_revealed`, { full: true })
          }
        }
        if (!infoDone && (await page.locator('.stage .info-btn').count())) {
          await page.locator('.stage .info-btn').first().click()
          await page.waitForTimeout(400)
          await shot(`${tag}_info_sheet`)
          await page.keyboard.press('Escape')
          await page.waitForTimeout(300)
          infoDone = true
        }
      }
      const opts = page.locator('.stage .mc-option:not([disabled])')
      if (!fbOn && (await opts.count())) {
        await opts.nth(Math.floor(Math.random() * (await opts.count()))).click()
        await page.waitForTimeout(250)
        const check = page.locator('.stage .actions button.primary:not([disabled])')
        if (!(await page.locator('.stage .feedback').count()) && (await check.count())) {
          await check.last().click()
          await page.waitForTimeout(250)
        }
      } else if (!fbOn && (await page.locator('.stage .bs-bank button:not([disabled])').count())) {
        const bank = page.locator('.stage .bs-bank button:not([disabled])')
        await bank.nth(Math.floor(Math.random() * (await bank.count()))).click()
        await page.waitForTimeout(120)
        continue
      } else {
        if (fbOn && want && fbShot !== counter) {
          fbShot = counter
          await shot(`${tag}_${counter.replace(/\D+/g, '-')}_${kind}_fb`)
          seen.add(kind)
        } else if (!fbOn) seen.add(kind)
        const next = page.locator('.lesson-frame button.primary:not([disabled])').last()
        if (!(await next.count())) {
          await page.waitForTimeout(400)
          continue
        }
        await next.click()
        await page.waitForTimeout(350)
        continue
      }
      if (await page.locator('.stage .feedback').count()) {
        const c2 = (await page.locator('.session-counter').textContent().catch(() => '')) || ''
        if (want && fbShot !== c2) {
          fbShot = c2
          await shot(`${tag}_${c2.replace(/\D+/g, '-')}_${kind}_fb`)
        }
        seen.add(kind)
      }
    }
    await shot(`${tag}_stuck`)
  }

  await play('#/lesson/L0001', 'L1', !!P.full)
  await go('#/')
  await shot('home_after_L1')
  await play('#/lesson/L0002', 'L2', !!P.full)
  // reader: every card of lessons 1, 2 (phone) or the first 4 cards of lesson 2 (others)
  for (const L of P.full ? ['L0001', 'L0002', 'L0009', 'L0012'] : ['L0002']) {
    for (let c = 1; c <= (P.full ? 40 : 4); c++) {
      await go(`#/read/${L}/${c}`, 900)
      const txt = await page.evaluate(() => document.querySelector('main')?.innerText || '')
      if (!txt || /not found|no card/i.test(txt) || (c > 1 && index.at(-1)?.text === clean(txt))) break
      await shot(`read_${L}_${c}`, { full: true })
    }
  }
  await play('#/try/L0008', 'L8try', false)
  await play('#/try/L0009', 'L9try', !!P.full)
  await play('#/try/L0010', 'L10try', !!P.full)
  await play('#/try/L0012', 'L12try', !!P.full)
  await go('#/practice', 2500)
  await shot('practice_start')
  await play('#/practice', 'practice', false)

  for (const [h, name] of [['#/', 'home'], ['#/lessons', 'lessons'], ['#/letters', 'letters'], ['#/words', 'words'], ['#/write', 'write'], ['#/settings', 'settings'], ['#/about', 'about'], ['#/feedback', 'feedback']]) {
    await go(h)
    await shot(name, { full: true })
    if (name === 'letters' || name === 'words') {
      const first = page.locator('main a[href^="#/letters/"], main a[href^="#/words/W"]').first()
      if (await first.count()) {
        await first.click()
        await page.waitForTimeout(1200)
        await shot(name + '_detail', { full: true })
      }
    }
  }
  await go('#/')
  const gear = page.locator('#topbar button[aria-label="Settings"]')
  if (await gear.count()) {
    await gear.click()
    await page.waitForTimeout(400)
    await shot('settings_sheet')
    await page.keyboard.press('Escape')
  }

  if (P.dark) {
    await setPref({ theme: 'dark' })
    await page.reload() // the theme is applied at page load; a hash change alone keeps the old one
    for (const [h, name] of [['#/', 'dark_home'], ['#/lessons', 'dark_lessons'], ['#/read/L0001/1', 'dark_read_L1_1'], ['#/read/L0002/3', 'dark_read_L2_3']]) {
      await go(h)
      await shot(name)
    }
    await play('#/try/L0009', 'dark_L9try', false)
    await setPref({ theme: 'system' })
    await page.reload()
  }

  fs.writeFileSync(path.join(OUT, 'index.json'), JSON.stringify({ profile: id, settings: P, errors: [...new Set(errors)].slice(0, 30), shots: index }, null, 1))
  console.log(id, 'shots:', index.length, 'errors:', new Set(errors).size)
  await browser.close()
}

;(async () => {
  const ids = process.argv.slice(2).length ? process.argv.slice(2) : Object.keys(PROFILES)
  for (const id of ids) await run(id).catch((e) => console.error(id, e))
})()
