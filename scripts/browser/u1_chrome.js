// U1 steps 3 and 5 (text only): the lesson's ⋯ menu, settings and More as sheets, and the phone's Back closing a
// sheet without leaving the lesson. 360x640, touch.
// Run: NODE_PATH=tmp/tools/pw/node_modules node scripts/browser/u1_chrome.js a1smoke@test.local smoke-test-pass-1
const { chromium } = require('playwright')
const [email, password, lesson = 'L0002'] = process.argv.slice(2)
const BASE = process.env.BASE || 'http://127.0.0.1:5500/'
const fails = []
const check = (ok, what) => (ok ? console.log('ok  ', what) : (fails.push(what), console.log('FAIL', what)))

;(async () => {
  const browser = await chromium.launch()
  const page = await browser.newPage({ viewport: { width: 360, height: 640 }, hasTouch: true, isMobile: true })
  const errors = []
  page.on('pageerror', (e) => errors.push(String(e)))
  page.on('console', (m) => m.type() === 'error' && errors.push(m.text()))
  await page.goto(BASE)
  await page.fill('input[type=email]', email)
  await page.fill('input[type=password]', password)
  await page.locator('form button[type=submit], form button.primary').first().click()
  await page.waitForTimeout(2000)
  await page.goto(`${BASE}#/try/${lesson}`)
  await page.waitForSelector('.stage')
  const hash = await page.evaluate(() => location.hash)
  check((await page.locator('.lesson-head .chrome-btn').count()) === 1, 'lesson head has one chrome button (⋯)')
  await page.locator('.lesson-head .menu-btn').click()
  check(await page.locator('dialog.menu[open] .menu-row').count() === 2, '⋯ opens a menu with 2 rows')
  await page.locator('dialog.menu .menu-row').first().click()
  await page.waitForTimeout(300)
  check(await page.locator('dialog.sheet[open]').count() === 1, 'Settings opens as a sheet')
  const box = await page.locator('dialog.sheet[open]').boundingBox()
  check(box && Math.round(box.y + box.height) >= 638 && box.width >= 359, `sheet sits at the bottom, full width (${JSON.stringify(box)})`)
  await page.goBack()
  await page.waitForTimeout(400)
  check(await page.locator('dialog.sheet[open]').count() === 0, 'Back closes the settings sheet')
  check((await page.evaluate(() => location.hash)) === hash && (await page.locator('.stage').count()) === 1, 'still in the lesson after Back')
  // walk to the first card with a More button
  for (let n = 0; n < 40 && !(await page.locator('.stage button.more-btn').count()); n++) {
    const opt = page.locator('.stage button.mc-option:not([disabled])')
    if (await opt.count()) await opt.first().click()
    const tiles = page.locator('.stage .bs-bank > button:not([disabled])')
    for (let t = 0; t < 10 && (await tiles.count()); t++) await tiles.first().click()
    await page.locator('.stage .actions button.primary:not([disabled])').first().click().catch(() => {})
    await page.waitForTimeout(150)
  }
  if (await page.locator('.stage button.more-btn').count()) {
    await page.locator('.stage button.more-btn').click()
    await page.waitForTimeout(300)
    check(await page.locator('dialog.sheet[open] .sheet-body').count() === 1, 'More opens a sheet')
    await page.locator('dialog.sheet[open] .info-x').click()
    await page.waitForTimeout(300)
    check(await page.locator('dialog.sheet[open]').count() === 0, '✕ closes it')
    check((await page.evaluate(() => location.hash)) === hash, 'hash unchanged after ✕')
  } else check(false, 'found a card with More')
  // an answer's ⓘ opens the info sheet; a second Back must not leave the lesson
  for (let n = 0; n < 60 && !(await page.locator('.stage .feedback .info-btn').count()); n++) {
    const opt = page.locator('.stage button.mc-option:not([disabled])')
    if (await opt.count()) {
      await opt.first().click()
      break
    }
    await page.locator('.stage .actions button.primary:not([disabled])').first().click().catch(() => {})
    await page.waitForTimeout(150)
  }
  await page.waitForTimeout(200)
  if (await page.locator('.stage .feedback .info-btn').count()) {
    await page.locator('.stage .feedback .info-btn').first().click()
    await page.waitForTimeout(300)
    check(await page.locator('dialog.info-card[open]').count() === 1, 'ⓘ opens the info sheet')
    await page.goBack()
    await page.waitForTimeout(400)
    check(await page.locator('dialog[open]').count() === 0 && (await page.locator('.stage .feedback').count()) === 1, 'Back closes the info sheet, the answer stays')
  } else check(false, 'found an answer with ⓘ')
  check(!errors.length, `no console errors ${errors.join(' | ')}`)
  await browser.close()
  console.log(fails.length ? `${fails.length} failed` : 'all chrome checks passed')
  process.exit(fails.length ? 1 : 0)
})().catch((e) => {
  console.error(e)
  process.exit(1)
})
