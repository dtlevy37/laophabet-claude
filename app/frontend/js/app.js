import { supabase, configured } from './supabase.js'
import { loadStrings, setLang, t, tIn } from './i18n.js'
import { h } from './dom.js'
import { showAuth, showRoleChoice } from './auth.js'
import { showNativeOnboarding } from './onboarding.js'
import { showReview } from './review.js'
import { showLearnerHome } from './learn.js'

const app = document.getElementById('app')
const topbar = document.getElementById('topbar')

let session = null
let profile = null
let learnerView = false // the learner view routes by URL hash (learn.js)

const card = (...kids) => h('main', { class: 'card' }, kids)

async function loadProfile() {
  if (!session) {
    profile = null
    return
  }
  const { data, error } = await supabase
    .from('profiles')
    .select('id, role, display_name, is_native_speaker, gender, birth_date, lao_locale, region, english_level, onboarded_at')
    .eq('id', session.user.id)
    .maybeSingle()
  if (error) console.error(error)
  profile = data
}

async function refresh() {
  await loadProfile()
  render()
}

// Natives may try the learner view; remembered per browser, the role is unchanged.
const VIEW_KEY = 'laophabet.view'
function viewingAsLearner() {
  try {
    return localStorage.getItem(VIEW_KEY) === 'learner'
  } catch {
    return false
  }
}
function setViewAsLearner(on) {
  try {
    if (on) localStorage.setItem(VIEW_KEY, 'learner')
    else localStorage.removeItem(VIEW_KEY)
  } catch {}
  render()
}

function showTopbar(title, extra = null) {
  topbar.replaceChildren(
    h(
      'header',
      { class: 'topbar' },
      h('strong', null, title),
      h(
        'span',
        null,
        extra,
        extra ? ' · ' : null,
        profile.display_name || session.user.email,
        ' ',
        h('button', { class: 'link', onclick: () => supabase.auth.signOut() }, t('sign_out')),
      ),
    ),
  )
}

// One place decides which view a person sees: signed out → auth; no role yet →
// role choice; native → onboarding, then review (or the learner view if they
// chose to try it); learner → learner home.
function render() {
  topbar.replaceChildren()
  learnerView = false
  if (!session) return showAuth(app)
  if (!profile) return app.replaceChildren(card(t('loading')))
  if (!profile.role) return showRoleChoice(app, { userId: session.user.id, onDone: refresh })

  const native = profile.role === 'native'
  if (native && !viewingAsLearner()) {
    setLang('lo', { remember: false })
    if (!profile.onboarded_at) return showNativeOnboarding(app, { profile, onDone: refresh })
    showTopbar(t('app_name'), h('button', { class: 'link', onclick: () => setViewAsLearner(true) }, t('view_as_learner')))
    return showReview(app, { userId: session.user.id, profile })
  }

  setLang('en', { remember: false })
  // The way back stays in Lao: the person reading it is a native speaker.
  const back = native
    ? h('button', { class: 'link', lang: 'lo', onclick: () => setViewAsLearner(false) }, tIn('lo', 'view_back_to_review'))
    : null
  showTopbar(t('brand'), back)
  learnerView = true
  showLearnerHome(app, { profile })
}

window.addEventListener('hashchange', () => {
  if (learnerView) showLearnerHome(app, { profile })
})

// ------------------------------------------------------------------ boot
await loadStrings()
if (!configured) {
  app.replaceChildren(h('main', { class: 'card error' }, t('config_error')))
} else {
  app.replaceChildren(card(t('loading')))
  const { data } = await supabase.auth.getSession()
  session = data.session
  await refresh()
  supabase.auth.onAuthStateChange((event, next) => {
    // Only react to real changes; token refreshes would otherwise reset the form.
    if (event === 'TOKEN_REFRESHED' || event === 'INITIAL_SESSION') return
    session = next
    setTimeout(refresh, 0)
  })
}
