import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

let supabase = null

try {
  if (supabaseUrl && supabaseAnonKey) {
    supabase = createClient(supabaseUrl, supabaseAnonKey)
  } else {
    console.error('⚠️ Faltan VITE_SUPABASE_URL o VITE_SUPABASE_ANON_KEY en .env.local')
  }
} catch (err) {
  console.error('Error al crear cliente Supabase:', err)
}

export { supabase }
