---
name: frontend-feature
description: Conventions and checklist for the vanilla-JS frontend in app/frontend — modules, routing, the h() DOM builder, strings.json, RPC calls, error handling, styles and mobile layout. Use when adding or changing any screen, route or UI component.
---

# Frontend features (app/frontend)

Plain HTML + CSS + ES modules. No framework, npm or build step; `@supabase/supabase-js` comes from a CDN via
`js/supabase.js`. It must run when served as static files (Live Server locally, Netlify in production).

## Before writing
- Read `app/README.md` (Frontend), `js/app.js` (boot, routing by role), `js/dom.js`, `js/i18n.js`, and the module
  you will change, in full. `js/learn.js` is the reference for learner screens.

## Structure
- One module per screen or area: `learn.js` (lesson list, lesson), later `home.js`, `practice.js`, `summary.js`,
  `activities/<type>.js`, `session.js` (planner + runner). Each exports a `show<Screen>(root, ctx)` function.
- **Routing (learner):** hash routes (`#/`, `#/lesson/L0001/3`, `#/practice`, `#/item/W000123`). `app.js` re-routes
  on `hashchange` in the learner view. Parse the hash in one place per module, as `parseHash()` in learn.js does.
- **Stale renders:** after every `await`, check a render token (`const token = ++renderToken; ... if (stale()) return`)
  so a slow response never draws over a newer screen.
- Shared helpers go in `dom.js` (DOM) or a new small module. Don't copy a helper into a second file.

## DOM and text
- Build elements with `h(tag, props, ...children)`. Never set `innerHTML` with data.
- **Every visible string** comes from `t('key')` (or `tIn(lang, key)` on bilingual screens) and is added to
  `js/strings.json` as `{"en": "..."}`, plus `"lo"` for anything a native user sees. Lao UI text you write is
  unverified: note it in the changelog. Use `{n}`-style placeholders filled in code, not sentence fragments joined
  together (word order differs between languages).
- Lao content (words, sentences) comes from the RPC bundle, never from strings.json. Lao script is the main text;
  respelling and IPA are secondary and can be toggled (DESIGN "Presentation"). Sentences show `lao_spaced`.
- Every item shown in an activity or card gets the info icon that opens its teach card.

## Data
- Read and write only through RPCs: `const { data, error } = await supabase.rpc('name', { p_x })`. Never query
  content tables directly.
- Errors: `console.error(error)`, then a generic message from strings (`generic_error`, or a screen-specific one) with
  a `retry` button. Disable submit buttons while a request is in flight; re-enable on failure.
- Batch writes (answers) and tolerate failure: keep unsent batches in memory and retry on the next flush; a
  dropped connection must not lose a session's answers.
- Cache read-only bundles for the page's lifetime in a `Map` (as `bundles` in learn.js) when screens re-render.

## Styles
- `styles.css` only; reuse existing classes (`card`, `muted`, `error`, `row`, `col`, `pill`) before adding new ones.
  Mobile-first: one column, tap targets at least 44px, no fixed widths. Lao text needs a larger font size and
  line height than Latin text (stacked vowels and tone marks).
- Colour is never the only signal (correct/wrong also gets an icon or text).

## Before handing over
- Run `node scripts/check_frontend.js` (syntax of every module, `t()` keys present in
  strings.json).
- For the owner's browser check, list the routes to open and what each should show, including one error case (for example, stop
  the backend and reload).
