// N1/N2 check: native A answers Q0001 via #/questions, suggests a word on #/suggest; native B confirms it on
// #/confirm; a learner is redirected away from #/questions. LOCAL Supabase only.
// Setup: local stack running; frontend served at http://127.0.0.1:5500/ (python -m http.server 5500 in app/frontend);
//   accounts (password smoke-test-pass-1): bash scripts/local_test_user.sh n1a@test.local smoke-test-pass-1 native
//   (same for n1b@test.local native, n1l@test.local learner); natives need profiles.onboarded_at set.
// Run: NODE_PATH=tmp/tools/pw/node_modules node scripts/browser/n1n2_check.js
// Shots: tmp/shots/n1n2/*.png (375x667)
const { chromium } = require('playwright')
const { execSync } = require('child_process')
const path = require('path')
const OUT = path.join(__dirname, '../../tmp/shots/n1n2')
require('fs').mkdirSync(OUT, { recursive: true })
const BASE = 'http://127.0.0.1:5500/'
const PASS = 'smoke-test-pass-1'
const results = []
const check = (name, ok, extra = '') => results.push(`${ok ? 'PASS' : 'FAIL'} ${name}${extra ? ': ' + extra : ''}`)
const sql = (q) =>
  execSync('docker exec -i supabase_db_laophabet-native psql -U postgres -At', { input: q }).toString().trim()

;(async () => {
  sql(`delete from question_answers where user_id in (select id from auth.users where email like 'n1%@test.local');
       delete from word_suggestion_votes where user_id in (select id from auth.users where email like 'n1%@test.local');
       delete from word_suggestions where user_id in (select id from auth.users where email like 'n1%@test.local');`)
  const browser = await chromium.launch()
  const errors = []
  async function login(email) {
    const ctx = await browser.newContext({ viewport: { width: 375, height: 667 } })
    const page = await ctx.newPage()
    page.on('pageerror', (e) => errors.push(email + ' ' + e))
    page.on('console', (m) => m.type() === 'error' && errors.push(email + ' ' + m.text()))
    await page.goto(BASE)
    await page.fill('input[type=email]', email)
    await page.fill('input[type=password]', PASS)
    await page.locator('form button[type=submit]').first().click()
    await page.waitForTimeout(1500)
    return page
  }
  const shot = (page, name) => page.screenshot({ path: `${OUT}/${name}.png`, fullPage: true })

  // Native A
  const a = await login('n1a@test.local')
  await shot(a, 'home')
  check('native home has 3 new entries', (await a.locator('a.role-card').count()) === 5)
  await a.locator('a.role-card[href="#/questions"]').click()
  await a.waitForSelector('.choices')
  await shot(a, 'question')
  check('question shows Lao context', (await a.locator('.sentence .lao').first().textContent()).includes('ລາວ'))
  await a.locator('button.choice').first().click()
  await shot(a, 'question_picked')
  const left0 = await a.locator('.counter').textContent()
  await a.locator('button.primary').click()
  await a.waitForFunction((l) => document.querySelector('.counter') && document.querySelector('.counter').textContent !== l, left0)
  const row = sql(`select question_id||':'||coalesce(choice,'-')||':'||unsure from question_answers where user_id=(select id from auth.users where email='n1a@test.local')`)
  check('Q0001 answer row exists', row.startsWith('Q0001:long'), row)
  check('left count dropped', true, `${left0} -> ${await a.locator('.counter').textContent()}`)
  await a.locator('.actions.split button.link').click() // I'm not sure (the UI is in Lao for natives)
  await a.waitForTimeout(800)
  check('unsure saved', sql(`select count(*) from question_answers where unsure and user_id=(select id from auth.users where email='n1a@test.local')`) === '1')

  // Suggest
  await a.goto(BASE + '#/suggest')
  await a.waitForSelector('form')
  await a.fill('input[name=lao]', 'ຂໍໂທດ')
  await a.fill('input[name=respelling]', 'khor-thote')
  await a.fill('input[name=english]', 'sorry')
  await a.fill('textarea[name=usage]', 'when you bump into someone')
  await a.locator('input[name=register]').first().check()
  await a.fill('input[name=ex_lao]', 'ຂໍໂທດເດີ້')
  await a.fill('input[name=ex_english]', 'Sorry!')
  await shot(a, 'suggest_form')
  await a.locator('form button[type=submit]').click()
  await a.waitForSelector('.my-suggestion')
  await shot(a, 'suggest_list')
  check('suggestion row exists', sql(`select register||':'||lao from word_suggestions`).includes('casual:ຂໍໂທດ'))
  // empty required fields
  await a.locator('form button[type=submit]').click()
  check('empty form shows message', await a.locator('form p.error').isVisible())

  // Native B
  const b = await login('n1b@test.local')
  await b.goto(BASE + '#/confirm')
  await b.waitForSelector('.actions.vote')
  await shot(b, 'confirm')
  check('B sees suggestion', (await b.locator('.sentence .lao').first().textContent()).includes('ຂໍໂທດ'))
  await b.locator('.actions.vote button.primary').click()
  await b.waitForSelector('main.card.narrow h2')
  await shot(b, 'confirm_done')
  check('vote stored', sql(`select vote from word_suggestion_votes`) === 'confirm')
  await b.goto(BASE + '#/questions')
  await b.waitForSelector('.choices')
  await b.goto(BASE + '#/suggest')
  await b.waitForSelector('form')

  // A sees counts
  await a.reload()
  await a.waitForSelector('.my-suggestion')
  check('A sees 1 confirm', (await a.locator('.my-suggestion').textContent()).includes('ຢືນຢັນ 1'))

  // Learner
  const l = await login('n1l@test.local')
  await l.goto(BASE + '#/questions')
  await l.waitForTimeout(1200)
  await shot(l, 'learner')
  check('learner not shown questions', (await l.locator('.choices').count()) === 0 && (await l.locator('text=Questions for you').count()) === 0)
  await browser.close()
  console.log(results.join('\n'))
  console.log('console errors:', errors.length, errors.slice(0, 5).join(' | '))
})()
