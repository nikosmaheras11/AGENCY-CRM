/**
 * Composables for Performance/Campaign Management
 * 
 * Note: Campaign, Ad Set, and Creative management have been moved to:
 * - useCampaigns.ts
 * - useAdSets.ts
 * - useCreatives.ts
 */

// Global State
const clientsState = ref<any[]>([])
const assetsState = ref<any[]>([])

// --- Clients Composable ---
export const useClients = () => {
  const loading = ref(false)
  const error = ref<Error | null>(null)

  const fetchClients = async () => {
    const { supabase } = useSupabase()
    try {
      loading.value = true
      const { data, error: err } = await supabase
        .from('clients')
        .select('*')
        .order('name')

      if (err) throw err
      clientsState.value = data || []
    } catch (e) {
      error.value = e as Error
      console.error('Error fetching clients:', e)
    } finally {
      loading.value = false
    }
  }

  return { clients: clientsState, fetchClients, loading, error }
}

// --- Assets Composable (Simple version if not exists) ---
export const useAssets = () => {
  const loading = ref(false)
  const error = ref<Error | null>(null)

  const fetchAssets = async () => {
    const { supabase } = useSupabase()
    try {
      loading.value = true
      const { data, error: err } = await supabase
        .from('assets')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(50) // Limit for now

      if (err) throw err
      assetsState.value = data || []
    } catch (e) {
      error.value = e as Error
      console.error('Error fetching assets:', e)
    } finally {
      loading.value = false
    }
  }

  return { assets: assetsState, fetchAssets, loading, error }
}
