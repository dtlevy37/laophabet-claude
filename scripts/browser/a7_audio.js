// A7 step 5 check: play a dry run (#/try/<lesson>) with the keyboard and check, on every screen, that no ⚑ (report)
// shows on the card face (.stage innerText; a closed "More" is not rendered, so it does not count), and that Space
// plays (counts HTMLMediaElement.play calls). After answers it opens ⓘ sheets until one has a recording: the sheet's
// open "More" must show the voice credit and "⚑ Report a problem…"; the report dialog opens, a kind is picked, a
// note typed, Send, and "Thank you" must appear (report_content on the local DB: one learner_reports row per run).
// Screenshots: tmp/shots/a7/audio_{card,sheet,report,build}_<width>_<mode>.png (a word card, the ⓘ sheet, the report
// dialog, a build-the-word question with its how-to).
// Setup: as a3_play_lesson.js (playwright in tmp/tools/pw, app/frontend served on :5500, scripts/local_test_user.sh).
// Run: NODE_PATH=tmp/tools/pw/node_modules node scripts/browser/a7_audio.js a1smoke@test.local smoke-test-pass-1 L0002 [375|1280] [light|dark]
const { chromium } = require('playwright')
const path = require('path')
const [email, password, lesson = 'L0002', w = '375', mode = 'light'] = process.argv.slice(2)
const width = Number(w)
const OUT = path.join(__dirname, '../../tmp/shots/a7')
require('fs').mkdirSync(OUT, { recursive: true })
const shot = (page, name) => page.screenshot({ path: `${OUT}/audio_${name}_${width}_${mode}.png` })
;(async () => {
  const browser = await chromium.launch()
  const page = await browser.newPage({ viewport: { width, height: width < 500 ? 812 : 800 }, colorScheme: mode })
  await page.addInitScript(() => {
    window.__plays = 0
    const play = HTMLMediaElement.prototype.play
    HTMLMediaElement.prototype.play = function () {
      window.__plays++
      return play.call(this).catch(() => {})
    }
  })
  const errors = []
  page.on('pageerror', (e) => errors.push(String(e)))
  page.on('console', (m) => m.type() === 'error' && !/Failed to load resource|NotSupportedError|no supported source/i.test(m.text()) && errors.push(m.text()))
  await page.goto('http://127.0.0.1:5500/')
  await page.fill('input[type=email]', email)
  await page.fill('input[type=password]', password)
  await page.locator('form button[type=submit], form button.primary').first().click()
  await page.waitForTimeout(2500)
  await page.goto(`http://127.0.0.1:5500/#/try/${lesson}`)
  await page.waitForSelector('.stage')
  const closeDialogs = () => page.evaluate(() => {
    document.querySelectorAll('dialog[open]').forEach((d) => d.close())
    document.activeElement?.blur() // focus returns to the ⓘ, where Enter would open it again
  })
  let flagSeen = 0
  let spaceOk = null
  let sheet = null // true once a report was sent from an ⓘ sheet
  let cardShot = false
  let buildShot = false
  let tried = 0
  for (let n = 0; n < 600; n++) {
    if (!(await page.locator('.stage').count())) break
    await page.waitForTimeout(80)
    if (await page.evaluate(() => (document.querySelector('.stage')?.innerText || '').includes('⚑'))) flagSeen++
    const wordCard = (await page.locator('.stage .teach').count()) && /lao word/i.test(await page.locator('.stage .teach').first().innerText())
    if (!cardShot && wordCard && (await page.locator('.stage .teach .audio-btn').count())) {
      await shot(page, 'card')
      cardShot = true
    }
    if (!buildShot && (await page.locator('.stage .bw-meaning').count()) && (await page.locator('.stage .howto').count())) {
      await shot(page, 'build')
      buildShot = true
    }
    if (spaceOk === null && (await page.locator('.stage .audio-btn').count())) {
      const before = await page.evaluate(() => window.__plays)
      await page.evaluate(() => document.activeElement?.blur())
      await page.keyboard.press(' ')
      await page.waitForTimeout(200)
      spaceOk = (await page.evaluate(() => window.__plays)) > before
    }
    // ⓘ sheets: try each untried info button on this screen until one has a recording
    const infos = page.locator('.stage .info-btn:visible:not([data-tried])')
    while (sheet === null && (await infos.count())) {
      const btn = await infos.first().elementHandle()
      await btn.evaluate((b) => b.setAttribute('data-tried', '1'))
      await btn.click()
      await page.waitForSelector('dialog.info[open]')
      const report = page.locator('dialog.info[open] .audio-report')
      if (!(await report.count())) {
        await closeDialogs()
        if (++tried > 25) sheet = false
        continue
      }
      const credit = await page.locator('dialog.info[open] .audio-credit').count()
      await report.scrollIntoViewIfNeeded()
      await shot(page, 'sheet')
      await report.click()
      await page.waitForSelector('dialog.confirm[open]')
      const dlg = page.locator('dialog.confirm[open]')
      await dlg.locator('input[type=radio]').first().check()
      await dlg.locator('textarea').fill('a7_audio.js test report')
      await shot(page, 'report')
      await dlg.locator('button.primary').click()
      await page.waitForFunction(() => /Thank you|could not be sent/.test(document.querySelector('dialog.confirm[open] [role=status]')?.textContent || ''), null, { timeout: 8000 })
      const sent = /Thank you/.test(await dlg.locator('[role=status]').textContent())
      console.log(`ⓘ sheet: voice credit shown ${credit > 0}; report sent ${sent}`)
      sheet = sent && credit > 0
      await closeDialogs()
    }
    const opts = page.locator('.stage button.mc-option:not([disabled])')
    if (await opts.count()) await page.keyboard.press('1')
    else if (await page.locator('.stage .bs-bank > button:not([disabled]):not(.wrong)').count()) {
      const kids = await page.locator('.stage .bs-bank > *').evaluateAll((els) => els.map((e) => e.matches('button:not(:disabled):not(.wrong)')))
      const ok = kids.map((v, i) => (v ? i : -1)).filter((i) => i >= 0 && i < 9)
      if (ok.length) await page.keyboard.press(String(ok[Math.floor(Math.random() * ok.length)] + 1))
      else await page.locator('.stage .bs-bank > button:not([disabled]):not(.wrong)').first().click()
    } else await page.keyboard.press('Enter')
  }
  const ended = !(await page.locator('.stage').count())
  if (!ended) {
    await shot(page, 'stuck')
    console.log('stuck on:', (await page.locator('.stage').innerText()).slice(0, 300), '| dialogs open:', await page.locator('dialog[open]').count())
  }
  console.log(
    `${lesson} ${width} ${mode}: reached end ${ended}; screens with ⚑ on the face: ${flagSeen}; Space played: ${spaceOk}; ` +
      `report sent from an ⓘ sheet: ${sheet}; shots: card ${cardShot}, build ${buildShot}`,
  )
  if (errors.length) console.log('errors:', errors.join(' | '))
  await browser.close()
  process.exit(ended && flagSeen === 0 && spaceOk && sheet && !errors.length ? 0 : 1)
})().catch((e) => {
  console.error(e)
  process.exit(1)
})
