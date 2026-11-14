// Alpha readiness check: the sign-up questions (intake), Settings → Send feedback, and the "All lessons" links.
// The test learner's learner_intake row must be deleted first, so the questions show:
//   docker exec -i <db> psql -U postgres -c "delete from learner_intake where user_id = (select id from auth.users where email = 'a1smoke@test.local')"
// Setup as a7_shots.js. Run: NODE_PATH=tmp/tools/pw/node_modules node scripts/browser/alpha_check.js a1smoke@test.local smoke-test-pass-1
// Shots: tmp/shots/alpha/*.png
const { chromium } = require('playwright')
const path = require('path')
const [email, password] = process.argv.slice(2)
const OUT = path.join(__dirname, '../../tmp/shots/alpha')
require('fs').mkdirSync(OUT, { recursive: true })
const BASE = 'http://127.0.0.1:5500/'
const results = []
const check = (name, ok, extra = '') => results.push(`${ok ? 'PASS' : 'FAIL'} ${name}${extra ? ': ' + extra : ''}`)

;(async () => {
  const browser = await chromium.launch()
  const page = await browser.newPage({ viewport: { width: 375, height: 812 } })
  const errors = []
  page.on('pageerror', (e) => errors.push(String(e)))
  page.on('console', (m) => m.type() === 'error' && errors.push(m.text()))
  await page.goto(BASE)
  await page.fill('input[type=email]', email)
  await page.fill('input[type=password]', password)
  await page.locator('form button[type=submit]').first().click()
  await page.waitForSelector('h1')
  await page.waitForTimeout(1000)

  // 1. Intake shows, answers save, then home.
  const title = await page.locator('h1').first().textContent()
  check('intake shows after sign-in', title.includes('Before you start'), title)
  await page.screenshot({ path: `${OUT}/intake_375.png`, fullPage: true })
  await page.getByLabel('Some basic phrases').check()
  await page.getByLabel('Read Lao').check()
  await page.getByLabel('Speak Lao').check()
  await page.getByLabel('Family').check()
  await page.getByLabel('13–17').check()
  await page.getByRole('button', { name: 'Save and start' }).click()
  await page.waitForSelector('.tiles')
  check('home after intake', await page.locator('.tiles').isVisible())

  // 2. Reload: no intake again.
  await page.reload()
  await page.waitForSelector('.tiles')
  check('intake not shown again', !(await page.getByText('Before you start').count()))

  // 3. Settings → Send feedback → send → Done returns to Settings.
  await page.goto(BASE + '#/lessons')
  await page.waitForSelector('.lesson-path, main h1')
  await page.goto(BASE + '#/settings')
  await page.getByRole('link', { name: 'Send feedback' }).click()
  await page.waitForSelector('textarea')
  await page.screenshot({ path: `${OUT}/feedback_375.png`, fullPage: true })
  await page.getByRole('button', { name: 'Send' }).click()
  check('empty message not sent', (await page.locator('[role=status]').textContent()) === '')
  await page.fill('textarea', 'alpha_check test message')
  await page.getByRole('button', { name: 'Send' }).click()
  await page.getByText('Sent. Thank you!').waitFor()
  check('feedback sent', true)
  await page.getByRole('button', { name: 'Done' }).click()
  await page.waitForTimeout(300)
  check('Done returns to settings', page.url().endsWith('#/settings'), page.url())

  // 4. "All lessons" in the reader goes to #/lessons.
  await page.goto(BASE + '#/read/L0001/1')
  await page.getByRole('link', { name: 'All lessons' }).click()
  await page.waitForTimeout(300)
  check('reader All lessons → #/lessons', page.url().endsWith('#/lessons'), page.url())

  check('no console errors', errors.length === 0, errors.join(' | '))
  console.log(results.join('\n'))
  await browser.close()
})()
