import { supabase } from './supabase.js'
import { t } from './i18n.js'
import { h } from './dom.js'

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
  const { lesson, items } = bundle
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
      i === 0 ? [h('h1', null, lesson.title_en), h('p', { class: 'muted' }, lesson.summary_en)] : null,
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

const backToList = () => h('a', { href: '#/', class: 'link' }, t('lesson_back_to_list'))

// ------------------------------------------------------------------ teach cards
// One card per lesson item. The same builder fills the info dialog.
function teachCard(item, bundle, { inDialog = false } = {}) {
  const d = item.detail || {}
  const body =
    item.item_type === 'unit'
      ? unitBody(d, bundle)
      : item.item_type === 'word'
        ? wordBody(d)
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

function unitBody(u, bundle) {
  const sound = u.letter || u.vowel || {}
  const examples = lessonWords(bundle).filter((w) => w.lao.includes(glyphOf(u.lao)))
  return [
    h('p', { class: 'glyph lao', lang: 'lo' }, u.lao),
    h('p', { class: 'muted center' }, unitLabel(u)),
    facts([
      [t('label_sound'), [sound.respelling, sound.ipa ? ` /${sound.ipa}/` : null]],
      u.letter ? [t('label_letter_name'), h('span', { lang: 'lo' }, u.letter.name_lao), ` “${u.letter.name_gloss_en}”`] : null,
      u.letter ? [t('label_class'), u.letter.consonant_class] : null,
      u.vowel ? [t('label_length'), u.vowel.length] : null,
    ]),
    h('p', null, u.teach_en),
    examples.length ? [h('h3', null, t('label_examples')), chips(examples, bundle)] : null,
  ]
}

function wordBody(w) {
  const syllables = w.syllables || []
  return [
    h('p', { class: 'glyph lao', lang: 'lo' }, w.lao),
    h('p', { class: 'center' }, h('strong', null, w.respelling), w.ipa ? h('span', { class: 'muted' }, ` /${w.ipa}/`) : null),
    h('p', { class: 'center meaning' }, w.gloss_en),
    facts([
      w.pos ? [t('label_pos'), w.pos] : null,
      [
        t('label_tones'),
        syllables.map((s, k) => [k ? ' · ' : null, h('span', { lang: 'lo' }, s), ` ${(w.tones || [])[k] || ''}`]),
      ],
      w.classifier_lao ? [t('label_classifier'), h('span', { lang: 'lo' }, w.classifier_lao)] : null,
    ]),
    w.pron_tip ? h('p', null, w.pron_tip) : null,
  ]
}

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
  return h(
    'dl',
    { class: 'facts' },
    rows.filter(Boolean).map(([k, ...v]) => [h('dt', null, k), h('dd', null, v)]),
  )
}

function unitLabel(u) {
  if (u.kind === 'tone-mark') return t('unit_tone_mark')
  if (u.kind === 'symbol') return t('unit_symbol')
  return t(`unit_${u.role}`)
}

// The bare glyph of a unit's display form: '◌ນ' -> 'ນ', '◌ິ' -> 'ິ' (vowel patterns with two parts keep both,
// so examples are only found for one-part vowels for now).
const glyphOf = (lao) => lao.replace(/◌| \(cluster\)/g, '')

const lessonWords = (bundle) => bundle.items.filter((it) => it.item_type === 'word').map((it) => it.detail)
