// N3 one recording flow: native home (welcome, Start here, Message the team), #/review -> Record, then on #/record:
// record the original + style + details, "I'd say it differently" + own version, "not sure what it means", Skip.
// LOCAL Supabase only; Chromium's fake microphone. Setup as n1n2_check.js (n1a@test.local native, onboarded).
// Run: NODE_PATH=tmp/tools/pw/node_modules node scripts/browser/n3_record.js
// Shots: tmp/shots/n3/*.png (375x667)
const { chromium } = require('playwright')
const { execSync } = require('child_process')
const path = require('path')
const OUT = path.join(__dirname, '../../tmp/shots/n3')
require('fs').mkdirSync(OUT, { recursive: true })
const BASE = 'http://127.0.0.1:5500/'
const EMAIL = 'n1a@test.local'
const results = []
const check = (name, ok, extra = '') => results.push(`${ok ? 'PASS' : 'FAIL'} ${name}${extra ? ': ' + extra : ''}`)
const sql = (q) => execSync('docker exec -i supabase_db_laophabet-native psql -U postgres -At', { input: q }).toString().trim()
const UID = `(select id from auth.users where email='${EMAIL}')`

;(async () => {
  sql(`delete from item_recordings where user_id=${UID}; update profiles set voice_consent_at=now() where id=${UID};`)
  const browser = await chromium.launch({ args: ['--use-fake-ui-for-media-stream', '--use-fake-device-for-media-stream'] })
  const ctx = await browser.newContext({ viewport: { width: 375, height: 667 }, permissions: ['microphone'] })
  const page = await ctx.newPage()
  const errors = []
  page.on('pageerror', (e) => errors.push(String(e)))
  page.on('console', (m) => m.type() === 'error' && errors.push(m.text()))
  const shot = (name) => page.screenshot({ path: `${OUT}/${name}.png`, fullPage: true })

  await page.goto(BASE)
  await page.fill('input[type=email]', EMAIL)
  await page.fill('input[type=password]', 'smoke-test-pass-1')
  await page.locator('form button[type=submit]').first().click()
  await page.waitForSelector('a.role-card')
  await page.waitForTimeout(800)
  await shot('home')
  check('welcome on first visit', await page.locator('p.welcome').isVisible())
  check('Start here on Record', await page.locator('a[href="#/record"] .start-here').isVisible())
  check('Message the team entry', await page.locator('a[href="#/message"]').isVisible())
  check('no Check sentences entry', (await page.locator('a[href="#/review"]').count()) === 0)
  await page.goto(BASE + '#/message')
  await page.waitForSelector('textarea')
  check('#/message shows the feedback form', true)
  await page.goto(BASE + '#/')
  await page.waitForSelector('a.role-card')
  await page.locator('a[href="#/record"]').click(); await page.goto(BASE + '#/'); await page.waitForSelector('a.role-card')
  check('welcome gone after a task was opened', (await page.locator('p.welcome').count()) === 0)

  // #/review opens Record (tips first: new browser)
  await page.goto(BASE + '#/review')
  // tips show once per page load: the Record visit above may already have used them
  await page.waitForSelector('.tips, .sentence .lao')
  if (await page.locator('.tips').count()) await page.locator('main button.primary').click()

  async function record(scope = 'main') {
    await page.locator('.recorder:visible .rec-big').click()
    await page.waitForTimeout(1200)
    await page.locator('.recorder:visible .rec-big').click() // Stop
    await page.waitForSelector('.recorder:visible audio')
  }
  const current = async () => (await page.locator('.sentence .lao').first().textContent()).trim()

  // 1 original + style + details
  try { await page.waitForSelector('.sentence .lao', { timeout: 8000 }) } catch (e) { await shot('fail'); console.log('FAIL first item', errors.join(' | '), await page.locator('main').innerText()); await browser.close(); return }
  const kind1 = await page.locator('.muted').nth(1).textContent()
  check('English always shown', await page.locator('.sentence .english').isVisible())
  await shot('item')
  await record()
  const toggles = page.locator('.toggles button')
  const nStyles = await toggles.count()
  check('style row after take (word)', nStyles === 5, `${nStyles} buttons, ${kind1}`)
  await toggles.nth(2).click() // casual
  await toggles.nth(2).click() // unselect
  check('second tap unselects', (await page.locator('.toggles button[aria-pressed=true]').count()) === 0)
  await toggles.nth(0).click()
  await toggles.nth(2).click() // formal then casual: only casual
  check('max one selected', (await page.locator('.toggles button[aria-pressed=true]').count()) === 1)
  await shot('after_take')
  await page.locator('.save-row button:not(.primary)').click() // Save + more details
  await page.waitForSelector('h2')
  await shot('details')
  const fs = page.locator('fieldset')
  check('details has 5 questions (word)', (await fs.count()) === 5, String(await fs.count()))
  await fs.nth(0).locator('button').nth(0).click() // name: yes
  await fs.nth(1).locator('button').nth(0).click() // every day
  await fs.nth(4).locator('button').nth(1).click() // English right? no -> note
  await page.locator('fieldset:nth-of-type(5) textarea').fill('test note')
  await page.locator('main .actions.split button.primary').click()
  await page.waitForTimeout(1200)
  const r1 = sql(`select register||'|'||could_be_name||'|'||frequency||'|'||english_ok||'|'||coalesce(english_note,'-') from item_recordings where user_id=${UID} and not skipped order by created_at limit 1`)
  check('take 1 saved with style and details', r1 === 'casual|true|daily|false|test note', r1)

  // 2 I'd say it differently
  await page.waitForSelector('.sentence .lao')
  const lao2 = await current()
  await page.locator('section:not([hidden]) > .item-links button.link').first().click()
  const ta = page.locator('textarea.lao-input')
  check('own box starts with the original', (await ta.inputValue()) === lao2)
  await ta.fill(lao2 + 'ແດ່')
  await record()
  await shot('own_version')
  await page.locator('.save-row button.primary').click()
  await page.waitForTimeout(1200)
  const r2 = sql(`select is_natural||'|'||spoken_lao from item_recordings where user_id=${UID} and not skipped order by created_at desc limit 1`)
  check('own version saved as not natural', r2 === `false|${lao2}ແດ່`, r2)

  // 3 not sure what it means
  await page.waitForSelector('.sentence .lao')
  await page.locator('section:not([hidden]) > .item-links button.link').first().click()
  await page.locator('.own-links button').first().click()
  await page.waitForTimeout(1000)
  // 4 plain skip
  await page.waitForSelector('.sentence .lao')
  await page.locator('section:not([hidden]) > .item-links button.link').nth(1).click()
  await page.waitForTimeout(1000)
  const skips = sql(`select coalesce(skip_reason,'null') from item_recordings where user_id=${UID} and skipped order by created_at`)
  check('skips: unclear_meaning then plain', skips.replace(/\s+/g, ',') === 'unclear_meaning,null', skips)

  check('no console errors', errors.length === 0, errors.join(' | '))
  sql(`delete from item_recordings where user_id=${UID};`)
  await browser.close()
  console.log(results.join('\n'))
})()
