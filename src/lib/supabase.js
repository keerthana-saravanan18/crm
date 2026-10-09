import { createClient } from '@supabase/supabase-js'

const rawUrl = import.meta.env.VITE_SUPABASE_URL ?? import.meta.env.NEXT_PUBLIC_SUPABASE_URL
const rawAnonKey =
  import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY ?? import.meta.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY

const url = rawUrl?.trim()
const anonKey = String(rawAnonKey ?? '').replace(/,/g, '').trim()

export const isSupabaseConfigured = Boolean(
  url &&
    anonKey &&
    url !== 'https://your-project-ref.supabase.co' &&
    anonKey !== 'your-anon-key' &&
    !anonKey.includes('your-anon-key'),
)

export const supabase = isSupabaseConfigured
  ? createClient(url, anonKey, {
      auth: {
        persistSession: true,
        autoRefreshToken: true,
        detectSessionInUrl: true,
      },
    })
  : null

export function normalizeError(error) {
  return error?.message || 'An unexpected error occurred.'
}
