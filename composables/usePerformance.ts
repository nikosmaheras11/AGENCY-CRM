/**
 * Composables for Performance/Campaign Management
 */

// Global State
const clientsState = ref<any[]>([])
const campaignsState = ref<any[]>([])
const adSetsState = ref<any[]>([])
const creativesState = ref<any[]>([])
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

// --- Campaigns Composable ---
export const useCampaigns = () => {
  const loading = ref(false)
  const error = ref<Error | null>(null)

  const fetchCampaigns = async () => {
    const { supabase } = useSupabase()
    try {
      loading.value = true
      // Removed assigned:assigned_to(email) as it references auth.users which is not directly queryable
      // Removed ad_sets count for now to simplify the list query
      console.log('Fetching campaigns...')
      const { data, error: err } = await supabase
        .from('campaigns')
        .select(`
          *,
          client:clients!campaigns_client_id_fkey(name, logo_url)
        `)
        .order('created_at', { ascending: false })
      
      if (err) {
        console.error('Supabase error fetching campaigns:', err)
        throw err
      }
      
      console.log('Campaigns fetched:', data)
      campaignsState.value = data || []
    } catch (e) {
      error.value = e as Error
      console.error('Error fetching campaigns:', e)
    } finally {
      loading.value = false
    }
  }

  const createCampaign = async (campaignData: any) => {
    const { supabase } = useSupabase()
    try {
      loading.value = true
      const { data, error: err } = await supabase
        .from('campaigns')
        .insert(campaignData)
        .select()
        .single()
      
      if (err) throw err
      // Add to local state
      campaignsState.value.unshift(data)
      return data
    } catch (e) {
      error.value = e as Error
      console.error('Error creating campaign:', e)
      throw e
    } finally {
      loading.value = false
    }
  }

  const getCampaignById = async (id: string) => {
    const { supabase } = useSupabase()
    try {
      loading.value = true
      // Removed assigned:assigned_to(email)
      const { data, error: err } = await supabase
        .from('campaigns')
        .select(`
          *,
          client:clients!campaigns_client_id_fkey(name, logo_url),
          ad_sets(
            *,
            creatives(
              *,
              asset:assets(*),
              comments:creative_comments(count)
            )
          )
        `)
        .eq('id', id)
        .order('sort_order', { foreignTable: 'ad_sets', ascending: true })
        .order('sort_order', { foreignTable: 'ad_sets.creatives', ascending: true })
        .single()
      
      if (err) throw err
      return data
    } catch (e) {
      error.value = e as Error
      console.error('Error fetching campaign details:', e)
      return null
    } finally {
      loading.value = false
    }
  }

  const updateCampaignStatus = async (campaignId: string, status: string) => {
    const { supabase } = useSupabase()
    try {
      loading.value = true
      const { data, error: err } = await supabase
        .from('campaigns')
        .update({ status, updated_at: new Date().toISOString() })
        .eq('id', campaignId)
        .select()
        .single()
      
      if (err) throw err
      
      // Update local state if exists
      const index = campaignsState.value.findIndex(c => c.id === campaignId)
      if (index !== -1) {
        campaignsState.value[index] = { ...campaignsState.value[index], ...data }
      }
      
      return data
    } catch (e) {
      error.value = e as Error
      console.error('Error updating campaign status:', e)
      throw e
    } finally {
      loading.value = false
    }
  }

  return { campaigns: campaignsState, fetchCampaigns, createCampaign, getCampaignById, updateCampaignStatus, loading, error }
}

// --- Ad Sets Composable ---
export const useAdSets = () => {
  const loading = ref(false)
  const error = ref<Error | null>(null)

  const fetchAdSets = async (campaignId?: string) => {
    const { supabase } = useSupabase()
    try {
      loading.value = true
      let query = supabase
        .from('ad_sets')
        .select('*, creatives:creatives(count)')
        .order('created_at', { ascending: false })
      
      if (campaignId) {
        query = query.eq('campaign_id', campaignId)
      }

      const { data, error: err } = await query
      
      if (err) throw err
      adSetsState.value = data || []
      return data
    } catch (e) {
      error.value = e as Error
      console.error('Error fetching ad sets:', e)
      return []
    } finally {
      loading.value = false
    }
  }

  const createAdSet = async (adSetData: any) => {
    const { supabase } = useSupabase()
    try {
      loading.value = true
      
      // Get current max sort_order
      const { data: maxSort } = await supabase
        .from('ad_sets')
        .select('sort_order')
        .eq('campaign_id', adSetData.campaign_id)
        .order('sort_order', { ascending: false })
        .limit(1)
        .single()
      
      const nextSortOrder = (maxSort?.sort_order || 0) + 1

      const { data, error: err } = await supabase
        .from('ad_sets')
        .insert({
          ...adSetData,
          sort_order: nextSortOrder
        })
        .select()
        .single()
      
      if (err) throw err
      adSetsState.value.unshift(data)
      return data
    } catch (e) {
      error.value = e as Error
      console.error('Error creating ad set:', e)
      throw e
    } finally {
      loading.value = false
    }
  }

  return { adSets: adSetsState, fetchAdSets, createAdSet, loading, error }
}

// --- Creatives Composable ---
export const useCreatives = () => {
  const loading = ref(false)
  const error = ref<Error | null>(null)

  const fetchCreatives = async (adSetId?: string) => {
    const { supabase } = useSupabase()
    try {
      loading.value = true
      let query = supabase
        .from('creatives')
        .select(`
          *,
          asset:assets(*),
          comments:creative_comments(count)
        `)
        .order('created_at', { ascending: false })
      
      if (adSetId) {
        query = query.eq('ad_set_id', adSetId)
      }

      const { data, error: err } = await query
      
      if (err) throw err
      creativesState.value = data || []
      return data
    } catch (e) {
      error.value = e as Error
      console.error('Error fetching creatives:', e)
      return []
    } finally {
      loading.value = false
    }
  }

  const createCreative = async (creativeData: any) => {
    const { supabase } = useSupabase()
    try {
      loading.value = true
      
      // Get current max sort_order
      const { data: maxSort } = await supabase
        .from('creatives')
        .select('sort_order')
        .eq('ad_set_id', creativeData.ad_set_id)
        .order('sort_order', { ascending: false })
        .limit(1)
        .single()
      
      const nextSortOrder = (maxSort?.sort_order || 0) + 1

      const { data, error: err } = await supabase
        .from('creatives')
        .insert({
          ...creativeData,
          sort_order: nextSortOrder
        })
        .select()
        .single()
      
      if (err) throw err
      creativesState.value.unshift(data)
      return data
    } catch (e) {
      error.value = e as Error
      console.error('Error creating creative:', e)
      throw e
    } finally {
      loading.value = false
    }
  }

  return { creatives: creativesState, fetchCreatives, createCreative, loading, error }
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
