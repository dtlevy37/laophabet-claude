// S7g check: on #/try/<lesson> the conversation card (.dialogue, one turn per line, A left / B right) and then fill
// in the blank on its lines with the conversation above (.dlg-context). Screenshots to tmp/shots/s7g-*.png (phone
// 375x812 light, then dark, and desktop 1280x900). Fails on page errors or when no conversation card or line blank
// is reached.
// Setup: playwright in tmp/tools/pw, app/frontend served on :5500 (python -m http.server 5500), scripts/local_test_user.sh.
// Run: NODE_PATH=tmp/tools/pw/node_modules node scripts/browser/s7g_dialogue.js a1smoke@test.local smoke-test-pass-1 L0010
const { chromium } = require('playwright')
const { mkdirSync } = require('fs')
const [email, password, lesson = 'L0010'] = process.argv.slice(2)
mkdirSync('tmp/shots', { recursive: true })

async function run(browser, tag, viewport, theme) {
  const page = await browser.newPage({ viewport, colorScheme: theme })
  const errors = []
  page.on('pageerror', (e) => errors.push(String(e)))
  await page.goto('http://127.0.0.1:5500/')
  await page.evaluate(() => localStorage.setItem('laophabet.settings', JSON.stringify({ autoplay: false })))
  await page.reload()
  await page.fill('input[type=email]', email)
  await page.fill('input[type=password]', password)
  await page.locator('form button[type=submit], form button.primary').first().click()
  await page.waitForTimeout(2500)
  await page.goto(`http://127.0.0.1:5500/#/try/${lesson}`)
  await page.waitForSelector('.stage')
  let card = 0
  let blanks = 0
  for (let n = 0; n < 500 && blanks < 2; n++) {
    if (!(await page.locator('.stage').count())) break
    await page.waitForTimeout(60)
    if (!card && (await page.locator('.stage .dialogue:not(.dlg-context)').count())) {
      card = await page.locator('.stage .dialogue .dlg-line').count()
      await page.screenshot({ path: `tmp/shots/s7g-${tag}-card.png`, fullPage: true })
    }
    const inBlank = await page.locator('.stage .dlg-context').count()
    const open = await page.locator('.stage button.mc-option:not([disabled])').count()
    if (inBlank && open) {
      blanks++
      await page.screenshot({ path: `tmp/shots/s7g-${tag}-blank${blanks}.png`, fullPage: true })
      await page.keyboard.press('1')
      await page.waitForTimeout(150)
      if (await page.locator('.stage button.mc-option:not([disabled])').count()) await page.keyboard.press('Enter') // confirm mode
      await page.waitForTimeout(150)
      await page.screenshot({ path: `tmp/shots/s7g-${tag}-blank${blanks}-answered.png`, fullPage: true })
      await page.keyboard.press('Enter')
    } else if (open) await page.keyboard.press('1')
    else await page.keyboard.press('Enter')
  }
  await page.close()
  return { card, blanks, errors }
}

;(async () => {
  const browser = await chromium.launch()
  let ok = true
  for (const [tag, viewport, theme] of [
    ['phone', { width: 375, height: 812 }, 'light'],
    ['dark', { width: 375, height: 812 }, 'dark'],
    ['desk', { width: 1280, height: 900 }, 'light'],
  ]) {
    const r = await run(browser, tag, viewport, theme)
    console.log(tag, JSON.stringify(r))
    if (!r.card || !r.blanks || r.errors.length) ok = false
  }
  await browser.close()
  console.log(ok ? 'OK' : 'FAIL')
  process.exit(ok ? 0 : 1)
})()
