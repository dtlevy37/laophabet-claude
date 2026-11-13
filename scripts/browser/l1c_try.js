// L1c browser check: sign in as the local test learner, play a dry run (#/try/<lesson>) and screenshot the new
// answer screens: build the word with a slip then right (green), a half-filled slot board, Check before complete
// ("Your answer" over "Right answer"), a wrong build the sentence, and (lesson 9) ສະບາຍດີບໍ່? for "How are you?"
// (also right). Shots go to tmp/shots/l1c_<lesson>_*.png.
// Setup: as a3_play_lesson.js (playwright in tmp/tools/pw, app/frontend served on :5500, scripts/local_test_user.sh).
// Run: NODE_PATH=tmp/tools/pw/node_modules node scripts/browser/l1c_try.js a1smoke@test.local smoke-test-pass-1 L0009
const { chromium } = require('playwright')
const [email, password, lesson = 'L0009'] = process.argv.slice(2)
const OUT = require('path').join(__dirname, '../../tmp/shots')
require('fs').mkdirSync(OUT, { recursive: true })
;(async () => {
  const browser = await chromium.launch()
  const page = await browser.newPage({ viewport: { width: 390, height: 844 } })
  const errors = []
  page.on('console', (m) => {
    if (['error', 'warning'].includes(m.type())) errors.push(m.text())
  })
  page.on('pageerror', (e) => errors.push(String(e)))
  await page.goto('http://127.0.0.1:5500/')
  await page.fill('input[type=email]', email)
  await page.fill('input[type=password]', password)
  await page.locator('form button[type=submit], form button.primary').first().click()
  await page.waitForTimeout(2500)
  await page.goto(`http://127.0.0.1:5500/#/try/${lesson}`)
  await page.waitForTimeout(2500)
  const shot = (name) => page.screenshot({ path: `${OUT}/l1c_${lesson}_${name}.png`, fullPage: true })
  const seen = { words: 0, early: false, slipGreen: false, half: false, sentenceWrong: false, alt: false }
  const found = []
  const primary = () => page.locator('.lesson-frame .actions button.primary:not([disabled])').last()
  for (let n = 0; n < 500; n++) {
    if (await page.locator('.stats, .summary').count()) break
    const opts = page.locator('.mc-option:not([disabled])')
    if (await opts.count()) {
      await opts.first().click()
      await page.waitForTimeout(120)
      await primary().click().catch(() => {})
      await page.waitForTimeout(150)
      continue
    }
    if (await page.locator('.bw-line').count() && (await page.locator('.bs-bank button').count())) {
      // build the word: the first one is checked early (after one piece); the others are tapped left to right, so
      // most of them have a slip on the way
      seen.words++
      const early = !seen.early
      let slipped = false
      for (let k = 0; k < 40; k++) {
        const bank = page.locator('.bs-bank button')
        if (!(await bank.count())) break
        // a wrong tile stays in the bank, so walk the bank: the k-th button each time
        await bank.nth(k % (await bank.count())).click()
        await page.waitForTimeout(80)
        if (await page.locator('.bs-bank .bs-tile.wrong').count()) slipped = true
        const placed = await page.locator('.bw-line .bs-tile.placed').count()
        const empty = await page.locator('.bw-line .bs-tile.slot').count()
        if (!seen.half && placed && empty) {
          seen.half = true
          await shot('slots_half')
        }
        if (early && placed && empty) {
          await primary().click() // Check
          await page.waitForTimeout(150)
          seen.early = (await page.locator('.cmp .cmp-cell.gap').count()) > 0
          await shot('word_early_check')
          break
        }
        if (!empty) break
      }
      if (!early && slipped && (await page.locator('.feedback.ok').count())) {
        if (!seen.slipGreen) await shot('word_slip_green')
        seen.slipGreen = true
      }
      found.push(`${await page.locator('.bw-meaning').innerText()}:${early ? 'early' : slipped ? 'slip' : 'clean'}:${(await page.locator('.feedback.ok').count()) ? 'green' : 'red'}`)
      await primary().click()
      await page.waitForTimeout(150)
      continue
    }
    if (await page.locator('.bs-prompt').count() && (await page.locator('.bs-bank button').count())) {
      const english = (await page.locator('.bs-prompt').innerText()).trim()
      if (english === 'How are you?' && !seen.alt) {
        for (const w of ['ສະບາຍດີ', 'ບໍ່']) await page.locator('.bs-bank button', { hasText: w }).first().click()
        await primary().click()
        await page.waitForTimeout(150)
        seen.alt = (await page.locator('.feedback.ok').count()) > 0 && (await page.locator('.feedback').innerText()).includes('Also right')
        await shot('sentence_also_right')
      } else if (!seen.sentenceWrong) {
        // one tile from the end of the bank only: short and (almost always) wrong
        await page.locator('.bs-bank button').last().click()
        await primary().click()
        await page.waitForTimeout(150)
        seen.sentenceWrong = (await page.locator('.cmp').count()) > 0
        await shot('sentence_wrong')
      } else {
        while (await page.locator('.bs-bank button').count()) await page.locator('.bs-bank button').first().click()
        await primary().click()
        await page.waitForTimeout(150)
      }
      await primary().click()
      await page.waitForTimeout(150)
      continue
    }
    const next = primary()
    if (!(await next.count())) {
      await page.waitForTimeout(400)
      continue
    }
    await next.click()
    await page.waitForTimeout(150)
  }
  await shot('end')
  console.log(JSON.stringify(seen))
  console.log('build the word:', found.join(' | '))
  if (errors.length) console.log('console errors:', errors.join('\n'))
  await browser.close()
})().catch((e) => {
  console.error(e)
  process.exit(1)
})
