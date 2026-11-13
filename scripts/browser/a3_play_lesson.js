// A3 browser check: sign in as a local test learner and play a lesson through the real flow (start_lesson,
// record_answers, complete_lesson), tapping options at random so some answers are wrong and come back as replays.
// It also taps a play button and an info icon once, so detail.audio / detail.info are exercised.
// Setup: npm i playwright@1.56.1 in tmp/tools/pw, serve app/frontend on :5500, bash scripts/local_test_user.sh.
// Run: NODE_PATH=tmp/tools/pw/node_modules node scripts/browser/a3_play_lesson.js a3test@test.local a3-test-pass-1 L0001
//   (STRICT=1 in front turns on the spelling challenge, so build the word logs mode 'strict' and per-piece wrongs)
// Then check review_log for that user (see app/backend/tests/a3_stats_capture_test.sql for the columns).
const { chromium } = require('playwright')
const [email, password, lesson = 'L0001'] = process.argv.slice(2)
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
  await page.waitForTimeout(2500)
  if (process.env.STRICT) {
    // STRICT=1: the "spelling challenge" setting, so build the word runs in strict reading order
    await page.evaluate(() => {
      const k = 'laophabet.settings'
      localStorage.setItem(k, JSON.stringify({ ...JSON.parse(localStorage.getItem(k) || '{}'), spellingOrder: true }))
    })
    await page.reload()
    await page.waitForTimeout(2000)
  }
  await page.goto(`http://127.0.0.1:5500/#/lesson/${lesson}`)
  await page.waitForTimeout(2500)
  let audioTapped = false
  let infoTapped = false
  let n = 0
  for (; n < 400; n++) {
    if (await page.locator('.stats').count()) break
    const opts = page.locator('.mc-option:not([disabled])')
    if (await opts.count()) {
      await opts.nth(Math.floor(Math.random() * (await opts.count()))).click()
      await page.waitForTimeout(150)
      if (!infoTapped && (await page.locator('.stage .info-btn').count())) {
        await page.locator('.stage .info-btn').first().click()
        await page.waitForTimeout(300)
        await page.keyboard.press('Escape')
        await page.waitForTimeout(200)
        infoTapped = true
      }
      continue
    }
    const bank = page.locator('.bs-bank button')
    if (await bank.count()) {
      await bank.nth(Math.floor(Math.random() * (await bank.count()))).click()
      await page.waitForTimeout(100)
      continue
    }
    if (!audioTapped && (await page.locator('.stage .audio-btn').count())) {
      await page.locator('.stage .audio-btn').first().click()
      audioTapped = true
      await page.waitForTimeout(200)
    }
    const next = page.locator('.lesson-frame button.primary:not([disabled])').last()
    if (!(await next.count())) {
      await page.waitForTimeout(500)
      continue
    }
    await next.click()
    await page.waitForTimeout(250)
  }
  await page.waitForTimeout(1500)
  await page.screenshot({ path: `${OUT}/a3_summary.png`, fullPage: true })
  console.log('loop steps:', n, 'summary shown:', (await page.locator('.stats').count()) > 0, 'audio tapped:', audioTapped, 'info tapped:', infoTapped)
  const counts = {}
  for (const r of rpcs) counts[r] = (counts[r] || 0) + 1
  console.log('rpc calls:', JSON.stringify(counts))
  await browser.close()
})().catch((e) => { console.error(e); process.exit(1) })
