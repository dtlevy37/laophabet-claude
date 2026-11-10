import { getSetting } from './settings.js'

// Transliteration styles (LESSON_PLAN decision 13). The data stores one respelling, the "English-style" one
// (SCHEMA "Learner respelling scheme": ກ g, ຂ/ຄ k, ປ bp, ຜ/ພ p, ຕ dt, ຖ/ທ t, ຈ j), written syllable by syllable
// (sa-baai-dii, "kawy gin kao."). The Standard style (the default) differs only in the consonants at the start of
// a syllable, so it is made here by a fixed swap. Vowels and final consonants are the same in both styles.
const STANDARD_INITIAL = {
  g: 'k',
  k: 'kh',
  gw: 'kw',
  kw: 'khw',
  kl: 'khl',
  bp: 'p',
  p: 'ph',
  dt: 't',
  t: 'th',
  j: 'ch',
}

function standardSyllable(syl) {
  const lower = syl.toLowerCase()
  const initial = lower.match(/^[^aeiou]*/)[0]
  const swap = STANDARD_INITIAL[initial]
  if (!swap) return syl
  const rest = syl.slice(initial.length)
  // keep a capital first letter ("Gin" -> "Kin")
  const out = syl[0] !== lower[0] ? swap[0].toUpperCase() + swap.slice(1) : swap
  return out + rest
}

// A stored respelling (a word, a sentence, or the sound of an initial consonant) in the learner's chosen style.
// Do not pass the sound of a final consonant: finals are the same in both styles.
export function respell(text) {
  if (!text || getSetting('translit') !== 'standard') return text || ''
  return text.replace(/[A-Za-z]+/g, standardSyllable)
}
