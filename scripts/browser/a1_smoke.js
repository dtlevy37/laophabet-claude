// A1 smoke test: sign in as a local test learner, open the dry run of a lesson, and confirm audio requests,
// Setup: npm i playwright@1.56.1 in tmp/tools/pw, serve app/frontend on :5500, bash scripts/local_test_user.sh.
// Run: NODE_PATH=tmp/tools/pw/node_modules node scripts/browser/a1_smoke.js a1smoke@test.local smoke-test-pass-1 L0001
// the play button, autoplay and the report dialog. Usage: node a1_smoke.js <email> <password> [lesson]
const { chromium } = require('playwright')
const [email, password, lesson = 'L0001'] = process.argv.slice(2)
const OUT = require('path').join(__dirname, '../../tmp/shots'); require('fs').mkdirSync(OUT, { recursive: true })
;(async () => {
  const browser = await chromium.launch({ args: ['--autoplay-policy=no-user-gesture-required'] })
  const page = await browser.newPage({ viewport: { width: 390, height: 844 } })
  const audioReqs = []
  page.on('request', (r) => { if (r.url().includes('/storage/v1/object/public/audio/')) audioReqs.push(r.url().split('/audio/')[1]) })
  page.on('console', (m) => { if (['error', 'warning'].includes(m.type())) console.log('console.' + m.type() + ':', m.text()) })
  await page.goto('http://127.0.0.1:5500/')
  await page.fill('input[type=email]', email)
  await page.fill('input[type=password]', password)
  await page.locator('form button[type=submit], form button.primary').first().click()
  await page.waitForTimeout(2500)
  await page.goto(`http://127.0.0.1:5500/#/try/${lesson}`)
  await page.waitForTimeout(3000)
  await page.screenshot({ path: `${OUT}/a1_first.png`, fullPage: true })
  await page.goto(`http://127.0.0.1:5500/#/read/${lesson}`)
  await page.waitForTimeout(3000)
  for (let i = 0; i < 12; i++) {
    const n = await page.locator('.audio-btn').count()
    const lao = (await page.locator('.lao').first().textContent().catch(() => '')) || ''
    console.log(`reader card ${i}: ${lao.trim().slice(0, 20)} audio buttons ${n}`)
    if (n) {
      await page.screenshot({ path: `${OUT}/a1_reader.png`, fullPage: true })
      const ok = await page.evaluate(async () => {
        const a = new Audio(document.querySelector('.audio-btn') && '')
        return true
      })
      await page.locator('.audio-btn').first().click()
      await page.waitForTimeout(800)
    }
    const next = page.getByRole('button', { name: 'Next' })
    if (!(await next.count())) break
    await next.first().click()
    await page.waitForTimeout(500)
  }
  for (let i = 0; i < 6; i++) {
    const n = await page.locator('.audio-btn').count()
    console.log(`step ${i}: audio buttons ${n}, credit "${(await page.locator('.audio-credit').allTextContents()).join('|')}"`)
    if (n) {
      await page.locator('.audio-btn').first().click()
      await page.waitForTimeout(500)
      await page.locator('.audio-report').first().click()
      await page.waitForTimeout(400)
      await page.screenshot({ path: `${OUT}/a1_report.png`, fullPage: true })
      console.log('report dialog open:', await page.locator('dialog[open]').count())
      await page.keyboard.press('Escape')
      break
    }
    const next = page.locator('.lesson-frame button.primary').last()
    if (!(await next.count())) break
    await next.click()
    await page.waitForTimeout(1200)
  }
  console.log('audio files fetched:', [...new Set(audioReqs)].join(', ') || 'none')
  await browser.close()
})().catch((e) => { console.error(e); process.exit(1) })
