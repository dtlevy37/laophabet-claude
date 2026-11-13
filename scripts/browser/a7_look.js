// A7 step 7 browser check ("Look"): screenshots of every colour theme (Lao, Indigo, Teal), light and dark, at 375 and
// 1280: home, a multiple-choice question answered right and answered wrong (dry run of L0007), settings, a Bonus
// word card (#/read/L0007) and a Culture note card (#/read/L0002). Also checks: the body background follows the
// palette, the theme and palette are on <html> before the app's modules run (index.html), the Settings choice
// switches the palette at once, and reduced motion turns the badge animation off.
// Setup: as a3_play_lesson.js (playwright in tmp/tools/pw, app/frontend served on :5500, scripts/local_test_user.sh).
// Run: NODE_PATH=tmp/tools/pw/node_modules node scripts/browser/a7_look.js a1smoke@test.local smoke-test-pass-1
// Shots: tmp/shots/a7_look/<palette>_<name>_<width>_<light|dark>.png
const { chromium } = require('playwright')
const path = require('path')
const [email, password] = process.argv.slice(2)
const OUT = path.join(__dirname, '../../tmp/shots/a7_look')
require('fs').mkdirSync(OUT, { recursive: true })
const BASE = 'http://127.0.0.1:5500/'
const BG = {
  lao: { light: 'rgb(245, 247, 251)', dark: 'rgb(15, 20, 32)' },
  indigo: { light: 'rgb(247, 246, 251)', dark: 'rgb(19, 18, 28)' },
  teal: { light: 'rgb(244, 247, 246)', dark: 'rgb(16, 22, 21)' },
}
const checks = []
const check = (name, ok, extra = '') => checks.push(`${ok ? 'PASS' : 'FAIL'} ${name}${extra ? ': ' + extra : ''}`)

async function setLook(page, theme, palette) {
  await page.evaluate(
    ([theme, palette]) => {
      const k = 'laophabet.settings'
      localStorage.setItem(k, JSON.stringify({ ...JSON.parse(localStorage.getItem(k) || '{}'), theme, palette, translit: 'standard' }))
    },
    [theme, palette],
  )
}

// Find the read-only card n (1..30) of a lesson that has the selector on it.
async function findCard(page, lesson, selector) {
  for (let n = 1; n <= 30; n++) {
    await page.goto(`${BASE}#/read/${lesson}/${n}`)
    await page.waitForSelector('.teach', { timeout: 5000 }).catch(() => null)
    await page.waitForTimeout(150)
    if (await page.locator(selector).count()) return n
  }
  return 0
}

// Play the dry run of L0007 until a multiple-choice question has been answered both right and wrong; shoot each.
async function mcShots(page, shot) {
  const got = { right: false, wrong: false }
  // random picks; a run that never answers right is played again (up to 4 runs)
  for (let run = 0; run < 4 && !(got.right && got.wrong); run++) {
  await page.goto(`${BASE}#/try/L0007`)
  await page.reload()
  await page.waitForSelector('.stage')
  for (let n = 0; n < 300 && !(got.right && got.wrong); n++) {
    if (!(await page.locator('.stage').count())) break
    const opts = page.locator('.stage section.mc button.mc-option:not([disabled])')
    const count = await opts.count()
    if (count) {
      // a random pick, until both states have been seen
      await opts.nth(Math.floor(Math.random() * count)).click()
      await page.waitForTimeout(250)
      const ok = (await page.locator('.stage .feedback.ok').count()) > 0
      const state = ok ? 'right' : 'wrong'
      if (!got[state]) {
        got[state] = true
        await page.waitForTimeout(300)
        await shot(`mc_${state}`, false)
      }
      continue
    }
    const bank = page.locator('.stage .bs-bank > button:not([disabled]):not(.wrong)')
    if (await bank.count()) await bank.first().click()
    else if (await page.locator('.stage .actions button.primary').count()) await page.locator('.stage .actions button.primary').first().click()
    else await page.keyboard.press('Enter')
    await page.waitForTimeout(80)
  }
  }
  return got
}

;(async () => {
  const browser = await chromium.launch()
  for (const width of [375, 1280]) {
    const page = await browser.newPage({ viewport: { width, height: width < 500 ? 812 : 800 }, colorScheme: 'light' })
    const errors = []
    page.on('pageerror', (e) => errors.push(String(e)))
    page.on('console', (m) => m.type() === 'error' && errors.push(m.text()))
    await page.goto(BASE)
    await page.fill('input[type=email]', email)
    await page.fill('input[type=password]', password)
    await page.locator('form button[type=submit], form button.primary').first().click()
    await page.waitForTimeout(2000)
    for (const palette of ['lao', 'indigo', 'teal']) {
      for (const mode of ['light', 'dark']) {
        await setLook(page, mode === 'dark' ? 'dark' : 'system', palette)
        const shot = (name, full = true) => page.screenshot({ path: `${OUT}/${palette}_${name}_${width}_${mode}.png`, fullPage: full })
        await page.goto(BASE + '#/')
        await page.reload()
        await page.waitForSelector('.continue-card')
        await page.waitForTimeout(500)
        await shot('home', false)
        const bg = await page.evaluate(() => getComputedStyle(document.body).backgroundColor)
        check(`${width} ${palette} ${mode} body background`, bg === BG[palette][mode], bg)
        await page.goto(BASE + '#/settings')
        await page.waitForSelector('.settings-page')
        await shot('settings')
        const got = await mcShots(page, shot)
        check(`${width} ${palette} ${mode} mc right and wrong shot`, got.right && got.wrong, JSON.stringify(got))
        if (await page.locator('dialog[open]').count()) await page.locator('dialog[open] button.primary').click()
        const bonus = await findCard(page, 'L0007', '.badge.bonus')
        if (bonus) await page.waitForTimeout(1300) // after the badge's flourish
        if (bonus) await shot('bonus')
        check(`${width} ${palette} ${mode} Bonus card`, bonus > 0, `card ${bonus}`)
        const culture = await findCard(page, 'L0002', '.note-badge.culture')
        if (culture) await page.waitForTimeout(1300)
        if (culture) await shot('culture')
        check(`${width} ${palette} ${mode} Culture card`, culture > 0, `card ${culture}`)
      }
    }
    // before the modules: with every module blocked, the head script in index.html alone sets the attributes
    await setLook(page, 'dark', 'teal')
    await page.route('**/js/**', (r) => r.abort())
    await page.reload()
    await page.waitForTimeout(500)
    const early = await page.evaluate(() => [document.documentElement.getAttribute('data-theme'), document.documentElement.getAttribute('data-palette'), getComputedStyle(document.body).backgroundColor].join(','))
    check(`${width} theme and palette set without the modules (index.html head)`, early === `dark,teal,${BG.teal.dark}`, early)
    await page.unroute('**/js/**')
    await page.goto(BASE + '#/settings')
    await page.reload()
    await page.waitForSelector('.settings-page')
    // Settings switches at once
    await page.locator('.settings-page input[name=palette]').nth(1).check()
    const bgNow = await page.evaluate(() => getComputedStyle(document.body).backgroundColor)
    check(`${width} picking Indigo in Settings switches at once`, bgNow === BG.indigo.dark, bgNow)
    await page.locator('.settings-page input[name=palette]').nth(0).check()
    check(`${width} picking Lao removes data-palette`, (await page.evaluate(() => document.documentElement.hasAttribute('data-palette'))) === false)
    await setLook(page, 'system', 'lao')
    const real = errors.filter((e) => !/ERR_ABORTED|ERR_FAILED|Failed to fetch|Failed to load|module script/.test(e))
    check(`${width} no console errors`, !real.length, real.join(' | '))
    await page.close()
  }
  // reduced motion: no badge animation
  {
    const page = await browser.newPage({ viewport: { width: 375, height: 812 }, reducedMotion: 'reduce' })
    await page.goto(BASE)
    await page.fill('input[type=email]', email)
    await page.fill('input[type=password]', password)
    await page.locator('form button[type=submit], form button.primary').first().click()
    await page.waitForTimeout(2000)
    const n = await findCard(page, 'L0007', '.badge.bonus')
    const anim = await page.locator('.badge.bonus').evaluate((e) => getComputedStyle(e).animationName + ' / ' + getComputedStyle(e, '::after').content)
    check('reduced motion: no badge animation', n > 0 && anim === 'none / none', anim)
    await page.emulateMedia({ reducedMotion: 'no-preference' })
    const anim2 = await page.locator('.badge.bonus').evaluate((e) => getComputedStyle(e).animationName)
    check('no preference: the badge pops', anim2 === 'badge-pop', anim2)
    await page.close()
  }
  await browser.close()
  console.log(checks.join('\n'))
  process.exit(checks.some((c) => c.startsWith('FAIL')) ? 1 : 0)
})().catch((e) => {
  console.error(e)
  process.exit(1)
})
