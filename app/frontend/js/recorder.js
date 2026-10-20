import { h } from './dom.js'
import { t } from './i18n.js'

const MAX_MS = 30000
const CANDIDATES = ['audio/webm;codecs=opus', 'audio/webm', 'audio/mp4', 'audio/ogg;codecs=opus']

export function extForMime(mime) {
  if (mime.includes('mp4')) return 'm4a'
  if (mime.includes('ogg')) return 'ogg'
  return 'webm'
}

// Returns {el, get()} where get() is null or {blob, mime, durationMs}.
export function createRecorder() {
  const el = h('div', { class: 'recorder' })
  let result = null
  let recorder = null
  let stream = null
  let timer = null
  let startedAt = 0
  let objectUrl = null

  const supported = typeof MediaRecorder !== 'undefined' && !!navigator.mediaDevices?.getUserMedia
  if (!supported) {
    el.append(h('p', { class: 'muted' }, t('rec_unsupported')))
    return { el, get: () => null }
  }

  function stopTracks() {
    if (stream) stream.getTracks().forEach((tr) => tr.stop())
    stream = null
    if (timer) clearInterval(timer)
    timer = null
  }

  function showIdle(errorShown) {
    if (objectUrl) URL.revokeObjectURL(objectUrl)
    objectUrl = null
    result = null
    el.replaceChildren(
      h('button', { type: 'button', onclick: start }, '● ', t('rec_start')),
      errorShown ? h('p', { class: 'error' }, t('rec_mic_error')) : null,
    )
  }

  function showDone() {
    el.replaceChildren(
      h('audio', { controls: true, src: objectUrl }),
      h('button', { type: 'button', onclick: () => showIdle(false) }, t('rec_again')),
    )
  }

  async function start() {
    try {
      stream = await navigator.mediaDevices.getUserMedia({ audio: true })
      const mimeType = CANDIDATES.find((m) => MediaRecorder.isTypeSupported(m))
      recorder = new MediaRecorder(stream, mimeType ? { mimeType } : undefined)
      const chunks = []
      recorder.ondataavailable = (e) => {
        if (e.data.size > 0) chunks.push(e.data)
      }
      recorder.onstop = () => {
        const full = recorder.mimeType || mimeType || 'audio/webm'
        const blob = new Blob(chunks, { type: full })
        result = { blob, mime: full.split(';')[0], durationMs: Date.now() - startedAt }
        stopTracks()
        objectUrl = URL.createObjectURL(blob)
        showDone()
      }
      startedAt = Date.now()
      recorder.start()
      const stopBtn = h('button', { type: 'button', class: 'danger', onclick: () => recorder.stop() })
      const label = () => `■ ${t('rec_stop')} (${Math.round((Date.now() - startedAt) / 1000)})`
      stopBtn.textContent = label()
      el.replaceChildren(stopBtn)
      timer = setInterval(() => {
        stopBtn.textContent = label()
        if (Date.now() - startedAt >= MAX_MS) recorder.stop()
      }, 250)
    } catch (e) {
      console.error(e)
      stopTracks()
      showIdle(true)
    }
  }

  showIdle(false)
  return { el, get: () => result }
}
