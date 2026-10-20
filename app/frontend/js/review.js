import { supabase } from './supabase.js'
import { t } from './i18n.js'
import { h, radios, fieldset } from './dom.js'
import { createRecorder, extForMime } from './recorder.js'

const NATURALNESS = [
  { value: 'natural', label: () => t('nat_natural') },
  { value: 'awkward', label: () => t('nat_awkward') },
  { value: 'unnatural', label: () => t('nat_unnatural') },
]
const REGISTERS = [
  { value: 'casual', label: () => t('reg_casual') },
  { value: 'neutral', label: () => t('reg_neutral') },
  { value: 'formal', label: () => t('reg_formal') },
  { value: 'vulgar', label: () => t('reg_vulgar') },
]
const SKIP_REASONS = [
  { value: 'cannot_read', label: () => t('skip_cannot_read') },
  { value: 'not_sure', label: () => t('skip_not_sure') },
  { value: 'inappropriate', label: () => t('skip_inappropriate') },
  { value: 'other', label: () => t('skip_other') },
]
const ERROR_TYPES = [
  { value: 'spelling', label: () => t('err_spelling') },
  { value: 'grammar', label: () => t('err_grammar') },
  { value: 'word_choice', label: () => t('err_word_choice') },
  { value: 'word_order', label: () => t('err_word_order') },
  { value: 'translation_mismatch', label: () => t('err_translation_mismatch'), englishOnly: true },
  { value: 'other', label: () => t('err_other') },
]

const opts = (list) => list.map((o) => ({ value: o.value, label: o.label() }))
const card = (...kids) => h('main', { class: 'card' }, kids)

export function showReview(root, { userId, profile }) {
  const canSeeEnglish = profile.english_level === 'some' || profile.english_level === 'good'
  const counter = h('span')
  let uploadedFor = null // sentence id whose audio is already uploaded (survives a retry)

  async function refreshCount() {
    const { count } = await supabase
      .from('sentence_reviews')
      .select('id', { count: 'exact', head: true })
      .eq('skipped', false)
    counter.textContent = count ?? 0
  }

  async function next() {
    root.replaceChildren(card(t('review_loading')))
    const { data, error } = await supabase.rpc('claim_next_sentence')
    if (error) {
      console.error(error)
      root.replaceChildren(
        card(h('p', { class: 'error' }, t('review_load_failed')), h('button', { onclick: next }, t('review_retry'))),
      )
      return
    }
    if (!data) {
      root.replaceChildren(card(h('h2', null, t('review_empty_title')), h('p', null, t('review_empty_body'))))
      return
    }
    root.replaceChildren(buildForm(data))
  }

  function buildForm(sentence) {
    let busy = false
    const message = h('p', { class: 'error', hidden: true }, t('generic_error'))

    // English hint (only for people who said they understand some English)
    const englishText = h('p', { class: 'english', hidden: true }, t('english_label'), ' ', sentence.english || '')
    const englishToggle = h('button', { class: 'link', type: 'button' }, t('english_show'))
    let englishShown = false
    const typeBoxes = []
    englishToggle.addEventListener('click', () => {
      englishShown = !englishShown
      englishText.hidden = !englishShown
      englishToggle.textContent = englishShown ? t('english_hide') : t('english_show')
      typeBoxes.forEach((b) => b.englishOnly && (b.label.hidden = !englishShown))
    })

    // 1. Errors
    const errorDetails = h('div', { class: 'indent', hidden: true })
    const hasErrors = radios('err', [
      { value: false, label: t('q1_no') },
      { value: true, label: t('q1_yes') },
    ], { onChange: (v) => (errorDetails.hidden = !v) })
    for (const o of ERROR_TYPES) {
      const input = h('input', { type: 'checkbox', value: o.value })
      const label = h('label', { class: 'check', hidden: !!o.englishOnly }, input, ' ', o.label())
      typeBoxes.push({ input, label, englishOnly: o.englishOnly })
    }
    const errorNotes = h('textarea', { rows: 2, lang: 'lo' })
    const correction = h('textarea', { rows: 2, lang: 'lo' })
    errorDetails.append(
      h('p', { class: 'muted' }, t('q1_kinds')),
      typeBoxes.map((b) => b.label),
      h('label', null, t('q1_where'), errorNotes),
      h('label', null, t('q1_fix'), correction),
    )

    const naturalness = radios('nat', opts(NATURALNESS), { vertical: true })
    const register = radios('reg', opts(REGISTERS), { vertical: true })
    const recorder = createRecorder()
    const isSlang = radios('slang', [
      { value: true, label: t('yes') },
      { value: false, label: t('no') },
    ])
    const meaningsNotes = h('textarea', { rows: 2, lang: 'lo' })
    const meaningsLabel = h('label', { hidden: true }, t('q6_notes'), meaningsNotes)
    const multi = radios('multi', [
      { value: true, label: t('q6_yes') },
      { value: false, label: t('q6_no') },
    ], { onChange: (v) => (meaningsLabel.hidden = !v) })
    const comments = h('textarea', { rows: 2, lang: 'lo' })

    const submitBtn = h('button', { class: 'primary', type: 'button' }, t('submit'))
    const skipBtn = h('button', { class: 'link', type: 'button' }, t('skip'))
    const skipRow = h('div', { class: 'row', hidden: true })
    const allButtons = () => [submitBtn, skipBtn, ...skipRow.querySelectorAll('button')]
    const setBusy = (b) => {
      busy = b
      allButtons().forEach((x) => (x.disabled = b))
      submitBtn.textContent = b ? t('saving') : t('submit')
    }
    const fail = (e) => {
      console.error(e)
      message.hidden = false
      setBusy(false)
    }

    submitBtn.addEventListener('click', async () => {
      if (busy) return
      setBusy(true)
      message.hidden = true
      try {
        const rec = recorder.get()
        if (rec && uploadedFor !== sentence.sentence_id) {
          const path = `${userId}/${sentence.sentence_id}/${Date.now()}.${extForMime(rec.mime)}`
          const up = await supabase.storage.from('recordings').upload(path, rec.blob, { contentType: rec.mime, upsert: false })
          if (up.error) throw up.error
          const ins = await supabase.from('sentence_recordings').insert({
            sentence_id: sentence.sentence_id,
            reviewer_id: userId,
            storage_path: path,
            mime_type: rec.mime,
            duration_ms: rec.durationMs,
          })
          if (ins.error) throw ins.error
          uploadedFor = sentence.sentence_id
        }
        const errs = hasErrors.get() === true
        const { error } = await supabase.rpc('submit_review', {
          p_sentence_id: sentence.sentence_id,
          p_has_errors: hasErrors.get(),
          p_error_types: errs ? typeBoxes.filter((b) => b.input.checked).map((b) => b.input.value) : [],
          p_error_notes: errs ? errorNotes.value : null,
          p_suggested_correction: errs ? correction.value : null,
          p_naturalness: naturalness.get(),
          p_register: register.get(),
          p_is_slang: isSlang.get(),
          p_multiple_meanings: multi.get(),
          p_meanings_notes: multi.get() ? meaningsNotes.value : null,
          p_comments: comments.value,
        })
        if (error) throw error
        refreshCount()
        next()
      } catch (e) {
        fail(e)
      }
    })

    skipBtn.addEventListener('click', () => (skipRow.hidden = !skipRow.hidden))
    for (const r of SKIP_REASONS) {
      skipRow.append(
        h('button', {
          type: 'button',
          onclick: async () => {
            if (busy) return
            setBusy(true)
            const { error } = await supabase.rpc('skip_sentence', {
              p_sentence_id: sentence.sentence_id,
              p_reason: r.value,
              p_comments: comments.value || null,
            })
            if (error) fail(error)
            else next()
          },
        }, r.label()),
      )
    }

    return card(
      h('p', { class: 'muted counter' }, t('review_done_count'), ' ', counter),
      h('p', { class: 'muted' }, t('review_optional')),
      h(
        'section',
        { class: 'sentence' },
        h('p', { class: 'lao', lang: 'lo' }, sentence.lao),
        canSeeEnglish && sentence.english ? [englishText, englishToggle] : null,
      ),
      fieldset(t('q1'), hasErrors.el, errorDetails),
      fieldset(t('q2'), naturalness.el),
      fieldset(t('q3'), register.el),
      fieldset(t('q4'), h('p', { class: 'muted' }, t('q4_hint')), recorder.el),
      fieldset(t('q5'), isSlang.el),
      fieldset(t('q6'), multi.el, meaningsLabel),
      h('label', null, t('comments'), comments),
      message,
      h('div', { class: 'actions' }, submitBtn, skipBtn),
      skipRow,
    )
  }

  refreshCount()
  next()
}
