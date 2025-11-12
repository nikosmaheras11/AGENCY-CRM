import { createClient, SupabaseClient } from '@supabase/supabase-js'

let supabaseClient: SupabaseClient | null = null

export const useSupabase = () => {
  const config = useRuntimeConfig()
  
  if (!supabaseClient) {
    const supabaseUrl = config.public.supabaseUrl
    const supabaseKey = config.public.supabaseKey
    
    if (!supabaseUrl || !supabaseKey) {
      throw new Error('Supabase URL and Key must be provided in environment variables')
    }
    
    supabaseClient = createClient(supabaseUrl, supabaseKey, {
      auth: {
        persistSession: true,
        autoRefreshToken: true,
      },
    })
  }
  
  return {
    client: supabaseClient,
    auth: supabaseClient.auth,
    storage: supabaseClient.storage,
    from: (table: string) => supabaseClient!.from(table),
  }
}
