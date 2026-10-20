import { supabase } from './supabase.js'
import { t } from './i18n.js'
import { h, radios, fieldset } from './dom.js'

const narrow = (...kids) => h('main', { class: 'card narrow' }, kids)

// Native reviewers answer these once before their first review.
export function showNativeOnboarding(root, { profile, onDone }) {
  const name = h('input', { value: profile.display_name || '' })
  const native = h('input', { type: 'checkbox' })
  const gender = radios('gender', [
    { value: 'female', label: t('gender_female') },
    { value: 'male', label: t('gender_male') },
    { value: 'other', label: t('gender_other') },
    { value: 'undisclosed', label: t('gender_undisclosed') },
  ], { vertical: true })
  const birth = h('input', { type: 'date', min: '1900-01-01', max: new Date().toISOString().slice(0, 10) })
  const region = h('input')
  const regionLabel = h('label', { hidden: true }, t('profile_region'), region)
  const locale = radios('locale', [
    { value: 'vientiane', label: t('locale_vientiane') },
    { value: 'other', label: t('locale_other') },
  ], { vertical: true, onChange: (v) => (regionLabel.hidden = v !== 'other') })
  const english = radios('english', [
    { value: 'none', label: t('english_none') },
    { value: 'some', label: t('english_some') },
    { value: 'good', label: t('english_good') },
  ], { vertical: true })
  const message = h('p', { class: 'error' })
  const submit = h('button', { type: 'submit', class: 'primary' }, t('profile_continue'))

  const form = h(
    'form',
    {
      onsubmit: async (e) => {
        e.preventDefault()
        submit.disabled = true
        message.textContent = ''
        const { error } = await supabase
          .from('profiles')
          .update({
            display_name: name.value.trim() || null,
            is_native_speaker: native.checked,
            gender: gender.get(),
            birth_date: birth.value || null,
            lao_locale: locale.get(),
            region: locale.get() === 'other' ? region.value.trim() || null : null,
            english_level: english.get(),
            onboarded_at: new Date().toISOString(),
          })
          .eq('id', profile.id)
        if (error) {
          console.error(error)
          message.textContent = t('generic_error')
          submit.disabled = false
          return
        }
        onDone()
      },
    },
    h('label', null, t('auth_name'), name),
    h('label', { class: 'check' }, native, ' ', t('profile_native')),
    fieldset(t('profile_gender'), gender.el),
    h('label', null, t('profile_age'), birth),
    fieldset(t('profile_locale'), locale.el, regionLabel),
    fieldset(t('profile_english'), english.el),
    message,
    submit,
  )
  root.replaceChildren(narrow(h('h1', null, t('profile_title')), h('p', { class: 'muted' }, t('profile_why')), form))
}
