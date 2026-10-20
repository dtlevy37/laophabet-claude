// Strings live in strings.json ({key: {lo, en}}). Natives see lo, learners see en.
// Before login the language comes from the toggle (remembered) or the browser.
let strings = {}
let lang = 'en'
const LANG_KEY = 'laophabet.lang'

export async function loadStrings() {
  const res = await fetch(new URL('./strings.json', import.meta.url))
  strings = await res.json()
  let saved = null
  try {
    saved = localStorage.getItem(LANG_KEY)
  } catch {}
  const browserLo = (navigator.language || '').toLowerCase().startsWith('lo')
  setLang(saved || (browserLo ? 'lo' : 'en'), { remember: false })
}

export function getLang() {
  return lang
}

export function setLang(next, { remember = true } = {}) {
  lang = next === 'lo' ? 'lo' : 'en'
  document.documentElement.lang = lang
  if (remember) {
    try {
      localStorage.setItem(LANG_KEY, lang)
    } catch {}
  }
}

export function t(key) {
  return tIn(lang, key)
}

// The string in a given language, whatever the current one (bilingual screens).
export function tIn(language, key) {
  const s = strings[key]
  if (!s) {
    console.warn('missing string', key)
    return ''
  }
  return s[language] ?? s.en ?? s.lo
}
