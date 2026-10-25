import { supabase } from './supabase.js'
import { t } from './i18n.js'
import { h } from './dom.js'
import { toneContour } from './tone.js'

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
  const items = cardItems(bundle.items)
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
      teachCard(items[i], bundle),
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
  return items.filter((it) => {
    const d = it.detail
    if (it.item_type !== 'unit' || d?.role !== 'final') return true
    const first = initials.get(d.base_id)
    const same = first && first.letter?.ipa === d.letter?.ipa && !(d.letter?.respelling || '').includes('(final')
    return !same
  })
}

const backToList = () => h('a', { href: '#/', class: 'link' }, t('lesson_back_to_list'))

// ------------------------------------------------------------------ teach cards
// One card per lesson item. The same builder fills the info dialog.
// The front is a small table: labelled cells (Lao letter | Sounds like, or Lao word | Sounds like, Means, Tone)
// with large content under small labels, then one line of text. Everything else sits in a closed "More" section
// (open in the info dialog). Nothing the learner has not been taught is shown, such as a letter's name word.
function teachCard(item, bundle, { inDialog = false } = {}) {
  const d = item.detail || {}
  const body =
    item.item_type === 'unit'
      ? unitBody(d, inDialog)
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

function unitBody(u, open) {
  const sound = u.letter || u.vowel || {}
  const says = soundOf(u, sound.respelling)
  return [
    h(
      'div',
      { class: 'teach-grid' },
      cell(t(u.kind === 'vowel' ? 'card_lao_vowel' : u.kind === 'consonant' ? 'card_lao_letter' : 'card_lao_mark'), h('span', { class: 'glyph lao', lang: 'lo' }, u.lao)),
      says ? cell(t('card_sounds_like'), h('span', { class: 'cell-big' }, says)) : null,
    ),
    u.teach_en ? h('p', { class: 'center hint' }, u.teach_en) : null,
    more(open, [
      h('p', { class: 'muted' }, unitLabel(u)),
      u.lao.includes('◌') ? h('p', { class: 'muted' }, t('unit_dotted_circle')) : null,
      facts([
        sound.ipa ? [t('label_ipa'), `/${sound.ipa}/`] : null,
        u.letter ? [t('label_class'), u.letter.consonant_class] : null,
        u.vowel ? [t('label_length'), u.vowel.length] : null,
      ]),
      sound.pron_tip ? h('p', null, sound.pron_tip) : null,
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
      w.respelling ? cell(t('card_sounds_like'), h('span', { class: 'cell-big' }, w.respelling)) : null,
      w.gloss_en ? cell(t('card_means'), h('span', { class: 'cell-mid' }, w.gloss_en)) : null,
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

function ruleBody(r) {
  return [h('h2', null, r.name_en), h('p', null, r.teach_en)]
}

// Sentences show lao_spaced as a reading aid; the standard form is one tap away (APP_DESIGN).
function sentenceBody(s, bundle) {
  const lao = h('p', { class: 'lao center', lang: 'lo' }, s.lao_spaced || s.lao)
  let spaced = true
  return [
    lao,
    s.lao_spaced && s.lao_spaced !== s.lao
      ? h(
          'p',
          { class: 'center' },
          h(
            'button',
            {
              class: 'link',
              onclick: (e) => {
                spaced = !spaced
                lao.textContent = spaced ? s.lao_spaced : s.lao
                e.target.textContent = t(spaced ? 'sentence_show_standard' : 'sentence_show_spaced')
              },
            },
            t('sentence_show_standard'),
          ),
        )
      : null,
    h('p', { class: 'center' }, h('strong', null, s.respelling)),
    h('p', { class: 'center meaning' }, s.english),
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
  const from = pooled?.intro_lesson_id
  const dlg = h(
    'dialog',
    { class: 'info', onclose: () => dlg.remove() },
    teachCard({ item_type: 'word', detail }, bundle, { inDialog: true }),
    from ? h('p', { class: 'muted' }, `${t('label_from_lesson')} ${from}`) : null,
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
