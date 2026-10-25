import { supabase } from './supabase.js'
import { getLang, setLang, t, tIn } from './i18n.js'
import { h } from './dom.js'

const ROLES = ['learner', 'native']
const roleLang = (role) => (role === 'native' ? 'lo' : 'en')

const narrow = (...kids) => h('main', { class: 'card narrow' }, kids)

// ພາສາລາວ | English, for screens shown before we know who the person is.
function langToggle(onSwitch) {
  return h(
    'div',
    { class: 'lang-toggle' },
    [
      ['lo', 'ພາສາລາວ'],
      ['en', 'English'],
    ].map(([code, label]) =>
      h(
        'button',
        {
          class: 'link',
          'aria-pressed': String(getLang() === code),
          onclick: () => {
            setLang(code)
            onSwitch()
          },
        },
        label,
      ),
    ),
  )
}

// Two big cards. Each is labelled in its own audience's language first, so a
// Lao speaker and an English speaker can both find theirs whatever the toggle says.
export function rolePicker(onPick) {
  return h(
    'div',
    { class: 'roles' },
    ROLES.map((role) => {
      const main = roleLang(role)
      const other = main === 'lo' ? 'en' : 'lo'
      return h(
        'button',
        { type: 'button', class: 'role-card', lang: main, onclick: () => onPick(role) },
        h('strong', null, tIn(main, `role_${role}_title`)),
        h('span', null, tIn(main, `role_${role}_body`)),
        h('span', { class: 'muted', lang: other }, tIn(other, `role_${role}_title`)),
      )
    }),
  )
}

// Signed in but no role yet (accounts made outside the sign-up form).
export function showRoleChoice(root, { userId, onDone }) {
  const message = h('p', { class: 'error' })
  const pick = async (role) => {
    message.textContent = ''
    const { error } = await supabase.from('profiles').update({ role }).eq('id', userId)
    if (error) {
      console.error(error)
      message.textContent = t('generic_error')
      return
    }
    onDone()
  }
  root.replaceChildren(narrow(h('h1', null, t('role_question')), rolePicker(pick), message))
}

// Log in, or create an account in two steps: role, then details in that role's language.
export function showAuth(root, mode = 'login', role = null) {
  const again = () => showAuth(root, mode, role)

  if (mode === 'signup' && !role) {
    root.replaceChildren(
      narrow(
        langToggle(again),
        h('h1', null, t('brand')),
        h('p', null, t('role_question')),
        rolePicker((picked) => {
          setLang(roleLang(picked))
          showAuth(root, 'signup', picked)
        }),
        switchLink(root, mode),
      ),
    )
    return
  }

  const email = h('input', { type: 'email', required: true, autocomplete: 'email' })
  const password = h('input', {
    type: 'password',
    required: true,
    minLength: 8,
    autocomplete: mode === 'login' ? 'current-password' : 'new-password',
  })
  const name = h('input', { autocomplete: 'name' })
  const message = h('p')
  const submit = h('button', { type: 'submit', class: 'primary' }, mode === 'login' ? t('auth_login') : t('auth_signup'))

  const form = h(
    'form',
    {
      onsubmit: async (e) => {
        e.preventDefault()
        submit.disabled = true
        message.className = ''
        message.textContent = ''
        try {
          if (mode === 'login') {
            const { error } = await supabase.auth.signInWithPassword({ email: email.value, password: password.value })
            if (error) {
              console.error(error)
              message.className = 'error'
              message.textContent = t('auth_login_failed')
            }
          } else {
            const { data, error } = await supabase.auth.signUp({
              email: email.value,
              password: password.value,
              options: {
                data: { display_name: name.value.trim(), role },
                emailRedirectTo: location.origin + location.pathname,
              },
            })
            if (error) {
              console.error(error)
              message.className = 'error'
              message.textContent = t('auth_signup_failed')
            } else if (!data.session) {
              message.className = 'info'
              message.textContent = t('auth_check_email')
            }
          }
        } catch (err) {
          // Server unreachable: show an error instead of leaving the form stuck.
          console.error(err)
          message.className = 'error'
          message.textContent = t('generic_error')
        } finally {
          submit.disabled = false
        }
      },
    },
    mode === 'signup' ? h('label', null, t('auth_name'), name) : null,
    h('label', null, t('auth_email'), email),
    h('label', null, t('auth_password'), password),
    message,
    submit,
  )

  root.replaceChildren(
    narrow(
      mode === 'login' ? langToggle(again) : null,
      h('h1', null, t('brand')),
      mode === 'login'
        ? h('p', { class: 'muted' }, t('auth_tagline'))
        : h(
            'p',
            { class: 'muted' },
            t(`role_${role}_title`),
            ' · ',
            h('button', { class: 'link', onclick: () => showAuth(root, 'signup') }, t('role_change')),
          ),
      form,
      switchLink(root, mode),
    ),
  )
}

function switchLink(root, mode) {
  const next = mode === 'login' ? 'signup' : 'login'
  return h(
    'p',
    null,
    mode === 'login' ? t('auth_new_here') : t('auth_have_account'),
    ' ',
    h('button', { class: 'link', onclick: () => showAuth(root, next) }, next === 'signup' ? t('auth_signup') : t('auth_login')),
  )
}
