import { createClient } from '@supabase/supabase-js'
import type { Database } from '@/types/database'

// Server client — uses service role key, bypasses RLS
// Use ONLY in API routes and server components
// NEVER import this in client components or expose to the browser
export function createServerClient() {
  return createClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    {
      auth: {
        autoRefreshToken: false,
        persistSession: false,
      },
    }
  )
}
