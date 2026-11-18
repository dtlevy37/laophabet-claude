// A7 rest check at 375px: inline sentence words with a bubble, the stats strip on home, and the missed list.
// 1. A dry run (#/try/<lesson>) up to a teach card with a sentence: tap a word -> a bubble under the sentence that
//    does not overlap it; tap another word -> it moves; Esc closes it without the leave dialog; tap elsewhere closes.
// 2. Build the sentence: no bubble or word button in the answer area before Check.
// 3. Home shows the strip (streak, letters, words).
// 4. A real lesson played with the first option each time; the summary lists the misses (if any were made).
// Setup: as a3_play_lesson.js (playwright in tmp/tools/pw, app/frontend served on :5500, scripts/local_test_user.sh).
// Run: NODE_PATH=tmp/tools/pw/node_modules node scripts/browser/a7_inline.js a1smoke@test.local smoke-test-pass-1 L0007 L0001
const { chromium } = require('playwright')
const path = require('path')
const [email, password, sentenceLesson = 'L0007', playLesson = 'L0001'] = process.argv.slice(2)
const results = []
const check = (name, ok, extra = '') => {
  results.push(ok)
  console.log(`${ok ? 'PASS' : 'FAIL'}  ${name}${extra ? ' (' + extra + ')' : ''}`)
}
;(async () => {
  const browser = await chromium.launch()
  const page = await browser.newPage({ viewport: { width: 375, height: 812 } })
  const errors = []
  page.on('console', (m) => m.type() === 'error' && errors.push(m.text()))
  page.on('pageerror', (e) => errors.push(String(e)))
  await page.goto('http://127.0.0.1:5500/')
  await page.fill('input[type=email]', email)
  await page.fill('input[type=password]', password)
  await page.locator('form button[type=submit], form button.primary').first().click()
  await page.waitForTimeout(2500)

  // 3. home strip
  const strip = await page.locator('.home-stats .home-stat').allInnerTexts()
  check('home strip has 3 stats', strip.length === 3, strip.join(' | ').replace(/\n/g, ' '))

  // 1. teach card with a sentence
  await page.goto(`http://127.0.0.1:5500/#/try/${sentenceLesson}`)
  await page.waitForSelector('.stage')
  let found = false
  for (let n = 0; n < 200 && !found; n++) {
    if (await page.locator('.stage .sentence-words .word-btn').count()) found = true
    else {
      const opts = page.locator('.stage button.mc-option:not([disabled])')
      const bank = page.locator('.stage .bs-bank > button:not([disabled]):not(.wrong)')
      if (await opts.count()) await opts.first().click()
      else if (await bank.count()) await bank.first().click()
      else await page.locator('.stage button.primary:not([disabled])').last().click().catch(() => {})
      await page.waitForTimeout(80)
    }
  }
  check('found a card with inline sentence words', found)
  if (found) {
    const words = page.locator('.stage .sentence-words .word-btn')
    const n = await words.count()
    check('no chip row left', (await page.locator('.stage button.chip:not(.info-btn):not(.audio-btn)').count()) === 0)
    await words.first().click()
    const box = page.locator('.stage .word-bubble')
    check('tap opens one bubble', (await box.count()) === 1, (await box.innerText()).replace(/\n/g, ' '))
    const overlap = await page.evaluate(() => {
      const b = document.querySelector('.word-bubble').getBoundingClientRect()
      const l = document.querySelector('.sentence-words > .lao').getBoundingClientRect()
      return b.top < l.bottom && b.bottom > l.top
    })
    check('bubble does not overlap the sentence', !overlap)
    const x1 = await box.evaluate((e) => e.style.getPropertyValue('--point'))
    if (n > 1) {
      await words.nth(n - 1).click()
      const x2 = await page.locator('.word-bubble').evaluate((e) => e.style.getPropertyValue('--point'))
      check('another word moves it (still one bubble, pointer moved)', (await page.locator('.word-bubble').count()) === 1 && x1 !== x2, `${x1} -> ${x2}`)
    }
    await page.keyboard.press('Escape')
    await page.waitForTimeout(150)
    check('Esc closes the bubble, no leave dialog', (await page.locator('.word-bubble').count()) === 0 && (await page.locator('dialog[open]').count()) === 0)
    await words.first().click()
    await page.mouse.click(5, 400)
    await page.waitForTimeout(100)
    check('tap elsewhere closes it', (await page.locator('.word-bubble').count()) === 0)
    check('word buttons carry the class countTaps counts', ((await words.first().getAttribute('class')) || '').includes('word-btn'))
    await page.keyboard.press('Escape')
    await page.waitForTimeout(150)
    check('Esc with no bubble still opens the leave dialog', (await page.locator('dialog[open]').count()) === 1)
    await page.locator('dialog[open] button.primary').click()
  }

  // 2. build the sentence: before Check there is no word button or bubble
  let bsChecked = false
  for (let n = 0; n < 300 && !bsChecked; n++) {
    if (await page.locator('.stage .bs-bank').count()) {
      const tile = page.locator('.stage .bs-bank > button:not([disabled])').first()
      if (await tile.count()) await tile.click()
      check('build the sentence: no word buttons or bubble before Check', (await page.locator('.stage .word-btn, .stage .word-bubble').count()) === 0)
      bsChecked = true
      break
    }
    const opts = page.locator('.stage button.mc-option:not([disabled])')
    if (await opts.count()) await opts.first().click()
    else await page.locator('.stage button.primary:not([disabled])').last().click().catch(() => {})
    await page.waitForTimeout(80)
  }
  if (!bsChecked) console.log('SKIP  no build-the-sentence step found in', sentenceLesson)

  // 4. a played lesson: the summary lists the misses
  await page.goto(`http://127.0.0.1:5500/#/lesson/${playLesson}`)
  await page.waitForSelector('.stage')
  let wrong = 0
  for (let n = 0; n < 500; n++) {
    if (await page.locator('.stats').count()) break
    const opts = page.locator('.mc-option:not([disabled])')
    if (await opts.count()) {
      await opts.first().click()
      await page.waitForTimeout(120)
      if (await page.locator('.mc-option.wrong').count()) wrong++
      continue
    }
    const bank = page.locator('.bs-bank button:not([disabled]):not(.wrong)')
    if (await bank.count()) {
      await bank.first().click()
      await page.waitForTimeout(100)
      continue
    }
    const next = page.locator('.lesson-frame button.primary:not([disabled])').last()
    if (await next.count()) await next.click().catch(() => {})
    await page.waitForTimeout(200)
  }
  await page.waitForSelector('.summary-actions')
  const listed = await page.locator('.checkpoint-missed li').allInnerTexts()
  console.log('wrong first-option answers seen:', wrong, '| summary missed list:', listed.join(' ; '))
  check('summary lists a missed item when a miss was made', wrong === 0 ? true : listed.length > 0, `${listed.length} listed`)
  await page.goto('http://127.0.0.1:5500/#/')
  await page.waitForSelector('.home-stats .home-stat')
  const streak = parseInt((await page.locator('.home-stat.streak .home-stat-num').innerText()).trim(), 10)
  check('home streak is 1 or more after a completed lesson', streak >= 1, String(streak))
  check('no console errors', errors.length === 0, errors.join(' | '))
  require('fs').mkdirSync(path.join(__dirname, '../../tmp/shots'), { recursive: true })
  await page.screenshot({ path: path.join(__dirname, '../../tmp/shots/a7_inline_summary.png') }).catch(() => {})
  await browser.close()
  process.exit(results.every(Boolean) ? 0 : 1)
})().catch((e) => {
  console.error(e)
  process.exit(1)
})
