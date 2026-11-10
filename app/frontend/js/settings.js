import { t } from './i18n.js'
import { h } from './dom.js'

// Learner display settings, remembered per browser (a convenience, not learner data; nothing is stored in the DB).
//   spaces: show Lao sentences with spaces between words (a reading aid; Lao is normally written without them).
// More settings (such as the transliteration style) belong here too.
const KEY = 'laophabet.settings'
const defaults = { spaces: true }

let current = { ...defaults }
try {
  const saved = JSON.parse(localStorage.getItem(KEY) || '{}')
  if (saved && typeof saved === 'object') current = { ...defaults, ...saved }
} catch {}

export function getSetting(name) {
  return current[name]
}

function setSetting(name, value) {
  current = { ...current, [name]: value }
  try {
    localStorage.setItem(KEY, JSON.stringify(current))
  } catch {}
}

// The settings dialog. onChange runs after every change so the caller can redraw the screen behind it.
export function openSettings(onChange) {
  const dlg = h(
    'dialog',
    { class: 'info', onclose: () => dlg.remove() },
    h('h2', null, t('settings_title')),
    h(
      'label',
      { class: 'check' },
      h('input', {
        type: 'checkbox',
        checked: !!current.spaces,
        onchange: (e) => {
          setSetting('spaces', e.target.checked)
          if (onChange) onChange()
        },
      }),
      ' ',
      t('settings_spaces'),
    ),
    h('p', { class: 'muted' }, t('settings_spaces_hint')),
    h('form', { method: 'dialog' }, h('button', null, t('info_close'))),
  )
  document.body.append(dlg)
  dlg.showModal()
}
