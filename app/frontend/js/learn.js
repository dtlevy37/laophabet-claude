import { t } from './i18n.js'
import { h } from './dom.js'

// Learner home. Placeholder until lessons are in the database (APP_PLAN phase 2+).
export function showLearnerHome(root, { profile }) {
  const greeting = profile.display_name ? `${t('learn_welcome')}, ${profile.display_name}` : t('learn_welcome')
  root.replaceChildren(
    h('main', { class: 'card' }, h('h1', null, greeting), h('p', { class: 'muted' }, t('learn_coming_soon'))),
  )
}
