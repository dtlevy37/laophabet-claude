// U1 + U2 check at 375px.
//  U1: mid-question in #/try/L0005, open the ⚙ sheet, change the romanization style, close it: the same step shows the
//      new style (the step counter is unchanged and the question is still on screen). Esc closes the sheet and does not
//      open the leave dialog. The top bar has ⚙ on the home screen.
//  U2: on a fill-in-the-blank question in #/try/L0010, ⚑ -> "my answer should be right" -> Send; the row in app_feedback
//      (local DB, read with docker exec psql) carries the lesson, step, item ids, options and the learner's answer.
//      The dialog fits the 375px width.
// Setup: playwright in tmp/tools/pw, app/frontend served on :5500 (python -m http.server 5500 in app/frontend),
//        scripts/local_test_user.sh, local Supabase running.
// Run: NODE_PATH=tmp/tools/pw/node_modules node scripts/browser/u1u2_check.js [email] [password]
const { chromium } = require('playwright')
const { execFileSync } = require('child_process')
const [email = 'a1smoke@test.local', password = 'smoke-test-pass-1'] = process.argv.slice(2)
const BASE = 'http://127.0.0.1:5500/'
const DB = 'supabase_db_laophabet-native'
let failed = 0
const check = (name, ok, extra = '') => {
  if (!ok) failed++
  console.log(`${ok ? 'ok  ' : 'FAIL'} ${name}${extra ? ' - ' + extra : ''}`)
}

async function stepCounter(page) {
  return (await page.locator('.session-counter').first().innerText().catch(() => '')).trim()
}

;(async () => {
  const browser = await chromium.launch()
  const page = await browser.newPage({ viewport: { width: 375, height: 812 } })
  const errors = []
  page.on('pageerror', (e) => errors.push(String(e)))
  await page.goto(BASE)
  await page.evaluate(() => localStorage.setItem('laophabet.settings', JSON.stringify({ translit: 'standard', autoplay: false })))
  await page.reload()
  await page.fill('input[type=email]', email)
  await page.fill('input[type=password]', password)
  await page.locator('form button[type=submit], form button.primary').first().click()
  await page.waitForTimeout(2500)

  // top bar on home
  check('home top bar has ⚙ and ⚑', (await page.locator('#topbar button[aria-label="Settings"]').count()) === 1 && (await page.locator('#topbar button[aria-label="Report a problem"]').count()) === 1)
  await page.locator('#topbar button[aria-label="Settings"]').click()
  check('home: settings sheet opens', await page.locator('dialog.sheet[open]').isVisible())
  await page.keyboard.press('Escape')
  await page.waitForTimeout(200) // the close event (and the dialog's removal) is async
  check('home: Esc closes the sheet', (await page.locator('dialog.sheet').count()) === 0)

  // ---- U1 in a lesson
  await page.goto(BASE + '#/try/L0005')
  await page.waitForSelector('.stage')
  // move to the first unanswered pick-one question (its options show sounds in the chosen style)
  let before = ''
  for (let n = 0; n < 30; n++) {
    if (await page.locator('.stage button.mc-option:not([disabled])').count()) {
      before = await page.locator('.stage').innerText()
      break
    }
    await page.keyboard.press('Enter')
    await page.waitForTimeout(150)
  }
  const counter = await stepCounter(page)
  const stageBefore = before || (await page.locator('.stage').innerText())
  await page.locator('.lesson-head button[aria-label="Settings"]').click()
  await page.waitForSelector('dialog.sheet[open]')
  const box = await page.locator('dialog.sheet').boundingBox()
  check('sheet fits 375px', box && box.x >= 0 && box.x + box.width <= 375, JSON.stringify(box))
  // Esc closes the sheet and not the lesson / the leave dialog
  await page.keyboard.press('Escape')
  check('Esc closes the sheet, no leave dialog', (await page.locator('dialog[open]').count()) === 0 && page.url().includes('#/try/L0005'))
  await page.locator('.lesson-head button[aria-label="Settings"]').click()
  await page.locator('dialog.sheet input[name^="translit"]').nth(1).check()
  await page.locator('dialog.sheet button.primary').click()
  await page.waitForTimeout(300)
  const stageAfter = await page.locator('.stage').innerText()
  check('same step after closing', (await stepCounter(page)) === counter && page.url().includes('#/try/L0005'), `${counter}`)
  check('new romanization style shows on the same step', stageAfter !== stageBefore, before ? '' : '(no respelling found on a step; text compared)')
  check('setting saved', (await page.evaluate(() => JSON.parse(localStorage.getItem('laophabet.settings')).translit)) === 'english')
  // the lesson continues
  await page.keyboard.press('Enter')
  await page.waitForTimeout(200)

  // ---- U2 from a fill in the blank
  await page.goto(BASE + '#/try/L0010')
  await page.waitForSelector('.stage')
  let found = false
  for (let n = 0; n < 80 && !found; n++) {
    if (await page.locator('.stage .fb-sentence').count()) {
      found = true
      break
    }
    if (await page.locator('.stage button.mc-option:not([disabled])').count()) await page.keyboard.press('1')
    else await page.keyboard.press('Enter')
    await page.waitForTimeout(120)
  }
  check('reached a fill in the blank in L0010', found)
  if (found) {
    await page.locator('.stage button.mc-option:not([disabled])').first().click() // the learner answers (wrong or right)
    await page.waitForTimeout(200)
    const note = 'u1u2 check ' + Date.now()
    await page.locator('.lesson-head button[aria-label="Report a problem"]').click()
    await page.waitForSelector('dialog.report-dialog[open]')
    const d = await page.locator('dialog.report-dialog').boundingBox()
    check('report dialog fits 375px', d && d.x >= 0 && d.x + d.width <= 375 && d.y >= 0 && d.y + d.height <= 812, JSON.stringify(d))
    check('Send disabled until a kind is chosen', await page.locator('dialog.report-dialog button.primary').isDisabled())
    await page.locator('dialog.report-dialog label', { hasText: 'should have counted' }).click()
    await page.locator('dialog.report-dialog textarea').fill(note)
    await page.locator('dialog.report-dialog button.primary').click()
    await page.waitForSelector('dialog.report-dialog .primary:has-text("Close")', { timeout: 5000 }).catch(() => {})
    check('thanks shown', /thank you/i.test(await page.locator('dialog.report-dialog').innerText()))
    await page.locator('dialog.report-dialog button.primary').click()
    const sql = `select kind, message, route, context from public.app_feedback where message = '${note}'`
    const out = execFileSync('docker', ['exec', '-i', DB, 'psql', '-U', 'postgres', '-At', '-F', '|', '-c', sql]).toString().trim()
    console.log(out)
    const [kind, , route, ctx] = out.split('|')
    const c = ctx ? JSON.parse(ctx) : {}
    check('stored kind and route', kind === 'answer_right' && route === '#/try/L0010')
    check('context has lesson, step, activity', c.lesson === 'L0010' && c.step > 0 && c.activity === 'fill_blank')
    check('context has item ids and options', !!c.item?.id && Array.isArray(c.options) && c.options.length >= 3 && Array.isArray(c.word_ids))
    check("context has the learner's answer", !!c.answer_on_screen?.chosen && !!c.answer_on_screen?.result)
    check('context has settings, version, viewport', c.settings?.translit === 'english' && !!c.app_version && c.viewport === '375x812')
  }
  check('no page errors', errors.length === 0, errors.join('; '))
  await browser.close()
  console.log(failed ? `U1U2 FAILED (${failed})` : 'U1U2 OK')
  process.exit(failed ? 1 : 0)
})().catch((e) => {
  console.error(e)
  process.exit(1)
})
