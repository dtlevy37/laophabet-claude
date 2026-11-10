import { t } from './i18n.js'
import { h, radios } from './dom.js'

// Learner display settings, remembered per browser (a convenience, not learner data; nothing is stored in the DB).
//   spaces: show Lao sentences with spaces between words (a reading aid; Lao is normally written without them).
//   font:   the typeface for Lao text (one of FONTS).
// More settings (such as the transliteration style) belong here too.
const KEY = 'laophabet.settings'
const defaults = { spaces: true, font: 'standard' }

// The default is Leelawadee UI (user, 2026-11-09): it ships with Windows and cannot be sent with the site, so
// other devices fall back to their own Lao font. The Noto faces are web fonts loaded in index.html.
const FONTS = {
  standard: "'Leelawadee UI', sans-serif",
  looped: "'Noto Sans Lao Looped', sans-serif",
  plain: "'Noto Sans Lao', sans-serif",
  serif: "'Noto Serif Lao', serif",
}
const SAMPLE = 'ກິນເຂົ້າ'

let current = { ...defaults }
try {
  const saved = JSON.parse(localStorage.getItem(KEY) || '{}')
  if (saved && typeof saved === 'object') current = { ...defaults, ...saved }
} catch {}
if (!FONTS[current.font]) current.font = defaults.font
applyFont()

function applyFont() {
  document.documentElement.style.setProperty('--lao-font', FONTS[current.font])
}

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
  const changed = () => onChange && onChange()
  const fonts = radios(
    'lao-font',
    Object.keys(FONTS).map((id) => ({
      value: id,
      label: h(
        'span',
        null,
        t(`settings_font_${id}`),
        ' ',
        h('span', { class: 'font-sample', lang: 'lo', style: `font-family: ${FONTS[id]}` }, SAMPLE),
      ),
    })),
    {
      vertical: true,
      onChange: (id) => {
        setSetting('font', id)
        applyFont()
        changed()
      },
    },
  )
  fonts.set(current.font)
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
          changed()
        },
      }),
      ' ',
      t('settings_spaces'),
    ),
    h('p', { class: 'muted' }, t('settings_spaces_hint')),
    h('h3', null, t('settings_font')),
    fonts.el,
    h('form', { method: 'dialog' }, h('button', null, t('info_close'))),
  )
  document.body.append(dlg)
  dlg.showModal()
}
