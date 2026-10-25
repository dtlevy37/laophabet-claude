import { t } from './i18n.js'

// Tone contour picture: a pitch line drawn on the 5-level Chao scale (5 = top of the voice, 1 = bottom).
// Values are the Chao letters in _agent/SCHEMA.md "Tone convention"; the tone names are the words.csv names.
// Shared by teach cards now and the tone drill later.
const CONTOURS = {
  'low-rising': [1, 3],
  'high-rising': [3, 5],
  mid: [3, 3],
  'low-falling': [3, 1],
  'high-falling': [5, 2],
}

const NS = 'http://www.w3.org/2000/svg'
const W = 72
const H = 48
const PAD = 6

function svg(tag, attrs) {
  const el = document.createElementNS(NS, tag)
  for (const [k, v] of Object.entries(attrs)) el.setAttribute(k, v)
  return el
}

const y = (level) => PAD + ((5 - level) / 4) * (H - 2 * PAD)

// One contour as an <svg>; null for an unknown tone name. Not colour-only: the shape is the signal,
// and the tone name is the accessible label.
export function toneContour(name) {
  const c = CONTOURS[name]
  if (!c) return null
  const [a, b] = c
  const x0 = PAD + 4
  const x1 = W - PAD - 4
  const pic = svg('svg', {
    class: 'tone-contour',
    viewBox: `0 0 ${W} ${H}`,
    width: W,
    height: H,
    role: 'img',
    'aria-label': t(`tone_${name}`),
  })
  const title = svg('title', {})
  title.textContent = t(`tone_${name}`)
  pic.append(title)
  // faint guides at the top, middle and bottom of the voice range
  for (const level of [5, 3, 1]) {
    pic.append(svg('line', { class: 'tone-guide', x1: PAD, x2: W - PAD, y1: y(level), y2: y(level) }))
  }
  // a gentle curve: starts at the first pitch, ends at the second, with a dot where it ends
  const mx = (x0 + x1) / 2
  pic.append(
    svg('path', { class: 'tone-line', d: `M ${x0} ${y(a)} C ${mx} ${y(a)}, ${mx} ${y(b)}, ${x1} ${y(b)}` }),
    svg('circle', { class: 'tone-end', cx: x1, cy: y(b), r: 3.5 }),
  )
  return pic
}
