import { createClient } from 'https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2.45.4/+esm'

let supabase = null
let configured = false

try {
  const { SUPABASE_URL, SUPABASE_ANON_KEY } = await import('../config.js')
  if (SUPABASE_URL && SUPABASE_ANON_KEY && !SUPABASE_URL.includes('YOUR-PROJECT')) {
    supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY)
    configured = true
  }
} catch (e) {
  console.error('config.js missing or invalid. Copy config.example.js to config.js and fill it in.', e)
}

export { supabase, configured }
