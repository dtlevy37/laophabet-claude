import { supabase } from './supabase.js'
import { t } from './i18n.js'
import { h } from './dom.js'
import { toneContour } from './tone.js'
import { getSetting, translitChoice } from './settings.js'
import { respell } from './translit.js'

// Learner view, read-only (APP_PLAN S4). Hash routes:
//   #/                     lesson list (list_lessons RPC)
//   #/lesson/L0001[/n]     the lesson's teach cards, card n (get_lesson RPC)
// No scoring or progress yet; the info icon opens an item's teach card in a dialog (APP_DESIGN).

const card = (...kids) => h('main', { class: 'card' }, kids)
const bundles = new Map() // lesson_id -> get_lesson bundle, kept for the page's lifetime
let renderToken = 0

function parseHash() {
  const m = location.hash.match(/^#\/lesson\/(L\d{4})(?:\/(\d+))?$/)
  return m ? { lessonId: m[1], index: Math.max(0, Number(m[2] || 1) - 1) } : {}
}

export function showLearnerHome(root, { profile }) {
  const token = ++renderToken
  const stale = () => token !== renderToken
  const { lessonId, index } = parseHash()
  return lessonId ? showLesson(root, lessonId, index, stale) : showLessonList(root, profile, stale)
}

// ------------------------------------------------------------------ lesson list
async function showLessonList(root, profile, stale) {
  root.replaceChildren(card(t('loading')))
  const { data, error } = await supabase.rpc('list_lessons')
  if (stale()) return
  const greeting = profile.display_name ? `${t('learn_welcome')}, ${profile.display_name}` : t('learn_welcome')
  if (error) {
    console.error(error)
    return root.replaceChildren(card(h('h1', null, greeting), h('p', { class: 'error' }, t('lesson_load_error'))))
  }
  const lessons = data || []
  root.replaceChildren(
    card(
      h('h1', null, greeting),
      lessons.length
        ? [
            h('h2', null, t('learn_lessons')),
            h(
              'ol',
              { class: 'lesson-list' },
              lessons.map((l) =>
                h(
                  'li',
                  null,
                  h(
                    'a',
                    { href: `#/lesson/${l.lesson_id}`, class: 'lesson-link' },
                    h('span', { class: 'lesson-num' }, l.lesson_order),
                    h('span', null, h('strong', null, l.title_en), h('span', { class: 'muted block' }, l.summary_en)),
                  ),
                ),
              ),
            ),
          ]
        : h('p', { class: 'muted' }, t('learn_coming_soon')),
    ),
  )
}

// ------------------------------------------------------------------ one lesson
async function showLesson(root, lessonId, index, stale) {
  let bundle = bundles.get(lessonId)
  if (!bundle) {
    root.replaceChildren(card(t('loading')))
    const { data, error } = await supabase.rpc('get_lesson', { p_lesson_id: lessonId })
    if (stale()) return
    if (error || !data) {
      if (error) console.error(error)
      return root.replaceChildren(
        card(h('p', { class: 'error' }, t(error ? 'lesson_load_error' : 'lesson_not_found')), backToList()),
      )
    }
    bundle = data
    bundles.set(lessonId, bundle)
  }
  const { lesson } = bundle
  // Lesson 1 opens with two intro cards about how the app shows Lao sounds (user, 2026-11-09).
  const items = [...(lesson.lesson_order === 1 ? INTRO : []), ...cardItems(bundle.items)]
  if (!items.length) return root.replaceChildren(card(h('h1', null, lesson.title_en), backToList()))
  const i = Math.min(index, items.length - 1)
  const at = (n) => `#/lesson/${lessonId}/${n + 1}`
  const last = i === items.length - 1

  root.replaceChildren(
    card(
      h(
        'div',
        { class: 'lesson-head' },
        backToList(),
        h('span', { class: 'muted' }, `${t('learn_lesson')} ${lesson.lesson_order} · ${i + 1} / ${items.length}`),
      ),
      teachCard(items[i], bundle, {
        explainCircle: lesson.lesson_order === 1 && items[i] === firstCircle(items),
        chooseStyle: lesson.lesson_order === 1 && items[i] === items.find((it) => it.item_type === 'unit'),
      }),
      h(
        'div',
        { class: 'actions' },
        i > 0 ? h('button', { onclick: () => (location.hash = at(i - 1)) }, t('lesson_prev')) : null,
        h(
          'button',
          { class: 'primary', onclick: () => (location.hash = last ? '#/' : at(i + 1)) },
          t(last ? 'lesson_finish' : 'lesson_next'),
        ),
      ),
    ),
  )
}

// A same-sound letter (ງ ນ ມ) is taught at the start and the end together (LESSON_PLAN decision 10). The lesson
// lists both units; the final one folds into the initial one's card, whose text covers both positions.
function cardItems(items) {
  const initials = new Map(
    items.filter((it) => it.item_type === 'unit' && it.detail?.role === 'initial').map((it) => [it.detail.base_id, it.detail]),
  )
  const kept = items.filter((it) => {
    const d = it.detail
    if (it.item_type !== 'unit' || d?.role !== 'final') return true
    const first = initials.get(d.base_id)
    const same = first && first.letter?.ipa === d.letter?.ipa && !(d.letter?.respelling || '').includes('(final')
    return !same
  })
  // Homographs taught together (ລາວ "he, she" and ລາວ "Lao") share one card that lists each meaning on its own
  // line (APP_DESIGN "Presentation"). The lesson lists them as neighbouring word items with the same spelling.
  const out = []
  for (const it of kept) {
    const prev = out[out.length - 1]
    const twin =
      it.item_type === 'word' && prev?.item_type === 'word' && prev.role === it.role && prev.detail?.lao === it.detail?.lao
    if (!twin) out.push(it)
    else {
      const glosses = [...(prev.detail.glosses || [prev.detail.gloss_en]), it.detail.gloss_en].filter(Boolean)
      out[out.length - 1] = { ...prev, detail: { ...prev.detail, glosses } }
    }
  }
  return out
}

// Alternatives in a translation or a list of meanings, one per line (never joined with "or").
const lines = (parts) => parts.map((p, n) => [n ? h('br') : null, p])

// The first card of the course that shows the dotted circle ◌ (lesson 1 only). Its front explains that the
// circle is a placeholder, not a letter (user, 2026-11-09). Later cards keep the note under "More".
const firstCircle = (items) => items.find((it) => it.item_type === 'unit' && (it.detail?.lao || '').includes('◌'))

const backToList = () => h('a', { href: '#/', class: 'link' }, t('lesson_back_to_list'))

// ------------------------------------------------------------------ teach cards
// One card per lesson item. The same builder fills the info dialog.
// The front is a small table: labelled cells (Lao letter | Sounds like, or Lao word | Sounds like, Means, Tone)
// with large content under small labels, then one line of text. Everything else sits in a closed "More" section
// (open in the info dialog). Nothing the learner has not been taught is shown, such as a letter's name word.
function teachCard(item, bundle, { inDialog = false, explainCircle = false, chooseStyle = false } = {}) {
  if (item.item_type === 'intro') return h('section', { class: 'teach' }, introBody())
  const d = item.detail || {}
  const body =
    item.item_type === 'unit'
      ? unitBody(d, inDialog, explainCircle, chooseStyle)
      : item.item_type === 'word'
        ? wordBody(d, inDialog)
        : item.item_type === 'rule'
          ? ruleBody(d)
          : sentenceBody(d, bundle)
  return h(
    'section',
    { class: 'teach' },
    inDialog ? null : h('span', { class: `badge ${item.role}` }, t(`badge_${item.role}`)),
    body,
  )
}

// The tutorial cards at the start of lesson 1: Lao sounds do not map neatly onto English letters, and the learner
// picks how they want the sounds written (changeable later in Settings). App text, not lesson content.
const INTRO = [{ item_type: 'intro', item_id: 'sounds' }]

function introBody() {
  return [h('h2', null, t('intro_sounds_title')), h('p', null, t('intro_sounds_1')), h('p', null, t('intro_sounds_2'))]
}

// The transliteration choice sits on the first letter card of lesson 1 (ກ), where the learner has a real example
// in front of them (user, 2026-11-09). Picking a style redraws the card so "Sounds like" changes at once.
function styleChoice() {
  return h(
    'div',
    { class: 'style-choice' },
    h('h3', null, t('intro_style_title')),
    h('p', null, t('intro_style_1')),
    h('p', null, t('intro_style_2')),
    translitChoice(() => window.dispatchEvent(new Event('hashchange'))),
    h('p', { class: 'muted' }, t('intro_style_later')),
  )
}

// Background reading for the terms used under "More" (Wikipedia; opens in a new tab).
const WIKI = {
  aspiration: 'https://en.wikipedia.org/wiki/Aspirated_consonant',
  vowel_length: 'https://en.wikipedia.org/wiki/Vowel_length',
  tone: 'https://en.wikipedia.org/wiki/Tone_(linguistics)',
  ipa: 'https://en.wikipedia.org/wiki/Help:IPA/Lao',
  script: 'https://en.wikipedia.org/wiki/Lao_script',
}
const PUFF_PAIRS = new Set(['k', 'kʰ', 'p', 'pʰ', 't', 'tʰ'])

function readMore(keys) {
  const kept = keys.filter(Boolean)
  if (!kept.length) return null
  return h(
    'p',
    { class: 'muted read-more' },
    t('label_read_more'),
    ' ',
    kept.map((k, n) => [
      n ? ' · ' : null,
      h('a', { href: WIKI[k], target: '_blank', rel: 'noopener noreferrer' }, t(`wiki_${k}`)),
    ]),
  )
}

function unitBody(u, open, explainCircle = false, chooseStyle = false) {
  const sound = u.letter || u.vowel || {}
  const raw = soundOf(u, sound.respelling)
  // finals sound the same in both transliteration styles; only initials are converted (translit.js)
  const says = u.role === 'final' ? raw : respell(raw)
  return [
    h(
      'div',
      { class: 'teach-grid' },
      cell(t(u.kind === 'vowel' ? 'card_lao_vowel' : u.kind === 'consonant' ? 'card_lao_letter' : 'card_lao_mark'), h('span', { class: 'glyph lao', lang: 'lo' }, u.lao)),
      says ? cell(t('card_sounds_like'), h('span', { class: 'cell-big' }, says)) : null,
    ),
    u.teach_en ? h('p', { class: 'center hint' }, u.teach_en) : null,
    explainCircle ? h('p', { class: 'center muted' }, t('unit_dotted_circle_first')) : null,
    chooseStyle ? styleChoice() : null,
    more(open, [
      h('p', { class: 'muted' }, unitLabel(u)),
      u.lao.includes('◌') ? h('p', { class: 'muted' }, t('unit_dotted_circle')) : null,
      facts([
        sound.ipa ? [t('label_ipa'), `/${sound.ipa}/`] : null,
        u.letter ? [t('label_class'), u.letter.consonant_class] : null,
        u.vowel ? [t('label_length'), u.vowel.length] : null,
      ]),
      sound.pron_tip ? h('p', null, sound.pron_tip) : null,
      readMore([
        u.kind === 'consonant' && PUFF_PAIRS.has(sound.ipa) ? 'aspiration' : null,
        u.kind === 'vowel' ? 'vowel_length' : null,
        u.kind === 'tone-mark' ? 'tone' : null,
        sound.ipa ? 'ipa' : null,
        'script',
      ]),
    ]),
  ]
}

function wordBody(w, open) {
  const syllables = w.syllables || []
  const tones = w.tones || []
  const tonePics = toneRow(syllables, tones)
  return [
    h(
      'div',
      { class: 'teach-grid' },
      cell(t('card_lao_word'), h('span', { class: 'glyph lao', lang: 'lo' }, w.lao)),
      w.respelling ? cell(t('card_sounds_like'), h('span', { class: 'cell-big' }, respell(w.respelling))) : null,
      w.gloss_en ? cell(t('card_means'), h('span', { class: 'cell-mid' }, lines(w.glosses || [w.gloss_en]))) : null,
      tonePics ? cell(t('label_tones'), tonePics) : null,
    ),
    more(open, [
      facts([
        w.ipa ? [t('label_ipa'), `/${w.ipa}/`] : null,
        tones.length
          ? [
              t('label_tones'),
              syllables.map((s, k) => [
                k ? ' · ' : null,
                syllables.length > 1 ? [h('span', { lang: 'lo' }, s), ' '] : null,
                tones[k] ? t(`tone_${tones[k]}`) : '',
              ]),
            ]
          : null,
        w.pos ? [t('label_pos'), w.pos] : null,
        w.classifier_lao ? [t('label_classifier'), h('span', { lang: 'lo' }, w.classifier_lao)] : null,
      ]),
      w.pron_tip ? h('p', null, w.pron_tip) : null,
      readMore([tones.length ? 'tone' : null, w.ipa ? 'ipa' : null]),
    ]),
  ]
}

// One tone picture per syllable; the syllable is written under it only when there is more than one.
function toneRow(syllables, tones) {
  const cells = syllables
    .map((s, k) => {
      const pic = toneContour(tones[k])
      if (!pic) return null
      return h('figure', { class: 'tone' }, pic, syllables.length > 1 ? h('figcaption', { class: 'lao', lang: 'lo' }, s) : null)
    })
    .filter(Boolean)
  return cells.length ? h('div', { class: 'tone-row' }, cells) : null
}

const cell = (label, content) => h('div', { class: 'cell' }, h('span', { class: 'cell-label' }, label), content)

// The sound of a unit in the learner respelling (SCHEMA "Learner respelling scheme"). Letters store
// 'g (final k)' or just 'n'; a final takes the part in brackets when there is one.
function soundOf(u, respelling) {
  if (!respelling) return ''
  const m = respelling.match(/^(.*?)\s*\(final (.+)\)$/)
  if (!m) return respelling
  return u.role === 'final' ? m[2] : m[1]
}

const more = (open, kids) => h('details', { class: 'more', open }, h('summary', null, t('label_more')), kids)

// Rule and recap cards are prose with Lao inside ("the shape າ in three vowels: ◌າ ..."); the Lao parts are shown
// larger, in the Lao font.
// A recap puts its cases in rows after the prose: "prose || Lao | sounds like | cue || Lao | sounds like | cue"
// (LESSON_PLAN decision 18). They are shown as a table: the Lao, its sound again, and the English cue.
function ruleBody(r) {
  const [prose, ...rows] = (r.teach_en || '').split(' || ')
  const parts = prose.split(/([຀-໿◌]+)/)
  return [
    h('h2', null, r.name_en),
    h('p', { class: 'rule-text' }, parts.map((p, n) => (n % 2 ? h('span', { class: 'lao-inline', lang: 'lo' }, p) : p))),
    rows.length
      ? h(
          'div',
          { class: 'recap' },
          h('span', { class: 'cell-label' }, t('card_lao')),
          h('span', { class: 'cell-label' }, t('card_sounds_like')),
          h('span', { class: 'cell-label' }, t('card_as_in')),
          rows.map((row) => {
            const [lao, sound, cue] = row.split(' | ')
            return [
              h('span', { class: 'lao recap-lao', lang: 'lo' }, lao),
              h('span', { class: 'recap-sound' }, sound || ''),
              h('span', null, cue || ''),
            ]
          }),
        )
      : null,
  ]
}

// Sentences show lao_spaced as a reading aid, or the standard form without spaces: a site-wide setting
// (settings.js; user, 2026-11-09), not a per-card switch.
function sentenceBody(s, bundle) {
  const text = getSetting('spaces') ? s.lao_spaced || s.lao : s.lao || s.lao_spaced
  return [
    h('p', { class: 'lao center', lang: 'lo' }, text),
    h('p', { class: 'center' }, h('strong', null, respell(s.respelling))),
    // sentences.english separates alternative translations with " / " ("He eats. / She eats.")
    h('p', { class: 'center meaning' }, lines((s.english || '').split(' / '))),
    chips(s.words || [], bundle),
  ]
}

// Word chips with the info icon: tap to open the word's teach card.
function chips(words, bundle) {
  return h(
    'div',
    { class: 'row' },
    words.map((w) =>
      h(
        'button',
        { class: 'chip', title: t('info_open'), onclick: () => openInfo(w.word_id, bundle) },
        h('span', { lang: 'lo' }, w.lao),
        ` ${w.gloss_en} `,
        h('span', { class: 'info-icon', 'aria-hidden': 'true' }, 'ⓘ'),
      ),
    ),
  )
}

function openInfo(wordId, bundle) {
  const item = bundle.items.find((it) => it.item_type === 'word' && it.item_id === wordId)
  const pooled = (bundle.distractors?.words || []).find((w) => w.word_id === wordId)
  const detail = item?.detail || pooled
  if (!detail) return
  const dlg = h(
    'dialog',
    { class: 'info', onclose: () => dlg.remove() },
    teachCard({ item_type: 'word', detail }, bundle, { inDialog: true }),
    h('form', { method: 'dialog' }, h('button', null, t('info_close'))),
  )
  document.body.append(dlg)
  dlg.showModal()
}

// ------------------------------------------------------------------ helpers
function facts(rows) {
  const kept = rows.filter(Boolean)
  if (!kept.length) return null
  return h(
    'dl',
    { class: 'facts' },
    kept.map(([k, ...v]) => [h('dt', null, k), h('dd', null, v)]),
  )
}

function unitLabel(u) {
  if (u.kind === 'tone-mark') return t('unit_tone_mark')
  if (u.kind === 'symbol') return t('unit_symbol')
  return t(`unit_${u.role}`)
}
