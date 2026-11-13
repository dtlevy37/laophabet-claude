// A7 step 4 check: play a real lesson (default L0001) to its summary, screenshot the summary at 375 and 1280, light
// and dark, then tap "Next lesson" and check the next lesson opens (#/lesson/L0002 with a step on screen).
// Setup: as a3_play_lesson.js (playwright in tmp/tools/pw, app/frontend served on :5500, scripts/local_test_user.sh).
// Run: NODE_PATH=tmp/tools/pw/node_modules node scripts/browser/a7_summary.js a1smoke@test.local smoke-test-pass-1 L0001 L0002
const { chromium } = require('playwright')
const path = require('path')
const [email, password, lesson = 'L0001', expected = 'L0002'] = process.argv.slice(2)
const OUT = path.join(__dirname, '../../tmp/shots/a7')
require('fs').mkdirSync(OUT, { recursive: true })
;(async () => {
  const browser = await chromium.launch()
  const page = await browser.newPage({ viewport: { width: 375, height: 812 }, colorScheme: 'light' })
  const errors = []
  page.on('pageerror', (e) => errors.push(String(e)))
  await page.goto('http://127.0.0.1:5500/')
  await page.fill('input[type=email]', email)
  await page.fill('input[type=password]', password)
  await page.locator('form button[type=submit], form button.primary').first().click()
  await page.waitForTimeout(2000)
  await page.goto(`http://127.0.0.1:5500/#/lesson/${lesson}`)
  await page.waitForSelector('.stage')
  for (let n = 0; n < 500; n++) {
    if (await page.locator('.stats').count()) break
    const opts = page.locator('.mc-option:not([disabled])')
    if (await opts.count()) {
      await opts.nth(Math.floor(Math.random() * (await opts.count()))).click()
      await page.waitForTimeout(120)
      continue
    }
    const bank = page.locator('.bs-bank button:not([disabled]):not(.wrong)')
    if (await bank.count()) {
      await bank.nth(Math.floor(Math.random() * (await bank.count()))).click()
      await page.waitForTimeout(100)
      continue
    }
    const next = page.locator('.lesson-frame button.primary:not([disabled])').last()
    if (await next.count()) await next.click().catch(() => {})
    await page.waitForTimeout(200)
  }
  await page.waitForSelector('.summary-actions')
  for (const width of [375, 1280]) {
    await page.setViewportSize({ width, height: width < 500 ? 812 : 800 })
    for (const mode of ['light', 'dark']) {
      await page.evaluate((m) => document.documentElement.setAttribute('data-theme', m), mode)
      await page.screenshot({ path: `${OUT}/summary_${width}_${mode}.png` })
    }
  }
  const buttons = await page.locator('.summary-actions a').allTextContents()
  await page.locator('.summary-actions a.primary').click()
  await page.waitForTimeout(1500)
  const hash = await page.evaluate(() => location.hash)
  const playing = (await page.locator('.stage').count()) > 0
  console.log(`summary buttons: ${buttons.join(' | ')}; after the primary: ${hash}, a step on screen: ${playing}`)
  if (errors.length) console.log('page errors:', errors.join(' | '))
  await browser.close()
  process.exit(hash === `#/lesson/${expected}` && playing && !errors.length ? 0 : 1)
})().catch((e) => {
  console.error(e)
  process.exit(1)
})
