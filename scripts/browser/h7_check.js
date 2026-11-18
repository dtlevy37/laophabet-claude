// H7 check: on #/try/<lesson>, a Lao -> meaning question (mc-prompt Lao, "What does this word mean?") with a recorded
// word plays once when it appears and shows a ▶ (.mc-play .audio-btn); with the autoplay setting off it stays silent
// until ▶. Counts HTMLMediaElement.play calls. Runs the lesson twice (autoplay on, then off).
// Setup: playwright in tmp/tools/pw, app/frontend served on :5500 (python -m http.server 5500), scripts/local_test_user.sh.
// Run: NODE_PATH=tmp/tools/pw/node_modules node scripts/browser/h7_check.js a1smoke@test.local smoke-test-pass-1 L0002
const { chromium } = require('playwright')
const [email, password, lesson = 'L0002'] = process.argv.slice(2)

async function run(browser, autoplayOn) {
  const page = await browser.newPage({ viewport: { width: 375, height: 812 } })
  await page.addInitScript(() => {
    window.__plays = 0
    const play = HTMLMediaElement.prototype.play
    HTMLMediaElement.prototype.play = function () {
      window.__plays++
      return play.call(this).catch(() => {})
    }
  })
  const errors = []
  page.on('pageerror', (e) => errors.push(String(e)))
  await page.goto('http://127.0.0.1:5500/')
  await page.evaluate((on) => localStorage.setItem('laophabet.settings', JSON.stringify({ autoplay: on })), autoplayOn)
  await page.reload()
  await page.fill('input[type=email]', email)
  await page.fill('input[type=password]', password)
  await page.locator('form button[type=submit], form button.primary').first().click()
  await page.waitForTimeout(2500)
  await page.goto(`http://127.0.0.1:5500/#/try/${lesson}`)
  await page.waitForSelector('.stage')
  let r = null
  let last = 0
  for (let n = 0; n < 400 && !r; n++) {
    if (!(await page.locator('.stage').count())) break
    await page.waitForTimeout(80)
    const now = await page.evaluate(() => window.__plays)
    const isMeaning = await page.locator('.stage .mc .mc-prompt.lao, .stage .mc .glyph.mc-prompt').count()
    const q = await page.locator('.stage .mc-question').first().innerText({ timeout: 500 }).catch(() => '')
    if (process.env.DEBUG) console.log(n, JSON.stringify(q), JSON.stringify((await page.locator('.stage').innerText({ timeout: 500 }).catch(() => '')).slice(0, 60)))
    if (isMeaning && /what does this word mean/i.test(q) && (await page.locator('.stage .mc-play .audio-btn').count())) {
      await page.waitForTimeout(500)
      const afterAppear = (await page.evaluate(() => window.__plays)) - last // plays since the screen before
      const visible = await page.locator('.stage .mc-play .audio-btn').isVisible()
      await page.locator('.stage .mc-play .audio-btn').click()
      await page.waitForTimeout(300)
      const afterTap = await page.evaluate(() => window.__plays)
      r = { visible, afterAppear, tap: afterTap - (afterAppear + last) }
    } else if (await page.locator('.stage button.mc-option:not([disabled])').count()) {
      // a meaning -> Lao question must not have a ▶
      if (/pick the lao|which/i.test(q) && (await page.locator('.stage .mc-play').count())) errors.push('▶ on a meaning -> Lao question')
      await page.keyboard.press('1')
    } else await page.keyboard.press('Enter')
    last = now
  }
  await page.close()
  return { r, errors }
}

;(async () => {
  const browser = await chromium.launch()
  let ok = true
  for (const on of [true, false]) {
    const { r, errors } = await run(browser, on)
    console.log(`autoplay ${on ? 'on' : 'off'}:`, JSON.stringify(r), errors.length ? errors : '')
    // plays before this screen's own appearance may include earlier teach cards: compare the tap, not the total
    const good = r && r.visible && r.tap === 1 && !errors.length
    const appearOk = on ? r && r.afterAppear >= 1 : r && r.afterAppear === 0
    if (!good || !appearOk) ok = false
  }
  console.log(ok ? 'H7 OK' : 'H7 FAILED')
  await browser.close()
  process.exit(ok ? 0 : 1)
})().catch((e) => {
  console.error(e)
  process.exit(1)
})
