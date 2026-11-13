// A7 browser check: screenshots of the settings page, lesson 1's intro card and the lesson chrome at 375 and 1280
// wide, light and dark, plus a few assertions (Back from settings, the theme choice beats the device setting, the
// intro card's sound-spelling choice rewrites "Sounds like", the ກ card has no radios, the header in lessons).
// Dark shots run with the device in light mode and Settings on Dark, so they also prove the choice wins.
// Setup: as a3_play_lesson.js (playwright in tmp/tools/pw, app/frontend served on :5500, scripts/local_test_user.sh).
// Run: NODE_PATH=tmp/tools/pw/node_modules node scripts/browser/a7_shots.js a1smoke@test.local smoke-test-pass-1
// Shots: tmp/shots/a7/<name>_<width>_<light|dark>.png
const { chromium } = require('playwright')
const path = require('path')
const [email, password] = process.argv.slice(2)
const OUT = path.join(__dirname, '../../tmp/shots/a7')
require('fs').mkdirSync(OUT, { recursive: true })
const BASE = 'http://127.0.0.1:5500/'
const checks = []
const check = (name, ok, extra = '') => checks.push(`${ok ? 'PASS' : 'FAIL'} ${name}${extra ? ': ' + extra : ''}`)

async function setTheme(page, theme) {
  await page.evaluate((theme) => {
    const k = 'laophabet.settings'
    localStorage.setItem(k, JSON.stringify({ ...JSON.parse(localStorage.getItem(k) || '{}'), theme, translit: 'standard' }))
  }, theme)
}

;(async () => {
  const browser = await chromium.launch()
  for (const width of [375, 1280]) {
    const page = await browser.newPage({ viewport: { width, height: width < 500 ? 812 : 800 }, colorScheme: 'light' })
    const errors = []
    page.on('pageerror', (e) => errors.push(String(e)))
    page.on('console', (m) => m.type() === 'error' && errors.push(m.text()))
    page.on('requestfailed', (r) => errors.push(`request failed ${r.url().replace(/\?.*/, '')} (${r.failure()?.errorText}) on ${page.url()}`))
    await page.goto(BASE)
    await page.fill('input[type=email]', email)
    await page.fill('input[type=password]', password)
    await page.locator('form button[type=submit], form button.primary').first().click()
    await page.waitForTimeout(2000)
    for (const mode of ['light', 'dark']) {
      await setTheme(page, mode === 'dark' ? 'dark' : 'system')
      const shot = (name, full = true) => page.screenshot({ path: `${OUT}/${name}_${width}_${mode}.png`, fullPage: full })
      await page.goto(BASE + '#/')
      await page.reload()
      await page.waitForTimeout(1500)
      await shot('home', false)
      const topbarH = await page.locator('#topbar header').evaluate((e) => e.getBoundingClientRect().height).catch(() => 0)
      check(`${width} ${mode} topbar height`, topbarH > 0 && topbarH <= 64, `${Math.round(topbarH)}px`)
      // settings: open from the header, scroll, Back
      await page.locator('#topbar a[href="#/settings"]').click()
      await page.waitForSelector('.settings-page')
      await shot('settings')
      const bg = await page.evaluate(() => getComputedStyle(document.body).backgroundColor)
      check(`${width} ${mode} body background`, mode === 'dark' ? bg === 'rgb(20, 22, 26)' : bg === 'rgb(246, 247, 249)', bg)
      await page.locator('.settings-page .page-head button').click()
      await page.waitForTimeout(400)
      check(`${width} ${mode} settings Back returns home`, (await page.evaluate(() => location.hash)) === '#/')
      // lesson 1's intro card in the reader: the style choice, and "Sounds like" follows it
      await page.goto(BASE + '#/read/L0001/1')
      await page.waitForSelector('.style-sample')
      await shot('intro')
      const before = await page.locator('.style-sample .cell-big:not(.lao)').textContent()
      await page.locator('.style-choice input[type=radio]').nth(1).check()
      const after = await page.locator('.style-sample .cell-big:not(.lao)').textContent()
      check(`${width} ${mode} intro choice updates Sounds like`, before !== after, `${before} -> ${after}`)
      await page.locator('.style-choice input[type=radio]').nth(0).check()
      await page.goto(BASE + '#/read/L0001/2')
      await page.waitForSelector('.teach-grid')
      check(`${width} ${mode} ກ card has no radios`, (await page.locator('.teach input[type=radio]').count()) === 0)
      // a lesson step (dry run): header hidden, the lesson chrome
      await page.goto(BASE + '#/try/L0007')
      await page.waitForSelector('.stage')
      await page.waitForTimeout(400)
      await shot('lesson', false)
      check(`${width} ${mode} header hidden in a lesson`, !(await page.locator('#topbar header').isVisible().catch(() => false)))
      const x = page.locator('.lesson-close')
      if (await x.count()) {
        const box = await x.boundingBox()
        check(`${width} ${mode} ✕ at least 44px`, box.width >= 44 && box.height >= 44, `${Math.round(box.width)}x${Math.round(box.height)}`)
        check(`${width} ${mode} counter`, /^\d+ \/ \d+$/.test((await page.locator('.session-counter').textContent()).trim()))
      }
      await page.keyboard.press('Escape')
      await page.waitForTimeout(200)
      check(`${width} ${mode} Esc opens the leave dialog`, (await page.locator('dialog[open]').count()) === 1)
      await page.locator('dialog[open] button.primary').click()
      await page.goto(BASE + '#/settings')
      await page.waitForSelector('.settings-page')
      await page.reload() // opened directly: Back goes home
      await page.waitForSelector('.settings-page')
      await page.locator('.settings-page .page-head button').click()
      await page.waitForTimeout(400)
      check(`${width} ${mode} direct settings Back goes home`, (await page.evaluate(() => location.hash)) === '#/')
    }
    // the theme choice beats the device: device dark, Settings on Light
    await page.emulateMedia({ colorScheme: 'dark' })
    await setTheme(page, 'light')
    await page.reload()
    await page.waitForTimeout(1200)
    const bg = await page.evaluate(() => getComputedStyle(document.body).backgroundColor)
    check(`${width} Light beats a dark device`, bg === 'rgb(246, 247, 249)', bg)
    await setTheme(page, 'system')
    await page.reload()
    await page.waitForTimeout(1200)
    const bg2 = await page.evaluate(() => getComputedStyle(document.body).backgroundColor)
    check(`${width} System follows a dark device`, bg2 === 'rgb(20, 22, 26)', bg2)
    // a reload in the middle of list_lessons aborts it (ERR_ABORTED, then the app logs "Failed to fetch"): the driver's doing
    const real = errors.filter((e) => !/ERR_ABORTED|Failed to fetch/.test(e))
    check(`${width} no console errors`, !real.length, real.join(' | '))
    await page.close()
  }
  await browser.close()
  console.log(checks.join('\n'))
  process.exit(checks.some((c) => c.startsWith('FAIL')) ? 1 : 0)
})().catch((e) => {
  console.error(e)
  process.exit(1)
})
