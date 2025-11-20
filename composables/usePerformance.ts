/**
 * Composables for Performance/Campaign Management
 */

// --- Clients Composable ---
export const useClients = () => {
  const clients = ref<any[]>([])
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
      clients.value = data || []
    } catch (e) {
      error.value = e as Error
      console.error('Error fetching clients:', e)
    } finally {
      loading.value = false
    }
  }

  return { clients, fetchClients, loading, error }
}

// --- Campaigns Composable ---
export const useCampaigns = () => {
  const campaigns = ref<any[]>([])
  const loading = ref(false)
  const error = ref<Error | null>(null)

  const fetchCampaigns = async () => {
    const { supabase } = useSupabase()
    try {
      loading.value = true
      const { data, error: err } = await supabase
        .from('campaigns')
        .select(`
          *,
          client:clients(name, logo_url),
          ad_sets:ad_sets(count),
          assigned:assigned_to(email)
        `)
        .order('created_at', { ascending: false })
      
      if (err) throw err
      campaigns.value = data || []
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
      campaigns.value.unshift(data)
      return data
    } catch (e) {
      error.value = e as Error
      console.error('Error creating campaign:', e)
      throw e
    } finally {
      loading.value = false
    }
  }

  return { campaigns, fetchCampaigns, createCampaign, loading, error }
}

// --- Ad Sets Composable ---
export const useAdSets = () => {
  const adSets = ref<any[]>([])
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
      adSets.value = data || []
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
      const { data, error: err } = await supabase
        .from('ad_sets')
        .insert(adSetData)
        .select()
        .single()
      
      if (err) throw err
      adSets.value.unshift(data)
      return data
    } catch (e) {
      error.value = e as Error
      console.error('Error creating ad set:', e)
      throw e
    } finally {
      loading.value = false
    }
  }

  return { adSets, fetchAdSets, createAdSet, loading, error }
}

// --- Creatives Composable ---
export const useCreatives = () => {
  const creatives = ref<any[]>([])
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
      creatives.value = data || []
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
      const { data, error: err } = await supabase
        .from('creatives')
        .insert(creativeData)
        .select()
        .single()
      
      if (err) throw err
      creatives.value.unshift(data)
      return data
    } catch (e) {
      error.value = e as Error
      console.error('Error creating creative:', e)
      throw e
    } finally {
      loading.value = false
    }
  }

  return { creatives, fetchCreatives, createCreative, loading, error }
}

// --- Assets Composable (Simple version if not exists) ---
export const useAssets = () => {
  const assets = ref<any[]>([])
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
      assets.value = data || []
    } catch (e) {
      error.value = e as Error
      console.error('Error fetching assets:', e)
    } finally {
      loading.value = false
    }
  }

  // Fetch on init if empty (optional)
  // onMounted(() => {
  //   if (assets.value.length === 0) fetchAssets()
  // })

  return { assets, fetchAssets, loading, error }
}
