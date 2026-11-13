// A7 keyboard check: sign in as the local test learner and play a dry run (#/try/<lesson>) to its end with the
// keyboard only (session.js onKey): a number key on an option or bank tile, else Enter on the primary button.
// Also presses Esc once and checks the "Leave the lesson?" dialog opens (then Stay).
// Setup: as a3_play_lesson.js (playwright in tmp/tools/pw, app/frontend served on :5500, scripts/local_test_user.sh).
// Run: NODE_PATH=tmp/tools/pw/node_modules node scripts/browser/a7_keys.js a1smoke@test.local smoke-test-pass-1 L0007
const { chromium } = require('playwright')
const [email, password, lesson = 'L0007'] = process.argv.slice(2)
;(async () => {
  const browser = await chromium.launch()
  const page = await browser.newPage({ viewport: { width: 1280, height: 800 } })
  const errors = []
  page.on('console', (m) => m.type() === 'error' && errors.push(m.text()))
  page.on('pageerror', (e) => errors.push(String(e)))
  await page.goto('http://127.0.0.1:5500/')
  await page.fill('input[type=email]', email)
  await page.fill('input[type=password]', password)
  await page.locator('form button[type=submit], form button.primary').first().click()
  await page.waitForTimeout(2500)
  await page.goto(`http://127.0.0.1:5500/#/try/${lesson}`)
  await page.waitForSelector('.stage')
  await page.keyboard.press('Escape')
  await page.waitForTimeout(200)
  const leaveDialog = await page.locator('dialog[open]').count()
  if (leaveDialog) await page.locator('dialog[open] button.primary').click()
  let steps = 0
  let ended = false
  for (let n = 0; n < 600; n++) {
    if (!(await page.locator('.stage').count())) {
      ended = true
      break
    }
    const counter = await page.locator('.session-progress').getAttribute('value').catch(() => null)
    const opts = page.locator('.stage button.mc-option:not([disabled])')
    const bank = page.locator('.stage .bs-bank > *')
    if (await opts.count()) await page.keyboard.press('1')
    else if (await page.locator('.stage .bs-bank > button:not([disabled]):not(.wrong)').count()) {
      const kids = await bank.evaluateAll((els) => els.map((e) => e.matches('button:not(:disabled):not(.wrong)')))
      const ok = kids.map((v, i) => (v ? i : -1)).filter((i) => i >= 0)
      const k = ok[Math.floor(Math.random() * ok.length)] // random: a wrong tile stays tappable
      if (k >= 0 && k < 9) await page.keyboard.press(String(k + 1))
      else await page.locator('.stage .bs-bank > button:not([disabled]):not(.wrong)').first().click() // past key 9
    } else await page.keyboard.press('Enter')
    await page.waitForTimeout(80)
    const after = await page.locator('.session-progress').getAttribute('value').catch(() => null)
    if (after !== counter) steps++
  }
  console.log(`lesson ${lesson}: leave dialog on Esc: ${leaveDialog > 0}, steps advanced: ${steps}, reached end: ${ended}`)
  console.log('end screen:', (await page.locator('main h1').first().textContent().catch(() => '')) || '(none)')
  if (errors.length) console.log('console errors:', errors.join(' | '))
  await browser.close()
  process.exit(ended && leaveDialog ? 0 : 1)
})().catch((e) => {
  console.error(e)
  process.exit(1)
})
