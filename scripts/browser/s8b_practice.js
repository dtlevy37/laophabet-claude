// S8b browser check: the home Review tile and a practice session (#/practice) for a local test learner.
// Signs in, shots home, opens #/practice, answers at random (so some answers are wrong and come back), and reports
// the steps: any teach card, the same item twice in a row, the number of first-try questions. MODE=early ends the
// session with the ✕ after 4 answers (End review -> the summary of what was answered); otherwise it plays to the end,
// then presses "Review again" and checks a new session starts.
// Setup: npm i playwright@1.56.1 in tmp/tools/pw, serve app/frontend on :5500, bash scripts/local_test_user.sh
//   s8b@test.local s8b-test-pass-1, play lesson 1 (scripts/browser/a3_play_lesson.js) for the tile to go live.
// Run: NODE_PATH=tmp/tools/pw/node_modules node scripts/browser/s8b_practice.js s8b@test.local s8b-test-pass-1
// Shots in tmp/shots/s8b_*.png.
const { chromium } = require('playwright')
const [email, password] = process.argv.slice(2)
const MODE = process.env.MODE || 'full'
const OUT = require('path').join(__dirname, '../../tmp/shots'); require('fs').mkdirSync(OUT, { recursive: true })
;(async () => {
  const browser = await chromium.launch()
  const page = await browser.newPage({ viewport: { width: 390, height: 844 } })
  page.on('console', (m) => { if (['error', 'warning'].includes(m.type())) console.log('console.' + m.type() + ':', m.text()) })
  const rpcs = []
  page.on('response', (r) => { const m = r.url().match(/\/rpc\/(\w+)/); if (m) rpcs.push(`${m[1]}:${r.status()}`) })
  await page.goto('http://127.0.0.1:5500/')
  await page.fill('input[type=email]', email)
  await page.fill('input[type=password]', password)
  await page.locator('form button[type=submit], form button.primary').first().click()
  await page.waitForTimeout(3000)
  const tile = page.locator('.tiles .tile', { hasText: 'Review' }).first()
  console.log('home Review tile:', (await tile.evaluate((e) => `${e.tagName} ${e.className} | ${e.textContent}`)))
  await page.screenshot({ path: `${OUT}/s8b_home.png`, fullPage: true })
  if ((await tile.evaluate((e) => e.tagName)) !== 'A') return browser.close()

  await tile.click()
  await page.waitForTimeout(2500)
  console.log('hash:', await page.evaluate(() => location.hash), 'header hidden:', await page.evaluate(() => document.getElementById('topbar').hidden))
  const seen = [] // one entry per step: what the stage shows
  let n = 0
  let answered = 0
  let lastKey = null
  for (; n < 300; n++) {
    if (await page.locator('.stats').count()) break
    if (await page.locator('.stage .teach').count()) seen.push('TEACH CARD')
    const counter = await page.locator('.session-counter').textContent().catch(() => '')
    if (counter && counter !== lastKey) {
      lastKey = counter
      const prompt = await page.locator('.stage').evaluate((e) => (e.querySelector('.mc-prompt, .fb-sentence, .bs-line, .glyph, h2, p') || e).textContent.trim().slice(0, 40))
      seen.push(`${counter} ${prompt}`)
      if (n === 2) await page.screenshot({ path: `${OUT}/s8b_question.png` })
    }
    if (MODE === 'early' && answered >= 4) {
      await page.locator('.lesson-close').click()
      await page.waitForTimeout(400)
      await page.screenshot({ path: `${OUT}/s8b_leave.png` })
      console.log('dialog:', await page.locator('dialog[open]').textContent())
      await page.locator('dialog[open] button.link').click()
      await page.waitForTimeout(2500)
      break
    }
    const opts = page.locator('.mc-option:not([disabled])')
    if (await opts.count()) {
      await opts.nth(Math.floor(Math.random() * (await opts.count()))).click()
      answered++
      await page.waitForTimeout(150)
      continue
    }
    const bank = page.locator('.bs-bank button:not([disabled])')
    if (await bank.count()) {
      await bank.nth(Math.floor(Math.random() * (await bank.count()))).click()
      await page.waitForTimeout(100)
      continue
    }
    const next = page.locator('.lesson-frame button.primary:not([disabled])').last()
    if (!(await next.count())) {
      await page.waitForTimeout(500)
      continue
    }
    if (/Check/i.test(await next.textContent())) answered++
    await next.click()
    await page.waitForTimeout(250)
  }
  await page.waitForTimeout(1500)
  console.log('steps seen:\n  ' + seen.join('\n  '))
  await page.screenshot({ path: `${OUT}/s8b_summary_${MODE}.png`, fullPage: true })
  console.log('summary:', (await page.locator('main').textContent()).replace(/\s+/g, ' '))
  if (MODE !== 'early') {
    await page.locator('.summary-actions button').click()
    await page.waitForTimeout(2500)
    console.log('after Review again: counter', await page.locator('.session-counter').textContent().catch(() => 'none'))
    await page.goto('http://127.0.0.1:5500/#/')
    await page.waitForTimeout(2500)
    console.log('home Review tile now:', await page.locator('.tiles .tile', { hasText: 'Review' }).first().textContent())
  }
  const counts = {}
  for (const r of rpcs) counts[r] = (counts[r] || 0) + 1
  console.log('rpc calls:', JSON.stringify(counts))
  await browser.close()
})().catch((e) => { console.error(e); process.exit(1) })
